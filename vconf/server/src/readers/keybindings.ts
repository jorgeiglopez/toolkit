import path from 'node:path';
import type { KeybindingsData, KeybindingContext } from '../../../shared/types.js';
import { fileRef, readJson, exists } from './util.js';

interface RawBindingBlock {
  context?: string;
  bindings?: Record<string, string | null>;
}

export async function readKeybindings(configRoot: string): Promise<KeybindingsData> {
  const p = path.join(configRoot, 'keybindings.json');
  const ref = fileRef(p);
  if (!exists(p)) return { ...ref, present: false, contexts: [], raw: null };

  const doc = await readJson<{ bindings?: RawBindingBlock[] }>(p);
  const contexts: KeybindingContext[] = [];

  for (const block of doc?.bindings ?? []) {
    contexts.push({
      context: block.context || 'Global',
      bindings: Object.entries(block.bindings ?? {}).map(([keys, action]) => ({ keys, action })),
    });
  }

  return { ...ref, present: true, contexts, raw: doc };
}
