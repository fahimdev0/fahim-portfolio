'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
}

interface Spider {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  speed: number;
  legPhase: number;
  legSpeed: number;
  nodeIndex: number;
  isDead?: boolean;
  deathTime?: number;
  deathX?: number;
  deathY?: number;
  isBoss?: boolean;
  maxHp?: number;
  hp?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  alpha: number;
  scale: number;
  vy: number;
}

export function SpiderWeb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const spidersRef = useRef<Spider[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatTextsRef = useRef<FloatText[]>([]);
  const scoreRef = useRef(0);
  const timeRef = useRef(0);

  // Responsive grid structure to make the web dense but perfectly sized
  const buildWeb = useCallback((W: number, H: number) => {
    // Determine grid columns and rows based on viewport size. More columns = denser web
    const isMobile = W < 768;
    const cols = isMobile ? 12 : 20; // 20 columns on desktop makes it denser ("ghono")
    const rows = isMobile ? 10 : 15; // 15 rows on desktop
    const nodes: Node[] = [];

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const bx = (c / cols) * W;
        const by = (r / rows) * H;
        nodes.push({ x: bx, y: by, baseX: bx, baseY: by, vx: 0, vy: 0 });
      }
    }
    return { nodes, cols, rows };
  }, []);

  const spawnSpiders = useCallback((nodes: Node[], count = 6) => {
    const spiders: Spider[] = [];
    for (let i = 0; i < count; i++) {
      const ni = Math.floor(Math.random() * nodes.length);
      // Ensure at least one boss spider exists on initial spawning if count is high, or give a 20% flat chance
      const isInitialBoss = i === 0 && count > 3;
      const rollBoss = isInitialBoss || (Math.random() < 0.20);

      if (rollBoss) {
        spiders.push({
          x: nodes[ni].x,
          y: nodes[ni].y,
          targetX: nodes[ni].x,
          targetY: nodes[ni].y,
          size: 15 + Math.random() * 5, // Extra big red boss!
          speed: 0.28 + Math.random() * 0.35, // Slower deliberate crawler
          legPhase: Math.random() * Math.PI * 2,
          legSpeed: 0.05 + Math.random() * 0.03, // slow rhythmic legs
          nodeIndex: ni,
          isBoss: true,
          maxHp: 3,
          hp: 3,
        });
      } else {
        spiders.push({
          x: nodes[ni].x,
          y: nodes[ni].y,
          targetX: nodes[ni].x,
          targetY: nodes[ni].y,
          size: 5 + Math.random() * 7,
          speed: 0.4 + Math.random() * 0.8,
          legPhase: Math.random() * Math.PI * 2,
          legSpeed: 0.07 + Math.random() * 0.05,
          nodeIndex: ni,
        });
      }
    }
    return spiders;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    let { nodes, cols, rows } = buildWeb(W, H);
    nodesRef.current = nodes;
    
    // Spawn more spiders for desktop for visual richness
    const spiderCount = W < 768 ? 4 : 7;
    spidersRef.current = spawnSpiders(nodesRef.current, spiderCount);

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      const setup = buildWeb(W, H);
      cols = setup.cols;
      rows = setup.rows;
      nodesRef.current = setup.nodes;
      spidersRef.current = spawnSpiders(nodesRef.current, W < 768 ? 4 : 7);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Supporting touch events for mobile/iOS
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e) {
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          return;
        }
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      spidersRef.current.forEach((spider) => {
        if (spider.isDead) return;
        
        // Confirm fading state - do not squish faded spiders in the center
        const centerX = W / 2;
        const centerY = H / 2;
        const isMobile = W < 768;
        const radiusX = isMobile ? W * 0.44 : 350;
        const radiusY = isMobile ? H * 0.32 : 220;
        const distToCenter = Math.hypot((spider.x - centerX) / radiusX, (spider.y - centerY) / radiusY);
        const spiderFade = Math.min(1, Math.max(0, (distToCenter - 0.65) / 0.35));
        if (spiderFade < 0.2) return;

        const distance = Math.hypot(clientX - spider.x, clientY - spider.y);
        const hitRadius = Math.max(32, spider.size * 3.5);

        if (distance < hitRadius) {
          if (spider.isBoss) {
            spider.hp = (spider.hp !== undefined ? spider.hp : 3) - 1;
            
            if (spider.hp > 0) {
              // Boss got hit but not dead!
              // Spark particles around boss
              const sparkColors = ['#f43f5e', '#fda4af', '#fca5a5', '#ffffff'];
              for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.2 + Math.random() * 2.5;
                particlesRef.current.push({
                  x: spider.x,
                  y: spider.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed - 0.5,
                  size: 1.8 + Math.random() * 2.2,
                  alpha: 1.0,
                  color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
                  decay: 0.02 + Math.random() * 0.03
                });
              }

              // Floating indicator for health
              floatTextsRef.current.push({
                x: spider.x,
                y: spider.y - 12,
                text: `💥 BOSS HIT! HP: ${spider.hp}/3`,
                alpha: 1.0,
                scale: 1.15,
                vy: -0.6
              });
              return;
            }
          }

          // Kill spider (normal or if boss hp reaches 0)
          spider.isDead = true;
          spider.deathTime = Date.now();
          spider.deathX = spider.x;
          spider.deathY = spider.y;
          
          const scoreBonus = spider.isBoss ? 10 : 1;
          scoreRef.current += scoreBonus;

          // Cyber splash particles!
          const colors = spider.isBoss 
            ? ['#f43f5e', '#e11d48', '#fda4af', '#be123c', '#fb7185', '#ffffff'] // Boss red splat scheme
            : ['#67e8f9', '#818cf8', '#a5b4fc', '#f43f5e', '#ec4899'];
            
          const particleCount = spider.isBoss ? 35 : 15; // Huge explosion for boss

          for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (spider.isBoss ? 2.5 : 1.8) + Math.random() * (spider.isBoss ? 5.5 : 3.8);
            particlesRef.current.push({
              x: spider.x,
              y: spider.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - (spider.isBoss ? 2.0 : 1.2),
              size: (spider.isBoss ? 3.0 : 2.2) + Math.random() * (spider.isBoss ? 4.0 : 3.2),
              alpha: 1.0,
              color: colors[Math.floor(Math.random() * colors.length)],
              decay: (spider.isBoss ? 0.01 : 0.015) + Math.random() * 0.02
            });
          }

          // Splat text
          const floatOptions = spider.isBoss 
            ? ["💥 BOSS EXTERMINATED! +10", "🔥 RAGE SLAYED! +10", "👑 SUPREME CRASHED! +10"]
            : ["Splat! +1", "BUG DEFEATED", "CLEARED! +1", "SPLATTER", "SQUISHED!", "THREAT CLOSED"];
          const text = floatOptions[Math.floor(Math.random() * floatOptions.length)];
          floatTextsRef.current.push({
            x: spider.x,
            y: spider.y - 12,
            text,
            alpha: 1.0,
            scale: spider.isBoss ? 1.4 : 1.0,
            vy: spider.isBoss ? -1.0 : -0.8
          });
        }
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });

    function drawSpider(ctx: CanvasRenderingContext2D, spider: Spider, time: number) {
      const { x, y, size, legPhase, legSpeed, isDead } = spider;
      const phase = legPhase + time * legSpeed;

      ctx.save();
      ctx.translate(x, y);

      // Spin a bit if dead for cool physics effect
      if (isDead) {
        ctx.rotate((time * 0.05) % (Math.PI * 2));
      }

      // Body glow effect
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.2);
      if (isDead) {
        grad.addColorStop(0, 'rgba(244, 63, 94, 0.25)'); // Rose glow if dead
        grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      } else if (spider.isBoss) {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.35)'); // Red glow for Red Boss!
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else {
        grad.addColorStop(0, 'rgba(129, 140, 248, 0.25)'); // Indigo-blue glow for normal
        grad.addColorStop(1, 'rgba(129, 140, 248, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Legs — 8 legs in 4 pairs
      // If dead, legs curl up tightly (invert their angles and shrink key leg lengths)
      const legPairs = isDead ? [
        { angle: -1.2, length: size * 1.3 },
        { angle: -0.9, length: size * 1.5 },
        { angle: 0.9, length: size * 1.5 },
        { angle: 1.2, length: size * 1.3 },
      ] : [
        { angle: -0.6, length: size * 2.3 },
        { angle: -0.25, length: size * 2.6 },
        { angle: 0.25, length: size * 2.6 },
        { angle: 0.6, length: size * 2.3 },
      ];

      ctx.strokeStyle = isDead 
        ? 'rgba(244, 63, 94, 0.65)' 
        : (spider.isBoss ? 'rgba(239, 68, 68, 0.95)' : 'rgba(129, 140, 248, 0.8)');
      ctx.lineWidth = isDead ? 0.8 : (spider.isBoss ? 1.6 : 1.0);

      legPairs.forEach((pair, i) => {
        [-1, 1].forEach((side) => {
          const baseAngle = pair.angle * side + (side > 0 ? 0 : Math.PI);
          // Don't wiggle legs if dead, just static curl
          const wiggle = isDead ? 0 : Math.sin(phase + i * 0.8) * 0.22 * side;
          const a1 = baseAngle + wiggle;
          const mid = size * 1.2;
          const mx = Math.cos(a1) * mid;
          const my = Math.sin(a1) * mid;
          const a2 = a1 + (side > 0 ? 0.45 : -0.45) + wiggle * 0.4;
          const ex = mx + Math.cos(a2) * (pair.length - mid);
          const ey = my + Math.sin(a2) * (pair.length - mid);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(mx, my, ex, ey);
          ctx.stroke();
        });
      });

      // Abdomen (rear)
      const abdomenGrad = ctx.createRadialGradient(0, size * 0.4, 0, 0, size * 0.4, size * 0.95);
      if (isDead) {
        abdomenGrad.addColorStop(0, '#f42f56'); // Rose splat red
        abdomenGrad.addColorStop(1, '#880e22');
      } else if (spider.isBoss) {
        abdomenGrad.addColorStop(0, '#f87171'); // Boss red-400
        abdomenGrad.addColorStop(1, '#991b1b'); // Boss deep red-800
      } else {
        abdomenGrad.addColorStop(0, '#818cf8'); // Indigo-400
        abdomenGrad.addColorStop(1, '#4f46e5'); // Indigo-600
      }
      ctx.fillStyle = abdomenGrad;
      ctx.beginPath();
      // Squish abdomen if dead
      ctx.ellipse(0, size * 0.4, size * (isDead ? 0.75 : 0.6), size * (isDead ? 0.65 : 0.85), 0, 0, Math.PI * 2);
      ctx.fill();

      // Cephalothorax (head)
      const headGrad = ctx.createRadialGradient(0, -size * 0.2, 0, 0, -size * 0.2, size * 0.55);
      if (isDead) {
        headGrad.addColorStop(0, '#fda4af');
        headGrad.addColorStop(1, '#4c0519');
      } else if (spider.isBoss) {
        headGrad.addColorStop(0, '#fca5a5'); // Red-300
        headGrad.addColorStop(1, '#450a0a'); // Red-950
      } else {
        headGrad.addColorStop(0, '#a5b4fc'); // Indigo-300
        headGrad.addColorStop(1, '#312e81'); // Indigo-950
      }
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.2, size * (isDead ? 0.55 : 0.45), size * (isDead ? 0.45 : 0.5), 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing eyes
      const eyePositions = [-0.18, 0.18];
      eyePositions.forEach((ex) => {
        ctx.fillStyle = isDead 
          ? '#4c0519' 
          : (spider.isBoss ? '#f43f5e' : '#67e8f9'); // red eyes for Boss, cyan for normal
        ctx.beginPath();
        ctx.arc(ex * size, -size * 0.35, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        if (!isDead) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(ex * size + size * 0.03, -size * 0.37, size * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Simple HUD style Health Bar above boss spider's head
      if (spider.isBoss && !isDead && spider.hp !== undefined && spider.maxHp !== undefined) {
        const barW = size * 2.0;
        const barH = 4;
        const barX = -barW / 2;
        const barY = -size * 1.3;

        // Draw background container
        ctx.fillStyle = 'rgba(15, 10, 15, 0.85)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(barX, barY, barW, barH);
        ctx.fill();
        ctx.stroke();

        // Draw active health content
        const hpPercent = spider.hp / spider.maxHp;
        if (hpPercent > 0) {
          ctx.fillStyle = hpPercent > 0.4 ? '#ef4444' : '#f97316';
          ctx.fillRect(barX + 0.5, barY + 0.5, (barW - 1) * hpPercent, barH - 1);
        }
      }

      ctx.restore();
    }

    function drawWeb(
      ctx: CanvasRenderingContext2D,
      nodes: Node[],
      W: number,
      H: number
    ) {
      const centerX = W / 2;
      const centerY = H / 2;
      const isMobile = W < 768;
      // Ellipse bounds to clear the central title text, hacker text, CTA button
      const radiusX = isMobile ? W * 0.44 : 350; // clear a fixed width on desktop or 44% on mobile
      const radiusY = isMobile ? H * 0.32 : 220; // clear a fixed height on desktop or 32% on mobile

      // Reset shadows by default to avoid persistent GPU performance penalties
      ctx.shadowBlur = 0;

      // Beautiful hardware-accelerated dual-stroke rendering helper for optimal performance
      const drawSegment = (
        ax: number,
        ay: number,
        bx: number,
        by: number,
        width: number,
        alpha: number,
        glow: number,
        isDiagonal = false
      ) => {
        if (alpha <= 0.05) return;

        // On mobile, or when there is no direct mouse hover proximity (glow <= 0.15),
        // we use a double-layered stroke to simulate glows. This bypasses the extremely slow shadowBlur parser.
        // On desktop with direct hover interaction, we selectively enable authentic shadowBlur.
        if (glow > 0.15 && !isMobile) {
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.shadowBlur = isDiagonal ? (5 + glow * 10) : (10 + glow * 15);
          ctx.shadowColor = `rgba(129, 140, 248, ${glow * (isDiagonal ? 0.7 : 0.95) * (alpha / (0.35 + glow * 0.5))})`;
          ctx.strokeStyle = isDiagonal ? `rgba(99, 102, 241, ${alpha})` : `rgba(129, 140, 248, ${alpha})`;
          ctx.lineWidth = width;
          ctx.stroke();
          // Reset shadow config
          ctx.shadowBlur = 0;
        } else {
          // Inner glowing neon line (drawn first as a wide semi-transparent buffer)
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = isDiagonal 
            ? `rgba(99, 102, 241, ${alpha * 0.22})` 
            : `rgba(129, 140, 248, ${alpha * 0.26})`;
          ctx.lineWidth = width * (isDiagonal ? 3.0 : 3.5);
          ctx.stroke();

          // Core sharp web strand line on top
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = isDiagonal ? `rgba(99, 102, 241, ${alpha})` : `rgba(129, 140, 248, ${alpha})`;
          ctx.lineWidth = width;
          ctx.stroke();
        }
      };

      // Horizontal lines
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c < cols; c++) {
          const a = nodes[r * (cols + 1) + c];
          const b = nodes[r * (cols + 1) + c + 1];
          if (!a || !b) continue;

          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const distToCenter = Math.hypot((midX - centerX) / radiusX, (midY - centerY) / radiusY);
          const centerFade = Math.min(1, Math.max(0, (distToCenter - 0.5) / 0.5));
          if (centerFade === 0) continue;

          const distToMouse = Math.hypot(
            midX - mouseRef.current.x,
            midY - mouseRef.current.y
          );
          const glow = Math.max(0, 1 - distToMouse / 220);
          const alpha = (0.35 + glow * 0.5) * centerFade;
          const width = (0.85 + glow * 1.2) * centerFade;

          drawSegment(a.x, a.y, b.x, b.y, width, alpha, glow, false);
        }
      }

      // Vertical lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const a = nodes[r * (cols + 1) + c];
          const b = nodes[(r + 1) * (cols + 1) + c];
          if (!a || !b) continue;

          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const distToCenter = Math.hypot((midX - centerX) / radiusX, (midY - centerY) / radiusY);
          const centerFade = Math.min(1, Math.max(0, (distToCenter - 0.5) / 0.5));
          if (centerFade === 0) continue;

          const distToMouse = Math.hypot(
            midX - mouseRef.current.x,
            midY - mouseRef.current.y
          );
          const glow = Math.max(0, 1 - distToMouse / 220);
          const alpha = (0.35 + glow * 0.5) * centerFade;
          const width = (0.85 + glow * 1.2) * centerFade;

          drawSegment(a.x, a.y, b.x, b.y, width, alpha, glow, false);
        }
      }

      // Diagonal cross threads for proper spiderweb spiral feel
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const a = nodes[r * (cols + 1) + c];
          const d = nodes[(r + 1) * (cols + 1) + c + 1];
          if (!a || !d) continue;

          const midX = (a.x + d.x) / 2;
          const midY = (a.y + d.y) / 2;
          const distToCenter = Math.hypot((midX - centerX) / radiusX, (midY - centerY) / radiusY);
          const centerFade = Math.min(1, Math.max(0, (distToCenter - 0.5) / 0.5));
          if (centerFade === 0) continue;

          const distToMouse = Math.hypot(
            midX - mouseRef.current.x,
            midY - mouseRef.current.y
          );
          const glow = Math.max(0, 1 - distToMouse / 180);
          const alpha = (0.22 + glow * 0.35) * centerFade;
          const width = (0.55 + glow * 0.8) * centerFade;

          drawSegment(a.x, a.y, d.x, d.y, width, alpha, glow, true);
        }
      }

      ctx.shadowBlur = 0;
    }

    function updateNodes(nodes: Node[], mouse: { x: number; y: number }, W: number, H: number) {
      const MOUSE_RADIUS = W < 768 ? 130 : 200; // broader interaction on desktop
      const MOUSE_STRENGTH = W < 768 ? 45 : 75; // stronger push
      const SPRING = 0.05; // snappier spring
      const DAMPING = 0.82; // cleaner settle down

      nodes.forEach((node) => {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_STRENGTH;
          node.vx -= (dx / dist) * force * 0.05;
          node.vy -= (dy / dist) * force * 0.05;
        }

        // Spring acceleration to home pos
        node.vx += (node.baseX - node.x) * SPRING;
        node.vy += (node.baseY - node.y) * SPRING;

        node.vx *= DAMPING;
        node.vy *= DAMPING;

        node.x += node.vx;
        node.y += node.vy;

        // Visual clamping inside bounds
        node.x = Math.max(0, Math.min(W, node.x));
        node.y = Math.max(0, Math.min(H, node.y));
      });
    }

    function updateSpiders(spiders: Spider[], nodes: Node[]) {
      const now = Date.now();
      spiders.forEach((spider) => {
        if (spider.isDead) {
          // Slide down under gravity
          spider.y += 2.2;
          // slow spin
          spider.legPhase += 0.05;

          const timeSinceDeath = now - (spider.deathTime || 0);

          if (timeSinceDeath > 2200 || spider.y > H + 50) {
            // Respawn at a random border node!
            const outerIndices: number[] = [];
            for (let i = 0; i < nodes.length; i++) {
              const r = Math.floor(i / (cols + 1));
              const c = i % (cols + 1);
              if (r === 0 || r === rows || c === 0 || c === cols) {
                outerIndices.push(i);
              }
            }
            const spawnIndex = outerIndices.length > 0
              ? outerIndices[Math.floor(Math.random() * outerIndices.length)]
              : Math.floor(Math.random() * nodes.length);

            spider.isDead = false;
            spider.nodeIndex = spawnIndex;
            spider.x = nodes[spawnIndex].x;
            spider.y = nodes[spawnIndex].y;
            spider.targetX = nodes[spawnIndex].x;
            spider.targetY = nodes[spawnIndex].y;

            const rollBoss = Math.random() < 0.22;
            if (rollBoss) {
              spider.size = 15 + Math.random() * 5; // extra big red boss
              spider.speed = 0.25 + Math.random() * 0.35;
              spider.isBoss = true;
              spider.maxHp = 3;
              spider.hp = 3;
              spider.legSpeed = 0.05 + Math.random() * 0.03;
            } else {
              spider.size = 5 + Math.random() * 7;
              spider.speed = 0.4 + Math.random() * 0.8;
              spider.isBoss = false;
              spider.maxHp = undefined;
              spider.hp = undefined;
              spider.legSpeed = 0.07 + Math.random() * 0.05;
            }
          }
          return;
        }

        const dx = spider.targetX - spider.x;
        const dy = spider.targetY - spider.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 2.5) {
          const ni = spider.nodeIndex;
          const neighborCandidates = [
            ni - 1, ni + 1,
            ni - (cols + 1), ni + (cols + 1),
            ni - (cols + 1) - 1, ni - (cols + 1) + 1,
            ni + (cols + 1) - 1, ni + (cols + 1) + 1,
          ].filter((i) => i >= 0 && i < nodes.length);

          if (neighborCandidates.length > 0) {
            const newNi = neighborCandidates[Math.floor(Math.random() * neighborCandidates.length)];
            spider.nodeIndex = newNi;
            spider.targetX = nodes[newNi].x;
            spider.targetY = nodes[newNi].y;
          }
        } else {
          spider.x += (dx / dist) * spider.speed;
          spider.y += (dy / dist) * spider.speed;
        }

        if (nodes[spider.nodeIndex]) {
          spider.targetX = nodes[spider.nodeIndex].x;
          spider.targetY = nodes[spider.nodeIndex].y;
        }

        spider.legPhase += spider.legSpeed;
      });
    }

    function drawHUD(ctx: CanvasRenderingContext2D, W: number, H: number, score: number) {
      if (score === 0) return; // Keep HUD hidden unless they click and start playing
      ctx.save();
      const isMobile = W < 768;
      const padding = isMobile ? 12 : 18;
      const badgeW = isMobile ? 150 : 190;
      const badgeH = isMobile ? 26 : 30;
      const x = padding;
      const y = H - badgeH - padding;

      // Draw cyber pill background
      ctx.fillStyle = 'rgba(10, 10, 18, 0.72)';
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.25)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, badgeW, badgeH, 6) : ctx.rect(x, y, badgeW, badgeH);
      ctx.fill();
      ctx.stroke();

      // Green pulse activity dot
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      const pulseSecs = (Date.now() / 400) % Math.PI;
      ctx.globalAlpha = 0.5 + Math.sin(pulseSecs) * 0.5;
      ctx.arc(x + 14, y + badgeH / 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(x + 14, y + badgeH / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Label text
      ctx.font = '800 10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(`BUGS DEFEATED: ${score}`, x + 24, y + badgeH / 2 + 3);

      ctx.restore();
    }

    function loop() {
      timeRef.current += 1;
      const time = timeRef.current;

      ctx.clearRect(0, 0, W, H);

      updateNodes(nodesRef.current, mouseRef.current, W, H);
      updateSpiders(spidersRef.current, nodesRef.current);

      drawWeb(ctx, nodesRef.current, W, H);

      // Render spiders
      spidersRef.current.forEach((spider) => {
        const centerX = W / 2;
        const centerY = H / 2;
        const isMobile = W < 768;
        const radiusX = isMobile ? W * 0.44 : 350;
        const radiusY = isMobile ? H * 0.32 : 220;
        const distToCenter = Math.hypot((spider.x - centerX) / radiusX, (spider.y - centerY) / radiusY);
        // Spiders fade sooner than lines so they never touch text
        const spiderFade = Math.min(1, Math.max(0, (distToCenter - 0.65) / 0.35));

        // Let dying spiders have full visibility as they fall out
        const finalAlpha = spider.isDead ? 1.0 : spiderFade;

        if (finalAlpha > 0) {
          ctx.save();
          ctx.globalAlpha = finalAlpha;
          drawSpider(ctx, spider, time);
          ctx.restore();
        }
      });

      // Update & Render Splat Paint Particles
      particlesRef.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // mild gravity pull
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Update & Render Floating Text Splats
      floatTextsRef.current.forEach((t, index) => {
        t.y += t.vy;
        t.alpha -= 0.015;

        if (t.alpha <= 0) {
          floatTextsRef.current.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = t.alpha;
        ctx.font = '800 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';

        // subtle dark background offset
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillText(t.text, t.x + 1, t.y + 1);

        ctx.fillStyle = '#67e8f9'; // glowing neon cyan
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });

      // Render playable score HUD
      drawHUD(ctx, W, H, scoreRef.current);

      animFrameRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [buildWeb, spawnSpiders]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
