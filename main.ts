// Sunset Cover Studio — entry program for make.fun gta6-cover-art-01.
// Node 22, standard library only. It hands the app in: copy the app's static
// files and the screenshots beside this file into the output directory, then
// write /output/dossier.json with the vendored make.fun library so the judge
// reads the same dossier the scorer rebuilds. Outside the grader's
// container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(name) {
  const source = join(repoRoot, name);
  if (!existsSync(source)) throw new Error('missing ' + name + '/ beside main.ts');
  cpSync(source, join(outputDir, name), { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree('app');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}
const shotFiles = readdirSync(join(outputDir, 'screenshots')).filter((f) => !f.startsWith('.'));
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error('expected 3 or 4 screenshots, found ' + shotFiles.length);
}

// Gate caps from the kit (reference/gate.json): dossier text at most 160 KiB,
// each screenshot at most 256 KiB, app/ at most 993 files and 48 MiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
console.log('handed in ' + shotFiles.length + ' screenshots to ' + outputDir);
