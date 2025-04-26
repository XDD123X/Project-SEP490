import logging
from flask import Flask, request, jsonify
import cv2
import os
import numpy as np
from deepface import DeepFace
import face_recognition
from collections import defaultdict
import time
import json
import tempfile
import uuid
import pyodbc
import requests
from pathlib import Path
import platform
from concurrent.futures import ThreadPoolExecutor
import unicodedata
import re

# ========== CONFIG ==========

def get_desktop_path():
    if platform.system() == "Windows":
        return os.path.join(os.environ["USERPROFILE"], "Desktop")
    else:
        return os.path.join(Path.home(), "Desktop")

KNOWN_FACES_FOLDER = os.path.join(get_desktop_path(), "StudentFaces")
os.makedirs(KNOWN_FACES_FOLDER, exist_ok=True)

EMOTION_CATEGORIES = ["happy", "sad", "neutral"]
executor = ThreadPoolExecutor(max_workers=4)

# ========== LOGGING ==========

logging.basicConfig(filename='app_error.log', level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# ========== FLASK APP ==========

app = Flask(__name__)

# ========== DATABASE ==========

def get_students_from_db():
    try:
        conn = pyodbc.connect(
            "Driver={SQL Server};Server=localhost;Database=OTMS;UID=sa;PWD=sa;"
        )
        cursor = conn.cursor()
        query = """
        SELECT full_name, img_url FROM Account
        WHERE role_id = (
            SELECT role_id FROM Role WHERE name = 'Student'
        )
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        return [(row.full_name, row.img_url) for row in rows]
    except Exception as e:
        logging.error(f"Database error: {str(e)}")
        return []

# ========== SANITIZE FOLDER NAME ==========

def sanitize_folder_name(name):
    normalized = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode('ascii')
    safe_name = re.sub(r'[^\w\s-]', '', normalized).strip().replace(' ', '_')
    return safe_name

# ========== RETRY MECHANISM ==========

def download_with_retry(url, retries=3, backoff=2):
    for attempt in range(retries):
        try:
            response = requests.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
            })
            if response.status_code == 200:
                return response.content
            elif response.status_code == 429:
                wait_time = backoff ** attempt
                logging.warning(f"Rate limited. Retrying in {wait_time}s...")
                time.sleep(wait_time)
        except Exception as e:
            logging.error(f"Request failed: {str(e)}")
    return None

# ========== DOWNLOAD IMAGES ==========

downloaded_images = {}

def download_student_images():
    students = get_students_from_db()
    for full_name, img_url in students:
        if not img_url:
            continue

        folder_name = sanitize_folder_name(full_name)
        person_folder = os.path.join(KNOWN_FACES_FOLDER, folder_name)

        if os.path.exists(person_folder):
            logging.info(f"Folder for {full_name} already exists. Skipping...")
            continue

        os.makedirs(person_folder, exist_ok=True)
        logging.info(f"Created folder for {full_name} at {person_folder}")

        file_extension = ".png"

        try:
            if img_url not in downloaded_images:
                content = download_with_retry(img_url)
                downloaded_images[img_url] = content
            else:
                content = downloaded_images[img_url]

            if content:
                response = requests.head(img_url)
                content_type = response.headers.get('Content-Type', '')
                if 'jpeg' in content_type:
                    file_extension = ".jpg"
                elif 'png' in content_type:
                    file_extension = ".png"
                elif 'gif' in content_type:
                    file_extension = ".gif"

                image_path = os.path.join(person_folder, f"1{file_extension}")
                with open(image_path, 'wb') as f:
                    f.write(content)
                logging.info(f"Downloaded image for {full_name} as {file_extension}")
            else:
                logging.warning(f"Failed to download image for {full_name}: {img_url}")
        except Exception as e:
            logging.error(f"Error downloading image for {full_name}: {str(e)}")

# ========== LOAD KNOWN FACES ==========

def load_known_faces():
    known_encodings = []
    known_names = []
    try:
        for person_name in os.listdir(KNOWN_FACES_FOLDER):
            person_folder = os.path.join(KNOWN_FACES_FOLDER, person_name)
            if not os.path.isdir(person_folder):
                continue
            encodings = []
            for file in os.listdir(person_folder):
                file_path = os.path.join(person_folder, file)
                img = cv2.imread(file_path)
                if img is None:
                    logging.warning(f"Removing invalid image: {file_path}")
                    os.remove(file_path)
                    continue
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                encs = face_recognition.face_encodings(rgb_img)
                if len(encs) > 0:
                    encodings.append(encs[0])
                else:
                    logging.warning(f"No face found in image, removing: {file_path}")
                    os.remove(file_path)
            if encodings:
                known_encodings.extend(encodings)
                known_names.extend([person_name] * len(encodings))
                logging.info(f"Loaded {len(encodings)} images for {person_name}")
    except Exception as e:
        logging.error(f"Error loading known faces: {str(e)}")
        raise e
    return known_encodings, known_names

# ========== VIDEO PROCESSING ==========

def get_seconds_interval(video_duration, fps):
    min_interval = 1
    max_interval = 300
    estimated_interval = max(min_interval, min(max_interval, int(video_duration * 0.01)))
    return int(fps * estimated_interval)

def process_video(video_path, known_encodings, known_names):
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logging.error(f"Cannot open video: {video_path}")
            return {}

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        video_duration = total_frames / fps
        frame_count = 0
        face_data = defaultdict(lambda: {"count": 0, "first_seen": None, "emotions": defaultdict(int), "presence_ratio": 0})
        frame_interval = get_seconds_interval(video_duration, fps)

        while frame_count * frame_interval < total_frames:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count * frame_interval)
            ret, frame = cap.read()
            if not ret:
                logging.warning(f"Failed to read frame {frame_count}")
                break

            frame_count += 1
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')

            for face_encoding, (top, right, bottom, left) in zip(face_encodings, face_locations):
                matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.4)
                name = None
                face_img = frame[top:bottom, left:right]

                if True in matches:
                    best_match_index = np.argmin(face_recognition.face_distance(known_encodings, face_encoding))
                    name = known_names[best_match_index]

                if name is not None:
                    if face_data[name]["first_seen"] is None:
                        face_data[name]["first_seen"] = timestamp
                    face_data[name]["count"] += 1

                    try:
                        analysis = DeepFace.analyze(face_img, actions=["emotion"], enforce_detection=False)
                        filtered_emotions = {k: v for k, v in analysis[0]['emotion'].items() if k in EMOTION_CATEGORIES}
                        if filtered_emotions:
                            emotion = max(filtered_emotions, key=filtered_emotions.get)
                            face_data[name]["emotions"][emotion] += 1
                    except Exception as e:
                        logging.error(f"Error analyzing emotion for face {name}: {str(e)}")

        cap.release()
        cv2.destroyAllWindows()
        #total_counts = sum(data["count"] for data in face_data.values())
        # if total_counts > 0:
        #     for name, data in face_data.items():
        #         data["presence_ratio"] = (data["count"] / total_counts) * 100
        if frame_count > 0:
            for name, data in face_data.items():
                data["presence_ratio"] = (data["count"] / frame_count) * 100

        result = {
            "detected_faces": face_data,
            "video_duration": video_duration,
            "overall_emotion_counts": {emotion: sum(data["emotions"].get(emotion, 0) for data in face_data.values()) for emotion in EMOTION_CATEGORIES}
        }
        return result
    except Exception as e:
        logging.error(f"Error processing video {video_path}: {str(e)}")
        return {}

# ========== API ==========

@app.route('/upload_video', methods=['POST'])
def upload_video():
    file = request.files.get('video')
    if not file:
        logging.error("No file uploaded.")
        return jsonify({"error": "No file uploaded"}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4", mode="wb") as temp_file:
            temp_file.write(file.read())
            temp_file.close()

            # Load known faces only when API is called
            known_encodings, known_names = load_known_faces()

            # Process video with current encodings
            future = executor.submit(process_video, temp_file.name, known_encodings, known_names)
            result = future.result()

            os.remove(temp_file.name)

        return jsonify(result)
    except Exception as e:
        logging.error(f"Error in upload_video: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

# ========== MAIN ==========

if __name__ == "__main__":
    download_student_images()  # Only runs once when app starts
    app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024 * 1024  # 4GB max upload
    app.run(debug=True, port=4000, threaded=True)
