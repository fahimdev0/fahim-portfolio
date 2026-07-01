'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  neighbors?: number[];
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
  const connectionsRef = useRef<[number, number, boolean][]>([]);

  // Highly realistic, organic, hand-spun spider web generator
  const buildWeb = useCallback((W: number, H: number) => {
    const nodes: Node[] = [];
    const connections: [number, number, boolean][] = [];

    const addNode = (x: number, y: number) => {
      nodes.push({ x, y, baseX: x, baseY: y, vx: 0, vy: 0, neighbors: [] });
      return nodes.length - 1;
    };

    const connect = (i1: number, i2: number, isDiagonal = false) => {
      if (i1 < 0 || i2 < 0 || i1 >= nodes.length || i2 >= nodes.length) return;
      
      const exists = connections.some(
        (c) => (c[0] === i1 && c[1] === i2) || (c[0] === i2 && c[1] === i1)
      );
      if (!exists) {
        connections.push([i1, i2, isDiagonal]);
        if (!nodes[i1].neighbors) nodes[i1].neighbors = [];
        if (!nodes[i2].neighbors) nodes[i2].neighbors = [];
        if (!nodes[i1].neighbors!.includes(i2)) nodes[i1].neighbors!.push(i2);
        if (!nodes[i2].neighbors!.includes(i1)) nodes[i2].neighbors!.push(i1);
      }
    };

    const outerNodesList: number[] = [];

    const createOrganicWeb = (
      cx: number,
      cy: number,
      startAngle: number,
      endAngle: number,
      numRays: number,
      numRings: number,
      maxRadius: number,
      isTorn = false
    ) => {
      const rayAngles: number[] = [];
      const angleStep = numRays > 1 ? (endAngle - startAngle) / (numRays - 1) : 0;

      // 1. Create ray angles with random asymmetry and non-uniform angular spacing
      for (let i = 0; i < numRays; i++) {
        const noise = numRays > 1 ? (Math.random() - 0.5) * angleStep * 0.35 : 0;
        rayAngles.push(startAngle + i * angleStep + noise);
      }

      const webNodes: number[][] = [];
      for (let r = 0; r < numRays; r++) {
        webNodes[r] = [];
        const angle = rayAngles[r];

        for (let ring = 0; ring < numRings; ring++) {
          // Tension spacing: closer together near the origin, wider apart near the edges
          const t = ring / (numRings - 1 || 1);
          const spacing = Math.pow(t, 1.3); // non-uniform progression
          const distance = spacing * maxRadius * (0.85 + Math.random() * 0.3);

          const nx = cx + Math.cos(angle) * distance;
          const ny = cy + Math.sin(angle) * distance;

          const idx = addNode(nx, ny);
          webNodes[r].push(idx);

          // Track outer-ring nodes for cross-stretching structural lines
          if (ring === numRings - 1) {
            outerNodesList.push(idx);
          }
        }
      }

      // 2. Connect radial strands (lines going from center outward)
      for (let r = 0; r < numRays; r++) {
        for (let ring = 0; ring < numRings - 1; ring++) {
          // Organic torn effect: random omissions of some outer structural radial segments
          if (isTorn && ring > 2 && Math.random() < 0.12) {
            continue;
          }
          connect(webNodes[r][ring], webNodes[r][ring + 1], false);
        }
      }

      // 3. Connect concentric spiral strands (the circular segments)
      for (let ring = 1; ring < numRings; ring++) {
        for (let r = 0; r < numRays - 1; r++) {
          // Skip concentric segments randomly to create realistic torn gaps
          if (isTorn) {
            const skipChance = 0.08 + (ring / numRings) * 0.28;
            if (Math.random() < skipChance) continue;
          }
          connect(webNodes[r][ring], webNodes[r + 1][ring], true);
        }
      }
    };

    const baseSize = Math.min(W, H);
    const isMobile = W < 768;

    if (isMobile) {
      // Significantly scaled down for ultra-high framerate mobile experience
      createOrganicWeb(0, 0, 0, Math.PI / 2, 4, 4, baseSize * 0.52, true); // Top-Left
      createOrganicWeb(W, 0, Math.PI / 2, Math.PI, 4, 4, baseSize * 0.48, true); // Top-Right
      createOrganicWeb(0, H, Math.PI * 1.5, Math.PI * 2, 4, 4, baseSize * 0.54, true); // Bottom-Left
      createOrganicWeb(W, H, Math.PI, Math.PI * 1.5, 4, 4, baseSize * 0.44, true); // Bottom-Right
    } else {
      // Full density desktop rendering
      createOrganicWeb(0, 0, 0, Math.PI / 2, 7, 7, baseSize * 0.72, true); // Top-Left
      createOrganicWeb(W, 0, Math.PI / 2, Math.PI, 6, 8, baseSize * 0.68, true); // Top-Right
      createOrganicWeb(0, H, Math.PI * 1.5, Math.PI * 2, 8, 6, baseSize * 0.76, true); // Bottom-Left
      createOrganicWeb(W, H, Math.PI, Math.PI * 1.5, 6, 7, baseSize * 0.64, true); // Bottom-Right

      // Create 2 side/edge-anchored partial webs that look hand-spun
      createOrganicWeb(0, H * 0.45, -Math.PI / 2.8, Math.PI / 2.8, 5, 5, baseSize * 0.44, true); // Left-Edge Anchor
      createOrganicWeb(W, H * 0.55, Math.PI * 0.65, Math.PI * 1.35, 5, 5, baseSize * 0.44, true); // Right-Edge Anchor
    }

    // 4. Create stray/diagonal cross-stretching structural strands between distant parts of corners for high-fidelity realism
    if (outerNodesList.length > 5) {
      const strandCount = isMobile ? 2 : 6;
      for (let i = 0; i < strandCount; i++) {
        const u = outerNodesList[Math.floor(Math.random() * outerNodesList.length)];
        const v = outerNodesList[Math.floor(Math.random() * outerNodesList.length)];
        
        const dist = Math.hypot(nodes[u].x - nodes[v].x, nodes[u].y - nodes[v].y);
        // Ensure the lines span across gaps symmetrically/asymmetrically and look imperfect
        if (dist > baseSize * 0.35 && u !== v) {
          connect(u, v, true);
        }
      }
    }

    return { nodes, connections };
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

    let { nodes, connections } = buildWeb(W, H);
    nodesRef.current = nodes;
    connectionsRef.current = connections;
    
    // Spawn more spiders for desktop for visual richness
    const spiderCount = W < 768 ? 4 : 7;
    spidersRef.current = spawnSpiders(nodesRef.current, spiderCount);

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      const setup = buildWeb(W, H);
      nodesRef.current = setup.nodes;
      connectionsRef.current = setup.connections;
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

      // Realistic jointed spider renderer
      const renderSingleSpider = (isShadow: boolean, isMainDead: boolean) => {
        // Body segments layout
        const headRadius = size * 0.42;
        const headY = -size * 0.28;
        const abdomenW = size * (isMainDead ? 0.76 : 0.64);
        const abdomenH = size * (isMainDead ? 0.64 : 0.94);
        const abdomenY = size * 0.48;

        ctx.lineWidth = isMainDead ? 0.8 : (spider.isBoss ? 1.8 : 1.1);

        // 1. Draw Chelicerae (Fangs) - attach at very front of head
        if (!isShadow) {
          ctx.strokeStyle = '#1e1b4b';
          ctx.fillStyle = isMainDead ? '#31101b' : (spider.isBoss ? '#581c87' : '#1e1b4b');
          [-1, 1].forEach((side) => {
            ctx.beginPath();
            const fangBaseX = side * headRadius * 0.4;
            const fangBaseY = headY - headRadius * 0.8;
            ctx.moveTo(fangBaseX, fangBaseY);
            // Curved fangs
            ctx.quadraticCurveTo(
              fangBaseX + side * size * 0.15,
              fangBaseY - size * 0.25,
              fangBaseX + side * size * 0.05,
              fangBaseY - size * 0.45
            );
            ctx.quadraticCurveTo(
              fangBaseX - side * size * 0.05,
              fangBaseY - size * 0.22,
              fangBaseX,
              fangBaseY
            );
            ctx.fill();
            ctx.stroke();

            // Fang tip glow (poison drop / sharp barb)
            if (!isMainDead) {
              ctx.fillStyle = spider.isBoss ? '#f43f5e' : '#10b981';
              ctx.beginPath();
              ctx.arc(fangBaseX + side * size * 0.05, fangBaseY - size * 0.45, size * 0.06, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }

        // 2. Draw Pedipalps (front sensory feelers) - attach to front of head
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          const basePalpX = side * headRadius * 0.45;
          const basePalpY = headY - headRadius * 0.7;

          // Gentle palp wiggling if alive. Antiphase feeler movement
          const palpWiggle = isMainDead ? 0 : Math.sin(phase * 1.5 + side) * 0.16;
          
          // Palps contain 2 small jointed segments extending forward
          const pAngle1 = -Math.PI / 2 + side * 0.25 + palpWiggle;
          const px1 = basePalpX + Math.cos(pAngle1) * (size * 0.38);
          const py1 = basePalpY + Math.sin(pAngle1) * (size * 0.38);

          const pAngle2 = pAngle1 - side * 0.38 + palpWiggle * 0.5;
          const px2 = px1 + Math.cos(pAngle2) * (size * 0.32);
          const py2 = py1 + Math.sin(pAngle2) * (size * 0.32);

          ctx.strokeStyle = isShadow 
            ? 'rgba(0,0,0,0.6)' 
            : (isMainDead ? 'rgba(244, 63, 94, 0.5)' : (spider.isBoss ? '#7f1d1d' : '#312e81'));
          ctx.moveTo(basePalpX, basePalpY);
          ctx.lineTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();
        });

        // 3. Draw 8 jointed walking legs attaching to cephalothorax (head segment)
        // Authentic coordinate separation for four distinct leg slots on the thorax plate
        const activeLegPairs = [
          { baseOffsetY: headY + headRadius * 0.35, outAngle: -0.62, targetAngle: -0.85, len: size * 2.3, id: 0 },
          { baseOffsetY: headY + headRadius * 0.65, outAngle: -0.15, targetAngle: -0.28, len: size * 2.5, id: 1 },
          { baseOffsetY: headY + headRadius * 0.95, outAngle: 0.18, targetAngle: 0.32, len: size * 2.5, id: 2 },
          { baseOffsetY: headY + headRadius * 1.25, outAngle: 0.68, targetAngle: 0.95, len: size * 2.2, id: 3 },
        ];

        ctx.strokeStyle = isShadow
          ? 'rgba(0,0,0,0.65)'
          : (isMainDead 
              ? 'rgba(244, 63, 94, 0.7)' 
              : (spider.isBoss ? 'rgba(239, 68, 68, 0.95)' : 'rgba(129, 140, 248, 0.85)'));

        activeLegPairs.forEach((pair) => {
          [-1, 1].forEach((side) => {
            const baseAngle = pair.outAngle * side + (side > 0 ? 0 : Math.PI);
            
            // Alternating tripod locomotion gait animation for realistic fluid spider crawling
            // Alive spider: odd legs (0, 2) move opposite to even legs (1, 3)
            const legPhaseOffset = pair.id % 2 === 0 ? 0 : Math.PI;
            const wiggleAmount = isMainDead 
              ? 0 
              : Math.sin(phase + legPhaseOffset) * 0.32 * side;
            
            const jointAngle1 = baseAngle + wiggleAmount;

            // Leg origins attach to head/breast plate (cephalothorax)
            const lax0 = side * headRadius * 0.35;
            const lay0 = pair.baseOffsetY;

            // Joint 1: Coxa/Femur extending out and up
            const femurLen = pair.len * 0.42;
            const lax1 = lax0 + Math.cos(jointAngle1) * femurLen;
            const lay1 = lay0 + Math.sin(jointAngle1) * femurLen;

            // Joint 2: Tibia bending sharply downwards & outward
            const tibiaAngle = jointAngle1 + (side > 0 ? 0.75 : -0.75) + (isMainDead ? (pair.id * 0.2 * side) : wiggleAmount * 0.4);
            const tibiaLen = pair.len * 0.40;
            const lax2 = lax1 + Math.cos(tibiaAngle) * tibiaLen;
            const lay2 = lay1 + Math.sin(tibiaAngle) * tibiaLen;

            // Joint 3: Metatarsus/Tarsus tip bending straight down to grip lines/surfaces
            const tarsusAngle = tibiaAngle + (side > 0 ? 0.55 : -0.55) + (isMainDead ? 0.4 * side : 0);
            const tarsusLen = pair.len * 0.22;
            const lax3 = lax2 + Math.cos(tarsusAngle) * tarsusLen;
            const lay3 = lay2 + Math.sin(tarsusAngle) * tarsusLen;

            // In death, legs curl inwards and look rigid
            if (isMainDead) {
              // Curled back toward the body
              const deadAngle = baseAngle + (side > 0 ? -1.0 : 1.0);
              const dcx1 = lax0 + Math.cos(deadAngle) * (pair.len * 0.32);
              const dcy1 = lay0 + Math.sin(deadAngle) * (pair.len * 0.32);
              const dcx2 = dcx1 + Math.cos(deadAngle + (side > 0 ? -1.1 : 1.1)) * (pair.len * 0.28);
              const dcy2 = dcy1 + Math.sin(deadAngle + (side > 0 ? -1.1 : 1.1)) * (pair.len * 0.28);
              const dcx3 = dcx2 + Math.cos(deadAngle + (side > 0 ? -1.8 : 1.8)) * (pair.len * 0.18);
              const dcy3 = dcy2 + Math.sin(deadAngle + (side > 0 ? -1.8 : 1.8)) * (pair.len * 0.18);
              
              ctx.beginPath();
              ctx.moveTo(lax0, lay0);
              ctx.lineTo(dcx1, dcy1);
              ctx.lineTo(dcx2, dcy2);
              ctx.lineTo(dcx3, dcy3);
              ctx.stroke();
            } else {
              // Smooth segmented path drawing for jointed legs
              ctx.beginPath();
              ctx.moveTo(lax0, lay0);
              ctx.lineTo(lax1, lay1);
              ctx.lineTo(lax2, lay2);
              ctx.lineTo(lax3, lay3);
              ctx.stroke();
            }
          });
        });

        // 4. Pedicel (The tiny narrow waist connecting head and abdomen)
        if (isShadow) {
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
        } else {
          ctx.fillStyle = isMainDead ? '#31101b' : (spider.isBoss ? '#450a0a' : '#1e1b4b');
        }
        ctx.beginPath();
        ctx.ellipse(0, headY + headRadius * 1.1, size * 0.15, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // 5. Abdomen (Rear larger plate)
        let abdomenGrad;
        if (isShadow) {
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
        } else {
          abdomenGrad = ctx.createRadialGradient(0, abdomenY, 0, 0, abdomenY, abdomenW * 1.2);
          if (isMainDead) {
            abdomenGrad.addColorStop(0, '#f43f5e'); // red death colors
            abdomenGrad.addColorStop(1, '#881337');
          } else if (spider.isBoss) {
            abdomenGrad.addColorStop(0, '#ef4444'); // boss red hot core
            abdomenGrad.addColorStop(1, '#450a0a'); // deep rich charcoal crimson
          } else {
            abdomenGrad.addColorStop(0, '#6366f1'); // sapphire indigo core
            abdomenGrad.addColorStop(1, '#1e1b4b'); // deep midnight violet
          }
          ctx.fillStyle = abdomenGrad;
        }

        ctx.beginPath();
        ctx.ellipse(0, abdomenY, abdomenW, abdomenH, 0, 0, Math.PI * 2);
        ctx.fill();

        // 5b. Authentic Abdomen Markings (Tiger-stripes, chevron patterns, and glowing warning hourglass)
        if (!isShadow) {
          ctx.save();
          // Clip markings to the abdomen ellipse to maintain perfectly clean borders
          ctx.beginPath();
          ctx.ellipse(0, abdomenY, abdomenW, abdomenH, 0, 0, Math.PI * 2);
          ctx.clip();

          // Draw spider chevron/stripe texture
          ctx.strokeStyle = isMainDead 
            ? 'rgba(255,255,255,0.18)' 
            : (spider.isBoss ? 'rgba(239,68,68,0.7)' : 'rgba(129,140,248,0.55)');
          ctx.lineWidth = 1.8;
          
          // concentric V-chevrons down the abdomen
          for (let dy = -0.5; dy <= 0.6; dy += 0.28) {
            ctx.beginPath();
            const strokeY = abdomenY + dy * abdomenH;
            ctx.moveTo(-abdomenW * 0.65, strokeY - abdomenH * 0.15);
            ctx.lineTo(0, strokeY + abdomenH * 0.08);
            ctx.lineTo(abdomenW * 0.65, strokeY - abdomenH * 0.15);
            ctx.stroke();
          }

          // Special marking: Black Widow Hourglass/Skull pattern on Boss back, elegant stripe on standard
          if (spider.isBoss) {
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            // Hourglass drawing
            ctx.moveTo(-size * 0.18, abdomenY - size * 0.24);
            ctx.lineTo(size * 0.18, abdomenY - size * 0.24);
            ctx.lineTo(-size * 0.04, abdomenY + size * 0.08);
            ctx.lineTo(size * 0.04, abdomenY + size * 0.08);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-size * 0.04, abdomenY + size * 0.08);
            ctx.lineTo(size * 0.04, abdomenY + size * 0.08);
            ctx.lineTo(-size * 0.22, abdomenY + size * 0.42);
            ctx.lineTo(size * 0.22, abdomenY + size * 0.42);
            ctx.closePath();
            ctx.fill();
          } else {
            // Standard vertical neon vein
            ctx.fillStyle = '#818cf8';
            ctx.beginPath();
            ctx.ellipse(0, abdomenY, size * 0.05, abdomenH * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 6. Cephalothorax (Head/Breast section)
        let headGrad;
        if (isShadow) {
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
        } else {
          headGrad = ctx.createRadialGradient(0, headY, 0, 0, headY, headRadius * 1.15);
          if (isMainDead) {
            headGrad.addColorStop(0, '#f97316'); // orange-red death cephalothorax
            headGrad.addColorStop(1, '#5c1d0c');
          } else if (spider.isBoss) {
            headGrad.addColorStop(0, '#ef4444');
            headGrad.addColorStop(1, '#7f1d1d');
          } else {
            headGrad.addColorStop(0, '#818cf8');
            headGrad.addColorStop(1, '#312e81');
          }
          ctx.fillStyle = headGrad;
        }

        ctx.beginPath();
        ctx.ellipse(0, headY, headRadius, headRadius * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();

        // 7. Multi-Eye Clustered Arrangement (8 glowing eyes)
        if (!isShadow) {
          // Front AME (Anterior Median Eyes) are massive and look shiny
          const frontEyes = [-0.18, 0.18];
          frontEyes.forEach((ex) => {
            ctx.fillStyle = isMainDead 
              ? '#5c1d0c' 
              : (spider.isBoss ? '#f43f5e' : '#22d3ee'); // bright glowing core color
            ctx.beginPath();
            ctx.arc(ex * size, headY - headRadius * 0.35, size * 0.11, 0, Math.PI * 2);
            ctx.fill();
            
            // Specular shiny glare reflection point on front eyes
            if (!isMainDead) {
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(ex * size + size * 0.03, headY - headRadius * 0.4, size * 0.045, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Side micro-eyes (Rear Lateral, Anterior Lateral - 4 additional smaller glowing beads)
          const sideEyes = [
            { x: -0.32, y: -0.21, r: 0.055 },
            { x: 0.32, y: -0.21, r: 0.055 },
            { x: -0.38, y: -0.05, r: 0.045 },
            { x: 0.38, y: -0.05, r: 0.045 }
          ];
          sideEyes.forEach((eye) => {
            ctx.fillStyle = isMainDead 
              ? '#4c0519' 
              : (spider.isBoss ? '#ef4444' : '#67e8f9');
            ctx.beginPath();
            ctx.arc(eye.x * size, headY + eye.y * size, eye.r * size, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      };

      ctx.save();
      ctx.translate(x, y);

      // Gentle spatial breathing pulsation to make them feel alive and biological
      const breatheScale = isDead ? 1.0 : 1.0 + Math.sin(time * 0.1) * 0.03;
      ctx.scale(breatheScale, breatheScale);

      // Rotate if falling or deceased
      if (isDead) {
        ctx.rotate((time * 0.035) % (Math.PI * 2));
      }

      // Draw 3D Drop Shadow offset slightly down-right to elevate spider over the web
      ctx.save();
      ctx.translate(size * 0.32, size * 0.45); // high shift
      renderSingleSpider(true, isDead);
      ctx.restore();

      // Draw actual primary colorful textured spider
      renderSingleSpider(false, isDead);

      // Simple HUD style Health Bar above boss spider's head
      if (spider.isBoss && !isDead && spider.hp !== undefined && spider.maxHp !== undefined) {
        const barW = size * 2.1;
        const barH = 4.2;
        const barX = -barW / 2;
        const barY = -size * 1.4;

        // Draw background container
        ctx.fillStyle = 'rgba(15, 10, 15, 0.9)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
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
      const radiusX = isMobile ? W * 0.44 : 350; 
      const radiusY = isMobile ? H * 0.32 : 220; 

      ctx.shadowBlur = 0;

      // Draw each organic web segment with realistic gravity sag, wind-sway, and tension
      connectionsRef.current.forEach(([u, v, isDiagonal]) => {
        const a = nodes[u];
        const b = nodes[v];
        if (!a || !b) return;

        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        
        // Fading out near the center keeps the user content fully legible
        const distToCenter = Math.hypot((midX - centerX) / radiusX, (midY - centerY) / radiusY);
        const centerFade = Math.min(1, Math.max(0, (distToCenter - 0.5) / 0.5));
        if (centerFade === 0) return;

        const distToMouse = Math.hypot(
          midX - mouseRef.current.x,
          midY - mouseRef.current.y
        );
        const glow = Math.max(0, 1 - distToMouse / (isMobile ? 120 : 190));
        const alpha = (0.32 + glow * 0.5) * centerFade;
        const width = (0.75 + glow * 1.0) * centerFade;

        if (alpha <= 0.05) return;

        // Realistic gravity tension sag and natural wind/vibration sway
        const timeFactor = timeRef.current * 0.015; // slow organic wave flow
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        
        // Longer threads sag more under gravity
        const sagAmount = len * 0.065 + 1.2; 
        
        // Gentle wind vibration/organic sway
        const windX = Math.sin(timeFactor + (a.x + b.x) * 0.003) * 2.2;
        const windY = (Math.cos(timeFactor * 0.85 + (a.y + b.y) * 0.003) + 0.35) * 2.8;

        const controlX = midX + windX;
        const controlY = midY + sagAmount + windY;

        // Rendering double-line glow strokes to resemble macro-photography of thin glowing silk
        if (isMobile) {
          // Single lightweight path for maximum 60fps/120fps performance on mobile
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(controlX, controlY, b.x, b.y);
          ctx.strokeStyle = isDiagonal ? `rgba(110, 115, 244, ${alpha * 0.7})` : `rgba(135, 145, 248, ${alpha * 0.7})`;
          ctx.lineWidth = width;
          ctx.stroke();
        } else if (glow > 0.15) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(controlX, controlY, b.x, b.y);
          ctx.shadowBlur = isDiagonal ? (4 + glow * 8) : (8 + glow * 12);
          ctx.shadowColor = `rgba(129, 140, 248, ${glow * (isDiagonal ? 0.6 : 0.85) * (alpha / (0.35 + glow * 0.5))})`;
          ctx.strokeStyle = isDiagonal ? `rgba(99, 102, 241, ${alpha})` : `rgba(129, 140, 248, ${alpha})`;
          ctx.lineWidth = width;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          // Inner glowing backing line
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(controlX, controlY, b.x, b.y);
          ctx.strokeStyle = isDiagonal 
            ? `rgba(99, 102, 241, ${alpha * 0.2})` 
            : `rgba(129, 140, 248, ${alpha * 0.24})`;
          ctx.lineWidth = width * (isDiagonal ? 2.8 : 3.2);
          ctx.stroke();

          // Central sharp glowing silk strand
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(controlX, controlY, b.x, b.y);
          ctx.strokeStyle = isDiagonal ? `rgba(110, 115, 244, ${alpha})` : `rgba(135, 145, 248, ${alpha})`;
          ctx.lineWidth = width;
          ctx.stroke();
        }
      });
    }

    function updateNodes(nodes: Node[], mouse: { x: number; y: number }, W: number, H: number, delta: number) {
      const MOUSE_RADIUS = W < 768 ? 130 : 200; // broader interaction on desktop
      const MOUSE_STRENGTH = W < 768 ? 45 : 75; // stronger push
      const SPRING = 0.05 * delta; // snappier spring
      const DAMPING = Math.pow(0.82, delta); // cleaner settle down

      nodes.forEach((node) => {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_STRENGTH * delta;
          node.vx -= (dx / dist) * force * 0.05;
          node.vy -= (dy / dist) * force * 0.05;
        }

        // Spring acceleration to home pos
        node.vx += (node.baseX - node.x) * SPRING;
        node.vy += (node.baseY - node.y) * SPRING;

        node.vx *= DAMPING;
        node.vy *= DAMPING;

        node.x += node.vx * delta;
        node.y += node.vy * delta;

        // Visual clamping inside bounds
        node.x = Math.max(0, Math.min(W, node.x));
        node.y = Math.max(0, Math.min(H, node.y));
      });
    }

    function updateSpiders(spiders: Spider[], nodes: Node[], delta: number) {
      const now = Date.now();
      spiders.forEach((spider) => {
        if (spider.isDead) {
          // Slide down under gravity
          spider.y += 2.2 * delta;
          // slow spin
          spider.legPhase += 0.05 * delta;

          const timeSinceDeath = now - (spider.deathTime || 0);

          if (timeSinceDeath > 2200 || spider.y > H + 50) {
            // Respawn at any of the outer anchor nodes (border proximity)
            const outerIndices: number[] = [];
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              if (node.x < 35 || node.y < 35 || node.x > W - 35 || node.y > H - 35) {
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
          let neighborCandidates = nodes[ni]?.neighbors || [];

          if (neighborCandidates.length === 0) {
            const validNodes = nodes.filter(n => n.neighbors && n.neighbors.length > 0);
            if (validNodes.length > 0) {
              const randomNode = validNodes[Math.floor(Math.random() * validNodes.length)];
              const newNi = nodes.indexOf(randomNode);
              spider.nodeIndex = newNi;
              spider.targetX = randomNode.x;
              spider.targetY = randomNode.y;
            }
          } else {
            const newNi = neighborCandidates[Math.floor(Math.random() * neighborCandidates.length)];
            spider.nodeIndex = newNi;
            spider.targetX = nodes[newNi].x;
            spider.targetY = nodes[newNi].y;
          }
        } else {
          // Move toward target with delta clamping to prevent overshoot or stuttering oscillations
          const step = spider.speed * delta;
          if (step >= dist) {
            spider.x = spider.targetX;
            spider.y = spider.targetY;
          } else {
            spider.x += (dx / dist) * step;
            spider.y += (dy / dist) * step;
          }
        }

        if (nodes[spider.nodeIndex]) {
          spider.targetX = nodes[spider.nodeIndex].x;
          spider.targetY = nodes[spider.nodeIndex].y;
        }

        spider.legPhase += spider.legSpeed * delta;
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

    let lastTime = performance.now();

    function loop(nowTime: number) {
      // delta = 1.0 at standard 60fps (16.666 ms). Clamp between 0.1 and 3.0 to keep simulation stable.
      const delta = Math.max(0.1, Math.min(3.0, (nowTime - lastTime) / 16.666));
      lastTime = nowTime;

      timeRef.current += delta;
      const time = timeRef.current;
 
      ctx.clearRect(0, 0, W, H);
 
      updateNodes(nodesRef.current, mouseRef.current, W, H, delta);
      updateSpiders(spidersRef.current, nodesRef.current, delta);
 
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
      particlesRef.current.forEach((p) => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.vy += 0.12 * delta; // mild gravity pull
        p.alpha -= p.decay * delta;
 
        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      // Correctly filter out dead particles to avoid indexing artifacts
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);
 
      // Update & Render Floating Text Splats
      floatTextsRef.current.forEach((t) => {
        t.y += t.vy * delta;
        t.alpha -= 0.015 * delta;
 
        if (t.alpha > 0) {
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
        }
      });
      // Correctly filter out dead float texts to avoid indexing artifacts
      floatTextsRef.current = floatTextsRef.current.filter((t) => t.alpha > 0);
 
      // Render playable score HUD
      drawHUD(ctx, W, H, scoreRef.current);
 
      animFrameRef.current = requestAnimationFrame(loop);
    }
 
    // Start animation loop with high resolution timestamp
    animFrameRef.current = requestAnimationFrame(loop);

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
