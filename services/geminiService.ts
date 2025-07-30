

import { GoogleGenAI, Type } from "@google/genai";
import { LESSONS } from '../data/lessons';
import type { LessonData, ProceduralLevelData, EnemyState, QuestItemState } from '../types';

// This is a placeholder for the API key. In a real environment, this would be
// securely managed and accessed via environment variables.
// For this project, we assume `process.env.API_KEY` is correctly configured.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface QuizData {
    sentence: string;
    correctAnswer: string;
    options: string[];
}

export interface ServiceResponse<T> {
    data: T;
    errorType: 'QUOTA_EXHAUSTED' | 'NETWORK_ERROR' | null;
}

// Helper to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isQuotaError = (error: any): boolean => {
    const errorMessage = JSON.stringify(error) || (error?.toString() ?? "");
    return errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED");
};


/**
 * Generates a fill-in-the-blank quiz for English articles 'a' or 'an'.
 * @param targetNoun The noun to create a question for.
 * @returns A promise that resolves to a ServiceResponse object with QuizData.
 */
export async function generateArticleQuiz(targetNoun: string): Promise<ServiceResponse<QuizData>> {
  const fallback = (): QuizData => {
    console.log("Using fallback quiz due to API error or missing key.");
    return {
      sentence: `This is ___ ${targetNoun}.`,
      correctAnswer: ['a','e','i','o','u'].includes(targetNoun[0].toLowerCase()) ? 'an' : 'a',
      options: ["a", "an"]
    };
  };

  if (!API_KEY) {
    return { data: fallback(), errorType: 'NETWORK_ERROR' };
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
        const prompt = `You are a quiz generator for an educational game. Create a simple 'fill-in-the-blank' question to test a beginner's use of the English articles 'a' or 'an'. The target noun is '${targetNoun}'. Provide your response ONLY in a valid JSON format with the following structure: { "sentence": "...", "correct_answer": "...", "options": ["a", "an"] }`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentence: { type: Type.STRING, description: "A sentence with '___' for the blank." },
                        correct_answer: { type: Type.STRING, description: "The correct article, 'a' or 'an'." },
                        options: {
                            type: Type.ARRAY,
                            description: "An array containing two options: 'a' and 'an'.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["sentence", "correct_answer", "options"]
                }
            }
        });

        const jsonText = response.text.trim();
        const quiz = JSON.parse(jsonText);

        if (quiz && typeof quiz.sentence === 'string' && typeof quiz.correct_answer === 'string' && Array.isArray(quiz.options)) {
          const data = {
            sentence: quiz.sentence,
            correctAnswer: quiz.correct_answer,
            options: quiz.options,
          };
          return { data, errorType: null };
        } else {
          throw new Error(`Gemini response did not match expected schema: ${jsonText}`);
        }
    } catch (error) {
        if (isQuotaError(error)) {
            console.error("API quota exceeded during quiz generation.");
            return { data: fallback(), errorType: 'QUOTA_EXHAUSTED' };
        }
        console.warn(`Retriable error on quiz generation attempt ${attempt}:`, error);
        if (attempt < 3) {
            await sleep(1000 * Math.pow(2, attempt -1));
        }
    }
  }

  console.error(`API call failed after all retries for quiz generation.`);
  return { data: fallback(), errorType: 'NETWORK_ERROR' };
}

/**
 * Generates a full, dynamic lesson including title, explanation, and examples.
 * @param topic A key to identify the lesson, e.g., 'lesson_articles'.
 * @returns A promise resolving to a ServiceResponse object with full LessonData.
 */
