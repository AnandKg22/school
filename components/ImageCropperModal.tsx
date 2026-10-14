"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move } from "lucide-react";

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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width; // 360px
    ctx.clearRect(0, 0, size, size);

    // Save context
    ctx.save();

    // Move to center
    ctx.translate(size / 2 + position.x, size / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Calculate dimensions to fit inside 360x360 while maintaining aspect ratio
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

  // Reset transforms when a new image is loaded
  useEffect(() => {
    if (imageSrc && isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        draw();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, isOpen, draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setScale((prev) => Math.min(Math.max(0.8, prev + delta), 3.5));
  };

  // Perform Final Crop to high-resolution square/circle
  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const outputCanvas = document.createElement("canvas");
    const outputSize = 320; // 320x320 high-res avatar
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, outputSize, outputSize);

    ctx.save();
    // Center & transform
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
              Drag to reposition, use slider to zoom in or out
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Viewport */}
        <div className="p-6 flex flex-col items-center bg-slate-100 dark:bg-slate-950/80 select-none">
          <div
            className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Underlying Canvas */}
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Circular Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 360 360">
                <defs>
                  <mask id="crop-circle-mask">
                    <rect width="360" height="360" fill="white" />
                    <circle cx="180" cy="180" r="140" fill="black" />
                  </mask>
                </defs>
                <rect
                  width="360"
                  height="360"
                  fill="rgba(15, 23, 42, 0.65)"
                  mask="url(#crop-circle-mask)"
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

            {/* Drag helper hint */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-[10px] flex items-center gap-1 pointer-events-none">
              <Move className="w-3 h-3 text-blue-400" />
              <span>Drag to center</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500 w-10 text-right">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Action Tools & Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Rotate</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
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
