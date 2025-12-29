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

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;

    const containerSize = container.offsetWidth;
    let initialScale = 1;
    
    if (naturalWidth < naturalHeight) {
      initialScale = containerSize / naturalWidth;
    } else {
      initialScale = containerSize / naturalHeight;
    }

    setImgSize({ width: naturalWidth, height: naturalHeight });
    setScale(initialScale);
    setOffset({ x: 0, y: 0 });
  };

  const handleMove = useCallback((dx: number, dy: number) => {
    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setScale(prevScale => Math.max(0.3, Math.min(prevScale + delta, 6)));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    lastTouchRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!lastTouchRef.current) return;
    handleMove(e.clientX - lastTouchRef.current.x, e.clientY - lastTouchRef.current.y);
    lastTouchRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => { lastTouchRef.current = null; };

  const onWheel = (e: React.WheelEvent) => {
    handleZoom(e.deltaY * -0.001);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      lastDistanceRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouchRef.current) {
      handleMove(e.touches[0].clientX - lastTouchRef.current.x, e.touches[0].clientY - lastTouchRef.current.y);
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && lastDistanceRef.current) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      handleZoom((d - lastDistanceRef.current) * 0.01);
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
    const cropSize = 800; // Premium resolution
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewSize = container.offsetWidth;
    const ratio = cropSize / viewSize;

    ctx.save();
    ctx.clearRect(0, 0, cropSize, cropSize);
    ctx.translate(cropSize / 2, cropSize / 2);
    ctx.scale(scale * ratio, scale * ratio);
    ctx.translate(offset.x / scale, offset.y / scale);
    ctx.drawImage(img, -imgSize.width / 2, -imgSize.height / 2);
    ctx.restore();

    onCrop(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300 touch-none">
      <div className="absolute top-10 left-0 right-0 flex justify-between px-8 z-[510]">
        <button onClick={onCancel} className="text-white text-sm font-black uppercase tracking-widest bg-white/10 px-6 py-3 rounded-2xl">Cancel</button>
        <button onClick={performCrop} className="text-white text-sm font-black uppercase tracking-widest bg-[var(--accent-color)] px-8 py-3 rounded-2xl shadow-xl">Apply</button>
      </div>

      <div className="w-full max-w-sm aspect-square relative flex items-center justify-center" ref={containerRef}>
        <div className="absolute inset-0 z-20 pointer-events-none rounded-full ring-[4000px] ring-black/80 ring-offset-0 border-2 border-white/40" />
        <div 
          className="cursor-move select-none"
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <img
            ref={imgRef} src={imageSrc} onLoad={onImageLoad}
            style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`, maxWidth: 'none', display: 'block' }}
            draggable={false} alt="Cropping Area"
          />
        </div>
      </div>

      <div className="mt-20 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] px-10 text-center animate-pulse">
        Drag to Center • Pinch to Scale
      </div>
    </div>
  );
};

export default AvatarCropper;