// ============================================================
// canvas.js - Monster sprite drawing
// ============================================================

window.MonsterCanvas = (() => {

// ---- Preload sprite images ----
const SPRITE_MAP = {
  slime: ['images/slime_1.png', 'images/slime_2.png', 'images/slime_3.png', 'images/slime_4.png'],
  goblin: ['images/goblin_1.png', 'images/goblin_2.png', 'images/goblin_3.png', 'images/goblin_4.png'],
  dragon: ['images/dragon_1.png', 'images/dragon_2.png', 'images/dragon_3.png', 'images/dragon_4.png'],
  demon: ['images/demon_1.png', 'images/demon_2.png', 'images/demon_3.png', 'images/demon_4.png'],
  zombie: ['images/zombie_1.png', 'images/zombie_2.png', 'images/zombie_3.png', 'images/zombie_4.png'],
  orc: ['images/orc_1.png', 'images/orc_2.png', 'images/orc_3.png', 'images/orc_4.png'],
  darkelf: ['images/darkelf_1.png', 'images/darkelf_2.png', 'images/darkelf_3.png', 'images/darkelf_4.png'],
};
const spriteCache = {};

function preloadSprites() {
  for (const [type, paths] of Object.entries(SPRITE_MAP)) {
    spriteCache[type] = paths.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }
}
preloadSprites();

function drawMonster(canvas, monsterType, stage, synthTraits = [], options = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const scale = Math.min(w, h) / 120;

  // Use sprite image if available
  const sprites = spriteCache[monsterType];
  if (sprites) {
    const img = sprites[Math.min(stage, sprites.length - 1)];
    const drawImg = () => {
      ctx.clearRect(0, 0, w, h);
      // Fit image into canvas preserving aspect ratio
      const ratio = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * ratio;
      const dh = img.naturalHeight * ratio;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      // Silhouette mode
      if (options.silhouette) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = '#1a1a3e';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        // Synthesis overlay effects
        drawSynthOverlays(ctx, cx, cy, scale, synthTraits);
      }
    };
    if (img.complete && img.naturalWidth > 0) {
      drawImg();
    } else {
      img.onload = drawImg;
    }
    return;
  }

  // Fallback: Canvas drawing for other types
  switch (monsterType) {
    case 'zombie':   drawZombie(ctx, cx, cy, stage, scale, synthTraits); break;
    case 'goblin':   drawGoblin(ctx, cx, cy, stage, scale, synthTraits); break;
    case 'orc':      drawOrc(ctx, cx, cy, stage, scale, synthTraits); break;
    case 'darkelf':  drawDarkElf(ctx, cx, cy, stage, scale, synthTraits); break;
    case 'dragon':   drawDragon(ctx, cx, cy, stage, scale, synthTraits); break;
    case 'demon':    drawDemon(ctx, cx, cy, stage, scale, synthTraits); break;
    default:         drawZombie(ctx, cx, cy, stage, scale, synthTraits);
  }

  drawSynthOverlays(ctx, cx, cy, scale, synthTraits);
}

function drawSynthOverlays(ctx, cx, cy, scale, synthTraits) {
  if (!synthTraits || synthTraits.length === 0) return;
  if (synthTraits.includes('fire')) {
    drawFlameEffect(ctx, cx, cy, scale);
  }
  if (synthTraits.includes('dark_power') || synthTraits.includes('shadow')) {
    drawDarkAura(ctx, cx, cy, scale);
  }
  if (synthTraits.includes('flying')) {
    drawWingOverlay(ctx, cx, cy, scale);
  }
}

// ---- Helper drawing utilities ----
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

function drawEye(ctx, x, y, size, color = '#000') {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 1.2, size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + size * 0.2, y, size * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + size * 0.35, y - size * 0.2, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

// ---- SLIME ----
function drawSlime(ctx, cx, cy, stage, scale, synth) {
  const stageColors = ['#4CAF50', '#388E3C', '#1B5E20', '#00BFA5'];
  const color = stageColors[stage] || stageColors[0];
  const bodySize = (28 + stage * 8) * scale;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodySize * 0.85, bodySize * 0.8, bodySize * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body gradient
  const grad = ctx.createRadialGradient(cx - bodySize * 0.2, cy - bodySize * 0.2, bodySize * 0.1, cx, cy, bodySize);
  grad.addColorStop(0, lighten(color, 40));
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, darken(color, 30));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, bodySize, 0, Math.PI);
  ctx.arc(cx, cy, bodySize * 0.95, Math.PI, Math.PI * 2);
  ctx.fill();

  // Blob top bumps
  ctx.fillStyle = grad;
  for (let i = 0; i < 3 + stage; i++) {
    const angle = -Math.PI + (i / (2 + stage)) * Math.PI;
    const bx = cx + Math.cos(angle) * bodySize * 0.6;
    const by = cy + Math.sin(angle) * bodySize * 0.7;
    ctx.beginPath();
    ctx.arc(bx, by, bodySize * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyes
  const eyeY = cy - bodySize * 0.2;
  const eyeOff = bodySize * 0.3;
  drawEye(ctx, cx - eyeOff, eyeY, 5 * scale, '#222');
  drawEye(ctx, cx + eyeOff, eyeY, 5 * scale, '#222');

  // Crown for stage 2+
  if (stage >= 2) drawCrown(ctx, cx, cy - bodySize * 0.92, scale * (0.7 + stage * 0.15), '#FFD700');
  // Halo for stage 3
  if (stage === 3) drawHalo(ctx, cx, cy - bodySize * 1.1, scale);

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx - bodySize * 0.25, cy - bodySize * 0.35, bodySize * 0.25, bodySize * 0.15, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

// ---- ZOMBIE ----
function drawZombie(ctx, cx, cy, stage, scale, synth) {
  const stageColors = ['#78909C', '#546E7A', '#37474F', '#6200EA'];
  const color = stageColors[stage] || stageColors[0];
  const bodyH = (45 + stage * 8) * scale;
  const bodyW = (22 + stage * 5) * scale;
  const headR = (14 + stage * 3) * scale;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodyH / 2 + 5 * scale, bodyW * 0.8, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = darken(color, 20);
  ctx.fillRect(cx - bodyW * 0.35, cy + bodyH * 0.3, bodyW * 0.3, bodyH * 0.4);
  ctx.fillRect(cx + bodyW * 0.05, cy + bodyH * 0.3, bodyW * 0.3, bodyH * 0.4);

  // Arms (outstretched zombie style)
  ctx.fillStyle = lighten(color, 10);
  // Left arm reaching forward
  ctx.save();
  ctx.translate(cx - bodyW * 0.5, cy - bodyH * 0.05);
  ctx.rotate(-0.3);
  ctx.fillRect(0, 0, -bodyW * 0.5, bodyW * 0.22);
  ctx.restore();
  // Right arm reaching forward
  ctx.save();
  ctx.translate(cx + bodyW * 0.5, cy - bodyH * 0.05);
  ctx.rotate(0.3);
  ctx.fillRect(0, 0, bodyW * 0.5, bodyW * 0.22);
  ctx.restore();

  // Body
  const bodyGrad = ctx.createLinearGradient(cx - bodyW, cy - bodyH / 2, cx + bodyW, cy + bodyH / 2);
  bodyGrad.addColorStop(0, lighten(color, 15));
  bodyGrad.addColorStop(1, darken(color, 15));
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 6 * scale);
  ctx.fill();

  // Torn clothing lines
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5 * scale;
  for (let i = 0; i < 3; i++) {
    const y = cy - bodyH * 0.2 + i * bodyH * 0.2;
    ctx.beginPath();
    ctx.moveTo(cx - bodyW * 0.4, y);
    ctx.lineTo(cx + bodyW * 0.3, y + 5 * scale);
    ctx.stroke();
  }

  // Head
  const headGrad = ctx.createRadialGradient(cx - headR * 0.2, cy - bodyH / 2 - headR * 0.2, headR * 0.1, cx, cy - bodyH / 2, headR);
  headGrad.addColorStop(0, lighten(color, 20));
  headGrad.addColorStop(1, darken(color, 10));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - bodyH / 2, headR, 0, Math.PI * 2);
  ctx.fill();

  // Zombie eyes (hollow, glowing)
  ctx.fillStyle = '#7CFC00';
  ctx.beginPath();
  ctx.arc(cx - headR * 0.35, cy - bodyH / 2 - headR * 0.1, headR * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + headR * 0.35, cy - bodyH / 2 - headR * 0.1, headR * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#003300';
  ctx.beginPath();
  ctx.arc(cx - headR * 0.35, cy - bodyH / 2 - headR * 0.1, headR * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + headR * 0.35, cy - bodyH / 2 - headR * 0.1, headR * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Stitches on face
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(cx, cy - bodyH / 2 + headR * 0.3);
  ctx.lineTo(cx, cy - bodyH / 2 - headR * 0.3);
  ctx.stroke();

  if (stage >= 2) drawCrown(ctx, cx, cy - bodyH / 2 - headR, scale * (0.7 + stage * 0.1), '#9C27B0');
  if (stage === 3) drawHalo(ctx, cx, cy - bodyH / 2 - headR * 1.1, scale);
}

// ---- GOBLIN ----
function drawGoblin(ctx, cx, cy, stage, scale, synth) {
  const stageColors = ['#8BC34A', '#558B2F', '#33691E', '#FFD600'];
  const color = stageColors[stage] || stageColors[0];
  const bodyH = (38 + stage * 6) * scale;
  const bodyW = (18 + stage * 4) * scale;
  const headR = (13 + stage * 2.5) * scale;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodyH / 2 + 4 * scale, bodyW * 0.7, 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (bent, ready to spring)
  ctx.fillStyle = darken(color, 20);
  ctx.fillRect(cx - bodyW * 0.4, cy + bodyH * 0.2, bodyW * 0.28, bodyH * 0.45);
  ctx.fillRect(cx + bodyW * 0.12, cy + bodyH * 0.2, bodyW * 0.28, bodyH * 0.45);

  // Arms
  ctx.fillStyle = color;
  ctx.fillRect(cx - bodyW * 0.6, cy - bodyH * 0.1, bodyW * 0.22, bodyH * 0.3);
  ctx.fillRect(cx + bodyW * 0.38, cy - bodyH * 0.1, bodyW * 0.22, bodyH * 0.3);

  // Weapon (knife) for stage 1+
  if (stage >= 1) {
    ctx.fillStyle = '#aaa';
    ctx.fillRect(cx + bodyW * 0.6, cy - bodyH * 0.2, 4 * scale, 20 * scale);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(cx + bodyW * 0.58, cy + bodyH * 0.05, 8 * scale, 6 * scale);
  }

  // Body
  const bodyGrad = ctx.createLinearGradient(cx, cy - bodyH / 2, cx, cy + bodyH / 2);
  bodyGrad.addColorStop(0, lighten(color, 20));
  bodyGrad.addColorStop(1, darken(color, 20));
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 5 * scale);
  ctx.fill();

  // Head (bigger ears = goblin feature)
  const headGrad = ctx.createRadialGradient(cx, cy - bodyH / 2 - headR * 0.1, headR * 0.1, cx, cy - bodyH / 2, headR);
  headGrad.addColorStop(0, lighten(color, 25));
  headGrad.addColorStop(1, darken(color, 10));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - bodyH / 2, headR, 0, Math.PI * 2);
  ctx.fill();

  // Big pointy ears
  ctx.fillStyle = lighten(color, 10);
  // Left ear
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.8, cy - bodyH / 2);
  ctx.lineTo(cx - headR * 1.6, cy - bodyH / 2 - headR * 0.8);
  ctx.lineTo(cx - headR * 0.4, cy - bodyH / 2 - headR * 0.3);
  ctx.fill();
  // Right ear
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.8, cy - bodyH / 2);
  ctx.lineTo(cx + headR * 1.6, cy - bodyH / 2 - headR * 0.8);
  ctx.lineTo(cx + headR * 0.4, cy - bodyH / 2 - headR * 0.3);
  ctx.fill();

  // Eyes (beady and evil)
  drawEye(ctx, cx - headR * 0.35, cy - bodyH / 2 - headR * 0.1, 4.5 * scale, '#CC0000');
  drawEye(ctx, cx + headR * 0.35, cy - bodyH / 2 - headR * 0.1, 4.5 * scale, '#CC0000');

  // Toothy grin
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy - bodyH / 2 + headR * 0.35, headR * 0.4, 0.1, Math.PI - 0.1);
  ctx.fill();
  ctx.strokeStyle = darken(color, 30);
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  // Fang
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.15, cy - bodyH / 2 + headR * 0.35);
  ctx.lineTo(cx - headR * 0.25, cy - bodyH / 2 + headR * 0.55);
  ctx.lineTo(cx - headR * 0.05, cy - bodyH / 2 + headR * 0.35);
  ctx.fill();

  if (stage >= 2) drawCrown(ctx, cx, cy - bodyH / 2 - headR, scale * (0.65 + stage * 0.1), '#FFD700');
  if (stage === 3) drawHalo(ctx, cx, cy - bodyH / 2 - headR * 1.1, scale);
}

