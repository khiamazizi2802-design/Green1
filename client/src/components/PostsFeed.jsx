import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, UserPlus, ChevronRight, Heart, MessageCircle, Share2, Play, Plus, Zap, MapPin, Flag } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const PostsFeed = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const mockFriends = [
        { id: 'u1', name: 'Alex Night', handle: '@night_hawk', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
        { id: 'u2', name: 'Sara Luxe', handle: '@sara_zenith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara' }
    ];

    const [localPosts, setLocalPosts] = useState([]);

    React.useEffect(() => {
        const storedPosts = JSON.parse(localStorage.getItem('green_global_posts') || '[]');
        setLocalPosts(storedPosts);
    }, [isOpen]);

    const defaultPosts = [
        { id: 1, type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1002-large.mp4', user: 'StreetVibes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Street', likes: '12K', greenFlags: 842, caption: 'Cyber city vibes tonight. ⚡ #NeonRide' },
        { id: 101, type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-bartender-pouring-a-drink-into-a-glass-42544-large.mp4', user: 'SkylineBar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Skyline', likes: '840', greenFlags: 2150, caption: 'New Summer Cocktails are here! 🍹 #SkylineVibes', isBusiness: true },
        { id: 2, type: 'photo', url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1080&auto=format&fit=crop', user: 'ParisLover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paris', likes: '8.4K', greenFlags: 124, caption: 'Destination reached. The future is Green. 🗼' },
    ];

    const posts = [...localPosts, ...defaultPosts];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-[60] bg-black flex flex-col"
                >
                    {/* Top Controls */}
                    <header className="absolute top-0 left-0 right-0 pb-6 px-6 grid grid-cols-3 items-center z-[70] bg-gradient-to-b from-black/80 to-transparent" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
                        {/* Left: Search Bar */}
                        <div className="relative group">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-brand' : 'text-gray-500'}`} size={16} />
                            <input 
                                type="text"
                                placeholder="Search friends..."
                                value={searchQuery}
                                onFocus={() => setIsSearching(true)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-dark-900/40 backdrop-blur-xl border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black italic text-white placeholder:text-gray-600 focus:border-brand/40 outline-none transition-all"
                            />
                            
                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {isSearching && searchQuery.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-2 bg-dark-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 shadow-2xl z-[80] w-[280px] sm:w-[320px]"
                                    >
                                        {mockFriends.map(f => (
                                            <div key={f.id} className="p-3 flex items-center justify-between hover:bg-white/5 rounded-xl transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <img src={f.avatar} className="w-8 h-8 rounded-lg border border-white/10" alt="User" />
                                                    <div>
                                                        <p className="text-[10px] font-black italic text-white">{f.name}</p>
                                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{f.handle}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => { setIsSearching(false); setSearchQuery(''); }} 
                                                        className="h-9 w-9 bg-brand rounded-xl flex items-center justify-center text-dark-950 shadow-[0_0_15px_rgba(52,211,153,0.4)] hover:scale-110 active:scale-95 transition-all"
                                                        title="Add Friend"
                                                    >
                                                        <UserPlus size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => { setIsSearching(false); setSearchQuery(''); navigate(`/profile/${f.id}`); onClose(); }} 
                                                        className="h-9 w-9 bg-black border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                        title="View Profile"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Middle: Centered Tabs */}
                        <div className="flex items-center justify-center gap-6">
                            <span className="text-white text-sm font-black italic tracking-tighter opacity-70 cursor-pointer hover:opacity-100 transition-opacity">Following</span>
                            <span className="text-white text-sm font-black italic tracking-tighter underline decoration-brand decoration-[3px] underline-offset-8 cursor-pointer">For You</span>
                        </div>

                        {/* Right: Close Button */}
                        <div className="flex justify-end">
                            <button onClick={onClose} className="w-10 h-10 bg-dark-900/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:border-brand/40 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </header>

                    <div onClick={() => setIsSearching(false)} className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar">
                        {posts.map((post) => (
                            <div key={post.id} className="relative h-screen w-full snap-start">
                                {post.type === 'video' ? (
                                    <video
                                        src={post.url}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <img src={post.url} alt="Post" className="w-full h-full object-cover" />
                                )}

                                {/* Interaction Sidebar (Neon Wireframes) */}
                                <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-[70]">
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-dark-950 shadow-[0_0_20px_var(--brand-glow)] mb-4 animate-bounce"
                                    >
                                        <Plus size={28} />
                                    </button>
                                    <div className="flex flex-col items-center group">
                                        <div className="w-12 h-12 bg-black/60 backdrop-blur-md border border-brand/50 rounded-full flex items-center justify-center text-brand shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                            <Heart size={24} className="group-hover:fill-brand transition-all" />
                                        </div>
                                        <span className="text-[11px] font-black text-white mt-1.5 drop-shadow-lg">{post.likes}</span>
                                    </div>
                                    <div className="flex flex-col items-center group">
                                        <div className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white shadow-lg">
                                            <MessageCircle size={24} />
                                        </div>
                                        <span className="text-[11px] font-black text-white mt-1.5 drop-shadow-lg">1.2K</span>
                                    </div>
                                    <div className="flex flex-col items-center group">
                                        <div className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white shadow-lg">
                                            <Share2 size={24} />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black via-black/50 to-transparent z-[65]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl border border-brand p-0.5 bg-dark-900">
                                            <img src={post.avatar} alt="User" className="w-full h-full rounded-lg" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black italic tracking-tighter text-white">@{post.user}</span>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className={`text-[8px] ${post.isBusiness ? 'text-violet-400' : 'text-brand'} font-black uppercase tracking-widest flex items-center gap-1`}>
                                                    <div className={`w-1 h-1 ${post.isBusiness ? 'bg-violet-400' : 'bg-brand'} rounded-full animate-pulse`} /> {post.isBusiness ? 'Business Partner' : 'Official Pilot'}
                                                </span>
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                                                    <Flag size={8} className="text-emerald-500" fill="currentColor" />
                                                    <span className="text-[8px] font-black text-emerald-500">{post.greenFlags}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-200 font-medium leading-relaxed max-w-[80%]">{post.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Post Creation Modal */}
                    <AnimatePresence>
                        {isCreating && (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute inset-0 z-[80] bg-[var(--bg-primary)] flex flex-col"
                            >
                                <header className="pb-6 px-6 flex justify-between items-center border-b border-white/5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
                                    <button onClick={() => setIsCreating(false)} className="text-[var(--text-primary)] font-black uppercase text-xs tracking-widest">Cancel</button>
                                    <h3 className="font-black italic text-brand tracking-tighter uppercase">New Green Post</h3>
                                    <button disabled className="text-gray-600 font-black uppercase text-xs tracking-widest">Share</button>
                                </header>

                                <div className="flex-1 p-8 flex flex-col items-center justify-center gap-8">
                                    <div className="w-full aspect-square rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:border-brand/40 hover:text-brand transition-all cursor-pointer group">
                                        <div className="w-20 h-20 rounded-full bg-dark-900 border border-white/5 flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                                            <Zap size={40} />
                                        </div>
                                        <p className="font-black uppercase tracking-widest text-xs">Upload Photo or Video</p>
                                    </div>

                                    <textarea
                                        placeholder="Add a caption to your mission..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium text-[var(--text-primary)] resize-none h-32"
                                    />

                                    <div className="w-full flex gap-4">
                                        <div className="flex-1 p-4 bg-[var(--bg-secondary)] rounded-2xl border border-white/5 flex items-center gap-3">
                                            <MapPin size={20} className="text-brand" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Location</span>
                                        </div>
                                        <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-white/5">
                                            <Zap size={20} className="text-brand" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <button className="w-full py-6 bg-brand text-dark-950 rounded-3xl font-black uppercase tracking-[0.4em] italic text-sm shadow-[0_0_30px_rgba(50,205,50,0.3)]">
                                        Blast to Green
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PostsFeed;



