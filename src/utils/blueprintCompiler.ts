import { Blueprint } from '../types/blueprint';

export function compileProjectBlueprintMarkdown(blueprint: Blueprint): string {
  const name = blueprint.appName.trim() || '[App Name]';
  const lines: string[] = [];

  lines.push(`# Project Blueprint: ${name}`);
  lines.push('');

  if (blueprint.summary.trim() || blueprint.referenceScope.targetName.trim()) {
    if (blueprint.summary.trim()) {
      lines.push(`Goal: ${blueprint.summary.trim()}`);
    }
    if (blueprint.referenceScope.targetName.trim()) {
      const refTypeLabel =
        blueprint.referenceScope.referenceType === 'website'
          ? 'website'
          : blueprint.referenceScope.referenceType === 'game'
            ? 'game'
            : 'app';
      lines.push(
        `Reference Inspiration: Inspired by ${blueprint.referenceScope.targetName.trim()} (${refTypeLabel})${
          blueprint.referenceScope.borrowedAspects.length > 0
            ? ` — adapting ${blueprint.referenceScope.borrowedAspects.join(', ')}`
            : ''
        }.`,
      );
    }
    if (blueprint.referenceScope.coreLoop.trim()) {
      lines.push(`Step-by-Step User Flow: ${blueprint.referenceScope.coreLoop.trim()}`);
    }
    if (blueprint.referenceScope.layoutPattern.trim()) {
      lines.push(`Layout Direction: ${blueprint.referenceScope.layoutPattern.trim()}`);
    }
    if (blueprint.referenceScope.differentiator.trim()) {
      lines.push(`Key Simplicity Focus: ${blueprint.referenceScope.differentiator.trim()}`);
    }
    lines.push('');
  }

  lines.push('## 1. Role & Environment');
  lines.push(`- Environment: ${blueprint.environment.environment.trim() || 'Single-page React application using Tailwind CSS.'}`);
  lines.push(`- Iconography: ${blueprint.environment.iconography.trim() || 'Lucide-react (or SVG equivalents).'}`);
  lines.push(`- Target Screen: ${blueprint.environment.targetScreen.trim() || 'Mobile-first responsive desktop view.'}`);
  lines.push('');

  lines.push('## 2. Aesthetic Profile (The Vibe)');
  lines.push(`- Style: ${blueprint.aesthetic.style.trim() || 'Swiss Minimalist'}`);
  lines.push(`- Background: ${blueprint.aesthetic.background.trim() || 'bg-zinc-950'}`);
  lines.push(
    `- Card Surfaces: ${blueprint.aesthetic.cardSurfaces.trim() || 'bg-zinc-900 with border border-zinc-800 rounded-xl'}`,
  );
  lines.push(
    `- Typography: ${blueprint.aesthetic.typography.trim() || 'Clean sans-serif, high contrast text hierarchy'}`,
  );
  lines.push(`- Accent Highlights: ${blueprint.aesthetic.accent.trim() || 'Violet-500 for active states'}`);
  lines.push(
    `- Motion: ${blueprint.aesthetic.motion.trim() || 'Subtle transitions (transition-all duration-150 ease-out)'}`,
  );
  if (blueprint.aesthetic.layoutChoice?.trim()) {
    lines.push(`- Page Layout: ${blueprint.aesthetic.layoutChoice.trim()}`);
  }
  if (blueprint.aesthetic.density?.trim()) {
    lines.push(`- Spacing & Comfort: ${blueprint.aesthetic.density.trim()}`);
  }
  if (blueprint.aesthetic.notes.trim()) {
    lines.push(`- Visual Direction Notes: ${blueprint.aesthetic.notes.trim()}`);
  }
  lines.push('');

  lines.push('## 3. Data Structure & State');
  lines.push(
    `- Primary State Entities: ${blueprint.dataModel.primaryEntities.trim() || 'JSON schema for primary items'}`,
  );
  lines.push(
    `- Storage Strategy: ${blueprint.dataModel.storageStrategy.trim() || 'localStorage with safe defaults'}`,
  );
  if (blueprint.dataModel.schemaPreview.trim()) {
    lines.push('');
    lines.push('```json');
    lines.push(blueprint.dataModel.schemaPreview.trim());
    lines.push('```');
  }
  lines.push('');

  lines.push('## 4. Feature Checklist');
  if (blueprint.features.length === 0) {
    lines.push('- [ ] Primary input bar');
  } else {
    for (const feature of blueprint.features) {
      const mark = feature.checked ? 'x' : ' ';
      lines.push(`- [${mark}] ${feature.label}`);
    }
  }
  lines.push('');

  lines.push('## 5. Strict Constraints');
  const enabledConstraints = blueprint.constraints.filter((c) => c.enabled);
  if (enabledConstraints.length === 0) {
    lines.push('- Always output complete, copy-pasteable files without truncated comments.');
  } else {
    for (const constraint of enabledConstraints) {
      lines.push(`- ${constraint.label}`);
    }
  }

  return lines.join('\n');
}

