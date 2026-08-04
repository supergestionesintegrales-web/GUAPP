/**
 * GET /api/gas/getDashboardModules
 * Lee public/data/modules.json del repositorio GitHub y lo retorna.
 * En Cloudflare Pages no hay sistema de archivos, así que leemos el
 * archivo estático que se sirve desde /data/modules.json.
 */
export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  try {
    const res = await fetch(`${baseUrl}/data/modules.json`);
    if (res.ok) {
      const data = await res.json();
      return Response.json(data);
    }
  } catch {
    // fallback
  }

  return Response.json([]);
};
