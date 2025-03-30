import tkinter as tk
from tkinter import ttk
import pyodbc

# Kết nối đến database
def connect_db():
    conn_str = (
        "DRIVER={SQL Server};"
        "SERVER=NguyenQuocTien;"
        "DATABASE=OTMS;"
        "UID=sa;"
        "PWD=sa;"
    )
    return pyodbc.connect(conn_str)

# Lấy dữ liệu từ database
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
        WHERE r.name = 'Lecturer';
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    return rows

# Sự kiện khi chọn hàng trong bảng
def on_item_selected(event):
    selected_item = tree.selection()
    if selected_item:
        item = tree.item(selected_item)
        session_id.set(item['values'][0])

# Tạo giao diện
tk_root = tk.Tk()
tk_root.title("OTMS GUI")
tk_root.geometry("800x400")

# Biến lưu session_id
session_id = tk.StringVar()

# Tạo bảng hiển thị dữ liệu
tree = ttk.Treeview(tk_root, columns=("ID", "Session", "Class", "Lecturer", "Date", "Slot"), show="headings")
columns = ["ID", "Session", "Class", "Lecturer", "Date", "Slot"]
for col in columns:
    tree.heading(col, text=col)
    tree.column(col, width=120)
tree.bind("<<TreeviewSelect>>", on_item_selected)
tree.pack(fill=tk.BOTH, expand=True)

# Thanh cuộn
scrollbar = ttk.Scrollbar(tk_root, orient=tk.VERTICAL, command=tree.yview)
tree.configure(yscroll=scrollbar.set)
scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

# Nạp dữ liệu vào bảng
data = fetch_data()
for row in data:
    session_id_val = row[0]  # session_id
    session_number = row[1]  # session_number
    class_name = row[2]  # class_name
    lecturer_name = row[3]  # lecturer_name
    session_date = row[4]  # session_date
    slot = row[5]  # slot
    tree.insert("", tk.END, values=(session_id_val, session_number, class_name, lecturer_name, session_date, slot))

# Nhãn hiển thị Session ID được chọn
frame = tk.Frame(tk_root)
frame.pack(pady=10)
tk.Label(frame, text="Selected Session ID:").pack(side=tk.LEFT)
tk.Entry(frame, textvariable=session_id, state='readonly', width=40).pack(side=tk.LEFT, padx=5)

# Chạy giao diện
tk_root.mainloop()


