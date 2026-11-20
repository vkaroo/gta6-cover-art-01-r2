// Screenshot driver for Sunset Cover Studio. The screenshot script opens
// the app with a ?shot= query and waits for window.__shotReady:
//   ?shot=cover&photo=beach&layout=vice&grade=sunset&title=...&size=1080x1350
//     draws one exported cover full-window (no editor chrome).
//   ?shot=editor&photo=boulevard&title=...
//     shows the editor with a sample photo loaded in every panel.
(function () {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  window.__shotReady = false;

  function finish() {
    window.__shotReady = true;
    document.title = 'shot ready';
  }

  async function waitForFonts() {
    try {
      await Promise.all([
        document.fonts.load('100px Anton'),
        document.fonts.load('40px "Bebas Neue"'),
        document.fonts.ready,
      ]);
    } catch (e) { /* fall back to system fonts */ }
  }

  async function runCoverShot() {
    const state = window.__cover.state;
    state.layout = params.get('layout') || 'vice';
    state.grade = params.get('grade') || 'sunset';
    state.title = params.get('title') || 'Sunset Heist';
    state.subtitle = params.get('subtitle') || 'Neon Nights';
    const size = (params.get('size') || '1080x1350').split('x');
    const exportW = Number(size[0]) || 1080;
    const exportH = Number(size[1]) || 1350;
    document.body.classList.add('shot-cover');
    const photo = params.get('photo') || 'beach';
    await window.__cover.loadSample(photo);
    window.__cover.state.panels.forEach((slot, i) => {
      if (!slot.image && window.__cover.state.panels[0].image) {
        window.__cover.state.panels[i] = Object.assign({}, window.__cover.state.panels[0]);
      }
    });
    // Alternate panels between the two samples so multi-panel covers show variety.
    const other = photo === 'beach' ? 'boulevard' : 'beach';
    if (window.__cover.state.panels.length > 1) {
      await window.__cover.setPanelPhoto(1, 'samples/' + other + '.jpg', other);
    }
    if (window.__cover.state.panels.length > 2) {
      await window.__cover.setPanelPhoto(2, 'samples/' + photo + '.jpg', photo);
    }
    if (window.__cover.state.panels.length > 3) {
      await window.__cover.setPanelPhoto(3, 'samples/' + other + '.jpg', other);
    }
    await waitForFonts();
    const canvas = document.getElementById('preview');
    canvas.width = exportW;
    canvas.height = exportH;
    const ctx = canvas.getContext('2d');
    const clean = Object.assign({}, window.__cover.state, { selectedPanel: -1 });
    drawCover(ctx, exportW, exportH, clean);
    finish();
  }

  async function runEditorShot() {
    const state = window.__cover.state;
    state.title = params.get('title') || 'Boulevard Queen';
    state.subtitle = params.get('subtitle') || 'Neon Nights';
    state.layout = params.get('layout') || 'vice';
    state.grade = params.get('grade') || 'sunset';
    const photo = params.get('photo') || 'boulevard';
    await window.__cover.loadSample(photo);
    window.__cover.state.panels.forEach((slot, i) => {
      if (!slot.image && window.__cover.state.panels[0].image) {
        window.__cover.state.panels[i] = Object.assign({}, window.__cover.state.panels[0]);
      }
    });
    const other = photo === 'beach' ? 'boulevard' : 'beach';
    if (window.__cover.state.panels.length > 1) {
      await window.__cover.setPanelPhoto(1, 'samples/' + other + '.jpg', other);
    }
    await waitForFonts();
    window.__cover.redrawPreview();
    finish();
  }

  if (shot === 'cover') runCoverShot().catch(finish);
  else if (shot === 'editor') runEditorShot().catch(finish);
})();
