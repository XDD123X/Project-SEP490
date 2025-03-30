# import cv2
# import os
# import numpy as np
# from deepface import DeepFace
# import face_recognition
# from collections import defaultdict
# import time
# import json
#
# KNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/face"
# UNKNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/unknown_faces"
#
# EMOTION_CATEGORIES = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]
#
# os.makedirs(KNOWN_FACES_FOLDER, exist_ok=True)
# os.makedirs(UNKNOWN_FACES_FOLDER, exist_ok=True)
#
# known_encodings = []
# known_names = []
# unknown_faces = {}
#
#
# def load_known_faces():
#     global known_encodings, known_names
#     encodings_by_person = {}
#     files = os.listdir(KNOWN_FACES_FOLDER)
#     for file in files:
#         file_path = os.path.join(KNOWN_FACES_FOLDER, file)
#         img = cv2.imread(file_path)
#         if img is None:
#             continue
#         rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#         encs = face_recognition.face_encodings(rgb_img)
#         if len(encs) > 0:
#             name = os.path.splitext(file)[0]
#             encodings_by_person.setdefault(name, []).append(encs[0])
#
#     for name, encoding_list in encodings_by_person.items():
#         avg_encoding = np.mean(encoding_list, axis=0)
#         known_encodings.append(avg_encoding)
#         known_names.append(name)
#
#
# def process_video(video_path):
#     cap = cv2.VideoCapture(video_path)
#     if not cap.isOpened():
#         print("Không thể mở video!")
#         return {}
#
#     fps = cap.get(cv2.CAP_PROP_FPS)
#     total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#     video_duration = total_frames / fps
#     frame_count = 0
#     face_data = defaultdict(lambda: {"count": 0, "first_seen": None, "emotions": defaultdict(int), "presence_ratio": 0})
#     frame_interval = int(fps * 2)
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
#             distances = face_recognition.face_distance(known_encodings, face_encoding)
#             name = "Unknown"
# #just add
#             face_img = frame[top:bottom, left:right]
# # just add
#
#             if len(distances) > 0 and min(distances) < 0.45:
#                 best_match = np.argmin(distances)
#                 name = known_names[best_match]
#             else:
#                 found = False
#                 for unknown_name, unknown_enc in unknown_faces.items():
#                     if np.linalg.norm(unknown_enc - face_encoding) < 0.45:
#                         name = unknown_name
#                         found = True
#                         break
#                 if not found:
#                     person_id = f"person_{len(unknown_faces) + 1}"
#                     unknown_faces[person_id] = face_encoding
#                     name = person_id
#
# #just add
#                     face_filename = os.path.join(UNKNOWN_FACES_FOLDER, f"{person_id}.jpg")
#                     cv2.imwrite(face_filename, face_img)
# # just add
#
#             if face_data[name]["first_seen"] is None:
#                 face_data[name]["first_seen"] = timestamp
#
#             face_data[name]["count"] += 1
#
#             face_img = frame[top:bottom, left:right]
#             try:
#                 analysis = DeepFace.analyze(face_img, actions=["emotion"], enforce_detection=False)
#                 emotion = max(analysis[0]['emotion'], key=analysis[0]['emotion'].get)
#                 face_data[name]["emotions"][emotion] += 1
#                 cv2.putText(frame, f"{name}: {emotion}", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0),
#                             2)
#             except:
#                 pass
#
#             cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
#
#         cv2.imshow('Video', frame)
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
#
#     cap.release()
#     cv2.destroyAllWindows()
#
#     total_emotions = sum(sum(data["emotions"].values()) for data in face_data.values())
#     overall_emotion_counts = defaultdict(int)
#     for person in face_data.values():
#         for emotion, count in person["emotions"].items():
#             overall_emotion_counts[emotion] += count
#
#     for name, data in face_data.items():
#         data["presence_ratio"] = data["count"] / frame_count if frame_count > 0 else 0
#
#     result = {
#         "detected_faces": face_data,
#         "overall_emotion_counts": overall_emotion_counts,
#         "total_emotions": total_emotions,
#         "video_duration": video_duration
#     }
#
#     return result
#
#
# if __name__ == "__main__":
#     load_known_faces()
#     result = process_video("C:/Users/nqt00/OneDrive/Desktop/a.mp4")
#     print(json.dumps(result, indent=4, ensure_ascii=False))