// ---- ORC ----
function drawOrc(ctx, cx, cy, stage, scale, synth) {
  const stageColors = ['#A1887F', '#6D4C41', '#4E342E', '#BF360C'];
  const color = stageColors[stage] || stageColors[0];
  const bodyH = (50 + stage * 10) * scale;
  const bodyW = (30 + stage * 6) * scale;
  const headR = (16 + stage * 3) * scale;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodyH / 2 + 5 * scale, bodyW * 0.85, 9 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = darken(color, 25);
  ctx.fillRect(cx - bodyW * 0.42, cy + bodyH * 0.2, bodyW * 0.35, bodyH * 0.5);
  ctx.fillRect(cx + bodyW * 0.07, cy + bodyH * 0.2, bodyW * 0.35, bodyH * 0.5);

  // Arms (huge)
  ctx.fillStyle = color;
  ctx.fillRect(cx - bodyW * 0.9, cy - bodyH * 0.15, bodyW * 0.45, bodyH * 0.35);
  ctx.fillRect(cx + bodyW * 0.45, cy - bodyH * 0.15, bodyW * 0.45, bodyH * 0.35);

  // Axe for stage 1+
  if (stage >= 1) {
    ctx.fillStyle = '#888';
    // Handle
    ctx.fillRect(cx + bodyW * 0.88, cy - bodyH * 0.35, 5 * scale, 40 * scale);
    // Blade
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.moveTo(cx + bodyW * 0.88, cy - bodyH * 0.35);
    ctx.lineTo(cx + bodyW * 0.88 + 18 * scale, cy - bodyH * 0.35 - 12 * scale);
    ctx.lineTo(cx + bodyW * 0.88 + 18 * scale, cy - bodyH * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  // Body
  const bodyGrad = ctx.createLinearGradient(cx - bodyW, cy - bodyH / 2, cx + bodyW, cy + bodyH / 2);
  bodyGrad.addColorStop(0, lighten(color, 15));
  bodyGrad.addColorStop(1, darken(color, 20));
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 8 * scale);
  ctx.fill();

  // Armor on body for stage 2+
  if (stage >= 2) {
    ctx.fillStyle = 'rgba(50,50,50,0.5)';
    roundRect(ctx, cx - bodyW * 0.45, cy - bodyH * 0.45, bodyW * 0.9, bodyH * 0.5, 4 * scale);
    ctx.fill();
  }

  // Head
  const headGrad = ctx.createRadialGradient(cx - headR * 0.2, cy - bodyH / 2 - headR * 0.2, headR * 0.1, cx, cy - bodyH / 2, headR);
  headGrad.addColorStop(0, lighten(color, 20));
  headGrad.addColorStop(1, darken(color, 10));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - bodyH / 2, headR, 0, Math.PI * 2);
  ctx.fill();

  // Tusks
  ctx.fillStyle = '#FFF9C4';
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.3, cy - bodyH / 2 + headR * 0.5);
  ctx.lineTo(cx - headR * 0.5, cy - bodyH / 2 + headR * 0.9);
  ctx.lineTo(cx - headR * 0.1, cy - bodyH / 2 + headR * 0.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.1, cy - bodyH / 2 + headR * 0.5);
  ctx.lineTo(cx + headR * 0.5, cy - bodyH / 2 + headR * 0.9);
  ctx.lineTo(cx + headR * 0.3, cy - bodyH / 2 + headR * 0.5);
  ctx.fill();

  // Eyes
  drawEye(ctx, cx - headR * 0.35, cy - bodyH / 2 - headR * 0.1, 5.5 * scale, '#8B0000');
  drawEye(ctx, cx + headR * 0.35, cy - bodyH / 2 - headR * 0.1, 5.5 * scale, '#8B0000');

  // Scar
  ctx.strokeStyle = darken(color, 40);
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.1, cy - bodyH / 2 - headR * 0.5);
  ctx.lineTo(cx + headR * 0.2, cy - bodyH / 2 + headR * 0.1);
  ctx.stroke();

  if (stage >= 2) drawCrown(ctx, cx, cy - bodyH / 2 - headR, scale * (0.8 + stage * 0.1), '#F44336');
  if (stage === 3) drawHalo(ctx, cx, cy - bodyH / 2 - headR * 1.15, scale);
}

