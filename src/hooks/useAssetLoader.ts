import { useState, useEffect } from 'react';

const LORE_MESSAGES = [
    { progress: 0, text: 'Calibrating the Chrono-Crystals...' },
    { progress: 0.15, text: 'Awakening the sleeping Cog-Gods...' },
    { progress: 0.30, text: 'Weaving the threads of causality...' },
    { progress: 0.45, text: 'Recalling whispers from the Great Flux...' },
    { progress: 0.60, text: 'Forging the first Epoch...' },
    { progress: 0.75, text: 'Raising the banners of the First Factions...' },
    { progress: 0.90, text: 'The world of Atharium awaits...' },
];

export const useAssetLoader = (assetUrls: string[], shouldLoad: boolean) => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState(LORE_MESSAGES[0].text);

    useEffect(() => {
        if (!shouldLoad) {
            setProgress(0);
            setIsLoading(true);
            return;
        }

        const minLoadingTime = 10000; // 10 seconds

        // Promise for asset loading
        const assetLoadingPromise = new Promise<void>(resolve => {
            const assets = assetUrls.filter(url => url.endsWith('.png'));
            const totalAssets = assets.length;
            if (totalAssets === 0) {
                resolve();
                return;
            }
            let loadedCount = 0;
            const handleLoad = () => {
                loadedCount++;
                if (loadedCount === totalAssets) {
                    resolve();
                }
            };
            assets.forEach(url => {
                const img = new Image();
                img.onload = handleLoad;
                img.onerror = handleLoad; // Count errors to not block loading
                img.src = url;
            });
        });

        // Promise for minimum time
        const minTimePromise = new Promise<void>(resolve => setTimeout(resolve, minLoadingTime));
        
        // Timer for visual progress and messages
        const startTime = Date.now();
        const visualUpdateInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const currentProgress = Math.min(1, elapsedTime / minLoadingTime);
            
            setProgress(currentProgress);

            const currentMessage = LORE_MESSAGES.slice().reverse().find(m => currentProgress >= m.progress)?.text || LORE_MESSAGES[0].text;
            setLoadingMessage(currentMessage);
            
            if (currentProgress >= 1) {
                clearInterval(visualUpdateInterval);
            }
        }, 50); // Update progress every 50ms for smooth animation

        // Wait for both asset loading and minimum time to complete
        Promise.all([assetLoadingPromise, minTimePromise]).then(() => {
            setProgress(1); // Ensure it's 100%
            setLoadingMessage(LORE_MESSAGES[LORE_MESSAGES.length - 1].text);
            // Add a small final delay for the 100% to be visible
            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        });

        return () => {
            clearInterval(visualUpdateInterval);
        };
    }, [assetUrls, shouldLoad]);

    return { isLoading, progress, loadingMessage };
};