export async function generateFullLesson(topic: string): Promise<ServiceResponse<LessonData>> {
  const fallback = (): LessonData => {
    const fallbackData = LESSONS[topic];
    if (!fallbackData) {
        // This should ideally not happen if topic is always valid
        return { title: 'Error', explanation: 'Lesson not found.', examples: [] };
    }
    console.log("Using fallback full lesson due to API error or missing key.");
    return fallbackData;
  };

  if (!API_KEY) {
    return { data: fallback(), errorType: 'NETWORK_ERROR' };
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const prompt = `You are a friendly and creative English teacher for a game. Generate a complete mini-lesson about using the articles 'a' and 'an'.
The lesson needs a title, a brief explanation (2-3 sentences), and exactly 3 distinct examples.
For each example, provide the text (e.g., 'a clever fox') and an appropriate, simple noun to represent it visually (e.g., 'fox').
Provide your response ONLY in a valid JSON format with the following structure:
{
  "title": "...",
  "explanation": "...",
  "examples": [
    { "text": "...", "icon_name": "..." },
    { "text": "...", "icon_name": "..." },
    { "text": "...", "icon_name": "..." }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "A short, engaging title for the lesson." },
                explanation: { type: Type.STRING, description: "A simple, 2-3 sentence explanation of the rule." },
                examples: {
                    type: Type.ARRAY,
                    description: "An array of exactly 3 examples.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING, description: "The example text, e.g., 'an awesome adventure'."},
                            icon_name: { type: Type.STRING, description: "A single, simple noun for a visual icon, e.g., 'adventure'."}
                        },
                        required: ["text", "icon_name"]
                    }
                }
              },
              required: ["title", "explanation", "examples"]
            }
          }
        });

        const jsonText = response.text.trim();
        const lessonContent = JSON.parse(jsonText);
        
        if (lessonContent && lessonContent.title && lessonContent.explanation && Array.isArray(lessonContent.examples) && lessonContent.examples.length > 0) {
          return { data: lessonContent, errorType: null };
        } else {
          throw new Error(`Gemini response for full lesson did not match schema: ${jsonText}`);
        }
    } catch(error) {
        if (isQuotaError(error)) {
            console.error("API quota exceeded during lesson generation.");
            return { data: fallback(), errorType: 'QUOTA_EXHAUSTED' };
        }
        console.warn(`Retriable error on lesson generation attempt ${attempt}:`, error);
        if (attempt < 3) {
            await sleep(1500 * Math.pow(2, attempt -1));
        }
    }
  }

  console.error(`API call failed after all retries for lesson generation.`);
  return { data: fallback(), errorType: 'NETWORK_ERROR' };
}

const TILE_SIZE = 48;

export const FALLBACK_GAUNTLET_LEVEL: ProceduralLevelData = {
    TILE_SIZE,
    levelNumber: 1,
    theme: 'meadows',
    playerSpawn: { x: 1, y: 7 },
    exitPosition: { x: 18, y: 12 },
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    npc: { name: 'Fitz', position: { x: 3, y: 7 }, quest: "I seem to have dropped my things again! Can you find my book, hat, and apple?" },
    guidingStone: { lessonId: 'articles_a_an', position: { x: 2, y: 2 } },
    questItems: [
        { id: 'item_1', name: 'book', pos: { x: 18 * TILE_SIZE, y: 2 * TILE_SIZE }, isCollected: false, guardianId: 'enemy_1' },
        { id: 'item_2', name: 'hat', pos: { x: 17 * TILE_SIZE, y: 8 * TILE_SIZE }, isCollected: false, guardianId: 'enemy_2' },
        { id: 'item_3', name: 'apple', pos: { x: 8 * TILE_SIZE, y: 12 * TILE_SIZE }, isCollected: false, guardianId: 'enemy_3' },
    ],
    enemies: [
        { id: 'enemy_1', type: 'article_imp', position: { x: 17 * TILE_SIZE, y: 2 * TILE_SIZE }, startPos: { x: 17 * TILE_SIZE, y: 2 * TILE_SIZE }, patrolRange: 1 * TILE_SIZE, status: 'patrolling', direction: 'right', challenge: { type: 'article', itemName: 'book', sentence: 'He is reading ___ book.', options: ['a', 'an'], correctAnswer: 'a' }, vx: 0, vy: 0 },
        { id: 'enemy_2', type: 'article_imp', position: { x: 17 * TILE_SIZE, y: 9 * TILE_SIZE }, startPos: { x: 17 * TILE_SIZE, y: 9 * TILE_SIZE }, patrolRange: 1 * TILE_SIZE, status: 'patrolling', direction: 'right', challenge: { type: 'article', itemName: 'hat', sentence: 'That is ___ nice hat.', options: ['a', 'an'], correctAnswer: 'a' }, vx: 0, vy: 0 },
        { id: 'enemy_3', type: 'article_imp', position: { x: 8 * TILE_SIZE, y: 11 * TILE_SIZE }, startPos: { x: 8 * TILE_SIZE, y: 11 * TILE_SIZE }, patrolRange: 1 * TILE_SIZE, status: 'patrolling', direction: 'right', challenge: { type: 'article', itemName: 'apple', sentence: 'She is eating ___ apple.', options: ['a', 'an'], correctAnswer: 'an' }, vx: 0, vy: 0 },
    ]
};

interface ValidationResult {
    isValid: boolean;
    reachableNodes?: Set<string>;
    unreachableTargets?: { x: number; y: number }[];
}

/**
 * Validates that all essential gameplay elements are on a continuous, walkable path from the player's spawn.
 * @param levelData The procedural level data to validate.
 * @returns An object indicating if the level is valid and providing data for fixing if not.
 */
function validateLevelConnectivity(levelData: ProceduralLevelData): ValidationResult {
    const { layout, playerSpawn, TILE_SIZE } = levelData;

    const allTargetCoords = [
        levelData.npc.position,
        levelData.guidingStone.position,
        levelData.exitPosition,
        ...levelData.questItems.map(item => ({ x: Math.floor(item.pos.x / TILE_SIZE), y: Math.floor(item.pos.y / TILE_SIZE) })),
        ...levelData.enemies.map(enemy => ({ x: Math.floor(enemy.position.x / TILE_SIZE), y: Math.floor(enemy.position.y / TILE_SIZE) }))
    ];
    
    const startNode = `${playerSpawn.x},${playerSpawn.y}`;
    const queue = [startNode];
    const visited = new Set<string>([startNode]);
    
    while(queue.length > 0) {
        const currentNode = queue.shift()!;
        const [x, y] = currentNode.split(',').map(Number);
        
        const neighbors = [[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]];
        
        for (const [nx, ny] of neighbors) {
            if (ny >= 0 && ny < layout.length && nx >= 0 && nx < layout[0].length && layout[ny][nx] === 0) {
                const neighborNode = `${nx},${ny}`;
                if (!visited.has(neighborNode)) {
                    visited.add(neighborNode);
                    queue.push(neighborNode);
                }
            }
        }
    }
    
    const unreachableTargets: { x: number; y: number }[] = [];
    for (const target of allTargetCoords) {
        const targetNode = `${target.x},${target.y}`;
        if (!visited.has(targetNode)) {
            unreachableTargets.push(target);
        }
    }
    
    if (unreachableTargets.length > 0) {
        console.warn(`Validation Failed: ${unreachableTargets.length} targets unreachable from spawn ${startNode}.`);
        unreachableTargets.forEach(t => console.warn(`- Unreachable at tile ${t.x},${t.y}`));
        return { isValid: false, reachableNodes: visited, unreachableTargets };
    }
    
    return { isValid: true };
}

/**
 * Programmatically "drills" paths in the layout to connect unreachable areas.
 * @param levelData The original level data.
 * @param unreachableTargets The list of tile coordinates for unreachable objects.
 * @param reachableNodes A Set of string coordinates for all reachable tiles.
 * @returns A new, modified layout array.
 */
function fixLayoutConnectivity(
    levelData: ProceduralLevelData, 
    unreachableTargets: {x: number, y: number}[],
    reachableNodes: Set<string>
): number[][] {
    const newLayout = levelData.layout.map(row => [...row]);
    
    const reachableCoords = Array.from(reachableNodes).map(node => {
        const [x, y] = node.split(',').map(Number);
        return { x, y };
    });

    for (const target of unreachableTargets) {
        let closestReachable: {x: number, y: number} | null = null;
        let minDistance = Infinity;

        for (const reachable of reachableCoords) {
            const distance = Math.hypot(target.x - reachable.x, target.y - reachable.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestReachable = reachable;
            }
        }

        if (closestReachable) {
            // Drill a path using Bresenham's line algorithm
            let x0 = target.x;
            let y0 = target.y;
            const x1 = closestReachable.x;
            const y1 = closestReachable.y;

            const dx = Math.abs(x1 - x0);
            const dy = -Math.abs(y1 - y0);
            const sx = x0 < x1 ? 1 : -1;
            const sy = y0 < y1 ? 1 : -1;
            let err = dx + dy;

            while (true) {
                if (newLayout[y0] && newLayout[y0][x0] !== undefined) {
                    newLayout[y0][x0] = 0; // Drill a hole (set wall to floor)
                }
                
                if (x0 === x1 && y0 === y1) break;
                const e2 = 2 * err;
                if (e2 >= dy) { err += dy; x0 += sx; }
                if (e2 <= dx) { err += dx; y0 += sy; }
            }
        }
    }

    return newLayout;
}


export async function generateProceduralLevel(levelNumber: number): Promise<ServiceResponse<ProceduralLevelData>> {
  const fallback = (): ProceduralLevelData => {
    console.log("Using fallback procedural level due to API error or max retries.");
    // Return a deep copy to prevent mutation issues
    const fallbackCopy = JSON.parse(JSON.stringify(FALLBACK_GAUNTLET_LEVEL));
    fallbackCopy.levelNumber = levelNumber;
    return fallbackCopy;
  };
  
  if (!API_KEY) {
    return { data: fallback(), errorType: 'NETWORK_ERROR' };
  }
  
  const itemAndEnemyCount = 2 + Math.min(levelNumber, 5); // Cap at 7 for stability
  
  const prompt = `
You are a level designer for a 2D tile-based game. Your most important job is to create playable maps.

**The Golden Rule:** Think of the layout as a floor plan. '0' is the open floor, and '1' is a solid wall. You must **NEVER** place any important object (player, NPC, items, enemies, exit) on a '1' tile. Furthermore, you must ensure that there is a clear, walkable path on the '0' tiles from where the player starts to every other important object. **There can be no islands or areas completely surrounded by walls.** Imagine you are the player. If you cannot walk from your spawn point to an item without passing through a '1' (a wall), the level is broken.

**Task:**
Generate the data for a single level in our game, "Lexicon Legends," based on the difficulty ${levelNumber}. The grid size is 20x15.

**STRICT REQUIREMENTS based on The Golden Rule:**

1.  **Layout (\`layout\`):** Create a 20x15 2D array of 0s and 1s.
2.  **Player Spawn (\`playerSpawn\`):** Define a single starting position. **This position MUST be on a '0' tile.**
3.  **Exit Point (\`exitPosition\`):** You must define an exit point for this level. **This position MUST be on a walkable '0' tile.**
4.  **Key Elements Placement:**
    -   Generate exactly ${itemAndEnemyCount} **Quest Items**.
    -   Generate exactly ${itemAndEnemyCount} **Enemies** to guard them.
    -   Generate one **NPC** and one **Guiding Stone**.
    -   **CRITICAL:** Place ALL of these elements at different coordinates. Every single one of these coordinates **MUST be on a '0' tile** in your layout.
5.  **Connectivity:**
    -   **ABSOLUTELY CRITICAL:** After you design the layout and place the objects, perform a mental check. Start at \`playerSpawn\`. Can you trace a path of '0's to the NPC? To the Guiding Stone? To every single Quest Item? To the \`exitPosition\`? If the answer is no for even one of them, the layout is invalid and must be fixed. Do not create isolated sections.
6.  **Thematic Content (Based on Level Number):**
    -   **Level 1-3 (The Noun Meadows Theme):** Theme 'meadows', NPC 'Fitz', Quest "Find my lost items!", Guiding Stone 'articles_a_an', Items ('book', 'hat', 'apple', 'map', 'key'), Enemy 'article_imp'.
    -   **Level 4+ (The Verb Volcanoes Theme):** Theme 'volcanoes', NPC 'Vera', Quest "Activate the runes!", Guiding Stone 'tenses_simple_present', Items ('fire_rune', 'lava_stone', 'obsidian_shard', 'magma_core'), Enemy 'tense_terror'.

Provide your response ONLY in a valid, minified JSON format matching the schema. Do not add comments or markdown.
`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            levelNumber: { type: Type.NUMBER },
            theme: { type: Type.STRING },
            layout: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.NUMBER } } },
            playerSpawn: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] },
            exitPosition: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] },
            npc: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, position: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }, quest: { type: Type.STRING } }, required: ["name", "position", "quest"] },
            guidingStone: { type: Type.OBJECT, properties: { lessonId: { type: Type.STRING }, position: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] } }, required: ["lessonId", "position"] },
            questItems: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, position: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }, guardianId: { type: Type.STRING } }, required: ["id", "name", "position", "guardianId"] } },
            enemies: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, position: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }, challengeTopic: { type: Type.STRING } }, required: ["id", "type", "position", "challengeTopic"] } }
        },
        required: ["levelNumber", "theme", "layout", "playerSpawn", "exitPosition", "npc", "guidingStone", "questItems", "enemies"]
    };

    const maxGenerationAttempts = 3;
    for (let attempt = 1; attempt <= maxGenerationAttempts; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                }
            });

            const jsonText = response.text.trim();
            const rawData = JSON.parse(jsonText);

            const hydratedEnemies: EnemyState[] = rawData.enemies.map((enemyDef: any): EnemyState => {
                const correspondingItem = rawData.questItems.find((i: any) => i.guardianId === enemyDef.id);
                const itemName = correspondingItem ? correspondingItem.name : "item";
                
                return {
                    id: enemyDef.id, type: enemyDef.type,
                    position: { x: enemyDef.position.x * TILE_SIZE, y: enemyDef.position.y * TILE_SIZE },
                    startPos: { x: enemyDef.position.x * TILE_SIZE, y: enemyDef.position.y * TILE_SIZE },
                    patrolRange: 2 * TILE_SIZE, status: 'patrolling', direction: 'right',
                    challengeTopic: enemyDef.challengeTopic,
                    challenge: { type: 'article', itemName: itemName, sentence: `It is ___ ${itemName}.`, options: ['a', 'an'], correctAnswer: ['a', 'e', 'i', 'o', 'u'].includes(itemName[0].toLowerCase()) ? 'an' : 'a', },
                    vx: 0, vy: 0,
                };
            });
            
            const hydratedQuestItems: QuestItemState[] = rawData.questItems.map((itemDef: any): QuestItemState => ({
                id: itemDef.id, name: itemDef.name,
                pos: { x: itemDef.position.x * TILE_SIZE, y: itemDef.position.y * TILE_SIZE },
                isCollected: false, guardianId: itemDef.guardianId,
            }));

            // Create a mutable copy for the fixing loop
            let currentLevelData: ProceduralLevelData = {
                TILE_SIZE, levelNumber: rawData.levelNumber, theme: rawData.theme, layout: rawData.layout,
                playerSpawn: rawData.playerSpawn, npc: rawData.npc, guidingStone: rawData.guidingStone,
                questItems: hydratedQuestItems, enemies: hydratedEnemies, exitPosition: rawData.exitPosition,
            };
            
            let fixAttempts = 0;
            const MAX_FIX_ATTEMPTS = 5; // Safeguard against infinite loops

            while (fixAttempts < MAX_FIX_ATTEMPTS) {
                fixAttempts++;
                const validation = validateLevelConnectivity(currentLevelData);
                
                if (validation.isValid) {
                    console.log(`Successfully generated and validated level on API attempt ${attempt} after ${fixAttempts - 1} fix(es).`);
                    return { data: currentLevelData, errorType: null };
                }

                if (fixAttempts === 1) {
                  console.warn(`Generated level failed validation on API attempt ${attempt}. Attempting to fix...`);
                } else {
                  console.warn(`Level still invalid. Attempting fix #${fixAttempts}...`);
                }
                
                const fixedLayout = fixLayoutConnectivity(
                    currentLevelData,
                    validation.unreachableTargets!,
                    validation.reachableNodes!
                );
                currentLevelData = { ...currentLevelData, layout: fixedLayout };
            }
            
            // If it's still not valid after several fixes, this generation is a lost cause.
            throw new Error(`Failed to fix level connectivity after ${MAX_FIX_ATTEMPTS} attempts.`);

        } catch (error) {
            if (isQuotaError(error)) {
                console.error("API quota exceeded during level generation.");
                return { data: fallback(), errorType: 'QUOTA_EXHAUSTED' };
            }
            console.error(`API call or level fixing failed on attempt ${attempt}:`, error);
            if (attempt < maxGenerationAttempts) await sleep(2000);
        }
    }
    
    console.error(`Failed to generate a valid level after ${maxGenerationAttempts} attempts. Loading fallback.`);
    return { data: fallback(), errorType: 'NETWORK_ERROR' };
}