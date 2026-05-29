import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Upload, FileText, Image as ImageIcon, Camera, Plus, Trash2, 
    CheckCircle, XCircle, ArrowLeft, Loader2, Edit3, Save, ChevronRight,
    Utensils, Coffee, Wine, Package, PlusCircle, Sparkles, Clock, Users,
    Target, TrendingUp, Box, MapPin, Zap, Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MenuManagement = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState('initial'); // initial, processing, review, manual
    const [uploadType, setUploadType] = useState(null); // 'pdf', 'image'
    const [scannedItems, setScannedItems] = useState([]);
    const [manualItems, setManualItems] = useState([]);
    const [managerContext] = useState(localStorage.getItem('green_manager_context') || 'RM');
    const [config, setConfig] = useState({
        capacity: managerContext === 'WM' ? 4 : managerContext === 'PM' ? 200 : 30,
        standingCapacity: (managerContext === 'BM' || managerContext === 'CM') ? 100 : 0,
        openTime: '08:00',
        closeTime: '22:00'
    });
    const [isConfigEditing, setIsConfigEditing] = useState(false);

    const [currentManualItem, setCurrentManualItem] = useState({
        name: '',
        price: '',
        category: 'Food',
        description: '',
        image: null
    });

    const getMonthlyForecast = () => {
        const hours = parseInt(config.closeTime.split(':')[0]) - parseInt(config.openTime.split(':')[0]);
        const totalBaseCapacity = config.capacity + (config.standingCapacity || 0);
        const dailyPotential = totalBaseCapacity * hours * (managerContext === 'WM' ? 4 : 1.5);
        const monthlyPotential = dailyPotential * 30;
        
        const goods = managerContext === 'WM' ? [
            { name: 'Soap Concentrate', amount: `${(monthlyPotential * 0.2).toFixed(1)}L`, status: 'Order Required' },
            { name: 'Wax Polish', amount: `${(monthlyPotential * 0.05).toFixed(1)}L`, status: 'Healthy' },
            { name: 'Microfiber Towels', amount: `${(monthlyPotential * 0.1).toFixed(0)} Units`, status: 'Healthy' }
        ] : managerContext === 'PM' ? [
            { name: 'QR Thermal Paper', amount: '12 Rolls', status: 'Order Required' },
            { name: 'EV Charger Cleaning', amount: '4 Kits', status: 'Healthy' },
            { name: 'Bay Marking Paint', amount: '2 Cans', status: 'Healthy' }
        ] : [
            { name: 'Base Ingredients', amount: '€4,200 Est.', status: 'Order Required' },
            { name: 'Beverage Stock', amount: '820 Units', status: 'Healthy' },
            { name: 'Cleaning Supplies', amount: '12 Kits', status: 'Healthy' }
        ];

        return { monthlyPotential, goods };
    };

    const forecast = getMonthlyForecast();

    // Mock AI Scan Result
    const mockScan = () => {
        setStep('processing');
        setTimeout(() => {
            setScannedItems([
                { id: 1, name: 'Truffle Burger', price: '18.50', category: 'Main', status: 'verified' },
                { id: 2, name: 'Crispy Fries', price: '6.00', category: 'Side', status: 'verified' },
                { id: 3, name: 'Green Garden Salad', price: '12.00', category: 'Appetizer', status: 'verified' },
                { id: 4, name: 'Classic Mojito', price: '11.00', category: 'Drinks', status: 'flagged', reason: 'Price blurry' }
            ]);
            setStep('review');
        }, 2500);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadType(file.type.includes('pdf') ? 'pdf' : 'image');
        mockScan();
    };

    const addManualItem = () => {
        if (!currentManualItem.name || !currentManualItem.price) return;
        setManualItems([...manualItems, { ...currentManualItem, id: Date.now() }]);
        setCurrentManualItem({
            name: '',
            price: '',
            category: 'Food',
            description: '',
            image: null
        });
    };

    const removeItem = (id, type) => {
        if (type === 'scanned') setScannedItems(scannedItems.filter(item => item.id !== id));
        else setManualItems(manualItems.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#05080F] text-white font-sans p-6 md:p-12 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-mid/5 blur-[120px] rounded-full" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button 
                        onClick={() => step === 'initial' ? navigate('/manager') : setStep('initial')}
                        className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand/40 transition-all shadow-xl"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-center">
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Intelligence <span className="text-brand">& Catalog</span></h1>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">AI-Driven Operational Scaling</p>
                    </div>
                    <div className="w-12" />
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 0: OPERATIONAL CONFIG & AI INSIGHTS */}
                    {step === 'initial' && (
                        <motion.div 
                            key="config-hub"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            {/* CONFIGURATION CARD */}
                            <div className="bg-dark-900 border border-white/5 rounded-[3rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-20 -mt-20" />
                                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                                    <div className="space-y-6 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand"><Target size={20} /></div>
                                            <h3 className="text-xl font-black italic uppercase">Business <span className="text-brand">Scale</span></h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                                                    {managerContext === 'PM' ? 'Total Spots' : managerContext === 'WM' ? 'Wash Bays' : 'Total Tables'}
                                                </label>
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={config.capacity}
                                                        onChange={(e) => setConfig({...config, capacity: parseInt(e.target.value) || 0})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-black italic text-brand focus:border-brand/40 outline-none"
                                                    />
                                                    <Users size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                                </div>
                                            </div>
                                            {(managerContext === 'BM' || managerContext === 'CM') && (
                                                <div className="space-y-2">
                                                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Standing Capacity</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            value={config.standingCapacity}
                                                            onChange={(e) => setConfig({...config, standingCapacity: parseInt(e.target.value) || 0})}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-black italic text-brand focus:border-brand/40 outline-none"
                                                        />
                                                        <Users size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Operating Window</label>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={config.openTime}
                                                        onChange={(e) => setConfig({...config, openTime: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black text-center focus:border-brand/40 outline-none"
                                                    />
                                                    <span className="text-gray-600">-</span>
                                                    <input 
                                                        type="text" 
                                                        value={config.closeTime}
                                                        onChange={(e) => setConfig({...config, closeTime: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black text-center focus:border-brand/40 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-80 bg-brand/5 border border-brand/20 rounded-[2.5rem] p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-brand uppercase tracking-widest">AI Intelligence</span>
                                            <Sparkles size={14} className="text-brand animate-pulse" />
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Estimated Monthly Reach</p>
                                                <p className="text-3xl font-black italic text-white tracking-tighter">
                                                    {forecast.monthlyPotential.toLocaleString()} <span className="text-xs text-gray-600">UNITS</span>
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                {forecast.goods.map((good, i) => (
                                                    <div key={i} className="flex justify-between items-center p-2 bg-black/20 rounded-lg border border-white/5">
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase">{good.name}</span>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-white">{good.amount}</p>
                                                            <p className={`text-[6px] font-black uppercase ${good.status === 'Order Required' ? 'text-red-500' : 'text-emerald-500'}`}>{good.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CATALOG ACTION BUTTONS */}
                            <div 
                                key="initial"
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="group p-10 bg-dark-900 border border-white/5 rounded-[3rem] text-center space-y-6 cursor-pointer hover:border-brand/40 transition-all hover:scale-[1.02]"
                            >
                                <div className="w-24 h-24 bg-brand/10 rounded-[2.5rem] flex items-center justify-center text-brand mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                                    <Upload size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase">AI Neural Scan</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-2">Upload Menu PDF or Gallery Image</p>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*,application/pdf"
                                    onChange={handleFileUpload}
                                />
                            </div>

                            <div 
                                onClick={() => setStep('manual')}
                                className="group p-10 bg-dark-900 border border-white/5 rounded-[3rem] text-center space-y-6 cursor-pointer hover:border-brand/40 transition-all hover:scale-[1.02]"
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-400 mx-auto shadow-2xl group-hover:scale-110 group-hover:text-brand transition-all">
                                    <Edit3 size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase">Manual Entry</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-2">Craft your catalog item by item</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    )}

                    {/* STEP 2: PROCESSING (NEURAL SCAN) */}
                    {step === 'processing' && (
                        <motion.div 
                            key="processing"
                            className="flex flex-col items-center justify-center py-20 space-y-12"
                        >
                            <div className="relative w-full max-w-lg aspect-video bg-dark-900 border-2 border-brand shadow-[0_0_50px_rgba(33,255,165,0.2)] rounded-[3rem] overflow-hidden flex flex-col items-center justify-center p-12">
                                {/* Blueprint Aesthetic Background */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                
                                <div className="relative w-64 h-40 border-2 border-brand/20 rounded-2xl overflow-hidden">
                                    <motion.div 
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-brand shadow-[0_0_30px_rgba(33,255,165,1)] z-20"
                                    />
                                    <div className="absolute inset-0 flex flex-col gap-4 p-4 opacity-30">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="h-2 w-3/4 bg-brand rounded-full" />
                                                <div className="h-1 w-full bg-brand/40 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 text-center space-y-4">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter animate-pulse">Neural <span className="text-brand">Decoding...</span></h2>
                                    <div className="flex justify-center gap-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                                        <span className="flex items-center gap-2"><CheckCircle size={12} className="text-brand" /> Items</span>
                                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-brand animate-ping rounded-full" /> Prices</span>
                                        <span className="flex items-center gap-2 opacity-30">Tags</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: REVIEW AI RESULTS */}
                    {step === 'review' && (
                        <motion.div 
                            key="review"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="p-6 bg-brand/5 border border-brand/20 rounded-3xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-dark-950 shadow-lg">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black italic uppercase">Scan Complete</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">We found {scannedItems.length} items. Please verify accuracy.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {scannedItems.map((item) => (
                                    <div key={item.id} className="p-6 bg-dark-900 border border-white/5 rounded-[2rem] flex items-center justify-between group hover:border-brand/30 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.status === 'flagged' ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-gray-600'}`}>
                                                {item.category === 'Drinks' ? <Wine size={20} /> : <Utensils size={20} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black italic uppercase text-white tracking-tighter">{item.name}</span>
                                                    {item.status === 'flagged' && (
                                                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black rounded uppercase">{item.reason}</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{item.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-xl font-black italic text-brand">€{item.price}</span>
                                            <div className="flex gap-2">
                                                <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-brand transition-all"><Edit3 size={16} /></button>
                                                <button onClick={() => removeItem(item.id, 'scanned')} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-8">
                                <button 
                                    onClick={() => setStep('initial')}
                                    className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} /> Discard & Deny
                                </button>
                                <button 
                                    onClick={() => navigate('/manager')}
                                    className="flex-1 py-5 bg-brand text-dark-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} /> Confirm & Publish
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: MANUAL ENTRY */}
                    {step === 'manual' && (
                        <motion.div 
                            key="manual"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-12"
                        >
                            {/* Manual Item Form */}
                            <div className="bg-dark-900 border border-white/5 rounded-[3rem] p-8 md:p-10 space-y-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand border border-brand/20">
                                        <PlusCircle size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase">Add <span className="text-brand">New Item</span></h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Item Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Signature Cocktail"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-brand/40 outline-none"
                                            value={currentManualItem.name}
                                            onChange={(e) => setCurrentManualItem({...currentManualItem, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Price (€)</label>
                                        <input 
                                            type="text" 
                                            placeholder="0.00"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-brand/40 outline-none"
                                            value={currentManualItem.price}
                                            onChange={(e) => setCurrentManualItem({...currentManualItem, price: e.target.value})}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Description</label>
                                        <textarea 
                                            placeholder="Ingredients, preparation details, or allergen info..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-brand/40 outline-none h-24 resize-none"
                                            value={currentManualItem.description}
                                            onChange={(e) => setCurrentManualItem({...currentManualItem, description: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 items-end">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Item Media</label>
                                        <div className="flex gap-3">
                                            <button className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-400 flex items-center justify-center gap-3 hover:text-brand hover:border-brand/30 transition-all">
                                                <ImageIcon size={18} /> Gallery
                                            </button>
                                            <button className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-400 flex items-center justify-center gap-3 hover:text-brand hover:border-brand/30 transition-all">
                                                <Camera size={18} /> Camera
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={addManualItem}
                                        className="w-full md:w-auto px-12 py-5 bg-brand text-dark-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Add to List
                                    </button>
                                </div>
                            </div>

                            {/* List of Added Items */}
                            {manualItems.length > 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <h4 className="text-xl font-black italic uppercase ml-4">Items <span className="text-brand">to be Added</span></h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {manualItems.map((item) => (
                                            <div key={item.id} className="p-6 bg-dark-900 border border-white/5 rounded-[2rem] flex items-center justify-between group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-600"><Utensils size={20} /></div>
                                                    <div>
                                                        <p className="text-lg font-black italic uppercase text-white tracking-tighter">{item.name}</p>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">€{item.price} | {item.category}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeItem(item.id, 'manual')} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => navigate('/manager')}
                                        className="w-full py-6 bg-brand text-dark-950 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                    >
                                        Finalize & Save Menu <ChevronRight size={20} />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MenuManagement;