export function compileDesignPrompt(blueprint: Blueprint): string {
  if (blueprint.aesthetic.aiPolishedDesignPrompt.trim()) {
    const sections = [
      `# Design Prompt: ${blueprint.appName.trim() || 'Untitled App'}`,
      '',
      blueprint.aesthetic.aiPolishedDesignPrompt.trim(),
    ];
    if (blueprint.aesthetic.antiPatterns.length > 0) {
      sections.push('');
      sections.push('## Visual Guardrails (Avoid)');
      for (const item of blueprint.aesthetic.antiPatterns) {
        sections.push(`- ${item}`);
      }
    }
    return sections.join('\n');
  }

  const name = blueprint.appName.trim() || 'this application';
  const ref = blueprint.referenceScope.targetName.trim();
  const refPart = ref
    ? `Draw structural clarity from ${ref} (${blueprint.referenceScope.referenceType}), focusing on ${
        blueprint.referenceScope.layoutPattern.trim() || 'clean spatial hierarchy and calm focus'
      }.`
    : 'Organize the interface around one dominant workspace anchor with generous whitespace and clear visual hierarchy.';

  const lines = [
    `# Visual & UX Design Prompt: ${name}`,
    '',
    `Design ${name} with a ${blueprint.aesthetic.style || 'Swiss Minimalist'} aesthetic tailored for ${
      blueprint.environment.targetScreen || 'a responsive desktop and mobile viewport'
    }.`,
    '',
    '## Surface & Color Tokens',
    `- Canvas Background: ${blueprint.aesthetic.background}`,
    `- Card & Panel Surfaces: ${blueprint.aesthetic.cardSurfaces}`,
    `- Active Accent: ${blueprint.aesthetic.accent}`,
    '- Maintain a 60-30-10 color balance: 60% calm neutral canvas, 30% subdued structural surfaces with 1px hairline borders, and 10% accent reserved strictly for primary actions and active states.',
    '',
    '## Typography & Layout Composition',
    `- Typography Pairing: ${blueprint.aesthetic.typography}`,
    blueprint.aesthetic.layoutChoice ? `- Page Layout: ${blueprint.aesthetic.layoutChoice}` : '',
    blueprint.aesthetic.density ? `- Visual Density: ${blueprint.aesthetic.density}` : '',
    `- Spatial Direction: ${refPart}`,
    `- Motion & Micro-interactions: ${blueprint.aesthetic.motion}`,
  ].filter((line, idx) => idx < 11 || line !== '');

  if (blueprint.aesthetic.notes.trim()) {
    lines.push(`- Specific Aesthetic Notes: ${blueprint.aesthetic.notes.trim()}`);
  }

  if (blueprint.aesthetic.antiPatterns.length > 0) {
    lines.push('');
    lines.push('## Visual Guardrails (Avoid)');
    for (const anti of blueprint.aesthetic.antiPatterns) {
      lines.push(`- ${anti}`);
    }
  }

  return lines.join('\n');
}

export function getStageDoneMap(blueprint: Blueprint): Record<number, boolean> {
  return {
    1: Boolean(blueprint.appName.trim() && (blueprint.summary.trim() || blueprint.referenceScope.targetName.trim())),
    2: Boolean(blueprint.environment.environment.trim() && blueprint.environment.targetScreen.trim()),
    3: Boolean(blueprint.aesthetic.style.trim() && blueprint.aesthetic.background.trim()),
    4: Boolean(blueprint.dataModel.primaryEntities.trim() && blueprint.dataModel.storageStrategy.trim()),
    5: Boolean(blueprint.features.length > 0 && blueprint.constraints.some((c) => c.enabled)),
  };
}

export function getBlueprintCompletion(blueprint: Blueprint): {
  completedStages: number;
  totalStages: number;
  featureCount: number;
  constraintCount: number;
} {
  const done = getStageDoneMap(blueprint);
  const completedStages = Object.values(done).filter(Boolean).length;

  return {
    completedStages,
    totalStages: 5,
    featureCount: blueprint.features.length,
    constraintCount: blueprint.constraints.filter((c) => c.enabled).length,
  };
}
