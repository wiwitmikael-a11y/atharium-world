import React, { useEffect, useRef, useState } from 'react';

interface InfoTooltipProps {
  targetRef: React.RefObject<HTMLElement>;
  onClose: () => void;
  children: React.ReactNode;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ targetRef, onClose, children }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999, opacity: 0 });

  useEffect(() => {
    const handlePositioning = () => {
      if (targetRef.current && tooltipRef.current) {
        const targetRect = targetRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let top = targetRect.bottom + 8;
        let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

        // Adjust if it goes off-screen
        if (left < 8) left = 8;
        if (left + tooltipRect.width > window.innerWidth - 8) {
          left = window.innerWidth - tooltipRect.width - 8;
        }
        if (top + tooltipRect.height > window.innerHeight - 8) {
          top = targetRect.top - tooltipRect.height - 8;
        }
        
        setPosition({ top, left, opacity: 1 });
      }
    };
    
    // Position after a tick to allow for rendering
    const timerId = setTimeout(handlePositioning, 0);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) && targetRef.current && !targetRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handlePositioning);
    
    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handlePositioning);
    };
  }, [targetRef, onClose]);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-gray-900/90 backdrop-blur-md border border-cyan-500/50 rounded-lg shadow-2xl p-4 w-80 text-sm text-gray-300 transition-opacity duration-200"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        opacity: position.opacity
      }}
    >
      {children}
    </div>
  );
};

export default InfoTooltip;
