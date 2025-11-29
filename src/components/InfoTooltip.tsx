
import React, { useEffect, useRef, useState } from 'react';

interface InfoTooltipProps {
  targetElement: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ targetElement, onClose, children }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999, opacity: 0 });

  useEffect(() => {
    const handlePositioning = () => {
      if (targetElement && tooltipRef.current) {
        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let top = targetRect.bottom + 8;
        let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

        if (left < 8) left = 8;
        if (left + tooltipRect.width > window.innerWidth - 8) left = window.innerWidth - tooltipRect.width - 8;
        if (top + tooltipRect.height > window.innerHeight - 8) top = targetRect.top - tooltipRect.height - 8;
        
        setPosition({ top, left, opacity: 1 });
      }
    };
    
    const timerId = setTimeout(handlePositioning, 0);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) && targetElement && !targetElement.contains(event.target as Node)) {
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
  }, [targetElement, onClose]);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-gray-900/80 backdrop-blur-md border border-cyan-500/50 rounded-lg shadow-2xl p-4 w-80 text-sm text-gray-300 transition-opacity duration-200"
      style={{ top: `${position.top}px`, left: `${position.left}px`, opacity: position.opacity }}
    >
      {children}
    </div>
  );
};

export default InfoTooltip;
