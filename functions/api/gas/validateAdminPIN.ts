interface Env {
  ADMIN_PIN?: string;
  PUBLISHER_PIN?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => ({}))) as { pin?: string };
  const pin = String(body.pin || '');
  const adminPin = env.ADMIN_PIN || 'SIG900.1';
  const publisherPin = env.PUBLISHER_PIN || '9001';

  let role: 'ADMIN' | 'PUBLISHER' | null = null;
  if (pin === adminPin) role = 'ADMIN';
  else if (pin === publisherPin) role = 'PUBLISHER';

  return Response.json({
    isValid: role !== null,
    role,
  });
};
