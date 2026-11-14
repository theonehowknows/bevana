import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, RotateCcw, Sparkles, X } from 'lucide-react';
import { AESTHETIC_PRESETS, DENSITY_CHOICES, LAYOUT_CHOICES } from '../data/presets';
import { AestheticPreset, Blueprint } from '../types/blueprint';

interface DesignPromptStudioProps {
  blueprint: Blueprint;
  onUpdateBlueprint: (updater: (prev: Blueprint) => Blueprint) => void;
  compact?: boolean;
}

export function DesignPromptStudio({
  blueprint,
  onUpdateBlueprint,
  compact = false,
}: DesignPromptStudioProps) {
  const [newAntiPattern, setNewAntiPattern] = useState('');
  const [showAdvancedTokens, setShowAdvancedTokens] = useState(false);
  const [isCrafting, setIsCrafting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  function applyAestheticPreset(preset: AestheticPreset) {
    onUpdateBlueprint((prev) => ({
      ...prev,
      aesthetic: {
        ...prev.aesthetic,
        style: preset.style,
        background: preset.background,
        cardSurfaces: preset.cardSurfaces,
        typography: preset.typography,
        accent: preset.accent,
        motion: preset.motion,
        antiPatterns: preset.antiPatterns,
        aiPolishedDesignPrompt: '',
        aiColorRationale: '',
        aiLayoutGuidance: '',
      },
    }));
  }

  function updateAestheticField(patch: Partial<Blueprint['aesthetic']>) {
    onUpdateBlueprint((prev) => ({
      ...prev,
      aesthetic: {
        ...prev.aesthetic,
        ...patch,
        aiPolishedDesignPrompt: '',
        aiColorRationale: '',
        aiLayoutGuidance: '',
      },
    }));
  }

  function addAntiPattern() {
    const trimmed = newAntiPattern.trim();
    if (!trimmed) return;
    onUpdateBlueprint((prev) => ({
      ...prev,
      aesthetic: {
        ...prev.aesthetic,
        antiPatterns: [...prev.aesthetic.antiPatterns, trimmed],
      },
    }));
    setNewAntiPattern('');
  }

  function removeAntiPattern(index: number) {
    onUpdateBlueprint((prev) => ({
      ...prev,
      aesthetic: {
        ...prev.aesthetic,
        antiPatterns: prev.aesthetic.antiPatterns.filter((_, i) => i !== index),
      },
    }));
  }

  async function handleCraftWithAi() {
    setIsCrafting(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/craft-design-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: blueprint.appName,
          goal: blueprint.summary,
          referenceTarget: blueprint.referenceScope.targetName,
          referenceType: blueprint.referenceScope.referenceType,
          style: blueprint.aesthetic.style,
          background: blueprint.aesthetic.background,
          cardSurfaces: blueprint.aesthetic.cardSurfaces,
          typography: blueprint.aesthetic.typography,
          accent: blueprint.aesthetic.accent,
          motion: blueprint.aesthetic.motion,
          notes: [
            blueprint.aesthetic.layoutChoice ? `Layout: ${blueprint.aesthetic.layoutChoice}` : '',
            blueprint.aesthetic.density ? `Spacing: ${blueprint.aesthetic.density}` : '',
            blueprint.aesthetic.notes,
          ]
            .filter(Boolean)
            .join('. '),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not craft design prompt right now.');
      }

      onUpdateBlueprint((prev) => ({
        ...prev,
        aesthetic: {
          ...prev.aesthetic,
          aiPolishedDesignPrompt: data.designPrompt || prev.aesthetic.aiPolishedDesignPrompt,
          aiColorRationale: data.colorRationale || '',
          aiLayoutGuidance: data.layoutGuidance || '',
          antiPatterns:
            Array.isArray(data.suggestedAntiPatterns) && data.suggestedAntiPatterns.length > 0
              ? data.suggestedAntiPatterns
              : prev.aesthetic.antiPatterns,
        },
      }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to reach Gemini AI.');
    } finally {
      setIsCrafting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Mood & Color Presets in plain English */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-display font-semibold text-zinc-950 dark:text-white">
            1. Pick a Color Mood
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Choose the overall color feel for your app—no CSS knowledge required.
          </p>
        </div>

        <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {AESTHETIC_PRESETS.map((preset) => {
            const active = blueprint.aesthetic.style.toLowerCase() === preset.style.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyAestheticPreset(preset)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-150 ease-out cursor-pointer ${
                  active
                    ? 'bg-violet-500/5 dark:bg-violet-500/10 border-violet-500'
                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-display font-semibold text-zinc-950 dark:text-white">
                    {preset.name}
                  </span>
                  <span className="inline-flex items-center gap-1 shrink-0" aria-hidden="true">
                    <span
                      className="w-3.5 h-3.5 rounded-xs border border-zinc-600/40"
                      style={{ backgroundColor: preset.swatchBg }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-xs border border-zinc-600/40"
                      style={{ backgroundColor: preset.swatchCard }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-xs"
                      style={{ backgroundColor: preset.swatchAccent }}
                    />
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{preset.plainLabel}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Grounded Layout & Spacing Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            2. Page Layout Style
          </h4>
          <div className="space-y-1.5">
            {LAYOUT_CHOICES.map((choice) => {
              const selected = blueprint.aesthetic.layoutChoice === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => updateAestheticField({ layoutChoice: choice })}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-violet-500/10 border-violet-500 text-zinc-950 dark:text-white'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            3. Spacing & Breathing Room
          </h4>
          <div className="space-y-1.5">
            {DENSITY_CHOICES.map((choice) => {
              const selected = blueprint.aesthetic.density === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => updateAestheticField({ density: choice })}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-violet-500/10 border-violet-500 text-zinc-950 dark:text-white'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Plain-English Notes + Collapsible Technical CSS Tokens */}
      <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            4. Extra Look & Feel Notes (In your own words)
          </label>
          <textarea
            rows={2}
            value={blueprint.aesthetic.notes}
            onChange={(e) => updateAestheticField({ notes: e.target.value })}
            placeholder="e.g., Make buttons easy to read, keep the screen calm, and avoid clutter."
            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAdvancedTokens((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
          >
            {showAdvancedTokens ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span>
              {showAdvancedTokens
                ? 'Hide detailed color & font tokens'
                : 'Customize detailed color & font tokens (Optional)'}
            </span>
          </button>

          {showAdvancedTokens && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Style Label
                </label>
                <input
                  type="text"
                  value={blueprint.aesthetic.style}
                  onChange={(e) => updateAestheticField({ style: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Background Class
                </label>
                <input
                  type="text"
                  value={blueprint.aesthetic.background}
                  onChange={(e) => updateAestheticField({ background: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Card Surface Styling
                </label>
                <input
                  type="text"
                  value={blueprint.aesthetic.cardSurfaces}
                  onChange={(e) => updateAestheticField({ cardSurfaces: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Highlight Accent Color
                </label>
                <input
                  type="text"
                  value={blueprint.aesthetic.accent}
                  onChange={(e) => updateAestheticField({ accent: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Fonts & Text Hierarchy
                </label>
                <input
                  type="text"
                  value={blueprint.aesthetic.typography}
                  onChange={(e) => updateAestheticField({ typography: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Animation Feel
                </label>
                <input
                  type="text"
                  value={blueprint.aesthetic.motion}
                  onChange={(e) => updateAestheticField({ motion: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Things to Avoid */}
        <div>
          <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            5. Things to Avoid (Keeps the design clean)
          </span>
          <div className="space-y-2">
            {blueprint.aesthetic.antiPatterns.map((item, idx) => (
              <div
                key={`${item}_${idx}`}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeAntiPattern(idx)}
                  aria-label="Remove rule"
                  className="text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newAntiPattern}
              onChange={(e) => setNewAntiPattern(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAntiPattern();
                }
              }}
              placeholder="Add something to avoid (e.g., Avoid bright neon colors)..."
              className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onClick={addAntiPattern}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional Gemini AI Design Prompt Polisher */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-display font-semibold text-zinc-950 dark:text-white">
              Optional: Rewrite Design Prompt with Gemini AI
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your Design Prompt already updates automatically on the right, or click here to expand it into detailed art direction.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blueprint.aesthetic.aiPolishedDesignPrompt && (
              <button
                type="button"
                onClick={() => updateAestheticField({})}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Use Simple Version</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCraftWithAi}
              disabled={isCrafting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:opacity-60 rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isCrafting ? 'Polishing Prompt...' : 'Polish with Gemini AI'}</span>
            </button>
          </div>
        </div>

        {aiError && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300"
          >
            {aiError}
          </div>
        )}

        {(blueprint.aesthetic.aiColorRationale || blueprint.aesthetic.aiLayoutGuidance) && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-violet-500/40 space-y-2 text-xs">
            <p className="font-mono text-violet-600 dark:text-violet-400">
              Why these choices work (updated in Design Prompt tab)
            </p>
            {blueprint.aesthetic.aiColorRationale && (
              <p className="text-zinc-700 dark:text-zinc-300">
                <span className="font-medium text-zinc-900 dark:text-white">Colors: </span>
                {blueprint.aesthetic.aiColorRationale}
              </p>
            )}
            {blueprint.aesthetic.aiLayoutGuidance && (
              <p className="text-zinc-700 dark:text-zinc-300">
                <span className="font-medium text-zinc-900 dark:text-white">Layout: </span>
                {blueprint.aesthetic.aiLayoutGuidance}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
