import type {
  DashboardData,
  MemoryData,
  SettingsData,
  AgentsData,
  SkillsData,
  HooksData,
  McpData,
  RulesData,
  PluginsData,
  KeybindingsData,
  StatuslineData,
  SearchIndex,
} from '../../../shared/types';

async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  dashboard: (s?: AbortSignal) => get<DashboardData>('/api/dashboard', s),
  memory: (s?: AbortSignal) => get<MemoryData>('/api/memory', s),
  settings: (s?: AbortSignal) => get<SettingsData>('/api/settings', s),
  agents: (s?: AbortSignal) => get<AgentsData>('/api/agents', s),
  skills: (s?: AbortSignal) => get<SkillsData>('/api/skills', s),
  hooks: (s?: AbortSignal) => get<HooksData>('/api/hooks', s),
  mcp: (s?: AbortSignal) => get<McpData>('/api/mcp', s),
  rules: (s?: AbortSignal) => get<RulesData>('/api/rules', s),
  plugins: (s?: AbortSignal) => get<PluginsData>('/api/plugins', s),
  keybindings: (s?: AbortSignal) => get<KeybindingsData>('/api/keybindings', s),
  statusline: (s?: AbortSignal) => get<StatuslineData>('/api/statusline', s),
  searchIndex: (s?: AbortSignal) => get<SearchIndex>('/api/search-index', s),
  file: (p: string, s?: AbortSignal) =>
    get<{ path: string; realPath: string; content: string }>(
      `/api/file?path=${encodeURIComponent(p)}`,
      s,
    ),
};
