// Editor for Sunset Cover Studio: wires the controls to the cover state,
// loads sample photos and uploads, drags panels to pan, and exports PNGs.
const SAMPLES = {
  beach: 'samples/beach.jpg',
  boulevard: 'samples/boulevard.jpg',
};
const EXPORT_SIZES = [
  { id: '1080x1080', label: '1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: '1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: '1920 × 1080', w: 1920, h: 1080 },
];

const coverState = {
  layout: 'vice',
  grade: 'sunset',
  title: 'Sunset Heist',
  subtitle: 'Neon Nights',
  exportSize: EXPORT_SIZES[1],
  selectedPanel: 0,
  panels: [],
};

function panelCount() {
  return LAYOUTS[coverState.layout].panels.length;
}

function ensurePanels() {
  while (coverState.panels.length < panelCount()) {
    coverState.panels.push({ image: null, src: null, zoom: 1, ox: 0, oy: 0 });
  }
  coverState.panels.length = panelCount();
  if (coverState.selectedPanel >= panelCount()) coverState.selectedPanel = 0;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + url));
    img.src = url;
  });
}

async function setPanelPhoto(index, url, label) {
  const img = await loadImage(url);
  coverState.panels[index] = { image: img, src: label || url, zoom: 1, ox: 0, oy: 0 };
  redrawPreview();
}

async function loadSample(name) {
  const url = SAMPLES[name];
  if (!url) return;
  await setPanelPhoto(coverState.selectedPanel, url, name);
}

function fillAllPanels() {
  const current = coverState.panels[coverState.selectedPanel];
  if (!current || !current.image) return;
  for (let i = 0; i < coverState.panels.length; i++) {
    coverState.panels[i] = { image: current.image, src: current.src, zoom: 1, ox: 0, oy: 0 };
  }
  redrawPreview();
}

const previewCanvas = document.getElementById('preview');

function redrawPreview() {
  ensurePanels();
  const rect = previewCanvas.getBoundingClientRect();
  const w = Math.max(320, Math.round(rect.width));
  const h = Math.round((w * coverState.exportSize.h) / coverState.exportSize.w);
  if (previewCanvas.width !== w || previewCanvas.height !== h) {
    previewCanvas.width = w;
    previewCanvas.height = h;
  }
  const ctx = previewCanvas.getContext('2d');
  drawCover(ctx, previewCanvas.width, previewCanvas.height, coverState);
  updatePanelLabel();
}

function updatePanelLabel() {
  const label = document.getElementById('panelLabel');
  if (label) label.textContent = 'Panel ' + (coverState.selectedPanel + 1) + ' of ' + panelCount();
  document.querySelectorAll('#panelChips button').forEach((button, i) => {
    button.classList.toggle('active', i === coverState.selectedPanel);
  });
}

function buildChips(containerId, items, current, onPick) {
  const box = document.getElementById(containerId);
  box.innerHTML = '';
  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    if (item.id === current) button.classList.add('active');
    button.addEventListener('click', () => {
      onPick(item.id);
      box.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
    });
    box.appendChild(button);
  });
}

function rebuildPanelChips() {
  const box = document.getElementById('panelChips');
  box.innerHTML = '';
  for (let i = 0; i < panelCount(); i++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Panel ' + (i + 1);
    if (i === coverState.selectedPanel) button.classList.add('active');
    button.addEventListener('click', () => {
      coverState.selectedPanel = i;
      redrawPreview();
      syncZoomControl();
    });
    box.appendChild(button);
  }
}

function syncZoomControl() {
  const zoom = document.getElementById('zoom');
  const slot = coverState.panels[coverState.selectedPanel];
  const value = Math.round(((slot && slot.zoom) || 1) * 100);
  zoom.value = String(value);
  document.getElementById('zoomValue').textContent = value + '%';
}

