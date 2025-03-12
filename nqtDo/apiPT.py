import cv2
import os
import numpy as np
from flask import Flask, request, jsonify
from deepface import DeepFace
from collections import defaultdict
import face_recognition

app = Flask(__name__)


@app.route('/analyze_emotions', methods=['POST'])
def analyze_emotions():
    data = request.get_json()
    if not data or 'video_path' not in data:
        return jsonify({"error": "No video path provided"}), 400

    video_path = data['video_path']
    if not os.path.exists(video_path):
        return jsonify({"error": "Video file not found"}), 404

    emotion_labels = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]
    emotion_counts = {emotion: 0 for emotion in emotion_labels}
    total_emotions = 0

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    if fps == 0:
        fps = 30

    frame_interval = int(fps * 2)
    if frame_interval == 0:
        frame_interval = 1

    for start_frame in range(0, total_frames, frame_interval):
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        ret, frame = cap.read()
        if not ret or frame is None:
            break
        frame = cv2.flip(frame, 1)

        face_locations = face_recognition.face_locations(frame)

        for faceLoc in face_locations:
            y1, x2, y2, x1 = faceLoc
            face_crop = frame[y1:y2, x1:x2]

            try:
                if face_crop.size != 0:
                    face_crop = cv2.resize(face_crop, (224, 224))
                    analysis = DeepFace.analyze(face_crop, actions=["emotion"], enforce_detection=False)
                    emotions = analysis[0]["emotion"]
                    dominant_emotion = max(emotions, key=emotions.get)
                    confidence = emotions[dominant_emotion]

                    if confidence > 60:
                        emotion_counts[dominant_emotion] += 1
                        total_emotions += 1
            except Exception as e:
                continue

    cap.release()

    emotion_stats = {
        emotion: {"count": count, "percentage": round((count / total_emotions) * 100, 2) if total_emotions > 0 else 0.0}
        for emotion, count in emotion_counts.items()}

    return jsonify({"total_emotions": total_emotions, "emotion_stats": emotion_stats})


if __name__ == '__main__':
    app.run(debug=True)
