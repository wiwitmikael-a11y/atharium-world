import React, { useState } from 'react';
import { ASSET_PATHS } from '../assets';

interface LoginScreenProps {
    onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin(username.trim());
        }
    };

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden">
            <video
                src={ASSET_PATHS.ui_menu_background_video}
                autoPlay
                muted
                loop
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black/50" />

            <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-4">
                <div className="bg-gray-900/70 backdrop-blur-md p-8 rounded-xl border border-cyan-500/30 shadow-2xl w-full max-w-md pop-in">
                    <h1 className="text-4xl font-cinzel text-cyan-200 mb-2">Welcome to Atharium</h1>
                    <p className="text-gray-400 mb-6">Enter your name to begin your journey.</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-left text-sm font-medium text-gray-300 mb-1">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                                placeholder="Enter your name..."
                                required
                                minLength={3}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label htmlFor="walletAddress" className="block text-left text-sm font-medium text-gray-300 mb-1">
                                Wallet Address
                            </label>
                            <input
                                id="walletAddress"
                                type="text"
                                defaultValue="Blockchain under development"
                                disabled
                                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-400 italic cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full text-xl font-cinzel px-8 py-3 bg-cyan-600/80 border-2 border-cyan-400 rounded-lg shadow-lg text-white hover:bg-cyan-500 hover:shadow-cyan-400/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            disabled={!username.trim() || username.trim().length < 3}
                        >
                            Enter World
                        </button>
                    </form>
                    <div className="mt-6">
                        <p className="text-xs text-white text-right">
                            Alpha Build v1.0
                        </p>
                        <p className="mt-1 text-cyan-300 text-base font-mono copyright-glow text-center">
                            © 2025 Rangga x Atharrazka
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;