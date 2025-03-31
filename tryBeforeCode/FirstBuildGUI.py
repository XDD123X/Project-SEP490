# import tkinter as tk
# from tkinter import ttk, messagebox
# import pyodbc
# import cv2
# import os
# import numpy as np
# import mss
# import time
# import threading
# import json
# from deepface import DeepFace
# from collections import defaultdict
# import face_recognition
# import uuid
#
#
# # ---------------------- KẾT NỐI DATABASE VÀ LẤY DỮ LIỆU SESSION ----------------------
# def connect_db():
#     conn_str = (
#         "DRIVER={SQL Server};"
#         "SERVER=NguyenQuocTien;"
#         "DATABASE=OTMS;"
#         "UID=sa;"
#         "PWD=sa;"
#     )
#     return pyodbc.connect(conn_str)
#
# def fetch_data():
#     conn = connect_db()
#     cursor = conn.cursor()
#     query = """
#         SELECT
#             CONVERT(NVARCHAR(36), s.session_id) AS session_id,
#             s.session_number,
#             c.class_name,
#             a.full_name AS lecturer_name,
#             FORMAT(s.session_date, 'yyyy-MM-dd HH:mm:ss') AS session_date,
#             s.slot
#         FROM Session s
#         JOIN Class c ON s.class_id = c.class_id
#         JOIN Account a ON s.lecturer_id = a.account_id
#         JOIN Role r ON a.role_id = r.role_id
#         WHERE r.name = 'Lecturer';
#     """
#     cursor.execute(query)
#     rows = cursor.fetchall()
#     conn.close()
#     return rows
#
#
#
# def save_analysis_to_db(session_uuid, analysis_json):
#     try:
#         # Loại bỏ khoảng trắng và các ký tự ngoặc nếu có
#         session_uuid_clean = session_uuid.strip().replace("{", "").replace("}", "")
#         # Chuyển đổi để xác thực định dạng GUID
#         valid_uuid = uuid.UUID(session_uuid_clean)
#         valid_uuid_str = str(valid_uuid)
#         print("Valid session_uuid:", valid_uuid_str)  # Debug: kiểm tra giá trị GUID
#
#         conn = connect_db()
#         cursor = conn.cursor()
#         query = """
#             INSERT INTO Report (record_id, session_id, analysis_data, generated_at, generated_by, status)
#             VALUES (NULL, ?, ?, GETDATE(), ?, 1)
#         """
#         cursor.execute(query, valid_uuid_str, analysis_json, "8AEDD6A8-8E8B-4493-AA25-16823400BB11")
#         conn.commit()
#         conn.close()
#     except Exception as e:
#         print("Error saving analysis to DB:", e)
#
#
#
# # ---------------------- NHẬN DIỆN KHUÔN MẶT ----------------------
# KNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/face"
# UNKNOWN_FACES_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/unknown_faces"
# RESULT_FOLDER = "C:/Users/nqt00/OneDrive/Desktop/nhandiencamxuc/Result"
# EMOTION_CATEGORIES = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]
#
# os.makedirs(KNOWN_FACES_FOLDER, exist_ok=True)
# os.makedirs(UNKNOWN_FACES_FOLDER, exist_ok=True)
# os.makedirs(RESULT_FOLDER, exist_ok=True)
#
# known_encodings = []
# known_names = []
# unknown_faces = {}
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
# running = False  # Biến toàn cục kiểm soát quá trình nhận diện
# analysis_result = None  # Lưu kết quả phân tích (JSON)
#
# def capture_screen_faces():
#     global running
#     start_time = time.time()
#     frame_count = 0
#     face_data = defaultdict(lambda: {"count": 0, "first_seen": None, "emotions": defaultdict(int)})
#
#     with mss.mss() as sct:
#         while running:
#             screenshot = sct.grab(sct.monitors[1])
#             frame = np.array(screenshot)
#             frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
#             rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#             face_locations = face_recognition.face_locations(rgb_frame)
#             face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
#             timestamp = time.strftime('%Y-%m-%d_%H-%M-%S')
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
#
#                 os.makedirs(os.path.join(RESULT_FOLDER, name), exist_ok=True)
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
#                 except Exception as e:
#                     print("DeepFace error:", e)
#                     emotion = "unknown"
#
#                 cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
#                 face_filename = os.path.join(RESULT_FOLDER, name, f"{timestamp}_{emotion}.jpg")
#                 cv2.imwrite(face_filename, face_img)
#
#             frame_count += 1
#             # Có thể thêm delay nếu cần
#             cv2.waitKey(1)
#
#     total_time = time.time() - start_time
#     total_time_str = time.strftime('%Hh%Mm%Ss', time.gmtime(total_time))
#
#     result = {
#         "detected_faces": {name: {
#             "count": data["count"],
#             "first_seen": data["first_seen"],
#             "emotions": dict(data["emotions"]),
#             "presence_ratio": round(data["count"] / frame_count, 2) if frame_count > 0 else 0
#         } for name, data in face_data.items()},
#         "overall_emotion_counts": {emotion: sum(data["emotions"].get(emotion, 0) for data in face_data.values()) for
#                                    emotion in EMOTION_CATEGORIES},
#         "total_emotions": sum(sum(data["emotions"].values()) for data in face_data.values()),
#         "total_time": total_time_str
#     }
#     print(json.dumps(result, indent=4, ensure_ascii=False))
#     return result
#
# def start_analysis():
#     global running, analysis_result
#     running = True
#     analysis_result = capture_screen_faces()
#
# def stop_analysis():
#     global running
#     running = False
#     # Sau khi dừng, chờ luồng nhận diện kết thúc
#     analysis_thread.join()
#     # Lấy session_id được chọn từ treeview (dạng UUID)
#     selected_session = session_id_var.get()
#     if not selected_session:
#         messagebox.showerror("Error", "Vui lòng chọn 1 session từ bảng trước khi dừng phân tích.")
#         return
#     # Lưu kết quả phân tích (JSON) vào database
#     save_analysis_to_db(selected_session, json.dumps(analysis_result, ensure_ascii=False))
#     messagebox.showinfo("Info", "Phân tích kết thúc và kết quả đã được lưu vào DB.")
#     # Sau khi lưu, bạn có thể đóng ứng dụng hoặc thực hiện các thao tác khác.
#     root.destroy()
#
# # ---------------------- GIAO DIỆN TKINTER ----------------------
# root = tk.Tk()
# root.title("OTMS GUI")
# root.geometry("900x500")
#
# # Biến lưu session_id được chọn (dạng UUID)
# session_id_var = tk.StringVar()
#
# # Tạo bảng hiển thị dữ liệu
# tree = ttk.Treeview(root, columns=("ID", "Session", "Class", "Lecturer", "Date", "Slot"), show="headings")
# cols = ["ID", "Session", "Class", "Lecturer", "Date", "Slot"]
# for col in cols:
#     tree.heading(col, text=col)
#     tree.column(col, width=130)
# tree.pack(fill=tk.BOTH, expand=True)
#
# # Thanh cuộn dọc cho treeview
# scrollbar = ttk.Scrollbar(root, orient=tk.VERTICAL, command=tree.yview)
# tree.configure(yscroll=scrollbar.set)
# scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
#
# # Sự kiện khi chọn một hàng trong treeview
# def on_item_selected(event):
#     selected_item = tree.selection()
#     if selected_item:
#         item = tree.item(selected_item)
#         session_id_var.set(item['values'][0])
#
# tree.bind("<<TreeviewSelect>>", on_item_selected)
#
# # Nạp dữ liệu vào bảng
# data = fetch_data()
# for row in data:
#     session_id_val = row[0]  # session_id
#     session_number = row[1]  # session_number
#     class_name = row[2]       # class_name
#     lecturer_name = row[3]    # lecturer_name
#     session_date = row[4]     # session_date
#     slot = row[5]             # slot
#     tree.insert("", tk.END, values=(session_id_val, session_number, class_name, lecturer_name, session_date, slot))
#
#
# # Frame chứa các nút và nhãn hiển thị session được chọn
# control_frame = tk.Frame(root)
# control_frame.pack(pady=10)
#
# # Nhãn hiển thị session_id được chọn
# tk.Label(control_frame, text="Selected Session ID:").pack(side=tk.LEFT)
# tk.Entry(control_frame, textvariable=session_id_var, state='readonly', width=40).pack(side=tk.LEFT, padx=5)
#
# # Nút Start và Stop
# button_frame = tk.Frame(root)
# button_frame.pack(pady=10)
#
# start_btn = tk.Button(button_frame, text="Start", width=10)
# stop_btn = tk.Button(button_frame, text="Stop", width=10, state=tk.DISABLED)  # ban đầu vô hiệu
#
# # Nút thông báo trạng thái (hiển thị thông điệp "Bắt đầu nhận diện")
# status_label = tk.Label(root, text="", font=("Arial", 14))
# status_label.pack(pady=5)
#
# analysis_thread = None  # biến toàn cục lưu thread phân tích
#
# def on_start():
#     global analysis_thread
#     if not session_id_var.get():
#         messagebox.showerror("Error", "Vui lòng chọn 1 session từ bảng trước khi bắt đầu.")
#         return
#     # Ẩn nút Start, bật nút Stop và thông báo
#     start_btn.config(state=tk.DISABLED)
#     stop_btn.config(state=tk.NORMAL)
#     status_label.config(text="Bắt đầu nhận diện...")
#     # Tải dữ liệu khuôn mặt đã biết
#     load_known_faces()
#     # Bắt đầu luồng nhận diện
#     analysis_thread = threading.Thread(target=start_analysis)
#     analysis_thread.start()
#
# def on_stop():
#     # Khi nhấn Stop, gọi hàm stop_analysis để dừng nhận diện, in kết quả và lưu vào DB
#     stop_analysis()
#
# start_btn.config(command=on_start)
# stop_btn.config(command=on_stop)
#
# start_btn.pack(side=tk.LEFT, padx=10)
# stop_btn.pack(side=tk.LEFT, padx=10)
#
# # Giao diện chính chạy vòng lặp Tkinter
# root.protocol("WM_DELETE_WINDOW", on_stop)
# root.mainloop()
