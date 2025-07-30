import { useState, useEffect, useRef, useCallback } from 'react';
import type { MapDefinition, NpcElement, GuidingStoneElement, PortalElement, InteractiveElement } from '../maps/types';
import type { EnemyState, QuestItemState, ProceduralLevelData } from '../types';

const SPEED = 4;
const INTERACTION_RADIUS = 72; // 1.5 tiles
const DETECTION_RADIUS = 250;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 48;
const ENEMY_HITBOX = { width: 44, height: 44 };
const AIM_STEP = 8; // degrees per key press

export const usePlayerMovement = (
    map: MapDefinition | ProceduralLevelData, 
    interactives: (QuestItemState | { id: string, type: string, pos: {x: number, y: number}})[] | any[],
    enemies: EnemyState[],
    onInteract: (id: string, type: string) => void,
    onCombatStart: (enemy: EnemyState) => void,
    isPaused: boolean,
    isAiming: boolean,
    onAim: (change: number) => void,
    onFire: () => void,
    startPos: { x: number; y: number }
) => {
  const { layout, TILE_SIZE } = map;
  
  const [position, setPosition] = useState({ x: startPos.x * TILE_SIZE, y: startPos.y * TILE_SIZE });
  const [direction, setDirection] = useState('down');
  const [isMoving, setIsMoving] = useState(false);
  const [closestInteractive, setClosestInteractive] = useState<{ id: string, type: string } | null>(null);

  const keysPressed = useRef<Record<string, boolean>>({}).current;
  const playerPositionRef = useRef(position);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    playerPositionRef.current = position;
  }, [position]);

  // CRITICAL FIX: Force reset player position when the level changes (startPos changes)
  useEffect(() => {
    setPosition({ x: startPos.x * TILE_SIZE, y: startPos.y * TILE_SIZE });
  }, [startPos, TILE_SIZE]);

  const handleFocus = useCallback(() => {
    const playerCenter = { x: playerPositionRef.current.x + PLAYER_WIDTH / 2, y: playerPositionRef.current.y + PLAYER_HEIGHT / 2 };
    let closestEnemy: EnemyState | null = null;
    let minDistance = Infinity;

    enemies.forEach(enemy => {
        if (enemy.status === 'defeated') return;
        const enemyCenter = { x: enemy.position.x + ENEMY_HITBOX.width / 2, y: enemy.position.y + ENEMY_HITBOX.height / 2 };
        const distance = Math.sqrt(Math.pow(playerCenter.x - enemyCenter.x, 2) + Math.pow(playerCenter.y - enemyCenter.y, 2));
        
        if (distance < DETECTION_RADIUS && distance < minDistance) {
            minDistance = distance;
            closestEnemy = enemy;
        }
    });

    if (closestEnemy) {
        onCombatStart(closestEnemy);
    }
  }, [enemies, onCombatStart]);

  const isColliding = useCallback((x: number, y: number) => {
    const playerLeft = x;
    const playerRight = x + PLAYER_WIDTH;
    const playerTop = y;
    const playerBottom = y + PLAYER_HEIGHT;

    // Check map boundaries
    if (playerLeft < 0 || playerRight > layout[0].length * TILE_SIZE || playerTop < 0 || playerBottom > layout.length * TILE_SIZE) {
      return true;
    }
    
    // Check collision with solid tiles
    const checkPoints = [
      { x: playerLeft, y: playerBottom - 10 }, // Feet area
      { x: playerRight, y: playerBottom - 10 },
      { x: x + PLAYER_WIDTH/2, y: y + PLAYER_HEIGHT/2 }, // Center
    ];

    for (const point of checkPoints) {
        const tileX = Math.floor(point.x / TILE_SIZE);
        const tileY = Math.floor(point.y / TILE_SIZE);
        if (layout[tileY] && layout[tileY][tileX] === 1) {
            return true;
        }
    }

    return false;
  }, [layout, TILE_SIZE]);

  const gameLoop = useCallback(() => {
    let moved = false;
    let newDirection = direction;

    if (!isPaused) {
        let { x, y } = playerPositionRef.current;
        
        const vx = (keysPressed['a'] || keysPressed['arrowleft'] ? -1 : 0) + (keysPressed['d'] || keysPressed['arrowright'] ? 1 : 0);
        const vy = (keysPressed['w'] || keysPressed['arrowup'] ? -1 : 0) + (keysPressed['s'] || keysPressed['arrowdown'] ? 1 : 0);

        if (vx !== 0 || vy !== 0) {
            moved = true;
            let nextX = x + vx * SPEED;
            let nextY = y + vy * SPEED;

            if(vy < 0) newDirection = 'up';
            else if (vy > 0) newDirection = 'down';
            else if (vx < 0) newDirection = 'left';
            else if (vx > 0) newDirection = 'right';

            // Check collision on each axis separately to allow sliding along walls
            if (!isColliding(nextX, y)) {
                x = nextX;
            }
            if (!isColliding(x, nextY)) {
                y = nextY;
            }
        }
        setPosition({ x, y });

        // Proximity check for NPCs/Interactives
        let closest: { id: string, type: string } | null = null;
        let minDistance = Infinity;
        const playerCenterX = x + PLAYER_WIDTH / 2;
        const playerCenterY = y + PLAYER_HEIGHT / 2;

        interactives.forEach(interactive => {
          const pos = interactive.pos;
          const objCenterX = pos.x + (('name' in interactive) ? 24 : TILE_SIZE / 2); // QuestItem vs map tile
          const objCenterY = pos.y + (('name' in interactive) ? 24 : TILE_SIZE / 2);
          const distance = Math.sqrt(Math.pow(playerCenterX - objCenterX, 2) + Math.pow(playerCenterY - objCenterY, 2));
          
          if (distance < INTERACTION_RADIUS && distance < minDistance) {
            minDistance = distance;
            const type = 'type' in interactive ? interactive.type : 'quest_item';
            closest = {id: interactive.id, type: type };
          }
        });
        setClosestInteractive(closest);
    }
    
    setDirection(newDirection);
    setIsMoving(moved);
    
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [direction, isColliding, interactives, TILE_SIZE, isPaused]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed[key] = true;
      
      if (isAiming) {
        e.preventDefault();
        let aimChange = 0;
        if (key === 'a' || key === 'arrowleft') aimChange = -AIM_STEP;
        if (key === 'd' || key === 'arrowright') aimChange = AIM_STEP;
        
        if(aimChange !== 0) onAim(aimChange);

        if (e.key === ' ') { // Spacebar
          onFire();
        }
        return; // Prevent other actions while aiming
      }
      
      if(isPaused) return;

      if ((key === 'e' || e.key === ' ') && closestInteractive) {
        e.preventDefault();
        onInteract(closestInteractive.id, closestInteractive.type);
      }
      if (key === 'f') { // Focus key
        e.preventDefault();
        handleFocus();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameLoop, closestInteractive, onInteract, handleFocus, isPaused, isAiming, onAim, onFire]);

  return { position, direction, isMoving, closestInteractive };
};