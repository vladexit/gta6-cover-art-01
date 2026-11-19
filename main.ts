// LEONIDA Cover Studio — hand-in program (Node 22, standard library only).
//
// The entry's program. It takes the web app in app/ and the screenshots in
// screenshots/ from beside this file, copies both into the output directory,
// and writes the dossier.json the judge reads, using the vendored make.fun
// library (vendor/makefun-app.ts, the kit's copy, unchanged).
//
// The grader runs this as `node main.ts` with /output as the destination.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with any static server, e.g.:
//   python3 -m http.server 8080 --directory app
// then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Where this file lives, and where the hand-in goes.
const repoRoot = dirname(fileURLToPath(import.meta.url));
const destDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, from the kit's reference/gate.json. Only
// text_max_bytes changes the dossier's bytes; the rest refuse an entry
// the scorer would refuse (too many screenshots, one too large, too
// many app files or bytes, or an app path too long).
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function handIn() {
  mkdirSync(destDir, { recursive: true });

  // The app itself: plain static files a desktop browser opens offline.
  cpSync(join(repoRoot, 'app'), join(destDir, 'app'), { recursive: true });

  // The screenshots: the app with a photo loaded, and covers it exported.
  mkdirSync(join(destDir, 'screenshots'), { recursive: true });
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) {
    cpSync(shots, join(destDir, 'screenshots'), { recursive: true });
  }

  // The dossier the judge reads, built from what was just copied.
  const dossier = buildDossier(destDir, dossierCaps);
  writeFileSync(join(destDir, 'dossier.json'), dossier);
}

handIn();
