import React from 'react';

interface KOEffectProps {
  pos: { x: number; y: number };
}

const KOEffect: React.FC<KOEffectProps> = ({ pos }) => {
  return (
    <>
      <style>{`
        @keyframes ko-effect {
          0% { transform: scale(0.5) translateY(10px); opacity: 0; }
          40% { transform: scale(1.2) translateY(0); opacity: 1; }
          60% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(-20px); opacity: 0; }
        }
        .animate-ko {
          animation: ko-effect 1.5s ease-out forwards;
          text-shadow: 0 0 5px #000, 0 0 10px #000, 0 0 15px #000;
        }
      `}</style>
      <div
        className="absolute text-5xl font-black text-yellow-300 animate-ko"
        style={{
          left: pos.x,
          top: pos.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        K.O.!
      </div>
    </>
  );
};

export default KOEffect;