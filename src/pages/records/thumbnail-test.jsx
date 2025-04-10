import { useEffect, useRef, useState } from "react";

export function VideoThumbnail({ videoUrl }) {
  const videoRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.currentTime = 1;

    const captureThumbnail = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumbnail(canvas.toDataURL("image/png"));
    };

    video.addEventListener("loadeddata", captureThumbnail);
    return () => video.removeEventListener("loadeddata", captureThumbnail);
  }, [videoUrl]);

  return <>{thumbnail ? <img src={thumbnail} alt="Video thumbnail" /> : <p>Loading thumbnail...</p>}</>;
}
