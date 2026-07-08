import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function canonicalRoot(dir: string): string {
  try {
    return fs.realpathSync(path.resolve(dir));
  } catch {
    return path.resolve(dir);
  }
}

function isWithinRoot(canonicalPath: string, root: string): boolean {
  const rel = path.relative(root, canonicalPath);
  return !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Validates a request path stays within allowed boundaries (config root or home).
 * Canonicalizes with path.resolve + fs.realpathSync to block traversal (../),
 * prefix confusion, and symlink escapes.
 *
 * NOTE: symlinks that resolve within the home directory are allowed (this user's
 * config is heavily symlinked into a repo under $HOME), but escapes outside home
 * are rejected.
 */
export function resolveAndValidate(
  requestPath: string,
  configRoot: string,
): { allowed: true; canonicalPath: string } | { allowed: false } {
  const roots: string[] = [canonicalRoot(configRoot), canonicalRoot(os.homedir())];

  const resolved = path.resolve(requestPath);
  let canonical = resolved;

  if (fs.existsSync(resolved)) {
    try {
      canonical = fs.realpathSync(resolved);
    } catch {
      return { allowed: false };
    }
  } else {
    try {
      const parentDir = path.dirname(resolved);
      if (fs.existsSync(parentDir)) {
        canonical = path.join(fs.realpathSync(parentDir), path.basename(resolved));
      }
    } catch {
      /* keep canonical as resolved */
    }
  }

  for (const root of roots) {
    if (isWithinRoot(canonical, root)) {
      return { allowed: true, canonicalPath: canonical };
    }
  }

  return { allowed: false };
}
