"use client";

import { useEffect, useRef } from "react";

/* ─── Color parser ─── */
function parseColor(color: string): [number, number, number, number] {
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    if (hex.length === 4) hex = hex.split("").map((c) => c + c).join("");
    const r = parseInt(hex.slice(0, 2), 16) || 0;
    const g = parseInt(hex.slice(2, 4), 16) || 0;
    const b = parseInt(hex.slice(4, 6), 16) || 0;
    let a = 1;
    if (hex.length === 8) a = (parseInt(hex.slice(6, 8), 16) || 0) / 255;
    return [r, g, b, a];
  }
  return [242, 202, 80, 1];
}

/* ─── Point ─── */
interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  nx: number;
  ny: number;
}

export function CursorTrail() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ─── Settings ─── */
    const TRAIL_LENGTH = 60;
    const HEAD_WIDTH = 5;
    const TAIL_WIDTH = 1;
    const HEAD_COLOR = parseColor("#f2ca50");
    const TAIL_COLOR = parseColor("#d4af37");
    const DAMPING = 0.6;
    const SPEED_MAX = 600;
    const INERTIA_RETENTION = 0.8;
    const INERTIA_INFLUENCE = 0.3;
    const INERTIA_STRENGTH = 0.025;
    const SPEED_INFLUENCE = 0.9;
    const SPEED_SMOOTHING = 0.2;

    /* ─── State ─── */
    const points: Point[] = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, nx: 0, ny: 0,
    }));
    const leftEdges = Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 }));
    const rightEdges = Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 }));
    const mouse = { x: 0, y: 0 };
    const lastMouse = { x: 0, y: 0 };

    let isActive = false;
    let lastTime = performance.now();
    let currentSpeedRatio = 0;
    let width = 0;
    let height = 0;
    let rafId: number | null = null;
    let isVisible = false;

    const MIN_DIST_SQ = 0.25;

    /* ─── Update rect ─── */
    function updateRect() {
      const rect = wrapper.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ─── Pointer handler ─── */
    function handlePointerMove(e: PointerEvent) {
      const rect = wrapper.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;

      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (!inside) {
        isActive = false;
        return;
      }

      const now = performance.now();

      if (!isActive) {
        isActive = true;
        lastMouse.x = localX;
        lastMouse.y = localY;
        mouse.x = localX;
        mouse.y = localY;
        lastTime = now;
        for (let i = 0; i < TRAIL_LENGTH; i++) {
          points[i].x = localX;
          points[i].y = localY;
          points[i].vx = 0;
          points[i].vy = 0;
        }
        return;
      }

      const dt = Math.max(1, now - lastTime) / 1000;
      const dx = localX - lastMouse.x;
      const dy = localY - lastMouse.y;
      const dist = Math.hypot(dx, dy);
      const speed = dist / dt;
      const speedRatio = Math.min(1, speed / SPEED_MAX);
      currentSpeedRatio += (speedRatio - currentSpeedRatio) * SPEED_SMOOTHING;

      lastMouse.x = localX;
      lastMouse.y = localY;
      lastTime = now;
      mouse.x = localX;
      mouse.y = localY;
    }

    /* ─── Physics ─── */
    function updatePhysics() {
      const speedMult = 1 + SPEED_INFLUENCE * currentSpeedRatio;
      const head = points[0];
      const rawDx = mouse.x - head.x;
      const rawDy = mouse.y - head.y;

      if (
        Math.abs(rawDx) < 0.1 && Math.abs(rawDy) < 0.1 &&
        Math.abs(head.vx) < 0.1 && Math.abs(head.vy) < 0.1
      ) {
        head.x = mouse.x;
        head.y = mouse.y;
        head.vx = 0;
        head.vy = 0;
      } else {
        const pullStrength = DAMPING + 0.1;
        const dx = rawDx * pullStrength;
        const dy = rawDy * pullStrength;
        const wInf = INERTIA_INFLUENCE * speedMult;
        const sInf = INERTIA_STRENGTH * speedMult;
        head.vx = head.vx * INERTIA_RETENTION + dx * wInf;
        head.vy = head.vy * INERTIA_RETENTION + dy * wInf;
        head.x += dx + head.vx * sInf;
        head.y += dy + head.vy * sInf;
      }

      for (let i = 1; i < TRAIL_LENGTH; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const dx = (prev.x - curr.x) * DAMPING;
        const dy = (prev.y - curr.y) * DAMPING;
        curr.vx = curr.vx * INERTIA_RETENTION + dx * INERTIA_INFLUENCE * 2;
        curr.vy = curr.vy * INERTIA_RETENTION + dy * INERTIA_INFLUENCE * 4;
        curr.x += dx + curr.vx * INERTIA_STRENGTH;
        curr.y += dy + curr.vy * INERTIA_STRENGTH;
      }
    }

    /* ─── Edge calculation ─── */
    function calculateEdges() {
      const speedMult = 1 + SPEED_INFLUENCE * currentSpeedRatio;
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const progress = i / (TRAIL_LENGTH - 1);
        const tw = (HEAD_WIDTH * (1 - progress) + TAIL_WIDTH * progress) * speedMult;
        const curr = points[i];
        const next = points[Math.min(i + 1, TRAIL_LENGTH - 1)];
        const prev = points[Math.max(i - 1, 0)];
        let nx = 0, ny = 0;

        if (i === 0) {
          const dx = next.x - curr.x;
          const dy = next.y - curr.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.5) { nx = -dy / d; ny = dx / d; }
        } else if (i === TRAIL_LENGTH - 1) {
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.5) { nx = -dy / d; ny = dx / d; }
          else { nx = points[i - 1].nx; ny = points[i - 1].ny; }
        } else {
          const dx1 = curr.x - prev.x, dy1 = curr.y - prev.y;
          const dx2 = next.x - curr.x, dy2 = next.y - curr.y;
          const d1 = Math.hypot(dx1, dy1);
          const d2 = Math.hypot(dx2, dy2);
          let nx1 = 0, ny1 = 0, nx2 = 0, ny2 = 0;
          if (d1 > 0.5) { nx1 = -dy1 / d1; ny1 = dx1 / d1; }
          if (d2 > 0.5) { nx2 = -dy2 / d2; ny2 = dx2 / d2; }
          nx = (nx1 + nx2) / 2;
          ny = (ny1 + ny2) / 2;
          const nd = Math.hypot(nx, ny);
          if (nd > 1e-10) { nx /= nd; ny /= nd; }
          else { nx = points[i - 1].nx; ny = points[i - 1].ny; }
        }

        curr.nx = nx;
        curr.ny = ny;
        const hw = tw / 2;
        leftEdges[i].x = curr.x + nx * hw;
        leftEdges[i].y = curr.y + ny * hw;
        rightEdges[i].x = curr.x - nx * hw;
        rightEdges[i].y = curr.y - ny * hw;
      }
    }

    /* ─── Draw ─── */
    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < TRAIL_LENGTH - 1; i++) {
        const p1 = i / (TRAIL_LENGTH - 1);
        const p2 = (i + 1) / (TRAIL_LENGTH - 1);

        const r1 = Math.round(HEAD_COLOR[0] + (TAIL_COLOR[0] - HEAD_COLOR[0]) * p1);
        const g1 = Math.round(HEAD_COLOR[1] + (TAIL_COLOR[1] - HEAD_COLOR[1]) * p1);
        const b1 = Math.round(HEAD_COLOR[2] + (TAIL_COLOR[2] - HEAD_COLOR[2]) * p1);
        const a1 = HEAD_COLOR[3] + (TAIL_COLOR[3] - HEAD_COLOR[3]) * p1;
        const r2 = Math.round(HEAD_COLOR[0] + (TAIL_COLOR[0] - HEAD_COLOR[0]) * p2);
        const g2 = Math.round(HEAD_COLOR[1] + (TAIL_COLOR[1] - HEAD_COLOR[1]) * p2);
        const b2 = Math.round(HEAD_COLOR[2] + (TAIL_COLOR[2] - HEAD_COLOR[2]) * p2);
        const a2 = HEAD_COLOR[3] + (TAIL_COLOR[3] - HEAD_COLOR[3]) * p2;

        const curr = points[i];
        const next = points[i + 1];
        const dx = next.x - curr.x;
        const dy = next.y - curr.y;
        const dSq = dx * dx + dy * dy;

        ctx.beginPath();
        ctx.moveTo(leftEdges[i].x, leftEdges[i].y);
        ctx.lineTo(leftEdges[i + 1].x, leftEdges[i + 1].y);
        ctx.lineTo(rightEdges[i + 1].x, rightEdges[i + 1].y);
        ctx.lineTo(rightEdges[i].x, rightEdges[i].y);
        ctx.closePath();

        if (dSq > MIN_DIST_SQ) {
          const grad = ctx.createLinearGradient(curr.x, curr.y, next.x, next.y);
          grad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, ${a1})`);
          grad.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, ${a2})`);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = `rgba(${r1}, ${g1}, ${b1}, ${a1})`;
        }
        ctx.fill();
      }
    }

    /* ─── Tick ─── */
    function tick() {
      if (!isVisible) return;
      updatePhysics();
      calculateEdges();
      draw();
      rafId = requestAnimationFrame(tick);
    }

    /* ─── Intersection observer ─── */
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          updateRect();
          if (!rafId) {
            lastTime = performance.now();
            tick();
          }
        } else {
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }
      },
      { threshold: 0 },
    );
    io.observe(wrapper);

    /* ─── Resize observer ─── */
    const ro = new ResizeObserver(() => updateRect());
    ro.observe(wrapper);

    /* ─── Events ─── */
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });

    updateRect();

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", updateRect);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
