import { useState, useCallback, useRef, type MouseEvent, type WheelEvent } from 'react';

export interface CanvasViewport {
  panX: number;
  panY: number;
  zoom: number;
}

export function useCanvasInteraction() {
  const [viewport, setViewport] = useState<CanvasViewport>({ panX: 0, panY: 0, zoom: 1 });
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanning.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setViewport(v => ({ ...v, panX: v.panX + dx, panY: v.panY + dy }));
  }, []);

  const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewport(v => ({ ...v, zoom: Math.max(0.2, Math.min(3, v.zoom * delta)) }));
  }, []);

  const resetViewport = useCallback(() => setViewport({ panX: 0, panY: 0, zoom: 1 }), []);

  return { viewport, setViewport, onMouseDown, onMouseMove, onMouseUp, onWheel, resetViewport };
}
