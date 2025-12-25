import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AvatarCropperProps {
  imageSrc: string;
  onCrop: (croppedBase64: string) => void;
  onCancel: () => void;
}

const AvatarCropper: React.FC<AvatarCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastDistanceRef = useRef<number | null>(null);

  // Initialize image dimensions and center it
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;

    const containerSize = container.offsetWidth;
    let initialScale = 1;
    
    // Fit image to container at minimum
    if (naturalWidth < naturalHeight) {
      initialScale = containerSize / naturalWidth;
    } else {
      initialScale = containerSize / naturalHeight;
    }

    setImgSize({ width: naturalWidth, height: naturalHeight });
    setScale(initialScale);
    setOffset({ x: 0, y: 0 });
  };

  // Drag logic
  const handleMove = useCallback((dx: number, dy: number) => {
    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  }, []);

  // Zoom logic
  const handleZoom = useCallback((delta: number, centerX: number, centerY: number) => {
    setScale(prevScale => {
      const newScale = Math.max(0.5, Math.min(prevScale + delta, 5));
      return newScale;
    });
  }, []);

  // Mouse Events
  const onMouseDown = (e: React.MouseEvent) => {
    lastTouchRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!lastTouchRef.current) return;
    const dx = e.clientX - lastTouchRef.current.x;
    const dy = e.clientY - lastTouchRef.current.y;
    handleMove(dx, dy);
    lastTouchRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    lastTouchRef.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY * -0.001;
    handleZoom(delta, e.clientX, e.clientY);
  };

  // Touch Events
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastDistanceRef.current = d;
      lastTouchRef.current = null;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouchRef.current) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x;
      const dy = e.touches[0].clientY - lastTouchRef.current.y;
      handleMove(dx, dy);
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && lastDistanceRef.current) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (d - lastDistanceRef.current) * 0.01;
      handleZoom(delta, 0, 0);
      lastDistanceRef.current = d;
    }
  };

  const onTouchEnd = () => {
    lastTouchRef.current = null;
    lastDistanceRef.current = null;
  };

  const performCrop = () => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const canvas = document.createElement('canvas');
    const cropSize = 500; // Output resolution
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The logic: 
    // We want the area currently visible in the circular window
    const viewSize = container.offsetWidth;
    const ratio = cropSize / viewSize;

    // Calculate source rect
    // Centered in the container:
    const centerX = viewSize / 2;
    const centerY = viewSize / 2;

    ctx.save();
    // Draw white background if needed, or transparent
    ctx.clearRect(0, 0, cropSize, cropSize);
    
    // Position context to draw image
    // offset is relative to the center of the container
    ctx.translate(cropSize / 2, cropSize / 2);
    ctx.scale(scale * ratio, scale * ratio);
    ctx.translate(offset.x / scale, offset.y / scale);
    
    // Draw image centered at the translated origin
    ctx.drawImage(img, -imgSize.width / 2, -imgSize.height / 2);
    ctx.restore();

    onCrop(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300 touch-none">
      <div className="absolute top-10 left-0 right-0 flex justify-between px-8 z-50">
        <button onClick={onCancel} className="text-white text-sm font-bold uppercase tracking-widest px-4 py-2 hover:bg-white/10 rounded-xl transition-all">Cancel</button>
        <button onClick={performCrop} className="text-[var(--accent-color)] text-sm font-black uppercase tracking-widest px-6 py-2 bg-white rounded-xl shadow-xl active:scale-95 transition-all">Apply</button>
      </div>

      <div className="w-full max-w-sm aspect-square relative flex items-center justify-center" ref={containerRef}>
        {/* Background Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="w-full h-full border-[100vw] border-black/60 box-content -ml-[100vw] -mt-[100vw] rounded-full"></div>
          {/* Visual Circle Outline */}
          <div className="absolute inset-0 border-2 border-white/30 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
        </div>

        {/* The Image */}
        <div 
          className="cursor-move select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            onLoad={onImageLoad}
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
              maxWidth: 'none',
              display: 'block'
            }}
            draggable={false}
            alt="To crop"
          />
        </div>
      </div>

      <div className="mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] px-10 text-center">
        Drag to reposition • Pinch to zoom
      </div>
    </div>
  );
};

export default AvatarCropper;
