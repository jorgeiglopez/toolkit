// Shared types between server readers and client tabs.

/** Attached to every file-backed entity so the UI can show link/target. */
export interface FileRef {
  /** Path as it appears under the config root (may be a symlink). */
  path: string;
  /** Fully resolved real path (symlinks followed). */
  realPath: string;
  isSymlink: boolean;
}

export type ConfigCategory =
  | 'memory'
  | 'settings'
  | 'agents'
  | 'skills'
  | 'hooks'
  | 'mcp'
  | 'rules'
  | 'plugins'
  | 'keybindings'
  | 'statusline';

/** GET /api/dashboard */
export interface DashboardData {
  configRoot: string;
  configRootRealPath: string;
  isGitRepo: boolean;
  claudeJsonPath: string | null;
  counts: Record<ConfigCategory, number>;
  present: Record<ConfigCategory, boolean>;
  highlights: {
    model?: string;
    effortLevel?: string;
    permissionMode?: string;
    outputStyle?: string;
    statusLine?: string;
  };
}

/** GET /api/memory */
export interface MemoryFile extends FileRef {
  id: string;
  title: string;
  content: string;
  imports: string[]; // @path imports discovered in the body
}
export interface MemoryData {
  files: MemoryFile[];
}

/** GET /api/settings */
export interface SettingsSection {
  key: string;
  label: string;
  value: unknown; // already redacted where needed
}
export interface SettingsData extends FileRef {
  present: boolean;
  sections: SettingsSection[];
  raw: unknown; // full parsed JSON, secrets redacted
}

/** GET /api/agents */
export interface AgentEntry extends FileRef {
  id: string;
  name: string;
  description?: string;
  model?: string;
  tools?: string | string[];
  frontmatter: Record<string, unknown>;
  hasHooks: boolean;
  body: string;
}
export interface AgentsData {
  agents: AgentEntry[];
}

/** GET /api/skills */
export interface SkillSupportFile {
  name: string;
  relPath: string;
  path: string;
}
export interface SkillEntry extends FileRef {
  id: string;
  name: string;
  description?: string;
  frontmatter: Record<string, unknown>;
  rulesMd: string | null; // RULES.md content if present
  skillMd: string; // SKILL.md body (frontmatter stripped)
  supportFiles: SkillSupportFile[];
  source: 'local' | 'symlink';
}
export interface SkillsData {
  skills: SkillEntry[];
}

/** GET /api/hooks */
export interface HookEntry {
  id: string;
  event: string;
  matcher?: string;
  type: string;
  command?: string;
  detail: Record<string, unknown>;
  source: string; // 'settings.json' | 'agent:<name>'
  async?: boolean;
}
export interface HooksData {
  hooks: HookEntry[];
}

/** GET /api/mcp */
export interface McpServerEntry {
  id: string;
  name: string;
  scope: string; // 'global' | 'project:<path>'
  transport: 'stdio' | 'http' | 'sse' | 'unknown';
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>; // secret values redacted
  raw: Record<string, unknown>;
}
export interface McpData {
  sourcePath: string | null;
  servers: McpServerEntry[];
}

/** GET /api/rules */
export interface RuleEntry extends FileRef {
  id: string;
  relPath: string;
  title: string;
  paths?: string[]; // frontmatter path globs
  frontmatter: Record<string, unknown>;
  content: string;
}
export interface RulesData {
  rules: RuleEntry[];
}

/** GET /api/plugins */
export interface InstalledPluginEntry {
  id: string;
  name: string;
  marketplace: string;
  scope: string;
  version?: string;
  installPath?: string;
  enabled?: boolean;
}
export interface MarketplaceEntry {
  id: string;
  name: string;
  source?: string;
  autoUpdate?: boolean;
  lastUpdated?: string;
  installLocation?: string;
}
export interface PluginsData {
  plugins: InstalledPluginEntry[];
  marketplaces: MarketplaceEntry[];
}

/** GET /api/keybindings */
export interface KeybindingContext {
  context: string;
  bindings: { keys: string; action: string | null }[];
}
export interface KeybindingsData extends FileRef {
  present: boolean;
  contexts: KeybindingContext[];
  raw: unknown;
}

/** GET /api/statusline */
export interface StatuslineScript extends FileRef {
  content: string | null;
}
export interface StatuslineData {
  present: boolean;
  command?: string;
  padding?: number;
  scripts: StatuslineScript[];
  raw: unknown;
}

/** GET /api/search-index */
export interface SearchDoc {
  category: ConfigCategory;
  route: string; // client route, e.g. '/skills'
  id: string; // entity id within the category (for deep-link/highlight)
  title: string;
  subtitle?: string;
  text: string; // full searchable text (bodies + frontmatter + json)
}
export interface SearchIndex {
  docs: SearchDoc[];
}

/** WebSocket message */
export interface FileChangeEvent {
  type: 'config_changed';
  changedFiles: string[];
  timestamp: string;
}
