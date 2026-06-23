import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getToolPageJsonLd } from "../shared/seo/jsonld";

const BASE_URL = process.env.APP_URL || 'https://swipebetter.ai';

interface ToolMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  image: string;
  imageAlt: string;
}

const toolMetaData: Record<string, ToolMeta> = {
  'bio-generator': {
    title: 'AI Tinder Bio Generator | SwipeBetter.ai',
    description: 'Generate a killer dating bio in seconds. AI-powered bio writer for Tinder, Bumble, Hinge and more.',
    ogTitle: 'I just generated a Pro Tinder bio with SwipeBetter.ai',
    ogDescription: 'AI wrote me a dating bio that actually gets matches. Try it free!',
    image: `${BASE_URL}/og/bio-generator.png`,
    imageAlt: 'SwipeBetter.ai Bio Generator - AI-powered dating bios',
  },
  'profile-analyzer': {
    title: 'Dating Profile Analyzer | SwipeBetter.ai',
    description: 'Get AI-powered feedback on your dating profile photos and bio to increase your matches.',
    ogTitle: 'My dating profile just got roasted by AI',
    ogDescription: 'SwipeBetter.ai analyzed my profile and told me exactly how to get more matches. Your turn!',
    image: `${BASE_URL}/og/profile-analyzer.png`,
    imageAlt: 'SwipeBetter.ai Profile Analyzer - AI dating coach',
  },
  'rizz-assistant': {
    title: 'Rizz Assistant - AI Reply Generator | SwipeBetter.ai',
    description: 'Never run out of things to say. AI-powered conversation helper for dating apps.',
    ogTitle: 'This AI just leveled up my dating app game',
    ogDescription: 'SwipeBetter.ai generates witty replies that actually work. Stop fumbling the bag!',
    image: `${BASE_URL}/og/rizz-assistant.png`,
    imageAlt: 'SwipeBetter.ai Rizz Assistant - AI conversation helper',
  },
};

const defaultMeta: ToolMeta = {
  title: 'SwipeBetter.ai - AI Dating Profile Optimizer',
  description: 'Get more matches with AI-powered profile analysis, bio generation, and reply suggestions for Tinder, Bumble, Hinge and more.',
  ogTitle: 'SwipeBetter.ai - Your AI Dating Coach',
  ogDescription: 'Stop swiping. Start matching. AI-powered tools to optimize your dating profile and conversations.',
  image: `${BASE_URL}/og/default.png`,
  imageAlt: 'SwipeBetter.ai - AI Dating Profile Optimizer',
};

// Map routes to tool types for JSON-LD injection
const toolRoutes: Record<string, 'bio-generator' | 'profile-analyzer' | 'rizz-assistant'> = {
  '/tools/bio-generator': 'bio-generator',
  '/bio-generator': 'bio-generator',
  '/tools/profile-analyzer': 'profile-analyzer',
  '/profile-optimizer': 'profile-analyzer',
  '/tools/rizz-assistant': 'rizz-assistant',
  '/rizz-assistant': 'rizz-assistant',
};

function generateMetaTags(meta: ToolMeta, url: string): string {
  return `
    <!-- Primary Meta Tags -->
    <title>${meta.title}</title>
    <meta name="title" content="${meta.title}">
    <meta name="description" content="${meta.description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${meta.ogTitle}">
    <meta property="og:description" content="${meta.ogDescription}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:image:alt" content="${meta.imageAlt}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="SwipeBetter.ai">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${meta.ogTitle}">
    <meta name="twitter:description" content="${meta.ogDescription}">
    <meta name="twitter:image" content="${meta.image}">
    <meta name="twitter:image:alt" content="${meta.imageAlt}">
  `;
}

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
    const fullUrl = `${BASE_URL}${requestPath}`;
    
    fs.readFile(indexPath, 'utf8', (err, html) => {
      if (err) {
        return res.sendFile(indexPath);
      }

      let modifiedHtml = html;
      
      // Get meta data for this page (tool-specific or default)
      const meta = toolType ? toolMetaData[toolType] : defaultMeta;
      const metaTags = generateMetaTags(meta, fullUrl);
      
      // Remove existing meta tags that we'll replace
      modifiedHtml = modifiedHtml
        .replace(/<title>.*?<\/title>/i, '')
        .replace(/<meta name="description"[^>]*>/gi, '')
        .replace(/<meta name="title"[^>]*>/gi, '')
        .replace(/<meta property="og:[^"]*"[^>]*>/gi, '')
        .replace(/<meta name="twitter:[^"]*"[^>]*>/gi, '');
      
      // Inject meta tags after <head>
      modifiedHtml = modifiedHtml.replace('<head>', `<head>${metaTags}`);
      
      // If this is a tool page, also inject JSON-LD
      if (toolType) {
        const jsonLd = getToolPageJsonLd(toolType);
        const scriptTag = `<script type="application/ld+json">${jsonLd}</script>`;
        modifiedHtml = modifiedHtml.replace('</head>', `${scriptTag}\n</head>`);
      }
      
      res.setHeader('Content-Type', 'text/html');
      res.send(modifiedHtml);
    });
  });
}
