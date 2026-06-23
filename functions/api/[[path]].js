const BACKEND_ORIGIN = "https://swipebetter-api.fly.dev";

export async function onRequest({ request, env }) {
  const incomingUrl = new URL(request.url);
  const backendOrigin = env.SWIPEBETTER_API_ORIGIN || BACKEND_ORIGIN;
  const upstreamUrl = new URL(incomingUrl.pathname + incomingUrl.search, backendOrigin);
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

  if (location?.startsWith(backendOrigin)) {
    responseHeaders.set("location", location.replace(backendOrigin, incomingUrl.origin));
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}
