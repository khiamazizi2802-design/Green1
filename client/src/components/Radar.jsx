import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

const Radar = ({ isOnline = false, hasUpdates = false }) => {
    const { drivers } = useSocket();
    
    // Generate static noise/particles for depth
    const particles = useMemo(() => [...Array(20)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 2
    })), []);

    // Tactical nodes (drivers)
    const nodes = drivers.map((driver, i) => ({
        id: driver.id,
        x: ((driver.lng - 13.405) * 10000) % 80 + 10,
        y: ((driver.lat - 52.52) * 10000) % 80 + 10,
        brand: driver.brand
    }));

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-transparent">
            
            {/* 1. PERSPECTIVE TACTICAL GRID */}
            <div className="absolute inset-0 perspective-[1000px] pointer-events-none">
                <motion.div 
                    initial={{ rotateX: 45, y: -50 }}
                    animate={{ 
                        rotateX: [45, 48, 45],
                        y: [-50, -40, -50]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center opacity-[0.07]"
                    style={{
                        backgroundImage: `linear-gradient(var(--accent-primary) 1px, transparent 1px), linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                        transformStyle: 'preserve-3d',
                        maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)'
                    }}
                />
            </div>

            {/* 2. ATMOSPHERIC SCAN LINES */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <motion.div 
                    animate={{ y: ['0%', '100%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-full h-32 bg-gradient-to-b from-transparent via-[var(--accent-primary)] to-transparent opacity-20"
                />
            </div>

            {/* 3. NEURAL NODES & CONNECTIONS */}
            <div className="absolute inset-0 z-10 p-12">
                {nodes.map((node, i) => (
                    <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        <div className="relative">
                            {/* Scanning Reticle */}
                            <div className="w-6 h-6 border border-[var(--accent-primary)]/30 rounded-sm absolute -inset-1 animate-spin-slow" />
                            <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full shadow-[0_0_15px_var(--accent-primary)]" />
                            
                            {/* Node Label (Removed per request) */}

                            {/* Connection Line (Synthetic) */}
                            {i > 0 && (
                                <div className="absolute w-[100px] h-[1px] bg-gradient-to-r from-[var(--accent-primary)]/20 to-transparent origin-left rotate-[45deg] opacity-20" />
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 4. CENTRAL COMMAND HUD */}
            <div className="relative z-20 flex flex-col items-center gap-4">
                <div className="relative">
                    {/* Pulsing Core */}
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -inset-12 rounded-full border border-[var(--accent-primary)]"
                    />
                    <div className="w-16 h-16 rounded-2xl border-2 border-[var(--accent-primary)]/40 flex items-center justify-center bg-black/20 backdrop-blur-xl rotate-45">
                        <div className="-rotate-45">
                             <div className="w-4 h-4 rounded-full bg-[var(--accent-primary)] shadow-[0_0_20px_var(--accent-primary)]" />
                        </div>
                    </div>
                </div>
                {/* Central Status Label (Removed per request) */}
            </div>

            <div className="absolute inset-0 p-8 pointer-events-none flex flex-col justify-between opacity-30">
                <div className="flex justify-between items-start">
                    {/* HUD Data Blocks (Removed per request) */}
                </div>
                <div className="flex justify-between items-end">
                    <div>{/* Status Line (Removed per request) */}</div>
                    <div className="text-right">
                        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-full h-full bg-[var(--accent-primary)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. AMBIENT PARTICLES */}
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: [0, 0.4, 0],
                        y: [-20, 20],
                        x: [-10, 10]
                    }}
                    transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
                    className="absolute w-0.5 h-0.5 bg-white rounded-full"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                />
            ))}
        </div>
    );
};

export default Radar;
