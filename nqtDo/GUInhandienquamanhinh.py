
import tkinter as tk
from tkinter import ttk, messagebox
import pyodbc
import cv2
import os
import numpy as np
import mss
import time
import threading
import json
from deepface import DeepFace
from collections import defaultdict
import face_recognition
import uuid
import hashlib


# ---------------------- KẾT NỐI DATABASE ----------------------
def connect_db():
    conn_str = (
        "DRIVER={SQL Server};"
        "SERVER=NguyenQuocTien;"
        "DATABASE=OTMS;"
        "UID=sa;"
        "PWD=sa;"
    )
    return pyodbc.connect(conn_str)


def hash_password(password):
    """ Chuyển đổi mật khẩu thành SHA-256 hash """
    return hashlib.sha256(password.encode()).hexdigest()

def validate_login(email, password):
    """ Kiểm tra đăng nhập bằng cách so sánh email và mật khẩu đã hash """
    try:
        conn = connect_db()
        cursor = conn.cursor()
        query = """
            SELECT CONVERT(NVARCHAR(64), password) AS hashed_password, 
                   CONVERT(NVARCHAR(36), account_id) AS account_id
            FROM Account
            WHERE email = ?
        """
        cursor.execute(query, email)
        row = cursor.fetchone()
        conn.close()

        if row:
            stored_hashed_password, account_id = row
            input_hashed_password = hash_password(password)  # Hash mật khẩu nhập vào
            if stored_hashed_password == input_hashed_password:
                return account_id  # Trả về account_id nếu mật khẩu đúng
        return None  # Sai mật khẩu hoặc không tìm thấy tài khoản

    except Exception as e:
        print("Login error:", e)
        return None



# ---------------------- LẤY DỮ LIỆU SESSION ----------------------


def fetch_data():
    conn = connect_db()
    cursor = conn.cursor()
    query = """
        SELECT
            CONVERT(NVARCHAR(36), s.session_id) AS session_id,
            s.session_number,
            c.class_name,
            a.full_name AS lecturer_name,
            FORMAT(s.session_date, 'yyyy-MM-dd HH:mm:ss') AS session_date,
            s.slot
        FROM Session s
        JOIN Class c ON s.class_id = c.class_id
        JOIN Account a ON s.lecturer_id = a.account_id
        JOIN Role r ON a.role_id = r.role_id
        WHERE s.lecturer_id = ? ;
    """

    # Kiểm tra xem logged_account_id đã được gán chưa
    if not logged_account_id:
        print("Error: logged_account_id is None")
        return []

    cursor.execute(query, logged_account_id)
    rows = cursor.fetchall()
    conn.close()
    return rows


# ---------------------- LƯU KẾT QUẢ PHÂN TÍCH VÀO DB ----------------------
def save_analysis_to_db(session_uuid, analysis_json):
    if not analysis_json:
        messagebox.showinfo("Infor","Chưa phân tích ")
        return

    try:
        # Xử lý session_uuid
        session_uuid_clean = session_uuid.strip().replace("{", "").replace("}", "")
        valid_uuid = str(uuid.UUID(session_uuid_clean))
        print("Valid session_uuid:", valid_uuid)
        # Sử dụng logged_account_id từ đăng nhập
        global logged_account_id
        if not logged_account_id:
            raise Exception("Account ID is not set. Login failed?")
        valid_account_id = str(uuid.UUID(logged_account_id.strip().replace("{", "").replace("}", "")))
        conn = connect_db()
        cursor = conn.cursor()
        query = """
            INSERT INTO Report (record_id, session_id, analysis_data, generated_at, generated_by, status)
            VALUES (NULL, ?, ?, GETDATE(), ?, 1)
        """
        cursor.execute(query, valid_uuid, analysis_json, valid_account_id)
        conn.commit()
        messagebox.showinfo("result",analysis_json)
        conn.close()
    except Exception as e:
        print("Error saving analysis to DB:", e)

# ---------------------- NHẬN DIỆN KHUÔN MẶT ----------------------
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

running = False         # Biến toàn cục kiểm soát quá trình nhận diện
analysis_result = None  # Lưu kết quả phân tích (JSON)
analysis_thread = None  # Biến toàn cục lưu thread phân tích

def capture_screen_faces():
    global running
    start_time = time.time()
    frame_count = 0
    face_data = defaultdict(lambda: {"count": 0, "first_seen": None, "emotions": defaultdict(int)})

    with mss.mss() as sct:
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
                except Exception as e:
                    print("DeepFace error:", e)
                    emotion = "unknown"

                cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                face_filename = os.path.join(RESULT_FOLDER, name, f"{timestamp}_{emotion}.jpg")
                cv2.imwrite(face_filename, face_img)

            frame_count += 1
            cv2.waitKey(1)

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
    return result

def start_analysis():
    global running, analysis_result
    running = True
    analysis_result = capture_screen_faces()

