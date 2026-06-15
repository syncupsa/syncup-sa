import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

function rewriteClientHtml() {
  return {
    name: "rewrite-client-html",
    apply: "build",
    writeBundle(options, bundle) {
      if (!options.dir) return;
      const outDir = path.resolve(process.cwd(), options.dir.toString());
      const htmlPath = path.join(outDir, "index.html");
      if (!fs.existsSync(htmlPath)) return;

      let html = fs.readFileSync(htmlPath, "utf8");
      const cssFiles = Object.values(bundle)
        .filter((file) => file.type === "asset" && file.fileName?.endsWith(".css"))
        .map((file) => `./${file.fileName}`);
      const jsFiles = Object.values(bundle)
        .filter((file) => file.type === "chunk" && file.isEntry && file.fileName?.endsWith(".js"))
        .map((file) => `./${file.fileName}`);

      if (cssFiles.length > 0) {
        const cssTags = cssFiles.map((href) => `  <link rel="stylesheet" href="${href}">`).join("\n");
        html = html.replace(/<link\s+rel="stylesheet"[^>]*href="\.\/src\/styles\.css"[^>]*>\s*/i, `${cssTags}\n`);
      }
      if (jsFiles.length > 0) {
        const scriptTags = jsFiles.map((src) => `  <script type="module" src="${src}"></script>`).join("\n");
        html = html.replace(/<script[^>]*src="\.\/src\/start\.ts"[^>]*><\/script>\s*/i, `${scriptTags}\n`);
      }

      html = html.replace(/href="\/manifest\.json"/g, 'href="./manifest.json"');
      html = html.replace(/href="\/logo\.sv"/g, 'href="./favicon.ico"');
      html = html.replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"');
      html = html.replace(/href="\/icon-192\.png"[^>]*>\s*/i, "");
      html = html.replace(/href="\/splash-828x1792\.png"[^>]*>\s*/i, "");

      fs.writeFileSync(htmlPath, html, "utf8");
    }
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    base: "./",
    plugins: [rewriteClientHtml()],
  },
});
