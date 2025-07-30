import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { World, HubLocation, GameState, EnemyState, QuestItemState, MapLocation, ProceduralLocation, ProceduralLevelData } from '../types';
import type { MapDefinition, InteractiveElement, NpcElement, GuidingStoneElement, PortalElement } from '../maps/types';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import Player from './Player';
import NPC from './NPC';
import Enemy from './Enemy';
import QuestItem from './QuestItem';
import GuidingStone from './GuidingStone';
import Portal from './Portal';
import Projectile from './Projectile';
import AimingArrow from './AimingArrow';
import KOEffect from './KOEffect';
import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../App';


interface GameScreenProps {
  children?: React.ReactNode;
  location: MapLocation;
  className?: string;
  // New props for dynamic explorable maps
  map: MapDefinition | ProceduralLevelData;
  gameState: GameState;
  onInteract: (id: string, type: string) => void;
  onPlayerDamage: () => void;
  onCombatStart: (enemy: EnemyState) => void;
  onAim: (change: number) => void;
  onFire: (playerPosition: { x: number, y: number }) => void;
  onProjectileHit: (projectileId: string, enemyId: string | null) => void;
}

const THEMES: Record<string, { bg: string, wall: string }> = {
    'noun_meadows': { bg: '#6ABE39', wall: '#a1662f' },
    'procedural_gauntlet': { bg: '#4a044e', wall: '#38023b' },
    'meadows': { bg: '#6ABE39', wall: '#a1662f' },
    'volcanoes': { bg: '#4d1818', wall: '#3d1010' },
    'verb_volcanoes': { bg: '#4d1818', wall: '#3d1010' },
    'adjective_isles': { bg: 'bg-cyan-200', wall: '#a1662f' }, // needs theme
    'tense_tangled_forest': { bg: 'bg-slate-800', wall: '#a1662f' }, // needs theme
    'hub_main': { bg: 'bg-amber-100', wall: '#a1662f' },
    'well_of_words': { bg: 'bg-amber-100', wall: '#a1662f' },
    'endless_tower': { bg: 'bg-amber-100', wall: '#a1662f' },
    'collection_screen': { bg: 'bg-amber-100', wall: '#a1662f' },
};


// --- CONSTANTS for dynamic world ---
const ENEMY_SPEED_PATROL = 1;
const ENEMY_SPEED_CHASE = 1.8;
const ENEMY_HITBOX = { width: 44, height: 44 };
const KNOCKBACK_FORCE = 15;
const PROJECTILE_SPEED = 8;
const PORTAL_POSITION: PortalElement = { id: 'portal_gate', type: 'portal', x: 10, y: 1 };


