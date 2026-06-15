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
const jsFiles = files.filter((f) => f.endsWith('.js'));

const cssTags = cssFiles.map((f) => `  <link rel="stylesheet" href="/assets/${f}" />`).join('\n');
const jsTags = jsFiles.map((f) => `  <script type="module" src="/assets/${f}"></script>`).join('\n');

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
