import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Trash2, Grid, Check, X, RotateCcw, Crop, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface AIDocumentPhotoProps {
  currentAvatar: string;
  onChangeAvatar: (url: string) => void;
  showAvatar: boolean;
  onToggleShowAvatar: (show: boolean) => void;
}

export default function AIDocumentPhoto({
  currentAvatar,
  onChangeAvatar,
  showAvatar,
  onToggleShowAvatar,
}: AIDocumentPhotoProps) {
  // Crop & Image states
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Precision Crop Sliders
  const [zoom, setZoom] = useState<number>(1.1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Dragging states on Canvas
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load raw image into an HTMLImageElement
  useEffect(() => {
    if (!rawImage) {
      setImgElement(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = rawImage;
    img.onload = () => {
      setImgElement(img);
      // Automatically enter crop view & reset adjustments
      setZoom(1.1);
      setPanX(0);
      setPanY(0);
      setIsCropping(true);
      setError(null);
    };
    img.onerror = () => {
      setError("图片格式不受支持或加载失败，请更换一张常规 JPG/PNG 格式图片。");
      setRawImage(null);
    };
  }, [rawImage]);

  // Real-time Viewport Render Loop on Canvas (aspect ratio 3:4)
  useEffect(() => {
    if (!canvasRef.current || !imgElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed canvas rendering dimensions (representing standard high-res portrait ratio)
    const targetW = canvas.width;
    const targetH = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, targetW, targetH);

    // Calculate baseline fit-cover dimensions
    const baseScale = Math.max(targetW / imgElement.width, targetH / imgElement.height);
    const drawW = imgElement.width * baseScale;
    const drawH = imgElement.height * baseScale;

    // Apply viewport transformations
    ctx.save();
    ctx.translate(targetW / 2 + panX, targetH / 2 + panY);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imgElement, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Render professional Rule of Thirds guidelines if active
    if (showGrid) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.2;

      // Vertical grid lines
      ctx.beginPath();
      ctx.moveTo(targetW / 3, 0);
      ctx.lineTo(targetW / 3, targetH);
      ctx.moveTo((targetW * 2) / 3, 0);
      ctx.lineTo((targetW * 2) / 3, targetH);

      // Horizontal grid lines
      ctx.moveTo(0, targetH / 3);
      ctx.lineTo(targetW, targetH / 3);
      ctx.moveTo(0, (targetH * 2) / 3);
      ctx.lineTo(targetW, (targetH * 2) / 3);
      ctx.stroke();

      // Draw standard framing corner marks (camera viewfinder look)
      ctx.strokeStyle = "#3b82f6"; // Tailwind blue-500
      ctx.lineWidth = 3;
      const len = 14;

      ctx.beginPath();
      // Top-Left
      ctx.moveTo(0, len); ctx.lineTo(0, 0); ctx.lineTo(len, 0);
      // Top-Right
      ctx.moveTo(targetW - len, 0); ctx.lineTo(targetW, 0); ctx.lineTo(targetW, len);
      // Bottom-Left
      ctx.moveTo(0, targetH - len); ctx.lineTo(0, targetH); ctx.lineTo(len, targetH);
      // Bottom-Right
      ctx.moveTo(targetW - len, targetH); ctx.lineTo(targetW, targetH); ctx.lineTo(targetW, targetH - len);
      ctx.stroke();
    }
  }, [imgElement, zoom, panX, panY, showGrid]);

  // Canvas Interaction: Drag-to-pan & Wheel-to-zoom
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDraggingCanvas(true);
    dragStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCanvas) return;
    e.preventDefault();
    const newPanX = e.clientX - dragStartRef.current.x;
    const newPanY = e.clientY - dragStartRef.current.y;
    setPanX(Math.min(Math.max(newPanX, -300), 300));
    setPanY(Math.min(Math.max(newPanY, -400), 400));
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomStep = 0.05;
    const direction = e.deltaY < 0 ? 1 : -1;
    const newZoom = Math.min(Math.max(zoom + direction * zoomStep, 0.5), 5.0);
    setZoom(parseFloat(newZoom.toFixed(3)));
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDraggingCanvas(true);
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX - panX, y: touch.clientY - panY };
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingCanvas || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newPanX = touch.clientX - dragStartRef.current.x;
    const newPanY = touch.clientY - dragStartRef.current.y;
    setPanX(Math.min(Math.max(newPanX, -300), 300));
    setPanY(Math.min(Math.max(newPanY, -400), 400));
  };

  const handleCanvasTouchEnd = () => {
    setIsDraggingCanvas(false);
  };

  // Handle incoming image file helper
  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过 5MB！");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setRawImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Local file input selection trigger
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Trigger manual crop modal on existing avatar
  const handleRecropExisting = () => {
    if (currentAvatar) {
      setRawImage(currentAvatar);
    }
  };

  // Apply crop in-memory onto a clean output canvas and output to resume state
  const handleApplyCrop = () => {
    if (!imgElement) return;

    // Create high-res offscreen rendering canvas representing 300x400 output
    const outCanvas = document.createElement("canvas");
    outCanvas.width = 300;
    outCanvas.height = 400;
    const ctx = outCanvas.getContext("2d");
    if (!ctx) return;

    const targetW = outCanvas.width;
    const targetH = outCanvas.height;

    const baseScale = Math.max(targetW / imgElement.width, targetH / imgElement.height);
    const drawW = imgElement.width * baseScale;
    const drawH = imgElement.height * baseScale;

    // Render pure image with offsets, WITHOUT grid overlays or frame lines
    ctx.save();
    ctx.translate(targetW / 2 + panX, targetH / 2 + panY);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imgElement, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    try {
      const croppedBase64 = outCanvas.toDataURL("image/jpeg", 0.95);
      onChangeAvatar(croppedBase64);
      setIsCropping(false);
      setRawImage(null);
      setSuccessMsg("证件照裁剪及保存成功！已更新至简历中。");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Canvas export failed:", err);
      setError("由于安全限制，裁剪转换失败。请尝试上传本地文件。");
    }
  };

  // Delete/Clear photo entirely
  const handleDeletePhoto = () => {
    setShowDeleteModal(true);
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setRawImage(null);
  };

  return (
    <div id="document-photo-card" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 transition-all duration-300">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-base">简历证件照</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">在简历中显示照片</span>
          <button
            id="toggle-show-avatar-btn"
            type="button"
            onClick={() => onToggleShowAvatar(!showAvatar)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
              showAvatar ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <motion.span
              layout
              className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs ring-0"
              animate={{ x: showAvatar ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* Main Panel */}
      {!isCropping ? (
        <div className="space-y-4">
          
          {/* Avatar Display Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="relative w-24 h-32 rounded-lg bg-slate-200 border border-slate-200 shadow-inner overflow-hidden flex-shrink-0 flex items-center justify-center">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Avatar Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
                  <Camera className="w-7 h-7" />
                  <span className="text-[10px] font-bold text-slate-400/80">暂无照片</span>
                </div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h4 className="font-bold text-slate-800 text-sm">标准 A4 简历照预览 (3:4)</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[280px] leading-relaxed">
                上传个人真实免冠、商务、或形象照。使用我们内置的高精度微调裁剪器，可自由拉伸对齐，保证人像完美居中。
              </p>
              {!showAvatar && (
                <span className="inline-block mt-2 text-[10px] bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded border border-amber-200">
                  当前处于隐藏照片状态，预览及导出中不会出现照片
                </span>
              )}
            </div>
          </div>

          {/* Upload Dropzone / Action row */}
          {currentAvatar ? (
            <div className="grid grid-cols-3 gap-2.5">
              <button
                id="btn-crop-existing"
                type="button"
                onClick={handleRecropExisting}
                className="py-2 px-3 border border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Crop className="w-3.5 h-3.5" />
                重新裁剪
              </button>
              <button
                id="btn-replace-photo"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                更换照片
              </button>
              <button
                id="btn-delete-photo"
                type="button"
                onClick={handleDeletePhoto}
                className="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                删除照片
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`py-8 border border-dashed rounded-xl flex flex-col items-center justify-center bg-slate-50/40 transition-all ${
                isDragging ? "border-indigo-500 bg-indigo-50/30 scale-[1.01]" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Upload className={`w-8 h-8 mb-2 transition-transform ${isDragging ? "text-indigo-600 scale-110" : "text-slate-400"}`} />
              <p className="text-xs text-slate-700 font-bold mb-1">拖拽或点击上传个人照片</p>
              <p className="text-[10px] text-slate-400 mb-4">支持 JPG、PNG、JPEG 格式，文件小于 5MB</p>
              <button
                id="btn-trigger-upload"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-xs text-slate-700 font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
              >
                选取本地图片
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        /* Interactive Live Crop Studio Workspace */
        <div className="space-y-4 animate-fade-in">
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 flex items-center gap-2 text-xs text-indigo-800">
            <Crop className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold">高精度 3:4 证件照裁剪器：</span>
              <span>拉动下方滑块控制缩放与位置，帮助您的五官居中。</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 justify-center py-2">
            
            {/* Left Column: Canvas Viewer */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative bg-slate-900 rounded-xl p-2.5 shadow-md border-2 border-slate-800">
                <canvas
                  ref={canvasRef}
                  width={180}
                  height={240}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onWheel={handleCanvasWheel}
                  onTouchStart={handleCanvasTouchStart}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasTouchEnd}
                  className={`block bg-slate-950 rounded-lg shadow-inner overflow-hidden max-w-full select-none transition-all ${
                    isDraggingCanvas ? "cursor-grabbing ring-2 ring-indigo-500" : "cursor-grab hover:ring-1 hover:ring-slate-700"
                  }`}
                />
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-xs text-[9px] px-1.5 py-0.5 rounded text-white font-mono uppercase tracking-wide select-none">
                  3:4 Viewport
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                💡 拖拽调整位置，滚轮/双指缩放
              </span>
            </div>

            {/* Right Column: Controls */}
            <div className="flex-1 w-full space-y-5">
              
              {/* Zoom Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">🔍 画面缩放 (Zoom)</span>
                  <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">{zoom.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">0.5x</span>
                  <input
                    id="zoom-slider"
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">5.0x</span>
                </div>
              </div>

              {/* Action Buttons: Align Center & Reset */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  id="btn-center-crop"
                  type="button"
                  onClick={() => {
                    setPanX(0);
                    setPanY(0);
                  }}
                  className="py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  🎯 居中画面
                </button>
                <button
                  id="btn-reset-crop"
                  type="button"
                  onClick={() => {
                    setZoom(1.1);
                    setPanX(0);
                    setPanY(0);
                  }}
                  className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  重置参数
                </button>
              </div>

              {/* Optional Grid Auxiliary Toggle */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500 font-medium">九宫格对齐辅助线</span>
                <button
                  id="btn-toggle-grid"
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition font-semibold cursor-pointer ${
                    showGrid ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  {showGrid ? "显示中" : "已隐藏"}
                </button>
              </div>

            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              id="btn-cancel-crop"
              type="button"
              onClick={handleCancelCrop}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              取消
            </button>
            <button
              id="btn-save-crop"
              type="button"
              onClick={handleApplyCrop}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              应用裁剪并保存
            </button>
          </div>

        </div>
      )}

      {/* Success Notification Message Banner */}
      {successMsg && (
        <div id="photo-success-banner" className="mt-3 p-2.5 bg-green-50 border border-green-100 text-[11px] text-green-700 rounded-xl flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0 text-green-600" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Error Message Banner */}
      {error && (
        <div id="photo-error-banner" className="mt-3 p-2.5 bg-red-50 border border-red-100 text-[11px] text-red-700 rounded-xl flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-bold">操作提示</p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Modern Deletion Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            onClick={() => setShowDeleteModal(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 z-10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3.5">
                <Trash2 className="w-5.5 h-5.5" />
              </div>
              
              <h3 className="text-base font-bold text-slate-900">确认要删除证件照吗？</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                删除后，简历模版中的照片将被彻底清除，需要重新上传或裁剪。
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeAvatar("");
                  setRawImage(null);
                  setIsCropping(false);
                  setShowDeleteModal(false);
                  setSuccessMsg("照片已成功删除");
                  setTimeout(() => setSuccessMsg(null), 2500);
                }}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
