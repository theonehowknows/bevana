import { useEffect, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { BlueprintLibrary } from './components/BlueprintLibrary';
import { DesignPromptStudio } from './components/DesignPromptStudio';
import { LiveBlueprintPane } from './components/LiveBlueprintPane';
import { ReferenceAnalyzer } from './components/ReferenceAnalyzer';
import { StageWizard } from './components/StageWizard';
import { TopBar } from './components/TopBar';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { BLANK_BLUEPRINT_TEMPLATE, STARTER_BLUEPRINTS } from './data/presets';
import { Blueprint, OutputTab, ThemeMode, WorkspaceView } from './types/blueprint';
import {
  loadActiveDraft,
  loadBlueprints,
  loadTheme,
  saveActiveDraft,
  saveBlueprints,
  saveTheme,
} from './utils/storage';

const GUIDE_BANNER_KEY = 'vibe_blueprint_hide_welcome_v1';

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [activeView, setActiveView] = useState<WorkspaceView>('builder');
  const [activeStage, setActiveStage] = useState<number>(1);
  const [outputTab, setOutputTab] = useState<OutputTab>('blueprint');
  const [blueprints, setBlueprints] = useState<Blueprint[]>(() => loadBlueprints(STARTER_BLUEPRINTS));
  const [activeBlueprint, setActiveBlueprint] = useState<Blueprint>(() =>
    loadActiveDraft(BLANK_BLUEPRINT_TEMPLATE),
  );
  const [justSaved, setJustSaved] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [showWelcomeStrip, setShowWelcomeStrip] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUIDE_BANNER_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveActiveDraft(activeBlueprint);
  }, [activeBlueprint]);

  useEffect(() => {
    saveBlueprints(blueprints);
  }, [blueprints]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data && typeof data.aiAvailable === 'boolean') {
          setAiAvailable(data.aiAvailable);
        }
      })
      .catch(() => {
        if (mounted) setAiAvailable(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function dismissWelcomeStrip() {
    setShowWelcomeStrip(false);
    try {
      localStorage.setItem(GUIDE_BANNER_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  }

  function updateBlueprint(updater: (prev: Blueprint) => Blueprint) {
    setActiveBlueprint((prev) => ({
      ...updater(prev),
      updatedAt: todayDate(),
    }));
  }

  function handleSaveToLibrary() {
    const updated: Blueprint = {
      ...activeBlueprint,
      updatedAt: todayDate(),
    };
    setActiveBlueprint(updated);
    setBlueprints((prev) => {
      const exists = prev.some((bp) => bp.id === updated.id);
      if (exists) {
        return prev.map((bp) => (bp.id === updated.id ? updated : bp));
      }
      return [updated, ...prev];
    });
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1800);
  }

  function handleCreateNewBlueprint() {
    const fresh: Blueprint = {
      ...BLANK_BLUEPRINT_TEMPLATE,
      id: `bp_${Date.now()}`,
      appName: 'Untitled App',
      summary: '',
      updatedAt: todayDate(),
      referenceScope: {
        targetName: '',
        referenceType: 'app',
        referenceUrl: '',
        borrowedAspects: ['Step-by-step flow', 'Page layout'],
        coreLoop: '',
        layoutPattern: '',
        differentiator: '',
      },
      environment: { ...BLANK_BLUEPRINT_TEMPLATE.environment },
      aesthetic: {
        ...BLANK_BLUEPRINT_TEMPLATE.aesthetic,
        antiPatterns: [...BLANK_BLUEPRINT_TEMPLATE.aesthetic.antiPatterns],
        aiPolishedDesignPrompt: '',
        aiColorRationale: '',
        aiLayoutGuidance: '',
      },
      dataModel: { ...BLANK_BLUEPRINT_TEMPLATE.dataModel },
      features: [
        { id: `f_${Date.now()}_1`, label: 'Primary input bar', checked: false },
        { id: `f_${Date.now()}_2`, label: 'Real-time filter controls', checked: false },
        { id: `f_${Date.now()}_3`, label: 'Summary dashboard card', checked: false },
      ],
      constraints: BLANK_BLUEPRINT_TEMPLATE.constraints.map((c) => ({ ...c })),
    };
    setActiveBlueprint(fresh);
    setActiveStage(1);
    setActiveView('builder');
    setOutputTab('blueprint');
  }

  function handleLoadFromLibrary(bp: Blueprint) {
    setActiveBlueprint(bp);
    setActiveStage(1);
    setActiveView('builder');
  }

  function handleDuplicateBlueprint(bp: Blueprint) {
    const copy: Blueprint = {
      ...bp,
      id: `bp_${Date.now()}`,
      appName: `${bp.appName || 'Untitled'} Copy`,
      updatedAt: todayDate(),
    };
    setBlueprints((prev) => [copy, ...prev]);
  }

  function handleDeleteBlueprint(id: string) {
    setBlueprints((prev) => prev.filter((bp) => bp.id !== id));
  }

  function handleToggleFeatureInPreview(id: string) {
    updateBlueprint((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f)),
    }));
  }

  function handleSelectView(view: WorkspaceView) {
    setActiveView(view);
    if (view === 'design') {
      setOutputTab('design');
    } else if (view === 'builder' && outputTab === 'design' && activeStage !== 3) {
      setOutputTab('blueprint');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-150 ease-out">
      <TopBar
        activeView={activeView}
        onSelectView={handleSelectView}
        onNewBlueprint={handleCreateNewBlueprint}
      />

      <WorkspaceToolbar
        blueprint={activeBlueprint}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onSaveToLibrary={handleSaveToLibrary}
        justSaved={justSaved}
        aiAvailable={aiAvailable}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {activeView === 'builder' && (
          <div className="space-y-5">
            {showWelcomeStrip && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-950 dark:text-white">How this works: </span>
                  1. Pick a starter idea or customize each step on the left
                  <span aria-hidden="true"> · </span>
                  2. Watch your prompt update live on the right
                  <span aria-hidden="true"> · </span>
                  3. Click Copy Prompt and paste it into Google AI Studio.
                </p>
                <button
                  type="button"
                  onClick={dismissWelcomeStrip}
                  aria-label="Dismiss quick start guide"
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer shrink-0"
                >
                  <span>Got it</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6">
                <StageWizard
                  blueprint={activeBlueprint}
                  activeStage={activeStage}
                  onSelectStage={setActiveStage}
                  onUpdateBlueprint={updateBlueprint}
                  onOpenFullAnalyzer={() => setActiveView('analyzer')}
                  onShowDesignOutput={() => setOutputTab('design')}
                />
              </div>

              <div className="lg:col-span-6 lg:sticky lg:top-6">
                <LiveBlueprintPane
                  blueprint={activeBlueprint}
                  outputTab={outputTab}
                  onSelectTab={setOutputTab}
                  onToggleFeature={handleToggleFeatureInPreview}
                />
              </div>
            </div>
          </div>
        )}

        {activeView === 'analyzer' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-display font-bold text-zinc-950 dark:text-white">
                  Inspo Finder
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Pick an everyday website, app, or game you like and turn it into a clear starter plan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('builder')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500 rounded-lg text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step-by-Step Builder</span>
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6">
              <ReferenceAnalyzer
                blueprint={activeBlueprint}
                onUpdateBlueprint={updateBlueprint}
                onNavigateToBuilder={() => {
                  setActiveStage(1);
                  setActiveView('builder');
                }}
              />
            </div>
          </div>
        )}

        {activeView === 'design' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-display font-bold text-zinc-950 dark:text-white">
                  Design Studio
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Choose colors, page layout, and spacing comfort in plain English to generate a visual design prompt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveStage(3);
                  setActiveView('builder');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500 rounded-lg text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step-by-Step Builder</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6">
                <DesignPromptStudio
                  blueprint={activeBlueprint}
                  onUpdateBlueprint={updateBlueprint}
                />
              </div>

              <div className="lg:col-span-6 lg:sticky lg:top-6">
                <LiveBlueprintPane
                  blueprint={activeBlueprint}
                  outputTab={outputTab}
                  onSelectTab={setOutputTab}
                  onToggleFeature={handleToggleFeatureInPreview}
                />
              </div>
            </div>
          </div>
        )}

        {activeView === 'library' && (
          <BlueprintLibrary
            blueprints={blueprints}
            activeBlueprintId={activeBlueprint.id}
            onLoadBlueprint={handleLoadFromLibrary}
            onDuplicateBlueprint={handleDuplicateBlueprint}
            onDeleteBlueprint={handleDeleteBlueprint}
            onCreateBlank={handleCreateNewBlueprint}
          />
        )}
      </main>
    </div>
  );
}