// ---- DARK ELF ----
function drawDarkElf(ctx, cx, cy, stage, scale, synth) {
  const stageColors = ['#9C27B0', '#7B1FA2', '#4A148C', '#CE93D8'];
  const color = stageColors[stage] || stageColors[0];
  const bodyH = (48 + stage * 7) * scale;
  const bodyW = (16 + stage * 3) * scale;
  const headR = (12 + stage * 2) * scale;

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodyH / 2 + 4 * scale, bodyW * 0.75, 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Robe / skirt
  ctx.fillStyle = darken(color, 30);
  ctx.beginPath();
  ctx.moveTo(cx - bodyW * 0.5, cy + bodyH * 0.1);
  ctx.lineTo(cx - bodyW * 0.8, cy + bodyH * 0.65);
  ctx.lineTo(cx + bodyW * 0.8, cy + bodyH * 0.65);
  ctx.lineTo(cx + bodyW * 0.5, cy + bodyH * 0.1);
  ctx.closePath();
  ctx.fill();

  // Staff
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - bodyW * 0.7, cy + bodyH * 0.5);
  ctx.lineTo(cx - bodyW * 0.7, cy - bodyH * 0.5);
  ctx.stroke();
  // Orb on staff
  ctx.fillStyle = stage >= 2 ? '#E040FB' : '#AB47BC';
  ctx.beginPath();
  ctx.arc(cx - bodyW * 0.7, cy - bodyH * 0.55, 7 * scale, 0, Math.PI * 2);
  ctx.fill();
  // Glow
  ctx.fillStyle = 'rgba(224, 64, 251, 0.3)';
  ctx.beginPath();
  ctx.arc(cx - bodyW * 0.7, cy - bodyH * 0.55, 11 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Body
  const bodyGrad = ctx.createLinearGradient(cx, cy - bodyH / 2, cx, cy + bodyH * 0.1);
  bodyGrad.addColorStop(0, lighten(color, 20));
  bodyGrad.addColorStop(1, darken(color, 15));
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH * 0.65, 5 * scale);
  ctx.fill();

  // Arms
  ctx.fillStyle = lighten(color, 15);
  // Right arm (holding staff)
  ctx.fillRect(cx - bodyW * 0.7, cy - bodyH * 0.08, bodyW * 0.22, bodyH * 0.35);
  // Left arm
  ctx.fillRect(cx + bodyW * 0.48, cy - bodyH * 0.08, bodyW * 0.22, bodyH * 0.25);

  // Head
  const headGrad = ctx.createRadialGradient(cx, cy - bodyH / 2 - headR * 0.3, headR * 0.1, cx, cy - bodyH / 2, headR);
  headGrad.addColorStop(0, lighten(color, 30));
  headGrad.addColorStop(1, darken(color, 5));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - bodyH / 2, headR, 0, Math.PI * 2);
  ctx.fill();

  // Long pointed ears
  ctx.fillStyle = lighten(color, 15);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.85, cy - bodyH / 2 - headR * 0.1);
  ctx.lineTo(cx - headR * 1.8, cy - bodyH / 2 - headR * 0.6);
  ctx.lineTo(cx - headR * 0.5, cy - bodyH / 2 + headR * 0.2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.85, cy - bodyH / 2 - headR * 0.1);
  ctx.lineTo(cx + headR * 1.8, cy - bodyH / 2 - headR * 0.6);
  ctx.lineTo(cx + headR * 0.5, cy - bodyH / 2 + headR * 0.2);
  ctx.fill();

  // Silver hair
  ctx.fillStyle = '#E0E0E0';
  ctx.beginPath();
  ctx.arc(cx, cy - bodyH / 2, headR * 0.95, Math.PI * 1.1, Math.PI * 1.9);
  ctx.fill();
  // Hair strands flowing down
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * headR * 0.5, cy - bodyH / 2 - headR * 0.9);
    ctx.bezierCurveTo(cx + i * headR * 0.7, cy - bodyH / 2 + headR * 0.5, cx + i * headR * 0.9, cy - bodyH * 0.2, cx + i * headR * 1.0, cy - bodyH * 0.05);
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  }

  // Glowing eyes
  ctx.fillStyle = '#E040FB';
  ctx.beginPath();
  ctx.ellipse(cx - headR * 0.35, cy - bodyH / 2 - headR * 0.1, headR * 0.18, headR * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.35, cy - bodyH / 2 - headR * 0.1, headR * 0.18, headR * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  if (stage >= 2) drawCrown(ctx, cx, cy - bodyH / 2 - headR, scale * (0.6 + stage * 0.1), '#9C27B0');
  if (stage === 3) drawHalo(ctx, cx, cy - bodyH / 2 - headR * 1.1, scale);
}

