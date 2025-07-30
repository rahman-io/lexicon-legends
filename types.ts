import type { MapDefinition } from './maps/types';

export type ItemName = 'book' | 'hat' | 'apple';
export type VerbRuneName = 'Rune of Run' | 'Rune of Jump' | 'Rune of Climb';
export type ChromaCrystalName = 'Restored Red Crystal' | 'Restored Green Crystal' | 'Restored Blue Crystal';

export type World = 'noun_meadows' | 'verb_volcanoes' | 'adjective_isles' | 'tense_tangled_forest';
export type HubLocation = 'hub_main' | 'well_of_words' | 'endless_tower' | 'collection_screen';
export type ProceduralLocation = 'procedural_gauntlet';
export type MapLocation = World | 'map' | HubLocation | ProceduralLocation;

export type CombatType = 'article' | 'verb_tense';
export type Tense = 'past' | 'present' | 'future';

export interface ArticleChallenge {
  type: 'article';
  itemName: string; // The noun being tested
  sentence: string; // The full sentence with a blank, e.g. "This is ___ book."
  options: string[]; // e.g. ["a", "an", "the"]
  correctAnswer: string; // "a"
}

export interface VerbChallenge {
  type: 'verb_tense';
  runeName: VerbRuneName | string;
  sentence: string;
  options: string[];
  correctAnswer: string;
}

export interface CombatState {
  isActive: boolean;
  challenge: ArticleChallenge | VerbChallenge | null;
  enemyId?: string | null;
}

export interface DescriptivePuzzleState {
    isActive: boolean;
    targetObject: string;
    requiredAdjectives: string[];
    selectedAdjectives: string[];
    availableAdjectives: string[];
}

export interface TimePuzzleState {
  isActive: boolean;
  targetId: string;
  prompt: string;
  challenge: {
    subject: string;
    verbOptions: { [key in Tense]: string };
    complement: string;
    correctTense: Tense;
  } | null;
}

export interface PlayerCollection {
  outfits: string[];
  companions: string[];
  hubDecorations: string[];
  sages: string[];
}

export interface GachaItem {
    type: 'outfit' | 'companion' | 'decoration' | 'sage' | 'xp';
    name: string;
    rarity: 'Common' | 'Rare' | 'Epic';
}

export interface DailyChallengeState {
    isActive: boolean;
    challengesCompleted: number;
}

export interface EnemyState {
  id: string;
  type: 'article_imp' | 'tense_terror' | string;
  position: { x: number; y: number };
  startPos: { x: number; y: number };
  patrolRange: number;
  status: 'patrolling' | 'chasing' | 'defeated';
  direction: 'left' | 'right';
  challenge: ArticleChallenge | VerbChallenge;
  challengeTopic?: string; // For procedural generation
  // For physics/movement
  vx: number;
  vy: number;
}

export interface QuestItemState {
    id: string;
    name: ItemName | string;
    pos: { x: number, y: number };
    isCollected: boolean;
    guardianId: string;
}

export interface NounMeadowsProgress {
    status: 'not_started' | 'in_progress' | 'completed';
    enemies?: EnemyState[];
    questItems?: QuestItemState[];
    fitzDialogueState: 'initial_quest' | 'post_quest_choice' | 'quest_completed';
    isPortalSpawned: boolean;
}

export interface WorldProgress {
    status: 'not_started' | 'in_progress' | 'completed';
    // For Adjective Isles
    isColored?: boolean; 
    // For Tense-Tangled Forest
    objectStates?: { [id: string]: string }; 
}

export interface LessonExample {
    text: string;
    icon_name: string;
}

export interface LessonData {
    title: string;
    explanation: string;
    examples: LessonExample[];
    isLoading?: boolean;
}

export interface ProjectileState {
    id: string;
    pos: { x: number; y: number };
    angle: number;
}

export interface KoEffectState {
    id: string;
    pos: { x: number; y: number };
}

export type DialogueChoice = {
    text: string;
    onSelect: () => void;
};

export interface ProceduralLevelData {
    TILE_SIZE: number;
    levelNumber: number;
    theme: 'meadows' | 'volcanoes' | string;
    layout: number[][];
    playerSpawn: { x: number; y: number };
    exitPosition: { x: number; y: number; };
    npc: {
        name: 'Fitz' | 'Vera' | string;
        position: { x: number; y: number };
        quest: string;
    };
    guidingStone: {
        lessonId: string;
        position: { x: number; y: number };
    };
    questItems: QuestItemState[];
    enemies: EnemyState[];
}

export interface GameLoadingState {
  isGeneratingLevel: boolean;
  isFetchingLesson: boolean;
  isFetchingQuiz: boolean;
}


export interface GameState {
  worldProgress: {
    noun_meadows: NounMeadowsProgress;
    verb_volcanoes: WorldProgress;
    adjective_isles: WorldProgress;
    tense_tangled_forest: WorldProgress;
  }
  inventory: (ItemName | VerbRuneName | ChromaCrystalName | string)[];
  playerXP: number;
  lingoGems: number;
  wordTome: {
    nouns: string[];
    verbs: string[];
    adjectives: string[];
    tenseGuide?: {
      past: string;
      present: string;
      future: string;
    }
  };
  activeCombat: CombatState;
  activePuzzle: DescriptivePuzzleState;
  activeTimePuzzle: TimePuzzleState;
  activeLesson: string | null;
  currentLocation: MapLocation;
  unlockedWorlds: World[];
  // Player Health & Status
  playerHP: number;
  playerMaxHP: number;
  isGameOver: boolean;
  isPlayerInvincible: boolean;
  isGamePaused: boolean;
  // New Loading State
  loadingStatus: GameLoadingState;
  // Expansion 4 State
  collection: PlayerCollection;
  equippedOutfit: string;
  equippedCompanion: string;
  lastDailyChallengeDate: string; // ISO Date String: "YYYY-MM-DD"
  gachaResult: GachaItem[] | null;
  dailyChallengeState: DailyChallengeState;
  // New Combat State
  isAiming: boolean;
  aimingAngle: number;
  activeProjectiles: ProjectileState[];
  koEffects: KoEffectState[];
  // Dialogue and Progression
  dialogueChoices: DialogueChoice[] | null;
  activeProceduralLevel: ProceduralLevelData | null;
  proceduralQuest: {
      isStarted: boolean;
      isComplete: boolean;
  } | null;
  // Gauntlet Progression
  gauntletHighestLevel: number;
  currentRunLevel: number;
  gauntletCompleted: boolean;
  isApiQuotaExhausted: boolean;
}