import os

path = r'C:\Users\AURUMPC\.gemini\antigravity\scratch\radar-ride\client\src\pages\ManagerDashboard.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Searching for the unique string in the header
target_str = 'Voucher <span className="text-brand">Terminal</span>'

if target_str in content:
    vt_idx = content.find(target_str)
    # Go back to the {view === 'qr-terminal' or similar view guard
    block_start = content.rfind('{view === ', 0, vt_idx)
    
    # Go forward to the end of that block
    block_end = content.find(')}', vt_idx)
    block_end = content.find(')}', block_end + 2) # end of motion.div
    block_end = content.find(')}', block_end + 2) # end of view block
    
    new_block = """{view === 'qr-dispatcher' && managerContext === 'PM' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center p-6 md:p-12">
                                        <div className="w-full max-w-2xl bg-dark-900 border-2 border-brand/20 rounded-[3.5rem] p-12 space-y-12 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] rounded-full" />
                                            
                                            <div className="text-center space-y-4">
                                                <div className="w-24 h-24 bg-brand/10 rounded-[2.5rem] flex items-center justify-center text-brand mx-auto shadow-[0_0_50px_rgba(33,255,165,0.2)]">
                                                    <QrCode size={48} />
                                                </div>
                                                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Access <span className="text-brand">Dispatcher</span></h2>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Encrypted QR Provisioning Hub</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Vehicle Plate #</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. B-G-2026"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-black italic focus:border-brand outline-none transition-all placeholder:text-gray-700"
                                                        id="plateInput"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Pass Duration</label>
                                                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black uppercase italic focus:border-brand outline-none transition-all appearance-none">
                                                        <option>2 Hours Access</option>
                                                        <option>Match Day (8h)</option>
                                                        <option>Unlimited VIP</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => {
                                                    const plate = document.getElementById('plateInput').value || 'GREEN-1';
                                                    localStorage.setItem('green_parking_pass', JSON.stringify({
                                                        id: 'PASS-' + Date.now(),
                                                        plate: plate,
                                                        venue: 'Eco-Park Central',
                                                        type: 'parking',
                                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    }));
                                                    alert('Access Pass Dispatched to Passenger Hub 🚀');
                                                }}
                                                className="w-full py-6 bg-brand text-dark-900 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.4em] shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                                            >
                                                Dispatch Access Pass <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'qr-dispatcher' && managerContext !== 'PM' && (
                                    <motion.div key="terminal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 max-w-4xl mx-auto">
                                        <div className="text-center space-y-4">
                                            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Voucher <span className="text-brand">Terminal</span></h1>
                                            <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em] italic leading-none">Scan Crew QR to authorize hospitality debt</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-24">
                                            <div className="relative aspect-square bg-dark-900 border-2 border-dashed border-white/10 rounded-[4rem] flex flex-col items-center justify-center group overflow-hidden">
                                                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Zap size={64} className="text-gray-700 group-hover:text-brand transition-all group-hover:scale-110" />
                                                <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Sensor Awaiting Handshake</p>
                                                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-brand/20 rounded-[4rem] transition-all" />
                                            </div>

                                            <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 space-y-8 flex flex-col justify-between">
                                                <div className="space-y-6">
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Optical Stream Log</h3>
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-relaxed">System ready for optical decryption. Please center the Passenger QR in the frame.</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => alert('Sensor Initialized...')} className="w-full py-6 bg-brand text-dark-900 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all">Initialize Sensor</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}"""
    
    final_content = content[:block_start] + new_block + content[block_end+2:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("Successfully updated QR view.")
else:
    print("Could not find target string in file.")
