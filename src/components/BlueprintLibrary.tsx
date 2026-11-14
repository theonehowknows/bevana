import { useMemo, useState } from 'react';
import { Copy, FolderOpen, Plus, Search, Trash2 } from 'lucide-react';
import { Blueprint, ReferenceType } from '../types/blueprint';

interface BlueprintLibraryProps {
  blueprints: Blueprint[];
  activeBlueprintId: string;
  onLoadBlueprint: (blueprint: Blueprint) => void;
  onDuplicateBlueprint: (blueprint: Blueprint) => void;
  onDeleteBlueprint: (id: string) => void;
  onCreateBlank: () => void;
}

export function BlueprintLibrary({
  blueprints,
  activeBlueprintId,
  onLoadBlueprint,
  onDuplicateBlueprint,
  onDeleteBlueprint,
  onCreateBlank,
}: BlueprintLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ReferenceType>('all');

  const summary = useMemo(() => {
    const total = blueprints.length;
    const appsAndSites = blueprints.filter(
      (b) => b.referenceScope.referenceType === 'app' || b.referenceScope.referenceType === 'website',
    ).length;
    const games = blueprints.filter((b) => b.referenceScope.referenceType === 'game').length;
    const totalFeatures = blueprints.reduce((acc, b) => acc + b.features.length, 0);
    return { total, appsAndSites, games, totalFeatures };
  }, [blueprints]);

  const filteredBlueprints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return blueprints.filter((bp) => {
      if (typeFilter !== 'all' && bp.referenceScope.referenceType !== typeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        bp.appName.toLowerCase().includes(q) ||
        bp.summary.toLowerCase().includes(q) ||
        bp.referenceScope.targetName.toLowerCase().includes(q) ||
        bp.aesthetic.style.toLowerCase().includes(q)
      );
    });
  }, [blueprints, searchQuery, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Summary Dashboard Card */}
      <section
        aria-label="Blueprint Library Summary"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-display font-semibold text-zinc-950 dark:text-white">
              Saved Blueprints Library
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
              All blueprints are stored locally in your browser so you can revisit, duplicate, and refine prompts anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateBlank}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Blank Blueprint</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Saved Blueprints</p>
            <p className="text-2xl font-display font-bold tabular-nums text-zinc-950 dark:text-white mt-1">
              {summary.total}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Apps & Websites</p>
            <p className="text-2xl font-display font-bold tabular-nums text-zinc-950 dark:text-white mt-1">
              {summary.appsAndSites}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Game-Inspired</p>
            <p className="text-2xl font-display font-bold tabular-nums text-zinc-950 dark:text-white mt-1">
              {summary.games}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Checklist Features</p>
            <p className="text-2xl font-display font-bold tabular-nums text-zinc-950 dark:text-white mt-1">
              {summary.totalFeatures}
            </p>
          </div>
        </div>
      </section>

      {/* Primary Input Bar & Real-Time Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved blueprints by app name, reference inspiration, or style..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div
          className="inline-flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shrink-0"
          role="group"
          aria-label="Filter saved blueprints"
        >
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'website', label: 'Websites' },
              { id: 'app', label: 'Apps' },
              { id: 'game', label: 'Games' },
            ] as { id: 'all' | ReferenceType; label: string }[]
          ).map((tab) => {
            const active = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Blueprint Grid */}
      {filteredBlueprints.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            No saved blueprints match your current filter.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Try clearing your search or create a fresh blueprint to get started.
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
              }}
              className="px-3.5 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={onCreateBlank}
              className="px-3.5 py-2 text-xs font-medium bg-violet-600 text-white rounded-lg cursor-pointer"
            >
              New Blueprint
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlueprints.map((bp) => {
            const isCurrent = bp.id === activeBlueprintId;
            return (
              <article
                key={bp.id}
                className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 flex flex-col justify-between gap-4 transition-all duration-150 ease-out ${
                  isCurrent
                    ? 'border-violet-500/80'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-display font-semibold text-zinc-950 dark:text-white truncate">
                      {bp.appName || 'Untitled App'}
                    </h3>
                    {isCurrent && (
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400 shrink-0">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Unboxed metadata */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="capitalize">{bp.referenceScope.referenceType}</span>
                    {bp.referenceScope.targetName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Inspired by {bp.referenceScope.targetName}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{bp.aesthetic.style}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {bp.summary || 'No summary provided yet.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                    {bp.features.length} features · {bp.updatedAt}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDuplicateBlueprint(bp)}
                      aria-label={`Duplicate ${bp.appName}`}
                      title="Duplicate"
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBlueprint(bp.id)}
                      aria-label={`Delete ${bp.appName}`}
                      title="Delete"
                      className="p-1.5 text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onLoadBlueprint(bp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-500 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Open</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