def stop_analysis():
    global running, analysis_thread
    running = False
    if analysis_thread is not None:
        analysis_thread.join()
    # Lấy session_id được chọn từ treeview (dạng UUID)
    selected_session = session_id_var.get()
    if not selected_session:
        messagebox.showerror("Error", "Vui lòng chọn 1 session từ bảng trước khi dừng phân tích.")
        return
    # Lưu kết quả phân tích (JSON) vào database
    save_analysis_to_db(selected_session, json.dumps(analysis_result, ensure_ascii=False))
    messagebox.showinfo("Info", "Phân tích kết thúc và kết quả đã được lưu vào DB.")
    root_main.destroy()

# ---------------------- GIAO DIỆN CHÍNH (SAU LOGIN) ----------------------
def main_interface():
    global root_main, session_id_var, analysis_thread
    root_main = tk.Tk()
    root_main.title("OTMS GUI")
    root_main.geometry("900x500")

    # Biến lưu session_id được chọn (dạng UUID)
    session_id_var = tk.StringVar()

    # Tạo bảng hiển thị dữ liệu
    tree = ttk.Treeview(root_main, columns=("ID", "Session", "Class", "Lecturer", "Date", "Slot"), show="headings")
    cols = ["ID", "Session", "Class", "Lecturer", "Date", "Slot"]
    for col in cols:
        tree.heading(col, text=col)
        tree.column(col, width=130)
    tree.pack(fill=tk.BOTH, expand=True)

    # Thanh cuộn dọc cho treeview
    scrollbar = ttk.Scrollbar(root_main, orient=tk.VERTICAL, command=tree.yview)
    tree.configure(yscroll=scrollbar.set)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    def on_item_selected(event):
        selected_item = tree.selection()
        if selected_item:
            item = tree.item(selected_item)
            session_id_var.set(item['values'][0])

    tree.bind("<<TreeviewSelect>>", on_item_selected)

    # Nạp dữ liệu vào bảng
    data = fetch_data()
    for row in data:
        session_id_val = row[0]  # session_id
        session_number = row[1]  # session_number
        class_name = row[2]       # class_name
        lecturer_name = row[3]    # lecturer_name
        session_date = row[4]     # session_date
        slot = row[5]             # slot
        tree.insert("", tk.END, values=(session_id_val, session_number, class_name, lecturer_name, session_date, slot))

    # Frame chứa các nút và nhãn hiển thị session được chọn
    control_frame = tk.Frame(root_main)
    control_frame.pack(pady=10)

    tk.Label(control_frame, text="Selected Session ID:").pack(side=tk.LEFT)
    tk.Entry(control_frame, textvariable=session_id_var, state='readonly', width=40).pack(side=tk.LEFT, padx=5)

    # Nút Start và Stop
    button_frame = tk.Frame(root_main)
    button_frame.pack(pady=10)

    start_btn = tk.Button(button_frame, text="Start", width=10)
    stop_btn = tk.Button(button_frame, text="Stop", width=10, state=tk.DISABLED)  # ban đầu vô hiệu

    status_label = tk.Label(root_main, text="", font=("Arial", 14))
    status_label.pack(pady=5)

    def on_start():
        global analysis_thread
        if not session_id_var.get():
            messagebox.showerror("Error", "Vui lòng chọn 1 session từ bảng trước khi bắt đầu.")
            return
        start_btn.config(state=tk.DISABLED)
        stop_btn.config(state=tk.NORMAL)
        status_label.config(text="Bắt đầu nhận diện...")
        load_known_faces()
        analysis_thread = threading.Thread(target=start_analysis)
        analysis_thread.start()

    def on_stop():
        stop_analysis()

    start_btn.config(command=on_start)
    stop_btn.config(command=on_stop)

    start_btn.pack(side=tk.LEFT, padx=10)
    stop_btn.pack(side=tk.LEFT, padx=10)

    root_main.protocol("WM_DELETE_WINDOW", on_stop)
    root_main.mainloop()

# ---------------------- MÀN HÌNH ĐĂNG NHẬP ----------------------
def login_screen():
    login_win = tk.Tk()
    login_win.title("Đăng nhập")
    login_win.geometry("300x200")

    tk.Label(login_win, text="Username:").pack(pady=5)
    username_entry = tk.Entry(login_win)
    username_entry.pack(pady=5)

    tk.Label(login_win, text="Password:").pack(pady=5)
    password_entry = tk.Entry(login_win, show="*")
    password_entry.pack(pady=5)

    def attempt_login():
        username = username_entry.get().strip()
        password = password_entry.get().strip()
        if not username or not password:
            messagebox.showerror("Error", "Vui lòng nhập đầy đủ username và password.")
            return
        account_id = validate_login(username, password)
        if account_id:
            global logged_account_id
            logged_account_id = account_id  # lưu account_id từ DB
            messagebox.showinfo("Success", "Đăng nhập thành công!")
            login_win.destroy()
            main_interface()
        else:
            messagebox.showerror("Error", "Sai username hoặc password.")

    tk.Button(login_win, text="Đăng nhập", command=attempt_login).pack(pady=20)
    login_win.mainloop()

# Biến toàn cục lưu account_id của người dùng đã đăng nhập
logged_account_id = None

if __name__ == "__main__":
    login_screen()
