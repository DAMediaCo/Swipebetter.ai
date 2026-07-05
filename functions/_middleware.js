export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === "www.swipebetter.ai") {
    url.hostname = "swipebetter.ai";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
