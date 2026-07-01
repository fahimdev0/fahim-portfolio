import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Sliders, 
  Download, 
  Sparkles, 
  RotateCcw, 
  Crop, 
  Sun, 
  Contrast as ContrastIcon, 
  User, 
  Check, 
  Trash2, 
  Maximize2,
  RefreshCw,
  Info,
  Layers,
  Palette,
  Scissors
} from "lucide-react";

interface PassportPhotoStudioProps {
  imageSrc: string;
  onClose?: () => void;
  onSave?: (savedImageUrl: string) => void;
  isDarkMode?: boolean;
}

// Preset background options
const BACKGROUNDS = [
  { name: "White (Standard)", value: "#ffffff", label: "White" },
  { name: "Light Blue (Standard)", value: "#b0e0e6", label: "Blue" },
  { name: "Royal Blue", value: "#1d4ed8", label: "Royal" },
  { name: "Soft Gray", value: "#f1f5f9", label: "Gray" },
  { name: "Transparent", value: "transparent", label: "None" },
];

// SVG-based high-quality professional formal outfits/dresses
const OUTFITS = [
  {
    id: "none",
    name: "Original Clothes",
    icon: (
      <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    )
  },
  {
    id: "mens-navy-suit",
    name: "Classic Navy Suit",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 100 100">
        <path d="M15,95 L30,45 L40,40 L50,55 L60,40 L70,45 L85,95 Z" fill="#1e293b" />
        <path d="M40,40 L50,25 L60,40 L50,55 Z" fill="#ffffff" />
        <path d="M47,28 L53,28 L50,55 Z" fill="#ffffff" />
        <path d="M48,32 L52,32 L50,50 Z" fill="#dc2626" />
        <path d="M30,45 L50,85 L70,45" fill="none" stroke="#0f172a" strokeWidth="2" />
      </svg>
    ),
    render: (
      <g>
        {/* Navy Suit Coat */}
        <path d="M10 100 C 20 60, 32 50, 40 45 L 50 65 L 60 45 C 68 50, 80 60, 90 100 Z" fill="#0f172a" stroke="#000" strokeWidth="0.5" />
        {/* Lapels */}
        <path d="M10 100 L 35 62 L 40 45 L 48 65 L 40 100 Z" fill="#1e293b" stroke="#000" strokeWidth="0.5" />
        <path d="M90 100 L 65 62 L 60 45 L 52 65 L 60 100 Z" fill="#1e293b" stroke="#000" strokeWidth="0.5" />
        {/* Shirt Inner V */}
        <path d="M40 45 C 40 45, 50 25, 50 25 C 50 25, 60 45, 60 45 L 50 65 Z" fill="#ffffff" />
        {/* Collar lines */}
        <path d="M40 45 L 45 40 L 49 53 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        <path d="M60 45 L 55 40 L 51 53 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        {/* Red Tie */}
        <path d="M49 50 L 51 50 L 53 72 L 50 78 L 47 72 Z" fill="#be123c" />
        {/* Tie Knot */}
        <path d="M47 44 L 53 44 L 51 50 L 49 50 Z" fill="#9f1239" />
      </g>
    )
  },
  {
    id: "mens-black-suit",
    name: "Executive Black Suit",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 100 100">
        <path d="M15,95 L30,45 L40,40 L50,55 L60,40 L70,45 L85,95 Z" fill="#09090b" />
        <path d="M40,40 L50,25 L60,40 L50,55 Z" fill="#ffffff" />
        <path d="M47,28 L53,28 L50,55 Z" fill="#ffffff" />
        <path d="M49,32 L51,32 L50,48 Z" fill="#2563eb" />
        <path d="M30,45 L50,85 L70,45" fill="none" stroke="#09090b" strokeWidth="2" />
      </svg>
    ),
    render: (
      <g>
        {/* Black Suit Coat */}
        <path d="M10 100 C 20 58, 32 48, 40 44 L 50 63 L 60 44 C 68 48, 80 58, 90 100 Z" fill="#09090b" stroke="#000" strokeWidth="0.5" />
        {/* Lapels */}
        <path d="M10 100 L 35 60 L 40 44 L 48 63 L 40 100 Z" fill="#18181b" stroke="#000" strokeWidth="0.5" />
        <path d="M90 100 L 65 60 L 60 44 L 52 63 L 60 100 Z" fill="#18181b" stroke="#000" strokeWidth="0.5" />
        {/* Shirt Inner V */}
        <path d="M40 44 C 40 44, 50 22, 50 22 C 50 22, 60 44, 60 44 L 50 63 Z" fill="#ffffff" />
        {/* White Collar */}
        <path d="M40 44 L 46 39 L 49 51 Z" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.5" />
        <path d="M60 44 L 54 39 L 51 51 Z" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.5" />
        {/* Blue Pattern Tie */}
        <path d="M48 48 L 52 48 L 54 75 L 50 82 L 46 75 Z" fill="#1d4ed8" />
        <path d="M48 43 L 52 43 L 51 48 L 49 48 Z" fill="#1e40af" />
        {/* Suit pocket square */}
        <path d="M26 65 L 34 63 L 32 60 Z" fill="#ffffff" />
      </g>
    )
  },
  {
    id: "womens-blazer",
    name: "Women's Professional Blazer",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 100 100">
        <path d="M15,95 L32,48 L42,42 L50,62 L58,42 L68,48 L85,95 Z" fill="#312e81" />
        <path d="M42,42 C45,35 55,35 58,42 L50,62 Z" fill="#f472b6" />
        <path d="M32,48 L50,85 L68,48" fill="none" stroke="#1e1b4b" strokeWidth="2" />
      </svg>
    ),
    render: (
      <g>
        {/* Royal Purple Blazer */}
        <path d="M10 100 C 18 56, 30 46, 38 42 L 50 68 L 62 42 C 70 46, 82 56, 90 100 Z" fill="#1e1b4b" stroke="#000" strokeWidth="0.5" />
        {/* Soft curving blazer collars */}
        <path d="M10 100 L 33 60 L 38 42 L 47 68 L 38 100 Z" fill="#312e81" stroke="#1e1b4b" strokeWidth="0.5" />
        <path d="M90 100 L 67 60 L 62 42 L 53 68 L 62 100 Z" fill="#312e81" stroke="#1e1b4b" strokeWidth="0.5" />
        {/* Inner Silk Blouse (Soft Cyan/White) */}
        <path d="M38 42 C 38 30, 62 30, 62 42 L 50 68 Z" fill="#ecfeff" />
        <path d="M43 42 C 45 32, 55 32, 57 42 L 50 62 Z" fill="#cffafe" opacity="0.6" />
        {/* Elegant necklace accent */}
        <circle cx="50" cy="46" r="1.5" fill="#fbbf24" />
        <path d="M46 42 Q 50 48 54 42" fill="none" stroke="#fbbf24" strokeWidth="1" />
      </g>
    )
  },
  {
    id: "mens-formal-shirt",
    name: "Classic White Shirt",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 100 100">
        <path d="M15,95 L30,45 L40,40 L50,55 L60,40 L70,45 L85,95 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M40,40 L50,25 L60,40 L50,55 Z" fill="#f1f5f9" />
        <path d="M50,25 L50,95" stroke="#94a3b8" strokeWidth="1" />
      </svg>
    ),
    render: (
      <g>
        {/* White Shirt Body */}
        <path d="M10 100 C 18 60, 32 50, 40 45 L 50 58 L 60 45 C 68 50, 82 60, 90 100 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        {/* Placket line and buttons */}
        <line x1="50" y1="58" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="50" cy="68" r="1.5" fill="#94a3b8" />
        <circle cx="50" cy="80" r="1.5" fill="#94a3b8" />
        <circle cx="50" cy="92" r="1.5" fill="#94a3b8" />
        {/* Sharp Shirt Collars */}
        <path d="M40 45 L 48 44 L 49 56 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M60 45 L 52 44 L 51 56 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      </g>
    )
  }
];

