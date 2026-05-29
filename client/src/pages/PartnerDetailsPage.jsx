import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, BedDouble, ShieldCheck, Sparkles, MapPin, Clock, Info, ChevronRight, 
    Play, Heart, Share2, Menu, Box, ShoppingBag 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const PartnerDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const venue = location.state?.venue || {
        name: "The Skyline Club",
        offer: "VIP Entry + 1 Drink",
        img: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80",
        color: "text-violet-400"
    };

    const [isLiked, setIsLiked] = useState(false);

    const handleShare = () => {
        if (venue && navigator.share) {
            navigator.share({
                title: venue.name,
                text: venue.offer,
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert('Sharing: ' + (venue?.name || 'Venue'));
        }
    };

    const [mediaItems] = useState([
        {
            id: 1,
            type: 'image',
            url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&q=80",
            title: "Last Friday's Neon Glow",
            description: "A breathtaking night with DJ Neon. The energy was electric from start to finish!",
            managerNote: "Next week we're doubling the laser count. Don't miss it!"
        },
        {
            id: 2,
            type: 'video',
            url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",
            title: "Signature Cocktail Prep",
            description: "Behind the scenes: Crafting the 'Green Emerald' - our top-rated mix.",
            managerNote: "Our mixologists use only organic mint from our local greenhouse."
        },
        {
            id: 3,
            type: 'image',
            url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
            title: "Vibe Check: Rooftop Lounge",
            description: "Unparalleled views and premium atmosphere. The perfect sunset spot.",
            managerNote: "Happy hour starts at 6:00 PM precisely. Get there early for the best view."
        },
        {
            id: 4,
            type: 'image',
            url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
            title: "The Gold Leaf Burger",
            description: "Our world-famous Wagyu burger with 24k gold leaf. A taste of pure luxury.",
            managerNote: "Available only on weekends. Booking highly recommended."
        }
    ]);

    const [activeMedia, setActiveMedia] = useState(mediaItems[0]);

    const isWashHub = venue.name.toLowerCase().includes('wash');
    const isHotel = venue.category === 'hotel' || venue.name.toLowerCase().includes('luxe') || venue.name.toLowerCase().includes('hotel');




    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-primary font-sans relative pb-24">
            {/* Hero Section */}
            <div className="relative h-[45vh] bg-[var(--bg-secondary)] overflow-hidden rounded-b-[4rem] shadow-2xl">
                <img src={venue.img} alt={venue.name} className="w-full h-full object-cover opacity-90 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <header className="absolute top-0 left-0 w-full p-6 pt-12 flex justify-between items-center z-20">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-12 h-12 bg-amber-400 text-black rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border-2 border-white/20 hover:bg-amber-300"
                        id="back-button"
                    >
                        <ArrowLeft size={24} strokeWidth={3} />
                    </button>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsLiked(!isLiked)}
                            title="Like Venue"
                            className={`w-12 h-12 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 transition-all active:scale-90 ${isLiked ? 'bg-white text-red-500 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-black/40 border-white/20 text-white hover:border-white/50'}`}
                        >
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
                        </button>
                        <button 
                            onClick={handleShare}
                            title="Share Venue"
                            className="w-12 h-12 bg-red-600 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border-2 border-white/20 hover:bg-red-500 active:scale-90 transition-all shadow-lg"
                        >
                            <Share2 size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </header>

                <div className="absolute bottom-10 left-0 w-full px-8 z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-brand/20 border border-brand/30 rounded-full">
                            <ShieldCheck size={12} className="text-brand" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand">Verified Partner</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">{venue.name}</h1>
                    <div className="flex items-center gap-4 mt-3 text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-brand" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">1.2 km away</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-brand" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Open until 04:00 AM</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-lg mx-auto space-y-10 -mt-6 relative z-20">
                {/* Reward Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[2.5rem] bg-brand text-black shadow-2xl shadow-brand/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Active Membership Reward</p>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">{venue.offer}</h2>
                    </div>
                    <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center">
                        <Sparkles size={24} />
                    </div>
                </motion.div>

                {/* Partner Feed */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                            <Play size={20} className="text-brand fill-brand" /> Live Feed
                        </h3>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Updates from Manager</span>
                    </div>

                    <motion.div key={activeMedia.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-[3rem] overflow-hidden bg-[var(--bg-secondary)] border border-white/5 aspect-video shadow-2xl">
                        <img src={activeMedia.url} alt={activeMedia.title} className="w-full h-full object-cover" />
                        {activeMedia.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-brand/90 flex items-center justify-center text-dark-950 shadow-2xl"><Play size={32} className="ml-1" /></div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full p-6">
                            <h4 className="text-lg font-black italic uppercase text-white leading-tight drop-shadow-md">{activeMedia.title}</h4>
                            <p className="text-[9px] font-bold text-gray-200 mt-1 uppercase tracking-wider line-clamp-2 drop-shadow-sm">{activeMedia.description}</p>
                        </div>
                    </motion.div>

                    <div className="p-6 bg-dark-900 border border-main rounded-[2.5rem] relative">
                        <div className="absolute -top-3 left-8 px-3 py-1 bg-brand text-black rounded-full text-[7px] font-black uppercase tracking-widest">Manager's Dispatch 💬</div>
                        <p className="text-[11px] font-bold italic text-primary leading-relaxed">{activeMedia.managerNote}</p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto no-scrollbar px-2">
                        {mediaItems.map((item) => (
                            <button key={item.id} onClick={() => setActiveMedia(item)} className={`flex-shrink-0 w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all ${activeMedia.id === item.id ? 'border-brand scale-105 shadow-lg shadow-brand/20' : 'border-main opacity-70 hover:opacity-100'}`}><img src={item.url} className="w-full h-full object-cover" /></button>
                        ))}
                    </div>
                </section>


                

                {/* Primary Action Section */}
                <section className="space-y-4">
                    <button 
                        onClick={() => navigate('/venue/menu', { state: { venueName: venue.name, venueOffer: venue.offer } })}
                        className="w-full p-6 bg-[var(--bg-secondary)] border border-brand/30 rounded-[3rem] flex items-center justify-between group hover:border-brand/60 transition-all shadow-xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                                <Menu size={28} />
                            </div>
                             <div className="text-left">
                                <h4 className="text-xl font-black italic uppercase tracking-tighter text-primary">OFFERS</h4>
                            </div>
                        </div>
                        <ChevronRight size={24} className="text-secondary group-hover:text-brand transition-colors" />
                    </button>
                </section>
            </div>
        </div>
    );
};

export default PartnerDetailsPage;
