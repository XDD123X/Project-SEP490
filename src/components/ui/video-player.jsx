import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function VideoPlayer({ videoUrl }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [thumbnail, setThumbnail] = useState();
  const [isLoaded, setIsLoaded] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleProgressChange = (value) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  return (
    <div className="relative group bg-black">
      {!isPlaying && thumbnail && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${thumbnail})` }} />
          <Button variant="ghost" size="icon" onClick={togglePlay} className="relative z-10 rounded-full bg-black/50 p-8 text-white hover:bg-black/70">
            <Play className="h-10 w-10" />
          </Button>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnail}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedData={handleLoadedData}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Slider value={[progress]} min={0} max={100} step={0.1} onValueChange={handleProgressChange} className="mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider value={[isMuted ? 0 : volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-24" />
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleFullscreen} className="text-white hover:bg-white/20">
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
