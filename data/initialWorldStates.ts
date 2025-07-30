import type { NounMeadowsProgress, EnemyState, QuestItemState } from '../types';
import { NounMeadowsMap } from '../maps/NounMeadowsMap';
import type { QuestItemElement } from '../maps/types';

// The full, initial state for the Noun Meadows.
// This serves as a "template" to reset the world from.
export const NOUN_MEADOWS_INITIAL_PROGRESS: NounMeadowsProgress = {
  status: 'not_started',
  fitzDialogueState: 'initial_quest',
  isPortalSpawned: false,
  questItems: NounMeadowsMap.interactives
    .filter((i): i is QuestItemElement => i.type === 'quest_item')
    .map((itemDef): QuestItemState => ({
        id: itemDef.id,
        name: itemDef.itemName,
        pos: { x: itemDef.x * NounMeadowsMap.TILE_SIZE, y: itemDef.y * NounMeadowsMap.TILE_SIZE },
        isCollected: false,
        guardianId: itemDef.guardianId,
    })),
  enemies: NounMeadowsMap.enemies.map((def): EnemyState => ({
    id: def.id,
    type: def.type,
    position: { x: def.x * NounMeadowsMap.TILE_SIZE, y: def.y * NounMeadowsMap.TILE_SIZE },
    startPos: { x: def.x * NounMeadowsMap.TILE_SIZE, y: def.y * NounMeadowsMap.TILE_SIZE },
    patrolRange: def.patrolRange * NounMeadowsMap.TILE_SIZE,
    status: 'patrolling',
    direction: 'right',
    challenge: def.challenge,
    vx: 0,
    vy: 0,
  })),
};