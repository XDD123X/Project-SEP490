import cv2
import os
import numpy as np
from deepface import DeepFace
import face_recognition
from collections import defaultdict

def load_known_faces(folder_path):
    """
    Load các ảnh đã biết từ folder, trích xuất mã hóa khuôn mặt và tên.
    """
    known_encodings = []
    known_names = []
    files = os.listdir(folder_path)

    for file in files:
        file_path = os.path.join(folder_path, file)
        img = cv2.imread(file_path)
        if img is None:
            print(f"Không thể đọc ảnh: {file}")
            continue
        # Chuyển ảnh sang RGB
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        # Lấy mã hóa khuôn mặt (chỉ dùng khuôn mặt đầu tiên nếu có nhiều hơn 1)
        encodings = face_recognition.face_encodings(rgb_img)
        if len(encodings) > 0:
            known_encodings.append(encodings[0])
            name = os.path.splitext(file)[0]
            known_names.append(name)
        else:
            print(f"Không nhận diện được khuôn mặt trong ảnh: {file}")
    return known_encodings, known_names

def process_video(video_path, known_encodings, known_names, frame_interval=5):
    """
    Mở video và xử lý từng frame:
      - Nhận diện khuôn mặt và so sánh với các mã đã biết.
      - Phân tích cảm xúc trên từng khuôn mặt.
      - Lưu lại cảm xúc riêng của từng người nhận diện được.
      - Hiển thị kết quả lên frame.
    Sau đó in ra thống kê cảm xúc riêng của từng người và tổng hợp chung.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Không thể mở video!")
        return

    # Thống kê cảm xúc tổng hợp (toàn video)
    overall_emotion_counts = defaultdict(int)
    total_emotions = 0
    frame_count = 0

    # Thống kê cảm xúc riêng của từng người
    person_emotions = defaultdict(lambda: defaultdict(int))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        # Xử lý mỗi 'frame_interval' frame để tiết kiệm thời gian tính toán
        if frame_count % frame_interval != 0:
            continue

        # Giảm kích thước để tăng tốc quá trình xử lý
        small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
        rgb_small = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        # Nhận diện vị trí và mã hóa khuôn mặt trên frame nhỏ
        face_locations = face_recognition.face_locations(rgb_small)
        face_encodings = face_recognition.face_encodings(rgb_small, face_locations)

        for face_encoding, face_loc in zip(face_encodings, face_locations):
            # So sánh khuôn mặt hiện tại với danh sách đã biết
            matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
            face_distances = face_recognition.face_distance(known_encodings, face_encoding)
            name = "Unknown"
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_names[best_match_index]

            # Scale vị trí khuôn mặt lên kích thước ban đầu (do frame đã giảm 50%)
            top, right, bottom, left = [coord * 2 for coord in face_loc]
            face_image = frame[top:bottom, left:right]

            # Phân tích cảm xúc với DeepFace
            emotion_text = "Unknown"
            if face_image.size != 0:
                try:
                    # Resize khuôn mặt phù hợp với yêu cầu của DeepFace
                    face_resized = cv2.resize(face_image, (224, 224))
                    analysis = DeepFace.analyze(face_resized, actions=["emotion"], enforce_detection=False)
                    # Một số phiên bản DeepFace trả về list, lấy phần tử đầu nếu cần
                    if isinstance(analysis, list):
                        analysis = analysis[0]
                    emotions = analysis.get("emotion", {})
                    if emotions:
                        dominant_emotion = max(emotions, key=emotions.get)
                        confidence = emotions[dominant_emotion]
                        if confidence > 60:  # Ngưỡng tin cậy để nhận diện cảm xúc
                            emotion_text = dominant_emotion
                            overall_emotion_counts[dominant_emotion] += 1
                            total_emotions += 1
                            # Lưu cảm xúc riêng cho từng người (chỉ khi nhận diện được tên khác Unknown)
                            if name != "Unknown":
                                person_emotions[name][dominant_emotion] += 1
                except Exception as e:
                    print("Lỗi khi phân tích cảm xúc:", e)

            # Vẽ bounding box và ghi tên, cảm xúc lên frame gốc
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, f"{name}", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX,
                        0.8, (255, 255, 255), 2)
            cv2.putText(frame, f"{emotion_text}", (left, bottom + 30), cv2.FONT_HERSHEY_SIMPLEX,
                        0.8, (0, 255, 0), 2)

        cv2.imshow("Nhận diện khuôn mặt & Cảm xúc", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    # In thống kê cảm xúc riêng của từng người
    print("\nThống kê cảm xúc của từng người:")
    if person_emotions:
        for person, emotions in person_emotions.items():
            total_person = sum(emotions.values())
            print(f"\n{person}:")
            for emo, count in emotions.items():
                percentage = (count / total_person) * 100 if total_person > 0 else 0
                print(f"  {emo} - {count} ({percentage:.2f}%)")
    else:
        print("Không có dữ liệu cảm xúc riêng nào.")

    # In thống kê cảm xúc tổng hợp
    print("\nThống kê cảm xúc tổng hợp:")
    if total_emotions > 0:
        for emotion, count in overall_emotion_counts.items():
            percentage = (count / total_emotions) * 100
            print(f"{emotion} - {count} ({percentage:.2f}%)")
    else:
        print("Không có dữ liệu cảm xúc để thống kê.")

def main():
    known_faces_folder = "C:/Users/nqt00/OneDrive/Desktop/nhandienkhuonmat/face"
    video_path = r"C:\Users\nqt00\OneDrive\Desktop\WIN_20250319_22_32_57_Pro.mp4"

    # Load và mã hóa khuôn mặt đã biết
    known_encodings, known_names = load_known_faces(known_faces_folder)
    if len(known_encodings) == 0:
        print("Không có khuôn mặt nào được mã hóa. Kiểm tra lại thư mục ảnh!")
        return
    print("Mã hóa khuôn mặt thành công!")

    # Xử lý video: có thể thay đổi 'frame_interval' nếu cần (mặc định mỗi 5 frame)
    process_video(video_path, known_encodings, known_names, frame_interval=5)

if __name__ == '__main__':
    main()

