import { useEffect, useRef, useCallback } from 'react';

const ZOOM_SENSITIVITY = 0.001;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const PAN_SPEED = 10;

export const useCameraControls = (
  setCamera: React.Dispatch<React.SetStateAction<{ pan: { x: number; y: number; }; zoom: number; }>>,
  zoom: number,
  setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>,
  isInitialized: boolean,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const activePointersRef = useRef(new Map<number, PointerEvent>());
  const lastPinchDistRef = useRef(0);

  const pan = useCallback((dx: number, dy: number) => {
    setCamera(prev => ({ ...prev, pan: { x: prev.pan.x + dx, y: prev.pan.y + dy } }));
  }, [setCamera]);

  useEffect(() => {
    if (!isInitialized) return;
    const handleKeyDown = (e: KeyboardEvent) => keysPressedRef.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysPressedRef.current.delete(e.key.toLowerCase());

    const gameLoop = () => {
      const effectivePanSpeed = PAN_SPEED / zoom;
      let dx = 0; let dy = 0;
      if (keysPressedRef.current.has('w')) dy += effectivePanSpeed;
      if (keysPressedRef.current.has('s')) dy -= effectivePanSpeed;
      if (keysPressedRef.current.has('a')) dx += effectivePanSpeed;
      if (keysPressedRef.current.has('d')) dx -= effectivePanSpeed;

      if (dx !== 0 || dy !== 0) { setIsFollowing(false); pan(dx, dy); }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [pan, zoom, setIsFollowing, isInitialized]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isInitialized) return;

    const getDistance = (pointers: Map<number, PointerEvent>): number => {
        const [p1, p2] = Array.from(pointers.values());
        return Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      activePointersRef.current.set(e.pointerId, e);
      document.body.classList.add('panning-active');
      if (activePointersRef.current.size === 2) {
          lastPinchDistRef.current = getDistance(activePointersRef.current);
      }
    };
    
    const handlePointerMove = (e: PointerEvent) => {
      if (!activePointersRef.current.has(e.pointerId)) return;
      if (activePointersRef.current.size === 1 && (e.movementX !== 0 || e.movementY !== 0)) setIsFollowing(false);
      activePointersRef.current.set(e.pointerId, e);

      if (activePointersRef.current.size === 1) { // Pan
          pan(e.movementX / zoom, e.movementY / zoom);
      } else if (activePointersRef.current.size === 2) { // Pinch-zoom
          e.preventDefault();
          const newDist = getDistance(activePointersRef.current);
          if (lastPinchDistRef.current > 0) {
            const zoomFactor = newDist / lastPinchDistRef.current;
            setCamera(prev => ({ ...prev, zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom * zoomFactor)) }));
          }
          lastPinchDistRef.current = newDist;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
      if (activePointersRef.current.size < 2) lastPinchDistRef.current = 0;
      if (activePointersRef.current.size === 0) document.body.classList.remove('panning-active');
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1 - e.deltaY * ZOOM_SENSITIVITY;
      setCamera(prev => ({ ...prev, zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom * zoomFactor)) }));
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.body.classList.remove('panning-active');
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerUp);
      container.removeEventListener('pointerleave', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, setCamera, pan, setIsFollowing, isInitialized]);

  return containerRef;
};