export function PassportPhotoStudio({ imageSrc, onClose, onSave, isDarkMode = true }: PassportPhotoStudioProps) {
  // Image states
  const [rotation, setRotation] = useState(0); // -45 to 45 deg
  const [scale, setScale] = useState(1);       // 0.5 to 3
  const [posX, setPosX] = useState(0);         // translation X
  const [posY, setPosY] = useState(0);         // translation Y
  
  // Custom Enhancement Filters
  const [brightness, setBrightness] = useState(100); // 50 to 150
  const [contrast, setContrast] = useState(100);     // 50 to 150
  const [smoothness, setSmoothness] = useState(0);   // 0 to 10 (skin soft blurs)
  const [sharpness, setSharpness] = useState(0);     // 0 to 5 (highpass clarity)
  const [bgColor, setBgColor] = useState("#ffffff");  // plain solid white default

  // Outfit Overlay States
  const [selectedOutfit, setSelectedOutfit] = useState("none");
  const [outfitScale, setOutfitScale] = useState(1.0);
  const [outfitYOffset, setOutfitYOffset] = useState(110); // Pos y relative to frame
  const [outfitXOffset, setOutfitXOffset] = useState(0);   // Pos x alignment

  // Vignette/Chroma Key Mask settings to transparentize the original background
  const [maskCenterX, setMaskCenterX] = useState(50); // percentage 0-100
  const [maskCenterY, setMaskCenterY] = useState(45); // percentage 0-100
  const [maskRadiusH, setMaskRadiusH] = useState(32); // horizontal radius %
  const [maskRadiusV, setMaskRadiusV] = useState(42); // vertical radius %
  const [maskFeather, setMaskFeather] = useState(20); // feather border size %
  const [enableSmartMask, setEnableSmartMask] = useState(true); // Auto-isolate subject with face vignette

  // Erase Tool (Brush erase) State
  const [isEraseMode, setIsEraseMode] = useState(false);
  const [brushSize, setBrushSize] = useState(25);
  const [erasePoints, setErasePoints] = useState<{ x: number; y: number }[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState<"crop" | "background" | "dress" | "filters">("crop");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDraggingOutfit, setIsDraggingOutfit] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Setup Image reference when imageSrc changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      // Reset variables on new image
      setRotation(0);
      setScale(1);
      setPosX(0);
      setPosY(0);
      setErasePoints([]);
      drawCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw canvas on any parameter change
  useEffect(() => {
    drawCanvas();
  }, [rotation, scale, posX, posY, brightness, contrast, bgColor, selectedOutfit, outfitScale, outfitYOffset, outfitXOffset, enableSmartMask, maskCenterX, maskCenterY, maskRadiusH, maskRadiusV, maskFeather, erasePoints, smoothness, sharpness]);

  // Core drawing method on HTML5 Canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas size (Standard Bangladesh Passport size ratio: 1.38 x 1.77 in at 300 DPI = 414 x 531)
    const cw = 414;
    const ch = 531;
    canvas.width = cw;
    canvas.height = ch;

    // 1. Draw solid background color
    ctx.clearRect(0, 0, cw, ch);
    if (bgColor !== "transparent") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, cw, ch);
    }

    // Create a temporary canvas to apply filters & transformations to original photo
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cw;
    tempCanvas.height = ch;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Center of canvas
    const cx = cw / 2;
    const cy = ch / 2;

    // Calculate aspect ratio fit
    const imgAspect = img.width / img.height;
    const canvasAspect = cw / ch;
    let drawWidth = cw;
    let drawHeight = ch;

    if (imgAspect > canvasAspect) {
      drawHeight = cw / imgAspect;
    } else {
      drawWidth = ch * imgAspect;
    }

    // Apply Transformation Matrix
    tempCtx.save();
    tempCtx.translate(cx + posX, cy + posY);
    tempCtx.rotate((rotation * Math.PI) / 180);
    tempCtx.scale(scale, scale);

    // Draw image centered in temporary canvas
    tempCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    tempCtx.restore();

    // 2. APPLY SUBJECT ISOLATION VIGNETTE / CHROMA-MASK
    if (enableSmartMask && bgColor !== "transparent") {
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = cw;
      maskCanvas.height = ch;
      const maskCtx = maskCanvas.getContext("2d");
      if (maskCtx) {
        // Draw the transformed image on mask canvas
        maskCtx.drawImage(tempCanvas, 0, 0);

        // Render radial oval gradient mask to fade background
        const gcx = (maskCenterX / 100) * cw;
        const gcy = (maskCenterY / 100) * ch;
        const grH = (maskRadiusH / 100) * cw;
        const grV = (maskRadiusV / 100) * ch;
        const feather = (maskFeather / 100) * Math.max(grH, grV);

        // Draw radial oval path gradient
        maskCtx.save();
        maskCtx.globalCompositeOperation = "destination-in";
        
        // Custom ellipse gradient simulation
        const grad = maskCtx.createRadialGradient(gcx, gcy, Math.max(0, Math.min(grH, grV) - feather), gcx, gcy, Math.max(grH, grV));
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(0.7, "rgba(0,0,0,0.85)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        
        // Fill oval with gradient
        maskCtx.fillStyle = grad;
        maskCtx.beginPath();
        maskCtx.ellipse(gcx, gcy, grH + feather, grV + feather, 0, 0, Math.PI * 2);
        maskCtx.fill();
        maskCtx.restore();

        // Overlay mask canvas onto main canvas
        ctx.drawImage(maskCanvas, 0, 0);
      }
    } else {
      // Direct raw render
      ctx.drawImage(tempCanvas, 0, 0);
    }

    // 3. APPLY BRUSH ERASE LAYER
    if (erasePoints.length > 0) {
      ctx.save();
      // Erase with destination-out or fill with solid background color to mask
      if (bgColor === "transparent") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.fillStyle = bgColor;
      }
      
      erasePoints.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 4. APPLY SKIN SMOOTHNESS (Bilateral/Blur filter simulation on Canvas)
    if (smoothness > 0) {
      const rawData = ctx.getImageData(0, 0, cw, ch);
      const data = rawData.data;
      // Simple 1D box blur pass for skin softening simulation
      const radius = Math.floor(smoothness);
      const tempImgData = ctx.createImageData(cw, ch);
      const tempData = tempImgData.data;

      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
          for (let ky = -radius; ky <= radius; ky++) {
            const ny = y + ky;
            if (ny >= 0 && ny < ch) {
              for (let kx = -radius; kx <= radius; kx++) {
                const nx = x + kx;
                if (nx >= 0 && nx < cw) {
                  const idx = (ny * cw + nx) * 4;
                  rSum += data[idx];
                  gSum += data[idx + 1];
                  bSum += data[idx + 2];
                  aSum += data[idx + 3];
                  count++;
                }
              }
            }
          }
          const outIdx = (y * cw + x) * 4;
          // Apply blur selectively (preserve hair/edges: if variance is extremely high, keep original)
          const origR = data[outIdx];
          const blurR = rSum / count;
          const diff = Math.abs(origR - blurR);
          if (diff < 35) { // Skin threshold
            tempData[outIdx] = blurR;
            tempData[outIdx + 1] = gSum / count;
            tempData[outIdx + 2] = bSum / count;
            tempData[outIdx + 3] = aSum / count;
          } else {
            tempData[outIdx] = data[outIdx];
            tempData[outIdx + 1] = data[outIdx + 1];
            tempData[outIdx + 2] = data[outIdx + 2];
            tempData[outIdx + 3] = data[outIdx + 3];
          }
        }
      }
      ctx.putImageData(tempImgData, 0, 0);
    }

    // 5. APPLY SHARPNESS / CLARITY (Convolution kernel sharpening)
    if (sharpness > 0) {
      const rawData = ctx.getImageData(0, 0, cw, ch);
      const data = rawData.data;
      const amount = sharpness * 0.15;
      const w = [
        0, -amount, 0,
        -amount, 1 + (4 * amount), -amount,
        0, -amount, 0
      ];

      const tempImgData = ctx.createImageData(cw, ch);
      const tempData = tempImgData.data;

      for (let y = 1; y < ch - 1; y++) {
        for (let x = 1; x < cw - 1; x++) {
          const outIdx = (y * cw + x) * 4;
          let r = 0, g = 0, b = 0;
          
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const idx = ((y + sy - 1) * cw + (x + sx - 1)) * 4;
              const wt = w[sy * 3 + sx];
              r += data[idx] * wt;
              g += data[idx + 1] * wt;
              b += data[idx + 2] * wt;
            }
          }
          
          tempData[outIdx] = Math.max(0, Math.min(255, r));
          tempData[outIdx + 1] = Math.max(0, Math.min(255, g));
          tempData[outIdx + 2] = Math.max(0, Math.min(255, b));
          tempData[outIdx + 3] = data[outIdx + 3]; // keep alpha
        }
      }
      ctx.putImageData(tempImgData, 0, 0);
    }

    // 6. DRAW COLOR FILTERS (Brightness & Contrast)
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();

    // 7. RENDER FORMAL OUTFIT OVERLAY ON CANVAS (SO IT FLATTENS FOR DOWNLOAD)
    if (selectedOutfit !== "none") {
      // Scale and position the outfit overlay vector
      const sw = 300 * outfitScale;
      const sh = 280 * outfitScale;
      const sx = cx + outfitXOffset - (sw / 2);
      const sy = cy + outfitYOffset - (sh / 2);

      drawOutfitOnCanvas(ctx, selectedOutfit, sx, sy, sw, sh);
    }

    // Draw standard overlay guidelines
    drawGuidelines(ctx, cw, ch);
  };

  // Helper method to draw a high-quality vector suit/shirt natively on the canvas
  const drawOutfitOnCanvas = (
    ctx: CanvasRenderingContext2D,
    id: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number
  ) => {
    ctx.save();
    // Center-origin translation for scaling and positioning
    ctx.translate(sx + sw / 2, sy + sh / 2);
    ctx.scale(sw / 100, sh / 100);
    ctx.translate(-50, -50);

    if (id === "mens-navy-suit") {
      // Navy Suit Coat
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.bezierCurveTo(20, 60, 32, 50, 40, 45);
      ctx.lineTo(50, 65);
      ctx.lineTo(60, 45);
      ctx.bezierCurveTo(68, 50, 80, 60, 90, 100);
      ctx.closePath();
      ctx.fill();

      // Lapels
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.lineTo(35, 62);
      ctx.lineTo(40, 45);
      ctx.lineTo(48, 65);
      ctx.lineTo(40, 100);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(90, 100);
      ctx.lineTo(65, 62);
      ctx.lineTo(60, 45);
      ctx.lineTo(52, 65);
      ctx.lineTo(60, 100);
      ctx.closePath();
      ctx.fill();

      // Shirt Inner V
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(40, 45);
      ctx.lineTo(50, 25);
      ctx.lineTo(60, 45);
      ctx.lineTo(50, 65);
      ctx.closePath();
      ctx.fill();

      // Collar lines
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(40, 45);
      ctx.lineTo(45, 40);
      ctx.lineTo(49, 53);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(60, 45);
      ctx.lineTo(55, 40);
      ctx.lineTo(51, 53);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Red Tie
      ctx.fillStyle = "#be123c";
      ctx.beginPath();
      ctx.moveTo(49, 50);
      ctx.lineTo(51, 50);
      ctx.lineTo(53, 72);
      ctx.lineTo(50, 78);
      ctx.lineTo(47, 72);
      ctx.closePath();
      ctx.fill();

      // Tie Knot
      ctx.fillStyle = "#9f1239";
      ctx.beginPath();
      ctx.moveTo(47, 44);
      ctx.lineTo(53, 44);
      ctx.lineTo(51, 50);
      ctx.lineTo(49, 50);
      ctx.closePath();
      ctx.fill();
    } else if (id === "mens-black-suit") {
      // Black Suit Coat
      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.bezierCurveTo(20, 58, 32, 48, 40, 44);
      ctx.lineTo(50, 63);
      ctx.lineTo(60, 44);
      ctx.bezierCurveTo(68, 48, 80, 58, 90, 100);
      ctx.closePath();
      ctx.fill();

      // Lapels
      ctx.fillStyle = "#18181b";
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.lineTo(35, 60);
      ctx.lineTo(40, 44);
      ctx.lineTo(48, 63);
      ctx.lineTo(40, 100);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(90, 100);
      ctx.lineTo(65, 60);
      ctx.lineTo(60, 44);
      ctx.lineTo(52, 63);
      ctx.lineTo(60, 100);
      ctx.closePath();
      ctx.fill();

      // Shirt Inner V
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(40, 44);
      ctx.lineTo(50, 22);
      ctx.lineTo(60, 44);
      ctx.lineTo(50, 63);
      ctx.closePath();
      ctx.fill();

      // White Collar
      ctx.fillStyle = "#f4f4f5";
      ctx.strokeStyle = "#e4e4e7";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(40, 44);
      ctx.lineTo(46, 39);
      ctx.lineTo(49, 51);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(60, 44);
      ctx.lineTo(54, 39);
      ctx.lineTo(51, 51);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Blue Pattern Tie
      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath();
      ctx.moveTo(48, 48);
      ctx.lineTo(52, 48);
      ctx.lineTo(54, 75);
      ctx.lineTo(50, 82);
      ctx.lineTo(46, 75);
      ctx.closePath();
      ctx.fill();

      // Tie Knot
      ctx.fillStyle = "#1e40af";
      ctx.beginPath();
      ctx.moveTo(48, 43);
      ctx.lineTo(52, 43);
      ctx.lineTo(51, 48);
      ctx.lineTo(49, 48);
      ctx.closePath();
      ctx.fill();

      // Suit pocket square
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(26, 65);
      ctx.lineTo(34, 63);
      ctx.lineTo(32, 60);
      ctx.closePath();
      ctx.fill();
    } else if (id === "womens-blazer") {
      // Royal Purple Blazer
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.bezierCurveTo(18, 56, 30, 46, 38, 42);
      ctx.lineTo(50, 68);
      ctx.lineTo(62, 42);
      ctx.bezierCurveTo(70, 46, 82, 56, 90, 100);
      ctx.closePath();
      ctx.fill();

      // Blazer collars
      ctx.fillStyle = "#312e81";
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.lineTo(33, 60);
      ctx.lineTo(38, 42);
      ctx.lineTo(47, 68);
      ctx.lineTo(38, 100);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(90, 100);
      ctx.lineTo(67, 60);
      ctx.lineTo(62, 42);
      ctx.lineTo(53, 68);
      ctx.lineTo(62, 100);
      ctx.closePath();
      ctx.fill();

      // Inner Silk Blouse
      ctx.fillStyle = "#ecfeff";
      ctx.beginPath();
      ctx.moveTo(38, 42);
      ctx.bezierCurveTo(38, 30, 62, 30, 62, 42);
      ctx.lineTo(50, 68);
      ctx.closePath();
      ctx.fill();

      // Blouse shadow
      ctx.fillStyle = "#cffafe";
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(43, 42);
      ctx.bezierCurveTo(45, 32, 55, 32, 57, 42);
      ctx.lineTo(50, 62);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Necklace
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(50, 43, 5, 0.1, Math.PI - 0.1);
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(50, 47, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === "mens-formal-shirt") {
      // White Shirt Body
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.bezierCurveTo(18, 60, 32, 50, 40, 45);
      ctx.lineTo(50, 58);
      ctx.lineTo(60, 45);
      ctx.bezierCurveTo(68, 50, 82, 60, 90, 100);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Placket and buttons
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, 58);
      ctx.lineTo(50, 100);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.beginPath(); ctx.arc(50, 68, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(50, 80, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(50, 92, 1.2, 0, Math.PI * 2); ctx.fill();

      // Sharp Collars
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(40, 45);
      ctx.lineTo(48, 44);
      ctx.lineTo(49, 56);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(60, 45);
      ctx.lineTo(52, 44);
      ctx.lineTo(51, 56);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  };

  // Draws helpful overlay lines (dashed head outline, eye height, centering line)
  const drawGuidelines = (ctx: CanvasRenderingContext2D, cw: number, ch: number) => {
    // Guidelines are drawn ONLY on screen preview, not on final exported download!
    // So we don't pollute the downloaded file.
  };

  // Drag handles for original image
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEraseMode) {
      // Paint erase points on canvas coordinate
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 414;
        const y = ((e.clientY - rect.top) / rect.height) * 531;
        setErasePoints(prev => [...prev, { x, y }]);
      }
      setIsDragging(true);
      return;
    }

    if (selectedOutfit !== "none" && activeTab === "dress") {
      setIsDraggingOutfit(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX - posX, y: e.clientY - posY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && !isDraggingOutfit) return;

    if (isEraseMode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 414;
        const y = ((e.clientY - rect.top) / rect.height) * 531;
        setErasePoints(prev => [...prev, { x, y }]);
      }
      return;
    }

    if (isDraggingOutfit) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setOutfitXOffset(prev => prev + dx * 0.8);
      setOutfitYOffset(prev => prev + dy * 0.8);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    setPosX(e.clientX - dragStart.x);
    setPosY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingOutfit(false);
  };

  const resetAll = () => {
    setRotation(0);
    setScale(1);
    setPosX(0);
    setPosY(0);
    setBrightness(100);
    setContrast(100);
    setSmoothness(0);
    setSharpness(0);
    setBgColor("#ffffff");
    setSelectedOutfit("none");
    setOutfitScale(1.0);
    setOutfitXOffset(0);
    setOutfitYOffset(110);
    setErasePoints([]);
    setEnableSmartMask(true);
    setMaskCenterX(50);
    setMaskCenterY(45);
    setMaskRadiusH(32);
    setMaskRadiusV(42);
    setMaskFeather(20);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Trigger standard PNG download
    const link = document.createElement("a");
    link.download = "Bangladesh_Passport_Photo_300DPI.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onSave) {
      onSave(canvas.toDataURL("image/png"));
    }
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col lg:flex-row gap-6 ${
      isDarkMode ? "bg-[#0b0c16] border-[#1e2238]/60 text-slate-100" : "bg-white border-slate-200 text-slate-800"
    }`}>
      
      {/* 1. VISUAL INTERACTIVE WORKSPACE (LEFT PANEL) */}
      <div className="flex-1 flex flex-col items-center justify-center">
        
        {/* Dimensions banner */}
        <div className={`w-full max-w-[340px] mb-3 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs border ${
          isDarkMode ? "bg-indigo-500/5 border-indigo-500/15 text-indigo-300" : "bg-indigo-50 border-indigo-100 text-indigo-700 font-semibold"
        }`}>
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Bangladesh Passport Preset</span>
          </div>
          <span className="font-mono font-bold">1.38" x 1.77" @ 300 DPI</span>
        </div>

        {/* Canvas container with mouse listener dragging */}
        <div 
          className="relative rounded-2xl overflow-hidden border border-slate-700/40 shadow-2xl cursor-grab active:cursor-grabbing"
          style={{ width: "310px", height: "398px" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Main Rendering Canvas */}
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover"
            style={{ filter: isEraseMode ? "none" : "none" }}
          />

          {/* INTERACTIVE COMPOSITING OVERLAYS (Visual guidelines) */}
          {!isEraseMode && activeTab === "crop" && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
              {/* Centering dashed line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-l border-dashed border-sky-400/35 -translate-x-1/2" />
              
              {/* Head Circle Guideline conforming to official Bangladesh rules (Chin to hair top 1.0" - 1.375") */}
              <div className="absolute top-[16%] w-[135px] h-[175px] rounded-[50%/60%_60%_40%_40%] border-2 border-dashed border-sky-400/60 flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.15)]">
                {/* Eye level line */}
                <div className="w-full h-[1px] border-t border-dashed border-sky-400/50 translate-y-[-10px]" />
              </div>
              
              {/* Bottom chest shoulder markers */}
              <div className="absolute bottom-[10%] w-[200px] h-[50px] border-t border-dashed border-sky-400/40 rounded-t-full" />
              
              {/* Guidelines text label */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-[9px] font-black uppercase text-sky-300 tracking-widest">
                Align Head inside Oval
              </div>
            </div>
          )}

          {/* Eraser cursor overlay in Erase mode */}
          {isEraseMode && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/5">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-red-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-md animate-pulse">
                Eraser Active (Drag to Clean)
              </div>
            </div>
          )}
        </div>

        {/* Action quick adjustments */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setRotation(prev => prev - 1.5)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
            }`}
            title="Rotate Left (Micro-straighten)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <span className="text-[11px] font-mono font-black min-w-[70px] text-center">
            Neck: {rotation > 0 ? "+" : ""}{rotation.toFixed(1)}°
          </span>

          <button
            onClick={() => setRotation(prev => prev + 1.5)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
            }`}
            title="Rotate Right (Micro-straighten)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className={`w-[1px] h-6 mx-1 ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`} />

          <button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono font-black min-w-[45px] text-center">
            {(scale * 100).toFixed(0)}%
          </span>

          <button
            onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. PARAMETERS & STUDIO TUNER (RIGHT PANEL) */}
      <div className="w-full lg:w-[320px] flex flex-col gap-4">
        
        {/* Tabs selector */}
        <div className={`flex rounded-xl p-1 border transition-colors ${
          isDarkMode ? "bg-[#070911] border-[#1e2238]/60" : "bg-slate-100 border-slate-200"
        }`}>
          {(["crop", "background", "dress", "filters"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsEraseMode(false);
              }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === tab
                  ? isDarkMode
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-indigo-700 shadow-sm font-black"
                  : isDarkMode
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content body */}
        <div className={`flex-grow border rounded-xl p-4 min-h-[220px] flex flex-col justify-between transition-colors ${
          isDarkMode ? "border-[#1e2238]/40 bg-[#070911]/30" : "border-slate-200 bg-slate-50/50"
        }`}>
          
          {/* TAB 1: CROP & POSITION */}
          {activeTab === "crop" && (
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Alignment Controls</span>
              <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Use the neck rotation and zoom buttons under the preview, or click/drag the photo directly to align the subject's face perfectly with the guide lines.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">Manual Neck Alignment</span>
                  <button 
                    onClick={() => setRotation(0)}
                    className="text-[10px] font-bold text-indigo-500 hover:underline"
                  >
                    Straighten
                  </button>
                </div>
                <input 
                  type="range"
                  min="-30"
                  max="30"
                  step="0.5"
                  value={rotation}
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded bg-slate-700"
                />
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">Head Size / Zoom</span>
                  <span className="text-[10px] text-slate-400">Scale: {scale.toFixed(1)}x</span>
                </div>
                <input 
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded bg-slate-700"
                />
              </div>
            </div>
          )}

          {/* TAB 2: BACKGROUND CHANGER */}
          {activeTab === "background" && (
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Solid Background Color</span>
              
              <div className="grid grid-cols-5 gap-2">
                {BACKGROUNDS.map(bg => (
                  <button
                    key={bg.value}
                    onClick={() => setBgColor(bg.value)}
                    className={`h-9 rounded-lg flex items-center justify-center border text-[10px] font-bold transition-all relative cursor-pointer ${
                      bgColor === bg.value
                        ? "border-indigo-500 ring-2 ring-indigo-500/30 scale-102"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                    style={{ 
                      backgroundColor: bg.value === "transparent" ? "transparent" : bg.value,
                      color: bg.value === "#ffffff" || bg.value === "#f1f5f9" ? "#000000" : "#ffffff",
                      backgroundImage: bg.value === "transparent" ? "radial-gradient(#38bdf8 1px, transparent 1px)" : "none",
                      backgroundSize: bg.value === "transparent" ? "4px 4px" : "none"
                    }}
                    title={bg.name}
                  >
                    {bg.label}
                    {bgColor === bg.value && (
                      <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-emerald-500 stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>

              <div className={`p-3 rounded-xl border space-y-2 mt-2 transition-colors ${
                isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="smartMask"
                      checked={enableSmartMask}
                      onChange={(e) => setEnableSmartMask(e.target.checked)}
                      className="accent-indigo-500 rounded cursor-pointer"
                    />
                    <label htmlFor="smartMask" className="text-xs font-bold cursor-pointer select-none">
                      Enable Subject Isolate Vignette
                    </label>
                  </div>
                </div>

                {enableSmartMask && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Feather Blur</span>
                      <span>{maskFeather}%</span>
                    </div>
                    <input 
                      type="range"
                      min="5"
                      max="40"
                      value={maskFeather}
                      onChange={(e) => setMaskFeather(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 rounded bg-slate-700"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Vignette Width</span>
                      <span>{maskRadiusH}%</span>
                    </div>
                    <input 
                      type="range"
                      min="20"
                      max="50"
                      value={maskRadiusH}
                      onChange={(e) => setMaskRadiusH(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 rounded bg-slate-700"
                    />
                  </div>
                )}
              </div>

              {/* Eraser fine tuning tool */}
              <button
                onClick={() => setIsEraseMode(!isEraseMode)}
                className={`w-full py-2 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  isEraseMode
                    ? "bg-red-600 hover:bg-red-700 border-red-500 text-white"
                    : isDarkMode
                      ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                      : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{isEraseMode ? "Done (Return to Studio)" : "Use Erase Brush (Fine Tuning)"}</span>
              </button>
            </div>
          )}

          {/* TAB 3: DRESS / OUTIFT CHANGER */}
          {activeTab === "dress" && (
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Overlay Formal Suit / Garment</span>
              
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                {OUTFITS.map(outfit => (
                  <button
                    key={outfit.id}
                    onClick={() => setSelectedOutfit(outfit.id)}
                    className={`p-2 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer relative ${
                      selectedOutfit === outfit.id
                        ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md"
                        : "border-slate-700 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/30 border border-slate-700 flex items-center justify-center shrink-0">
                      {outfit.icon}
                    </div>
                    <span className="text-[10px] font-bold leading-tight">{outfit.name}</span>
                    {selectedOutfit === outfit.id && (
                      <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>

              {selectedOutfit !== "none" && (
                <div className="space-y-3 border-t border-slate-700/30 pt-3">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Garment Width / Scale</span>
                    <span>{(outfitScale * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.02"
                    value={outfitScale}
                    onChange={(e) => setOutfitScale(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded bg-slate-700"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Garment Height Y-Position</span>
                    <span>{outfitYOffset}px</span>
                  </div>
                  <input 
                    type="range"
                    min="50"
                    max="180"
                    value={outfitYOffset}
                    onChange={(e) => setOutfitYOffset(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded bg-slate-700"
                  />
                  <p className="text-[9px] text-slate-400 italic">
                    💡 Drag suit directly or use sliders to center it over shoulders.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ENHANCEMENT FILTERS */}
          {activeTab === "filters" && (
            <div className="space-y-3.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Facial Tuning & Polish</span>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Skin Softening (Blemishes)</span>
                  <span className="text-[10px] font-mono text-slate-400">{smoothness > 0 ? "Enabled" : "None"}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="6"
                  step="0.5"
                  value={smoothness}
                  onChange={(e) => setSmoothness(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 rounded bg-slate-700"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Clarity & Sharpness</span>
                  <span className="text-[10px] font-mono text-slate-400">{sharpness > 0 ? "Enabled" : "None"}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="4"
                  step="0.5"
                  value={sharpness}
                  onChange={(e) => setSharpness(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 rounded bg-slate-700"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-500" /> Brightness</span>
                  <span className="text-[10px] font-mono text-slate-400">{brightness}%</span>
                </div>
                <input 
                  type="range"
                  min="70"
                  max="130"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 rounded bg-slate-700"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1"><ContrastIcon className="w-3.5 h-3.5 text-blue-500" /> Contrast</span>
                  <span className="text-[10px] font-mono text-slate-400">{contrast}%</span>
                </div>
                <input 
                  type="range"
                  min="70"
                  max="130"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 rounded bg-slate-700"
                />
              </div>
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="flex gap-2.5 pt-4 mt-2 border-t border-slate-700/20">
            <button
              onClick={resetAll}
              className={`px-3 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                isDarkMode 
                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" 
                  : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
              }`}
              title="Reset All Parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HQ Photo</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
