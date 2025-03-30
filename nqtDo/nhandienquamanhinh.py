# import cv2
# import os
# import numpy as np
# import mss
# import time
# import json
# from deepface import DeepFace
# import face_recognition
# from collections import defaultdict
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
#
#     for person_name in os.listdir(KNOWN_FACES_FOLDER):
#         person_folder = os.path.join(KNOWN_FACES_FOLDER, person_name)
#         if not os.path.isdir(person_folder):
#             continue
#         encodings = []
#         for file in os.listdir(person_folder):
#             file_path = os.path.join(person_folder, file)
#             img = cv2.imread(file_path)
#             if img is None:
#                 continue
#             rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#             encs = face_recognition.face_encodings(rgb_img)
#             if len(encs) > 0:
#                 encodings.append(encs[0])
#         if encodings:
#             avg_encoding = np.mean(encodings, axis=0)
#             known_encodings.append(avg_encoding)
#             known_names.append(person_name)
#
#
# def capture_screen_faces():
#     with mss.mss() as sct:
#         frame_count = 0
#         start_time = time.time()
#         face_data = defaultdict(
#             lambda: {"count": 0, "first_seen": None, "emotions": defaultdict(int), "presence_ratio": 0})
#
#         while True:
#             screenshot = sct.grab(sct.monitors[1])
#             frame = np.array(screenshot)
#             frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
#
#             rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#             face_locations = face_recognition.face_locations(rgb_frame)
#             face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
#             timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
#
#             for face_encoding, (top, right, bottom, left) in zip(face_encodings, face_locations):
#                 distances = face_recognition.face_distance(known_encodings, face_encoding)
#                 name = "Unknown"
#                 face_img = frame[top:bottom, left:right]
#
#                 if len(distances) > 0 and min(distances) < 0.45:
#                     best_match = np.argmin(distances)
#                     name = known_names[best_match]
#                 else:
#                     found = False
#                     for unknown_name, unknown_enc in unknown_faces.items():
#                         if np.linalg.norm(unknown_enc - face_encoding) < 0.45:
#                             name = unknown_name
#                             found = True
#                             break
#                     if not found:
#                         person_id = f"person_{len(unknown_faces) + 1}"
#                         unknown_faces[person_id] = face_encoding
#                         name = person_id
#                         face_filename = os.path.join(UNKNOWN_FACES_FOLDER, f"{person_id}.jpg")
#                         cv2.imwrite(face_filename, face_img)
#
#                 if face_data[name]["first_seen"] is None:
#                     face_data[name]["first_seen"] = timestamp
#
#                 face_data[name]["count"] += 1
#
#                 try:
#                     analysis = DeepFace.analyze(face_img, actions=["emotion"], enforce_detection=False)
#                     emotion = max(analysis[0]['emotion'], key=analysis[0]['emotion'].get)
#                     face_data[name]["emotions"][emotion] += 1
#                     cv2.putText(frame, f"{name}: {emotion}", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
#                                 (0, 255, 0), 2)
#                 except:
#                     pass
#
#                 cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
#
#             frame_count += 1
#             for name, data in face_data.items():
#                 data["presence_ratio"] = data["count"] / frame_count if frame_count > 0 else 0
#
#             cv2.imshow('Screen Face Recognition', frame)
#             if cv2.waitKey(1) & 0xFF == ord('q'):
#                 break
#
#         total_time = time.time() - start_time
#         cv2.destroyAllWindows()
#
#         result = {
#             "detected_faces": face_data,
#             "overall_emotion_counts": {emotion: sum(data["emotions"].get(emotion, 0) for data in face_data.values()) for
#                                        emotion in EMOTION_CATEGORIES},
#             "total_faces": sum(data["count"] for data in face_data.values()),
#             "video_duration": total_time
#         }
#
#         print(json.dumps(result, indent=4, ensure_ascii=False))
#
#
# if __name__ == "__main__":
#     load_known_faces()
#     capture_screen_faces()





import cv2
import os
import numpy as np
import mss
import time
import threading
import tkinter as tk
import json
from deepface import DeepFace
from collections import defaultdict
import face_recognition

# Đường dẫn thư mục
KNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/face"
UNKNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/unknown_faces"
RESULT_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/Result"

EMOTION_CATEGORIES = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]

os.makedirs(KNOWN_FACES_FOLDER, exist_ok=True)
os.makedirs(UNKNOWN_FACES_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

known_encodings = []
known_names = []
unknown_faces = {}


def load_known_faces():
    global known_encodings, known_names
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


def capture_screen_faces():
    with mss.mss() as sct:
        global start_time
        start_time = time.time()
        frame_count = 0
        face_data = defaultdict(lambda: {"count": 0, "first_seen": None, "emotions": defaultdict(int)})

        while running:
            screenshot = sct.grab(sct.monitors[1])
            frame = np.array(screenshot)
            frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            timestamp = time.strftime('%Y-%m-%d_%H-%M-%S')

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

                os.makedirs(os.path.join(RESULT_FOLDER, name), exist_ok=True)

                if face_data[name]["first_seen"] is None:
                    face_data[name]["first_seen"] = timestamp

                face_data[name]["count"] += 1

                try:
                    analysis = DeepFace.analyze(face_img, actions=["emotion"], enforce_detection=False)
                    emotion = max(analysis[0]['emotion'], key=analysis[0]['emotion'].get)
                    face_data[name]["emotions"][emotion] += 1
                    cv2.putText(frame, f"{name}: {emotion}", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                                (0, 255, 0), 2)
                except:
                    emotion = "unknown"

                cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                face_filename = os.path.join(RESULT_FOLDER, name, f"{timestamp}_{emotion}.jpg")
                cv2.imwrite(face_filename, face_img)

            frame_count += 1

        total_time = time.time() - start_time
        total_time_str = time.strftime('%Hh%Mm%Ss', time.gmtime(total_time))

        result = {
            "detected_faces": {name: {
                "count": data["count"],
                "first_seen": data["first_seen"],
                "emotions": dict(data["emotions"]),
                "presence_ratio": round(data["count"] / frame_count, 2) if frame_count > 0 else 0
            } for name, data in face_data.items()},
            "overall_emotion_counts": {emotion: sum(data["emotions"].get(emotion, 0) for data in face_data.values()) for
                                       emotion in EMOTION_CATEGORIES},
            "total_emotions": sum(sum(data["emotions"].values()) for data in face_data.values()),
            "total_time": total_time_str
        }

        print(json.dumps(result, indent=4, ensure_ascii=False))


def start_analysis():
    global running
    running = True
    capture_screen_faces()


def stop_analysis():
    global running
    running = False
    root.destroy()


if __name__ == "__main__":
    load_known_faces()
    root = tk.Tk()
    root.title("Thông báo")
    root.geometry("300x100")
    label = tk.Label(root, text="Đang phân tích...", font=("Arial", 14))
    label.pack(pady=20)

    analysis_thread = threading.Thread(target=start_analysis)
    analysis_thread.start()

    root.protocol("WM_DELETE_WINDOW", stop_analysis)
    root.mainloop()