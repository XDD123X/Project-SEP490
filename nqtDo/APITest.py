# import json
#
# import requests
#
# url = 'http://127.0.0.1:5000/process_video'
#
# video_path = 'C:/Users/nqt00/OneDrive/Desktop/WIN_20250319_22_32_57_Pro.mp4'
#
# with open(video_path, 'rb') as video_file:
#     files = {'video': video_file}
#     response = requests.post(url, files=files)
#
# if response.status_code == 200:
#     result = response.json()
#     print(json.dumps(result, indent=4, ensure_ascii=False))
# else:
#     print(f"Yêu cầu không thành công. Mã lỗi: {response.status_code}")
