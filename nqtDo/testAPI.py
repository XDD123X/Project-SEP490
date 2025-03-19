import requests
import json


def main():
    url = "http://127.0.0.1:5000/process_video"
    data = {
        "video_path": r"C:\Users\nqt00\OneDrive\Desktop\yt1z.net - Một buổi học Online tại Adam Muzic (720p) (online-video-cutter.com).mp4"
    }

    try:
        response = requests.post(url, json=data, timeout=3000)
        response.raise_for_status()  # Ném lỗi nếu status code không phải 200
    except requests.exceptions.RequestException as e:
        print("Yêu cầu thất bại:", e)
        return

    try:
        result = response.json()
    except Exception as e:
        print("Lỗi khi giải mã JSON:", e)
        print("Nội dung phản hồi:", response.text)
        return

    print(json.dumps(result, indent=4, ensure_ascii=False))


if __name__ == "__main__":
    main()
