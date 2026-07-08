const SECRET_KEY_RE = /(TOKEN|KEY|SECRET|PASSWORD|PASSWD|CREDENTIAL|AUTH|BEARER|PRIVATE)/i;
const MASK = '••••••••';

/** True if an env/config key name looks like it holds a secret. */
export function looksSecret(key: string): boolean {
  return SECRET_KEY_RE.test(key);
}

/** Redact secret-looking values in a flat key/value map (e.g. env). */
export function redactEnv(
  env: Record<string, unknown> | undefined,
): Record<string, string> | undefined {
  if (!env || typeof env !== 'object') return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    const str = typeof v === 'string' ? v : JSON.stringify(v);
    out[k] = looksSecret(k) && str.length > 0 ? MASK : str;
  }
  return out;
}

// A CLI flag that carries a secret in the FOLLOWING arg (e.g. `--api-key <val>`).
const SECRET_FLAG_RE = /^--?(api[-_]?key|key|token|secret|password|passwd|auth|bearer|access[-_]?token|pat)$/i;
// A standalone token that looks like a secret by its own shape.
const SECRET_TOKEN_RE = /^(sk|pk|rk|ctx7sk|ghp|gho|ghs|ghu|github_pat|xox[abprs]|AKIA|AIza|glpat)[-_][A-Za-z0-9._-]{6,}$/;

/** Redact secrets in command-line args: `--api-key X`, `--key=X`, and secret-shaped tokens. */
export function redactArgs(args: string[] | undefined): string[] | undefined {
  if (!Array.isArray(args)) return args;
  let maskNext = false;
  return args.map((arg) => {
    if (maskNext) {
      maskNext = false;
      return MASK;
    }
    if (SECRET_FLAG_RE.test(arg)) {
      maskNext = true;
      return arg;
    }
    const inline = /^(--?[A-Za-z][\w-]*)=(.+)$/.exec(arg);
    if (inline && SECRET_FLAG_RE.test(inline[1])) return `${inline[1]}=${MASK}`;
    if (SECRET_TOKEN_RE.test(arg)) return MASK;
    return arg;
  });
}

/** Redact secret-looking query-param values and userinfo in a URL string. */
export function redactUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.password) u.password = MASK;
    for (const key of [...u.searchParams.keys()]) {
      if (looksSecret(key)) u.searchParams.set(key, MASK);
    }
    return u.toString();
  } catch {
    return url;
  }
}

/** Deep-redact secret-looking values anywhere in a JSON structure (for settings). */
export function redactDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (looksSecret(k) && typeof v === 'string' && v.length > 0) {
        out[k] = MASK;
      } else {
        out[k] = redactDeep(v);
      }
    }
    return out;
  }
  return value;
}
