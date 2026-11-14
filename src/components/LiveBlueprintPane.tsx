import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Blueprint, OutputTab } from '../types/blueprint';
import { compileDesignPrompt, compileProjectBlueprintMarkdown } from '../utils/blueprintCompiler';

interface LiveBlueprintPaneProps {
  blueprint: Blueprint;
  outputTab: OutputTab;
  onSelectTab: (tab: OutputTab) => void;
  onToggleFeature: (id: string) => void;
}

export function LiveBlueprintPane({
  blueprint,
  outputTab,
  onSelectTab,
  onToggleFeature,
}: LiveBlueprintPaneProps) {
  const [copied, setCopied] = useState(false);

  const blueprintMarkdown = compileProjectBlueprintMarkdown(blueprint);
  const designPromptText = compileDesignPrompt(blueprint);
  const activeText = outputTab === 'design' ? designPromptText : blueprintMarkdown;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(activeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.createElement('textarea');
      el.value = activeText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  function handleDownload() {
    const slug = (blueprint.appName || 'vibe-blueprint')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = outputTab === 'design' ? 'design-prompt' : 'blueprint';
    const blob = new Blob([activeText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug || 'project'}-${suffix}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const helperDescription =
    outputTab === 'design'
      ? 'Use this prompt when you only want to describe or restyle how your app looks and feels.'
      : outputTab === 'preview'
        ? 'An easy-to-read summary of your choices. You can check off features directly here.'
        : 'Your complete build prompt. Everything you change on the left updates here automatically.';

  return (
    <section
      aria-label="Live Prompt Preview"
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col h-full min-h-[560px]"
    >
      {/* Pane Header with plain-English output mode selector and export controls */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
          role="tablist"
          aria-label="Output format"
        >
          {(
            [
              { id: 'blueprint', label: 'Full Build Prompt' },
              { id: 'design', label: 'Design Prompt' },
              { id: 'preview', label: 'Easy Read View' },
            ] as { id: OutputTab; label: string }[]
          ).map((tab) => {
            const active = outputTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer ${
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

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save .md</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pane Content */}
      <div className="p-4 sm:p-5 flex-1 overflow-auto flex flex-col">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{helperDescription}</p>

        {outputTab === 'preview' ? (
          <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed flex-1">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <p className="text-xs font-mono text-violet-600 dark:text-violet-400 mb-1">
                Project Blueprint Summary
              </p>
              <h2 className="text-2xl font-display font-bold text-zinc-950 dark:text-white">
                {blueprint.appName.trim() || 'Untitled App'}
              </h2>
              {blueprint.summary.trim() && (
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">{blueprint.summary}</p>
              )}
              {blueprint.referenceScope.targetName.trim() && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Inspired by {blueprint.referenceScope.targetName} ({blueprint.referenceScope.referenceType})
                  {blueprint.referenceScope.borrowedAspects.length > 0
                    ? ` · ${blueprint.referenceScope.borrowedAspects.join(', ')}`
                    : ''}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-950 dark:text-white mb-2">
                1. Setup & Screens
              </h3>
              <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-300">
                <li>App Type: {blueprint.environment.environment}</li>
                <li>Icons: {blueprint.environment.iconography}</li>
                <li>Screen Size: {blueprint.environment.targetScreen}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-950 dark:text-white mb-2">
                2. Visual Design & Vibe
              </h3>
              <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-300">
                <li>Style: {blueprint.aesthetic.style}</li>
                {blueprint.aesthetic.layoutChoice && <li>Layout: {blueprint.aesthetic.layoutChoice}</li>}
                {blueprint.aesthetic.density && <li>Spacing: {blueprint.aesthetic.density}</li>}
                <li>Background: {blueprint.aesthetic.background}</li>
                <li>Cards: {blueprint.aesthetic.cardSurfaces}</li>
                <li>Highlight Color: {blueprint.aesthetic.accent}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-950 dark:text-white mb-2">
                3. Saved Information
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300">
                Items tracked: {blueprint.dataModel.primaryEntities}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300 mt-1">
                Where it saves: {blueprint.dataModel.storageStrategy}
              </p>
              {blueprint.dataModel.schemaPreview.trim() && (
                <pre className="mt-3 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto">
                  {blueprint.dataModel.schemaPreview}
                </pre>
              )}
            </div>

            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-950 dark:text-white mb-2">
                4. Feature Checklist
              </h3>
              <div className="space-y-2">
                {blueprint.features.map((feature) => (
                  <label
                    key={feature.id}
                    className="flex items-center gap-2.5 cursor-pointer text-zinc-700 dark:text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      checked={feature.checked}
                      onChange={() => onToggleFeature(feature.id)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 accent-violet-500 cursor-pointer"
                    />
                    <span className={feature.checked ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}>
                      {feature.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-950 dark:text-white mb-2">
                5. Guardrails
              </h3>
              <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-300">
                {blueprint.constraints
                  .filter((c) => c.enabled)
                  .map((c) => (
                    <li key={c.id}>• {c.label}</li>
                  ))}
              </ul>
            </div>
          </div>
        ) : (
          <pre className="flex-1 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-[13px] leading-relaxed font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words overflow-auto">
            {activeText}
          </pre>
        )}

        {/* Grounded next-step hint */}
        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            Next step: Click <span className="font-medium text-zinc-800 dark:text-zinc-200">Copy Prompt</span> and paste it directly into Google AI Studio.
          </span>
        </div>
      </div>
    </section>
  );
}
