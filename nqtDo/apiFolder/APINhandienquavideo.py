# from flask import Flask, request, jsonify
# import cv2
# import os
# import numpy as np
# from deepface import DeepFace
# import face_recognition
# from collections import defaultdict
# import time
# import json
# import tempfile
# import uuid
# from concurrent.futures import ThreadPoolExecutor
#
# app = Flask(__name__)
#
# executor = ThreadPoolExecutor(max_workers=4)
#
# KNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/face"
# EMOTION_CATEGORIES = ["happy", "sad", "neutral"]
#
# os.makedirs(KNOWN_FACES_FOLDER, exist_ok=True)
#
# known_encodings = []
# known_names = []
#
#
# def load_known_faces():
#     global known_encodings, known_names
#     for person_name in os.listdir(KNOWN_FACES_FOLDER):
#         person_folder = os.path.join(KNOWN_FACES_FOLDER, person_name)
#         if not os.path.isdir(person_folder):
#             continue
#         encodings = []
#         for file in os.listdir(person_folder):
#             file_path = os.path.join(person_folder, file)
#             img = cv2.imread(file_path)
#             if img is None:
#                 print(f"Removing invalid image: {file_path}")
#                 os.remove(file_path)
#                 continue
#             rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#             encs = face_recognition.face_encodings(rgb_img)
#             if len(encs) > 0:
#                 encodings.append(encs[0])
#             else:
#                 print(f"No face found in image, removing: {file_path}")
#                 os.remove(file_path)
#         if encodings:
#             known_encodings.extend(encodings)
#             known_names.extend([person_name] * len(encodings))
#             print(f"Loaded {len(encodings)} images for {person_name}")
#
#
# def get_seconds_interval(video_duration, fps):
#     min_interval = 1
#     max_interval = 300
#     estimated_interval = max(min_interval, min(max_interval, int(video_duration * 0.01)))
#     return int(fps * estimated_interval)
#
#
# def process_video(video_path):
#     cap = cv2.VideoCapture(video_path)
#     if not cap.isOpened():
#         print("Cannot open video!")
#         return {}
#
#     fps = cap.get(cv2.CAP_PROP_FPS)
#     total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#     video_duration = total_frames / fps
#     frame_count = 0
#     face_data = defaultdict(lambda: {"count": 0, "first_seen": None, "emotions": defaultdict(int), "presence_ratio": 0})
#     frame_interval = get_seconds_interval(video_duration, fps)
#
#     while frame_count * frame_interval < total_frames:
#         cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count * frame_interval)
#         ret, frame = cap.read()
#         if not ret:
#             break
#
#         frame_count += 1
#         rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         face_locations = face_recognition.face_locations(rgb_frame)
#         face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
#         timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
#
#         for face_encoding, (top, right, bottom, left) in zip(face_encodings, face_locations):
#             matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.4)
#             name = None
#             face_img = frame[top:bottom, left:right]
#
#             if True in matches:
#                 best_match_index = np.argmin(face_recognition.face_distance(known_encodings, face_encoding))
#                 name = known_names[best_match_index]
#
#             if name is not None:
#                 if face_data[name]["first_seen"] is None:
#                     face_data[name]["first_seen"] = timestamp
#
#                 face_data[name]["count"] += 1
#
#                 try:
#                     analysis = DeepFace.analyze(face_img, actions=["emotion"], enforce_detection=False)
#                     filtered_emotions = {k: v for k, v in analysis[0]['emotion'].items() if k in EMOTION_CATEGORIES}
#                     if filtered_emotions:
#                         emotion = max(filtered_emotions, key=filtered_emotions.get)
#                         face_data[name]["emotions"][emotion] += 1
#                 except:
#                     pass
#
#     cap.release()
#     cv2.destroyAllWindows()
#     total_counts = sum(data["count"] for data in face_data.values())
#     if total_counts > 0:
#         for name, data in face_data.items():
#             data["presence_ratio"] = (data["count"] / total_counts) * 100
#     result = {
#         "detected_faces": face_data,
#         "video_duration": video_duration,
#         "overall_emotion_counts": {emotion: sum(data["emotions"].get(emotion, 0) for data in face_data.values()) for
#                                    emotion in EMOTION_CATEGORIES}
#     }
#     return result
#
#
# @app.route('/upload_video', methods=['POST'])
# def upload_video():
#     file = request.files.get('video')
#     if not file:
#         return jsonify({"error": "No file uploaded"}), 400
#     unique_filename = f"{uuid.uuid4().hex}.mp4"
#
#     with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4", mode="wb") as temp_file:
#         temp_file.write(file.read())
#         temp_file.close()
#         load_known_faces()
#         future = executor.submit(process_video, temp_file.name)
#         result = future.result()
#         os.remove(temp_file.name)
#     return jsonify(result)
#
#
# if __name__ == "__main__":
#     app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024 * 1024  # 4GB
#     app.run(debug=True, port=4000, threaded=True)
#
#     #app.run(debug=True, threaded=True)

#thay print thành log
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
from concurrent.futures import ThreadPoolExecutor

# Set up logging to log errors to a file
logging.basicConfig(filename='app_error.log', level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

executor = ThreadPoolExecutor(max_workers=4)

KNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/face"
EMOTION_CATEGORIES = ["happy", "sad", "neutral"]

os.makedirs(KNOWN_FACES_FOLDER, exist_ok=True)

known_encodings = []
known_names = []

def load_known_faces():
    global known_encodings, known_names
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

def get_seconds_interval(video_duration, fps):
    min_interval = 1
    max_interval = 300
    estimated_interval = max(min_interval, min(max_interval, int(video_duration * 0.01)))
    return int(fps * estimated_interval)

def process_video(video_path):
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
        total_counts = sum(data["count"] for data in face_data.values())
        if total_counts > 0:
            for name, data in face_data.items():
                data["presence_ratio"] = (data["count"] / total_counts) * 100
        result = {
            "detected_faces": face_data,
            "video_duration": video_duration,
            "overall_emotion_counts": {emotion: sum(data["emotions"].get(emotion, 0) for data in face_data.values()) for emotion in EMOTION_CATEGORIES}
        }
        return result
    except Exception as e:
        logging.error(f"Error processing video {video_path}: {str(e)}")
        return {}

@app.route('/upload_video', methods=['POST'])
def upload_video():
    file = request.files.get('video')
    if not file:
        logging.error("No file uploaded.")
        return jsonify({"error": "No file uploaded"}), 400

    unique_filename = f"{uuid.uuid4().hex}.mp4"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4", mode="wb") as temp_file:
            temp_file.write(file.read())
            temp_file.close()
            load_known_faces()
            future = executor.submit(process_video, temp_file.name)
            result = future.result()
            os.remove(temp_file.name)
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error in upload_video: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024 * 1024  # 4GB
    app.run(debug=True, port=4000, threaded=True)
