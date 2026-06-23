const BACKEND_ORIGIN = "https://swipebetter.replit.app";

export async function onRequest({ request }) {
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(incomingUrl.pathname + incomingUrl.search, BACKEND_ORIGIN);
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("origin");
  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", "https");

  const upstreamRequest = new Request(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

  const upstreamResponse = await fetch(upstreamRequest);
  const responseHeaders = new Headers(upstreamResponse.headers);
  const location = responseHeaders.get("location");

  if (location?.startsWith(BACKEND_ORIGIN)) {
    responseHeaders.set("location", location.replace(BACKEND_ORIGIN, incomingUrl.origin));
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}
