"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// ── Kimi Conveyor Belt v3.1 ───────────────────────────────────────
// Fixed: all books now have cover colors. Midnight navy background.
// ────────────────────────────────────────────────────────────────────

const BOOKS = [
  { title: "The Great Gatsby", author: "Fitzgerald", cover: "#1e3a5f", accent: "#fbbf24", art: "deco", foil: true },
  { title: "1984", author: "Orwell", cover: "#7f1d1d", accent: "#fca5a5", art: "eye", foil: false },
  { title: "To Kill a Mockingbird", author: "Lee", cover: "#14532d", accent: "#86efac", art: "bird", foil: true },
  { title: "Pride and Prejudice", author: "Austen", cover: "#581c87", accent: "#e9d5ff", art: "floral", foil: true },
  { title: "The Catcher in the Rye", author: "Salinger", cover: "#9a3412", accent: "#fdba74", art: "wheat", foil: false },
  { title: "Brave New World", author: "Huxley", cover: "#0e7490", accent: "#a5f3fc", art: "dna", foil: false },
  { title: "Moby Dick", author: "Melville", cover: "#1e40af", accent: "#bfdbfe", art: "whale", foil: true },
  { title: "The Hobbit", author: "Tolkien", cover: "#3f6212", accent: "#d9f99d", art: "ring", foil: true },
  { title: "Dune", author: "Herbert", cover: "#92400e", accent: "#fde68a", art: "spice", foil: false },
  { title: "Neuromancer", author: "Gibson", cover: "#be185d", accent: "#fbcfe8", art: "matrix", foil: false },
  { title: "Slaughterhouse-Five", author: "Vonnegut", cover: "#475569", accent: "#cbd5e1", art: "diamond", foil: true },
  { title: "The Road", author: "McCarthy", cover: "#334155", accent: "#94a3b8", art: "tree", foil: false },
  { title: "Frankenstein", author: "Shelley", cover: "#164e63", accent: "#67e8f9", art: "bolt", foil: true },
  { title: "Dracula", author: "Stoker", cover: "#450a0a", accent: "#f87171", art: "bat", foil: true },
  { title: "The Odyssey", author: "Homer", cover: "#0369a1", accent: "#7dd3fc", art: "wave2", foil: true },
];

