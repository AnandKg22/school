"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move, RefreshCw } from "lucide-react";

interface ImageCropperModalProps {
  imageSrc: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export function ImageCropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Use ref for drag tracking to eliminate state lag and dropped moves
  const dragTracker = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width; // 360px
    ctx.clearRect(0, 0, size, size);

    // Save state
    ctx.save();

    // Center and apply position offset, rotation, and scale
    ctx.translate(size / 2 + position.x, size / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Fit image inside 360x360 while preserving natural aspect ratio
    const imgAspect = img.width / img.height;
    let drawW = size;
    let drawH = size;

    if (imgAspect > 1) {
      drawW = size * imgAspect;
    } else {
      drawH = size / imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
  }, [position, rotation, scale]);

  // Load new image source ONLY when modal opens or imageSrc changes
  useEffect(() => {
    if (imageSrc && isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded((prev) => prev + 1);
      };
      img.src = imageSrc;
    } else {
      imageRef.current = null;
    }
  }, [imageSrc, isOpen]);

  // Redraw when transform parameters change or image finishes loading
  useEffect(() => {
    draw();
  }, [draw, imageLoaded]);

  // --- Pointer Event Handlers for Fluid Dragging & Centering ---
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragTracker.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: positionRef.current.x,
      origY: positionRef.current.y,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragTracker.current.active) return;
    const dx = e.clientX - dragTracker.current.startX;
    const dy = e.clientY - dragTracker.current.startY;
    setPosition({
      x: Math.round(dragTracker.current.origX + dx),
      y: Math.round(dragTracker.current.origY + dy),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragTracker.current.active) {
      dragTracker.current.active = false;
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Zoom Helpers
  const handleZoomIn = () => {
    setScale((s) => Math.min(3.5, Number((s + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(0.5, Number((s - 0.15).toFixed(2))));
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((s) => Math.min(3.5, Math.max(0.5, Number((s + delta).toFixed(2)))));
  };

  const handleResetCenter = () => {
    setPosition({ x: 0, y: 0 });
    setScale(1);
    setRotation(0);
  };

  // Perform Final Crop
  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const outputCanvas = document.createElement("canvas");
    const outputSize = 320; // 320x320 high-res avatar
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, outputSize, outputSize);

    ctx.save();
    const factor = outputSize / 360;
    ctx.translate(outputSize / 2 + position.x * factor, outputSize / 2 + position.y * factor);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale * factor, scale * factor);

    const imgAspect = img.width / img.height;
    let drawW = 360;
    let drawH = 360;
    if (imgAspect > 1) {
      drawW = 360 * imgAspect;
    } else {
      drawH = 360 / imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const croppedDataUrl = outputCanvas.toDataURL("image/jpeg", 0.92);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">
              Crop & Position Avatar
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Drag image to center • Use + / - or slider to zoom
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Cropper Viewport */}
        <div className="p-6 flex flex-col items-center bg-slate-100 dark:bg-slate-950/80 select-none">
          <div
            className={`relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center touch-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* Canvas displaying transformed image */}
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Circular Crop Guide Mask */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 360 360">
                <defs>
                  <mask id="crop-circle-mask-v2">
                    <rect width="360" height="360" fill="white" />
                    <circle cx="180" cy="180" r="140" fill="black" />
                  </mask>
                </defs>
                <rect
                  width="360"
                  height="360"
                  fill="rgba(15, 23, 42, 0.65)"
                  mask="url(#crop-circle-mask-v2)"
                />
                <circle
                  cx="180"
                  cy="180"
                  r="140"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
              </svg>
            </div>

            {/* Position & Drag Pill */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] flex items-center gap-1.5 pointer-events-none font-medium backdrop-blur-xs">
              <Move className="w-3 h-3 text-blue-400" />
              <span>
                {isDragging ? "Dragging..." : "Drag to center"} (X:{position.x}, Y:{position.y})
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          {/* Zoom In & Zoom Out Controls */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1.5">
              <span>Zoom Level</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Out Button */}
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-[#E2E8F0] dark:border-slate-700 disabled:opacity-40 transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Zoom Range Slider */}
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />

              {/* Zoom In Button */}
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 3.5}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-[#E2E8F0] dark:border-slate-700 disabled:opacity-40 transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons: Center, Rotate, Presets */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetCenter}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 transition-colors"
                title="Reset position to center"
              >
                <RefreshCw className="w-3 h-3 text-blue-600" />
                <span>Reset Center</span>
              </button>

              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 transition-colors"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3 h-3 text-blue-600" />
                <span>Rotate 90°</span>
              </button>
            </div>

            {/* Save & Cancel */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Apply Crop</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
