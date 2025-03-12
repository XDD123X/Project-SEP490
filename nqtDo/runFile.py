import requests
import json

url = "http://127.0.0.1:5000/analyze_emotions"
data = {"video_path": "C:\\Users\\nqt00\\OneDrive\\Desktop\\6396588663822.mp4"}

response = requests.post(url, json=data)

print(json.dumps(response.json(), indent=4, ensure_ascii=False))
