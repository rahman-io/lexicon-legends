
import React from 'react';

interface PlayerProps {
  position: { x: number; y: number };
  direction: string;
  isMoving: boolean;
  isInvincible: boolean;
}

const Player: React.FC<PlayerProps> = ({ position, direction, isMoving, isInvincible }) => {
  const directionClasses: Record<string, string> = {
    down: 'face-down',
    up: 'face-up',
    left: 'face-left',
    right: 'face-right',
  };

  return (
    <>
    <style>{`
      .player-sprite {
        width: 40px;
        height: 48px;
        transition: transform 0.1s linear;
      }
      .player-body {
        position: absolute;
        bottom: 0;
        left: 5px;
        width: 30px;
        height: 35px;
        background-color: #4A90E2; /* Traveler's Blue Tunic */
        border-radius: 10px 10px 4px 4px;
        border: 2px solid #3666A3;
      }
      .player-head {
        position: absolute;
        top: 0;
        left: 8px;
        width: 24px;
        height: 24px;
        background-color: #F8D4AB; /* Skin Tone */
        border-radius: 50%;
        border: 2px solid #D9A477;
      }
      .player-eyes {
        position: absolute;
        width: 4px;
        height: 4px;
        background-color: #222;
        border-radius: 50%;
        transition: all 0.1s;
      }
      .face-down .player-eyes { top: 12px; left: 9px; }
      .face-up .player-eyes { top: 6px; left: 9px; }
      .face-left .player-eyes { top: 10px; left: 4px; }
      .face-right .player-eyes { top: 10px; left: 14px; }
      
      .moving {
        animation: walk-bob 0.4s infinite;
      }

      .invincible {
        animation: blink 1.5s linear infinite;
      }

      @keyframes walk-bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `}</style>
    <div
      className={`player-sprite absolute ${directionClasses[direction]} ${isMoving ? 'moving' : ''} ${isInvincible ? 'invincible' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        willChange: 'transform',
      }}
      aria-label="Player character"
    >
        <div className="player-body"></div>
        <div className="player-head">
            <div className="player-eyes"></div>
        </div>
    </div>
    </>
  );
};

export default Player;