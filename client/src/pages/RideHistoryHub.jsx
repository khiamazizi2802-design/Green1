import React from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Clock, MapPin, User, Zap, 
    Shield, History, TrendingUp, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RideHistoryHub = () => {
    const navigate = useNavigate();

    const rideHistory = [
        { id: 1, service: 'CYBERDISPATCH', date: 'TODAY, 18:42', price: '€ 14.20', destination: 'Cyber Terrace 42', driver: 'SERGEI K.', icon: Zap },
        { id: 2, service: 'PREMIUM RIDE', date: 'YESTERDAY, 21:15', price: '€ 22.50', destination: 'Neo Tokyo Central', driver: 'ELENA R.', icon: Shield },
        { id: 3, service: 'CLASSIC', date: '14 FEB, 09:30', price: '€ 8.90', destination: 'Uplink Tower', driver: 'MARCUS V.', icon: Clock }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans relative pb-32 transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 p-6 flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-black shadow-sm active:scale-95 transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black italic tracking-tighter uppercase text-black">Ride History</h1>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 mt-0.5">Fleet Mission Log</p>
                </div>
                <div className="w-12 h-12 bg-black/5 border border-black/10 rounded-2xl flex items-center justify-center text-black">
                    <History size={24} />
                </div>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-10 pt-8">
                {/* Stats Section */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="p-8 bg-black border border-black/10 rounded-[2.5rem] relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <TrendingUp size={60} className="text-brand" />
                        </div>
                        <div className="relative z-10 text-center space-y-2">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand">Fleet Stats ⚡</p>
                            <h2 className="text-4xl font-black italic tracking-tighter text-white">{rideHistory.length}</h2>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Total Trips</p>
                        </div>
                    </div>
                    <div className="p-8 bg-black border border-black/10 rounded-[2.5rem] relative shadow-[0_20px_50_rgba(0,0,0,0.1)] overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Trophy size={60} className="text-brand" />
                        </div>
                        <div className="relative z-10 text-center space-y-2">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand">Network Tier 💎</p>
                            <h2 className="text-2xl font-black italic tracking-tighter text-white">JAN '24</h2>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Member Since</p>
                        </div>
                    </div>
                </section>

                {/* Past Services List */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 px-2 italic">Past Services</h3>
                    <div className="space-y-4">
                        {rideHistory.map((ride, i) => (
                            <motion.div 
                                key={ride.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white border border-black/5 rounded-[2.5rem] p-8 group hover:border-black/20 transition-all shadow-[0_15px_35px_rgba(0,0,0,0.05)]"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-black border border-black/5 group-hover:scale-110 transition-transform">
                                            <ride.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black italic tracking-widest text-black uppercase">{ride.service}</h4>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{ride.date}</p>
                                        </div>
                                    </div>
                                    <p className="text-base font-black italic text-black">{ride.price}</p>
                                </div>
                                
                                <div className="space-y-4 pt-6 border-t border-black/5">
                                    <div className="flex items-center gap-3">
                                        <MapPin size={14} className="text-gray-400" />
                                        <p className="text-sm font-black italic text-gray-700 uppercase tracking-tight">{ride.destination}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <User size={14} className="text-gray-400" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Driver: {ride.driver}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/90 to-transparent">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-full py-6 bg-black text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Return to Mission Hub
                </button>
            </div>
        </div>
    );
};

export default RideHistoryHub;
