import type { MapDefinition, InteractiveElement } from './types';
import type { ItemName, ArticleChallenge } from '../types';

const TILE_SIZE = 48;

const layout = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const interactives: InteractiveElement[] = [
  { id: 'Fitz', type: 'npc', x: 4, y: 7 },
  { id: 'item-book', type: 'quest_item', x: 18, y: 4, itemName: 'book', guardianId: 'imp2' },
  { id: 'item-apple', type: 'quest_item', x: 17, y: 3, itemName: 'apple', guardianId: 'imp1' },
  { id: 'item-hat', type: 'quest_item', x: 2, y: 11, itemName: 'hat', guardianId: 'imp3' },
  { id: 'stone-1', type: 'guiding_stone', x: 5, y: 3, lessonId: 'articles_a_an' },
];

const enemies = [
    { id: 'imp1', type: 'article_imp' as const, x: 16, y: 4, patrolRange: 2, challenge: { type: 'article', itemName: 'apple', sentence: 'She is eating ___ apple.', options: ['a', 'an', 'the'], correctAnswer: 'an' } as ArticleChallenge },
    { id: 'imp2', type: 'article_imp' as const, x: 15, y: 4, patrolRange: 2, challenge: { type: 'article', itemName: 'book', sentence: 'He is reading ___ book.', options: ['a', 'an', 'the'], correctAnswer: 'a' } as ArticleChallenge },
    { id: 'imp3', type: 'article_imp' as const, x: 3, y: 10, patrolRange: 2, challenge: { type: 'article', itemName: 'hat', sentence: 'That is ___ nice hat.', options: ['a', 'an', 'the'], correctAnswer: 'a' } as ArticleChallenge },
];


const playerStart = { x: 2, y: 2 };

export const NounMeadowsMap: MapDefinition = {
  TILE_SIZE,
  layout,
  interactives,
  playerStart,
  enemies,
};