function drawCoverArt(ctx, art, x, y, w, h, accent) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  switch (art) {
    case "deco":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.2, y + h * 0.25);
      ctx.lineTo(x + w * 0.5, y + h * 0.15);
      ctx.lineTo(x + w * 0.8, y + h * 0.25);
      ctx.lineTo(x + w * 0.8, y + h * 0.55);
      ctx.lineTo(x + w * 0.5, y + h * 0.65);
      ctx.lineTo(x + w * 0.2, y + h * 0.55);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w * 0.5, y + h * 0.15);
      ctx.lineTo(x + w * 0.5, y + h * 0.65);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    case "eye":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h * 0.42, w * 0.22, h * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.42, w * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case "bird":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.25, y + h * 0.5);
      ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.25, x + w * 0.5, y + h * 0.4);
      ctx.quadraticCurveTo(x + w * 0.6, y + h * 0.25, x + w * 0.75, y + h * 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    case "floral":
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const fx = x + w / 2 + Math.cos(angle) * w * 0.12;
        const fy = y + h * 0.42 + Math.sin(angle) * h * 0.08;
        ctx.beginPath();
        ctx.arc(fx, fy, w * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.42, w * 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case "wheat":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 4; i++) {
        const wx = x + w * 0.25 + i * w * 0.17;
        ctx.beginPath();
        ctx.moveTo(wx, y + h * 0.65);
        ctx.quadraticCurveTo(wx + w * 0.03, y + h * 0.35, wx + w * 0.06, y + h * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(wx + w * 0.06, y + h * 0.3, w * 0.025, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    case "dna":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 4; i++) {
        const dy = y + h * 0.25 + i * h * 0.12;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, dy);
        ctx.lineTo(x + w * 0.7, dy + h * 0.06);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.7, dy);
        ctx.lineTo(x + w * 0.3, dy + h * 0.06);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    case "whale":
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(x + w * 0.55, y + h * 0.45, w * 0.2, h * 0.08, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + w * 0.35, y + h * 0.42);
      ctx.lineTo(x + w * 0.28, y + h * 0.32);
      ctx.lineTo(x + w * 0.38, y + h * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case "ring":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.42, w * 0.14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.42, w * 0.08, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    case "spice":
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(x + w * 0.2 + (i % 3) * w * 0.25, y + h * 0.3 + Math.floor(i / 3) * h * 0.2, w * 0.04, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    case "matrix":
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.35;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if ((r + c) % 2 === 0) {
            ctx.fillRect(x + w * 0.2 + c * w * 0.2, y + h * 0.25 + r * h * 0.15, w * 0.12, h * 0.08);
          }
        }
      }
      ctx.globalAlpha = 1;
      break;
    case "diamond":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h * 0.22);
      ctx.lineTo(x + w * 0.75, y + h * 0.42);
      ctx.lineTo(x + w / 2, y + h * 0.62);
      ctx.lineTo(x + w * 0.25, y + h * 0.42);
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    case "tree":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h * 0.65);
      ctx.lineTo(x + w / 2, y + h * 0.45);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h * 0.45 + i * h * 0.06);
        ctx.lineTo(x + w * 0.3 - i * w * 0.02, y + h * 0.38 + i * h * 0.04);
        ctx.moveTo(x + w / 2, y + h * 0.45 + i * h * 0.06);
        ctx.lineTo(x + w * 0.7 + i * w * 0.02, y + h * 0.38 + i * h * 0.04);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    case "bolt":
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.45, y + h * 0.22);
      ctx.lineTo(x + w * 0.6, y + h * 0.42);
      ctx.lineTo(x + w * 0.5, y + h * 0.42);
      ctx.lineTo(x + w * 0.55, y + h * 0.62);
      ctx.lineTo(x + w * 0.4, y + h * 0.42);
      ctx.lineTo(x + w * 0.5, y + h * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case "bat":
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h * 0.3);
      ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.2, x + w * 0.2, y + h * 0.35);
      ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.5, x + w / 2, y + h * 0.45);
      ctx.quadraticCurveTo(x + w * 0.7, y + h * 0.5, x + w * 0.8, y + h * 0.35);
      ctx.quadraticCurveTo(x + w * 0.65, y + h * 0.2, x + w / 2, y + h * 0.3);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case "wave2":
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      for (let wx = 0; wx < w * 0.65; wx += 1) {
        const wy = y + h * 0.42 + Math.sin(wx * 0.12) * h * 0.1;
        if (wx === 0) ctx.moveTo(x + w * 0.18 + wx, wy);
        else ctx.lineTo(x + w * 0.18 + wx, wy);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
  }
  ctx.restore();
}

