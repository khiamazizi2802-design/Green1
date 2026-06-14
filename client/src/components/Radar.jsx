import React from 'react';
import { motion } from 'framer-motion';

const Radar = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-white">
            
            {/* 1. PERSPECTIVE TACTICAL GRID */}
            <div className="absolute inset-0 perspective-[800px] pointer-events-none">
                <motion.div 
                    initial={{ rotateX: 60, y: -80 }}
                    animate={{ 
                        rotateX: [60, 62, 60],
                        y: [-80, -75, -80]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
                        backgroundSize: '45px 45px',
                        transformStyle: 'preserve-3d',
                        maskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)'
                    }}
                />
            </div>

            {/* 2. CENTRAL COMMAND HUD */}
            <div className="relative z-20 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                    {/* Concentric Circle Bubble 1 */}
                    <motion.div 
                        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                        className="absolute w-36 h-36 rounded-full border border-black/10"
                    />
                    {/* Concentric Circle Bubble 2 */}
                    <motion.div 
                        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 2 }}
                        className="absolute w-36 h-36 rounded-full border border-black/10"
                    />
                    {/* Static Outer Ring */}
                    <div className="absolute w-36 h-36 rounded-full border border-black/5" />
                    
                    {/* Diamond Reticle */}
                    <div className="w-14 h-14 rounded-[1.25rem] border border-black/20 flex items-center justify-center bg-black/[0.04] shadow-sm rotate-45">
                        <div className="w-3.5 h-3.5 rounded-full bg-black" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Radar;
