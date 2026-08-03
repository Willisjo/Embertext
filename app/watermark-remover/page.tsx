"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eraser,
  Upload,
  Trash2,
  Loader2,
  Sparkles,
  Paintbrush,
  RotateCcw,
  Wand2,
  Undo2,
  Redo2,
  Square,
  Lasso,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Tool = "brush" | "rectangle" | "lasso" | "eraser";

export default function WatermarkRemoverPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"auto" | "manual">("manual");
  const [selectedTool, setSelectedTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(30);
  const [hasMask, setHasMask] = useState(false);
  const [undoHistory, setUndoHistory] = useState<ImageData[]>([]);
  const [redoHistory, setRedoHistory] = useState<ImageData[]>([]);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImageDataRef = useRef<ImageData | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rectStartRef = useRef<{ x: number; y: number } | null>(null);

  // When image loads in <img>, set up canvases
  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!img || !maskCanvas || !overlayCanvas) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    maskCanvas.width = w;
    maskCanvas.height = h;
    overlayCanvas.width = w;
    overlayCanvas.height = h;

    setImgDimensions({ width: w, height: h });

    // Store original image data
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.drawImage(img, 0, 0);
      originalImageDataRef.current = tempCtx.getImageData(0, 0, w, h);
    }

    // Clear canvases
    const maskCtx = maskCanvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");
    maskCtx?.clearRect(0, 0, w, h);
    overlayCtx?.clearRect(0, 0, w, h);

    setHasMask(false);
    setUndoHistory([]);
    setRedoHistory([]);
    setProcessedImage(null);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setOriginalImage(event.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  // Get canvas coordinates from mouse/touch event
  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const img = imgRef.current;
    if (!img) return null;

    const rect = img.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Map from display coords to canvas coords
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Save state for undo
  const saveStateForUndo = () => {
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    if (!maskCanvas || !maskCtx) return;

    const currentState = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    setUndoHistory((prev) => [...prev.slice(-30), currentState]);
    setRedoHistory([]);
  };

  // Redraw overlay from mask
  const redrawMaskOverlay = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    const overlayCtx = overlayCanvas?.getContext("2d");
    if (!maskCtx || !overlayCtx || !maskCanvas || !overlayCanvas) return;

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;

    overlayCtx.fillStyle = "rgba(45, 212, 191, 0.5)";
    for (let i = 0; i < maskData.length; i += 4) {
      if (maskData[i] > 128) {
        const x = (i / 4) % maskCanvas.width;
        const y = Math.floor((i / 4) / maskCanvas.width);
        overlayCtx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  // Draw on mask
  const drawOnMask = useCallback((x: number, y: number, prevX?: number, prevY?: number) => {
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    const overlayCtx = overlayCanvas?.getContext("2d");
    if (!maskCtx || !overlayCtx || !maskCanvas || !overlayCanvas) return;

    if (selectedTool === "brush") {
      maskCtx.fillStyle = "white";
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      maskCtx.fill();

      overlayCtx.fillStyle = "rgba(45, 212, 191, 0.5)";
      overlayCtx.beginPath();
      overlayCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      overlayCtx.fill();

      if (prevX !== undefined && prevY !== undefined) {
        maskCtx.strokeStyle = "white";
        maskCtx.lineWidth = brushSize;
        maskCtx.lineCap = "round";
        maskCtx.beginPath();
        maskCtx.moveTo(prevX, prevY);
        maskCtx.lineTo(x, y);
        maskCtx.stroke();

        overlayCtx.strokeStyle = "rgba(45, 212, 191, 0.5)";
        overlayCtx.lineWidth = brushSize;
        overlayCtx.lineCap = "round";
        overlayCtx.beginPath();
        overlayCtx.moveTo(prevX, prevY);
        overlayCtx.lineTo(x, y);
        overlayCtx.stroke();
      }
    } else if (selectedTool === "eraser") {
      maskCtx.globalCompositeOperation = "destination-out";
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      maskCtx.fill();
      maskCtx.globalCompositeOperation = "source-over";

      overlayCtx.globalCompositeOperation = "destination-out";
      overlayCtx.beginPath();
      overlayCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      overlayCtx.fill();
      overlayCtx.globalCompositeOperation = "source-over";
    }

    setHasMask(true);
  }, [selectedTool, brushSize]);

  // Rectangle drawing
  const drawRectangle = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    const overlayCtx = overlayCanvas?.getContext("2d");
    if (!maskCtx || !overlayCtx || !maskCanvas || !overlayCanvas) return;

    // Redraw existing mask first
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    overlayCtx.fillStyle = "rgba(45, 212, 191, 0.5)";
    for (let i = 0; i < maskData.length; i += 4) {
      if (maskData[i] > 128) {
        const px = (i / 4) % maskCanvas.width;
        const py = Math.floor((i / 4) / maskCanvas.width);
        overlayCtx.fillRect(px, py, 1, 1);
      }
    }

    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);

    // Draw preview on overlay
    overlayCtx.fillStyle = "rgba(45, 212, 191, 0.5)";
    overlayCtx.fillRect(x, y, w, h);
    overlayCtx.strokeStyle = "rgba(45, 212, 191, 0.8)";
    overlayCtx.lineWidth = 3;
    overlayCtx.setLineDash([6, 4]);
    overlayCtx.strokeRect(x, y, w, h);
    overlayCtx.setLineDash([]);

    setHasMask(true);
  }, []);

  // Commit rectangle to mask
  const commitRectangle = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    if (!maskCtx) return;

    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);

    maskCtx.fillStyle = "white";
    maskCtx.fillRect(x, y, w, h);
    redrawMaskOverlay();
  }, [redrawMaskOverlay]);

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    saveStateForUndo();
    isDrawingRef.current = true;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (selectedTool === "rectangle") {
      rectStartRef.current = coords;
    } else {
      lastPointRef.current = coords;
      drawOnMask(coords.x, coords.y);
    }
  }, [getCanvasCoords, selectedTool, drawOnMask]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (selectedTool === "brush" || selectedTool === "eraser") {
      drawOnMask(coords.x, coords.y, lastPointRef.current?.x, lastPointRef.current?.y);
      lastPointRef.current = coords;
    } else if (selectedTool === "rectangle" && rectStartRef.current) {
      drawRectangle(rectStartRef.current.x, rectStartRef.current.y, coords.x, coords.y);
    }
  }, [getCanvasCoords, selectedTool, drawOnMask, drawRectangle]);

  const handlePointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (selectedTool === "rectangle" && isDrawingRef.current && rectStartRef.current) {
      const coords = getCanvasCoords(e);
      if (coords) {
        commitRectangle(rectStartRef.current.x, rectStartRef.current.y, coords.x, coords.y);
      }
    }
    isDrawingRef.current = false;
    lastPointRef.current = null;
    rectStartRef.current = null;
  }, [selectedTool, getCanvasCoords, commitRectangle]);

  useEffect(() => {
    const handleGlobalUp = () => {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      rectStartRef.current = null;
    };
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchend", handleGlobalUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, []);

  // Undo
  const undo = () => {
    if (undoHistory.length === 0) return;
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    if (!maskCanvas || !maskCtx) return;

    const currentState = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    setRedoHistory((prev) => [...prev, currentState]);

    const prevState = undoHistory[undoHistory.length - 1];
    maskCtx.putImageData(prevState, 0, 0);
    setUndoHistory((prev) => prev.slice(0, -1));

    redrawMaskOverlay();

    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    const hasAny = maskData.some((v, i) => i % 4 === 0 && v > 128);
    setHasMask(hasAny);
  };

  // Redo
  const redo = () => {
    if (redoHistory.length === 0) return;
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    if (!maskCanvas || !maskCtx) return;

    const currentState = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    setUndoHistory((prev) => [...prev, currentState]);

    const redoState = redoHistory[redoHistory.length - 1];
    maskCtx.putImageData(redoState, 0, 0);
    setRedoHistory((prev) => prev.slice(0, -1));

    redrawMaskOverlay();
    setHasMask(true);
  };

  // Reset
  const resetMask = () => {
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    const overlayCtx = overlayCanvas?.getContext("2d");

    if (maskCtx && maskCanvas) maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    if (overlayCtx && overlayCanvas) overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    setHasMask(false);
    setUndoHistory([]);
    setRedoHistory([]);
    toast.success("Selection cleared");
  };

  // Get mask array
  const getMaskArray = (): boolean[] => {
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext("2d");
    if (!maskCanvas || !maskCtx) return [];

    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const mask: boolean[] = [];
    for (let i = 0; i < maskData.data.length; i += 4) {
      mask.push(maskData.data[i] > 128);
    }
    return mask;
  };

  // Auto-detect watermark
  const autoDetectWatermark = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!maskCanvas || !overlayCanvas || !originalImageDataRef.current) return;

    const width = originalImageDataRef.current.width;
    const height = originalImageDataRef.current.height;
    const data = originalImageDataRef.current.data;

    const maskCtx = maskCanvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!maskCtx || !overlayCtx) return;

    maskCtx.clearRect(0, 0, width, height);
    overlayCtx.clearRect(0, 0, width, height);

    const maskImageData = maskCtx.createImageData(width, height);
    const maskData = maskImageData.data;
    const blockSize = 10;
    let watermarkPixels = 0;

    for (let by = 0; by < height; by += blockSize) {
      for (let bx = 0; bx < width; bx += blockSize) {
        const blockColors: { r: number; g: number; b: number; a: number }[] = [];
        for (let y = by; y < Math.min(by + blockSize, height); y++) {
          for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
            const idx = (y * width + x) * 4;
            blockColors.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] });
          }
        }

        if (blockColors.length === 0) continue;

        const avgR = blockColors.reduce((s, c) => s + c.r, 0) / blockColors.length;
        const avgG = blockColors.reduce((s, c) => s + c.g, 0) / blockColors.length;
        const avgB = blockColors.reduce((s, c) => s + c.b, 0) / blockColors.length;
        const avgA = blockColors.reduce((s, c) => s + c.a, 0) / blockColors.length;
        const brightness = (avgR + avgG + avgB) / 3;
        const saturation = Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB);

        let isWatermark = false;
        if (avgB > avgR * 1.3 && avgB > avgG * 1.3 && avgB > 120) isWatermark = true;
        if (avgR > 80 && avgB > 130 && avgG < 90) isWatermark = true;
        if (avgG > avgR * 1.1 && avgB > avgR * 1.1 && avgB > 100) isWatermark = true;
        if (avgA < 240 && avgA > 100 && saturation < 30 && brightness > 180) isWatermark = true;

        if (brightness > 230 && saturation < 15 && avgA > 200) {
          let similarCount = 0;
          for (let dy = -3; dy <= 3; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
              const nx = bx + dx * blockSize;
              const ny = by + dy * blockSize;
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
              const nIdx = (ny * width + nx) * 4;
              const nb = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
              if (Math.abs(nb - brightness) < 40) similarCount++;
            }
          }
          if (similarCount >= 12) isWatermark = true;
        }

        if (isWatermark) {
          for (let y = by; y < Math.min(by + blockSize, height); y++) {
            for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
              const idx = (y * width + x) * 4;
              maskData[idx] = 255;
              maskData[idx + 1] = 255;
              maskData[idx + 2] = 255;
              maskData[idx + 3] = 255;
              watermarkPixels++;
            }
          }
        }
      }
    }

    if (watermarkPixels === 0) {
      toast.error("No watermark detected. Try Manual mode.");
      return;
    }

    maskCtx.putImageData(maskImageData, 0, 0);
    redrawMaskOverlay();
    setHasMask(true);
    toast.success(`Detected ${watermarkPixels.toLocaleString()} watermark pixels`);
  }, [redrawMaskOverlay]);

  useEffect(() => {
    if (mode === "auto" && originalImage && imgDimensions.width > 0) {
      autoDetectWatermark();
    }
  }, [mode, originalImage, imgDimensions, autoDetectWatermark]);

  // Expand mask
  const expandMask = (mask: boolean[], width: number, height: number, radius: number): boolean[] => {
    const expanded = new Array(mask.length).fill(false);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!mask[y * width + x]) continue;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              expanded[ny * width + nx] = true;
            }
          }
        }
      }
    }
    return expanded;
  };

  // Inpainting
  const inpaintImage = (data: Uint8ClampedArray, mask: boolean[], width: number, height: number): Uint8ClampedArray => {
    const result = new Uint8ClampedArray(data);
    const filled = new Uint8ClampedArray(mask.length);
    for (let i = 0; i < mask.length; i++) filled[i] = mask[i] ? 0 : 1;

    const maxIterations = Math.min(50, Math.max(width, height) / 2);

    for (let iter = 0; iter < maxIterations; iter++) {
      let changed = false;
      const sampleRadius = Math.min(iter * 2 + 3, 30);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (filled[idx] || !mask[idx]) continue;

          let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0;
          const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

          for (const angle of angles) {
            const rad = (angle * Math.PI) / 180;
            const dx = Math.cos(rad);
            const dy = Math.sin(rad);

            for (let dist = 2; dist <= sampleRadius; dist++) {
              const nx = Math.round(x + dx * dist);
              const ny = Math.round(y + dy * dist);
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

              const nIdx = ny * width + nx;
              if (filled[nIdx] || !mask[nIdx]) {
                const weight = 1 / (dist * dist);
                totalR += result[nIdx * 4] * weight;
                totalG += result[nIdx * 4 + 1] * weight;
                totalB += result[nIdx * 4 + 2] * weight;
                totalWeight += weight;
                break;
              }
            }
          }

          if (totalWeight > 0) {
            result[idx * 4] = Math.min(255, Math.round(totalR / totalWeight));
            result[idx * 4 + 1] = Math.min(255, Math.round(totalG / totalWeight));
            result[idx * 4 + 2] = Math.min(255, Math.round(totalB / totalWeight));
            result[idx * 4 + 3] = 255;
            filled[idx] = 1;
            changed = true;
          }
        }
      }
      if (!changed) break;
    }

    const smoothed = new Uint8ClampedArray(result);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (!mask[idx]) continue;
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = (y + dy) * width + (x + dx);
            totalR += result[nIdx * 4];
            totalG += result[nIdx * 4 + 1];
            totalB += result[nIdx * 4 + 2];
            count++;
          }
        }
        smoothed[idx * 4] = Math.round(totalR / count);
        smoothed[idx * 4 + 1] = Math.round(totalG / count);
        smoothed[idx * 4 + 2] = Math.round(totalB / count);
      }
    }
    return smoothed;
  };

  // Process
  const removeWatermark = async () => {
    if (!originalImage) { toast.error("Please upload an image first"); return; }
    if (!hasMask) { toast.error("Please select the watermark area first"); return; }
    if (!originalImageDataRef.current) { toast.error("Image not loaded properly"); return; }

    setIsProcessing(true);

    const width = originalImageDataRef.current.width;
    const height = originalImageDataRef.current.height;
    const data = new Uint8ClampedArray(originalImageDataRef.current.data);
    const mask = getMaskArray();
    const expandedMask = expandMask(mask, width, height, 5);
    const resultData = inpaintImage(data, expandedMask, width, height);

    const resultCanvas = document.createElement("canvas");
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext("2d");
    if (!resultCtx) { setIsProcessing(false); toast.error("Failed to process image"); return; }

    const resultArray = new Uint8ClampedArray(resultData);
    const resultImageData = new ImageData(resultArray, width, height);
    resultCtx.putImageData(resultImageData, 0, 0);

    setProcessedImage(resultCanvas.toDataURL("image/png"));
    setIsProcessing(false);
    toast.success("Watermark removed successfully!");
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.download = "no-watermark.png";
    link.href = processedImage;
    link.click();
  };

  const handleClear = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setHasMask(false);
    setUndoHistory([]);
    setRedoHistory([]);
    setImgDimensions({ width: 0, height: 0 });
    originalImageDataRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "brush", icon: <Paintbrush className="w-5 h-5" />, label: "Brush" },
    { id: "rectangle", icon: <Square className="w-5 h-5" />, label: "Rectangle" },
    { id: "lasso", icon: <Lasso className="w-5 h-5" />, label: "Lasso" },
    { id: "eraser", icon: <Eraser className="w-5 h-5" />, label: "Eraser" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl p-4 relative"
        >
          {!originalImage ? (
            <label className="flex flex-col items-center justify-center w-full h-[500px] border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-16 h-16 text-muted-foreground mb-4" />
              <span className="text-base font-medium text-muted-foreground mb-1">
                Click to upload image
              </span>
              <span className="text-sm text-muted-foreground/70">
                PNG, JPG, JPEG up to 10MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-5 h-5 text-gray-600" />
              </button>

              <div className="relative rounded-xl overflow-hidden bg-black/5">
                {/* Image */}
                <img
                  ref={imgRef}
                  src={originalImage}
                  alt="Original"
                  onLoad={handleImageLoad}
                  className="w-full h-auto block select-none"
                  draggable={false}
                />

                {/* Mask canvas (hidden, stores mask data) */}
                <canvas ref={maskCanvasRef} className="hidden" />

                {/* Overlay canvas (visible, shows selection) */}
                <canvas
                  ref={overlayCanvasRef}
                  className={cn(
                    "absolute inset-0 w-full h-auto",
                    mode === "manual" ? "cursor-crosshair" : "cursor-default"
                  )}
                  onMouseDown={mode === "manual" ? handlePointerDown : undefined}
                  onMouseMove={mode === "manual" ? handlePointerMove : undefined}
                  onMouseUp={mode === "manual" ? handlePointerUp : undefined}
                  onMouseLeave={mode === "manual" ? handlePointerUp : undefined}
                  onTouchStart={mode === "manual" ? handlePointerDown : undefined}
                  onTouchMove={mode === "manual" ? handlePointerMove : undefined}
                  onTouchEnd={mode === "manual" ? handlePointerUp : undefined}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Right: Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold mb-4">Remove Watermark</h2>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("auto")}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold text-sm transition-all",
                mode === "auto"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25"
                  : "bg-muted hover:bg-accent text-muted-foreground"
              )}
            >
              Automatic
            </button>
            <button
              onClick={() => setMode("manual")}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold text-sm transition-all",
                mode === "manual"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25"
                  : "bg-muted hover:bg-accent text-muted-foreground"
              )}
            >
              Manual Erase
            </button>
          </div>

          {/* Manual Mode Controls */}
          {mode === "manual" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground text-center">
                Good for static logo/text removal
              </p>

              {/* Selection Tool */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Selection Tool</h3>
                <div className="grid grid-cols-4 gap-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                        selectedTool === tool.id
                          ? "bg-primary/10 border-2 border-primary text-primary"
                          : "bg-muted hover:bg-accent text-muted-foreground border-2 border-transparent"
                      )}
                    >
                      {tool.icon}
                      <span className="text-xs font-medium">{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Size</h3>
                  <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {brushSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-teal-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={undo}
                  disabled={undoHistory.length === 0}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors",
                    undoHistory.length > 0
                      ? "bg-muted hover:bg-accent"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Undo2 className="w-4 h-4" />
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={redoHistory.length === 0}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors",
                    redoHistory.length > 0
                      ? "bg-muted hover:bg-accent"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Redo
                  <Redo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={resetMask}
                  disabled={!hasMask}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors",
                    hasMask
                      ? "bg-muted hover:bg-accent"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Auto Mode Info */}
          {mode === "auto" && (
            <div className="text-center py-8">
              {hasMask ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-teal-600" />
                  </div>
                  <p className="text-sm text-teal-600 font-medium">Watermark detected!</p>
                  <button onClick={resetMask} className="text-sm text-muted-foreground hover:text-foreground">
                    Clear and redetect
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Wand2 className="w-8 h-8 text-muted-foreground animate-pulse" />
                  </div>
                  <p className="text-sm text-muted-foreground">Analyzing image for watermarks...</p>
                </div>
              )}
            </div>
          )}

          {/* Remove Button */}
          <button
            onClick={removeWatermark}
            disabled={isProcessing || !hasMask}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all mt-6",
              isProcessing || !hasMask
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:opacity-90 shadow-lg shadow-teal-500/25"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Remove
              </>
            )}
          </button>

          {processedImage && (
            <button
              onClick={downloadImage}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 shadow-lg shadow-green-500/25 mt-3"
            >
              Download Result
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}