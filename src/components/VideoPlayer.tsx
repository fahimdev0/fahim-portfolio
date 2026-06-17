/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2, Settings, Check, Zap, Play } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  poster?: string;
  onPlay?: () => void;
}

interface QualityLevel {
  index: number;
  name: string;
  height: number;
  bitrate: number;
}

export const VideoPlayer = ({ url, poster, onPlay }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Quality Level States
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 is Auto
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setLevels([]);
    setCurrentLevel(-1);
    setShowSettings(false);

    let hls: Hls | null = null;

    const handleCanPlay = () => setLoading(false);
    const handleWaiting = () => setLoading(true);
    const handlePlaying = () => {
      setLoading(false);
      setIsPlaying(true);
      if (onPlay) onPlay();
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError("This live stream of the channel is currently offline or blocked by CORS headers.");
      setLoading(false);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("play", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    if (url.includes(".m3u8") || url.includes("m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          manifestLoadingMaxRetry: 6,
          levelLoadingMaxRetry: 6,
          // Advanced buffer optimization to achieve smooth, stutter-free playback
          maxBufferLength: 45,            // maximum buffer size in seconds
          maxMaxBufferLength: 120,        // absolute maximum buffer length
          maxBufferSize: 60 * 1024 * 1024, // 60 Megabytes maximum stream memory buffer size
          liveSyncDurationCount: 3,       // offset live feed to sync smoothly
          liveMaxLatencyDurationCount: 8, // cap live feed delay to prevent buffering build-up
        });

        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Read streaming quality levels
          const hlsLevels = hls?.levels.map((lvl, index) => {
            const height = lvl.height || 0;
            let name = lvl.name || "";
            if (!name) {
              if (height >= 1085) name = "1080p FHD";
              else if (height >= 720) name = "720p HD";
              else if (height >= 480) name = "480p SD";
              else if (height > 0) name = `${height}p`;
              else name = `Level ${index + 1}`;
            }
            return {
              index,
              name,
              height,
              bitrate: lvl.bitrate
            };
          }) || [];

          setLevels(hlsLevels);
          video.play().catch(() => {
            // Auto-play block fallback
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                setError("Stream resource link is currently unavailable or requires private token authentication.");
                setLoading(false);
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native iOS/Safari support
        video.src = url;
        video.load();
        video.play().catch(() => {
          // Playback blocked or waiting for native gesture interaction
        });
      } else {
        setError("Your browser does not support HLS (.m3u8) video streaming natively.");
        setLoading(false);
      }
    } else {
      // Fallback for regular MP4 video feed file
      video.src = url;
      video.load();
      video.play().catch(() => {});
    }

    return () => {
      try {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("play", handlePlaying);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("error", handleError);
        
        video.pause();
        
        if (hls) {
          hls.detachMedia();
          hls.destroy();
          hlsRef.current = null;
        }
        
        video.src = "";
        video.removeAttribute("src");
        video.load();
      } catch (err) {
        console.warn("VideoPlayer cleanup warning:", err);
      }
    };
  }, [url]);

  const selectQualityLevel = (levelIdx: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIdx;
    setCurrentLevel(levelIdx);
    setShowSettings(false);
  };

  return (
    <div className="relative w-full h-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
      <video
        ref={videoRef}
        controls
        poster={poster}
        className="w-full h-full object-contain"
        playsInline
        preload="auto"
      />

      {/* Touch Overlay back-up for Mobile & iOS Autoplay restrictions */}
      {!loading && !error && !isPlaying && (
        <div 
          onClick={() => {
            const video = videoRef.current;
            if (video) {
              video.play().catch(() => {});
            }
          }}
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3.5 z-20 cursor-pointer active:bg-black/65 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-600/90 border border-white/10 flex items-center justify-center text-white shadow-2xl scale-100 hover:scale-105 active:scale-95 transition-all duration-300">
            <Play className="w-7 h-7 fill-current ml-1 text-white animate-pulse" />
          </div>
          <p className="text-[11px] font-black tracking-widest text-indigo-200 uppercase bg-indigo-950/80 px-4 py-2 rounded-full border border-indigo-500/30 shadow-lg">
            Tap to Play Live Stream
          </p>
        </div>
      )}

      {/* Floating status badge */}
      <div className="absolute top-3 left-3 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/5 pointer-events-none flex items-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Zap className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[10px] font-bold text-white/90">Buffer Stream Optimized</span>
      </div>

      {levels.length > 0 && (
        <div className="absolute top-3 right-3 z-30">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/75 hover:bg-neutral-900 border border-white/10 text-white/90 font-bold text-xs select-none shadow-xl transition-all active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {currentLevel === -1 
                ? "Auto Quality" 
                : `${levels.find(l => l.index === currentLevel)?.name || 'Manual'}`}
            </span>
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-neutral-950/95 border border-white/10 p-2.5 shadow-2xl backdrop-blur-2xl space-y-1 z-50">
              <div className="px-2 py-1.5 text-[9px] uppercase tracking-wider font-extrabold text-white/40 border-b border-white/5 mb-1.5 flex items-center justify-between">
                <span>Select Quality</span>
                <span className="text-[#38BDF8]">HLS Live</span>
              </div>
              
              {/* Option Auto */}
              <button
                onClick={() => selectQualityLevel(-1)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentLevel === -1
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-white/60 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <span>Auto Adaptive</span>
                {currentLevel === -1 && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>

              {/* Dynamic Hls quality list */}
              {levels.map((lvl) => (
                <button
                  key={lvl.index}
                  onClick={() => selectQualityLevel(lvl.index)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentLevel === lvl.index
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      : "text-white/60 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <span className="truncate">{lvl.name}</span>
                  {currentLevel === lvl.index ? (
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                  ) : lvl.height > 0 ? (
                    <span className="text-[9px] text-white/30 font-semibold">{lvl.height}p</span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && !error && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none transition-all">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-xs font-bold tracking-wider text-white/50 uppercase">Loading Live Feed...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center text-center p-6 gap-3 z-20">
          <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
          <h4 className="text-sm font-bold text-white">Stream Playback Failed</h4>
          <p className="text-xs text-white/40 max-w-sm leading-relaxed">{error}</p>
          <span className="text-[9px] uppercase tracking-widest text-[#FF9E0B] font-bold bg-[#FF9E0B]/10 px-2.5 py-1 rounded border border-[#FF9E0B]/20">
            Source Offline / Blocked
          </span>
        </div>
      )}
    </div>
  );
};
