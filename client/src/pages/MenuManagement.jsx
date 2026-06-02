import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Upload, FileText, ImageIcon, Camera, Plus, Trash2, 
    CheckCircle, XCircle, ArrowLeft, Loader2, Edit3, Save, ChevronRight,
    Utensils, Coffee, Wine, Package, PlusCircle, Sparkles, Clock, Users,
    Target, TrendingUp, Box, MapPin, Zap, Droplets, MessageCircle, Send, Check, X, Paperclip,
    Fingerprint, ShieldCheck, Activity, Cpu, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const MenuManagement = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState('initial'); // initial, processing, review, manual
    const [isPublishing, setIsPublishing] = useState(false);
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

    const [isChatSheetOpen, setIsChatSheetOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'agent', text: 'Operational Sentinel active. How can I help you architect your catalog today?' }
    ]);
    const [userMessage, setUserMessage] = useState('');
    const [isAgentThinking, setIsAgentThinking] = useState(false);
    const [aiDraftMenu, setAiDraftMenu] = useState(null);

    const handleSendMessage = () => {
        if (!userMessage.trim()) return;
        
        const newMessages = [...chatMessages, { role: 'user', text: userMessage }];
        setChatMessages(newMessages);
        setUserMessage('');
        setIsAgentThinking(true);

        // TAILORED ARCHITECT LOGIC
        setTimeout(() => {
            setIsAgentThinking(false);
            setChatMessages(prev => [...prev, { 
                role: 'agent', 
                text: `Intelligence processed. As a ${managerContext === 'HM' ? 'Hospitality' : managerContext === 'SM' ? 'Stadium' : managerContext === 'BM' ? 'High-Volume Nightlife' : 'Service'} specialist, I have architected a draft catalog aligned with your operational scale.` 
            }]);

            let draft = [];
            if (managerContext === 'HM') { // HOTEL
                draft = [
                    { id: 301, name: '24/7 Premium Room Service', price: '45.00', category: 'F&B', desc: 'Curated selection for high-end suites.' },
                    { id: 302, name: 'Valet & Luggage Express', price: '20.00', category: 'Concierge', desc: 'Seamless arrival/departure logistics.' },
                    { id: 303, name: 'Zen Spa Session (60m)', price: '120.00', category: 'Wellness', desc: 'In-house luxury wellness booking.' }
                ];
            } else if (managerContext === 'SM') { // STADIUM
                draft = [
                    { id: 401, name: 'VIP Suite Catering Platter', price: '250.00', category: 'Premium', desc: 'High-margin box service delivery.' },
                    { id: 402, name: 'Fan Zone Fast-Pass', price: '15.00', category: 'Access', desc: 'Skip-the-line concession digital token.' },
                    { id: 403, name: 'Stadium Gold Parking', price: '40.00', category: 'Logistics', desc: 'Priority exit-zone bay allocation.' }
                ];
            } else if (managerContext === 'WM') { // WASH
                draft = [
                    { id: 501, name: 'Eco-Ceramic Ultra Wash', price: '65.00', category: 'Detaiing', desc: 'Multi-stage protection & shine.' },
                    { id: 502, name: 'Interior Deep Extraction', price: '40.00', category: 'Service', desc: 'Steam-clean & allergen removal.' }
                ];
            } else if (managerContext === 'PM') { // PARKING
                draft = [
                    { id: 601, name: 'Premium Secure Bay', price: '25.00', category: 'Standard', desc: '24/7 monitored priority slot.' },
                    { id: 602, name: 'EV Hyper-Charge Slot', price: '15.00', category: 'Utility', desc: 'Integrated charging & occupancy.' }
                ];
            } else { // DEFAULT / RESTAURANT / BAR
                draft = [
                    { id: 101, name: 'Signature Flight', price: '55.00', category: 'Curated', desc: 'High-turnover tasting experience.' },
                    { id: 102, name: 'Operational Base Unit', price: '12.00', category: 'Core', desc: 'Standardized high-volume offering.' }
                ];
            }
            setAiDraftMenu(draft);
        }, 2500);
    };

    const getMonthlyForecast = () => {
        try {
            const openH = parseInt(config.openTime.split(':')[0]) || 0;
            const closeH = parseInt(config.closeTime.split(':')[0]) || 0;
            const hours = Math.max(0, closeH - openH);
            
            const totalBaseCapacity = (config.capacity || 0) + (config.standingCapacity || 0);
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
                { name: 'Base Ingredients', amount: `€${(monthlyPotential * 0.05).toLocaleString()} Est.`, status: 'Order Required' },
                { name: 'Beverage Stock', amount: `${(monthlyPotential * 0.8).toFixed(0)} Units`, status: 'Healthy' },
                { name: 'Cleaning Supplies', amount: '12 Kits', status: 'Healthy' }
            ];

            return { monthlyPotential, goods };
        } catch (e) {
            return { monthlyPotential: 0, goods: [] };
        }
    };

    const forecast = getMonthlyForecast();

    // Real AI Neural Scan calling our Node Express Server
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Reset file input value so that the onChange event will trigger again even if the same file is selected
        e.target.value = '';
        
        const type = file.type.includes('pdf') ? 'pdf' : 'image';
        setUploadType(type);

        if (isChatSheetOpen) {
            setChatMessages(prev => [...prev, { 
                role: 'user', 
                text: `Uploaded ${type.toUpperCase()}: ${file.name}` 
            }]);
            setIsAgentThinking(true);
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const base64Content = event.target.result.split(',')[1];
                    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
                    const backendUrl = wsUrl.replace(/^ws/, 'http');
                    const response = await fetch(`${backendUrl}/api/ai/scan-menu`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fileData: base64Content,
                            fileType: file.type || 'image/png',
                            businessType: managerContext
                        })
                    });
                    const data = await response.json();
                    setIsAgentThinking(false);
                    if (data.success && data.items) {
                        setChatMessages(prev => [...prev, { 
                            role: 'agent', 
                            text: `Scan complete! Decoded ${data.items.length} visual items. I have structured a custom catalog entry proposed draft.` 
                        }]);
                        setAiDraftMenu(data.items);
                    } else {
                        setChatMessages(prev => [...prev, { role: 'agent', text: `Extraction failed: ${data.error || 'Unknown protocol error.'}` }]);
                    }
                } catch (err) {
                    setIsAgentThinking(false);
                    setChatMessages(prev => [...prev, { role: 'agent', text: 'Secure visual scan API is currently offline.' }]);
                }
            };
            reader.readAsDataURL(file);
        } else {
            // Main Neural Scan trigger
            setStep('processing'); // Set decoding/processing state instantly for immediate UI feedback
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Content = event.target.result.split(',')[1];
                
                try {
                    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
                    const backendUrl = wsUrl.replace(/^ws/, 'http');
                    const response = await fetch(`${backendUrl}/api/ai/scan-menu`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fileData: base64Content,
                            fileType: file.type || 'image/png',
                            businessType: managerContext
                        })
                    });
                    
                    const data = await response.json();
                    if (data.success && data.items) {
                        // All successfully 'verified' items checked by default, 'flagged' items unchecked
                        const itemsWithSelection = data.items.map(item => ({
                            ...item,
                            checked: item.status !== 'flagged'
                        }));
                        setScannedItems(itemsWithSelection);
                        setStep('review');
                    } else {
                        console.error('Scan failed:', data.error);
                        setStep('initial');
                        alert('Visual scan failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (err) {
                    console.error('Error scanning menu:', err);
                    setStep('initial');
                    alert('Secure gateway offline. Visual scan failed.');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const publishScannedMenu = async () => {
        const selected = scannedItems.filter(item => item.checked);
        if (selected.length === 0) {
            alert('Please select at least one catalog item to publish.');
            return;
        }

        setIsPublishing(true);
        try {
            await setDoc(doc(db, 'business_menus', managerContext), {
                items: selected,
                updatedAt: new Date().toISOString()
            });

            localStorage.setItem(`green_published_menu_${managerContext}`, JSON.stringify(selected));
            alert(`Catalog successfully synchronized! ${selected.length} items published live to the Green Grid.`);
            navigate(`/manager${window.location.search}`);
        } catch (err) {
            console.error('Failed to sync catalog to Firestore:', err);
            // Local fallback
            localStorage.setItem(`green_published_menu_${managerContext}`, JSON.stringify(selected));
            alert(`Catalog updated locally (${selected.length} items).`);
            navigate(`/manager${window.location.search}`);
        } finally {
            setIsPublishing(false);
        }
    };

    const publishManualMenu = async () => {
        if (manualItems.length === 0) return;

        setIsPublishing(true);
        try {
            const formattedItems = manualItems.map((item, idx) => ({
                id: item.id || (Date.now() + idx),
                name: item.name,
                price: item.price,
                category: item.category || 'Food',
                description: item.description || '',
                image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
                status: 'verified'
            }));

            await setDoc(doc(db, 'business_menus', managerContext), {
                items: formattedItems,
                updatedAt: new Date().toISOString()
            });

            localStorage.setItem(`green_published_menu_${managerContext}`, JSON.stringify(formattedItems));
            alert(`Catalog finalized! ${formattedItems.length} items published live to the Green Grid.`);
            navigate(`/manager${window.location.search}`);
        } catch (err) {
            console.error('Failed to publish manual catalog:', err);
            localStorage.setItem(`green_published_menu_${managerContext}`, JSON.stringify(manualItems));
            alert(`Catalog finalized locally (${manualItems.length} items).`);
            navigate(`/manager${window.location.search}`);
        } finally {
            setIsPublishing(false);
        }
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
        <div className="min-h-screen bg-dark-950 text-primary font-sans p-6 md:p-12 relative overflow-hidden">
            {/* Background Aesthetics - Tactical Layer */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--border-main) 1px, transparent 1px), linear-gradient(90deg, var(--border-main) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-violet-500/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/3" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <button 
                        onClick={() => step === 'initial' ? navigate(`/manager${window.location.search}`) : setStep('initial')}
                        className="w-14 h-14 bg-glass border border-main rounded-2xl flex items-center justify-center text-secondary hover:text-brand hover:border-brand/40 transition-all shadow-xl backdrop-blur-xl group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">Intelligence <span className="text-brand">& Catalog</span></h1>
                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mt-3 opacity-50">AI-Driven Operational Scaling</p>
                    </div>
                    <div className="w-14" />
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 0: OPERATIONAL CONFIG & AI INSIGHTS */}
                    {step === 'initial' && (
                        <motion.div 
                            key="config-hub"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            {/* CONFIGURATION CARD */}
                            <div className="bg-glass border border-main rounded-[4rem] p-1 shadow-2xl relative group overflow-hidden">
                                <div className="bg-dark-900 rounded-[3.8rem] p-8 md:p-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-brand pointer-events-none"><Cpu size={200} /></div>
                                    
                                    <div className="relative z-10 flex flex-col lg:flex-row gap-10">
                                        {/* LEFT COLUMN: CONFIG */}
                                        <div className="flex-1 space-y-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-lg shadow-brand/10"><Target size={24} /></div>
                                                <h3 className="text-2xl font-black italic uppercase text-primary">Business <span className="text-brand">Scale</span></h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 ml-2">
                                                        <Box size={14} className="text-brand" />
                                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] opacity-60">
                                                            {managerContext === 'PM' ? 'Total Spots' : managerContext === 'WM' ? 'Wash Bays' : 'Total Tables'}
                                                        </label>
                                                    </div>
                                                    <div className="relative group/input">
                                                        <div className="absolute inset-0 bg-brand/5 blur-xl opacity-0 group-hover/input:opacity-100 transition-opacity" />
                                                        <input 
                                                            type="number" 
                                                            placeholder="0"
                                                            value={config.capacity}
                                                            onChange={(e) => setConfig({...config, capacity: parseInt(e.target.value) || 0})}
                                                            className="w-full bg-btn-sec border-2 border-main rounded-[2rem] p-6 text-xl font-black italic text-brand focus:border-brand/60 outline-none transition-all relative z-10"
                                                        />
                                                        <Users size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary opacity-30 group-hover/input:opacity-80 transition-all z-10" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 ml-2">
                                                        <Clock size={14} className="text-brand" />
                                                        <label className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] opacity-60">Operating Window</label>
                                                    </div>
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <div className="flex-1 relative group/time">
                                                            <input 
                                                                type="time" 
                                                                value={config.openTime}
                                                                onChange={(e) => setConfig({...config, openTime: e.target.value})}
                                                                className="w-full bg-btn-sec border-2 border-main rounded-2xl p-4 text-xs font-black text-center text-primary focus:border-brand/40 outline-none transition-all"
                                                            />
                                                            <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[7px] font-black text-secondary opacity-40 uppercase tracking-widest">START</p>
                                                        </div>
                                                        <div className="flex-1 relative group/time">
                                                            <input 
                                                                type="time" 
                                                                value={config.closeTime}
                                                                onChange={(e) => setConfig({...config, closeTime: e.target.value})}
                                                                className="w-full bg-btn-sec border-2 border-main rounded-2xl p-4 text-xs font-black text-center text-primary focus:border-brand/40 outline-none transition-all"
                                                            />
                                                            <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[7px] font-black text-secondary opacity-40 uppercase tracking-widest">FINISH</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {(managerContext === 'BM' || managerContext === 'CM') && (
                                                    <div className="sm:col-span-2 space-y-4">
                                                        <div className="flex items-center gap-3 ml-2">
                                                            <Activity size={14} className="text-brand" />
                                                            <label className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] opacity-60">Live Standing Capacity</label>
                                                        </div>
                                                        <div className="relative group/input">
                                                            <input 
                                                                type="number" 
                                                                value={config.standingCapacity}
                                                                onChange={(e) => setConfig({...config, standingCapacity: parseInt(e.target.value) || 0})}
                                                                className="w-full bg-btn-sec border-2 border-main rounded-[2rem] p-6 text-xl font-black italic text-brand focus:border-brand/60 outline-none transition-all relative z-10"
                                                            />
                                                            <Users size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary opacity-30 group-hover/input:opacity-80 transition-all z-10" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN: AI INSIGHTS */}
                                        <div className="w-full lg:w-[400px] shrink-0">
                                            <div className="bg-brand/5 border border-brand/20 rounded-[3.5rem] p-8 space-y-8 backdrop-blur-xl relative group/forecast overflow-hidden h-full">
                                                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover/forecast:opacity-100 transition-opacity pointer-events-none" />
                                                <div className="flex items-center justify-between relative z-10">
                                                    <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em]">AI Intelligence</span>
                                                    <Sparkles size={18} className="text-brand animate-pulse" />
                                                </div>
                                                <div className="space-y-8 relative z-10">
                                                    <div>
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 opacity-60">Estimated Monthly Reach</p>
                                                        <p className="text-5xl font-black italic text-primary tracking-tighter">
                                                            {forecast.monthlyPotential.toLocaleString()} <span className="text-xs text-secondary opacity-40 italic tracking-widest">UNITS</span>
                                                        </p>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {forecast.goods.map((good, i) => (
                                                            <div key={i} className="flex justify-between items-center p-4 bg-dark-950/40 rounded-2xl border border-main group/good hover:border-brand/30 transition-all">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-60">{good.name}</span>
                                                                    <p className="text-sm font-black text-primary mt-1">{good.amount}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${good.status === 'Order Required' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand/10 text-brand border border-brand/20'}`}>
                                                                        <div className={`w-1 h-1 rounded-full ${good.status === 'Order Required' ? 'bg-red-500 animate-pulse' : 'bg-brand'}`} />
                                                                        {good.status}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ENTRY OPTIONS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                                {/* OPTION 1: AI SCAN */}
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-glass border border-main rounded-[3.5rem] p-12 text-center space-y-8 cursor-pointer hover:border-brand/40 transition-all group shadow-xl"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <div className="w-24 h-24 bg-btn-sec border border-main rounded-[2.5rem] flex items-center justify-center text-secondary mx-auto group-hover:scale-110 group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/20 transition-all duration-500">
                                        <Upload size={40} />
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-3xl font-black italic uppercase tracking-tighter text-primary">AI Neural <span className="text-brand">Scan</span></h4>
                                        <p className="text-[10px] text-secondary font-black uppercase tracking-[0.3em] opacity-40">Upload Catalog PDF or Data Map</p>
                                    </div>
                                </motion.div>

                                {/* OPTION 2: COLLABORATIVE ARCHITECT */}
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-glass border border-brand/40 rounded-[3.5rem] p-12 text-center space-y-8 cursor-pointer hover:shadow-[0_0_50px_rgba(33,255,165,0.05)] transition-all group shadow-2xl relative overflow-hidden"
                                    onClick={() => setIsChatSheetOpen(true)}
                                >
                                    <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-24 h-24 bg-brand border border-brand/20 rounded-[2.5rem] flex items-center justify-center text-dark-950 mx-auto group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-brand/20">
                                        <MessageCircle size={40} />
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        <h4 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Collaborative <span className="text-brand">Architect</span></h4>
                                        <p className="text-[10px] text-brand font-black uppercase tracking-[0.3em]">AI Agent Visual Construction</p>
                                    </div>
                                </motion.div>

                                {/* OPTION 3: MANUAL ENTRY */}
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-glass border border-main rounded-[3.5rem] p-12 text-center space-y-8 cursor-pointer hover:border-brand/40 transition-all group shadow-xl"
                                    onClick={() => setStep('manual')}
                                >
                                    <div className="w-24 h-24 bg-btn-sec border border-main rounded-[2.5rem] flex items-center justify-center text-secondary mx-auto group-hover:scale-110 group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/20 transition-all duration-500">
                                        <Edit3 size={40} />
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Manual <span className="text-brand">Entry</span></h4>
                                        <p className="text-[10px] text-secondary font-black uppercase tracking-[0.3em] opacity-40">Precision Manual Item Mapping</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: PROCESSING (NEURAL SCAN) */}
                    {step === 'processing' && (
                        <motion.div 
                            key="processing"
                            className="flex flex-col items-center justify-center py-20 space-y-12"
                        >
                            <div className="relative w-full max-w-2xl aspect-video bg-dark-900 border-2 border-brand shadow-[0_0_80px_rgba(33,255,165,0.15)] rounded-[4rem] overflow-hidden flex flex-col items-center justify-center p-16">
                                {/* Blueprint Aesthetic Background */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--border-main) 1px, transparent 1px), linear-gradient(90deg, var(--border-main) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                                
                                <div className="relative w-80 h-48 border-2 border-brand/20 rounded-3xl overflow-hidden bg-dark-950/40">
                                    <motion.div 
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-brand shadow-[0_0_30px_rgba(33,255,165,1)] z-20"
                                    />
                                    <div className="absolute inset-0 flex flex-col gap-6 p-6 opacity-30">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="space-y-3">
                                                <div className="h-3 w-3/4 bg-brand rounded-full" />
                                                <div className="h-2 w-full bg-brand/40 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-12 text-center space-y-4">
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter animate-pulse text-primary">Neural <span className="text-brand">Decoding...</span></h2>
                                    <div className="flex justify-center gap-10 text-[10px] font-black text-secondary uppercase tracking-[0.4em]">
                                        <span className="flex items-center gap-3"><CheckCircle size={14} className="text-brand" /> Items Resolved</span>
                                        <span className="flex items-center gap-3"><div className="w-2.5 h-2.5 bg-brand animate-ping rounded-full shadow-[0_0_10px_var(--brand)]" /> Price Extraction</span>
                                        <span className="flex items-center gap-3 opacity-30"><Activity size={14} /> Taxonomy</span>
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
                            className="space-y-10"
                        >
                            <div className="p-8 bg-brand/5 border border-brand/20 rounded-[3rem] flex items-center gap-6 backdrop-blur-xl">
                                <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-dark-950 shadow-[0_0_30px_var(--brand)] shadow-opacity-20">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase text-primary">Scan Context Resolved</h3>
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-[0.3em] opacity-60">Architect found {scannedItems.length} catalog items. Validation required.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {scannedItems.map((item) => (
                                    <div key={item.id} className={`p-4 md:p-8 bg-glass border rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 group hover:border-brand/40 transition-all shadow-xl ${item.checked ? 'border-brand/40 bg-brand/[0.02]' : 'border-main'}`}>
                                        <div className="flex flex-row items-center gap-4 md:gap-8">
                                            {/* Tactical Interactive Checkbox Selector */}
                                            <div 
                                                onClick={() => {
                                                    setScannedItems(prev => prev.map(s => s.id === item.id ? { ...s, checked: !s.checked } : s));
                                                }}
                                                className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                                                    item.checked 
                                                        ? 'bg-brand/20 border-brand text-brand shadow-[0_0_20px_rgba(33,255,165,0.3)]' 
                                                        : 'border-main text-transparent hover:border-brand/40 bg-btn-sec'
                                                }`}
                                            >
                                                <Check size={16} className={item.checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50 transition-transform'} />
                                            </div>

                                            {/* Dynamic AI Food Thumbnail Image Preview */}
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border border-main shrink-0 bg-btn-sec relative shadow-md">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-secondary">
                                                        {item.category === 'Drinks' ? <Wine size={24} /> : <Utensils size={24} />}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                    <span className="text-lg md:text-2xl font-black italic uppercase text-primary tracking-tighter leading-none truncate">{item.name}</span>
                                                    {item.status === 'flagged' && (
                                                        <span className="self-start px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black rounded uppercase tracking-widest border border-amber-500/20 shadow-lg shadow-amber-500/5">Review Required</span>
                                                    )}
                                                </div>
                                                <p className="text-[9px] md:text-[10px] font-black text-secondary uppercase tracking-[0.2em] md:tracking-[0.4em] mt-2 opacity-40 line-clamp-2">
                                                    {item.category} • {item.description || 'Verified Catalog Item'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-center justify-between md:justify-end gap-6 md:gap-10 border-t border-main/50 md:border-none pt-4 md:pt-0">
                                            <span className="text-2xl md:text-3xl font-black italic text-brand tracking-tighter">€{item.price}</span>
                                            <div className="flex gap-3">
                                                <button className="w-10 h-10 md:w-12 md:h-12 bg-btn-sec border border-main rounded-xl text-secondary hover:text-brand hover:border-brand/40 transition-all flex items-center justify-center"><Edit3 size={18} /></button>
                                                <button onClick={() => removeItem(item.id, 'scanned')} className="w-10 h-10 md:w-12 md:h-12 bg-btn-sec border border-main rounded-xl text-secondary hover:text-red-500 hover:border-red-500/40 transition-all flex items-center justify-center"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-6 pt-10 pb-20">
                                <button 
                                    onClick={() => setStep('initial')}
                                    disabled={isPublishing}
                                    className="flex-1 py-6 bg-glass border border-main rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] text-secondary hover:text-primary hover:border-secondary transition-all flex items-center justify-center gap-4 animate-all"
                                >
                                    <XCircle size={20} /> Discard Protocol
                                </button>
                                <button 
                                    onClick={publishScannedMenu}
                                    disabled={isPublishing}
                                    className="flex-1 py-6 bg-brand text-dark-950 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(33,255,165,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 animate-all"
                                >
                                    {isPublishing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} /> Synchronizing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} /> Publish to Grid
                                        </>
                                    )}
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
                            <div className="bg-glass border border-main rounded-[4rem] p-1 shadow-2xl relative group overflow-hidden">
                                <div className="bg-dark-900 rounded-[3.8rem] p-10 md:p-14 space-y-10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-brand pointer-events-none"><PlusCircle size={200} /></div>
                                    
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand shadow-lg shadow-brand/10">
                                            <Plus size={28} />
                                        </div>
                                        <h3 className="text-3xl font-black italic uppercase text-primary tracking-tighter">Manual <span className="text-brand">Definition</span></h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] ml-3 opacity-60">Product Nomenclature</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Signature Unit 01"
                                                className="w-full bg-btn-sec border border-main rounded-2xl p-5 text-sm font-black text-primary focus:border-brand/40 outline-none transition-all placeholder:opacity-20"
                                                value={currentManualItem.name}
                                                onChange={(e) => setCurrentManualItem({...currentManualItem, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] ml-3 opacity-60">Price Coefficient (€)</label>
                                            <input 
                                                type="text" 
                                                placeholder="0.00"
                                                className="w-full bg-btn-sec border border-main rounded-2xl p-5 text-sm font-black text-brand focus:border-brand/40 outline-none transition-all placeholder:opacity-20"
                                                value={currentManualItem.price}
                                                onChange={(e) => setCurrentManualItem({...currentManualItem, price: e.target.value})}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] ml-3 opacity-60">Operational Description</label>
                                            <textarea 
                                                placeholder="Provide technical specifications, ingredients, or service details..."
                                                className="w-full bg-btn-sec border border-main rounded-2xl p-6 text-sm font-bold text-primary focus:border-brand/40 outline-none h-32 resize-none transition-all placeholder:opacity-20"
                                                value={currentManualItem.description}
                                                onChange={(e) => setCurrentManualItem({...currentManualItem, description: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-8 items-end relative z-10 border-t border-main pt-10">
                                        <div className="flex-1 space-y-4 w-full">
                                            <label className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] ml-3 opacity-60">Visual Assets</label>
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="flex-1 p-5 bg-btn-sec border border-main rounded-2xl text-[10px] font-black uppercase text-secondary tracking-widest flex items-center justify-center gap-3 hover:text-brand hover:border-brand/30 transition-all group"
                                                >
                                                    <ImageIcon size={18} className="group-hover:scale-110 transition-transform" /> Neural Gallery
                                                </button>
                                                <button 
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="flex-1 p-5 bg-btn-sec border border-main rounded-2xl text-[10px] font-black uppercase text-secondary tracking-widest flex items-center justify-center gap-3 hover:text-brand hover:border-brand/30 transition-all group"
                                                >
                                                    <Camera size={18} className="group-hover:scale-110 transition-transform" /> Optic Sensor
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={addManualItem}
                                            className="w-full md:w-auto px-16 py-6 bg-brand text-dark-950 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Commit to Sync
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List of Added Items */}
                            {manualItems.length > 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
                                    <div className="flex items-center gap-4 ml-6">
                                        <div className="h-8 w-1 bg-brand rounded-full shadow-[0_0_15px_var(--brand)]" />
                                        <h4 className="text-2xl font-black italic uppercase tracking-widest text-primary">Pending <span className="text-brand">Finalization</span></h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        {manualItems.map((item) => (
                                            <div key={item.id} className="p-8 bg-glass border border-main rounded-[2.5rem] flex items-center justify-between group hover:border-brand/30 transition-all">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-16 h-16 bg-btn-sec border border-main rounded-2xl flex items-center justify-center text-secondary group-hover:text-brand group-hover:border-brand/20 transition-all"><Utensils size={28} /></div>
                                                    <div>
                                                        <p className="text-2xl font-black italic uppercase text-primary tracking-tighter leading-none">{item.name}</p>
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mt-3 opacity-40">€{item.price} | {item.category}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeItem(item.id, 'manual')} className="w-12 h-12 bg-btn-sec border border-main rounded-xl text-secondary hover:text-red-500 hover:border-red-500/40 transition-all flex items-center justify-center"><Trash2 size={20} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={publishManualMenu}
                                        disabled={isPublishing}
                                        className="w-full py-8 bg-brand text-dark-950 rounded-[2.5rem] text-sm font-black uppercase tracking-[0.4em] shadow-[0_30px_60px_rgba(33,255,165,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                    >
                                        {isPublishing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={24} /> Operationalizing Catalog...
                                            </>
                                        ) : (
                                            <>
                                                Finalize & Operationalize Catalog <ChevronRight size={24} />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />

            {/* AI ARCHITECT BOTTOM SHEET */}
            <AnimatePresence>
                {isChatSheetOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setIsChatSheetOpen(false)} 
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
                        />
                        <motion.div 
                            initial={{ y: "100%" }} 
                            animate={{ y: 0 }} 
                            exit={{ y: "100%" }} 
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="bg-dark-950 border-t border-main rounded-t-[4rem] p-10 pb-16 space-y-10 shadow-[0_-50px_100px_rgba(0,0,0,0.5)] relative z-10 w-full max-w-3xl h-[90vh] flex flex-col"
                        >
                            <div className="w-16 h-1.5 bg-btn-sec rounded-full mx-auto shrink-0 opacity-50" />
                            
                            <div className="flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand shadow-lg shadow-brand/5">
                                        <Sparkles size={32} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-primary leading-none">Collaborative Architect</h3>
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="px-2 py-0.5 bg-brand/10 text-brand text-[7px] font-black rounded-md border border-brand/20 uppercase tracking-widest">v2.8 Sentinel Active</div>
                                            <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse shadow-[0_0_10px_var(--brand)]" />
                                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40">Identity Resolved: Manager</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsChatSheetOpen(false)} className="w-14 h-14 bg-btn-sec border border-main rounded-2xl text-secondary hover:text-primary hover:border-secondary transition-all flex items-center justify-center"><X size={24} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-4 py-4">
                                {chatMessages.map((msg, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm font-bold leading-relaxed shadow-xl ${msg.role === 'user' ? 'bg-brand text-dark-950 rounded-tr-none' : 'bg-glass border border-main text-secondary rounded-tl-none backdrop-blur-md'}`}>
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}

                                {isAgentThinking && (
                                    <div className="flex justify-start">
                                        <div className="bg-glass border border-main p-6 rounded-[2rem] rounded-tl-none flex gap-2.5 items-center backdrop-blur-md">
                                            <div className="w-2 h-2 bg-brand rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-brand rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-2 h-2 bg-brand rounded-full animate-bounce [animation-delay:0.4s]" />
                                            <span className="text-[8px] font-black text-brand uppercase tracking-[0.3em] ml-3 animate-pulse">Architecting...</span>
                                        </div>
                                    </div>
                                )}

                                {aiDraftMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-brand/5 border border-brand/20 rounded-[3rem] p-10 space-y-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group/draft"
                                    >
                                        <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover/draft:opacity-100 transition-opacity" />
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-8 bg-brand rounded-full shadow-[0_0_15px_var(--brand)]" />
                                                <h4 className="text-lg font-black italic uppercase tracking-widest text-brand leading-none">Draft Catalog Proposal</h4>
                                            </div>
                                            <div className="p-2 bg-brand/10 text-brand rounded-lg border border-brand/20"><Cpu size={16} /></div>
                                        </div>
                                        
                                        <div className="space-y-4 relative z-10">
                                            {aiDraftMenu.map((item) => (
                                                <div key={item.id} className="p-5 bg-dark-950/60 border border-main rounded-2xl flex justify-between items-center group/item hover:border-brand/40 transition-all">
                                                    <div>
                                                        <p className="text-sm font-black text-primary uppercase tracking-tight">{item.name}</p>
                                                        <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-40 mt-1">{item.category}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black italic text-brand tracking-tighter">€{item.price}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex gap-4 pt-4 relative z-10">
                                            <button 
                                                onClick={() => {
                                                    setManualItems([...manualItems, ...aiDraftMenu]);
                                                    setAiDraftMenu(null);
                                                    setChatMessages([...chatMessages, { role: 'agent', text: 'Catalog Synced Successfully. Visual definitions have been committed to the pending finalized list.' }]);
                                                }}
                                                className="flex-2 py-5 bg-brand text-dark-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex-1 shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                Commit & Sync
                                            </button>
                                            <button 
                                                onClick={() => setAiDraftMenu(null)}
                                                className="py-5 px-8 bg-btn-sec border border-main rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-all"
                                            >
                                                Re-Architect
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                <div className="h-10" />
                            </div>

                            <div className="shrink-0 pt-6 border-t border-main">
                                <div className="relative group/chatinput">
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-btn-sec border border-main text-secondary rounded-2xl flex items-center justify-center hover:text-brand hover:border-brand/40 transition-all shadow-lg"
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    <input 
                                        type="text"
                                        placeholder="Command the architect..."
                                        value={userMessage}
                                        onChange={(e) => setUserMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="w-full bg-btn-sec border border-main rounded-[2.5rem] p-7 pl-20 pr-24 text-sm font-bold text-primary outline-none focus:border-brand/50 transition-all placeholder:opacity-20 shadow-inner"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-brand text-dark-950 rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(33,255,165,0.3)] hover:scale-110 active:scale-95 transition-all group/send"
                                    >
                                        <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuManagement;
