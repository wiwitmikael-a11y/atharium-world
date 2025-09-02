import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

const ICONS: Record<string, JSX.Element> = {
    'time': <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'epoch': <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'athar': <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />,
    'play': <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />,
    'pause': <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />,
    'mountain': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a.75.75 0 01.75.75v3.375a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75V7.5a.75.75 0 01.75-.75z" />,
    'leaf': <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-2.36-1.325L4 16.5V13.5a3 3 0 013-3h3.53a3 3 0 012.36 1.325l4.376 6.328A3 3 0 0116.5 21h-2.53a3 3 0 01-2.36-1.325L9.53 16.122zM12 11.25a3 3 0 00-3-3H6a3 3 0 00-3 3v3.53a3 3 0 001.325 2.36l4.376 6.328A3 3 0 0010.5 21h2.53a3 3 0 002.36-1.325l4.376-6.328A3 3 0 0018 11.25V9a3 3 0 00-3-3h-2.53a3 3 0 00-2.36 1.325L12 11.25z" />,
    'fire': <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797A8.333 8.333 0 0112 2.25c1.153 0 2.243.3 3.21.832a8.25 8.25 0 01.152 2.132z" />,
    'cube': <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
    'war': <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 3-3 3m6-6l-3 3 3 3m-8.25 3h13.5" transform="rotate(45 12 12)"/>,
    'alliance': <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.354c-1.29.68-2.82.68-4.11 0a5.952 5.952 0 01-2.4-1.122c-.93-.83-1.5-1.95-1.5-3.132V8.25a2.25 2.25 0 012.25-2.25h8.5a2.25 2.25 0 012.25 2.25v5.85c0 1.182-.57 2.302-1.5 3.132a5.953 5.953 0 01-2.4 1.122zM9.75 12.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" />,
    'user': <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
    'chevron-left': <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />,
    'chevron-right': <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />,
    'gear': <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.008 1.11-1.226.55-.218 1.19-.218 1.74 0 .55.218 1.02.684 1.11 1.226l.09.542c.163.97.583 1.863 1.18 2.61.6 1.122 1.54 1.942 2.67 2.453l.6.268c.55.246.96.76 1.07 1.348.11.586 0 1.21-.32 1.732l-.24.382c-.6 1.122-1.54 1.942-2.67 2.453l-.6.268c-.55.246-.96.76-1.07 1.348-.11.586 0 1.21.32 1.732l.24.382c.24.42.24.94 0 1.36-.24.42-.64.71-1.11.71h-2.83c-.47 0-.87-.29-1.11-.71-.24-.42-.24-.94 0-1.36l.24-.382c.32-.522.43-1.146.32-1.732-.11-.588-.52-1.102-1.07-1.348l-.6-.268c-1.13-.51-2.07-1.33-2.67-2.453-.6-1.122-1.01-2.07-1.18-2.61l-.09-.542c-.09-.542-.56-1.008-1.11-1.226-.55-.218-1.19-.218-1.74 0-.55.218-1.02.684-1.11 1.226l-.09.542c-.163.97-.583 1.863-1.18 2.61-.6 1.122-1.54 1.942-2.67 2.453l-.6.268c-.55.246-.96.76-1.07 1.348-.11.586 0 1.21.32 1.732l.24.382c.24.42.24.94 0 1.36-.24.42-.64.71-1.11.71H3.75c-.47 0-.87-.29-1.11-.71-.24-.42-.24-.94 0-1.36l.24-.382c.32-.522.43-1.146.32-1.732-.11-.588-.52-1.102-1.07-1.348l-.6-.268c-1.13-.51-2.07-1.33-2.67-2.453-.6-1.122-1.01-2.07-1.18-2.61l-.09-.542zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />,
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      {ICONS[name] || <path />}
    </svg>
  );
};

export default Icon;
