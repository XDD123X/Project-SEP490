from flask import Flask, request, jsonify
import cv2
import os
import numpy as np
from deepface import DeepFace
import face_recognition
from collections import defaultdict

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True


KNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandienkhuonmat/face"

EMOTION_CATEGORIES = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]

def preprocess_image(img):

    ycrcb_img = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycrcb_img)
    y_eq = cv2.equalizeHist(y)
    ycrcb_eq = cv2.merge([y_eq, cr, cb])
    img_eq = cv2.cvtColor(ycrcb_eq, cv2.COLOR_YCrCb2BGR)
    return img_eq

def load_known_faces(folder_path, tolerance=0.45):

    encodings_by_person = {}
    files = os.listdir(folder_path)
    for file in files:
        file_path = os.path.join(folder_path, file)
        img = cv2.imread(file_path)
        if img is None:
            print(f"Không thể đọc ảnh: {file}")
            continue
        img = preprocess_image(img)
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encs = face_recognition.face_encodings(rgb_img)
        if len(encs) > 0:
            encoding = encs[0]
            name = os.path.splitext(file)[0]
            if name in encodings_by_person:
                encodings_by_person[name].append(encoding)
            else:
                encodings_by_person[name] = [encoding]
        else:
            print(f"Không nhận diện được khuôn mặt trong ảnh: {file}")
    known_encodings = []
    known_names = []
    for name, encoding_list in encodings_by_person.items():
        avg_encoding = np.mean(encoding_list, axis=0)
        known_encodings.append(avg_encoding)
        known_names.append(name)
    return known_encodings, known_names

def process_video(video_path, known_encodings, known_names, seconds_interval=1, tolerance=0.45):

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Không thể mở video!")
        return None, 0, None

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        fps = 30
    frame_interval = int(fps * seconds_interval)
    print(f"FPS: {fps}, xử lý 1 frame mỗi {seconds_interval} giây (mỗi {frame_interval} frame).")

    overall_emotion_counts = defaultdict(int)
    total_emotions = 0
    frame_count = 0
    person_emotions = defaultdict(lambda: defaultdict(int))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % frame_interval != 0:
            continue

        small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
        rgb_small = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_small)
        face_encodings = face_recognition.face_encodings(rgb_small, face_locations)

        for face_encoding, face_loc in zip(face_encodings, face_locations):
            distances = face_recognition.face_distance(known_encodings, face_encoding)
            name = "Unknown"
            if len(distances) > 0:
                min_distance = np.min(distances)
                best_match_index = np.argmin(distances)
                if min_distance < tolerance:
                    name = known_names[best_match_index]

            top, right, bottom, left = [coord * 2 for coord in face_loc]
            face_image = frame[top:bottom, left:right]

            emotion_text = "Unknown"
            if face_image.size != 0:
                try:
                    face_resized = cv2.resize(face_image, (224, 224))
                    analysis = DeepFace.analyze(face_resized, actions=["emotion"], enforce_detection=False)
                    if isinstance(analysis, list):
                        analysis = analysis[0]
                    emotions = analysis.get("emotion", {})
                    if emotions:
                        dominant_emotion = max(emotions, key=emotions.get)
                        confidence = emotions[dominant_emotion]
                        # Cập nhật thống kê chỉ khi cảm xúc rõ ràng và khuôn mặt được nhận diện
                        if confidence > 60 and name != "Unknown":
                            emotion_text = dominant_emotion
                            overall_emotion_counts[dominant_emotion] += 1
                            total_emotions += 1
                            person_emotions[name][dominant_emotion] += 1
                except Exception as e:
                    print("Lỗi khi phân tích cảm xúc:", e)

    cap.release()

    for emo in EMOTION_CATEGORIES:
        if emo not in overall_emotion_counts:
            overall_emotion_counts[emo] = 0

    for person, emotions in person_emotions.items():
        for emo in EMOTION_CATEGORIES:
            if emo not in emotions:
                person_emotions[person][emo] = 0

    overall_emotion_counts = dict(overall_emotion_counts)
    person_emotions = {person: dict(emotions) for person, emotions in person_emotions.items()}
    return overall_emotion_counts, total_emotions, person_emotions

@app.route("/process_video", methods=["POST"])
def api_process_video():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON data"}), 400

    video_path = data.get("video_path")
    if not video_path:
        return jsonify({"error": "Missing video_path"}), 400

    seconds_interval = 10
    tolerance = 0.45

    known_encodings, known_names = load_known_faces(KNOWN_FACES_FOLDER, tolerance=tolerance)
    if len(known_encodings) == 0:
        return jsonify({"error": "Không có khuôn mặt nào được mã hóa."}), 400

    overall_emotion_counts, total_emotions, person_emotions = process_video(
        video_path, known_encodings, known_names, seconds_interval=seconds_interval, tolerance=tolerance
    )

    if overall_emotion_counts is None:
        return jsonify({"error": "Lỗi khi xử lý video."}), 500

    result = {
        "overall_emotion_counts": overall_emotion_counts,
        "total_emotions": total_emotions,
        "person_emotions": person_emotions
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
