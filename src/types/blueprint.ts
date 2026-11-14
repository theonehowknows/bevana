export type ReferenceType = 'website' | 'app' | 'game';

export type WorkspaceView = 'builder' | 'analyzer' | 'design' | 'library';

export type OutputTab = 'blueprint' | 'design' | 'preview';

export type ThemeMode = 'dark' | 'light';

export interface FeatureItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ConstraintItem {
  id: string;
  label: string;
  enabled: boolean;
}

export interface ReferenceScope {
  targetName: string;
  referenceType: ReferenceType;
  referenceUrl: string;
  borrowedAspects: string[];
  coreLoop: string;
  layoutPattern: string;
  differentiator: string;
}

export interface EnvironmentConfig {
  environment: string;
  iconography: string;
  targetScreen: string;
}

export interface AestheticConfig {
  style: string;
  background: string;
  cardSurfaces: string;
  typography: string;
  accent: string;
  motion: string;
  layoutChoice?: string;
  density?: string;
  notes: string;
  antiPatterns: string[];
  aiPolishedDesignPrompt: string;
  aiColorRationale: string;
  aiLayoutGuidance: string;
}

export interface DataModelConfig {
  primaryEntities: string;
  schemaPreview: string;
  storageStrategy: string;
}

export interface Blueprint {
  id: string;
  appName: string;
  summary: string;
  updatedAt: string;
  referenceScope: ReferenceScope;
  environment: EnvironmentConfig;
  aesthetic: AestheticConfig;
  dataModel: DataModelConfig;
  features: FeatureItem[];
  constraints: ConstraintItem[];
}

export interface ReferencePreset {
  id: string;
  name: string;
  referenceType: ReferenceType;
  tagline: string;
  suggestedAppName: string;
  summary: string;
  borrowedAspects: string[];
  coreLoop: string;
  layoutPattern: string;
  differentiator: string;
  aestheticStyle: string;
  background: string;
  cardSurfaces: string;
  typography: string;
  accent: string;
  motion: string;
  primaryEntities: string;
  schemaPreview: string;
  features: string[];
}

export interface AestheticPreset {
  id: string;
  name: string;
  plainLabel: string;
  description: string;
  style: string;
  background: string;
  cardSurfaces: string;
  typography: string;
  accent: string;
  motion: string;
  swatchBg: string;
  swatchCard: string;
  swatchAccent: string;
  swatchText: string;
  antiPatterns: string[];
}

export interface StarterScenario {
  id: string;
  title: string;
  subtitle: string;
  appName: string;
  summary: string;
  referenceType: ReferenceType;
  targetName: string;
  coreLoop: string;
  layoutPattern: string;
  differentiator: string;
  primaryEntities: string;
  schemaPreview: string;
  features: string[];
}

export interface DataTemplatePreset {
  id: string;
  label: string;
  description: string;
  primaryEntities: string;
  schemaPreview: string;
}

export interface StageGuide {
  stage: number;
  shortTitle: string;
  title: string;
  whatItDoes: string;
  whyItMatters: string;
  quickTip: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AiReferenceAnalysis {
  appNameSuggestion?: string;
  summary?: string;
  coreLoop?: string;
  layoutPattern?: string;
  differentiator?: string;
  aestheticStyle?: string;
  paletteNotes?: string;
  typographyNotes?: string;
  entities?: string[];
  features?: string[];
}
