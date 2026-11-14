import { BookmarkCheck, BookmarkPlus, Moon, Sun } from 'lucide-react';
import { Blueprint, ThemeMode } from '../types/blueprint';
import { getBlueprintCompletion } from '../utils/blueprintCompiler';

interface WorkspaceToolbarProps {
  blueprint: Blueprint;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSaveToLibrary: () => void;
  justSaved: boolean;
  aiAvailable: boolean | null;
}

export function WorkspaceToolbar({
  blueprint,
  theme,
  onToggleTheme,
  onSaveToLibrary,
  justSaved,
  aiAvailable,
}: WorkspaceToolbarProps) {
  const stats = getBlueprintCompletion(blueprint);

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Contextual metadata — clean unboxed text with typographic separators */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
            {blueprint.appName.trim() || 'Untitled Blueprint'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {stats.completedStages}/{stats.totalStages} stages ready
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{stats.featureCount} features</span>
          <span aria-hidden="true">·</span>
          <span>{blueprint.aesthetic.style || 'Swiss Minimalist'}</span>
          {aiAvailable !== null && (
            <>
              <span aria-hidden="true">·</span>
              <span>{aiAvailable ? 'Local + Gemini AI ready' : 'Local builder mode'}</span>
            </>
          )}
        </div>

        {/* Workspace utility controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>

          <button
            type="button"
            onClick={onSaveToLibrary}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/60 dark:hover:border-violet-500/60 rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer"
          >
            {justSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Saved to Library</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>Save Blueprint</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
