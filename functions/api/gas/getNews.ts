/**
 * GET /api/gas/getNews
 * Lee public/data/news.json y lo retorna.
 */
export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  try {
    const res = await fetch(`${baseUrl}/data/news.json`);
    if (res.ok) {
      const data = await res.json();
      return Response.json(data);
    }
  } catch {
    // fallback
  }

  return Response.json([]);
};
