import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getToolPageJsonLd } from "../shared/seo/jsonld";

// Map routes to tool types for JSON-LD injection
const toolRoutes: Record<string, 'bio-generator' | 'profile-analyzer' | 'rizz-assistant'> = {
  '/tools/bio-generator': 'bio-generator',
  '/bio-generator': 'bio-generator',
  '/tools/profile-analyzer': 'profile-analyzer',
  '/profile-optimizer': 'profile-analyzer',
  '/tools/rizz-assistant': 'rizz-assistant',
  '/rizz-assistant': 'rizz-assistant',
};

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    const requestPath = req.originalUrl.split('?')[0];
    const toolType = toolRoutes[requestPath];
    
    // If this is a tool page, inject JSON-LD
    if (toolType) {
      fs.readFile(indexPath, 'utf8', (err, html) => {
        if (err) {
          return res.sendFile(indexPath);
        }
        
        const jsonLd = getToolPageJsonLd(toolType);
        const scriptTag = `<script type="application/ld+json">${jsonLd}</script>`;
        
        // Inject before </head>
        const modifiedHtml = html.replace('</head>', `${scriptTag}\n</head>`);
        res.setHeader('Content-Type', 'text/html');
        res.send(modifiedHtml);
      });
    } else {
      res.sendFile(indexPath);
    }
  });
}