import cv2
import os
import numpy as np
from deepface import DeepFace
import face_recognition
from collections import defaultdict
import time
import json

KNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/face"
UNKNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/unknown_faces"

EMOTION_CATEGORIES = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]

os.makedirs(KNOWN_FACES_FOLDER, exist_ok=True)
os.makedirs(UNKNOWN_FACES_FOLDER, exist_ok=True)

known_encodings = []
known_names = []
unknown_faces = {}


def load_known_faces():
    global known_encodings, known_names
    encodings_by_person = {}

    for person_name in os.listdir(KNOWN_FACES_FOLDER):
        person_folder = os.path.join(KNOWN_FACES_FOLDER, person_name)

        if not os.path.isdir(person_folder):
            continue

        encodings = []
        for file in os.listdir(person_folder):
            file_path = os.path.join(person_folder, file)
            img = cv2.imread(file_path)
            if img is None:
                continue
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encs = face_recognition.face_encodings(rgb_img)
            if len(encs) > 0:
                encodings.append(encs[0])

        if encodings:
            avg_encoding = np.mean(encodings, axis=0)
            known_encodings.append(avg_encoding)
            known_names.append(person_name)


def process_video(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Không thể mở video!")
        return {}

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_duration = total_frames / fps
    frame_count = 0
    face_data = defaultdict(lambda: {"count": 0, "first_seen": None, "emotions": defaultdict(int), "presence_ratio": 0})
    frame_interval = int(fps * 1)

    while frame_count * frame_interval < total_frames:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count * frame_interval)
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')

        for face_encoding, (top, right, bottom, left) in zip(face_encodings, face_locations):
            distances = face_recognition.face_distance(known_encodings, face_encoding)
            name = "Unknown"
            face_img = frame[top:bottom, left:right]

            if len(distances) > 0 and min(distances) < 0.45:
                best_match = np.argmin(distances)
                name = known_names[best_match]
            else:
                found = False
                for unknown_name, unknown_enc in unknown_faces.items():
                    if np.linalg.norm(unknown_enc - face_encoding) < 0.45:
                        name = unknown_name
                        found = True
                        break
                if not found:
                    person_id = f"person_{len(unknown_faces) + 1}"
                    unknown_faces[person_id] = face_encoding
                    name = person_id
                    face_filename = os.path.join(UNKNOWN_FACES_FOLDER, f"{person_id}.jpg")
                    cv2.imwrite(face_filename, face_img)

            if face_data[name]["first_seen"] is None:
                face_data[name]["first_seen"] = timestamp

            face_data[name]["count"] += 1

            try:
                analysis = DeepFace.analyze(face_img, actions=["emotion"], enforce_detection=False)
                emotion = max(analysis[0]['emotion'], key=analysis[0]['emotion'].get)
                face_data[name]["emotions"][emotion] += 1
                cv2.putText(frame, f"{name}: {emotion}", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0),
                            2)
            except:
                pass

            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)

        cv2.imshow('Video', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    total_emotions = sum(sum(data["emotions"].values()) for data in face_data.values())
    overall_emotion_counts = defaultdict(int)
    for person in face_data.values():
        for emotion, count in person["emotions"].items():
            overall_emotion_counts[emotion] += count

    for name, data in face_data.items():
        data["presence_ratio"] = data["count"] / frame_count if frame_count > 0 else 0

    result = {
        "detected_faces": face_data,
        "overall_emotion_counts": overall_emotion_counts,
        "total_emotions": total_emotions,
        "video_duration": video_duration
    }

    return result


if __name__ == "__main__":
    load_known_faces()
    result = process_video("C:/Users/nqt00/OneDrive/Desktop/WIN_20250319_22_32_57_Pro.mp4")
    print(json.dumps(result, indent=4, ensure_ascii=False))