// ---- DRAGON ----
function drawDragon(ctx, cx, cy, stage, scale, synth) {
  const stageColors = [['#EF5350','#C62828'], ['#E53935','#B71C1C'], ['#B71C1C','#7F0000'], ['#FF6F00','#E65100']];
  const [color, darkColor] = stageColors[stage] || stageColors[0];
  const bodyW = (45 + stage * 10) * scale;
  const bodyH = (30 + stage * 7) * scale;
  const headR = (15 + stage * 3) * scale;
  const neckLen = (20 + stage * 4) * scale;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodyH * 0.7, bodyW * 0.75, 9 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.strokeStyle = color;
  ctx.lineWidth = 10 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + bodyW * 0.5, cy);
  ctx.bezierCurveTo(cx + bodyW * 0.9, cy, cx + bodyW * 1.1, cy - bodyH * 0.3, cx + bodyW * 0.85, cy - bodyH * 0.6);
  ctx.stroke();

  // Wings (large)
  // Left wing
  ctx.fillStyle = 'rgba(100,0,0,0.7)';
  ctx.beginPath();
  ctx.moveTo(cx - bodyW * 0.3, cy - bodyH * 0.1);
  ctx.bezierCurveTo(cx - bodyW * 0.9, cy - bodyH * 1.5, cx - bodyW * 1.3, cy - bodyH * 0.8, cx - bodyW * 0.8, cy + bodyH * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(color, 30);
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  // Right wing
  ctx.fillStyle = 'rgba(100,0,0,0.7)';
  ctx.beginPath();
  ctx.moveTo(cx + bodyW * 0.3, cy - bodyH * 0.1);
  ctx.bezierCurveTo(cx + bodyW * 0.9, cy - bodyH * 1.5, cx + bodyW * 1.3, cy - bodyH * 0.8, cx + bodyW * 0.8, cy + bodyH * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body
  const bodyGrad = ctx.createRadialGradient(cx - bodyW * 0.2, cy - bodyH * 0.2, bodyW * 0.1, cx, cy, bodyW);
  bodyGrad.addColorStop(0, lighten(color, 20));
  bodyGrad.addColorStop(0.6, color);
  bodyGrad.addColorStop(1, darkColor);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, bodyW * 0.5, bodyH * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly scales
  ctx.fillStyle = 'rgba(255,200,180,0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodyH * 0.1, bodyW * 0.3, bodyH * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = darkColor;
  ctx.fillRect(cx - bodyW * 0.4, cy + bodyH * 0.3, bodyW * 0.18, bodyH * 0.55);
  ctx.fillRect(cx + bodyW * 0.22, cy + bodyH * 0.3, bodyW * 0.18, bodyH * 0.55);
  // Claws
  ctx.fillStyle = '#333';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx - bodyW * 0.38 + i * 5 * scale, cy + bodyH * 0.85, 3 * scale, 5 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + bodyW * 0.24 + i * 5 * scale, cy + bodyH * 0.85, 3 * scale, 5 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Neck and head
  ctx.strokeStyle = color;
  ctx.lineWidth = 12 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - bodyW * 0.2, cy - bodyH * 0.4);
  ctx.bezierCurveTo(cx - bodyW * 0.4, cy - bodyH * 0.8, cx - bodyW * 0.5, cy - bodyH * 0.9, cx - bodyW * 0.45, cy - bodyH * 1.2);
  ctx.stroke();

  // Head
  const hx = cx - bodyW * 0.45;
  const hy = cy - bodyH * 1.2;
  const headGrad = ctx.createRadialGradient(hx, hy, headR * 0.1, hx, hy, headR);
  headGrad.addColorStop(0, lighten(color, 25));
  headGrad.addColorStop(1, darkColor);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(hx, hy, headR * 1.3, headR, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Horns
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(hx - headR * 0.4, hy - headR * 0.6);
  ctx.lineTo(hx - headR * 0.8, hy - headR * 1.5);
  ctx.lineTo(hx - headR * 0.1, hy - headR * 0.8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx + headR * 0.1, hy - headR * 0.6);
  ctx.lineTo(hx + headR * 0.5, hy - headR * 1.5);
  ctx.lineTo(hx + headR * 0.5, hy - headR * 0.8);
  ctx.fill();

  // Snout
  ctx.fillStyle = darken(color, 10);
  ctx.beginPath();
  ctx.ellipse(hx + headR * 0.5, hy + headR * 0.1, headR * 0.6, headR * 0.35, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(hx + headR * 0.35, hy + headR * 0.05, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx + headR * 0.65, hy + headR * 0.05, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Eye (fierce)
  drawEye(ctx, hx - headR * 0.15, hy - headR * 0.2, 5 * scale, '#FF6F00');

  // Flame breath for stage 3
  if (stage === 3) {
    ctx.fillStyle = 'rgba(255,165,0,0.7)';
    ctx.beginPath();
    ctx.ellipse(hx + headR * 1.2, hy + headR * 0.2, headR * 0.8, headR * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,50,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(hx + headR * 1.6, hy + headR * 0.25, headR * 0.5, headR * 0.2, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spines on back
  ctx.fillStyle = '#333';
  for (let i = 0; i < 4 + stage; i++) {
    const sx = cx - bodyW * 0.3 + i * (bodyW * 0.5 / (3 + stage));
    ctx.beginPath();
    ctx.moveTo(sx, cy - bodyH * 0.4);
    ctx.lineTo(sx + 3 * scale, cy - bodyH * 0.7 - i % 2 * 5 * scale);
    ctx.lineTo(sx + 6 * scale, cy - bodyH * 0.4);
    ctx.fill();
  }
}

// ---- DEMON ----
function drawDemon(ctx, cx, cy, stage, scale, synth) {
  const stageColors = [['#C62828','#7B0000'], ['#B71C1C','#4A0000'], ['#880E4F','#40002F'], ['#D50000','#8B0000']];
  const [color, darkColor] = stageColors[stage] || stageColors[0];
  const bodyH = (55 + stage * 9) * scale;
  const bodyW = (28 + stage * 5) * scale;
  const headR = (15 + stage * 3) * scale;

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + bodyH / 2 + 6 * scale, bodyW, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bat wings
  ctx.fillStyle = `rgba(80,0,0,0.8)`;
  // Left wing
  ctx.beginPath();
  ctx.moveTo(cx - bodyW * 0.4, cy - bodyH * 0.15);
  ctx.bezierCurveTo(cx - bodyW * 1.3, cy - bodyH * 1.1, cx - bodyW * 1.6, cy - bodyH * 0.3, cx - bodyW * 0.7, cy + bodyH * 0.3);
  ctx.closePath();
  ctx.fill();
  // Wing ribs
  ctx.strokeStyle = 'rgba(120,0,0,0.6)';
  ctx.lineWidth = 1.5 * scale;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - bodyW * 0.4, cy - bodyH * 0.15);
    ctx.bezierCurveTo(cx - bodyW * (0.7 + i * 0.25), cy - bodyH * (0.5 + i * 0.1), cx - bodyW * (0.9 + i * 0.2), cy - bodyH * 0.1, cx - bodyW * (0.55 + i * 0.05), cy + bodyH * 0.2);
    ctx.stroke();
  }

  ctx.fillStyle = `rgba(80,0,0,0.8)`;
  // Right wing
  ctx.beginPath();
  ctx.moveTo(cx + bodyW * 0.4, cy - bodyH * 0.15);
  ctx.bezierCurveTo(cx + bodyW * 1.3, cy - bodyH * 1.1, cx + bodyW * 1.6, cy - bodyH * 0.3, cx + bodyW * 0.7, cy + bodyH * 0.3);
  ctx.closePath();
  ctx.fill();
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + bodyW * 0.4, cy - bodyH * 0.15);
    ctx.bezierCurveTo(cx + bodyW * (0.7 + i * 0.25), cy - bodyH * (0.5 + i * 0.1), cx + bodyW * (0.9 + i * 0.2), cy - bodyH * 0.1, cx + bodyW * (0.55 + i * 0.05), cy + bodyH * 0.2);
    ctx.stroke();
  }

  // Tail
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 7 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy + bodyH * 0.5);
  ctx.bezierCurveTo(cx + bodyW * 0.3, cy + bodyH * 0.8, cx + bodyW * 0.6, cy + bodyH * 0.7, cx + bodyW * 0.5, cy + bodyH * 0.55);
  ctx.stroke();
  // Spade tail tip
  ctx.fillStyle = darkColor;
  ctx.beginPath();
  ctx.moveTo(cx + bodyW * 0.5, cy + bodyH * 0.53);
  ctx.lineTo(cx + bodyW * 0.65, cy + bodyH * 0.65);
  ctx.lineTo(cx + bodyW * 0.35, cy + bodyH * 0.65);
  ctx.fill();

  // Legs
  ctx.fillStyle = darken(color, 25);
  ctx.fillRect(cx - bodyW * 0.42, cy + bodyH * 0.2, bodyW * 0.35, bodyH * 0.45);
  ctx.fillRect(cx + bodyW * 0.07, cy + bodyH * 0.2, bodyW * 0.35, bodyH * 0.45);

  // Arms with claws
  ctx.fillStyle = color;
  ctx.fillRect(cx - bodyW * 0.85, cy - bodyH * 0.12, bodyW * 0.45, bodyH * 0.3);
  ctx.fillRect(cx + bodyW * 0.4, cy - bodyH * 0.12, bodyW * 0.45, bodyH * 0.3);
  // Claw tips
  ctx.fillStyle = '#333';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - bodyW * 0.85 - 2 * scale + i * 5 * scale, cy + bodyH * 0.18);
    ctx.lineTo(cx - bodyW * 0.85 + i * 5 * scale, cy + bodyH * 0.28);
    ctx.lineTo(cx - bodyW * 0.85 + 4 * scale + i * 5 * scale, cy + bodyH * 0.18);
    ctx.fill();
  }

  // Body
  const bodyGrad = ctx.createLinearGradient(cx - bodyW, cy - bodyH / 2, cx + bodyW, cy + bodyH / 2);
  bodyGrad.addColorStop(0, lighten(color, 15));
  bodyGrad.addColorStop(0.5, color);
  bodyGrad.addColorStop(1, darkColor);
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 8 * scale);
  ctx.fill();

  // Muscle lines
  ctx.strokeStyle = darken(color, 20);
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(cx, cy - bodyH * 0.4);
  ctx.lineTo(cx, cy + bodyH * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy - bodyH * 0.15, bodyW * 0.3, bodyH * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Arcane rune on chest
  if (stage >= 2) {
    ctx.fillStyle = 'rgba(255,100,50,0.6)';
    ctx.font = `${14 * scale}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('⚔', cx, cy - bodyH * 0.05);
  }

  // Head
  const headGrad = ctx.createRadialGradient(cx - headR * 0.2, cy - bodyH / 2 - headR * 0.2, headR * 0.1, cx, cy - bodyH / 2, headR);
  headGrad.addColorStop(0, lighten(color, 20));
  headGrad.addColorStop(1, darkColor);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - bodyH / 2, headR, 0, Math.PI * 2);
  ctx.fill();

  // Curved horns
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 5 * scale;
  ctx.lineCap = 'round';
  // Left horn
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.5, cy - bodyH / 2 - headR * 0.7);
  ctx.bezierCurveTo(cx - headR * 1.0, cy - bodyH / 2 - headR * 1.6, cx - headR * 0.2, cy - bodyH / 2 - headR * 1.8, cx - headR * 0.3, cy - bodyH / 2 - headR * 1.4);
  ctx.stroke();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.5, cy - bodyH / 2 - headR * 0.7);
  ctx.bezierCurveTo(cx + headR * 1.0, cy - bodyH / 2 - headR * 1.6, cx + headR * 0.2, cy - bodyH / 2 - headR * 1.8, cx + headR * 0.3, cy - bodyH / 2 - headR * 1.4);
  ctx.stroke();

  // Glowing red eyes
  ctx.fillStyle = '#FF1744';
  ctx.shadowColor = '#FF1744';
  ctx.shadowBlur = 8 * scale;
  ctx.beginPath();
  ctx.ellipse(cx - headR * 0.35, cy - bodyH / 2 - headR * 0.1, headR * 0.22, headR * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.35, cy - bodyH / 2 - headR * 0.1, headR * 0.22, headR * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Fanged mouth
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(cx, cy - bodyH / 2 + headR * 0.5, headR * 0.5, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#fff';
  // Fangs
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.moveTo(cx + i * headR * 0.3, cy - bodyH / 2 + headR * 0.5);
    ctx.lineTo(cx + i * headR * 0.4, cy - bodyH / 2 + headR * 0.75);
    ctx.lineTo(cx + i * headR * 0.2, cy - bodyH / 2 + headR * 0.5);
    ctx.fill();
  }

  if (stage >= 2) {
    // Dark crown
    drawCrown(ctx, cx, cy - bodyH / 2 - headR, scale * (0.8 + stage * 0.1), '#B71C1C');
    if (stage === 3) {
      // Fiery crown for demon king
      ctx.fillStyle = 'rgba(255,80,0,0.6)';
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI / 2 + (i / 4) * Math.PI;
        const fx = cx + Math.cos(angle) * headR * 1.1;
        const fy = cy - bodyH / 2 - headR;
        ctx.beginPath();
        ctx.arc(fx, fy, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// ---- Accessories ----
function drawCrown(ctx, cx, topY, scale, color) {
  const w = 22 * scale;
  const h = 12 * scale;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, topY + h);
  ctx.lineTo(cx - w / 2, topY);
  ctx.lineTo(cx - w / 4, topY + h * 0.5);
  ctx.lineTo(cx, topY);
  ctx.lineTo(cx + w / 4, topY + h * 0.5);
  ctx.lineTo(cx + w / 2, topY);
  ctx.lineTo(cx + w / 2, topY + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(color, 30);
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  // Gems
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, topY + h * 0.3, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawHalo(ctx, cx, y, scale) {
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3 * scale;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 8 * scale;
  ctx.beginPath();
  ctx.ellipse(cx, y, 18 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawFlameEffect(ctx, cx, cy, scale) {
  ctx.fillStyle = 'rgba(255,100,0,0.5)';
  for (let i = 0; i < 5; i++) {
    const x = cx - 20 * scale + i * 10 * scale;
    const h = (15 + Math.random() * 10) * scale;
    ctx.beginPath();
    ctx.moveTo(x, cy + 30 * scale);
    ctx.bezierCurveTo(x - 5 * scale, cy + 20 * scale, x + 5 * scale, cy + 10 * scale, x, cy + 30 * scale - h);
    ctx.fill();
  }
}

function drawDarkAura(ctx, cx, cy, scale) {
  const grad = ctx.createRadialGradient(cx, cy, 10 * scale, cx, cy, 55 * scale);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.7, 'transparent');
  grad.addColorStop(1, 'rgba(60,0,80,0.35)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 55 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawWingOverlay(ctx, cx, cy, scale) {
  ctx.fillStyle = 'rgba(150,200,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 15 * scale);
  ctx.bezierCurveTo(cx - 30 * scale, cy - 50 * scale, cx - 50 * scale, cy - 20 * scale, cx - 20 * scale, cy + 5 * scale);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 15 * scale);
  ctx.bezierCurveTo(cx + 30 * scale, cy - 50 * scale, cx + 50 * scale, cy - 20 * scale, cx + 20 * scale, cy + 5 * scale);
  ctx.fill();
}

// ---- Color utilities ----
function lighten(hex, amount) {
  return adjustColor(hex, amount);
}
function darken(hex, amount) {
  return adjustColor(hex, -amount);
}
function adjustColor(hex, amount) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  return `rgb(${r},${g},${b})`;
}

// Create a canvas element and draw a monster onto it
function createMonsterCanvas(monsterType, stage, synthTraits = [], size = 120) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  drawMonster(canvas, monsterType, stage, synthTraits);
  return canvas;
}

// Animate a monster canvas (slight bounce)
function animateMonster(canvas, monsterType, stage, synthTraits = [], isPlayer = false) {
  let frame = 0;
  const interval = setInterval(() => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const offsetY = Math.sin(frame * 0.1) * 3;
    ctx.save();
    ctx.translate(0, offsetY);
    drawMonster(canvas, monsterType, stage, synthTraits);
    ctx.restore();
    frame++;
  }, 50);
  return interval;
}

return { drawMonster, createMonsterCanvas, animateMonster };

})();