const GameScreen: React.FC<GameScreenProps> = ({ children, location, className = '', map, gameState, onInteract, onPlayerDamage, onCombatStart, onAim, onFire, onProjectileHit }) => {
  const isProcedural = 'npc' in map;
  const themeKey = isProcedural ? map.theme : location;
  const theme = THEMES[themeKey] || THEMES['noun_meadows'];

  const playerSpawnPos = isProcedural ? (map as ProceduralLevelData).playerSpawn : (map as MapDefinition).playerStart;
  
  const enemiesSource = isProcedural ? map.enemies : gameState.worldProgress.noun_meadows?.enemies;
  const questItemsSource = isProcedural ? map.questItems : gameState.worldProgress.noun_meadows?.questItems;

  const [animEnemies, setAnimEnemies] = useState<EnemyState[]>([]);
  const [animProjectiles, setAnimProjectiles] = useState(gameState.activeProjectiles);

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
      if (enemiesSource) {
          setAnimEnemies(enemiesSource.filter(e => e.status !== 'defeated'));
      }
  }, [enemiesSource]);
  
  useEffect(() => {
      setAnimProjectiles(gameState.activeProjectiles);
  }, [gameState.activeProjectiles]);
  
  // Build the list of interactives dynamically
  const interactives = useMemo(() => {
    let dynamicInteractives: (QuestItemState & {type: 'quest_item'} | (InteractiveElement & { pos: {x:number, y:number} }) | { id: string, type: string, pos: { x: number; y: number; }})[] = [];
    const questIsComplete = isProcedural && gameState.proceduralQuest?.isComplete;

    if (isProcedural) {
        const proceduralMap = map as ProceduralLevelData;
        dynamicInteractives.push({ id: proceduralMap.npc.name, type: 'npc', pos: { x: proceduralMap.npc.position.x * proceduralMap.TILE_SIZE, y: proceduralMap.npc.position.y * proceduralMap.TILE_SIZE } });
        dynamicInteractives.push({ id: proceduralMap.guidingStone.lessonId, type: 'guiding_stone', pos: { x: proceduralMap.guidingStone.position.x * proceduralMap.TILE_SIZE, y: proceduralMap.guidingStone.position.y * proceduralMap.TILE_SIZE } });
        dynamicInteractives.push(...questItemsSource?.map(item => ({ ...item, type: 'quest_item' as const })) || []);
        if (questIsComplete) {
            // Use the guaranteed exit position from the level data.
            const exitPos = proceduralMap.exitPosition;
            dynamicInteractives.push({ id: 'gauntlet_exit_portal', type: 'portal', pos: { x: exitPos.x * proceduralMap.TILE_SIZE, y: exitPos.y * proceduralMap.TILE_SIZE } });
        }
    } else { // Static maps
        const staticInteractives = (map as MapDefinition).interactives;
        dynamicInteractives.push(...staticInteractives.map(i => ({...i, pos: {x: i.x * map.TILE_SIZE, y: i.y * map.TILE_SIZE}})));
        dynamicInteractives.push(...questItemsSource?.map(item => ({ ...item, type: 'quest_item' as const })) || []);

        if (location === 'noun_meadows' && gameState.worldProgress.noun_meadows?.isPortalSpawned) {
            dynamicInteractives.push({ id: PORTAL_POSITION.id, type: 'portal', pos: { x: PORTAL_POSITION.x * map.TILE_SIZE, y: PORTAL_POSITION.y * map.TILE_SIZE }});
        }
    }
    return dynamicInteractives;
  }, [map, questItemsSource, gameState.worldProgress.noun_meadows?.isPortalSpawned, gameState.proceduralQuest?.isComplete, location, isProcedural]);

  const { position: playerPosition, direction, isMoving, closestInteractive } = usePlayerMovement(map, interactives, animEnemies, onInteract, onCombatStart, gameState.isGamePaused || gameState.isAiming, gameState.isAiming, onAim, () => onFire(playerPosition), playerSpawnPos);
  
  const isCollidingWithWall = useCallback((x: number, y: number) => {
      const tileX = Math.floor(x / map.TILE_SIZE);
      const tileY = Math.floor(y / map.TILE_SIZE);
      if (tileY < 0 || tileY >= map.layout.length || tileX < 0 || tileX >= map.layout[0].length) {
          return true; // Out of bounds
      }
      return map.layout[tileY][tileX] === 1;
  }, [map.layout, map.TILE_SIZE]);


  const gameLoop = useCallback(() => {
      const isLoopPaused = gameState.isGamePaused || 
                         gameState.isAiming || 
                         gameState.activeCombat.isActive || 
                         gameState.activePuzzle.isActive || 
                         gameState.activeTimePuzzle.isActive || 
                         gameState.activeLesson !== null;

      if (!isLoopPaused) {
          const playerCenter = { x: playerPosition.x + PLAYER_WIDTH / 2, y: playerPosition.y + PLAYER_HEIGHT / 2 };

          setAnimEnemies(prevEnemies => prevEnemies.map(enemy => {
              if (enemy.status === 'defeated') return enemy;

              let { x, y } = enemy.position;
              let newStatus = enemy.status;
              let newDirection = enemy.direction;
              const DETECTION_RADIUS = 250;
              const distanceToPlayer = Math.hypot(playerCenter.x - (x + ENEMY_HITBOX.width / 2), playerCenter.y - (y + ENEMY_HITBOX.height / 2));

              if (distanceToPlayer < DETECTION_RADIUS) newStatus = 'chasing';
              else newStatus = 'patrolling';
              
              if (newStatus === 'patrolling') {
                  const speed = ENEMY_SPEED_PATROL;
                  if (newDirection === 'right') { x += speed; if (x > enemy.startPos.x + enemy.patrolRange) newDirection = 'left'; } 
                  else { x -= speed; if (x < enemy.startPos.x - enemy.patrolRange) newDirection = 'right'; }
              } else { // Chasing
                  const speed = ENEMY_SPEED_CHASE;
                  const angle = Math.atan2(playerCenter.y - (y + ENEMY_HITBOX.height / 2), playerCenter.x - (x + ENEMY_HITBOX.width / 2));
                  x += Math.cos(angle) * speed;
                  y += Math.sin(angle) * speed;
                  newDirection = (playerCenter.x < x) ? 'left' : 'right';
              }
              
              let newVx = enemy.vx * 0.8; let newVy = enemy.vy * 0.8;
              if (Math.abs(newVx) < 0.1) newVx = 0; if (Math.abs(newVy) < 0.1) newVy = 0;
              x += newVx; y += newVy;
              
              if (!gameState.isPlayerInvincible && x < playerPosition.x + PLAYER_WIDTH && x + ENEMY_HITBOX.width > playerPosition.x && y < playerPosition.y + PLAYER_HEIGHT && y + ENEMY_HITBOX.height > playerPosition.y) {
                  onPlayerDamage();
                  const angle = Math.atan2(y - playerPosition.y, x - playerPosition.x);
                  newVx = Math.cos(angle) * KNOCKBACK_FORCE;
                  newVy = Math.sin(angle) * KNOCKBACK_FORCE;
              }

              return { ...enemy, position: { x, y }, status: newStatus, direction: newDirection, vx: newVx, vy: newVy };
          }));

          // --- Projectile Logic ---
          setAnimProjectiles(prevProjectiles => {
              const updatedProjectiles = prevProjectiles.map(proj => {
                  const newPos = {
                      x: proj.pos.x + Math.cos(proj.angle * Math.PI / 180) * PROJECTILE_SPEED,
                      y: proj.pos.y + Math.sin(proj.angle * Math.PI / 180) * PROJECTILE_SPEED,
                  };
                  if (isCollidingWithWall(newPos.x, newPos.y)) {
                      onProjectileHit(proj.id, null);
                      return null;
                  }
                  let hitEnemy = null;
                  for (const enemy of animEnemies) {
                      if (newPos.x > enemy.position.x && newPos.x < enemy.position.x + ENEMY_HITBOX.width && newPos.y > enemy.position.y && newPos.y < enemy.position.y + ENEMY_HITBOX.height) {
                          hitEnemy = enemy;
                          break;
                      }
                  }
                  if (hitEnemy) {
                      onProjectileHit(proj.id, hitEnemy.id);
                      return null;
                  }
                  return { ...proj, pos: newPos };
              });
              return updatedProjectiles.filter(Boolean) as any;
          });
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [
      gameState.isGamePaused, 
      gameState.isAiming, 
      gameState.isPlayerInvincible, 
      gameState.activeCombat.isActive,
      gameState.activePuzzle.isActive,
      gameState.activeTimePuzzle.isActive,
      gameState.activeLesson,
      playerPosition, 
      onPlayerDamage, 
      onProjectileHit, 
      isCollidingWithWall, 
      animEnemies
  ]);


  useEffect(() => {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return () => {
          if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
          }
      };
  }, [gameLoop]);

  return (
      <main className={`relative w-full h-screen overflow-hidden pt-16 transition-all duration-1000 ${className}`} style={{ backgroundColor: theme.bg }}>
          <div className="relative" style={{ width: map.layout[0].length * map.TILE_SIZE, height: map.layout.length * map.TILE_SIZE, transform: `translate(${-playerPosition.x + (window.innerWidth/2) - (PLAYER_WIDTH/2)}px, ${-playerPosition.y + (window.innerHeight/2) - (PLAYER_HEIGHT/2)}px)` }}>
              {/* Render non-interactive children for static worlds */}
              {children}
              
              {/* Map Tiles */}
              {map.layout.map((row, y) => (
                  row.map((tile, x) => (
                      tile !== 0 && (
                          <div key={`${x}-${y}`} className="absolute" style={{ left: x * map.TILE_SIZE, top: y * map.TILE_SIZE, width: map.TILE_SIZE, height: map.TILE_SIZE, backgroundColor: theme.wall, boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)' }} />
                      )
                  ))
              ))}

              {/* Render based on map type */}
              {isProcedural ? (
                  <>
                      <div style={{ position: 'absolute', left: map.npc.position.x * map.TILE_SIZE, top: map.npc.position.y * map.TILE_SIZE, zIndex: 1 }}>
                          <NPC name={map.npc.name} showPrompt={closestInteractive?.id === map.npc.name} />
                      </div>
                      <div style={{ position: 'absolute', left: map.guidingStone.position.x * map.TILE_SIZE, top: map.guidingStone.position.y * map.TILE_SIZE, zIndex: 1 }}>
                          <GuidingStone lessonId={map.guidingStone.lessonId} showPrompt={closestInteractive?.id === map.guidingStone.lessonId} />
                      </div>
                      {gameState.proceduralQuest?.isComplete && (
                           <div style={{ position: 'absolute', left: (map as ProceduralLevelData).exitPosition.x * map.TILE_SIZE, top: (map as ProceduralLevelData).exitPosition.y * map.TILE_SIZE, zIndex: 1 }}>
                              <Portal showPrompt={closestInteractive?.id === 'gauntlet_exit_portal'} />
                          </div>
                      )}
                  </>
              ) : ( // Static maps (Noun Meadows)
                  <>
                      {(map as MapDefinition).interactives.filter(i => i.type !== 'quest_item').map(interactive => {
                          const positionStyle = { position: 'absolute' as const, left: interactive.x * map.TILE_SIZE, top: interactive.y * map.TILE_SIZE, zIndex: 1 };
                          if (interactive.type === 'npc') return <div style={positionStyle} key={interactive.id}><NPC name={(interactive as NpcElement).id} showPrompt={closestInteractive?.id === interactive.id} /></div>;
                          if (interactive.type === 'guiding_stone') return <div style={positionStyle} key={interactive.id}><GuidingStone lessonId={(interactive as GuidingStoneElement).lessonId} showPrompt={closestInteractive?.id === interactive.id} /></div>;
                          return null;
                      })}
                      {location === 'noun_meadows' && gameState.worldProgress.noun_meadows?.isPortalSpawned && (
                          <div style={{ position: 'absolute', left: PORTAL_POSITION.x * map.TILE_SIZE, top: PORTAL_POSITION.y * map.TILE_SIZE, zIndex: 1 }}>
                              <Portal showPrompt={closestInteractive?.id === PORTAL_POSITION.id} />
                          </div>
                      )}
                  </>
              )}
              
              {questItemsSource?.map(item => !item.isCollected && <div key={item.id} style={{ position: 'absolute' as const, left: item.pos.x, top: item.pos.y, zIndex: 1 }}><QuestItem itemName={item.name} showPrompt={closestInteractive?.id === item.id} /></div> )}
              
              {animEnemies.map(enemy => <div key={enemy.id} style={{ position: 'absolute', left: enemy.position.x, top: enemy.position.y, zIndex: 1 }}><Enemy status={enemy.status} direction={enemy.direction} type={enemy.type} /></div> )}
              
              {animProjectiles.map(proj => <Projectile key={proj.id} pos={proj.pos} />)}

              {gameState.koEffects.map(effect => <KOEffect key={effect.id} pos={effect.pos} />)}

              <div style={{ position: 'absolute', left: playerPosition.x, top: playerPosition.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, zIndex: 10 }}>
                <Player position={{x:0, y:0}} direction={direction} isMoving={isMoving} isInvincible={gameState.isPlayerInvincible} />
                {gameState.isAiming && <AimingArrow angle={gameState.aimingAngle}/>}
              </div>
          </div>
      </main>
  );
};

export default GameScreen;