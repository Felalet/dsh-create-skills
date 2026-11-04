// Host half of the Create Skills plugin.
// Serves a small same-origin JSON API for the Skills page. The catalog is read
// with the scope of a live root agent, so preset-scoped providers (the project
// filesystem provider among them) contribute just as they do for the model.
import process from 'node:process';

const PREFIX = '/plugins/create-skills/';

// Diagnostics for the page itself: proves the browser actually called the API.
const stats = { requests: 0, lastAt: null, lastUserAgent: null, lastProjectRoot: null };

export const name = 'create-skills';

// The web server is the only hard dependency; the rest is looked up optionally
// so the plugin stays inert in a headless profile.
export const inject = ['webServer'];

function sendJson(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  res.end(body);
}

async function resolveView(ctx, requested) {
  const view = { cwd: requested ?? undefined, scope: undefined };

  try {
    const agents = ctx.get('agents');
    if (agents) {
      const roots = agents.roots();
      const agent = roots[roots.length - 1];
      if (agent) {
        view.scope = agent;
        if (!view.cwd) {
          try {
            view.cwd = await ctx.workingDirectory.ensure(agent);
          } catch {
            // fall through to the session header
          }
        }
      }
    }
  } catch {
    // fall through
  }

  if (!view.cwd) {
    try {
      const sessions = ctx.get('sessions');
      const live = sessions?.list() ?? [];
      for (let index = live.length - 1; index >= 0; index -= 1) {
        const session = live[index];
        if (session?.header?.parentSession) continue;
        const cwd = session?.header?.cwd;
        if (typeof cwd === 'string' && cwd !== '') {
          view.cwd = cwd;
          break;
        }
      }
    } catch {
      // fall through
    }
  }

  if (!view.cwd) {
    try {
      const workingDirectory = ctx.get('workingDirectory');
      if (workingDirectory && typeof workingDirectory.defaultDirectory === 'string') {
        view.cwd = workingDirectory.defaultDirectory;
      }
    } catch {
      // fall through
    }
  }

  if (!view.cwd) view.cwd = process.cwd();
  return view;
}

function weightOf(skill) {
  const size =
    (skill.name?.length ?? 0) +
    (skill.description?.length ?? 0) +
    (skill.whenToUse?.length ?? 0);
  return Math.max(1, Math.ceil(size / 4));
}

function toRow(skill) {
  return {
    name: skill.name,
    description: skill.description,
    whenToUse: skill.whenToUse ?? null,
    path: skill.path ?? null,
    source: skill.source ?? 'custom',
    provider: skill.provider ?? null,
    modelInvocable: skill.invocation?.modelInvocable !== false,
    userInvocable: skill.invocation?.userInvocable !== false,
    weight: weightOf(skill),
  };
}

async function listSkills(ctx, req, url, res) {
  const skills = ctx.get('skills');
  if (!skills) {
    sendJson(res, 503, { error: 'skills service is not available in this profile' });
    return;
  }

  const view = await resolveView(ctx, url.searchParams.get('cwd'));
  const snapshot = await skills.snapshot({ cwd: view.cwd, scope: view.scope });
  const rows = snapshot.skills.map(toRow);

  stats.requests += 1;
  stats.lastAt = new Date().toISOString();
  stats.lastUserAgent = req.headers['user-agent'] ?? null;
  stats.lastProjectRoot = view.cwd;

  sendJson(res, 200, {
    projectRoot: view.cwd,
    complete: snapshot.complete !== false,
    skills: rows,
    totalWeight: rows.reduce((sum, row) => sum + row.weight, 0),
    catalogOverhead: 200,
  });
}

export function apply(ctx) {
  const routes = [
    {
      kind: 'exact',
      path: `${PREFIX}api/skills`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          const url = new URL(req.url ?? '/', 'http://localhost');
          await listSkills(ctx, req, url, res);
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/stats`,
      handler: (req, res) => {
        sendJson(res, 200, stats);
      },
    },
  ];

  ctx.effect(() => {
    const disposers = routes.map((route) => ctx.webServer.register(route));
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, 'create-skills: http api');
}
