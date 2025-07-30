
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, ItemName, VerbRuneName, ChromaCrystalName, World, MapLocation, ArticleChallenge, VerbChallenge, Tense, TimePuzzleState, GachaItem, EnemyState, WorldProgress, ProjectileState, KoEffectState, DialogueChoice, ProceduralLevelData, NounMeadowsProgress, LessonData } from './types';
import StatusBar from './components/StatusBar';
import GameScreen from './components/GameScreen';
import NPC from './components/NPC';
import DialogueBox from './components/DialogueBox';
import CombatUI from './components/CombatUI';
import WorldMap from './components/WorldMap';
import DescribableObject from './components/DescribableObject';
import PuzzleUI from './components/PuzzleUI';
import TimePuzzleUI from './components/TimePuzzleUI';
import TemporalObject from './components/TemporalObject';
import TravelersHub from './components/TravelersHub';
import WellOfWords from './components/WellOfWords';
import EndlessTower from './components/EndlessTower';
import CollectionScreen from './components/CollectionScreen';
import GameOverScreen from './components/GameOverScreen';
import ConfirmationModal from './components/ConfirmationModal';
import LessonUI from './components/LessonUI';
import { NounMeadowsMap } from './maps/NounMeadowsMap';
import type { GuidingStoneElement, PortalElement, MapDefinition } from './maps/types';
import { generateArticleQuiz, generateProceduralLevel, generateFullLesson, FALLBACK_GAUNTLET_LEVEL } from './services/geminiService';
import type { QuizData, ServiceResponse } from './services/geminiService';
import { NOUN_MEADOWS_INITIAL_PROGRESS } from './data/initialWorldStates';
import { LESSONS } from './data/lessons';


// --- CONSTANTS ---
const NOUN_ITEMS: ItemName[] = ['book', 'hat', 'apple'];
const VERB_RUNES: VerbRuneName[] = ['Rune of Run', 'Rune of Jump', 'Rune of Climb'];
const CHROMA_CRYSTALS: ChromaCrystalName[] = ['Restored Red Crystal', 'Restored Green Crystal', 'Restored Blue Crystal'];
const DAILY_CHALLENGES_PER_DAY = 3;
const GACHA_COST_SINGLE = 10;
const GACHA_COST_MULTI = 100;
const PLAYER_MAX_HP = 3;
const INVINCIBILITY_DURATION = 1500; // in ms
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 48;
const MAX_GAUNTLET_LEVEL = 10;


const VERB_CHALLENGES: Record<VerbRuneName, Omit<VerbChallenge, 'type' | 'runeName'>> = {
  'Rune of Run': { sentence: 'He ___ away from the lava.', options: ['run', 'runs'], correctAnswer: 'runs' },
  'Rune of Jump': { sentence: 'She ___ over the crack.', options: ['jump', 'jumps'], correctAnswer: 'jumps' },
  'Rune of Climb': { sentence: 'It ___ the rock wall.', options: ['climb', 'climbs'], correctAnswer: 'climbs' },
};

type PuzzleDefinition = {
  id: ChromaCrystalName;
  targetObject: string;
  icon: string;
  requiredAdjectives: string[];
  availableAdjectives: string[];
  position: string;
};

const ADJECTIVE_PUZZLES: PuzzleDefinition[] = [
    { id: 'Restored Red Crystal', targetObject: 'flower', icon: '🌸', requiredAdjectives: ['red', 'small'], availableAdjectives: ['red', 'blue', 'big', 'small', 'shiny', 'tall'], position: "top-1/4 right-1/4" },
    { id: 'Restored Green Crystal', targetObject: 'tree', icon: '🌳', requiredAdjectives: ['tall', 'green'], availableAdjectives: ['short', 'wide', 'tall', 'green', 'leafy', 'bare'], position: "bottom-1/4 left-1/3" },
    { id: 'Restored Blue Crystal', targetObject: 'rock', icon: '💎', requiredAdjectives: ['big', 'blue'], availableAdjectives: ['small', 'blue', 'orange', 'pointy', 'big', 'smooth'], position: "bottom-1/2 right-1/4" },
];

type TimePuzzleDefinition = {
  id: string;
  initialState: string;
  solvedState: string;
  position: string;
  prompt: string;
  challenge: NonNullable<TimePuzzleState['challenge']>;
};

