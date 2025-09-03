import React, { useEffect, useRef, useState } from 'react';
import { ASSET_PATHS } from '../assets';

interface IntroVideoProps {
  onFinish: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [message, setMessage] = useState('');

  // Show initial message after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage('Click to Unmute');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const finishIntro = () => {
    if (videoRef.current) {
        // Fade out the video for a smoother transition
        videoRef.current.style.transition = 'opacity 0.5s ease-out';
        videoRef.current.style.opacity = '0';
        setTimeout(onFinish, 500); // Call onFinish after the fade
    } else {
        onFinish();
    }
  };
  
  const handleClick = () => {
    if (!videoRef.current) {
      finishIntro();
      return;
    }
    
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      setMessage('Click to Skip');
    } else {
      finishIntro();
    }
  };


  return (
    <div className="relative w-screen h-screen bg-black cursor-pointer" onClick={handleClick}>
      <video
        ref={videoRef}
        src={ASSET_PATHS.video_intro}
        autoPlay
        muted
        playsInline
        onEnded={finishIntro}
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ transition: 'opacity 0.5s ease-out', opacity: 1 }}
      />
      {message && (
        <div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-lg font-cinzel animate-pulse"
            style={{ textShadow: '0 0 8px rgba(0,0,0,0.8)' }}
        >
            {message}
        </div>
      )}
    </div>
  );
};

export default IntroVideo;