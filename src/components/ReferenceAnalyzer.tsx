import { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Globe, Gamepad2, LayoutGrid, Search, Sparkles } from 'lucide-react';
import { BORROWABLE_ASPECTS, REFERENCE_PRESETS } from '../data/presets';
import {
  AiReferenceAnalysis,
  Blueprint,
  GroundingSource,
  ReferencePreset,
  ReferenceType,
} from '../types/blueprint';

interface ReferenceAnalyzerProps {
  blueprint: Blueprint;
  onUpdateBlueprint: (updater: (prev: Blueprint) => Blueprint) => void;
  onNavigateToBuilder?: () => void;
  compact?: boolean;
}

export function ReferenceAnalyzer({
  blueprint,
  onUpdateBlueprint,
  onNavigateToBuilder,
  compact = false,
}: ReferenceAnalyzerProps) {
  const [filterType, setFilterType] = useState<'all' | ReferenceType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiReferenceAnalysis | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);

  const filteredPresets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return REFERENCE_PRESETS.filter((preset) => {
      if (filterType !== 'all' && preset.referenceType !== filterType) {
        return false;
      }
      if (!q) return true;
      return (
        preset.name.toLowerCase().includes(q) ||
        preset.tagline.toLowerCase().includes(q) ||
        preset.suggestedAppName.toLowerCase().includes(q)
      );
    });
  }, [filterType, searchQuery]);

  function toggleAspect(aspect: string) {
    onUpdateBlueprint((prev) => {
      const exists = prev.referenceScope.borrowedAspects.includes(aspect);
      const nextAspects = exists
        ? prev.referenceScope.borrowedAspects.filter((a) => a !== aspect)
        : [...prev.referenceScope.borrowedAspects, aspect];
      return {
        ...prev,
        referenceScope: {
          ...prev.referenceScope,
          borrowedAspects: nextAspects,
        },
      };
    });
  }

  function applyPreset(preset: ReferencePreset) {
    onUpdateBlueprint((prev) => ({
      ...prev,
      appName: preset.suggestedAppName,
      summary: preset.summary,
      referenceScope: {
        targetName: preset.name,
        referenceType: preset.referenceType,
        referenceUrl: '',
        borrowedAspects: preset.borrowedAspects,
        coreLoop: preset.coreLoop,
        layoutPattern: preset.layoutPattern,
        differentiator: preset.differentiator,
      },
      aesthetic: {
        ...prev.aesthetic,
        style: preset.aestheticStyle,
        background: preset.background,
        cardSurfaces: preset.cardSurfaces,
        typography: preset.typography,
        accent: preset.accent,
        motion: preset.motion,
        aiPolishedDesignPrompt: '',
        aiColorRationale: '',
        aiLayoutGuidance: '',
      },
      dataModel: {
        ...prev.dataModel,
        primaryEntities: preset.primaryEntities,
        schemaPreview: preset.schemaPreview,
      },
      features: preset.features.map((label, idx) => ({
        id: `feat_${preset.id}_${idx}`,
        label,
        checked: false,
      })),
    }));
    setAiResult(null);
    setAiError(null);
  }

  async function handleAnalyzeWithAi() {
    if (!blueprint.referenceScope.targetName.trim() && !blueprint.referenceScope.referenceUrl.trim()) {
      setAiError('Type the name of a website, app, or game you like first.');
      return;
    }

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/analyze-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: blueprint.referenceScope.targetName,
          referenceType: blueprint.referenceScope.referenceType,
          referenceUrl: blueprint.referenceScope.referenceUrl,
          goal: blueprint.summary,
          borrowedAspects: blueprint.referenceScope.borrowedAspects,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not analyze reference right now.');
      }
      setAiResult((data.analysis || null) as AiReferenceAnalysis | null);
      setGroundingSources(Array.isArray(data.groundingSources) ? data.groundingSources : []);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to reach Gemini AI.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function applyAiResultToBlueprint() {
    if (!aiResult) return;
    onUpdateBlueprint((prev) => ({
      ...prev,
      appName: aiResult.appNameSuggestion || prev.appName,
      summary: aiResult.summary || prev.summary,
      referenceScope: {
        ...prev.referenceScope,
        coreLoop: aiResult.coreLoop || prev.referenceScope.coreLoop,
        layoutPattern: aiResult.layoutPattern || prev.referenceScope.layoutPattern,
        differentiator: aiResult.differentiator || prev.referenceScope.differentiator,
      },
      aesthetic: {
        ...prev.aesthetic,
        style: aiResult.aestheticStyle || prev.aesthetic.style,
        typography: aiResult.typographyNotes || prev.aesthetic.typography,
        notes: aiResult.paletteNotes || prev.aesthetic.notes,
        aiPolishedDesignPrompt: '',
        aiColorRationale: '',
        aiLayoutGuidance: '',
      },
      dataModel: {
        ...prev.dataModel,
        primaryEntities:
          Array.isArray(aiResult.entities) && aiResult.entities.length > 0
            ? aiResult.entities.join('; ')
            : prev.dataModel.primaryEntities,
      },
      features:
        Array.isArray(aiResult.features) && aiResult.features.length > 0
          ? aiResult.features.map((label, idx) => ({
              id: `ai_feat_${Date.now()}_${idx}`,
              label,
              checked: false,
            }))
          : prev.features,
    }));
    if (onNavigateToBuilder) {
      onNavigateToBuilder();
    }
  }

  const typeOptions: { id: ReferenceType; label: string; icon: typeof Globe }[] = [
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'app', label: 'App', icon: LayoutGrid },
    { id: 'game', label: 'Game', icon: Gamepad2 },
  ];

  return (
    <div className="space-y-6">
      {/* Custom Reference Scoping Form */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-display font-semibold text-zinc-950 dark:text-white">
            Start from a Website, App, or Game You Already Know
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Name something you like, pick what parts you want to borrow, and optionally let Gemini AI break it down into simple steps.
          </p>
        </div>

        {/* Category segmented selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mr-1">What is it?</span>
          <div className="inline-flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            {typeOptions.map((opt) => {
              const Icon = opt.icon;
              const active = blueprint.referenceScope.referenceType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onUpdateBlueprint((prev) => ({
                      ...prev,
                      referenceScope: { ...prev.referenceScope, referenceType: opt.id },
                    }))
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Name of Website, App, or Game
            </label>
            <input
              type="text"
              value={blueprint.referenceScope.targetName}
              onChange={(e) =>
                onUpdateBlueprint((prev) => ({
                  ...prev,
                  referenceScope: { ...prev.referenceScope, targetName: e.target.value },
                }))
              }
              placeholder="e.g., Notion, Trello, Wordle, Spotify, Balatro"
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Website Link (Optional)
            </label>
            <input
              type="url"
              value={blueprint.referenceScope.referenceUrl}
              onChange={(e) =>
                onUpdateBlueprint((prev) => ({
                  ...prev,
                  referenceScope: { ...prev.referenceScope, referenceUrl: e.target.value },
                }))
              }
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Aspects to borrow */}
        <div>
          <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            What do you like about it? (Pick as many as you want)
          </span>
          <div className="flex flex-wrap gap-2">
            {BORROWABLE_ASPECTS.map((aspect) => {
              const selected = blueprint.referenceScope.borrowedAspects.includes(aspect);
              return (
                <button
                  key={aspect}
                  type="button"
                  onClick={() => toggleAspect(aspect)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer ${
                    selected
                      ? 'bg-violet-600/10 dark:bg-violet-500/15 border-violet-500 text-violet-700 dark:text-violet-300'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {aspect}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Analyze Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Let Gemini AI suggest a layout, feature list, and data structure based on this inspiration.
          </p>
          <button
            type="button"
            onClick={handleAnalyzeWithAi}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:opacity-60 rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Break Down with Gemini AI'}</span>
          </button>
        </div>

        {/* Loading skeleton */}
        {isAnalyzing && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5 animate-pulse">
            <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        )}

        {/* Error state */}
        {aiError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300"
          >
            {aiError}
          </div>
        )}

        {/* AI Result Preview */}
        {aiResult && !isAnalyzing && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-violet-500/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-mono text-violet-600 dark:text-violet-400">
                  Suggested Breakdown
                </p>
                <h4 className="text-sm font-display font-semibold text-zinc-950 dark:text-white">
                  {aiResult.appNameSuggestion || blueprint.referenceScope.targetName}
                </h4>
              </div>
              <button
                type="button"
                onClick={applyAiResultToBlueprint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Use This Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {aiResult.summary && (
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{aiResult.summary}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {aiResult.coreLoop && (
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 block mb-0.5">
                    Step-by-step flow
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400">{aiResult.coreLoop}</p>
                </div>
              )}
              {aiResult.layoutPattern && (
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 block mb-0.5">
                    Page layout
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400">{aiResult.layoutPattern}</p>
                </div>
              )}
            </div>

            {groundingSources.length > 0 && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span>Sources:</span>
                {groundingSources.map((src) => (
                  <a
                    key={src.uri}
                    href={src.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline truncate max-w-[200px]"
                  >
                    <span className="truncate">{src.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Editable Breakdown Fields */}
        {!compact && (
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Step-by-Step User Flow (What happens first, second, third?)
              </label>
              <textarea
                rows={2}
                value={blueprint.referenceScope.coreLoop}
                onChange={(e) =>
                  onUpdateBlueprint((prev) => ({
                    ...prev,
                    referenceScope: { ...prev.referenceScope, coreLoop: e.target.value },
                  }))
                }
                placeholder="e.g., Add an item -> filter the list -> check it off -> see progress"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  How the Screen Is Arranged
                </label>
                <textarea
                  rows={2}
                  value={blueprint.referenceScope.layoutPattern}
                  onChange={(e) =>
                    onUpdateBlueprint((prev) => ({
                      ...prev,
                      referenceScope: { ...prev.referenceScope, layoutPattern: e.target.value },
                    }))
                  }
                  placeholder="e.g., Input bar on top, clean list or grid of cards underneath"
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  What Keeps It Simple (What to leave out)
                </label>
                <textarea
                  rows={2}
                  value={blueprint.referenceScope.differentiator}
                  onChange={(e) =>
                    onUpdateBlueprint((prev) => ({
                      ...prev,
                      referenceScope: { ...prev.referenceScope, differentiator: e.target.value },
                    }))
                  }
                  placeholder="e.g., No login screen or complicated settings menus"
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Curated Offline Examples */}
      <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-display font-semibold text-zinc-950 dark:text-white">
              Ready-Made Examples (Websites, Apps & Games)
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Click any familiar example below to load a clean, ready-to-edit blueprint in one click.
            </p>
          </div>

          <div
            className="inline-flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
            role="group"
            aria-label="Filter reference examples"
          >
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'website', label: 'Websites' },
                { id: 'app', label: 'Apps' },
                { id: 'game', label: 'Games' },
              ] as { id: 'all' | ReferenceType; label: string }[]
            ).map((tab) => {
              const active = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer ${
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

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search examples (e.g., Trello, Wordle, Spotify, Notion)..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {filteredPresets.length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No examples match "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterType('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
            >
              Show all examples
            </button>
          </div>
        ) : (
          <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredPresets.map((preset) => {
              const isSelected =
                blueprint.referenceScope.targetName.toLowerCase() === preset.name.toLowerCase();
              return (
                <div
                  key={preset.id}
                  className={`p-4 rounded-xl border transition-all duration-150 ease-out flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-violet-500/5 border-violet-500/60 dark:bg-violet-500/10'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-sm font-display font-semibold text-zinc-950 dark:text-white">
                        {preset.name}
                      </h5>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                        {preset.referenceType}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {preset.tagline}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                      {preset.borrowedAspects.join(' · ')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      applyPreset(preset);
                      if (!compact && onNavigateToBuilder) {
                        onNavigateToBuilder();
                      }
                    }}
                    className="w-full py-1.5 px-3 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
                  >
                    {isSelected ? 'Currently Selected' : `Use ${preset.name} Style`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
