const fs = require('fs');
const path = require('path');
const assetsDir = path.resolve(__dirname, '../dist/client/assets');
const outDir = path.resolve(__dirname, '../dist/client');

if (!fs.existsSync(assetsDir)) {
  console.error('No assets directory found at', assetsDir);
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const cssFiles = files.filter((f) => f.endsWith('.css'));

// Pick only the most recent client entry JS bundle (index-*.js) to avoid
// including multiple historical bundles which can cause duplicate execution
// and runtime errors in production.
const indexFiles = files.filter((f) => /^index-.*\.js$/.test(f));
let entryJs = [];
if (indexFiles.length > 0) {
  // sort by mtime descending and pick the newest
  entryJs = indexFiles
    .map((f) => ({ f, mtime: fs.statSync(path.join(assetsDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
    .map((x) => x.f)
    .slice(0, 1);
}

// Also include any additional small helper scripts that are required (optional)
// but avoid bulk-including every .js file in the assets folder.

const cssTags = cssFiles.map((f) => `  <link rel="stylesheet" href="/assets/${f}" />`).join('\n');
const jsTags = entryJs.map((f) => `  <script type="module" src="/assets/${f}"></script>`).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Sync Up</title>
  <link rel="icon" href="/favicon.ico" />
${cssTags}
</head>
<body>
  <div id="root"></div>
${jsTags}
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), html);
console.log('Wrote', path.join(outDir, 'index.html'));