function bindEditor() {
  buildChips('layoutButtons', LAYOUT_IDS.map((id) => ({ id, label: LAYOUTS[id].label })), coverState.layout, (id) => {
    coverState.layout = id;
    ensurePanels();
    rebuildPanelChips();
    redrawPreview();
  });
  buildChips('gradeButtons', GRADE_IDS.map((id) => ({ id, label: GRADES[id].label })), coverState.grade, (id) => {
    coverState.grade = id;
    redrawPreview();
  });
  buildChips('sizeButtons', EXPORT_SIZES, coverState.exportSize.id, (id) => {
    coverState.exportSize = EXPORT_SIZES.find((s) => s.id === id);
    redrawPreview();
  });
  rebuildPanelChips();

  document.getElementById('sampleBeach').addEventListener('click', () => loadSample('beach'));
  document.getElementById('sampleBoulevard').addEventListener('click', () => loadSample('boulevard'));
  document.getElementById('fillAll').addEventListener('click', fillAllPanels);
  document.getElementById('resetPan').addEventListener('click', () => {
    const slot = coverState.panels[coverState.selectedPanel];
    if (slot) { slot.ox = 0; slot.oy = 0; slot.zoom = 1; }
    syncZoomControl();
    redrawPreview();
  });
  document.getElementById('zoom').addEventListener('input', (event) => {
    const slot = coverState.panels[coverState.selectedPanel];
    if (slot) slot.zoom = Number(event.target.value) / 100;
    document.getElementById('zoomValue').textContent = event.target.value + '%';
    redrawPreview();
  });
  document.getElementById('title').addEventListener('input', (event) => {
    coverState.title = event.target.value;
    redrawPreview();
  });
  document.getElementById('subtitle').addEventListener('input', (event) => {
    coverState.subtitle = event.target.value;
    redrawPreview();
  });
  document.getElementById('upload').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPanelPhoto(coverState.selectedPanel, String(reader.result), 'upload');
    reader.readAsDataURL(file);
  });
  document.getElementById('exportPng').addEventListener('click', () => exportCover(coverState.exportSize));

  // Drag a panel to pan its photo; clicking a panel selects it.
  let drag = null;
  previewCanvas.addEventListener('pointerdown', (event) => {
    const rect = previewCanvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const hit = LAYOUTS[coverState.layout].panels.findIndex((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
    if (hit === -1) return;
    coverState.selectedPanel = hit;
    syncZoomControl();
    redrawPreview();
    const slot = coverState.panels[hit];
    drag = { x: event.clientX, y: event.clientY, ox: slot.ox, oy: slot.oy, panel: LAYOUTS[coverState.layout].panels[hit], rect };
    previewCanvas.setPointerCapture(event.pointerId);
  });
  previewCanvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const slot = coverState.panels[coverState.selectedPanel];
    if (!slot) return;
    slot.ox = drag.ox + ((event.clientX - drag.x) / drag.rect.width) / drag.panel.w;
    slot.oy = drag.oy + ((event.clientY - drag.y) / drag.rect.height) / drag.panel.h;
    redrawPreview();
  });
  const endDrag = () => { drag = null; };
  previewCanvas.addEventListener('pointerup', endDrag);
  previewCanvas.addEventListener('pointercancel', endDrag);
}

function exportCover(size) {
  const canvas = renderCoverCanvas(coverState, size.w, size.h);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.getElementById('downloadLink');
    link.href = url;
    link.download = 'sunset-cover-' + size.w + 'x' + size.h + '.png';
    link.hidden = false;
    link.textContent = 'Download your cover (' + size.w + ' × ' + size.h + ' PNG)';
    document.getElementById('exportNote').textContent = 'Cover exported at ' + size.w + ' × ' + size.h + ' — click the download link.';
    link.click();
  }, 'image/png');
}

// Test hook for the screenshot driver: returns the exported PNG as a data URL.
function exportPngDataUrl(width, height) {
  return renderCoverCanvas(coverState, width, height).toDataURL('image/png');
}

window.__cover = { state: coverState, exportPngDataUrl, setPanelPhoto, loadSample, redrawPreview };

ensurePanels();
bindEditor();
redrawPreview();
// Redraw once the display fonts arrive so the lettering uses Anton / Bebas Neue.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => redrawPreview());
}
