/**
 * POST /api/gas/saveDashboardModules
 * Guarda los módulos actualizando public/data/modules.json directamente
 * en el repositorio GitHub vía la API de GitHub.
 *
 * Variables de entorno requeridas (Cloudflare Pages → Settings → Variables):
 *   ADMIN_PIN       - PIN de administrador
 *   GITHUB_TOKEN    - GitHub Personal Access Token (repo scope: contents:write)
 *   GITHUB_OWNER    - Propietario del repositorio (ej: supergestionesintegrales-web)
 *   GITHUB_REPO     - Nombre del repositorio (ej: GUAPP)
 *   GITHUB_BRANCH   - Rama objetivo (ej: main)
 */

interface Env {
  ADMIN_PIN?: string;
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

const FILE_PATH = 'public/data/modules.json';

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
    content: btoa(unescape(encodeURIComponent(content))), // Base64 UTF-8
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
  // Validar PIN de administrador
  const body = (await request.json().catch(() => ({}))) as {
    modules?: unknown[];
    pin?: string;
  };

  const pin = String(body.pin || '');
  const adminPin = env.ADMIN_PIN || 'SIG900.1';

  if (pin !== adminPin) {
    return Response.json(
      { success: false, error: 'PIN de administrador incorrecto.' },
      { status: 403 }
    );
  }

  if (!Array.isArray(body.modules)) {
    return Response.json(
      { success: false, error: 'Formato de módulos inválido.' },
      { status: 400 }
    );
  }

  // Verificar variables de entorno de GitHub
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
    const content = JSON.stringify(body.modules, null, 2);
    const sha = await getFileSha(owner, repo, branch, FILE_PATH, token);
    const now = new Date().toISOString();
    const commitMsg = `chore: actualizar módulos del dashboard [${now.slice(0, 10)}]`;
    const ok = await updateFileOnGitHub(owner, repo, branch, FILE_PATH, content, sha, token, commitMsg);

    if (ok) {
      return Response.json({ success: true, count: body.modules.length });
    } else {
      return Response.json(
        { success: false, error: 'Error al actualizar el archivo en GitHub.' },
        { status: 500 }
      );
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
};
