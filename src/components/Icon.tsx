
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

const ICONS: Record<string, React.ReactElement> = {
    'time': <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'epoch': <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'athar': <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />,
    'play': <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />,
    'pause': <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />,
    'mountain': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a.75.75 0 01.75.75v3.375a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75V7.5a.75.75 0 01.75-.75z" />,
    'leaf': <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-2.36-1.325L4 16.5V13.5a3 3 0 013-3h3.53a3 3 0 012.36 1.325l4.376 6.328A3 3 0 0116.5 21h-2.53a3 3 0 01-2.36-1.325L9.53 16.122zM12 11.25a3 3 0 00-3-3H6a3 3 0 00-3 3v3.53a3 3 0 001.325 2.36l4.376 6.328A3 3 0 0010.5 21h2.53a3 3 0 002.36-1.325l4.376-6.328A3 3 0 0018 11.25V9a3 3 0 00-3-3h-2.53a3 3 0 00-2.36 1.325L12 11.25z" />,
    'fire': <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797A8.333 8.333 0 0112 2.25c1.153 0 2.243.3 3.21.832a8.25 8.25 0 01.152 2.132z" />,
    'cube': <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
    'war': <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0-15l-15 15" />,
    'alliance': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l4.5-4.5m0 0l4.5 4.5m-4.5-4.5v11.25m6-11.25l4.5-4.5m0 0l4.5 4.5m-4.5-4.5v11.25" />,
    'user': <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
    'chevron-left': <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />,
    'chevron-right': <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />,
    'help': <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.016H12v-.016z" />,
    'crystal': <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5v2.25l2.25 1.313M12 2.25l-2.25 1.313M12 2.25l2.25 1.313M12 2.25v2.25M12 12l-2.25-1.313M12 12l2.25-1.313M12 12v2.25M12 21.75l-2.25-1.313M12 21.75l2.25-1.313M12 21.75v-2.25M5.25 6.188l-2.25-1.313M5.25 6.188l2.25 1.313M5.25 6.188v2.25M5.25 16.5l-2.25-1.313M5.25 16.5l2.25 1.313M5.25 16.5v2.25m13.5-13.5l2.25-1.313m-2.25 1.313l-2.25 1.313m2.25-1.313v2.25m2.25 10.313l-2.25-1.313m2.25 1.313l2.25 1.313m-2.25-1.313v2.25M12 12l-6.75-3.938m6.75 3.938l-6.75 3.938m6.75-3.938l6.75 3.938m-6.75-3.938l6.75-3.938" />,
    'flag': <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />,
    'briefcase': <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
    'sword': <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 3.75l16.5 16.5M8.25 3l12.75 12.75" transform="rotate(45 12 12) scale(0.8)" />,
    'shield': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />,
    'ring': <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 12a2.25 2.25 0 10-4.5 0 2.25 2.25 0 004.5 0z M21 12c0 3.866-3.134 7-7 7s-7-3.134-7-7 3.134-7 7-7 7 3.134 7 7z" />,
    'checkmark': <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
    'bolt': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
    'heart': <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />,
    'sun': <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />,
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {ICONS[name] || <path />}
    </svg>
);

export default React.memo(Icon);
