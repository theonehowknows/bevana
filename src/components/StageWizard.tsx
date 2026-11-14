import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Info, Plus, Sparkles, Trash2 } from 'lucide-react';
import {
  DATA_TEMPLATES,
  QUICK_FEATURE_IDEAS,
  STAGE_GUIDES,
  STARTER_SCENARIOS,
} from '../data/presets';
import { Blueprint, DataTemplatePreset, StarterScenario } from '../types/blueprint';
import { getStageDoneMap } from '../utils/blueprintCompiler';
import { DesignPromptStudio } from './DesignPromptStudio';
import { ReferenceAnalyzer } from './ReferenceAnalyzer';

interface StageWizardProps {
  blueprint: Blueprint;
  activeStage: number;
  onSelectStage: (stage: number) => void;
  onUpdateBlueprint: (updater: (prev: Blueprint) => Blueprint) => void;
  onOpenFullAnalyzer: () => void;
  onShowDesignOutput: () => void;
}

const ENVIRONMENT_OPTIONS = [
  {
    title: 'Simple Web App (Recommended)',
    subtitle: 'Runs right in the browser with React and Tailwind CSS — fast and easy to build.',
    value: 'Single-page React application using Tailwind CSS.',
  },
  {
    title: 'Web App + Backend Server',
    subtitle: 'Includes a Node/Express server for saving shared data or calling AI APIs.',
    value: 'Full-stack Express + React application with server-side API routes.',
  },
  {
    title: 'Interactive Game or Canvas App',
    subtitle: 'Great for 2D board games, drawing boards, or animated puzzles.',
    value: 'Interactive HTML5 Canvas + React application using Tailwind CSS.',
  },
];

const ICONOGRAPHY_OPTIONS = [
  { label: 'Crisp Outline Icons (Lucide)', value: 'Lucide-react (or SVG equivalents).' },
  { label: 'Simple Custom Shapes (SVG)', value: 'Minimalist custom geometric SVGs.' },
];

const TARGET_SCREEN_OPTIONS = [
  { label: 'Works on phones & laptops', value: 'Mobile-first responsive desktop view.' },
  { label: 'Desktop workspace first', value: 'Desktop workspace (1440px baseline) with clean mobile fallback.' },
  { label: 'Phone-first touch layout', value: 'Touch-friendly mobile web app view.' },
];

const STORAGE_OPTIONS = [
  { label: 'Save in browser (no login needed)', value: 'localStorage with safe defaults' },
  { label: 'Shareable link + browser save', value: 'URL query parameters + localStorage backup' },
  { label: 'Temporary session + download file', value: 'In-memory React state with JSON export/import' },
  { label: 'Server database / API', value: 'Server-side persistence via Express API routes' },
];

