import { watch, type FSWatcher } from 'chokidar';
import { EventEmitter } from 'node:events';
import type { FileChangeEvent } from '../../shared/types.js';

/**
 * Watches one or more paths (the config root and ~/.claude.json) and emits a
 * debounced 'change' event. Ignores the noisy/large runtime-state directories so
 * transcript churn doesn't spam reloads.
 */
export class FileWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingChanges = new Set<string>();

  constructor(private paths: string[], private debounceMs = 300) {
    super();
  }

  start(): void {
    // chokidar v4 dropped glob support in `ignored`; use a path predicate instead.
    // Skip the large/noisy runtime-state dirs so transcript churn doesn't spam reloads.
    const IGNORE_RE =
      /(?:^|\/)(?:node_modules|\.git|projects|shell-snapshots|session-env|sessions|todos|tasks|teams|file-history|statsig|paste-cache|history\.jsonl)(?:\/|$)/;
    this.watcher = watch(this.paths, {
      ignoreInitial: true,
      persistent: true,
      depth: 4,
      ignored: (p: string) => IGNORE_RE.test(p),
    });

    const handleChange = (filePath: string) => {
      this.pendingChanges.add(filePath);
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        const event: FileChangeEvent = {
          type: 'config_changed',
          changedFiles: Array.from(this.pendingChanges),
          timestamp: new Date().toISOString(),
        };
        this.pendingChanges.clear();
        this.emit('change', event);
      }, this.debounceMs);
    };

    this.watcher.on('change', handleChange);
    this.watcher.on('add', handleChange);
    this.watcher.on('unlink', handleChange);
  }

  async stop(): Promise<void> {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }
}
