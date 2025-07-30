import type { ArticleChallenge, ItemName, QuestItemState, VerbChallenge } from '../types';

export interface NpcElement {
  id: 'Fitz'; // Can be expanded later
  type: 'npc';
  x: number; // tile coordinate
  y: number; // tile coordinate
}

// This is now only used for initial map definitions, the live state is QuestItemState
export interface QuestItemElement {
  id: string; // e.g. "item-book"
  type: 'quest_item';
  x: number; // tile coordinate
  y: number; // tile coordinate
  itemName: ItemName;
  guardianId: string; // id of a guardian from the enemies array
}

export interface GuidingStoneElement {
  id: string;
  type: 'guiding_stone';
  x: number; // tile coordinate
  y: number; // tile coordinate
  lessonId: string; // key for LESSONS object
}

export interface PortalElement {
  id: 'portal_gate';
  type: 'portal';
  x: number; // tile coordinate
  y: number; // tile coordinate
}

export type InteractiveElement = NpcElement | QuestItemElement | GuidingStoneElement | PortalElement;

export interface EnemyDefinition {
    id: string;
    type: 'article_imp';
    x: number; // tile coordinate
    y: number; // tile coordinate
    patrolRange: number; // in tiles
    challenge: ArticleChallenge | VerbChallenge;
    challengeTopic?: string;
}

export interface MapDefinition {
  TILE_SIZE: number;
  layout: number[][];
  interactives: InteractiveElement[];
  playerStart: { x: number; y: number };
  enemies: EnemyDefinition[];
}