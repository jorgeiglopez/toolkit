import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import type { FileRef } from '../../../shared/types.js';

/** Build a FileRef (path + resolved realPath + isSymlink) for a path. */
export function fileRef(p: string): FileRef {
  let realPath = p;
  let isSymlink = false;
  try {
    const lst = fs.lstatSync(p);
    isSymlink = lst.isSymbolicLink();
    realPath = fs.realpathSync(p);
  } catch {
    /* leave defaults */
  }
  return { path: p, realPath, isSymlink };
}

export async function readText(p: string): Promise<string | null> {
  try {
    return await fsp.readFile(p, 'utf-8');
  } catch {
    return null;
  }
}

export function readTextSync(p: string): string | null {
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch {
    return null;
  }
}

export async function readJson<T = unknown>(p: string): Promise<T | null> {
  const raw = await readText(p);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function exists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export async function listDir(p: string): Promise<string[]> {
  try {
    return await fsp.readdir(p);
  } catch {
    return [];
  }
}

/** Recursively list files (following into subdirs) with paths relative to `root`. */
export async function walkFiles(root: string, filter?: (rel: string) => boolean): Promise<string[]> {
  const out: string[] = [];
  async function recurse(dir: string, rel: string): Promise<void> {
    let entries: import('node:fs').Dirent[];
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const childRel = rel ? path.join(rel, entry.name) : entry.name;
      const childAbs = path.join(dir, entry.name);
      // resolve symlinked dirs/files
      let isDir = entry.isDirectory();
      if (entry.isSymbolicLink()) {
        try {
          isDir = fs.statSync(childAbs).isDirectory();
        } catch {
          continue;
        }
      }
      if (isDir) {
        await recurse(childAbs, childRel);
      } else if (!filter || filter(childRel)) {
        out.push(childRel);
      }
    }
  }
  await recurse(root, '');
  return out;
}

export interface Parsed {
  frontmatter: Record<string, unknown>;
  body: string;
}

/** Parse YAML frontmatter (--- ... ---) from a markdown string. */
export function parseFrontmatter(raw: string): Parsed {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { frontmatter: {}, body: raw };
  let frontmatter: Record<string, unknown> = {};
  try {
    const loaded = yaml.load(match[1]);
    if (loaded && typeof loaded === 'object') frontmatter = loaded as Record<string, unknown>;
  } catch {
    /* malformed frontmatter -> empty */
  }
  return { frontmatter, body: match[2] ?? '' };
}
