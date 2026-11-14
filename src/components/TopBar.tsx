import { WorkspaceView } from '../types/blueprint';

interface TopBarProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onNewBlueprint: () => void;
}

const NAV_ITEMS: { id: WorkspaceView; label: string }[] = [
  { id: 'builder', label: 'Builder' },
  { id: 'analyzer', label: 'Inspo Finder' },
  { id: 'design', label: 'Design Studio' },
  { id: 'library', label: 'Saved Library' },
];

export function TopBar({ activeView, onSelectView, onNewBlueprint }: TopBarProps) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('builder')}
          className="text-lg font-display font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500 rounded-sm cursor-pointer"
        >
          Vibe Blueprint
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="flex items-center gap-5 sm:gap-7 overflow-x-auto" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500 ${
                  isActive
                    ? 'text-zinc-950 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-violet-600 dark:bg-violet-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onNewBlueprint}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 rounded-lg transition-all duration-150 ease-out whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            New Blueprint
          </button>
        </div>
      </div>
    </header>
  );
}
