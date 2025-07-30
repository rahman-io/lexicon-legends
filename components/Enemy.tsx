import React from 'react';

interface EnemyProps {
  status: 'patrolling' | 'chasing' | 'defeated';
  direction: 'left' | 'right';
  type: 'article_imp' | 'tense_terror' | string;
}

const ENEMY_VISUALS: Record<string, { body: string, border: string, horn: string }> = {
    'article_imp': {
        body: '#D0021B', // Red
        border: '#8B0000',
        horn: '#555'
    },
    'tense_terror': {
        body: '#4A00E0', // Purple
        border: '#2A0080',
        horn: '#DDD'
    }
};

const Enemy: React.FC<EnemyProps> = ({ status, direction, type }) => {
  const statusClass = `status-${status}`;
  const directionClass = direction === 'left' ? 'scale-x-[-1]' : '';
  const visuals = ENEMY_VISUALS[type] || ENEMY_VISUALS['article_imp'];

  return (
    <>
    <style>{`
      .enemy-sprite {
        width: 44px;
        height: 44px;
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
      }
      .enemy-body {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 3px solid;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .enemy-eyes {
        width: 60%;
        height: 15px;
        background-color: #FFC107;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        overflow: hidden;
      }
      .enemy-pupil {
        width: 8px;
        height: 8px;
        background-color: black;
        border-radius: 50%;
      }
      .enemy-horns {
        position: absolute;
        top: -8px;
        width: 8px;
        height: 12px;
        border-radius: 4px 4px 0 0;
      }
      .horn-left { left: 8px; }
      .horn-right { right: 8px; }

      .status-chasing .enemy-body {
        animation: chase-pulse 0.5s infinite;
      }

      .status-defeated {
        opacity: 0;
        transform: scale(0.5) rotate(720deg);
      }
      
      @keyframes chase-pulse {
        50% { transform: scale(1.1); }
      }
    `}</style>
    <div className={`enemy-sprite relative ${statusClass}`}>
      <div 
        className={`enemy-body transform ${directionClass}`} 
        style={{ backgroundColor: visuals.body, borderColor: visuals.border }}
      >
        <div className="enemy-horns horn-left" style={{ backgroundColor: visuals.horn }}></div>
        <div className="enemy-horns horn-right" style={{ backgroundColor: visuals.horn }}></div>
        <div className="enemy-eyes">
          <div className="enemy-pupil"></div>
          <div className="enemy-pupil"></div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Enemy;