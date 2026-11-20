// Cover renderer for Sunset Cover Studio. drawCover paints the multi-panel
// poster onto any 2D canvas context at any pixel size: each panel's photo is
// cover-fitted with its own pan and zoom, then the grade's wash, sun glow and
// vignette are layered on, and the caption is lettered over a bottom scrim.
// The same function draws the live preview and the exported PNG, so what the
// editor shows is exactly what the PNG holds.
function drawCover(ctx, width, height, state) {
  const layout = LAYOUTS[state.layout];
  const grade = GRADES[state.grade];
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0a0512';
  ctx.fillRect(0, 0, width, height);

  layout.panels.forEach((panel, i) => {
    const slot = state.panels[i] || {};
    const px = panel.x * width;
    const py = panel.y * height;
    const pw = panel.w * width;
    const ph = panel.h * height;
    drawPanelPhoto(ctx, slot, px, py, pw, ph, grade);
    // Thin black gutter frame around the panel.
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, width * 0.004);
    ctx.strokeRect(px, py, pw, ph);
    if (i === state.selectedPanel) {
      ctx.save();
      ctx.setLineDash([Math.max(6, width * 0.012), Math.max(6, width * 0.012)]);
      ctx.strokeStyle = '#37e0d8';
      ctx.lineWidth = Math.max(2, width * 0.005);
      ctx.strokeRect(px + 3, py + 3, pw - 6, ph - 6);
      ctx.restore();
    }
  });

  drawGradeOverlays(ctx, width, height, grade);
  drawCaption(ctx, width, height, state, grade);
  ctx.restore();
}

// Cover-fit one photo into a panel rect, honouring its pan (ox, oy in panel
// fractions) and zoom, then tinting it with the grade's saturation.
function drawPanelPhoto(ctx, slot, px, py, pw, ph, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  ctx.fillStyle = '#1a0b26';
  ctx.fillRect(px, py, pw, ph);
  const img = slot.image;
  if (img && img.naturalWidth > 0) {
    const zoom = slot.zoom || 1;
    const base = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * base;
    const dh = img.naturalHeight * base;
    const dx = px + (pw - dw) / 2 + (slot.ox || 0) * pw;
    const dy = py + (ph - dh) / 2 + (slot.oy || 0) * ph;
    ctx.filter = 'saturate(' + grade.saturate + ')';
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#2d1a4d';
    ctx.fillRect(px + pw * 0.1, py + ph * 0.1, pw * 0.8, ph * 0.8);
    ctx.fillStyle = '#c9b3e0';
    ctx.font = Math.round(ph * 0.07) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Add a photo', px + pw / 2, py + ph / 2);
  }
  ctx.restore();
}

// Wash, sun glow and vignette over the whole cover.
function drawGradeOverlays(ctx, width, height, grade) {
  ctx.save();
  const wash = grade.wash;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(' + wash[0] + ',' + wash[1] + ',' + wash[2] + ',' + grade.washAlpha + ')';
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'screen';
  const glow = ctx.createRadialGradient(
    grade.glowX * width, grade.glowY * height, 0,
    grade.glowX * width, grade.glowY * height, grade.glowR * Math.max(width, height),
  );
  glow.addColorStop(0, grade.glowColor);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
  const vig = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.45,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,' + grade.vignette + ')');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// Subtitle in Bebas Neue above the big Anton title, over a dark scrim at
// the bottom of the cover, with an accent bar under the title.
function drawCaption(ctx, width, height, state, grade) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  if (!title && !subtitle) return;
  const scrimH = height * 0.30;
  const scrim = ctx.createLinearGradient(0, height - scrimH, 0, height);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, 'rgba(0,0,0,' + grade.scrimAlpha + ')');
  ctx.save();
  ctx.fillStyle = scrim;
  ctx.fillRect(0, height - scrimH, width, scrimH);
  const pad = width * 0.045;
  const titleSize = Math.round(width * 0.105);
  const subSize = Math.round(width * 0.042);
  let baseline = height - pad - titleSize * 0.25;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  if (title) {
    ctx.font = titleSize + 'px Anton, sans-serif';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = Math.max(3, titleSize * 0.10);
    ctx.strokeText(title, pad, baseline);
    ctx.fillStyle = grade.titleColor;
    ctx.fillText(title, pad, baseline);
    // Accent bar under the title.
    const barW = Math.min(width * 0.34, ctx.measureText(title).width * 0.55);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(pad, baseline + titleSize * 0.12, barW, Math.max(4, titleSize * 0.07));
    baseline -= titleSize * 0.92;
  }
  if (subtitle) {
    ctx.font = subSize + 'px "Bebas Neue", sans-serif';
    try { ctx.letterSpacing = Math.round(subSize * 0.35) + 'px'; } catch (e) { /* older canvas */ }
    ctx.fillStyle = grade.subtitleColor;
    ctx.fillText(subtitle, pad, baseline);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  }
  ctx.restore();
}

// Render the cover at an export size and hand back a fresh canvas.
function renderCoverCanvas(state, exportWidth, exportHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext('2d');
  const clean = Object.assign({}, state, { selectedPanel: -1 });
  drawCover(ctx, exportWidth, exportHeight, clean);
  return canvas;
}
