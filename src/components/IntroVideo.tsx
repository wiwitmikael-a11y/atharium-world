
import React, { useEffect, useRef, useState } from 'react';
import { ASSET_PATHS } from '../assets';

interface IntroVideoProps {
  onFinish: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [message, setMessage] = useState('');
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMessage('Click to Unmute'), 2500);
    return () => clearTimeout(timer);
  }, []);

  const finishIntro = () => {
    if (isFading) return;
    setIsFading(true);
    if (containerRef.current) {
        containerRef.current.style.opacity = '0';
        setTimeout(onFinish, 500);
    } else {
        onFinish();
    }
  };
  
  const handleClick = () => {
    const video = videoRef.current;
    if (!video) {
      finishIntro();
      return;
    }
    
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      setMessage('Click to Skip');
    } else {
      finishIntro();
    }
  };

  return (
    <div ref={containerRef} className="relative w-screen h-screen bg-black cursor-pointer transition-opacity duration-500 ease-out" onClick={handleClick}>
      <video
        ref={videoRef}
        src={ASSET_PATHS.video_intro}
        autoPlay
        muted
        playsInline
        onEnded={finishIntro}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      {message && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-lg font-cinzel animate-pulse" style={{ textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>
            {message}
        </div>
      )}
    </div>
  );
};

export default IntroVideo;