export default function Conveyor({
  speed = 0.85,
  bookHeight = 88,
  gap = 20,
  className = "",
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const booksRef = useRef([]);
  const timeRef = useRef(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const containerRef = useRef(null);

  const initBooks = useCallback(
    (width) => {
      const bookWidth = 54;
      const space = bookWidth + gap;
      const count = Math.ceil(width / space) + 6;

      booksRef.current = Array.from({ length: count }, (_, i) => {
        const b = BOOKS[i % BOOKS.length];
        return {
          ...b,
          x: i * space + Math.random() * 8,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.35 + Math.random() * 0.5,
          wobbleAmp: 0.6 + Math.random() * 1.2,
          tilt: (Math.random() - 0.5) * 3.5,
          scale: 0.97 + Math.random() * 0.06,
          shadowOff: 1.5 + Math.random() * 2,
          speedVar: 0.97 + Math.random() * 0.06,
          breathePhase: Math.random() * Math.PI * 2,
        };
      });
    },
    [gap]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const w = rect.width;
      const h = bookHeight + 32;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      setDims({ w, h });
      initBooks(w);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [bookHeight, initBooks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    const ctx = canvas.getContext("2d");
    const bookW = 54;
    const space = bookW + gap;
    const beltY = dims.h / 2;

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.clearRect(0, 0, dims.w, dims.h);

      // ── Background: Deep midnight navy with warm center glow ──
      const bgGrad = ctx.createRadialGradient(
        dims.w / 2, beltY, 0,
        dims.w / 2, beltY, dims.w * 0.7
      );
      bgGrad.addColorStop(0, "#1a2744");
      bgGrad.addColorStop(0.5, "#111827");
      bgGrad.addColorStop(1, "#0B1120");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, dims.w, dims.h);

      // ── Sleek thin belt ──
      const beltGrad = ctx.createLinearGradient(0, beltY - 4, 0, beltY + 4);
      beltGrad.addColorStop(0, "#1e293b");
      beltGrad.addColorStop(0.5, "#334155");
      beltGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = beltGrad;
      ctx.fillRect(0, beltY - 3, dims.w, 6);

      // Moving texture
      ctx.strokeStyle = "rgba(148, 163, 184, 0.06)";
      ctx.lineWidth = 0.7;
      const off = (t * speed * 45) % 14;
      for (let tx = -14; tx < dims.w + 14; tx += 14) {
        ctx.beginPath();
        ctx.moveTo(tx - off, beltY - 2);
        ctx.lineTo(tx - off - 4, beltY + 2);
        ctx.stroke();
      }

      // Thin rails
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, beltY - 5, dims.w, 1.2);
      ctx.fillRect(0, beltY + 3.8, dims.w, 1.2);

      // ── Ambient shelf glow beneath belt ──
      const shelfGlow = ctx.createRadialGradient(
        dims.w / 2, beltY + 8, 0,
        dims.w / 2, beltY + 8, dims.w * 0.4
      );
      shelfGlow.addColorStop(0, "rgba(251, 191, 36, 0.04)");
      shelfGlow.addColorStop(1, "rgba(251, 191, 36, 0)");
      ctx.fillStyle = shelfGlow;
      ctx.fillRect(0, beltY + 4, dims.w, 20);

      // ── Books ──
      booksRef.current.forEach((book) => {
        book.x -= speed * book.speedVar;
        if (book.x < -bookW - 10) {
          book.x = dims.w + 10;
          book.wobblePhase = Math.random() * Math.PI * 2;
          book.tilt = (Math.random() - 0.5) * 3.5;
        }

        const wobble = Math.sin(t * book.wobbleSpeed + book.wobblePhase) * book.wobbleAmp;
        const breathe = Math.sin(t * 0.7 + book.breathePhase) * 0.012;
        const y = beltY - bookHeight / 2 + wobble;
        const currentScale = book.scale + breathe;

        ctx.save();
        ctx.translate(book.x + bookW / 2, y + bookHeight / 2);
        ctx.rotate((book.tilt * Math.PI) / 180);
        ctx.scale(currentScale, currentScale);

        // Soft shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(1.5, bookHeight / 2 + 5, bookW * 0.52, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // ── Book cover ──
        const r = 3.5;
        const bx = -bookW / 2;
        const by = -bookHeight / 2;

        // Main cover
        ctx.fillStyle = book.cover || "#334155";
        roundRect(ctx, bx, by, bookW, bookHeight, r);
        ctx.fill();

        // Cover inner border (embossed feel)
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 0.8;
        roundRect(ctx, bx + 2.5, by + 2.5, bookW - 5, bookHeight - 5, r - 1);
        ctx.stroke();

        // Cover art
        drawCoverArt(ctx, book.art, bx + 4, by + 7, bookW - 8, bookHeight - 30, book.accent);

        // Gold foil stamp (top accent)
        if (book.foil) {
          ctx.fillStyle = "#fbbf24";
          ctx.globalAlpha = 0.85;
          ctx.fillRect(bx + bookW * 0.25, by + 5, bookW * 0.5, 1.5);
          ctx.globalAlpha = 1;
        }

        // Title
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = '600 5.5px "Inter", system-ui, sans-serif';
        ctx.textAlign = "center";
        const words = book.title.split(" ");
        if (words.length <= 2) {
          ctx.fillText(book.title, 0, by + bookHeight - 15);
        } else {
          const mid = Math.ceil(words.length / 2);
          ctx.fillText(words.slice(0, mid).join(" "), 0, by + bookHeight - 18);
          ctx.fillText(words.slice(mid).join(" "), 0, by + bookHeight - 11);
        }
        ctx.restore();

        // Author
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.font = '4px "Inter", system-ui, sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(book.author, 0, by + bookHeight - 4);

        // ── Spine (left) ──
        ctx.fillStyle = shadeColor(book.cover || "#334155", -12);
        ctx.fillRect(bx, by, 4, bookHeight);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(bx + 0.5, by, 0.8, bookHeight);

        // ── Pages (right) ──
        ctx.fillStyle = "#f5f2ec";
        roundRectRight(ctx, bx + bookW - 3.5, by + 0.8, 3, bookHeight - 1.6, 1);
        ctx.fill();
        ctx.fillStyle = "#e8e4dc";
        ctx.fillRect(bx + bookW - 2.2, by + 0.8, 0.8, bookHeight - 1.6);

        // Page lines texture
        ctx.strokeStyle = "rgba(0,0,0,0.04)";
        ctx.lineWidth = 0.4;
        for (let py = by + 3; py < by + bookHeight - 3; py += 2.5) {
          ctx.beginPath();
          ctx.moveTo(bx + bookW - 3.2, py);
          ctx.lineTo(bx + bookW - 1.5, py);
          ctx.stroke();
        }

        // ── Gloss overlay ──
        const sheen = ctx.createLinearGradient(bx, by, bx + bookW, by + bookHeight);
        sheen.addColorStop(0, "rgba(255,255,255,0.1)");
        sheen.addColorStop(0.25, "rgba(255,255,255,0.02)");
        sheen.addColorStop(0.5, "rgba(255,255,255,0)");
        sheen.addColorStop(0.75, "rgba(0,0,0,0.03)");
        sheen.addColorStop(1, "rgba(0,0,0,0.08)");
        ctx.fillStyle = sheen;
        roundRect(ctx, bx, by, bookW, bookHeight, r);
        ctx.fill();

        // Top highlight
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(bx + 2, by, bookW - 4, 0.7);

        ctx.restore();
      });

      // ── Vignette ──
      const vig = ctx.createRadialGradient(
        dims.w / 2, beltY, dims.w * 0.3,
        dims.w / 2, beltY, dims.w * 0.7
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.2)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, dims.w, dims.h);

      // ── Floating warm motes ──
      ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
      for (let d = 0; d < 8; d++) {
        const dx = ((t * 6 + d * 97) % (dims.w + 50)) - 25;
        const dy = beltY + Math.sin(t * 0.4 + d * 1.3) * 14 - 8;
        const ds = 0.6 + Math.sin(t * 0.8 + d * 2) * 0.3;
        ctx.beginPath();
        ctx.arc(dx, dy, ds, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dims, speed, gap, bookHeight]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl ${className}`}
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #111827 50%, #0f172a 100%)",
        boxShadow: "inset 0 1px 16px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.4)",
      }}
    >
      {/* Warm top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-5 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(251,191,36,0.04) 0%, transparent 100%)",
        }}
      />
      <canvas
        ref={canvasRef}
        className="block w-full"
        style={{ imageRendering: "auto" }}
      />
      <div className="absolute bottom-1.5 right-3 flex items-center gap-1.5 opacity-25">
        <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[9px] tracking-[0.3em] text-amber-100/40 font-mono uppercase">
          kimi
        </span>
      </div>
    </div>
  );
}

// ── Helpers ──
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectRight(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

function shadeColor(color, percent) {
  if (!color || typeof color !== "string") return "#334155";
  const num = parseInt(color.replace("#", ""), 16);
  if (isNaN(num)) return "#334155";
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}