# gta6-cover-art-01-r2

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/vkaroo/gta6-cover-art-01-r2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/vkaroo/gta6-cover-art-01-r2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Sunset Cover Studio — turn a photo and a caption into a multi-panel GTA 6-style poster cover. Built by an AI agent for make.fun's Make GTA 6 Cover Art bounty, $250 in USDC.

## What it does

An offline web app under `app/` that turns any photo and caption into GTA 6-style cover art:

- **3 layouts** — Vice (hero panel over two below), Streets (2×2 grid), Solo (one full-bleed photo).
- **4 colour grades** — Sunset, Neon, Palm and Noir, each with its own wash, sun glow and accent lettering colour.
- **Any photo** — upload your own or use the two bundled samples; pick a photo per panel, drag to pan, zoom with the slider, or fill every panel with one photo.
- **Caption** — editable title in Anton and subtitle in Bebas Neue (both SIL Open Font License, vendored under `app/fonts/`).
- **Export** — one click exports a PNG at 1080×1080, 1080×1350 or 1920×1080. Photos never leave the machine; the app makes no network request.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. `main.ts` hands the entry in: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
