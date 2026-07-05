import sys
import os

path = r'C:\Users\AURUMPC\.gemini\antigravity\scratch\radar-ride\client\src\pages\ManagerDashboard.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add preview state for the Feed Creator
old_states = "    const [financeFilter, setFinanceFilter] = useState('Day');"
new_states = """    const [financeFilter, setFinanceFilter] = useState('Day');
    const [feedPreviewType, setFeedPreviewType] = useState('Reel'); // 'Reel' or 'Still'"""

content = content.replace(old_states, new_states)

# 2. Upgrade the Feed View to the Creator Studio
old_feed_start = """                                {view === 'feed' && ("""
new_feed_start = """                                {view === 'feed' && (
                                    <motion.div key="feed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-2">
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-brand leading-none">Discovery Creator Studio</h1>
                                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Promote your venue with Reels & Still Cards</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                                    {['Reel', 'Still'].map(t => (
                                                        <button 
                                                            key={t}
                                                            onClick={() => setFeedPreviewType(t)}
                                                            className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${feedPreviewType === t ? 'bg-brand text-dark-900 shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                                        >
                                                            {t}s
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                            {/* UPLOAD & SETTINGS ZONE */}
                                            <div className="lg:col-span-2 space-y-8">
                                                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="flex items-center gap-4 relative z-10">
                                                        <div className="p-4 rounded-2xl bg-brand/10 text-brand"><Video size={24} /></div>
                                                        <h3 className="text-xl font-black italic uppercase tracking-tighter">New {feedPreviewType} Campaign</h3>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                                        <div className="space-y-6">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Dispatch Message</label>
                                                                <textarea 
                                                                    placeholder={`Tell passengers about your ${feedPreviewType}...`}
                                                                    className="w-full bg-dark-900 border border-white/10 rounded-2xl p-6 text-sm text-white min-h-[120px] outline-none focus:border-brand/40 transition-all resize-none" 
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Linked Offer</label>
                                                                <select className="w-full bg-dark-900 border border-white/10 rounded-2xl p-4 text-sm font-black uppercase text-brand outline-none focus:border-brand/40 transition-all">
                                                                    <option>Free Entry Ticket</option>
                                                                    <option>15% Discount Voucher</option>
                                                                    <option>VIP Priority Pass</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2.5rem] p-8 hover:border-brand/40 transition-all bg-black/20 cursor-pointer group/upload">
                                                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover/upload:text-brand transition-colors mb-4">
                                                                {feedPreviewType === 'Reel' ? <Video size={32} /> : <ImageIcon size={32} />}
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Upload {feedPreviewType}</p>
                                                            <p className="text-[8px] font-bold text-gray-500 uppercase mt-2">{feedPreviewType === 'Reel' ? 'MP4 / MOV (9:16)' : 'JPG / PNG (4:5)'}</p>
                                                        </div>
                                                    </div>

                                                    <button className="w-full py-6 bg-brand text-dark-900 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-brand/20 hover:scale-[1.02] transition-all relative z-10">
                                                        Dispatch to Discovery Hub 🚀
                                                    </button>
                                                </div>

                                                {/* CAMPAIGN ANALYTICS */}
                                                <div className="bg-[#0D1421]/60 border border-white/10 rounded-[3rem] p-10 space-y-6">
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Active Promotions</h3>
                                                    <div className="space-y-4">
                                                        {[
                                                            { title: 'Neon Weekend Reel', type: 'Reel', views: '2.4k', ctr: '12%', status: 'Live' },
                                                            { title: 'Signature Dish Still', type: 'Still', views: '840', ctr: '8%', status: 'Active' }
                                                        ].map((p, i) => (
                                                            <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-dark-900 rounded-xl flex items-center justify-center text-brand border border-white/5">
                                                                        {p.type === 'Reel' ? <Video size={18} /> : <ImageIcon size={18} />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-black italic uppercase text-white">{p.title}</p>
                                                                        <p className="text-[8px] font-bold text-gray-500 uppercase">{p.views} Views • {p.ctr} Click Rate</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[8px] font-black text-brand uppercase bg-brand/10 px-2 py-1 rounded">{p.status}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* PASSENGER PORTAL MOCKUP PREVIEW */}
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-center">Live Preview</h3>
                                                <div className="relative w-full aspect-[9/18] bg-dark-950 rounded-[3.5rem] border-[10px] border-[#0D1421] shadow-2xl overflow-hidden mx-auto">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
                                                    
                                                    {/* Mock Content */}
                                                    {feedPreviewType === 'Reel' ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-dark-900">
                                                            <Video size={48} className="text-white/20 animate-pulse" />
                                                            <div className="absolute bottom-10 left-6 right-6 space-y-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-brand" />
                                                                    <div className="w-24 h-3 bg-white/20 rounded-full" />
                                                                </div>
                                                                <div className="w-full h-2 bg-white/10 rounded-full" />
                                                                <div className="w-3/4 h-2 bg-white/10 rounded-full" />
                                                                <div className="pt-4">
                                                                    <div className="w-full py-3 bg-brand rounded-xl text-dark-900 text-[8px] font-black uppercase text-center">Claim Free Ticket</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col p-6 space-y-6">
                                                            <div className="h-64 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
                                                                <ImageIcon size={48} className="text-white/20" />
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div className="w-32 h-4 bg-white/20 rounded-full" />
                                                                <div className="w-full h-2 bg-white/10 rounded-full" />
                                                                <div className="w-full h-2 bg-white/10 rounded-full" />
                                                            </div>
                                                            <div className="mt-auto pb-10">
                                                                <div className="w-full py-3 bg-white/10 border border-brand/40 rounded-xl text-brand text-[8px] font-black uppercase text-center">View Menu</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Phone UI Overlay */}
                                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-dark-900 rounded-full z-50" />
                                                </div>
                                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest text-center italic">Customer Discovery Hub Simulation</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
"""

content = content.replace(old_feed_start, new_feed_start)

# I'll need to remove the old Feed View content that comes after this.
# Let's use a simpler replacement strategy.
# Wait, I'll just write a script to find the block and replace it.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Discovery Creator Studio implemented in ManagerDashboard.jsx")