const TIME_PUZZLES: TimePuzzleDefinition[] = [
  { id: 'bridge-01', initialState: 'broken', solvedState: 'whole', position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', prompt: "The bridge looks like it was whole long ago.", challenge: { subject: "The bridge", verbOptions: { past: 'was', present: 'is', future: 'will be' }, complement: "strong.", correctTense: 'past' } },
  { id: 'plant-01', initialState: 'seed', solvedState: 'grown', position: 'bottom-1/4 left-1/4', prompt: "This seed holds great potential. It needs a glimpse of its destiny.", challenge: { subject: "This seed", verbOptions: { past: 'grew', present: 'grows', future: 'will grow' }, complement: "a great tree.", correctTense: 'future' } },
  { id: 'crystal-01', initialState: 'phasing', solvedState: 'stable', position: 'top-1/4 right-1/4', prompt: "To stabilize the crystal, you must ground it in the here and now.", challenge: { subject: "The crystal", verbOptions: { past: 'was', present: 'is', future: 'will be' }, complement: "stable.", correctTense: 'present' } }
];

const INITIAL_WORLD_STATES = TIME_PUZZLES.reduce((acc, puzzle) => {
    acc[puzzle.id] = puzzle.initialState;
    return acc;
}, {} as { [id: string]: string });


export const ICONS: Record<ItemName | VerbRuneName | string, string> = {
  apple: '🍎', book: '📖', hat: '🎩',
  'Rune of Run': '🔥', 'Rune of Jump': '⚡', 'Rune of Climb': '🧗',
};

const LOOT_TABLE: { [key in GachaItem['rarity']]: Omit<GachaItem, 'rarity'>[] } = {
    Common: [{ type: 'xp', name: '+50 XP' }],
    Rare: [
        { type: 'decoration', name: 'Glowing Lantern' },
        { type: 'decoration', name: 'Stone Bench' },
        { type: 'companion', name: 'Book Owl' },
    ],
    Epic: [
        { type: 'outfit', name: 'Scholar Robe' },
        { type: 'sage', name: 'Sage of Synonyms' },
        { type: 'companion', name: 'Grammar Gremlin' },
    ]
};

const DUMMY_MAP: MapDefinition = {
  TILE_SIZE: 48,
  layout: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  interactives: [],
  playerStart: { x: 10, y: 7 },
  enemies: [],
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const defaultState: GameState = {
        worldProgress: {
            noun_meadows: JSON.parse(JSON.stringify(NOUN_MEADOWS_INITIAL_PROGRESS)),
            verb_volcanoes: { status: 'not_started' },
            adjective_isles: { status: 'not_started', isColored: false },
            tense_tangled_forest: { status: 'not_started', objectStates: INITIAL_WORLD_STATES },
        },
        inventory: [], playerXP: 0, lingoGems: 100,
        wordTome: { nouns: [], verbs: [], adjectives: [] },
        activeCombat: { isActive: false, challenge: null, enemyId: null },
        activePuzzle: { isActive: false, targetObject: '', requiredAdjectives: [], selectedAdjectives: [], availableAdjectives: [] },
        activeTimePuzzle: { isActive: false, targetId: '', prompt: '', challenge: null },
        activeLesson: null,
        currentLocation: 'hub_main',
        unlockedWorlds: ['noun_meadows'],
        playerHP: PLAYER_MAX_HP, playerMaxHP: PLAYER_MAX_HP,
        isGameOver: false, isPlayerInvincible: false, isGamePaused: false,
        loadingStatus: { isGeneratingLevel: false, isFetchingLesson: false, isFetchingQuiz: false },
        collection: { outfits: ['Default Traveler'], companions: ['None'], hubDecorations: [], sages: [] },
        equippedOutfit: 'Default Traveler', equippedCompanion: 'None',
        lastDailyChallengeDate: '',
        gachaResult: null,
        dailyChallengeState: { isActive: false, challengesCompleted: 0 },
        // New combat state
        isAiming: false,
        aimingAngle: 0,
        activeProjectiles: [],
        koEffects: [],
        // Progression
        dialogueChoices: null,
        activeProceduralLevel: null,
        proceduralQuest: null,
        // Gauntlet Progression
        gauntletHighestLevel: 1,
        currentRunLevel: 1,
        gauntletCompleted: false,
        isApiQuotaExhausted: false,
    };

    const savedStateRaw = localStorage.getItem('lexiconLegendsSave');
    if (savedStateRaw) {
        const savedState = JSON.parse(savedStateRaw);
        // A simple merge, old saves will have both old and new properties until they are re-saved.
        const mergedState = { ...defaultState, ...savedState };

        // If the saved state is old, it won't have worldProgress, so we seed it.
        if (!savedState.worldProgress) {
            mergedState.worldProgress = defaultState.worldProgress;
        } else {
            // Ensure all world progress keys exist
            mergedState.worldProgress = { ...defaultState.worldProgress, ...savedState.worldProgress };
             // Backwards compatibility for old saves
            if (!savedState.worldProgress.noun_meadows?.enemies) {
                mergedState.worldProgress.noun_meadows = JSON.parse(JSON.stringify(NOUN_MEADOWS_INITIAL_PROGRESS));
            }
            if (!savedState.worldProgress.noun_meadows?.fitzDialogueState) {
                mergedState.worldProgress.noun_meadows.fitzDialogueState = 'initial_quest';
                mergedState.worldProgress.noun_meadows.isPortalSpawned = false;
            }
        }
        
        if (!savedState.loadingStatus) {
            mergedState.loadingStatus = defaultState.loadingStatus;
        }

        // Reset transient state
        mergedState.isGameOver = false;
        mergedState.isGamePaused = false;
        mergedState.isPlayerInvincible = false;
        mergedState.activeCombat = { isActive: false, challenge: null, enemyId: null };
        mergedState.activeLesson = null;
        mergedState.isAiming = false;
        mergedState.activeProjectiles = [];
        mergedState.koEffects = [];
        mergedState.dialogueChoices = null;
        mergedState.activeProceduralLevel = null;
        mergedState.proceduralQuest = null;


        return mergedState;
    }
    
    return defaultState;
  });

  const [dialogue, setDialogue] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; detail: string; onConfirm: () => void; } | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const lessonAbortController = useRef<AbortController | null>(null);

  
  // Save game state to localStorage on change
  useEffect(() => {
    localStorage.setItem('lexiconLegendsSave', JSON.stringify(gameState));
  }, [gameState]);


  // --- QUEST COMPLETION LOGIC ---
  useEffect(() => {
    const allNounsCollected = NOUN_ITEMS.every(item => gameState.inventory.includes(item));
    const meadowsProgress = gameState.worldProgress.noun_meadows;
    if (allNounsCollected && meadowsProgress.status === 'in_progress') {
      setGameState(prev => {
        const newMeadowsProgress: NounMeadowsProgress = { ...prev.worldProgress.noun_meadows, status: 'completed', fitzDialogueState: 'post_quest_choice' };
        const newProgress = { ...prev.worldProgress, noun_meadows: newMeadowsProgress };
        return { ...prev, worldProgress: newProgress, playerXP: prev.playerXP + 100, lingoGems: prev.lingoGems + 10 };
      });
      setDialogue("You found them all! A true hero! Please, speak with me again when you are ready for your next trial.");
    }
  }, [gameState.inventory, gameState.worldProgress.noun_meadows]);

  // Procedural quest completion logic
    useEffect(() => {
        const { activeProceduralLevel, proceduralQuest } = gameState;
        if (activeProceduralLevel && proceduralQuest?.isStarted && !proceduralQuest.isComplete) {
            const allItemsCollected = activeProceduralLevel.questItems.every(item => item.isCollected);
            if (allItemsCollected) {
                setGameState(prev => ({
                    ...prev,
                    proceduralQuest: { ...prev.proceduralQuest!, isComplete: true },
                    playerXP: prev.playerXP + (activeProceduralLevel.levelNumber * 50),
                    lingoGems: prev.lingoGems + (activeProceduralLevel.levelNumber * 5)
                }));
                setDialogue("You've found everything! Incredible work. The portal out of this area is now open... or you can return to the Hub from the map.");
            }
        }
    }, [gameState.activeProceduralLevel, gameState.proceduralQuest]);


  useEffect(() => {
    const allVerbsCollected = VERB_RUNES.every(item => gameState.inventory.includes(item));
     if (allVerbsCollected && gameState.worldProgress.verb_volcanoes.status !== 'completed') {
        setGameState(prev => {
            const newProgress = { ...prev.worldProgress, verb_volcanoes: { ...prev.worldProgress.verb_volcanoes, status: 'completed' as const } };
            return { ...prev, worldProgress: newProgress, playerXP: prev.playerXP + 250, lingoGems: prev.lingoGems + 20, unlockedWorlds: [...new Set([...prev.unlockedWorlds, 'adjective_isles'])] as World[] };
        });
        setDialogue("Amazing! You did it! The Golem lives! A mysterious, colorful archipelago has appeared on your map! The Adjective Isles await your discovery.");
     }
  }, [gameState.inventory, gameState.worldProgress.verb_volcanoes.status]);

  useEffect(() => {
    const allCrystalsCollected = CHROMA_CRYSTALS.every(item => gameState.inventory.includes(item));
    if (allCrystalsCollected && gameState.worldProgress.adjective_isles.status !== 'completed') {
        setGameState(prev => {
            const newProgress = { ...prev.worldProgress, adjective_isles: { ...prev.worldProgress.adjective_isles, status: 'completed' as const, isColored: true } };
            return { ...prev, worldProgress: newProgress, playerXP: prev.playerXP + 400, lingoGems: prev.lingoGems + 30, unlockedWorlds: [...new Set([...prev.unlockedWorlds, 'tense_tangled_forest'])] as World[] };
        });
        setDialogue("Incredible! You've brought color back to my world! You feel a strange pull towards the ancient woods. A path veiled in mist has now appeared on your map: The Tense-Tangled Forest.");
    }
  }, [gameState.inventory, gameState.worldProgress.adjective_isles.status]);

  useEffect(() => {
    const allPuzzlesSolved = TIME_PUZZLES.every(p => gameState.worldProgress.tense_tangled_forest.objectStates?.[p.id] === p.solvedState);
    if (allPuzzlesSolved && gameState.worldProgress.tense_tangled_forest.status !== 'completed') {
        setGameState(prev => {
            const newWorldProgress = { ...prev.worldProgress, tense_tangled_forest: { ...prev.worldProgress.tense_tangled_forest, status: 'completed' as const } };
            return { ...prev, worldProgress: newWorldProgress, playerXP: prev.playerXP + 600, lingoGems: prev.lingoGems + 50, wordTome: { ...prev.wordTome, tenseGuide: { past: `'The bridge was strong.' - Past tense describes things that have already happened.`, present: `'The crystal is stable.' - Present tense describes things happening now.`, future: `'This seed will grow a great tree.' - Future tense describes things that are yet to happen.` } } };
        });
        setDialogue("Balance... is returning. You have a gift for language... and time. Thank you. The mist in the forest has cleared.");
    }
  }, [gameState.worldProgress.tense_tangled_forest.objectStates, gameState.worldProgress.tense_tangled_forest.status]);

  useEffect(() => {
    if (gameState.playerHP <= 0 && !gameState.isGameOver) {
      setGameState(prev => ({ ...prev, isGameOver: true, isGamePaused: true }));
    }
  }, [gameState.playerHP, gameState.isGameOver]);


  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const loadProceduralLevel = useCallback(async (levelNumber: number) => {
    setDialogue(`Entering Gauntlet Level ${levelNumber}...`);
    setGameState(prev => ({ 
        ...prev, 
        loadingStatus: { ...prev.loadingStatus, isGeneratingLevel: true }, 
        currentLocation: 'procedural_gauntlet' 
    }));

    if (gameState.isApiQuotaExhausted) {
        console.log("Quota exhausted, loading fallback procedural level.");
        const fallbackLevel = JSON.parse(JSON.stringify(FALLBACK_GAUNTLET_LEVEL));
        setGameState(prev => {
            const isNewHighest = levelNumber > prev.gauntletHighestLevel;
             if (isNewHighest) {
                // This won't work inside setGameState, but we set dialogue outside
             }
            return {
                ...prev,
                playerHP: prev.playerMaxHP,
                activeProceduralLevel: { ...fallbackLevel, levelNumber },
                currentRunLevel: levelNumber,
                gauntletHighestLevel: isNewHighest ? levelNumber : prev.gauntletHighestLevel,
                loadingStatus: { ...prev.loadingStatus, isGeneratingLevel: false },
                isGamePaused: false,
                proceduralQuest: { isStarted: false, isComplete: false },
            };
        });
        if (levelNumber > gameState.gauntletHighestLevel) {
            setDialogue(`Checkpoint Saved! You've reached Level ${levelNumber}!`);
        }
        return;
    }

    const response = await generateProceduralLevel(levelNumber);
    
    if (response.errorType === 'QUOTA_EXHAUSTED' && !gameState.isApiQuotaExhausted) {
        setDialogue("The well of magic has run dry for today! Standard challenges will be used until tomorrow.");
    } else if (response.errorType === 'NETWORK_ERROR') {
        console.error("An unexpected error occurred during level generation, using fallback.");
    }
    
    const newLevelData = response.data;
    const isNewHighest = levelNumber > gameState.gauntletHighestLevel;

    if (isNewHighest && response.errorType !== 'QUOTA_EXHAUSTED') {
         setDialogue(`Checkpoint Saved! You've reached Level ${levelNumber}!`);
    }

    setGameState(prev => ({
        ...prev,
        playerHP: prev.playerMaxHP,
        activeProceduralLevel: newLevelData,
        currentRunLevel: levelNumber,
        gauntletHighestLevel: isNewHighest ? levelNumber : prev.gauntletHighestLevel,
        loadingStatus: { ...prev.loadingStatus, isGeneratingLevel: false },
        isGamePaused: false,
        proceduralQuest: { isStarted: false, isComplete: false },
        isApiQuotaExhausted: prev.isApiQuotaExhausted || response.errorType === 'QUOTA_EXHAUSTED',
    }));

  }, [gameState.isApiQuotaExhausted, gameState.gauntletHighestLevel]);

  const handleEnterPortal = useCallback(() => {
    if (gameState.gauntletCompleted) {
        setDialogue("You have already conquered the Gauntlet! What would you like to do?");
        setGameState(p => ({
            ...p,
            dialogueChoices: [
                {
                    text: "Start New Gauntlet",
                    onSelect: () => {
                        setDialogue("A new challenge begins! The Gauntlet resets...");
                        setGameState(ps => ({
                            ...ps,
                            gauntletHighestLevel: 1,
                            currentRunLevel: 1,
                            gauntletCompleted: false,
                            dialogueChoices: null,
                        }));
                        loadProceduralLevel(1);
                    }
                },
                {
                    text: "Enter at Checkpoint",
                    onSelect: () => {
                        setDialogue(`Returning to your highest level: ${p.gauntletHighestLevel}`);
                        setGameState(ps => ({ ...ps, dialogueChoices: null }));
                        loadProceduralLevel(p.gauntletHighestLevel);
                    }
                }
            ]
        }));
    } else {
        setDialogue("The portal hums with power... You are being transported!");
        loadProceduralLevel(gameState.gauntletHighestLevel);
    }
  }, [gameState.gauntletHighestLevel, gameState.gauntletCompleted, loadProceduralLevel]);
  
  const handleAdvanceGauntletLevel = useCallback(() => {
      const { currentRunLevel } = gameState;
      const nextLevel = currentRunLevel + 1;

      if (nextLevel > MAX_GAUNTLET_LEVEL) {
          setGameState(prev => ({
              ...prev,
              gauntletCompleted: true,
              currentLocation: 'hub_main',
              activeProceduralLevel: null,
              proceduralQuest: null,
          }));
          setDialogue("Victory! You have conquered the Gauntlet of Grammar! You are a true Lexicon Legend.");
      } else {
          loadProceduralLevel(nextLevel);
      }
  }, [gameState.currentRunLevel, loadProceduralLevel]);

  const handleCloseLesson = useCallback(() => {
    lessonAbortController.current?.abort();
    setGameState(prev => ({
        ...prev,
        activeLesson: null,
        isGamePaused: false,
        loadingStatus: { ...prev.loadingStatus, isFetchingLesson: false }
    }));
    setLessonData(null);
  }, []);

  const fetchLessonData = useCallback(async (lessonId: string, isRefresh: boolean) => {
      lessonAbortController.current?.abort();
      const controller = new AbortController();
      lessonAbortController.current = controller;

      setGameState(prev => ({ ...prev, loadingStatus: { ...prev.loadingStatus, isFetchingLesson: true } }));
      if (!isRefresh) {
          setGameState(prev => ({ ...prev, activeLesson: lessonId, isGamePaused: true }));
          setLessonData(null);
      }
      
      const loadFallbackLesson = () => {
          setLessonData(LESSONS[lessonId] || null);
          setGameState(prev => ({ ...prev, loadingStatus: { ...prev.loadingStatus, isFetchingLesson: false } }));
      };

      if (gameState.isApiQuotaExhausted) {
          console.log("Quota is exhausted, loading fallback lesson.");
          loadFallbackLesson();
          return;
      }
      
      // The AbortError logic with Promise.race is complex with the new service response pattern.
      // For now, we simplify and don't race the abort signal. The abort controller is used to cancel pending fetches.
      if (controller.signal.aborted) {
          console.log('Request cancelled before fetch.');
          return;
      }

      const response = await generateFullLesson(lessonId);
      
      if (controller.signal.aborted) {
          console.log('Request cancelled during fetch.');
          return;
      }

      setLessonData(response.data);

      if (response.errorType === 'QUOTA_EXHAUSTED' && !gameState.isApiQuotaExhausted) {
          setDialogue("The well of wisdom has run dry for today! Standard lessons will be used until tomorrow.");
          setGameState(prev => ({...prev, isApiQuotaExhausted: true}));
      } else if (response.errorType === 'NETWORK_ERROR') {
          console.error("Failed to fetch lesson, using fallback:", response.data);
      }

      setGameState(prev => ({ ...prev, loadingStatus: { ...prev.loadingStatus, isFetchingLesson: false } }));
      
  }, [gameState.isApiQuotaExhausted, handleCloseLesson]);


  // --- HANDLERS ---
  const handleNpcClick = useCallback((name: string) => {
    const { currentLocation, activeProceduralLevel, proceduralQuest, worldProgress } = gameState;
    
    if (currentLocation === 'procedural_gauntlet' && activeProceduralLevel && proceduralQuest) {
        const npc = activeProceduralLevel.npc;
        if (name === npc.name) {
            if (proceduralQuest.isComplete) {
                setDialogue("You're a true legend! Step through the portal to face your next challenge.");
            } else if (proceduralQuest.isStarted) {
                const itemsLeft = activeProceduralLevel.questItems.filter(i => !i.isCollected).length;
                setDialogue(`You still need to find ${itemsLeft} item(s). Good luck!`);
            } else { // Quest not started
                setDialogue(npc.quest);
                setGameState(prev => ({ ...prev, proceduralQuest: { ...prev.proceduralQuest!, isStarted: true }}));
            }
        }
        return;
    }
    
    // --- Static World NPC Logic ---
    if (name === 'Fitz') {
        const meadowsProgress = worldProgress.noun_meadows;
        switch (meadowsProgress.fitzDialogueState) {
            case 'initial_quest':
                if (meadowsProgress.status === 'not_started') {
                    setGameState(prev => { 
                        const newMeadowsProgress: NounMeadowsProgress = { ...prev.worldProgress.noun_meadows, status: 'in_progress' };
                        const newProgress = { ...prev.worldProgress, noun_meadows: newMeadowsProgress }; 
                        return { ...prev, worldProgress: newProgress }; 
                    });
                    setDialogue("Oh, Traveler, thank goodness! Pesky Article Imps have stolen my favorite things. Please, retrieve my book, hat, and apple for me!");
                } else {
                    setDialogue("Please hurry! Find my book, hat, and apple. You'll have to defeat their guardians first!");
                }
                break;
            case 'post_quest_choice':
                setDialogue("Your skill is undeniable. You are ready to face a greater challenge. Will you step into the Gauntlet of Grammar?");
                setGameState(prev => ({
                    ...prev,
                    dialogueChoices: [
                        { text: "Yes, I am ready!", onSelect: () => {
                            setDialogue("Excellent! I have opened a gateway for you. It will not last forever. Find the portal and prove your mastery!");
                            setGameState(p => {
                                const newMeadows: NounMeadowsProgress = { ...p.worldProgress.noun_meadows, fitzDialogueState: 'quest_completed', isPortalSpawned: true };
                                const newProgress = { ...p.worldProgress, noun_meadows: newMeadows };
                                return { ...p, dialogueChoices: null, worldProgress: newProgress };
                            });
                        }},
                        { text: "No, I need more time.", onSelect: () => {
                            setDialogue("Of course. There is no rush. Prepare yourself and speak to me again when you are ready.");
                            setGameState(p => ({ ...p, dialogueChoices: null }));
                        }}
                    ]
                }));
                break;
            case 'quest_completed':
                setDialogue("The portal awaits your challenge, Traveler. Show them what a Lexicon Legend you've become!");
                break;
        }
    } else if (name === 'Vera') {
        const status = worldProgress.verb_volcanoes.status;
        if (status === 'not_started') { setGameState(prev => { const newProgress = { ...prev.worldProgress, verb_volcanoes: { ...prev.worldProgress.verb_volcanoes, status: 'in_progress' as const } }; return { ...prev, worldProgress: newProgress }; }); setDialogue("Traveler! The Great Golem is dormant! We need to reactivate its core. Please find the three Action Runes. Watch out for the Tense Terrors that guard them!"); }
        else if (status === 'completed') { setDialogue("The Golem's power flows thanks to you!"); }
        else { setDialogue("Find the Action Runes to awaken the Golem!"); }
    } else if (name === 'Arturo') {
        const status = worldProgress.adjective_isles.status;
        if (status === 'not_started') { setGameState(prev => { const newProgress = { ...prev.worldProgress, adjective_isles: { ...prev.worldProgress.adjective_isles, status: 'in_progress' as const } }; return { ...prev, worldProgress: newProgress }; }); setDialogue("Traveler! The world... it's so dull! The Chroma Crystals that give this archipelago its color have gone dim. Please, help me restore them by correctly describing the world around you."); }
        else if (status === 'completed') { setDialogue("My art has never been so vibrant, thank you!"); }
        else { setDialogue("Bring color back to my canvas by solving the descriptive puzzles!"); }
    } else if (name === 'Chronos') {
        const status = worldProgress.tense_tangled_forest.status;
        if (status === 'not_started') { setGameState(prev => { const newProgress = { ...prev.worldProgress, tense_tangled_forest: { ...prev.worldProgress.tense_tangled_forest, status: 'in_progress' as const } }; return { ...prev, worldProgress: newProgress }; }); setDialogue("Traveler... time... it is broken here. The three great Time Anchors are unstable. You must... speak to the world as it was, as it is, and as it will be... to restore balance."); }
        else if (status === 'completed') { setDialogue("The forest's timeline is whole once more, thanks to you."); }
        else { setDialogue("The Time Anchors are still unstable. The past, present, and future are tangled."); }
    }
  }, [gameState]);
  
  const handleInteraction = useCallback((interactiveId: string, type: string) => {
    const { currentLocation, activeProceduralLevel, proceduralQuest } = gameState;

    if (currentLocation === 'procedural_gauntlet') {
        if (interactiveId === 'gauntlet_exit_portal') {
            handleAdvanceGauntletLevel();
            return;
        }
        if (type === 'npc' && activeProceduralLevel && proceduralQuest) {
            handleNpcClick(interactiveId);
            return;
        }
        if (type === 'guiding_stone') {
             fetchLessonData(interactiveId, false);
             return;
        }
        if (type === 'quest_item' && activeProceduralLevel && proceduralQuest) {
            if (!proceduralQuest.isStarted) {
                setDialogue("You should probably talk to the person standing over there first.");
                return;
            }
             setGameState(prev => {
                const newLevel = { ...prev.activeProceduralLevel! };
                const itemState = newLevel.questItems.find(i => i.id === interactiveId);
                if (!itemState || itemState.isCollected) return prev;

                const guardian = newLevel.enemies.find(e => e.id === itemState.guardianId);
                if (guardian?.status === 'defeated') {
                    setDialogue(`You collected the ${itemState.name}!`);
                    const newQuestItems = newLevel.questItems.map(i => i.id === interactiveId ? { ...i, isCollected: true } : i);
                    newLevel.questItems = newQuestItems;

                    return {
                        ...prev,
                        inventory: [...new Set([...prev.inventory, itemState.name])],
                        wordTome: { ...prev.wordTome, nouns: prev.wordTome.nouns.includes(itemState.name as ItemName) ? prev.wordTome.nouns : [...prev.wordTome.nouns, itemState.name] },
                        activeProceduralLevel: newLevel,
                    };
                } else {
                    setDialogue(`You can't take this yet! A ${guardian?.type || 'monster'} is guarding it.`);
                    return prev;
                }
            });
        }
        return;
    }

    // --- Static World Interaction Logic ---
    if (interactiveId === 'portal_gate') {
        handleEnterPortal();
        return;
    }

    const mapInteractive = NounMeadowsMap.interactives.find(i => i.id === interactiveId);
    if (mapInteractive) {
        switch (mapInteractive.type) {
            case 'npc':
                handleNpcClick(mapInteractive.id as 'Fitz');
                return;
            case 'guiding_stone':
                const stone = mapInteractive as GuidingStoneElement;
                fetchLessonData(stone.lessonId, false);
                return;
        }
    }

    // If not a static interactive, it must be a dynamic one (QuestItem)
    setGameState(prev => {
        const meadowsProgress = prev.worldProgress.noun_meadows;
        const itemState = meadowsProgress.questItems?.find(i => i.id === interactiveId);

        if (!itemState || itemState.isCollected) {
            return prev; // No change
        }

        const guardian = meadowsProgress.enemies?.find(e => e.id === itemState.guardianId);

        if (guardian?.status === 'defeated') {
            setDialogue(`You collected the ${itemState.name}!`);
            const newQuestItems = meadowsProgress.questItems?.map(i => i.id === interactiveId ? { ...i, isCollected: true } : i);
            const newMeadowsProgress = { ...meadowsProgress, questItems: newQuestItems };

            return {
                ...prev,
                inventory: [...new Set([...prev.inventory, itemState.name])],
                wordTome: { ...prev.wordTome, nouns: prev.wordTome.nouns.includes(itemState.name as ItemName) ? prev.wordTome.nouns : [...prev.wordTome.nouns, itemState.name] },
                worldProgress: { ...prev.worldProgress, noun_meadows: newMeadowsProgress },
            };
        } else {
            setDialogue("You can't take this yet! A pesky Article Imp is guarding it.");
            return prev; // No change
        }
    });
  }, [gameState, handleNpcClick, handleEnterPortal, fetchLessonData, handleAdvanceGauntletLevel]);

  const handleCombatStart = useCallback(async (enemy: EnemyState) => {
    if (gameState.activeCombat.isActive || gameState.isAiming) return;
    
    // Allow combat in procedural levels if the quest is started
    if (gameState.currentLocation === 'procedural_gauntlet') {
        if (!gameState.proceduralQuest?.isStarted) {
             setDialogue("This creature seems passive. Maybe you should talk to the local first.");
             return;
        }
    } else if (gameState.worldProgress.noun_meadows.status !== 'in_progress') {
        // Original logic for Noun Meadows
        setDialogue("Talk to Old Man Fitz to start the quest!");
        return;
    }

    setGameState(prev => ({
        ...prev,
        loadingStatus: { ...prev.loadingStatus, isFetchingQuiz: true },
        activeCombat: {
            isActive: true,
            challenge: null,
            enemyId: enemy.id
        }
    }));
    
    const itemName = (enemy.challenge as ArticleChallenge).itemName;
    let quizData: QuizData;

    if (gameState.isApiQuotaExhausted) {
        console.log("Quota exhausted, using fallback quiz.");
        const fallbackQuiz = {
            sentence: `This is ___ ${itemName}.`,
            correctAnswer: ['a', 'e', 'i', 'o', 'u'].includes(itemName[0].toLowerCase()) ? 'an' : 'a',
            options: ["a", "an"]
        };
        quizData = fallbackQuiz;
    } else {
        const response = await generateArticleQuiz(itemName);
        quizData = response.data;

        if (response.errorType === 'QUOTA_EXHAUSTED' && !gameState.isApiQuotaExhausted) {
            setDialogue("The well of wit has run dry for today! Standard questions will be used until tomorrow.");
            setGameState(prev => ({ ...prev, isApiQuotaExhausted: true }));
        } else if (response.errorType === 'NETWORK_ERROR') {
             console.error("Unexpected error fetching quiz, using fallback.");
        }
    }
    
    const finalChallenge: ArticleChallenge = {
        type: 'article',
        itemName: itemName,
        sentence: quizData.sentence,
        options: quizData.options,
        correctAnswer: quizData.correctAnswer,
    };

    setGameState(prev => ({
        ...prev,
        loadingStatus: { ...prev.loadingStatus, isFetchingQuiz: false },
        activeCombat: {
            ...prev.activeCombat,
            challenge: finalChallenge,
        }
    }));
  }, [gameState.worldProgress.noun_meadows.status, gameState.activeCombat.isActive, gameState.isAiming, gameState.currentLocation, gameState.proceduralQuest, gameState.isApiQuotaExhausted]);


  const handlePlayerDamage = useCallback(() => {
    if (gameState.isPlayerInvincible) return;
    setGameState(prev => ({
        ...prev,
        playerHP: prev.playerHP - 1,
        isPlayerInvincible: true,
    }));
    setTimeout(() => {
        setGameState(prev => ({...prev, isPlayerInvincible: false }));
    }, INVINCIBILITY_DURATION);
  }, [gameState.isPlayerInvincible]);

  const handleRetry = useCallback(() => {
    if (gameState.currentLocation === 'procedural_gauntlet') {
        const checkpointLevel = gameState.gauntletHighestLevel;
        setDialogue(`Defeated! Returning to your checkpoint: Level ${checkpointLevel}.`);
        setGameState(prev => ({
            ...prev,
            isGameOver: false,
            playerHP: prev.playerMaxHP,
            isAiming: false,
            activeProjectiles: [],
            koEffects: [],
        }));
        loadProceduralLevel(checkpointLevel);
    } else {
        // Fallback for non-gauntlet areas (e.g., reset Noun Meadows)
        setGameState(prev => {
            const newMeadowsProgress = JSON.parse(JSON.stringify(NOUN_MEADOWS_INITIAL_PROGRESS));
            const inventoryWithoutQuestItems = prev.inventory.filter(item => !NOUN_ITEMS.some(questItem => questItem === item));
            
            return {
                ...prev,
                isGameOver: false,
                isGamePaused: false,
                playerHP: prev.playerMaxHP,
                isAiming: false,
                activeProjectiles: [],
                koEffects: [],
                dialogueChoices: null,
                activeCombat: { isActive: false, challenge: null, enemyId: null },
                worldProgress: {
                    ...prev.worldProgress,
                    noun_meadows: newMeadowsProgress,
                },
                inventory: inventoryWithoutQuestItems,
                currentLocation: 'noun_meadows',
            };
        });
        setDialogue("You've been defeated, but don't give up! The Noun Meadows have been reset.");
    }
  }, [gameState.currentLocation, gameState.gauntletHighestLevel, loadProceduralLevel]);
  
    const handleTravel = (location: MapLocation) => {
        setDialogue(null);
        setGameState(prev => ({ ...prev, currentLocation: location, dialogueChoices: null, isGamePaused: false }));
    };

    const handleResetWorld = (world: World) => {
        setConfirmation({
            message: `Reset ${world}?`,
            detail: "All of your progress in this world will be permanently lost, but you will keep any items earned. This cannot be undone.",
            onConfirm: () => {
                setGameState(prev => {
                    const newProgress = { ...prev.worldProgress };
                    if (world === 'noun_meadows') {
                        newProgress.noun_meadows = JSON.parse(JSON.stringify(NOUN_MEADOWS_INITIAL_PROGRESS));
                    }
                    // TODO: Add other worlds if they become resettable
                    return { ...prev, worldProgress: newProgress };
                });
                setConfirmation(null);
                handleTravel(world); // Travel to the newly reset world
            }
        });
    };

    const handleGachaDraw = (amount: 1 | 10) => {
        const cost = amount === 1 ? GACHA_COST_SINGLE : GACHA_COST_MULTI;
        if (gameState.lingoGems < cost) {
            setDialogue("You don't have enough Lingo Gems for that.");
            return;
        }

        const results: GachaItem[] = [];
        for (let i = 0; i < amount; i++) {
            const rarityRoll = Math.random() * 100;
            let rarity: GachaItem['rarity'];
            if (rarityRoll < 5) rarity = 'Epic'; // 5% chance
            else if (rarityRoll < 30) rarity = 'Rare'; // 25% chance
            else rarity = 'Common'; // 70% chance

            const items = LOOT_TABLE[rarity];
            const item = items[Math.floor(Math.random() * items.length)];
            results.push({ ...item, rarity });
        }

        setGameState(prev => {
            const newState = { ...prev, lingoGems: prev.lingoGems - cost, gachaResult: results };
            results.forEach(item => {
                switch (item.type) {
                    case 'xp':
                        newState.playerXP += 50;
                        break;
                    case 'outfit':
                        if (!newState.collection.outfits.includes(item.name)) {
                            newState.collection.outfits.push(item.name);
                        }
                        break;
                    case 'companion':
                        if (!newState.collection.companions.includes(item.name)) {
                            newState.collection.companions.push(item.name);
                        }
                        break;
                    case 'decoration':
                        if (!newState.collection.hubDecorations.includes(item.name)) {
                            newState.collection.hubDecorations.push(item.name);
                        }
                        break;
                    case 'sage':
                        if (!newState.collection.sages.includes(item.name)) {
                            newState.collection.sages.push(item.name);
                        }
                        break;
                }
            });
            return newState;
        });
    };
    
    const isDailyChallengeDone = () => {
        const today = getTodayDateString();
        return gameState.lastDailyChallengeDate === today;
    };

    const handleDailyChallengeStart = () => {
        setDialogue("A series of challenges begin! Complete 3 to earn a reward.");
        setGameState(prev => ({
            ...prev,
            dailyChallengeState: {
                isActive: true,
                challengesCompleted: 0
            },
            // For now, reuse noun meadows combat. This could be its own system.
            currentLocation: 'noun_meadows',
        }));
    };
    
    const handleEquipItem = (type: 'outfit' | 'companion', name: string) => {
        if (type === 'outfit') {
            setGameState(prev => ({...prev, equippedOutfit: name}));
        } else if (type === 'companion') {
            setGameState(prev => ({...prev, equippedCompanion: name}));
        }
    };
    
    const handleCombatResolution = (answer: string) => {
        const { activeCombat, currentLocation, activeProceduralLevel } = gameState;
        if (!activeCombat.challenge || !activeCombat.enemyId) return;

        const isCorrect = answer === activeCombat.challenge.correctAnswer;
        const enemyId = activeCombat.enemyId;

        if (isCorrect) {
            setDialogue("Correct! The enemy is defeated!");
            
            if (currentLocation === 'noun_meadows') {
                setGameState(prev => {
                    const enemyPos = prev.worldProgress.noun_meadows.enemies?.find(e => e.id === enemyId)?.position;
                    const newEnemies = prev.worldProgress.noun_meadows.enemies?.map(e => e.id === enemyId ? {...e, status: 'defeated'} as EnemyState : e) || [];
                    const newWorldProgress = {...prev.worldProgress.noun_meadows, enemies: newEnemies};
                    return {
                        ...prev, 
                        activeCombat: { isActive: false, challenge: null, enemyId: null }, 
                        worldProgress: { ...prev.worldProgress, noun_meadows: newWorldProgress }, 
                        playerXP: prev.playerXP + 20,
                        koEffects: [...prev.koEffects, { id: `ko-${Date.now()}`, pos: enemyPos || {x:0, y:0} }]
                    };
                });
            } else if (currentLocation === 'procedural_gauntlet' && activeProceduralLevel) {
                 setGameState(prev => {
                    const enemyPos = prev.activeProceduralLevel!.enemies.find(e => e.id === enemyId)?.position;
                    const newEnemies = prev.activeProceduralLevel!.enemies.map(e => e.id === enemyId ? {...e, status: 'defeated'} as EnemyState : e);
                    return {
                        ...prev, 
                        activeCombat: { isActive: false, challenge: null, enemyId: null },
                        playerXP: prev.playerXP + 15,
                        activeProceduralLevel: { ...prev.activeProceduralLevel!, enemies: newEnemies },
                        koEffects: [...prev.koEffects, { id: `ko-${Date.now()}`, pos: enemyPos || {x:0, y:0} }]
                    };
                });
            }

        } else {
            setDialogue("Incorrect! You've taken damage!");
            setGameState(prev => ({ ...prev, activeCombat: { isActive: false, challenge: null, enemyId: null }}));
            handlePlayerDamage();
        }
    };
    
    const handleDescribableObjectClick = (puzzleDef: PuzzleDefinition) => {
        setGameState(prev => ({
            ...prev,
            activePuzzle: {
                isActive: true,
                targetObject: puzzleDef.targetObject,
                requiredAdjectives: puzzleDef.requiredAdjectives,
                availableAdjectives: puzzleDef.availableAdjectives,
                selectedAdjectives: [],
            }
        }));
    };

    const handleSelectAdjective = (adjective: string) => {
        setGameState(prev => {
            const { activePuzzle } = prev;
            const selected = activePuzzle.selectedAdjectives;
            if (selected.includes(adjective)) {
                return { ...prev, activePuzzle: { ...activePuzzle, selectedAdjectives: selected.filter(a => a !== adjective) } };
            }
            if (selected.length < activePuzzle.requiredAdjectives.length) {
                return { ...prev, activePuzzle: { ...activePuzzle, selectedAdjectives: [...selected, adjective] } };
            }
            return prev;
        });
    };

    const handlePuzzleSubmit = () => {
        setGameState(prev => {
            const { activePuzzle } = prev;
            const { selectedAdjectives, requiredAdjectives, targetObject } = activePuzzle;
            const isCorrect = requiredAdjectives.length === selectedAdjectives.length && requiredAdjectives.every(adj => selectedAdjectives.includes(adj));
            
            const crystal = ADJECTIVE_PUZZLES.find(p => p.targetObject === targetObject);

            if (isCorrect && crystal) {
                setDialogue(`That's it! You described the ${targetObject} perfectly! You received the ${crystal.id}.`);
                return {
                    ...prev,
                    inventory: [...new Set([...prev.inventory, crystal.id])],
                    wordTome: { ...prev.wordTome, adjectives: [...new Set([...prev.wordTome.adjectives, ...requiredAdjectives])] },
                    playerXP: prev.playerXP + 150,
                    activePuzzle: { ...activePuzzle, isActive: false },
                };
            } else {
                setDialogue(`That's not quite right. Try describing the ${targetObject} again.`);
                return { ...prev, activePuzzle: { ...activePuzzle, selectedAdjectives: [] } };
            }
        });
    };
    
    const handleTemporalObjectClick = (puzzleDef: TimePuzzleDefinition) => {
        setGameState(prev => ({
            ...prev,
            activeTimePuzzle: {
                isActive: true,
                targetId: puzzleDef.id,
                prompt: puzzleDef.prompt,
                challenge: puzzleDef.challenge,
            }
        }));
    };

    const handleTimePuzzleSelect = (tense: Tense) => {
        setGameState(prev => {
            const { activeTimePuzzle } = prev;
            if (!activeTimePuzzle.challenge) return prev;
            const isCorrect = tense === activeTimePuzzle.challenge.correctTense;
            
            if (isCorrect) {
                const puzzleDef = TIME_PUZZLES.find(p => p.id === activeTimePuzzle.targetId);
                if (!puzzleDef) return prev;
                
                setDialogue("You've mended the timeline for this object!");
                const newObjectStates = { ...prev.worldProgress.tense_tangled_forest.objectStates, [puzzleDef.id]: puzzleDef.solvedState };
                const newTenseForestProgress = { ...prev.worldProgress.tense_tangled_forest, objectStates: newObjectStates };
                
                return {
                    ...prev,
                    playerXP: prev.playerXP + 200,
                    activeTimePuzzle: { ...activeTimePuzzle, isActive: false },
                    worldProgress: { ...prev.worldProgress, tense_tangled_forest: newTenseForestProgress },
                };
            } else {
                setDialogue("That wasn't the right time... The object remains unstable. You take damage from the temporal feedback!");
                handlePlayerDamage();
                return { ...prev, activeTimePuzzle: { ...activeTimePuzzle, isActive: false } };
            }
        });
    };

    const handleAim = useCallback((change: number) => {
        setGameState(prev => ({ ...prev, aimingAngle: (prev.aimingAngle + change + 360) % 360 }));
    }, []);

    const handleFire = useCallback((playerPosition: {x:number, y:number}) => {
        setGameState(prev => ({
            ...prev,
            isAiming: false,
            activeProjectiles: [...prev.activeProjectiles, {
                id: `proj-${Date.now()}`,
                pos: { x: playerPosition.x + PLAYER_WIDTH / 2, y: playerPosition.y + PLAYER_HEIGHT / 2 },
                angle: prev.aimingAngle,
            }]
        }));
    }, []);

    const handleProjectileHit = useCallback((projectileId: string, enemyId: string | null) => {
        setGameState(prev => {
            const newState = { ...prev, activeProjectiles: prev.activeProjectiles.filter(p => p.id !== projectileId) };
            if (enemyId) {
                let enemyToFight;
                if (prev.currentLocation === 'procedural_gauntlet' && prev.activeProceduralLevel) {
                    enemyToFight = prev.activeProceduralLevel.enemies.find(e => e.id === enemyId);
                } else if (prev.currentLocation === 'noun_meadows') {
                    enemyToFight = prev.worldProgress.noun_meadows.enemies?.find(e => e.id === enemyId);
                }
                
                if (enemyToFight && enemyToFight.status !== 'defeated') {
                    handleCombatStart(enemyToFight);
                }
            }
            return newState;
        });
    }, [handleCombatStart]);

    const renderWorldContent = () => {
        const { currentLocation, worldProgress, activeProceduralLevel } = gameState;

        switch (currentLocation) {
            case 'noun_meadows':
                return (
                    <GameScreen
                        location={currentLocation}
                        map={NounMeadowsMap}
                        gameState={gameState}
                        onInteract={handleInteraction}
                        onPlayerDamage={handlePlayerDamage}
                        onCombatStart={handleCombatStart}
                        onAim={handleAim}
                        onFire={handleFire}
                        onProjectileHit={handleProjectileHit}
                    />
                );
            case 'verb_volcanoes':
                return (
                    <GameScreen location={currentLocation} map={DUMMY_MAP} gameState={gameState} onInteract={handleInteraction} onPlayerDamage={handlePlayerDamage} onCombatStart={handleCombatStart} onAim={handleAim} onFire={handleFire} onProjectileHit={handleProjectileHit}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <NPC name="Vera" showPrompt={false} onClick={() => handleNpcClick('Vera')} />
                        </div>
                    </GameScreen>
                );
            case 'adjective_isles':
                return (
                    <div className={`w-full h-screen flex flex-col justify-center items-center p-4 pt-20 transition-colors duration-1000 ${worldProgress.adjective_isles.isColored ? 'bg-cyan-200' : 'bg-gray-400'}`}>
                        <div className="absolute top-1/3">
                            <NPC name="Arturo" showPrompt={false} onClick={() => handleNpcClick('Arturo')} />
                        </div>
                        <div className="flex space-x-20 mt-10 w-full justify-around items-end h-1/2">
                            {ADJECTIVE_PUZZLES.map(puzzle => (
                                <DescribableObject
                                    key={puzzle.id}
                                    objectName={puzzle.targetObject}
                                    icon={puzzle.icon}
                                    onClick={() => handleDescribableObjectClick(puzzle)}
                                    isPuzzleSolved={gameState.inventory.includes(puzzle.id)}
                                    isTarget={!gameState.inventory.includes(puzzle.id)}
                                />
                            ))}
                        </div>
                    </div>
                );
            case 'tense_tangled_forest':
                 return (
                    <div className="w-full h-screen flex flex-col justify-center items-center bg-slate-800 p-4 pt-20">
                         <NPC name="Chronos" showPrompt={false} onClick={() => handleNpcClick('Chronos')} />
                         <div className="flex space-x-20 mt-10 relative w-full h-1/2">
                            {TIME_PUZZLES.map(puzzle => {
                                const state = worldProgress.tense_tangled_forest.objectStates?.[puzzle.id] || puzzle.initialState;
                                return (
                                    <div key={puzzle.id} className={`absolute ${puzzle.position}`}>
                                        <TemporalObject 
                                            id={puzzle.id}
                                            currentState={state}
                                            isSolved={state === puzzle.solvedState}
                                            onClick={() => handleTemporalObjectClick(puzzle)}
                                        />
                                    </div>
                                );
                            })}
                         </div>
                    </div>
                );
            case 'procedural_gauntlet':
                if (gameState.loadingStatus.isGeneratingLevel) {
                     return <div className="flex justify-center items-center h-screen"><h1>Generating Gauntlet Level...</h1></div>;
                }
                if (activeProceduralLevel) {
                    return (
                        <GameScreen
                            location="procedural_gauntlet"
                            map={activeProceduralLevel}
                            gameState={gameState}
                            onInteract={handleInteraction}
                            onPlayerDamage={handlePlayerDamage}
                            onCombatStart={handleCombatStart}
                            onAim={handleAim}
                            onFire={handleFire}
                            onProjectileHit={handleProjectileHit}
                        />
                    );
                }
                return <div className="flex justify-center items-center h-screen"><h1>Loading Gauntlet...</h1></div>;
            default:
                return null;
        }
    };
    
  return (
    <div className="app-container bg-gray-900 text-white font-sans">
      <StatusBar
        xp={gameState.playerXP}
        gems={gameState.lingoGems}
        inventory={gameState.inventory}
        onShowMap={() => handleTravel('map')}
        hp={gameState.playerHP}
        maxHp={gameState.playerMaxHP}
      />

      {/* Main Game Content Screens */}
      {gameState.currentLocation === 'map' && (
        <WorldMap
          unlockedWorlds={gameState.unlockedWorlds}
          onTravel={handleTravel}
          worldProgress={gameState.worldProgress}
          onResetRequest={handleResetWorld}
        />
      )}
      {gameState.currentLocation === 'hub_main' && (
        <TravelersHub
          onNavigate={handleTravel}
          collection={gameState.collection}
          equippedOutfit={gameState.equippedOutfit}
          equippedCompanion={gameState.equippedCompanion}
        />
      )}
      {gameState.currentLocation === 'well_of_words' && (
        <WellOfWords
          gems={gameState.lingoGems}
          onDraw={handleGachaDraw}
          onBack={() => handleTravel('hub_main')}
          results={gameState.gachaResult}
          onCloseResults={() => setGameState(prev => ({ ...prev, gachaResult: null }))}
        />
      )}
      {gameState.currentLocation === 'endless_tower' && (
        <EndlessTower
          onBack={() => handleTravel('hub_main')}
          onStart={handleDailyChallengeStart}
          isAvailable={!isDailyChallengeDone()}
        />
      )}
      {gameState.currentLocation === 'collection_screen' && (
        <CollectionScreen
          collection={gameState.collection}
          onBack={() => handleTravel('hub_main')}
          onEquip={handleEquipItem}
          equippedOutfit={gameState.equippedOutfit}
          equippedCompanion={gameState.equippedCompanion}
        />
      )}

      {/* Render active world */}
      {renderWorldContent()}

      {/* UI Overlays */}
      {dialogue && <DialogueBox message={dialogue} onClose={() => setDialogue(null)} choices={gameState.dialogueChoices} />}
      {gameState.activeCombat.isActive && <CombatUI combatState={gameState.activeCombat} onResolve={handleCombatResolution} isFetchingQuiz={gameState.loadingStatus.isFetchingQuiz} />}
      {gameState.activePuzzle.isActive && <PuzzleUI puzzleState={gameState.activePuzzle} onSelectAdjective={handleSelectAdjective} onSubmit={handlePuzzleSubmit} onClose={() => setGameState(prev => ({ ...prev, activePuzzle: { ...prev.activePuzzle, isActive: false } }))} />}
      {gameState.activeTimePuzzle.isActive && <TimePuzzleUI puzzleState={gameState.activeTimePuzzle} onSelectTense={handleTimePuzzleSelect} onClose={() => setGameState(prev => ({ ...prev, activeTimePuzzle: { ...prev.activeTimePuzzle, isActive: false } }))} />}
      {gameState.activeLesson && <LessonUI lessonData={lessonData} isLoading={gameState.loadingStatus.isFetchingLesson} onClose={handleCloseLesson} onCancel={handleCloseLesson} onRefresh={() => fetchLessonData(gameState.activeLesson!, true)} />}
      {gameState.isGameOver && <GameOverScreen onRetry={handleRetry} />}
      {confirmation && <ConfirmationModal {...confirmation} onCancel={() => setConfirmation(null)} />}
    </div>
  );
};

export default App;
