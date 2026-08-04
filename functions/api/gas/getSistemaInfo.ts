export const onRequest: PagesFunction = async () => {
  return Response.json({
    nombreApp: 'GUAPP',
    subtituloApp: 'Tu Guajira App',
    lemaApp: 'Simpre cerca de ti',
    descripcion: 'Base de datos en Cloudflare Pages (modo estático)',
  });
};
