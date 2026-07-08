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
