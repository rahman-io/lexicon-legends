import React from 'react';

interface AimingArrowProps {
  angle: number;
}

const AimingArrow: React.FC<AimingArrowProps> = ({ angle }) => {
  return (
    <div
      className="absolute top-1/2 left-1/2 w-32 h-2 origin-left -translate-y-1/2"
      style={{ 
        transform: `rotate(${angle}deg)`,
        willChange: 'transform'
      }}
    >
        <div className="w-full h-full bg-yellow-300/70 rounded-full shadow-[0_0_15px_rgba(253,249,156,0.9)]"></div>
        <div 
            className="absolute right-0 top-1/2 -translate-y-1/2"
            style={{
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '16px solid rgb(253 224 71)',
                transform: 'translateX(100%)'
            }}
        ></div>
    </div>
  );
};

export default AimingArrow;