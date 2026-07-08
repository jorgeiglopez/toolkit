import path from 'node:path';
import type { MemoryData, MemoryFile } from '../../../shared/types.js';
import { fileRef, readText, exists } from './util.js';

const IMPORT_RE = /(?:^|\s)@([~./][^\s)]+)/g;

function extractImports(content: string): string[] {
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(content)) !== null) {
    found.add(m[1]);
  }
  return Array.from(found);
}

/** Read ~/.claude/CLAUDE.md (+ CLAUDE.local.md if present). */
export async function readMemory(configRoot: string): Promise<MemoryData> {
  const candidates = ['CLAUDE.md', 'CLAUDE.local.md'];
  const files: MemoryFile[] = [];

  for (const name of candidates) {
    const p = path.join(configRoot, name);
    if (!exists(p)) continue;
    const content = (await readText(p)) ?? '';
    files.push({
      ...fileRef(p),
      id: name,
      title: name,
      content,
      imports: extractImports(content),
    });
  }

  return { files };
}
