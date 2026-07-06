import {
  isNoindexPath,
  redirectTargetForPath,
  renderSeoHtml,
} from "./seo-data.js";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === "www.swipebetter.ai") {
    url.hostname = "swipebetter.ai";
    return Response.redirect(url.toString(), 301);
  }

  const cleanPath = redirectTargetForPath(url.pathname);
  if (cleanPath) {
    url.pathname = cleanPath;
    return Response.redirect(url.toString(), 301);
  }

  let response = await context.next();
  const location = response.headers.get("location");
  if (response.status === 308 && location) {
    const target = new URL(location, url);
    if (target.pathname === `${url.pathname}/`) {
      const assetUrl = new URL(url);
      assetUrl.pathname = target.pathname;
      response = await context.env.ASSETS.fetch(new Request(assetUrl, context.request));
    }
  }

  if (response.status === 404 && acceptsHtml(context.request) && !hasFileExtension(url.pathname)) {
    const assetUrl = new URL(url);
    assetUrl.pathname = "/";
    response = await context.env.ASSETS.fetch(new Request(assetUrl, context.request));
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  if (isNoindexPath(url.pathname)) {
    headers.set("x-robots-tag", "noindex, nofollow");
  }

  return new Response(renderSeoHtml(await response.text(), url.pathname), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function acceptsHtml(request) {
  return (request.headers.get("accept") || "").includes("text/html");
}

function hasFileExtension(pathname) {
  return /\.[a-z0-9]+$/i.test(pathname);
}
