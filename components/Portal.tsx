import React from 'react';

interface PortalProps {
  showPrompt: boolean;
}

const Portal: React.FC<PortalProps> = ({ showPrompt }) => {
  return (
    <>
      <style>{`
        @keyframes rotate-portal {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-portal-glow {
          0%, 100% { box-shadow: 0 0 20px 5px #a855f7, inset 0 0 15px 3px #c084fc; opacity: 0.9; }
          50% { box-shadow: 0 0 30px 10px #a855f7, inset 0 0 20px 5px #c084fc; opacity: 1; }
        }
        @keyframes swirl-particles {
          from { transform: rotate(0deg) scale(1); opacity: 1; }
          to { transform: rotate(360deg) scale(0); opacity: 0; }
        }
        .portal-container {
          width: 80px;
          height: 100px;
        }
        .portal-vortex {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, #3b0764 0%, #1e1b4b 60%);
          border-radius: 50% / 60%;
          animation: pulse-portal-glow 3s ease-in-out infinite;
        }
        .portal-ring {
          position: absolute;
          inset: -8px;
          border: 4px solid #c084fc;
          border-radius: 50% / 60%;
          animation: rotate-portal 10s linear infinite;
        }
        .portal-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #f0abfc;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform-origin: 0 0;
        }
      `}</style>
      <div 
        className="flex flex-col items-center group relative portal-container"
        aria-label="Enter Portal"
      >
        {showPrompt && (
          <div className="absolute -top-10 bg-white text-gray-800 font-bold px-3 py-1 rounded-full shadow-lg animate-bounce z-10">
            E
          </div>
        )}
        <div className="w-full h-full relative cursor-pointer group">
            <div className="portal-vortex"></div>
            <div className="portal-ring"></div>
            {Array.from({ length: 15 }).map((_, i) => {
                const angle = i * 24;
                const duration = 2 + Math.random() * 3;
                const delay = Math.random() * duration;
                return (
                    <div 
                        key={i} 
                        className="portal-particle"
                        style={{ 
                            transform: `rotate(${angle}deg) translateX(35px)`, 
                            animation: `swirl-particles ${duration}s linear infinite`,
                            animationDelay: `${delay}s`
                        }}
                    ></div>
                )
            })}
        </div>
      </div>
    </>
  );
};

export default Portal;