export function StageWizard({
  blueprint,
  activeStage,
  onSelectStage,
  onUpdateBlueprint,
  onOpenFullAnalyzer,
  onShowDesignOutput,
}: StageWizardProps) {
  const [newFeatureText, setNewFeatureText] = useState('');
  const [newConstraintText, setNewConstraintText] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'boolean' | 'date'>('text');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const currentGuide = STAGE_GUIDES.find((g) => g.stage === activeStage) ?? STAGE_GUIDES[0];
  const stageDone = getStageDoneMap(blueprint);

  function applyStarterScenario(scenario: StarterScenario) {
    onUpdateBlueprint((prev) => ({
      ...prev,
      appName: scenario.appName,
      summary: scenario.summary,
      referenceScope: {
        ...prev.referenceScope,
        targetName: scenario.targetName,
        referenceType: scenario.referenceType,
        coreLoop: scenario.coreLoop,
        layoutPattern: scenario.layoutPattern,
        differentiator: scenario.differentiator,
      },
      dataModel: {
        ...prev.dataModel,
        primaryEntities: scenario.primaryEntities,
        schemaPreview: scenario.schemaPreview,
      },
      features: scenario.features.map((label, idx) => ({
        id: `sc_${scenario.id}_${idx}`,
        label,
        checked: false,
      })),
    }));
  }

  function applyDataTemplate(template: DataTemplatePreset) {
    onUpdateBlueprint((prev) => ({
      ...prev,
      dataModel: {
        ...prev.dataModel,
        primaryEntities: template.primaryEntities,
        schemaPreview: template.schemaPreview,
      },
    }));
  }

  function handleAddJsonField() {
    const cleanName = fieldName
      .trim()
      .replace(/[^a-zA-Z0-9_]/g, '')
      .replace(/^[0-9]+/, '');
    if (!cleanName) return;

    const sampleValue =
      fieldType === 'number'
        ? 10
        : fieldType === 'boolean'
          ? false
          : fieldType === 'date'
            ? '2026-11-14'
            : 'Example text';

    let nextSchema = blueprint.dataModel.schemaPreview;
    try {
      const parsed = JSON.parse(blueprint.dataModel.schemaPreview || '{}') as Record<string, unknown>;
      parsed[cleanName] = sampleValue;
      nextSchema = JSON.stringify(parsed, null, 2);
    } catch {
      nextSchema = JSON.stringify({ [cleanName]: sampleValue }, null, 2);
    }

    onUpdateBlueprint((prev) => ({
      ...prev,
      dataModel: {
        ...prev.dataModel,
        primaryEntities: prev.dataModel.primaryEntities.includes(cleanName)
          ? prev.dataModel.primaryEntities
          : `${prev.dataModel.primaryEntities} + ${cleanName}`,
        schemaPreview: nextSchema,
      },
    }));
    setFieldName('');
  }

  function handleAddFeature(text?: string) {
    const trimmed = (text ?? newFeatureText).trim();
    if (!trimmed) return;
    const alreadyExists = blueprint.features.some(
      (f) => f.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (alreadyExists) {
      if (!text) setNewFeatureText('');
      return;
    }
    onUpdateBlueprint((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        { id: `feat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label: trimmed, checked: false },
      ],
    }));
    if (!text) setNewFeatureText('');
  }

  function handleRemoveFeature(id: string) {
    onUpdateBlueprint((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== id),
    }));
  }

  function handleToggleFeature(id: string) {
    onUpdateBlueprint((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f)),
    }));
  }

  function handleAddConstraint() {
    const trimmed = newConstraintText.trim();
    if (!trimmed) return;
    onUpdateBlueprint((prev) => ({
      ...prev,
      constraints: [
        ...prev.constraints,
        { id: `con_${Date.now()}`, label: trimmed, enabled: true },
      ],
    }));
    setNewConstraintText('');
  }

  function handleToggleConstraint(id: string) {
    onUpdateBlueprint((prev) => ({
      ...prev,
      constraints: prev.constraints.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    }));
  }

  async function handleAiSuggest(stage: 'data' | 'features') {
    setIsSuggesting(true);
    setSuggestError(null);
    try {
      const res = await fetch('/api/ai/suggest-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: blueprint.appName,
          goal: blueprint.summary,
          coreLoop: blueprint.referenceScope.coreLoop,
          stage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not generate suggestions right now.');
      }

      if (stage === 'data') {
        let formattedSchema = data.schemaPreview;
        if (typeof data.schemaPreview === 'string' && data.schemaPreview.trim()) {
          try {
            formattedSchema = JSON.stringify(JSON.parse(data.schemaPreview), null, 2);
          } catch {
            formattedSchema = data.schemaPreview;
          }
        }
        onUpdateBlueprint((prev) => ({
          ...prev,
          dataModel: {
            primaryEntities: data.primaryEntities || prev.dataModel.primaryEntities,
            schemaPreview: formattedSchema || prev.dataModel.schemaPreview,
            storageStrategy: data.storageStrategy || prev.dataModel.storageStrategy,
          },
        }));
      } else {
        onUpdateBlueprint((prev) => ({
          ...prev,
          features: Array.isArray(data.features)
            ? data.features.map((label: string, idx: number) => ({
                id: `ai_f_${Date.now()}_${idx}`,
                label,
                checked: false,
              }))
            : prev.features,
          constraints: Array.isArray(data.constraints)
            ? [
                ...prev.constraints,
                ...data.constraints
                  .filter(
                    (label: string) =>
                      !prev.constraints.some(
                        (existing) => existing.label.toLowerCase() === label.toLowerCase(),
                      ),
                  )
                  .map((label: string, idx: number) => ({
                    id: `ai_c_${Date.now()}_${idx}`,
                    label,
                    enabled: true,
                  })),
              ]
            : prev.constraints,
        }));
      }
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : 'Unable to reach Gemini AI.');
    } finally {
      setIsSuggesting(false);
    }
  }

  return (
    <section
      aria-label="Step-by-step Blueprint Builder"
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col"
    >
      {/* Stage Stepper Navigation */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {STAGE_GUIDES.map((guide) => {
            const isActive = guide.stage === activeStage;
            const isDone = stageDone[guide.stage];
            return (
              <button
                key={guide.stage}
                type="button"
                onClick={() => {
                  onSelectStage(guide.stage);
                  setSuggestError(null);
                  if (guide.stage === 3) {
                    onShowDesignOutput();
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white dark:bg-violet-500'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span>{guide.shortTitle}</span>
                {isDone && !isActive && (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-label="Completed" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step Guidance Header */}
      <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50">
        <div className="space-y-1.5">
          <h2 className="text-lg font-display font-semibold text-zinc-950 dark:text-white">
            {currentGuide.title}
          </h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {currentGuide.whatItDoes}
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
            <p>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">Why this helps: </span>
              {currentGuide.whyItMatters}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">Beginner tip: </span>
              {currentGuide.quickTip}
            </p>
          </div>
        </div>
      </div>

      {/* Active Stage Form Body */}
      <div className="p-4 sm:p-6 space-y-6 flex-1">
        {activeStage === 1 && (
          <div className="space-y-6">
            {/* Quick Starter Scenarios for Beginners */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Quick Starter Ideas (Click any example to fill in all steps)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_SCENARIOS.map((scenario) => {
                  const isCurrent =
                    blueprint.appName.toLowerCase() === scenario.appName.toLowerCase();
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => applyStarterScenario(scenario)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 ease-out cursor-pointer ${
                        isCurrent
                          ? 'bg-violet-500/10 border-violet-500'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="block text-xs font-semibold text-zinc-950 dark:text-white">
                        {scenario.title}
                      </span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {scenario.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  App Name
                </label>
                <input
                  type="text"
                  value={blueprint.appName}
                  onChange={(e) =>
                    onUpdateBlueprint((prev) => ({ ...prev, appName: e.target.value }))
                  }
                  placeholder="Give your app a short name (e.g., Daily Cadence, Pantry Week)"
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  What does your app do? (1–2 everyday sentences)
                </label>
                <textarea
                  rows={2}
                  value={blueprint.summary}
                  onChange={(e) =>
                    onUpdateBlueprint((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  placeholder="Describe who uses it and the main thing they can do."
                  className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Or model it after an existing Website, App, or Game
                </span>
                <button
                  type="button"
                  onClick={onOpenFullAnalyzer}
                  className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                >
                  Open full Inspo Finder
                </button>
              </div>
              <ReferenceAnalyzer
                blueprint={blueprint}
                onUpdateBlueprint={onUpdateBlueprint}
                compact
              />
            </div>
          </div>
        )}

        {activeStage === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                What kind of web app is this?
              </label>
              <div className="space-y-2 mb-2.5">
                {ENVIRONMENT_OPTIONS.map((option) => {
                  const selected = blueprint.environment.environment === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onUpdateBlueprint((prev) => ({
                          ...prev,
                          environment: { ...prev.environment, environment: option.value },
                        }))
                      }
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 ease-out cursor-pointer ${
                        selected
                          ? 'bg-violet-500/10 border-violet-500'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="block text-xs sm:text-sm font-medium text-zinc-950 dark:text-white">
                        {option.title}
                      </span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {option.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={blueprint.environment.environment}
                onChange={(e) =>
                  onUpdateBlueprint((prev) => ({
                    ...prev,
                    environment: { ...prev.environment, environment: e.target.value },
                  }))
                }
                placeholder="Or describe a custom setup..."
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Icon Style
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONOGRAPHY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onUpdateBlueprint((prev) => ({
                        ...prev,
                        environment: { ...prev.environment, iconography: option.value },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                      blueprint.environment.iconography === option.value
                        ? 'bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Which screens will people use most?
              </label>
              <div className="flex flex-wrap gap-2">
                {TARGET_SCREEN_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onUpdateBlueprint((prev) => ({
                        ...prev,
                        environment: { ...prev.environment, targetScreen: option.value },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                      blueprint.environment.targetScreen === option.value
                        ? 'bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeStage === 3 && (
          <DesignPromptStudio
            blueprint={blueprint}
            onUpdateBlueprint={onUpdateBlueprint}
            compact
          />
        )}

        {activeStage === 4 && (
          <div className="space-y-5">
            {/* Ready-to-use Data Starters */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Pick a Data Starter (Fills in an example item for you)
                </span>
                <button
                  type="button"
                  onClick={() => handleAiSuggest('data')}
                  disabled={isSuggesting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSuggesting ? 'Drafting...' : 'Auto-fill with Gemini AI'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DATA_TEMPLATES.map((tpl) => {
                  const selected = blueprint.dataModel.primaryEntities === tpl.primaryEntities;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => applyDataTemplate(tpl)}
                      className={`text-left px-3 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-violet-500/10 border-violet-500'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="block text-xs font-semibold text-zinc-950 dark:text-white">
                        {tpl.label}
                      </span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {tpl.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {suggestError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300"
              >
                {suggestError}
              </div>
            )}

            {/* Simple Field Adder (No JSON knowledge needed) */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <span className="block text-xs font-medium text-zinc-800 dark:text-zinc-200">
                Add a Field to Your Saved Item (Optional)
              </span>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddJsonField();
                    }
                  }}
                  placeholder="Field name (e.g., dueDate, rating, tag)"
                  className="flex-1 min-w-[160px] px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                />
                <select
                  value={fieldType}
                  onChange={(e) =>
                    setFieldType(e.target.value as 'text' | 'number' | 'boolean' | 'date')
                  }
                  aria-label="Field type"
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Yes / No</option>
                  <option value="date">Date</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddJsonField}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Where should data be saved?
              </label>
              <div className="flex flex-wrap gap-2">
                {STORAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onUpdateBlueprint((prev) => ({
                        ...prev,
                        dataModel: { ...prev.dataModel, storageStrategy: opt.value },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                      blueprint.dataModel.storageStrategy === opt.value
                        ? 'bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Example Item Preview (Editable)
              </label>
              <textarea
                rows={6}
                value={blueprint.dataModel.schemaPreview}
                onChange={(e) =>
                  onUpdateBlueprint((prev) => ({
                    ...prev,
                    dataModel: { ...prev.dataModel, schemaPreview: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        )}

        {activeStage === 5 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Click ideas below to add them, or type your own features.
              </p>
              <button
                type="button"
                onClick={() => handleAiSuggest('features')}
                disabled={isSuggesting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSuggesting ? 'Suggesting...' : 'Suggest Features with AI'}</span>
              </button>
            </div>

            {suggestError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300"
              >
                {suggestError}
              </div>
            )}

            {/* One-click Popular Feature Ideas */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Quick Add Popular Features
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_FEATURE_IDEAS.map((idea) => {
                  const added = blueprint.features.some(
                    (f) => f.label.toLowerCase() === idea.toLowerCase(),
                  );
                  return (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => handleAddFeature(idea)}
                      disabled={added}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                        added
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 opacity-75 cursor-default'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-violet-500'
                      }`}
                    >
                      {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      <span>{idea}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Feature Checklist */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Your Feature Checklist ({blueprint.features.length})
              </h3>

              <div className="space-y-2">
                {blueprint.features.map((feat) => (
                  <div
                    key={feat.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                  >
                    <label className="flex items-center gap-2.5 text-sm text-zinc-800 dark:text-zinc-200 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={feat.checked}
                        onChange={() => handleToggleFeature(feat.id)}
                        className="w-4 h-4 rounded accent-violet-500 cursor-pointer shrink-0"
                      />
                      <span className="truncate">{feat.label}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feat.id)}
                      aria-label={`Remove ${feat.label}`}
                      className="text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="Type a custom feature (e.g., Export list as CSV)..."
                  className="flex-1 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddFeature()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Feature</span>
                </button>
              </div>
            </div>

            {/* Guardrail Rules */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Safety Rules & Guardrails (Keeps AI code clean and reliable)
              </h3>

              <div className="space-y-2">
                {blueprint.constraints.map((constraint) => (
                  <label
                    key={constraint.id}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={constraint.enabled}
                      onChange={() => handleToggleConstraint(constraint.id)}
                      className="w-4 h-4 rounded accent-violet-500 mt-0.5 cursor-pointer shrink-0"
                    />
                    <span>{constraint.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newConstraintText}
                  onChange={(e) => setNewConstraintText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddConstraint();
                    }
                  }}
                  placeholder="Add your own rule (e.g., Keep buttons large and clear)..."
                  className="flex-1 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={handleAddConstraint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stage Footer Navigation */}
      <div className="px-4 sm:px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={activeStage <= 1}
          onClick={() => onSelectStage(Math.max(1, activeStage - 1))}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
          Step {activeStage} of {STAGE_GUIDES.length}
        </span>

        <button
          type="button"
          disabled={activeStage >= STAGE_GUIDES.length}
          onClick={() => {
            const next = Math.min(STAGE_GUIDES.length, activeStage + 1);
            onSelectStage(next);
            if (next === 3) {
              onShowDesignOutput();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Next Step</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
