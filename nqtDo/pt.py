# import cv2
# import os
# import numpy as np
# from deepface import DeepFace
# from collections import defaultdict
# import face_recognition
#
# emotion_counts = defaultdict(int)
# total_emotions = 0
#
# video_path = r"C:\Users\nqt00\OneDrive\Desktop\6396588663822.mp4"
# cap = cv2.VideoCapture(video_path)
#
# total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
# fps = cap.get(cv2.CAP_PROP_FPS)  # Tính số frame mỗi giây
#
# if fps == 0:
#     fps = 30
#
# frame_interval = int(fps * 1)
#
# if frame_interval == 0:
#     frame_interval = 1
#
# for start_frame in range(0, total_frames, frame_interval):
#     cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
#
#     ret, frame = cap.read()
#     if not ret or frame is None:
#         print("Không thể truy cập video!")
#         break
#     frame = cv2.flip(frame, 1)
#
#     face_locations = face_recognition.face_locations(frame)
#
#     for faceLoc in face_locations:
#         y1, x2, y2, x1 = faceLoc
#         face_crop = frame[y1:y2, x1:x2]  # Cắt khuôn mặt
#
#         try:
#             analysis = DeepFace.analyze(face_crop, actions=["emotion"], enforce_detection=False)
#             emotion = analysis[0]["dominant_emotion"]  # Truy xuất cảm xúc
#             emotion_counts[emotion] += 1
#             total_emotions += 1
#         except Exception as e:
#             print("Lỗi nhận diện cảm xúc:", e)
#             emotion = "Unknown"
#
#         cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
#
#         cv2.putText(frame, emotion, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
#
#     cv2.imshow('Nhận diện khuôn mặt & Cảm xúc', frame)
#
#     if cv2.waitKey(1) == ord("q"):
#         break
#
# cap.release()
# cv2.destroyAllWindows()
#
# print("\nThống kê cảm xúc nhận diện được:")
# if total_emotions > 0:
#     for emotion, count in emotion_counts.items():
#         percentage = (count / total_emotions) * 100
#         print(f"{emotion} - {count} ({percentage:.2f}%)")
# else:
#     print("Không có dữ liệu cảm xúc để thống kê.")
#




import cv2
import os
import numpy as np
from deepface import DeepFace
from collections import defaultdict
import face_recognition

emotion_counts = defaultdict(int)
total_emotions = 0

#video_path = r"C:\Users\nqt00\OneDrive\Desktop\Recording 2025-02-18 201906.mp4"
video_path =r"C:\Users\nqt00\OneDrive\Desktop\6396588663822.mp4"

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
        print("Không thể truy cập video!")
        break
    frame = cv2.flip(frame, 1)

    face_locations = face_recognition.face_locations(frame)

    for faceLoc in face_locations:
        y1, x2, y2, x1 = faceLoc
        face_crop = frame[y1:y2, x1:x2]  # Cắt khuôn mặt

        try:
            if face_crop.size != 0:
                face_crop = cv2.resize(face_crop, (224, 224))
                analysis = DeepFace.analyze(face_crop, actions=["emotion"], enforce_detection=False)
                emotions = analysis[0]["emotion"]
                dominant_emotion = max(emotions, key=emotions.get)
                confidence = emotions[dominant_emotion]

                if confidence > 60:
                    emotion = dominant_emotion
                    emotion_counts[emotion] += 1
                    total_emotions += 1
                else:
                    emotion = "Unknown"
            else:
                emotion = "Unknown"
        except Exception as e:
            print("Lỗi nhận diện cảm xúc:", e)
            emotion = "Unknown"

        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        cv2.putText(frame, emotion, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    cv2.imshow('Nhận diện khuôn mặt & Cảm xúc', frame)

    # Nhấn phím 'q' để thoát
    if cv2.waitKey(1) == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print("\nThống kê cảm xúc nhận diện được:")
if total_emotions > 0:
    for emotion, count in emotion_counts.items():
        percentage = (count / total_emotions) * 100
        print(f"{emotion} - {count} ({percentage:.2f}%)")
else:
    print("Không có dữ liệu cảm xúc để thống kê.")
