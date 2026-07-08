import { Link2 } from 'lucide-react';
import type { FileRef } from '../../../../shared/types';

/** Shows a symlink badge with the resolved target when a file is a symlink. */
export function SymlinkBadge({ file }: { file: Pick<FileRef, 'isSymlink' | 'realPath'> }) {
  if (!file.isSymlink) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-(--color-cool) bg-(--color-cool)/10 rounded-md px-1.5 py-0.5"
      title={`symlink → ${file.realPath}`}
    >
      <Link2 size={12} strokeWidth={2} />
      symlink
    </span>
  );
}

/** Full path line with symlink target, for detail headers. */
export function PathLine({ file }: { file: FileRef }) {
  return (
    <div className="text-xs text-(--color-text-tertiary) font-mono break-all">
      {file.path}
      {file.isSymlink && (
        <>
          {' '}
          <span className="text-(--color-cool)">→ {file.realPath}</span>
        </>
      )}
    </div>
  );
}
