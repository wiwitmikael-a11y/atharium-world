import React from 'react';

interface LoadingScreenProps {
  progress: number;
  loadingMessage: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, loadingMessage }) => {
  const progressPercent = Math.round(progress * 100);

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <div className="w-full max-w-lg text-center p-4">
        <h1 className="text-3xl font-cinzel text-cyan-300 mb-4">Entering Atharium...</h1>
        <div className="w-full bg-gray-700 rounded-full h-4 border border-cyan-500/50 shadow-inner">
          <div
            className="bg-cyan-500 h-full rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
        <p className="mt-2 text-2xl font-mono font-bold text-cyan-400">{progressPercent}%</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
