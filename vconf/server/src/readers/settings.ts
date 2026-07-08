import path from 'node:path';
import type { SettingsData, SettingsSection } from '../../../shared/types.js';
import { fileRef, readJson, exists } from './util.js';
import { redactDeep } from './redact.js';

// Group known settings keys into readable sections. Unknown keys fall into "Other".
const SECTION_MAP: { label: string; keys: string[] }[] = [
  { label: 'Model & Intelligence', keys: ['model', 'fallbackModel', 'availableModels', 'effortLevel', 'alwaysThinkingEnabled', 'outputStyle', 'advisorModel'] },
  { label: 'Permissions', keys: ['permissions', 'defaultMode', 'skipDangerousModePermissionPrompt', 'skipAutoPermissionPrompt'] },
  { label: 'Environment', keys: ['env'] },
  { label: 'Hooks', keys: ['hooks'] },
  { label: 'Status Line', keys: ['statusLine'] },
  { label: 'Plugins', keys: ['enabledPlugins', 'extraKnownMarketplaces', 'disableBundledSkills', 'disableWorkflows'] },
  { label: 'MCP', keys: ['allowedMcpServers', 'deniedMcpServers', 'enableAllProjectMcpServers', 'allowClaudeAiMcps'] },
  { label: 'Sandbox', keys: ['sandbox'] },
];

export async function readSettings(configRoot: string): Promise<SettingsData> {
  const p = path.join(configRoot, 'settings.json');
  const ref = fileRef(p);
  if (!exists(p)) {
    return { ...ref, present: false, sections: [], raw: null };
  }

  const parsed = (await readJson<Record<string, unknown>>(p)) ?? {};
  const redacted = redactDeep(parsed) as Record<string, unknown>;

  const claimed = new Set<string>();
  const sections: SettingsSection[] = [];

  for (const group of SECTION_MAP) {
    const value: Record<string, unknown> = {};
    let hit = false;
    for (const key of group.keys) {
      if (key in redacted) {
        value[key] = redacted[key];
        claimed.add(key);
        hit = true;
      }
    }
    if (hit) sections.push({ key: group.label, label: group.label, value });
  }

  // Everything else -> "Other"
  const other: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(redacted)) {
    if (!claimed.has(k)) other[k] = v;
  }
  if (Object.keys(other).length > 0) {
    sections.push({ key: 'Other', label: 'Other', value: other });
  }

  return { ...ref, present: true, sections, raw: redacted };
}
