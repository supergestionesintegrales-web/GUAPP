/**
 * POST /api/gas/saveNews
 * Guarda las noticias actualizando public/data/news.json directamente
 * en el repositorio GitHub vía la API de GitHub.
 *
 * Variables de entorno requeridas (Cloudflare Pages → Settings → Variables):
 *   ADMIN_PIN       - PIN de administrador
 *   PUBLISHER_PIN   - PIN de publicador
 *   GITHUB_TOKEN    - GitHub Personal Access Token (repo scope: contents:write)
 *   GITHUB_OWNER    - Propietario del repositorio
 *   GITHUB_REPO     - Nombre del repositorio
 *   GITHUB_BRANCH   - Rama objetivo (ej: main)
 */

interface Env {
  ADMIN_PIN?: string;
  PUBLISHER_PIN?: string;
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

const FILE_PATH = 'public/data/news.json';

async function getFileSha(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  token: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { sha?: string };
  return data.sha ?? null;
}

async function updateFileOnGitHub(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  content: string,
  sha: string | null,
  token: string,
  commitMessage: string
): Promise<boolean> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const body: Record<string, unknown> = {
    message: commitMessage,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });

  return res.ok;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Validar PIN (admin o publisher)
  const body = (await request.json().catch(() => ({}))) as {
    noticias?: unknown[];
    usuarioActual?: string;
    pin?: string;
  };

  const pin = String(body.pin || '');
  const adminPin = env.ADMIN_PIN || 'SIG900.1';
  const publisherPin = env.PUBLISHER_PIN || '9001';

  if (pin !== adminPin && pin !== publisherPin) {
    return Response.json(
      { success: false, error: 'PIN no autorizado para publicar.' },
      { status: 403 }
    );
  }

  if (!Array.isArray(body.noticias)) {
    return Response.json(
      { success: false, error: 'Formato de noticias inválido.' },
      { status: 400 }
    );
  }

  const token = env.GITHUB_TOKEN;
  const owner = env.GITHUB_OWNER || 'supergestionesintegrales-web';
  const repo = env.GITHUB_REPO || 'GUAPP';
  const branch = env.GITHUB_BRANCH || 'main';

  if (!token) {
    return Response.json(
      {
        success: false,
        error:
          'GITHUB_TOKEN no configurado. Agrégalo en Cloudflare Pages → Settings → Environment variables.',
      },
      { status: 500 }
    );
  }

  try {
    const content = JSON.stringify(body.noticias, null, 2);
    const sha = await getFileSha(owner, repo, branch, FILE_PATH, token);
    const now = new Date().toISOString();
    const commitMsg = `chore: actualizar noticias [${now.slice(0, 10)}]`;
    const ok = await updateFileOnGitHub(owner, repo, branch, FILE_PATH, content, sha, token, commitMsg);

    if (ok) {
      return Response.json({ success: true, count: body.noticias.length });
    } else {
      return Response.json(
        { success: false, error: 'Error al actualizar las noticias en GitHub.' },
        { status: 500 }
      );
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
};
