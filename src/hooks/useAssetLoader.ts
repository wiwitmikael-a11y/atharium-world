import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
    'Calibrating Chrono-Crystals...',
    'Forging Clockwork Gears...',
    'Awakening Ancient Automatons...',
    'Charting Untamed Wilds...',
    'Deciphering Arcane Tomes...',
    'Raising Faction Banners...',
];

export const useAssetLoader = (assetUrls: string[], shouldLoad: boolean) => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        if (!shouldLoad) {
            // Reset for next time
            setProgress(0);
            setIsLoading(true);
            return;
        }

        const startTime = performance.now();
        const minLoadingTime = 10000; // 10 seconds minimum loading time

        const assets = assetUrls.filter(url => url.endsWith('.png'));
        const totalAssets = assets.length;

        const finishLoading = () => {
            const elapsedTime = performance.now() - startTime;
            const remainingTime = minLoadingTime - elapsedTime;

            setTimeout(() => {
                setIsLoading(false);
            }, Math.max(500, remainingTime)); // Ensure at least a 500ms delay after 100%
        };

        if (totalAssets === 0) {
            finishLoading();
            return;
        }

        let loadedCount = 0;

        const handleLoad = () => {
            loadedCount++;
            const currentProgress = loadedCount / totalAssets;
            setProgress(currentProgress);

            const messageIndex = Math.floor(currentProgress * (LOADING_MESSAGES.length - 1));
            setLoadingMessage(LOADING_MESSAGES[messageIndex]);

            if (loadedCount === totalAssets) {
                finishLoading();
            }
        };

        assets.forEach(url => {
            const img = new Image();
            img.onload = handleLoad;
            img.onerror = handleLoad; // Count errors as "loaded" to not block the game
            img.src = url;
        });

    }, [assetUrls, shouldLoad]);

    return { isLoading, progress, loadingMessage };
};
