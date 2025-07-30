import React from 'react';

interface ProjectileProps {
    pos: { x: number; y: number };
}

const Projectile: React.FC<ProjectileProps> = ({ pos }) => {
    return (
        <div
            className="absolute w-4 h-4 bg-cyan-300 rounded-full"
            style={{
                left: pos.x - 8,
                top: pos.y - 8,
                boxShadow: '0 0 15px 5px rgba(0, 255, 255, 0.7)',
                willChange: 'transform',
            }}
            aria-hidden="true"
        ></div>
    );
};

export default Projectile;