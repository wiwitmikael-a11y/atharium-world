import React from 'react';

interface LoadingScreenProps {
  progress: number;
  loadingMessage: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, loadingMessage }) => {
  const progressPercent = Math.round(progress * 100);

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <div 
        className="text-center mb-8"
        style={{ animationPlayState: progress < 1 ? 'running' : 'paused' }}
      >
        <h1 className="text-6xl font-cinzel text-cyan-300 mb-2" style={{ textShadow: '0 0 15px rgba(45, 212, 191, 0.5)' }}>ATHARIUM</h1>
        <p className="text-xl text-gray-400">An Ever-Evolving World Simulation</p>
      </div>
      <div className="w-full max-w-2xl px-4">
        <div className="w-full bg-gray-700/50 rounded-full h-4 border border-cyan-500/30">
          <div
            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-center mt-4 text-lg font-cinzel animate-pulse text-gray-300">{loadingMessage}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
