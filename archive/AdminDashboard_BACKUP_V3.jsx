import React, { useState, useEffect } from 'react';
import {
    Car, FileText, Search, ChevronRight, LogOut, Star, MessageSquare, Briefcase, 
    DollarSign, Bell, LayoutDashboard, Zap, Users, ShieldCheck, CheckCircle2, 
    Clock, AlertCircle, Menu, X, TrendingUp, Globe, Scale, Calculator, Activity, 
    ArrowUpRight, Building2, Calendar, Settings, Eye, Droplets, Paperclip, Upload, 
    Phone, Mail, MapPin, User as UserIcon, ExternalLink, ChevronDown, Shield, 
    ThumbsUp, ThumbsDown, Filter, FolderOpen, Quote, Bot, Sparkles, BarChart3, 
    ArrowLeft, Monitor, Radio, Target, Layers, Cpu, Database, Lock, Download, ShieldAlert,
    Wallet
} from 'lucide-react';
import { triggerNotification } from '../components/NotificationToast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Radar from '../components/Radar';
import { useSocket } from '../context/SocketContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { drivers } = useSocket();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [view, setView] = useState('command-deck');
    const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
    const [globalSurge, setGlobalSurge] = useState(() => parseFloat(localStorage.getItem('green_global_surge')) || 1.2);
    const [systemLockdown, setSystemLockdown] = useState(false);
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
    const [isVerifyingVault, setIsVerifyingVault] = useState(false);
    const [vaultOTP, setVaultOTP] = useState('');
    const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
    const [searchQuery, setSearchQuery] = useState('');
    
    // Feedback Filters
    const [feedbackFilter, setFeedbackFilter] = useState({ category: 'all', date: '', location: '' });
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
    const [staffList, setStaffList] = useState([
        { id: 'S-900-11', name: 'Elena Richter', role: 'Customer Service Alpha', email: 'elena.r@green.io', phone: '+49 152 4492 110', adress: 'Hauptstr 12, 60311 Frankfurt', zip: '60311', bank: 'DE44 5002 0000 1294 88', img: 'Elena' },
        { id: 'S-900-12', name: 'Sven Weber', role: 'Partner Support Beta', email: 'sven.w@green.io', phone: '+49 176 8821 004', adress: 'Zeil 44, 60313 Frankfurt', zip: '60313', bank: 'DE91 2201 9922 4481 00', img: 'Sven' }
    ]);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', adress: '', zip: '', bank: '', role: 'Customer Service Staff' });

    // Role-Based Access Enforcement
    useEffect(() => {
        if (user?.role === 'staff' && !['customer-service', 'personal-data'].includes(view)) {
            setView('customer-service');
        }
    }, [user, view]);

    const handleAddStaff = () => {
        const staffId = `S-900-${staffList.length + 11}`;
        setStaffList([...staffList, { ...newStaff, id: staffId, img: newStaff.name.split(' ')[0] }]);
        setIsAddStaffModalOpen(false);
        setNewStaff({ name: '', email: '', phone: '', adress: '', zip: '', bank: '', role: 'Customer Service Staff' });
    };
    
    // --- GREEN NEURAL CORE: AUTONOMOUS INTELLIGENCE ---
    const [isAssistantExpanded, setIsAssistantExpanded] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [activeAgent, setActiveAgent] = useState('financial');
    const [neuralInsights, setNeuralInsights] = useState([
        { id: 'INS-01', type: 'fraud', title: 'GPS Manipulation Detected', target: 'Driver D-404', reason: 'System detected simulated coordinates matching known spoofing patterns.', law: 'PBefG §49 (Operating outside territory)', severity: 'high', status: 'pending' },
        { id: 'INS-02', type: 'compliance', title: 'V5C Authenticity Warning', target: 'Partner P-102', reason: 'Metadata mismatch in uploaded Vehicle Registration. Possible forgery.', law: 'StVZO §13 (Document Integrity)', severity: 'critical', status: 'pending' },
        { id: 'INS-03', type: 'legal', title: 'New EU Data Directive', target: 'System Policy', reason: 'Amendment required for cross-border passenger data retention.', law: 'GDPR Art. 44-49', severity: 'medium', status: 'pending' }
    ]);

    const [chatMessages, setChatMessages] = useState({
        financial: [{ role: 'agent', text: 'Good morning, Director. I have reviewed the latest transport amendments for Germany. Your current fleet licensing is 100% compliant, but the new PBefG regulations in Q3 will require a minor adjustment to your partner insurance clauses. Shall I prepare the briefing?' }],
        operations: [{ role: 'agent', text: 'Operational load is steady. Stadium event at 8 PM will require 20% more fleet density in Sector 4.' }],
        lost_found: [{ role: 'agent', text: 'Guardian Protocol Active. I am monitoring all lost item reports. Current investigation: Sarah L. (C-992-01) - Missing iPhone 15. Vehicle V-882 detected a shift in seat pressure after drop-off. Coordination with Driver P-044 is underway.' }],
        law_sentinel: [{ role: 'agent', text: 'Legal Sentinel Active. I am synchronized with Gesetze-im-Internet.de and European Data Directives. How can I assist with your German compliance strategy today?' }],
        intelligence_scout: [{ role: 'agent', text: 'Intelligence Scout Online. I am monitoring Federal Ministry portals for new mobility updates. Latest news: Frankfurt has announced a new "Green Zone" expansion for autonomous fleet parking starting next month.' }],
        architect_sentinel: [{ role: 'agent', text: 'Architect Sentinel at your service. I can implement any code changes, feature expansions, or tactical UI updates you require for the platform. What shall we build next?' }]
    });
    const [currentMessage, setCurrentMessage] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000);
        const handleKeyDown = (e) => {
            if (e.metaKey && e.key === 'k') {
                e.preventDefault();
                setIsCommandBarOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearInterval(timer);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleSidebarClick = (id) => {
        setView(id);
        setIsSidebarOpen(false);
    };

    const handleVaultAuth = () => {
        if (vaultOTP === '1234') { // Simulated OTP
            setIsVaultUnlocked(true);
            setIsVerifyingVault(false);
            setVaultOTP('');
        } else {
            alert('INVALID SECURITY CODE');
        }
    };    
    
    const handleInsightAction = (id, action) => {
        setNeuralInsights(prev => prev.filter(ins => ins.id !== id));
        triggerNotification(action === 'approve' ? 'success' : 'error', 'Director Decision Logged', `Action ${action.toUpperCase()} executed for incident ${id}.`);
    };

    const sendMessage = () => {
        if (!currentMessage) return;
        setChatMessages(prev => ({
            ...prev,
            [activeAgent]: [...prev[activeAgent], { role: 'user', text: currentMessage }]
        }));
        setCurrentMessage('');
        // Simulate Agent Response
        setTimeout(() => {
            setChatMessages(prev => ({
                ...prev,
                [activeAgent]: [...prev[activeAgent], { role: 'agent', text: `Analyzing "${currentMessage}" against current legal frameworks and German mobility laws (PBefG)...` }]
            }));
        }, 1000);
    };

    return (
        <div className={`relative w-full h-screen overflow-hidden font-sans text-white flex flex-row selection:bg-brand selection:text-dark-900 transition-colors duration-1000 ${systemLockdown ? 'bg-red-950/20' : 'bg-[#05080F]'}`}>
            {/* SECURITY SCANNER OVERLAY */}
            <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden opacity-[0.03]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                <motion.div animate={{ y: ['0%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute top-0 left-0 w-full h-1 bg-brand/20 blur-sm" />
            </div>

            {/* --- PERSISTENT DIRECTOR SIDEBAR --- */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarCollapsed ? 96 : 320 }}
                className="h-full bg-[#0D1421]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col z-50 relative group"
            >
                {/* Sidebar Toggle */}
                <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-brand text-dark-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-[60] border-2 border-[#05080F]"
                >
                    <ChevronRight size={14} className={`transition-transform duration-500 ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
                </button>

                {/* Logo Area */}
                <div className="p-8 pb-12 overflow-hidden flex items-center gap-4">
                    <div className="min-w-[48px] h-12 rounded-2xl bg-brand/10 border border-brand/40 flex items-center justify-center text-brand shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                        <Shield size={24} />
                    </div>
                    {!isSidebarCollapsed && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Director</h2>
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-brand/60 mt-1">Alpha Command</p>
                        </motion.div>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
                    {[
                        { id: 'command-deck', label: 'Command Deck', icon: ShieldCheck, badge: 'Alpha' },
                        { id: 'agents', label: 'Neural Agents', icon: Bot, badge: 'AI' },
                        { id: 'settlements', label: 'Settlement Ledger', icon: Wallet },
                        { id: 'feedback', label: 'Feedback Hub', icon: MessageSquare },
                        { id: 'fleet', label: 'Fleet Telemetry', icon: Car },
                        { id: 'hotels', label: 'Hospitality VIP', icon: Building2 },
                        { id: 'clubs', label: 'Nightlife Heatmap', icon: Zap },
                        { id: 'events', label: 'Strategic Events', icon: Calendar },
                        { id: 'system-doors', label: 'Portal Doors', icon: Monitor },
                        { id: 'customer-service', label: 'Customer Service', icon: Phone },
                        { id: 'staff-hub', label: 'Intelligence Staff', icon: Users },
                        { id: 'app-settings', label: 'System Config', icon: Settings }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${view === item.id ? 'bg-brand text-dark-900 shadow-lg shadow-brand/10' : 'hover:bg-white/5 text-gray-500'}`}
                        >
                            <div className={`${view === item.id ? 'text-dark-900' : 'group-hover:text-brand'} transition-colors`}>
                                <item.icon size={20} />
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="flex-1 flex items-center justify-between overflow-hidden">
                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{item.label}</span>
                                    {item.badge && <span className={`text-[7px] font-black px-2 py-0.5 rounded uppercase ${view === item.id ? 'bg-dark-900/20' : 'bg-brand/10 text-brand'}`}>{item.badge}</span>}
                                </div>
                            )}
                            {view === item.id && <motion.div layoutId="active-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-dark-900 rounded-full" />}
                        </button>
                    ))}
                </nav>

                {/* Footer Exit */}
                <div className="p-6 border-t border-white/5">
                    <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all group">
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Logout System</span>}
                    </button>
                </div>
            </motion.aside>

            {/* --- RIGHT CONTENT AREA --- */}
            <div className="flex-1 h-full flex flex-col relative overflow-hidden">

            {/* NEURAL COMMAND BAR */}
            <AnimatePresence>
                {isCommandBarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-start justify-center pt-32 bg-dark-950/80 backdrop-blur-md p-6" onClick={() => setIsCommandBarOpen(false)}>
                        <motion.div initial={{ y: -20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, scale: 0.95 }} className="w-full max-w-2xl bg-[#0D1421] border border-brand/30 rounded-[2rem] shadow-[0_0_50px_rgba(52,211,153,0.2)] overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="p-6 flex items-center gap-4 border-b border-white/5">
                                <Search size={24} className="text-brand" />
                                <input autoFocus placeholder="Neural Search..." className="flex-1 bg-transparent border-none outline-none text-xl font-medium" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                <kbd className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-500 border border-white/10">ESC</kbd>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DIRECTOR'S HEADER */}
            <header className="h-24 px-10 flex justify-between items-center border-b border-white/5 bg-[#05080F]/80 backdrop-blur-3xl relative z-40">
                <div className="flex items-center gap-10">

                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={18} className={`${systemLockdown ? 'text-red-500' : 'text-brand'} animate-pulse`} />
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter">{systemLockdown ? 'EMERGENCY' : 'DIRECTOR'} <span className="text-brand">COMMAND</span></h1>
                        </div>
                        <span className="text-[8px] font-black text-brand uppercase tracking-widest mt-1">{systemTime} | SEC-LEVEL: ALPHA</span>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-brand/30 transition-all" onClick={() => setIsCommandBarOpen(true)}>
                        <Search size={16} className="text-gray-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Neural Search...</span>
                        <kbd className="px-2 py-0.5 bg-white/5 rounded text-[8px] text-gray-600 border border-white/10">⌘K</kbd>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setView('personal-data')}>
                        <div className="text-right">
                            <p className="text-[10px] font-black italic uppercase text-white group-hover:text-brand transition-colors">{user?.name || 'Jordan'}</p>
                            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Chief Director</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-brand/20 border border-brand/40 p-1 group-hover:scale-110 transition-transform">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Jordan'}`} alt="Director" className="w-full h-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto p-10 relative no-scrollbar">
                <div className="relative z-10 max-w-[1800px] mx-auto">
                    <AnimatePresence mode="wait">
                        {view === 'command-deck' && (
                            <motion.div key="deck" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                                {/* OVERRIDES & TELEMETRY */}
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    <div className="lg:col-span-3 bg-dark-900 border border-white/10 rounded-[3.5rem] p-10 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-brand/20 shadow-[0_0_20px_rgba(52,211,153,0.2)]" />
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Master <span className="text-brand">Overrides</span></h3>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Global Network Influence</p>
                                        </div>
                                        <div className="flex-1 w-full space-y-4">
                                            <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Surge Multiplier</span><span className="text-lg font-black italic text-brand">{globalSurge.toFixed(1)}x</span></div>
                                            <input 
                                                type="range" 
                                                min="1" 
                                                max="5" 
                                                step="0.1" 
                                                value={globalSurge} 
                                                onChange={e => {
                                                    const val = parseFloat(e.target.value);
                                                    setGlobalSurge(val);
                                                    localStorage.setItem('green_global_surge', val);
                                                    if (val > 3) triggerNotification('surge', 'Network Saturation', `Global surge has been elevated to ${val}x due to high event density.`);
                                                }} 
                                                className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-brand" 
                                            />
                                        </div>
                                        <button onClick={() => setSystemLockdown(!systemLockdown)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 ${systemLockdown ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500 hover:text-red-500 hover:border-red-500/30'}`}>
                                            <Shield size={14} /> {systemLockdown ? 'SYSTEM LOCKED' : 'SECURE GRID'}
                                        </button>
                                    </div>
                                    <div className="bg-brand/5 border border-brand/20 rounded-[3.5rem] p-10 flex flex-col justify-between relative overflow-hidden">
                                        <div className="absolute -right-8 -bottom-8 opacity-10"><Cpu size={120} className="text-brand" /></div>
                                        <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">IO Latency</p><p className="text-4xl font-black italic text-white">0.4ms</p></div>
                                        <div className="flex items-center justify-between mt-8"><p className="text-xl font-black italic text-white">4.2 TB/s</p><Activity size={24} className="text-brand animate-pulse" /></div>
                                    </div>
                                </div>

                                {/* SECTOR GRID */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 bg-dark-900 border border-white/10 rounded-[3.5rem] p-10 relative group hover:border-brand/30 transition-all">
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-12">Nightlife <span className="text-brand">Network</span></h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                {[{ name: 'Midnight Neon', load: 92 }, { name: 'The Grid Bar', load: 45 }, { name: 'Stadium Zone', load: 12 }].map((v, i) => (
                                                    <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                                                        <div className="flex justify-between items-center mb-4"><span className="text-xs font-black italic text-white uppercase">{v.name}</span><span className="text-[10px] font-black text-brand uppercase">{v.load}%</span></div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${v.load}%` }} className="h-full bg-brand" /></div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-[#05080F] rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center justify-center">
                                                <Radar drivers={drivers} />
                                                <p className="mt-6 text-[10px] font-black text-gray-500 uppercase italic">Proximity Surveillance</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECURE VAULT (PHONE/EMAIL VERIFIED) */}
                                    <div className="bg-[#0D1421] border border-brand/20 rounded-[3.5rem] p-10 flex flex-col relative overflow-hidden shadow-2xl">
                                        <div className="flex items-center gap-6 mb-12">
                                            <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center ${isVaultUnlocked ? 'bg-brand text-dark-900' : 'bg-white/5 text-gray-500'}`}>
                                                {isVaultUnlocked ? <ShieldCheck size={32} /> : <Lock size={32} />}
                                            </div>
                                            <div><h3 className="text-2xl font-black italic uppercase text-white">Secure Vault</h3><p className={`text-[9px] font-black uppercase mt-1 ${isVaultUnlocked ? 'text-brand' : 'text-gray-500'}`}>{isVaultUnlocked ? 'DECRYPTED' : 'AUTH REQUIRED'}</p></div>
                                        </div>

                                        <div className="flex-1">
                                            {isVaultUnlocked ? (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                                    <div className="p-6 bg-brand/10 border border-brand/20 rounded-3xl"><p className="text-xs text-gray-300 italic italic">"All partner PII and clearing settlements are hashed. Last rotation: 12m ago."</p></div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5"><p className="text-[8px] font-black text-gray-500 uppercase">Clearing Pool</p><p className="text-xl font-black italic text-white">€1.42M</p></div>
                                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5"><p className="text-[8px] font-black text-gray-500 uppercase">Escrow</p><p className="text-xl font-black italic text-white">€240k</p></div>
                                                    </div>
                                                </motion.div>
                                            ) : isVerifyingVault ? (
                                                <div className="space-y-6">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Security Code sent to Phone/Email</p>
                                                    <input type="password" placeholder="ENTER 4-DIGIT CODE" maxLength={4} value={vaultOTP} onChange={e => setVaultOTP(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-2xl font-black tracking-[1em] text-brand focus:border-brand/50 outline-none" />
                                                    <button onClick={handleVaultAuth} className="w-full py-4 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest">VERIFY CODE</button>
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                                    <Shield size={48} className="text-gray-800 mb-4" />
                                                    <p className="text-xs text-gray-600 font-medium italic italic">Multi-Factor Phone/Email authentication required for financial clearance.</p>
                                                </div>
                                            )}
                                        </div>
                                        {!isVaultUnlocked && !isVerifyingVault && (
                                            <button onClick={() => setIsVerifyingVault(true)} className="mt-8 w-full py-4 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20">REQUEST ACCESS CODE</button>
                                        )}
                                        {isVaultUnlocked && (
                                            <button onClick={() => setIsVaultUnlocked(false)} className="mt-8 w-full py-4 bg-white/5 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">SEAL VAULT</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === 'agents' && (
                            <motion.div key="agents" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full max-h-[calc(100vh-180px)] grid grid-cols-1 lg:grid-cols-4 gap-10">
                                <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8">Neural <span className="text-brand">Core</span></h2>
                                    
                                    {/* AI VOICE VISUALIZER */}
                                    <div className="p-8 bg-brand/5 border border-brand/20 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer" onClick={() => setIsListening(!isListening)}>
                                        <div className="absolute top-2 right-4 text-[8px] font-black uppercase text-brand/40 italic">Biometric Voice Active</div>
                                        <div className="flex items-center gap-1 h-8 mb-4">
                                            {[...Array(12)].map((_, i) => (
                                                <motion.div 
                                                    key={i}
                                                    animate={isListening ? { height: [8, 32, 12, 28, 8] } : { height: 8 }}
                                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                                                    className="w-1 bg-brand rounded-full"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand">{isListening ? 'LISTENING TO DIRECTOR...' : 'WAITING FOR VOICE COMMAND'}</p>
                                    </div>

                                    {[
                                        { id: 'financial', name: 'Fiscal Sentinel', sub: 'Audits & Payouts', icon: Calculator },
                                        { id: 'law_sentinel', name: 'Legal Counsel', sub: 'German PBefG / GDPR', icon: Scale },
                                        { id: 'intelligence_scout', name: 'Intel Scout', sub: 'Global Market Intel', icon: Globe },
                                        { id: 'architect_sentinel', name: 'System Architect', sub: 'Deployment & Code', icon: Cpu },
                                        { id: 'operations', name: 'Tactical Ops', sub: 'Fleet Optimization', icon: Target },
                                        { id: 'guardian', name: 'Safety Sentinel', sub: 'Bans & Fraud', icon: ShieldAlert }
                                    ].map(agent => (
                                        <button key={agent.id} onClick={() => setActiveAgent(agent.id)} className={`w-full p-6 rounded-[2.5rem] border transition-all flex items-center gap-6 ${activeAgent === agent.id ? 'bg-brand/10 border-brand text-white shadow-xl shadow-brand/10' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeAgent === agent.id ? 'bg-brand text-dark-900' : 'bg-white/5 text-gray-600'}`}><agent.icon size={28} /></div>
                                            <div className="text-left"><p className="text-lg font-black italic uppercase tracking-tighter leading-none">{agent.name}</p><p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">{agent.sub}</p></div>
                                        </button>
                                    ))}
                                </div>

                                <div className="lg:col-span-2 bg-dark-900 border border-white/10 rounded-[3.5rem] flex flex-col overflow-hidden relative">
                                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 bg-brand rounded-full animate-pulse" />
                                            <span className="text-sm font-black uppercase tracking-widest text-brand">{activeAgent.toUpperCase()} INTERFACE</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Audit Logs</button>
                                            <button className="px-4 py-2 bg-brand/10 text-brand border border-brand/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand hover:text-dark-900 transition-all">Cite German Law</button>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-10 overflow-y-auto space-y-8 custom-scrollbar">
                                        {chatMessages[activeAgent]?.map((m, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-6 rounded-[2rem] ${m.role === 'user' ? 'bg-brand text-dark-900 rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none italic font-medium'}`}>
                                                    {m.text}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="p-8 border-t border-white/5 flex gap-4 items-center">
                                        <div className="flex-1 relative group">
                                            <input 
                                                placeholder={`Direct instruction to ${activeAgent} agent...`} 
                                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 pr-14 text-sm focus:border-brand/50 outline-none transition-all" 
                                                value={currentMessage} 
                                                onChange={e => setCurrentMessage(e.target.value)} 
                                                onKeyDown={e => e.key === 'Enter' && sendMessage()} 
                                            />
                                            <button 
                                                onClick={() => setIsListening(!isListening)}
                                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'text-brand bg-brand/10' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                <Radio size={20} className={isListening ? 'animate-pulse' : ''} />
                                            </button>
                                        </div>
                                        <button onClick={sendMessage} className="p-5 bg-brand text-dark-900 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20">
                                            <ArrowUpRight size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* AUTONOMOUS INSIGHT PANEL */}
                                <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Neural <span className="text-brand">Insights</span></h3>
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest italic mb-6">AI Chief of Staff Recommendations</p>
                                    
                                    <div className="space-y-4">
                                        {neuralInsights.map((insight) => (
                                            <motion.div 
                                                key={insight.id}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`p-6 rounded-[2rem] border relative overflow-hidden group ${
                                                    insight.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' : 
                                                    insight.severity === 'high' ? 'bg-amber-500/5 border-amber-500/20' : 
                                                    'bg-brand/5 border-brand/20'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-2 rounded-xl bg-dark-800 ${insight.severity === 'critical' ? 'text-red-500' : insight.severity === 'high' ? 'text-amber-500' : 'text-brand'}`}>
                                                        {insight.type === 'fraud' ? <ShieldAlert size={18} /> : insight.type === 'compliance' ? <FileText size={18} /> : <Scale size={18} />}
                                                    </div>
                                                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${
                                                        insight.severity === 'critical' ? 'bg-red-500/10 text-red-500' : 
                                                        insight.severity === 'high' ? 'bg-amber-500/10 text-amber-500' : 
                                                        'bg-brand/10 text-brand'
                                                    }`}>{insight.severity} Priority</span>
                                                </div>
                                                <h4 className="text-xs font-black uppercase text-white mb-1">{insight.title}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 mb-2 italic">Target: <span className="text-white">{insight.target}</span></p>
                                                <p className="text-[10px] text-gray-500 leading-relaxed mb-4 italic font-medium">"{insight.reason}"</p>
                                                
                                                <div className="p-3 bg-dark-800/50 rounded-xl mb-4 border border-white/5">
                                                    <p className="text-[8px] font-black text-brand/60 uppercase tracking-widest mb-1">Legal Citation</p>
                                                    <p className="text-[9px] font-black text-white italic">{insight.law}</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button onClick={() => handleInsightAction(insight.id, 'approve')} className="flex-1 py-2 bg-brand text-dark-900 rounded-xl text-[8px] font-black uppercase hover:scale-105 transition-all">Approve Recommendation</button>
                                                    <button onClick={() => handleInsightAction(insight.id, 'reject')} className="px-4 py-2 bg-white/5 text-gray-500 rounded-xl text-[8px] font-black uppercase hover:bg-red-500/10 hover:text-red-500 transition-all">Dismiss</button>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {neuralInsights.length === 0 && (
                                            <div className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center">
                                                <CheckCircle2 size={32} className="text-brand mx-auto mb-4 opacity-20" />
                                                <p className="text-[10px] font-black text-gray-600 uppercase italic">All Incidents Cleared. Network Nominal.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === 'settlements' && (
                             <motion.div key="settlements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Settlement <span className="text-amber-500">Ledger</span></h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 space-y-10">
                                        <div className="grid grid-cols-3 gap-8">
                                            {[{ l: 'Daily Flow', v: '€42,120', c: 'text-emerald-500' }, { l: 'Pending Clear', v: '€8,140', c: 'text-amber-500' }, { l: 'Tax Reserve', v: '€12,050', c: 'text-brand' }].map((s, i) => (
                                                <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{s.l}</p>
                                                    <p className={`text-3xl font-black italic tracking-tighter ${s.c}`}>{s.v}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-dark-900 border border-white/10 rounded-[3.5rem] p-10 space-y-8">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black italic uppercase text-white">Weekly Payout Clearance</h3>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Awaiting Super Admin Release</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white"><Filter size={18} /></button>
                                                    <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white"><Download size={18} /></button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { name: 'Hessen EcoFleet', amount: '€14,240.00', id: 'P-100', industry: 'Logistics' },
                                                    { name: 'Saffron Fine Dining', amount: '€8,120.50', id: 'P-202', industry: 'Restaurant' },
                                                    { name: 'Blue Velvet Bar', amount: '€5,440.00', id: 'P-088', industry: 'Nightlife' },
                                                    { name: 'Green Stadium Arena', amount: '€22,900.00', id: 'P-505', industry: 'Events' }
                                                ].map((p, i) => (
                                                    <div key={i} className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-white/10 transition-all group">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-2xl bg-dark-800 flex items-center justify-center text-gray-600 group-hover:text-brand transition-colors"><Database size={28} /></div>
                                                            <div>
                                                                <p className="text-xl font-black italic uppercase text-white tracking-tighter">{p.name}</p>
                                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1 italic">PRIME-ID: {p.id} | Week 18 Settlement</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-10">
                                                            <div className="text-right">
                                                                <p className="text-2xl font-black italic text-brand tracking-tighter">{p.amount}</p>
                                                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">PENDING RELEASE</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    triggerNotification('success', 'Settlement Released', `€${p.amount} has been successfully dispatched to ${p.name}`);
                                                                }}
                                                                className="px-8 py-4 bg-brand text-dark-900 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-brand/10 hover:scale-105 active:scale-95 transition-all"
                                                            >
                                                                Approve Payout
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-10">
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[3.5rem] p-10 space-y-8">
                                            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-dark-900"><DollarSign size={24} /></div><h4 className="text-2xl font-black italic uppercase text-white">Revenue Filter</h4></div>
                                            <p className="text-sm text-amber-500/80 italic italic">"Filter high-density spending patterns to identify sellable demographic insights for retail partners."</p>
                                            <div className="space-y-4 pt-4">
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Sellable Data</span><span className="text-sm font-black text-white italic">4.2 GB</span></div>
                                                <button className="w-full py-5 bg-amber-500 text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">EXTRACT MARKET REPORT</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </motion.div>
                        )}

                        {view === 'feedback' && (
                            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-4">
                                        <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Feedback <span className="text-brand">Hub</span></h2>
                                        <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em]">Global Surveillance & Sentiment Analysis</p>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-[2.5rem]">
                                        <select value={feedbackFilter.category} onChange={e => setFeedbackFilter({...feedbackFilter, category: e.target.value})} className="bg-transparent text-[10px] font-black uppercase tracking-widest text-brand outline-none cursor-pointer"><option value="all">ALL SECTORS</option><option value="fleet">FLEET</option><option value="restaurant">RESTAURANTS</option><option value="hotel">HOTELS</option><option value="stadium">STADIUM</option></select>
                                        <div className="w-px h-6 bg-white/10 mx-2" />
                                        <input type="date" className="bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-500 outline-none" onChange={e => setFeedbackFilter({...feedbackFilter, date: e.target.value})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 space-y-6">
                                        {[
                                            { type: 'Fleet', id: 'DR-492', location: 'Frankfurt Sector 2', date: '2024-05-01', time: '22:14', rating: 1, text: 'Driver was late and the vehicle cleanliness was subpar for the Executive tier.', user: 'Marcus G.' },
                                            { type: 'Restaurant', id: 'Midnight Neon', location: 'Zeil District', date: '2024-05-01', time: '23:45', rating: 5, text: 'Incredible atmosphere and the fast-track entry via the app worked flawlessly.', user: 'Elena V.' },
                                            { type: 'Stadium', id: 'Commerzbank Arena', location: 'South Gate', date: '2024-05-01', time: '19:30', rating: 4, text: 'Shuttle frequency was high, but boarding needs better organization.', user: 'Hansi M.' },
                                            { type: 'Hotel', id: 'Grand Frankfurt', location: 'Main River', date: '2024-04-30', time: '09:12', rating: 5, text: 'Seamless checkout experience. The Director level concierge was helpful.', user: 'Sophie K.' }
                                        ].filter(f => feedbackFilter.category === 'all' || f.type.toLowerCase() === feedbackFilter.category).map((f, i) => (
                                            <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[3rem] hover:border-brand/30 transition-all group relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${f.rating < 3 ? 'bg-red-500/10 text-red-500' : 'bg-brand/10 text-brand'}`}>
                                                            {f.type === 'Fleet' ? <Car size={28} /> : f.type === 'Stadium' ? <Target size={28} /> : <Building2 size={28} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl font-black italic uppercase text-white tracking-tighter">{f.id}</span>
                                                                <span className="px-3 py-1 bg-white/5 rounded text-[8px] font-black text-gray-500 uppercase">{f.type}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1 text-gray-500">
                                                                <MapPin size={10} />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">{f.location}</span>
                                                                <Clock size={10} className="ml-2" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">{f.date} {f.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < f.rating ? 'currentColor' : 'none'} className={i < f.rating ? (f.rating < 3 ? 'text-red-500' : 'text-brand') : 'text-gray-800'} />)}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-400 italic leading-relaxed pl-20">"{f.text}"</p>
                                                <div className="mt-6 pl-20 flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-gray-600 uppercase italic">— {f.user}</span>
                                                    <div className="flex gap-4">
                                                        <button className="text-[9px] font-black text-brand uppercase tracking-widest hover:underline">Flag Integrity</button>
                                                        <button className="text-[9px] font-black text-white bg-white/10 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-brand hover:text-dark-900 transition-all">Direct Response</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-8">
                                        <div className="bg-brand/5 border border-brand/20 rounded-[3.5rem] p-10">
                                            <h4 className="text-xl font-black italic uppercase text-white mb-6">Sentiment Pulse</h4>
                                            <div className="space-y-6">
                                                {[{ l: 'Fleet Satisfaction', v: 88, c: 'bg-brand' }, { l: 'Venue Vibes', v: 94, c: 'bg-emerald-500' }, { l: 'Stadium Flow', v: 72, c: 'bg-amber-500' }].map((s, i) => (
                                                    <div key={i} className="space-y-2">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic text-gray-500"><span>{s.l}</span><span>{s.v}%</span></div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${s.c}`} style={{ width: `${s.v}%` }} /></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === 'fleet' && (
                            <motion.div key="fleet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Live <span className="text-emerald-500">Fleet</span> Telemetry</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {['Active Units', 'On Trip', 'Idle/Standby', 'Emergency'].map((label, i) => (
                                        <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</p>
                                            <p className="text-4xl font-black italic text-white tracking-tighter">{[64, 42, 18, 4][i]}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-dark-900 border border-white/10 rounded-[3.5rem] p-10 h-[500px] relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/8.68,50.11,10/1000x500?access_token=pk.placeholder')] bg-cover" />
                                    <div className="relative z-10 h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <Car size={64} className="text-emerald-500 mx-auto mb-6 animate-bounce" />
                                            <p className="text-xl font-black italic uppercase text-white">Grid Intelligence Loading...</p>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 italic italic italic">Secure GPS Tunnel Established</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === 'hotels' && (
                            <motion.div key="hotels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter">VIP <span className="text-blue-500">Hospitality</span> Logistics</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {['Grand Frankfurt Palace', 'The Steigenberger', 'Marriott Executive', 'River Main Suites'].map((hotel, i) => (
                                        <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[3rem] flex justify-between items-center group hover:border-blue-500/30 transition-all">
                                            <div className="flex items-center gap-8">
                                                <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Building2 size={32} /></div>
                                                <div><p className="text-2xl font-black italic uppercase text-white tracking-tighter">{hotel}</p><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Status: Premium Partner</p></div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-black italic text-white tracking-tighter">{Math.floor(Math.random() * 20)}</p>
                                                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Active Bookings</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {view === 'clubs' && (
                            <motion.div key="clubs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Nightlife <span className="text-brand">Heatmap</span></h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 bg-[#05080F] border border-white/5 rounded-[3.5rem] p-12 h-[600px] flex items-center justify-center relative overflow-hidden">
                                        <Radar drivers={drivers} />
                                        <div className="absolute top-10 left-10 p-6 bg-brand/10 border border-brand/20 rounded-2xl backdrop-blur-md">
                                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Peak Intensity</p>
                                            <p className="text-2xl font-black italic text-white">Zeil District</p>
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        {['The Vault', 'Neon Sky', 'Green Club'].map((club, i) => (
                                            <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[3rem] space-y-6">
                                                <div className="flex justify-between items-center"><p className="text-xl font-black italic uppercase text-white">{club}</p><Zap size={18} className="text-brand" /></div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[8px] font-black uppercase text-gray-500"><span>Capacity</span><span>{Math.floor(Math.random() * 40 + 60)}%</span></div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-brand" style={{ width: `${Math.random() * 100}%` }} /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === 'events' && (
                            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Strategic <span className="text-amber-500">Calendar</span></h2>
                                <div className="bg-dark-900 border border-white/10 rounded-[3.5rem] p-10 overflow-hidden">
                                    <div className="grid grid-cols-7 gap-4 mb-10">
                                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <div key={d} className="text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">{d}</div>)}
                                        {[...Array(31)].map((_, i) => (
                                            <div key={i} className={`h-24 rounded-2xl border border-white/5 p-4 flex flex-col justify-between hover:bg-brand/5 transition-all group cursor-pointer ${[12, 14, 21].includes(i+1) ? 'bg-brand/10 border-brand/20' : 'bg-white/5'}`}>
                                                <span className="text-xs font-black italic text-gray-500 group-hover:text-white transition-colors">{i + 1}</span>
                                                {[12, 14, 21].includes(i+1) && <div className="w-full h-1 bg-brand rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-8 bg-brand/10 border border-brand/20 rounded-[2.5rem] flex items-center gap-8">
                                        <div className="w-16 h-16 bg-brand rounded-[1.5rem] flex items-center justify-center text-dark-900"><Calendar size={32} /></div>
                                        <div><p className="text-2xl font-black italic uppercase text-white tracking-tighter">Stadium Main Event</p><p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">May 14th | Deployment: Full Fleet</p></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === 'system-doors' && (
                            <motion.div key="doors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Portal <span className="text-brand">Doors</span></h2>
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em]">Seamless Cross-Platform Orchestration</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {[
                                        { label: 'Customer Portal', sub: 'Rider Interface', color: 'bg-blue-500', path: '/home', icon: Globe },
                                        { label: 'Driver Portal', sub: 'Fleet Interface', color: 'bg-brand', path: '/driver', icon: Car },
                                        { id: 'manager', label: 'Manager Portal', sub: 'Fleet Operations', color: 'bg-amber-500', path: '/manager', icon: Briefcase }
                                    ].map((door, i) => (
                                        <button key={i} onClick={() => window.open(door.path, '_blank')} className="group p-10 bg-dark-900 border border-white/10 rounded-[3.5rem] flex flex-col items-center text-center space-y-8 hover:border-white/30 transition-all hover:scale-[1.02]">
                                            <div className={`w-24 h-24 ${door.color} rounded-[2.5rem] flex items-center justify-center text-dark-900 shadow-2xl group-hover:scale-110 transition-transform`}><door.icon size={48} /></div>
                                            <div><p className="text-3xl font-black italic uppercase text-white tracking-tighter">{door.label}</p><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">{door.sub}</p></div>
                                            <div className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Enter Door</div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {view === 'app-settings' && (
                            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter">System <span className="text-brand">Settings</span> & Compliance</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="p-10 bg-dark-900 border border-white/10 rounded-[3.5rem] space-y-10">
                                        <h3 className="text-2xl font-black italic uppercase text-white">Global Config</h3>
                                        {[{ label: 'System Language', sub: 'Neural Translation (DE/EN/ES)', status: 'ACTIVE' }, { label: 'Auth Protocol', sub: 'Dual-Vector (Email/Phone)', status: 'ENABLED' }, { label: 'Invisible Routing', sub: '180-Day Moratorium active', status: 'LOCKED' }].map((setting, i) => (
                                            <div key={i} className="flex justify-between items-center pb-8 border-b border-white/5 last:border-0 last:pb-0">
                                                <div><p className="text-xl font-black italic uppercase text-white">{setting.label}</p><p className="text-[10px] font-black text-gray-500 uppercase mt-1 italic italic italic italic">{setting.sub}</p></div>
                                                <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl text-[10px] font-black text-brand uppercase">{setting.status}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-10 bg-dark-900 border border-white/10 rounded-[3.5rem] space-y-10">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-2xl font-black italic uppercase text-white">Compliance & Legal</h3>
                                            <ShieldCheck size={24} className="text-brand" />
                                        </div>
                                        <div className="space-y-6">
                                            {[
                                                { label: 'Privacy Protocol', sub: 'GDPR / Data Monetization v1.0', icon: Shield },
                                                { label: 'Terms of Service', sub: 'Operational Mandate v1.0', icon: FileText }
                                            ].map((policy, i) => (
                                                <button key={i} className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-brand/30 transition-all text-left">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-brand"><policy.icon size={20} /></div>
                                                        <div><p className="text-lg font-black italic uppercase text-white leading-tight">{policy.label}</p><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{policy.sub}</p></div>
                                                    </div>
                                                    <ChevronRight size={20} className="text-gray-700 group-hover:text-brand" />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="pt-6">
                                            <button className="w-full py-5 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] font-black shadow-xl shadow-brand/20 hover:scale-[1.02] transition-all">COMMIT POLICIES</button>
                                        </div>
                                    </div>
                                    <div className="p-10 bg-[#0D1421] border border-white/10 rounded-[3.5rem] flex flex-col justify-between">
                                        <div className="space-y-6">
                                            <h4 className="text-xl font-black italic uppercase text-white">Security Patch</h4>
                                            <p className="text-xs text-gray-500 italic leading-relaxed italic italic">"Latest firmware v1.2.4-ALPHA deployed. All Director access logs are encrypted and hashed on cold-storage."</p>
                                        </div>
                                        <button className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Audit Security Logs</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === 'customer-service' && (
                            <motion.div key="customer-service" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 bg-dark-900 border border-white/10 rounded-[3.5rem] space-y-6 group hover:border-brand/30 transition-all">
                                        <div className="flex items-center gap-4"><Car size={24} className="text-brand" /><h3 className="text-xl font-black italic uppercase text-white">Partner & Driver Intel</h3></div>
                                        <div className="relative">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input placeholder="Search by Name or PRIME-ID (e.g. P-100)..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-sm outline-none focus:border-brand/50" />
                                        </div>
                                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                            {['P-100-22 (Hessen)', 'D-044-01 (Berlin)', 'P-202-09 (Zeil)'].map(id => <span key={id} className="px-4 py-2 bg-white/5 rounded-xl text-[8px] font-black text-gray-500 border border-white/5 cursor-pointer hover:text-brand transition-colors whitespace-nowrap">{id}</span>)}
                                        </div>
                                    </div>
                                    <div className="p-8 bg-dark-900 border border-white/10 rounded-[3.5rem] space-y-6 group hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-4"><UserIcon size={24} className="text-blue-500" /><h3 className="text-xl font-black italic uppercase text-white">Customer Intelligence</h3></div>
                                        <div className="relative">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input placeholder="Search by Name or C-ID (e.g. C-404)..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-sm outline-none focus:border-blue-500/50" />
                                        </div>
                                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                            {['C-992-01 (Sarah)', 'C-404-12 (Marcus)', 'C-112-88 (Elena)'].map(id => <span key={id} className="px-4 py-2 bg-white/5 rounded-xl text-[8px] font-black text-gray-500 border border-white/5 cursor-pointer hover:text-blue-500 transition-colors whitespace-nowrap">{id}</span>)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-10 h-[700px]">
                                    <div className="w-[450px] bg-dark-900 border border-white/10 rounded-[3.5rem] flex flex-col overflow-hidden">
                                        <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <h3 className="text-xl font-black italic uppercase text-white">Live Communications</h3>
                                            <div className="px-3 py-1 bg-brand/20 text-brand text-[8px] font-black rounded-full">ACTIVE SESSION</div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                                            {[
                                                { id: 'P-100-22', user: 'Marc K.', type: 'Partner', subject: 'Payout Delay', time: '2m ago', wait: '12m' },
                                                { id: 'C-992-01', user: 'Sarah L.', type: 'Customer', subject: 'LOST ITEM: IPHONE', time: '15m ago', wait: '4m', category: 'lost-item' },
                                                { id: 'D-044-01', user: 'Hessen Fleet', type: 'Partner', subject: 'API Handshake Error', time: '1h ago', wait: '1h' }
                                            ].map((msg, i) => (
                                                <button key={i} className={`w-full p-6 rounded-[2.5rem] border transition-all text-left group relative ${msg.category === 'lost-item' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5 hover:border-brand/30'}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${msg.type === 'Partner' ? 'bg-blue-500/20 text-blue-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{msg.type}</span>
                                                                <span className="text-[10px] font-black text-white group-hover:text-brand transition-colors">{msg.user}</span>
                                                            </div>
                                                            <p className="text-[8px] font-black text-gray-500 mt-1 uppercase tracking-widest">PRIME-ID: {msg.id}</p>
                                                        </div>
                                                        <span className="text-[8px] font-bold text-gray-700 uppercase">{msg.time}</span>
                                                    </div>
                                                    <p className={`text-xs font-bold mb-4 ${msg.category === 'lost-item' ? 'text-amber-500' : 'text-gray-500'}`}>{msg.subject}</p>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2 text-brand">
                                                            <Clock size={12} />
                                                            <span className="text-[9px] font-black uppercase">Wait: {msg.wait}</span>
                                                        </div>
                                                        <ChevronRight size={14} className="text-gray-700 group-hover:text-brand" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-dark-900 border border-white/10 rounded-[3.5rem] flex flex-col overflow-hidden relative">
                                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 p-1">
                                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" className="w-full h-full rounded-2xl shadow-2xl" />
                                                </div>
                                                <div>
                                                    <p className="text-3xl font-black italic uppercase text-white tracking-tighter">Sarah L.</p>
                                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mt-1">PRIME-ID: C-992-01</p>
                                                    <div className="flex gap-4 mt-2">
                                                        <span className="text-[8px] font-black text-gray-500 uppercase">Customer Tier: <span className="text-amber-500">PLATINUM</span></span>
                                                        <span className="text-[8px] font-black text-gray-500 uppercase">Protocol: <span className="text-red-500">LOST ITEM ACTIVE</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button className="px-6 py-3 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all">
                                                    <Phone size={14} /> CALL (INVISIBLE)
                                                </button>
                                                <button className="px-6 py-3 bg-amber-500 text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                                    LOST ITEM INVESTIGATION
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-12 overflow-y-auto space-y-8 no-scrollbar">
                                            <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] space-y-6">
                                                <div className="flex items-center gap-4 text-amber-500"><Shield size={24} /><h4 className="text-xl font-black italic uppercase">Asset Recovery Protocol</h4></div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                                        <p className="text-[8px] font-black text-gray-500 uppercase mb-2">Target Vehicle</p>
                                                        <p className="text-sm font-black italic text-white uppercase">V-882 (Hessen Fleet)</p>
                                                        <button className="mt-4 w-full py-3 bg-amber-500 text-dark-900 rounded-xl text-[8px] font-black uppercase tracking-widest">Instruct Driver: Keep Safe</button>
                                                    </div>
                                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                                        <p className="text-[8px] font-black text-gray-500 uppercase mb-2">Venue Match</p>
                                                        <p className="text-sm font-black italic text-white uppercase">Midnight Neon Bar</p>
                                                        <button className="mt-4 w-full py-3 bg-white/10 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">Verify Found Status</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6 italic font-medium text-gray-400">
                                                <div className="flex justify-start"><div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] rounded-tl-none max-w-[70%] text-sm">Hello, I think I left my iPhone 15 in the car from Zeil District. It has a blue case. Please help!</div></div>
                                                <div className="flex justify-end"><div className="bg-amber-500 text-dark-900 p-6 rounded-[2rem] rounded-tr-none max-w-[70%] text-sm font-black">Scanning vehicle telemetry... Driver P-044 confirms an object was found. I am instructing him to keep it safe at the Central Hub. You can retrieve it at any time.</div></div>
                                            </div>
                                        </div>
                                        <div className="p-8 border-t border-white/5 flex gap-6 items-center">
                                            <input placeholder="Coordinate return with customer..." className="flex-1 bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-sm outline-none focus:border-brand/50" />
                                            <button className="p-5 bg-brand text-dark-900 rounded-2xl hover:scale-105 transition-all"><ArrowUpRight size={24} /></button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === 'staff-hub' && (
                            <motion.div key="staff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Intelligence <span className="text-brand">Staff</span></h2>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Operational Personnel Management</p>
                                    </div>
                                    <button onClick={() => setIsAddStaffModalOpen(true)} className="px-8 py-4 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20">+ ADD NEW STAFF</button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    {staffList.map((s, i) => (
                                        <div key={i} className="p-8 bg-dark-900 border border-white/10 rounded-[3.5rem] space-y-8 group hover:border-brand/30 transition-all relative overflow-hidden">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 p-1 relative overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.img}`} className="w-full h-full rounded-[1.5rem]" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                        <Upload size={20} className="text-brand" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black italic uppercase text-white tracking-tighter">{s.name}</p>
                                                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1">{s.role}</p>
                                                    <p className="text-[8px] font-black text-gray-600 uppercase mt-1">ID: {s.id}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest"><span className="text-gray-600 italic">Email</span><span className="text-white">{s.email}</span></div>
                                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest"><span className="text-gray-600 italic">Phone</span><span className="text-white">{s.phone}</span></div>
                                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest"><span className="text-gray-600 italic">Address</span><span className="text-white text-right w-40">{s.adress}</span></div>
                                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest"><span className="text-gray-600 italic">ZIP</span><span className="text-white">{s.zip}</span></div>
                                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest"><span className="text-gray-600 italic">Bank PII</span><span className="text-brand text-[8px]">{s.bank}</span></div>
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button className="flex-1 py-4 bg-white/5 rounded-2xl text-[8px] font-black uppercase text-gray-500 hover:text-white transition-all">EDIT DOSSIER</button>
                                                <button onClick={() => setStaffList(staffList.filter((_, idx) => idx !== i))} className="px-6 py-4 bg-red-500/10 text-red-500 rounded-2xl text-[8px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">REVOKE</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {view === 'personal-data' && (
                            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <div className="flex items-center gap-10">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-32 h-32 rounded-[3rem] bg-brand/20 border border-brand/40 p-2 shadow-2xl relative group overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Jordan'}`} alt="Director" className="w-full h-full rounded-[2.5rem]" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                <Upload size={24} className="text-brand" />
                                            </div>
                                        </div>
                                        <div className="px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-xl">
                                            <p className="text-[10px] font-black text-brand tracking-[0.3em] uppercase">ID: {user?.id || 'D-000-01'}</p>
                                        </div>
                                    </div>
                                    <div><h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">{user?.name || 'Chief Director'}</h2><p className="text-brand text-sm font-bold uppercase tracking-[0.5em] mt-2 italic">Clearance Level: ALPHA PRIME</p></div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 bg-dark-900 border border-white/10 rounded-[3.5rem] p-12 space-y-10">
                                        <h3 className="text-2xl font-black italic uppercase text-white">Identity Dossier</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                {[
                                                    { label: 'Full Name', value: user?.name || 'Jordan Executive', icon: UserIcon },
                                                    { label: 'Director Email', value: 'jordan@green.io', icon: Mail },
                                                    { label: 'Secure Phone', value: '+49 152 4492 001', icon: Phone },
                                                    { label: 'Operational Address', value: 'Sky Tower 1, Main Plaza, Frankfurt', icon: MapPin }
                                                ].map((d, i) => (
                                                    <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-1">
                                                        <div className="flex items-center gap-2 text-gray-500 mb-2"><d.icon size={12} /><span className="text-[9px] font-black uppercase tracking-widest">{d.label}</span></div>
                                                        <input defaultValue={d.value} className="bg-transparent text-sm font-black italic text-white outline-none w-full" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-6">
                                                {[
                                                    { label: 'ZIP Code', value: '60311', icon: MapPin },
                                                    { label: 'Bank (IBAN)', value: 'DE99 2004 0000 1294 55', icon: Wallet },
                                                    { label: 'Tax ID', value: 'DE-88-129-44', icon: FileText },
                                                    { label: 'Emergency Contact', value: 'Guardian AI Alpha', icon: ShieldCheck }
                                                ].map((d, i) => (
                                                    <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-1">
                                                        <div className="flex items-center gap-2 text-gray-500 mb-2"><d.icon size={12} /><span className="text-[9px] font-black uppercase tracking-widest">{d.label}</span></div>
                                                        <input defaultValue={d.value} className="bg-transparent text-sm font-black italic text-white outline-none w-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="pt-6">
                                            <button className="w-full py-5 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] transition-all">COMMIT CHANGES TO GRID</button>
                                        </div>
                                    </div>
                                    <div className="bg-brand/5 border border-brand/20 rounded-[3.5rem] p-12 flex flex-col justify-center items-center text-center space-y-8">
                                        <ShieldCheck size={64} className="text-brand animate-pulse" />
                                        <p className="text-xl font-black italic uppercase text-white leading-tight">Identity Session <br/> Verified & Secure</p>
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">All changes are encrypted via AES-256 and require a 24h cooldown for PII propagation.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* ADD STAFF MODAL */}
            <AnimatePresence>
                {isAddStaffModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-dark-950/90 backdrop-blur-xl p-6">
                        <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.9 }} className="w-full max-w-4xl bg-[#0D1421] border border-brand/30 rounded-[3.5rem] shadow-[0_0_100px_rgba(52,211,153,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center text-brand"><Users size={32} /></div>
                                    <div><h3 className="text-3xl font-black italic uppercase text-white">Onboard <span className="text-brand">Staff</span></h3><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Personnel PII Collection</p></div>
                                </div>
                                <button onClick={() => setIsAddStaffModalOpen(false)} className="p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all"><X size={24} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        {[
                                            { l: 'Full Name', f: 'name', ph: 'e.g. Jordan Weber', i: UserIcon },
                                            { l: 'Operational Email', f: 'email', ph: 'staff@green.io', i: Mail },
                                            { l: 'Secure Phone', f: 'phone', ph: '+49...', i: Phone },
                                            { l: 'Residential Address', f: 'adress', ph: 'Street, Number, City', i: MapPin }
                                        ].map((inp, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex items-center gap-2 text-gray-500"><inp.i size={12} /><span className="text-[10px] font-black uppercase tracking-widest">{inp.l}</span></div>
                                                <input value={newStaff[inp.f]} onChange={e => setNewStaff({...newStaff, [inp.f]: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm outline-none focus:border-brand/50" placeholder={inp.ph} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-6">
                                        {[
                                            { l: 'ZIP Code', f: 'zip', ph: '60311', i: MapPin },
                                            { l: 'Bank (IBAN)', f: 'bank', ph: 'DE99...', i: Wallet },
                                            { l: 'Access Role', f: 'role', ph: 'Customer Service Staff', i: ShieldAlert }
                                        ].map((inp, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex items-center gap-2 text-gray-500"><inp.i size={12} /><span className="text-[10px] font-black uppercase tracking-widest">{inp.l}</span></div>
                                                <input value={newStaff[inp.f]} onChange={e => setNewStaff({...newStaff, [inp.f]: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm outline-none focus:border-brand/50" placeholder={inp.ph} />
                                            </div>
                                        ))}
                                        <div className="p-6 bg-brand/5 border border-brand/20 rounded-3xl mt-8">
                                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-2">Access Level: GAMMA</p>
                                            <p className="text-xs text-gray-500 italic">"Staff added via this terminal will have restricted view access limited to the Customer Service Hub."</p>
                                        </div>

                                        {/* Personnel Transfer Requests */}
                                        <div className="mt-12 space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-xl font-black italic uppercase text-white">Personnel Transfers</h3>
                                                <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[8px] font-black rounded uppercase tracking-widest">Awaiting Approval</span>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { id: 'TR-01', name: 'Marcus H.', from: 'Green Fleet', to: 'Midnight Club', date: 'Just now' },
                                                    { id: 'TR-02', name: 'Sarah K.', from: 'Eco-Wash', to: 'Blue Velvet Bar', date: '2h ago' }
                                                ].map((req) => (
                                                    <div key={req.id} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 hover:border-violet-500/30 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                                                                <Users size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black italic uppercase text-white">{req.name}</p>
                                                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Request: {req.from} → {req.to}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button className="px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase rounded-xl hover:bg-red-500/20 transition-all">Decline</button>
                                                            <button 
                                                                onClick={() => {
                                                                    triggerNotification('transfer', 'Transfer Approved', `${req.name} has been successfully moved to ${req.to}`);
                                                                }}
                                                                className="px-6 py-2 bg-brand text-dark-900 text-[9px] font-black uppercase rounded-xl shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                                                            >
                                                                Approve Transfer
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 border-t border-white/5 bg-white/5">
                                <button onClick={handleAddStaff} className="w-full py-6 bg-brand text-dark-900 rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] shadow-[0_0_50px_rgba(52,211,153,0.3)] hover:scale-[1.02] transition-all">GRANT STAFF CLEARANCE</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SYSTEM STATUS FOOTER */}
            <footer className="h-12 px-10 border-t border-white/5 bg-[#05080F]/80 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-gray-600">
                <div className="flex gap-12 items-center">
                    <div className="flex items-center gap-3"><div className={`w-1.5 h-1.5 rounded-full animate-pulse ${systemLockdown ? 'bg-red-500' : 'bg-emerald-500'}`} /><span>GRID: {systemLockdown ? 'LOCKED' : 'ONLINE'}</span></div>
                    <div className="flex items-center gap-3"><Cpu size={12} className="text-brand" /><span>CPU: 12.4%</span></div>
                    <div className="flex items-center gap-3"><ShieldCheck size={12} className={isVaultUnlocked ? 'text-brand' : 'text-gray-700'} /><span>VAULT: {isVaultUnlocked ? 'OPEN' : 'SEALED'}</span></div>
                </div>
                <div className="flex gap-8">
                    <span className="text-brand/50">ENCRYPTION: AES-256-SHA3</span>
                    <span className="text-gray-700">PRIME-ID: {user?.id?.slice(0,8) || 'D-000-01'}</span>
                </div>
            </footer>

            {/* --- FLOATING NEURAL ASSISTANT (ALWAYS ON) --- */}
            <div className="fixed bottom-20 right-10 z-[100] flex flex-col items-end gap-4 pointer-events-none">
                <AnimatePresence>
                    {isAssistantExpanded && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-80 bg-[#0D1421]/95 backdrop-blur-2xl border border-brand/20 rounded-[2.5rem] p-6 shadow-[0_0_50px_rgba(52,211,153,0.15)] pointer-events-auto"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-brand/20 border border-brand/40 flex items-center justify-center text-brand">
                                    <Bot size={20} className={isListening ? 'animate-pulse' : ''} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase text-white tracking-widest leading-none">Green Core</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[8px] font-black text-brand uppercase tracking-widest">Chief of Staff</p>
                                        <div className="w-1 h-1 bg-brand rounded-full animate-ping" />
                                        <p className="text-[7px] font-black text-gray-500 uppercase">Sync Active</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* MOBILE SYNC / BACKGROUND MODE */}
                            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-brand/5 hover:border-brand/30 transition-all" onClick={() => setIsListening(!isListening)}>
                                <div className="flex items-center gap-3">
                                    <Phone size={14} className={isListening ? 'text-brand' : 'text-gray-600'} />
                                    <div>
                                        <p className="text-[9px] font-black text-white uppercase">Background Tactical Comm</p>
                                        <p className="text-[7px] font-bold text-gray-500 uppercase italic">Listen while app is in background</p>
                                    </div>
                                </div>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${isListening ? 'bg-brand' : 'bg-white/10'}`}>
                                    <motion.div 
                                        animate={{ x: isListening ? 16 : 2 }}
                                        className={`absolute top-1 w-2 h-2 rounded-full ${isListening ? 'bg-dark-900' : 'bg-gray-600'}`} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar mb-6 pr-2">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-[10px] text-gray-300 leading-relaxed">
                                    "Director, I am currently monitoring 14,204 active fleet signals. I have detected one high-priority fraud pattern. Check the Neural Insights panel."
                                </div>
                            </div>
                            <div className="relative">
                                <input 
                                    placeholder="Instruct AI..." 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-[10px] focus:border-brand/50 outline-none"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-brand hover:scale-110 transition-transform">
                                    <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <button 
                    onClick={() => setIsAssistantExpanded(!isAssistantExpanded)}
                    className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto group ${isAssistantExpanded ? 'bg-brand text-dark-900 rotate-90' : 'bg-dark-900 border border-brand/40 text-brand'}`}
                >
                    <motion.div animate={isAssistantExpanded ? { rotate: -90 } : { rotate: 0 }}>
                        {isAssistantExpanded ? <X size={24} /> : <Zap size={24} className="group-hover:animate-pulse" />}
                    </motion.div>
                    {!isAssistantExpanded && neuralInsights.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#05080F]">
                            {neuralInsights.length}
                        </span>
                    )}
                </button>
            </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
