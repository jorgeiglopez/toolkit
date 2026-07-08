import { useState } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../services/api';
import { useLiveConfig } from '../hooks/useLiveConfig';
import { Loading, ErrorState, PageHeader, Pill } from '../components/shared/primitives';
import { ListDetail, type ListItem } from '../components/shared/ListDetail';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { Collapsible } from '../components/shared/Collapsible';
import { PathLine, SymlinkBadge } from '../components/shared/SymlinkBadge';
import { CodeBlock } from '../components/shared/CodeBlock';
import type { SkillEntry, SkillSupportFile } from '../../../shared/types';

type Item = ListItem & { skill: SkillEntry };

export default function Skills() {
  const { data, loading, error } = useLiveConfig(api.skills);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const items: Item[] = data.skills.map((s) => ({
    id: s.id,
    title: s.name,
    subtitle: s.description,
    searchText: `${s.rulesMd ?? ''} ${s.skillMd}`,
    badges: (
      <>
        {s.isSymlink && <SymlinkBadge file={s} />}
        {s.rulesMd && <Pill tone="accent">RULES</Pill>}
      </>
    ),
    skill: s,
  }));

  return (
    <div>
      <PageHeader title="Skills" count={data.skills.length} subtitle="skills/*/SKILL.md (+ RULES.md)" />
      <ListDetail
        items={items}
        placeholder="Filter skills..."
        emptyTitle="No skills"
        emptyDescription="No skills/ directory in this config."
        renderDetail={(item) => <SkillDetail skill={item.skill} />}
      />
    </div>
  );
}

function SkillDetail({ skill }: { skill: SkillEntry }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold text-(--color-text-primary)">{skill.name}</h2>
        {skill.isSymlink && <SymlinkBadge file={skill} />}
      </div>
      {skill.description && <p className="text-sm text-(--color-text-secondary) mb-3">{skill.description}</p>}
      <PathLine file={skill} />

      {/* RULES.md first, collapsed by default */}
      {skill.rulesMd && (
        <div className="mt-4">
          <Collapsible title="RULES.md" badge={<Pill tone="accent">source of truth</Pill>} defaultOpen={false}>
            <MarkdownRenderer content={skill.rulesMd} />
          </Collapsible>
        </div>
      )}

      {/* SKILL.md below */}
      <div className="mt-4 border-t border-(--color-border-light) pt-4">
        <div className="text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wide mb-2">SKILL.md</div>
        <MarkdownRenderer content={skill.skillMd} />
      </div>

      {skill.supportFiles.length > 0 && <SupportFiles files={skill.supportFiles} />}
    </div>
  );
}

function SupportFiles({ files }: { files: SkillSupportFile[] }) {
  const [open, setOpen] = useState<SkillSupportFile | null>(null);
  const [content, setContent] = useState<string>('');

  async function view(f: SkillSupportFile) {
    setOpen(f);
    setContent('Loading...');
    try {
      const res = await api.file(f.path);
      setContent(res.content);
    } catch (e) {
      setContent(e instanceof Error ? e.message : 'Failed to read file');
    }
  }

  return (
    <div className="mt-5 border-t border-(--color-border-light) pt-4">
      <div className="text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wide mb-2">
        Support files ({files.length})
      </div>
      <div className="flex flex-wrap gap-1.5">
        {files.map((f) => (
          <button
            key={f.relPath}
            onClick={() => view(f)}
            className={`inline-flex items-center gap-1 text-xs rounded-md px-2 py-1 border transition-colors ${
              open?.relPath === f.relPath
                ? 'border-(--color-accent)/40 text-(--color-accent) bg-(--color-accent)/10'
                : 'border-(--color-border-light) text-(--color-text-secondary) hover:bg-(--color-surface-secondary)'
            }`}
          >
            <FileText size={12} /> {f.relPath}
          </button>
        ))}
      </div>
      {open && (
        <div className="mt-3">
          <CodeBlock text={content} language={open.name} />
        </div>
      )}
    </div>
  );
}
