import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    History,
    Map,
    Building2,
    Briefcase,
    CreditCard,
    Wallet,
    Menu,
    X,
    Car,
    Zap,
    DollarSign,
    Star,
    LayoutDashboard,
    FileText,
    Users,
    Activity,
    ArrowUpRight,
    Search,
    MapPin,
    Calendar,
    ChevronRight,
    Clock,
    CheckCircle,
    Droplets,
    Handshake,
    ArrowDownRight,
    GlassWater,
    Utensils,
    BedDouble,
    Flame,
    Receipt,
    Timer,
    PlusCircle,
    ShieldCheck,
    Upload,
    Settings,
    User,
    CheckCircle2,
    CloudSun,
    BarChart3,
    ArrowLeft,
    Image as ImageIcon,
    Video,
    Smartphone,
    ShoppingBag,
    Trash2,
    ShieldAlert,
    Bot,
    Sparkles,
    Shield,
    Layers,
    Target,
    QrCode,
    Ticket,
    Trophy,
    Box,
    Languages,
    Search as SearchIcon,
    Heart,
    MessageCircle,
    Share2,
    Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Radar from '../components/Radar';
import { useLanguage } from '../context/LanguageContext';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { lang, setLang } = useLanguage();
    const [view, setView] = useState('overview');
    const [editingStaffIndex, setEditingStaffIndex] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [langSearch, setLangSearch] = useState('');
    const [isLangExpanded, setIsLangExpanded] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null); // 'processing', 'complete'
    const [previewUrl, setPreviewUrl] = useState(null);
    const [broadcastCaption, setBroadcastCaption] = useState('');

    const allLanguages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'de', name: 'German', native: 'Deutsch' },
        { code: 'fa', name: 'Persian', native: 'فارسی' },
        { code: 'fr', name: 'French', native: 'Français' },
        { code: 'es', name: 'Spanish', native: 'Español' },
        { code: 'it', name: 'Italian', native: 'Italiano' },
        { code: 'tr', name: 'Turkish', native: 'Türkçe' },
        { code: 'ar', name: 'Arabic', native: 'العربية' },
        { code: 'zh', name: 'Chinese', native: '中文' },
        { code: 'ja', name: 'Japanese', native: '日本語' },
        { code: 'ru', name: 'Russian', native: 'Русский' }
    ];

    const filteredLangs = allLanguages.filter(l => 
        l.name.toLowerCase().includes(langSearch.toLowerCase()) || 
        l.native.toLowerCase().includes(langSearch.toLowerCase()) ||
        l.code.toLowerCase().includes(langSearch.toLowerCase())
    );
    
    // Permission Guard Logic
    const hasPermission = (viewId) => {
        if (user?.role === 'manager') return true; // Managers have global access
        if (user?.role === 'staff') {
            // Mock permissions for Staff (these would come from the database in production)
            const staffPermissions = user?.permissions || ['overview', 'orders', 'feed', 'inbox', 'support', 'settings'];
            return staffPermissions.includes(viewId);
        }
        return false;
    };
    const [staffList, setStaffList] = useState([
        { name: 'Lukas Meyer', role: 'Floor Manager', status: 'On Shift', avatar: 'Lukas', permissions: ['Orders', 'Feed', 'Terminal'] },
        { name: 'Anja Schmidt', role: 'Receptionist', status: 'On Shift', avatar: 'Anja', permissions: ['Feed', 'Terminal'] },
        { name: 'Marc Becker', role: 'Staff Pilot', status: 'Offline', avatar: 'Marc', permissions: ['Terminal'] }
    ]);
    
    // Determine the initial context based on manager email/identity
    const getInitialContext = () => {
        if (user?.businessType) return user.businessType;
        if (user?.email?.includes('bar')) return 'BM';
        if (user?.email?.includes('restaurant') || user?.email?.includes('food')) return 'RM';
        if (user?.email?.includes('hotel') || user?.email?.includes('palace')) return 'HM';
        if (user?.email?.includes('club') || user?.email?.includes('party')) return 'CM';
        if (user?.email?.includes('park')) return 'PM';
        if (user?.email?.includes('wash')) return 'WM';
        if (user?.email?.includes('stadium')) return 'SM';
        return 'FM'; // Default to Fleet Manager
    };

    const [managerContext, setManagerContext] = useState(() => {
        const ctx = getInitialContext();
        localStorage.setItem('green_manager_context', ctx);
        return ctx;
    });

    // Mock Business Data based on context
    const getBusinessName = (ctx = managerContext) => {
        switch(ctx) {
            case 'BM': return "The Blue Velvet Bar";
            case 'RM': return "Saffron Fine Dining";
            case 'HM': return "Green Palace & Spa";
            case 'CM': return "Midnight Club & Lounge";
            case 'PM': return "Hauptwache Parkhaus";
            case 'WM': return "Eco-Wash Zentrum";
            case 'VM': return "Veranstaltung: Gala 2026";
            case 'SM': return "Green Stadium Arena";
            default: return "Green Fleet Operations";
        }
    };

    const [isInternalSidebarCollapsed, setIsInternalSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [securityPassword, setSecurityPassword] = useState('1234'); 
    const [passInput, setPassInput] = useState('');
    const [showSecurityGate, setShowSecurityGate] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [resetStep, setResetStep] = useState('verify'); 
    const [orderFilter, setOrderFilter] = useState('All');
    const [orderSearch, setOrderSearch] = useState('');


    // STAFF ONBOARDING STATE
    const [staffSearchId, setStaffSearchId] = useState('');
    const [foundStaff, setFoundStaff] = useState(null);
    const [isSearchingStaff, setIsSearchingStaff] = useState(false);
    const [staffPermissions, setStaffPermissions] = useState({ 
        orders: true, 
        terminal: true, 
        marketing: false, 
        finance: false, 
        compliance: false 
    });
    const [activeTemplate, setActiveTemplate] = useState('pilot');

    const applyTemplate = (templateId) => {
        setActiveTemplate(templateId);
        switch(templateId) {
            case 'pilot':
                setStaffPermissions({ orders: true, terminal: true, marketing: true, finance: false, compliance: false });
                break;
            case 'supervisor':
                setStaffPermissions({ orders: true, terminal: true, marketing: true, finance: true, compliance: false });
                break;
            case 'accountant':
                setStaffPermissions({ orders: false, terminal: false, marketing: false, finance: true, compliance: true });
                break;
            default: break;
        }
    };

    const [isScanningMenu, setIsScanningMenu] = useState(false);
    const [aiDraftMenu, setAiDraftMenu] = useState(null);
    const [menuApprovalPending, setMenuApprovalPending] = useState(false);

    // PARKING AI AGENT STATE
    const [isScanningStructure, setIsScanningStructure] = useState(false);
    const [aiDraftStructure, setAiDraftStructure] = useState(null);
    const [structureApprovalPending, setStructureApprovalPending] = useState(false);
    const [parkingStructure, setParkingStructure] = useState([
        { floor: 0, total: 50, free: 12, spaces: [] },
        { floor: 1, total: 50, free: 48, spaces: [] },
        { floor: -1, total: 50, free: 5, spaces: [] },
        { floor: -2, total: 50, free: 2, spaces: [] }
    ]);

    // CARWASH AI AGENT STATE
    const [isScanningWash, setIsScanningWash] = useState(false);
    const [aiDraftWash, setAiDraftWash] = useState(null);
    const [washApprovalPending, setWashApprovalPending] = useState(false);
    const [carwashServices, setCarwashServices] = useState([
        { id: 1, name: 'Eco-Express', price: 12.00, duration: '8m', type: 'Standard' },
        { id: 2, name: 'Premium Pearl', price: 24.50, duration: '15m', type: 'Premium' },
        { id: 3, name: 'Green Ceramic', price: 45.00, duration: '30m', type: 'Luxury' }
    ]);

    // STADIUM AI AGENT STATE
    const [isScanningSeats, setIsScanningSeats] = useState(false);
    const [aiMatrixResult, setAiMatrixResult] = useState(null);

    const [qrScanStep, setQrScanStep] = useState('idle'); // idle, scanning, result, choices
    const [scannedData, setScannedData] = useState(null);

    const [personalInfo, setPersonalInfo] = useState({
        name: user?.name || 'Authorized Manager',
        email: user?.email || 'admin@green-nightlife.com',
        phone: '+49 152 9821 004',
        address: 'Hauptstraße 12',
        zip: '60311',
        city: 'Frankfurt am Main'
    });

    const [businessInfo, setBusinessInfo] = useState({
        legalName: getBusinessName(),
        address: 'Zeil 106, 60313 Frankfurt',
        email: 'ops@' + (user?.email?.split('@')[1] || 'green.com'),
        phone: '+49 69 1234567'
    });

    const [bankingInfo, setBankingInfo] = useState({
        iban: 'DE44 1234 5678 9012 3456 78',
        bic: 'MARKDEFFXXX',
        bankName: 'Deutsche Bank AG',
        holder: getBusinessName()
    });

    const handleExport = () => {
        alert(`GENERATING DATEV MANIFEST\n--------------------------\nEntity: ${getBusinessName()}\nIndustry Type: ${managerContext}\nTax Jurisdiction: DE/EU\n\nStatus: Encrypted & Industry-Segmented`);
    };

    const [promotions] = useState([
        { id: 1, title: 'Founder Free Shot', target: 'Pioneer 10k', status: 'Active', used: '142' },
        { id: 2, title: 'VIP Table 20% Off', target: 'Pioneer 10k', status: 'Draft', used: '0' },
        { id: 3, title: 'Midnight Snack Box', target: 'Tier 1 Pioneer', status: 'Active', used: '85' }
    ]);

    const fleetDrivers = [
        { id: 1, name: "Marcus H.", car: "Tesla Model 3", status: "In Ride", rating: 4.9, earnings: "€142", lastActive: "Just now" },
        { id: 2, name: "Sarah K.", car: "VW ID.4", status: "Online", rating: 5.0, earnings: "€88", lastActive: "2m ago" },
        { id: 3, name: "Thomas M.", car: "Mercedes EQE", status: "Offline", rating: 4.8, earnings: "€210", lastActive: "1h ago" },
    ];

    // SYNC: Load orders from localStorage
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('green_active_orders');
        if (saved) return JSON.parse(saved);
        return [
            { id: '#8821', guest: 'Sarah J.', items: ['Midnight Neon (2x)', 'Truffle Fries'], total: '€38.00', status: 'Preparing', type: 'Dine-In', time: '12m ago' },
            { id: '#8822', guest: 'Pioneer #042', items: ['Gold Leaf Burger', 'Emerald Cocktail'], total: '€61.00', status: 'Received', type: 'Takeaway', time: '5m ago' },
            { id: '#8823', guest: 'Dr. Müller', items: ['Lobster Thermidor', 'Champagne (Bottle)'], total: '€195.00', status: 'Served', type: 'VIP Table 1', time: '45m ago' }
        ];
    });

    const updateOrderStatus = (id, newStatus) => {
        const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
        setOrders(updated);
        localStorage.setItem('green_active_orders', JSON.stringify(updated));
    };

    const getStatsByContext = () => {
        if (managerContext === 'CM' || managerContext === 'BM') return [
            { label: 'Guests Inside', value: '412', icon: Users, color: 'text-amber-500', trend: '+12%' },
            { label: 'Weekly Sales', value: '€24,420', icon: DollarSign, color: 'text-brand', trend: 'Stable' },
            { label: 'Door Wait Time', value: '12m', icon: Timer, color: 'text-brand', trend: '-2m' },
            { label: 'VIP Capacity', value: '85%', icon: Star, color: 'text-amber-400', trend: 'Peak' }
        ];
        if (managerContext === 'HM') return [
            { label: 'Current Guests', value: '128', icon: Users, color: 'text-blue-400', trend: 'Stable' },
            { label: 'Nightlife Out', value: '14', icon: Car, color: 'text-brand', trend: 'Expected 03:00' },
            { label: 'Concierge Tasks', value: '8', icon: Activity, color: 'text-brand', trend: 'Active' },
            { label: 'Service Rating', value: '4.98', icon: Star, color: 'text-blue-500', trend: 'Green' }
        ];
        if (managerContext === 'RM') return [
            { label: 'Active Tables', value: '24/30', icon: Utensils, color: 'text-orange-400', trend: '80% Full' },
            { label: 'Kitchen Load', value: 'Medium', icon: Activity, color: 'text-brand', trend: 'Optimal' },
            { label: 'Avg Ticket', value: '€72.50', icon: DollarSign, color: 'text-brand', trend: '+12%' },
            { label: 'Waitlist', value: '4', icon: Clock, color: 'text-orange-500', trend: '15m ETA' }
        ];
        if (managerContext === 'PM') return [
            { label: 'Occupancy', value: '84%', icon: Target, color: 'text-brand', trend: '+5% Today' },
            { label: 'Active Bays', value: '168/200', icon: MapPin, color: 'text-brand', trend: 'Stable' },
            { label: 'EV Charging', value: '12', icon: Zap, color: 'text-amber-400', trend: 'High Demand' },
            { label: 'Avg Session', value: '2.4h', icon: Clock, color: 'text-brand', trend: '-10m' }
        ];
        if (managerContext === 'WM') return [
            { label: 'Active Queue', value: '4', icon: Droplets, color: 'text-blue-400', trend: 'Fast' },
            { label: 'Throughput', value: '42 Cars', icon: Car, color: 'text-brand', trend: '+12% Day' },
            { label: 'Avg Cycle', value: '12m', icon: Timer, color: 'text-brand', trend: 'Optimal' },
            { label: 'Daily Rev.', value: '€1,240', icon: DollarSign, color: 'text-emerald-500', trend: 'Peak' }
        ];
        if (managerContext === 'SM') return [
            { label: 'Arena Fill', value: '92%', icon: Users, color: 'text-violet-400', trend: 'Near Cap' },
            { label: 'Gate Flow', value: '1.2k/h', icon: Activity, color: 'text-brand', trend: 'Smooth' },
            { label: 'VIP Sales', value: '€42,800', icon: DollarSign, color: 'text-brand', trend: 'Stable' },
            { label: 'Alerts', value: '0', icon: ShieldCheck, color: 'text-emerald-500', trend: 'Clear' }
        ];
        return [
            { label: 'Weekly Accrual', value: '€28,450', icon: DollarSign, color: 'text-brand', trend: 'Friday Payout' },
            { label: 'Active Units', value: '18', icon: Car, color: 'text-brand', trend: 'Full Deployment' },
            { label: 'Completion Rate', value: '98.5%', icon: CheckCircle2, color: 'text-emerald-500', trend: 'Optimal' },
            { label: 'Avg Arrival', value: '4.2m', icon: Clock, color: 'text-brand', trend: '-30s' }
        ];
    };

    const getOperationalDataByContext = () => {
        if (managerContext === 'PM') return [
            { id: 'P1-102', guest: 'B-G-2026', order: 'Parking Session', status: 'Active', time: '1h 12m' },
            { id: 'P2-404', guest: 'Lukas M.', order: 'EV Fast Charge', status: '85% Charged', time: '45m' },
            { id: 'VALET', guest: 'Dr. Müller', order: 'Valet Pickup', status: 'In Transit', time: '5m' }
        ];
        if (managerContext === 'WM') return [
            { id: 'BAY-1', guest: 'B-W-442', order: 'Premium Pearl', status: 'Drying', time: '8m' },
            { id: 'BAY-2', guest: 'Sarah K.', order: 'Eco-Express', status: 'Washing', time: '4m' },
            { id: 'FINISH', guest: 'Thomas M.', order: 'Interior Deep', status: 'Ready', time: '25m' }
        ];
        if (managerContext === 'SM') return [
            { id: 'S1-A12', guest: 'Julian R.', order: 'VVIP Sector A', status: 'Seated', time: '2h 15m' },
            { id: 'S2-B04', guest: 'TKT-9921', order: 'North Stand', status: 'Entry Scan', time: '1m' },
            { id: 'VIP-G', guest: 'Guest List', order: 'Executive Box', status: 'At Bar', time: '30m' }
        ];
        if (managerContext === 'RM') return [
            { id: 'T-12', guest: 'Sarah J.', order: '3x Premium Tasting', status: 'Main Course', time: '45m' },
            { id: 'T-04', guest: 'Pioneer #092', order: 'Bottle Service Only', status: 'Appetizer', time: '12m' },
            { id: 'VIP-1', guest: 'Dr. Müller', order: 'Table Reservation', status: 'Arriving', time: '5m' }
        ];
        return [
            { id: 'UNIT-1', guest: 'Driver #12', order: 'Active Trip', status: 'On Route', time: '12m' },
            { id: 'UNIT-4', guest: 'Sarah K.', order: 'Pickup Pending', status: 'Arrived', time: '2m' },
            { id: 'UNIT-8', guest: 'Pioneer #04', order: 'Standby', status: 'Online', time: '45m' }
        ];
    };

    const AccessDenied = ({ feature }) => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8"
        >
            <div className="w-32 h-32 bg-red-500/10 rounded-[3rem] flex items-center justify-center text-red-500 border border-red-500/20 shadow-2xl relative overflow-hidden">
                <ShieldAlert size={64} />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-red-500/20 rounded-full"
                />
            </div>
            <div className="space-y-4 max-w-md">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Access <span className="text-red-500">Denied</span></h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                    Personnel ID <span className="text-white">{user?.id || 'STAFF-GRID'}</span> is not authorized to access the <span className="text-brand">{feature}</span> module.
                </p>
            </div>
            <button 
                onClick={() => setView('overview')}
                className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand hover:text-dark-900 hover:border-brand transition-all shadow-xl"
            >
                Return to Operational Hub
            </button>
        </motion.div>
    );

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0B121E] font-sans text-white flex flex-row">
            {/* Internal Business Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isInternalSidebarCollapsed ? 80 : 288 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="h-full bg-[#0D1421] border-r border-white/5 flex flex-col z-30 shadow-[10px_0_30px_rgba(0,0,0,0.3)] relative"
            >
                <button 
                    onClick={() => setIsInternalSidebarCollapsed(!isInternalSidebarCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-brand text-dark-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 border-2 border-[#0B121E]"
                >
                    <ChevronRight size={14} className={`transition-transform duration-500 ${isInternalSidebarCollapsed ? '' : 'rotate-180'}`} />
                </button>

                <div className="p-6 pb-12 overflow-hidden">
                    <div className="flex items-center gap-3 group cursor-pointer whitespace-nowrap">
                        <div className="min-w-[48px] h-12 rounded-2xl bg-brand flex items-center justify-center text-dark-900 shadow-[0_0_20px_rgba(52,211,153,0.3)] group-hover:scale-110 transition-transform">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <AnimatePresence>
                            {!isInternalSidebarCollapsed && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Green</h1>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand opacity-80">Partner Portal</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-x-hidden">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: '3', hidden: (managerContext === 'FM' || managerContext === 'SM' || managerContext === 'PM' || managerContext === 'WM') },
                        { id: 'stadium-seats', label: 'Seat Matrix', icon: Layers, visible: managerContext === 'SM' },
                        { id: 'parking-grid', label: 'Bay Manager', icon: Target, visible: managerContext === 'PM' },
                        { id: 'wash-queue', label: 'Service Hub', icon: Droplets, visible: managerContext === 'WM' },
                        { id: 'staff', label: 'Team Hub', icon: Users },
                        { id: 'qr-dispatcher', label: managerContext === 'PM' ? 'Access Dispatcher' : 'Scan Terminal', icon: QrCode, badge: 'Live', hidden: (managerContext === 'FM' || managerContext === 'CB' || managerContext === 'RM' || managerContext === 'HM' || managerContext === 'SM') },
                        { id: 'finance', label: 'Financials', icon: Receipt },
                        { id: 'documents', label: 'Compliance', icon: ShieldCheck },
                        { id: 'feed', label: 'Marketing Hub', icon: Activity, badge: '4K' },
                        { id: 'reputation', label: 'Reputation Hub', icon: ShieldAlert, badge: user?.redFlags > 0 ? user.redFlags.toString() : null },
                        { id: 'strategic-hub', label: 'AI Strategic Hub', icon: Sparkles, badge: 'Insight' },
                        { id: 'sitting', label: 'Sitting', icon: Settings },
                        { id: 'menu', label: 'Menu Catalog', icon: managerContext === 'SM' ? Trophy : Utensils, badge: 'New', hidden: managerContext === 'FM' }
                    ].filter(item => {
                        if (item.hidden) return false;
                        if (item.visible !== undefined) return item.visible;
                        return true;
                    }).map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'menu') {
                                    navigate('/manager/menu-management');
                                    return;
                                }
                                setView(item.id);
                                setShowSecurityGate(false);
                            }}
                            className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group relative ${
                                view === item.id 
                                ? 'bg-brand/10 text-brand shadow-[inset_0_0_20px_rgba(52,211,153,0.05)] border border-brand/20' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <div className="min-w-[20px] flex items-center justify-center">
                                <item.icon size={20} className={view === item.id ? 'text-brand animate-pulse' : 'text-gray-500 group-hover:text-brand transition-colors'} />
                            </div>
                            {!isInternalSidebarCollapsed && (
                                <span className="text-xs font-black italic uppercase tracking-widest ml-4 whitespace-nowrap">{item.label}</span>
                            )}
                            {item.badge && !isInternalSidebarCollapsed && (
                                <span className="absolute right-4 px-2 py-0.5 bg-brand text-dark-900 text-[8px] font-black rounded-md">{item.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto space-y-4">
                    {/* Language Hub */}
                    <div className="space-y-2">
                        {!isInternalSidebarCollapsed && (
                            <div className="flex items-center justify-between px-2 mb-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand/60 italic">Language Hub</span>
                                <Languages size={12} className="text-brand/40" />
                            </div>
                        )}
                        <div className="relative">
                            <SearchIcon size={14} className={`absolute ${isInternalSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-600`} />
                            {!isInternalSidebarCollapsed && (
                                <input 
                                    type="text"
                                    placeholder="Search..."
                                    value={langSearch}
                                    onChange={(e) => {
                                        setLangSearch(e.target.value);
                                        setIsLangExpanded(true);
                                    }}
                                    onFocus={() => setIsLangExpanded(true)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-[9px] font-black uppercase tracking-widest focus:border-brand/40 outline-none"
                                />
                            )}
                            {isInternalSidebarCollapsed && (
                                <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer hover:border-brand/40" onClick={() => setIsInternalSidebarCollapsed(false)}>
                                    <Languages size={16} className="text-gray-600" />
                                </div>
                            )}
                        </div>
                        {isLangExpanded && !isInternalSidebarCollapsed && (
                            <div className="max-h-40 overflow-y-auto no-scrollbar bg-dark-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-2 space-y-1 shadow-2xl">
                                {filteredLangs.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => {
                                            setLang(l.code);
                                            setIsLangExpanded(false);
                                            setLangSearch('');
                                        }}
                                        className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all ${lang === l.code ? 'bg-brand/10 text-brand border border-brand/20' : 'hover:bg-white/5 text-gray-500'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase">{l.name}</span>
                                            <span className="text-[7px] font-bold opacity-30">{l.native}</span>
                                        </div>
                                        {lang === l.code && <CheckCircle size={10} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5"
                    >
                        <X size={18} className="shrink-0" />
                        {!isInternalSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Exit Portal</span>}
                    </button>
                </div>
            </motion.aside>

            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B121E]">
                <header className="h-20 border-b border-white/5 bg-[#0D1421]/30 backdrop-blur-3xl px-8 flex items-center justify-between z-20 shrink-0">
                    <div className="flex items-center gap-4">

                        <h2 className="text-sm font-black italic uppercase tracking-widest text-white">{getBusinessName()}</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand">{user?.role} MODE</span>
                        </div>
                        <div className="text-right flex items-center gap-6">
                            <div className="flex gap-3">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-500">{user?.greenFlags || 0}</span>
                                </div>
                                {user?.redFlags > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <ShieldAlert size={10} className="text-red-500" />
                                        <span className="text-[10px] font-black text-red-500">{user.redFlags}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-black text-white italic leading-none">{user?.name || 'Authorized Manager'}</p>
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Status: Online</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 p-1">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="w-full h-full rounded-lg" />
                            </div>
                            <span className="text-[6px] font-black text-brand uppercase tracking-widest bg-brand/5 px-1 rounded border border-brand/10">ID: GRN-{user?.id || '284M'}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 relative no-scrollbar">
                    <div className="absolute top-0 left-0 right-0 h-96 opacity-[0.03] pointer-events-none">
                        <Radar isOnline={true} showLogos={false} />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto py-6">
                        {!hasPermission(view) ? (
                            <AccessDenied feature={view} />
                        ) : (
                            <AnimatePresence mode="wait">
                                {view === 'overview' && (
                                    <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    {/* DYNAMIC STATS GRID */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {getStatsByContext().map((stat, i) => (
                                            <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <stat.icon size={64} />
                                                </div>
                                                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} mb-4`}><stat.icon size={24} /></div>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                                                        <p className="text-3xl font-black italic tracking-tighter leading-none">{stat.value}</p>
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-brand/10 text-brand`}>
                                                        {stat.trend}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* PRIMARY MODULE */}
                                        <div className="lg:col-span-2 bg-[#0D1421]/60 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                                            <div className="relative z-10">
                                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8">
                                                    {managerContext === 'RM' ? 'Kitchen Command Hub' : 
                                                     managerContext === 'CM' ? 'Live Entry Feed' :
                                                     managerContext === 'HM' ? 'Guest Nightlife Monitor' :
                                                     managerContext === 'PM' ? 'Parking Traffic Control' :
                                                     managerContext === 'WM' ? 'Service Queue Monitor' :
                                                     managerContext === 'SM' ? 'Arena Operations' :
                                                     managerContext === 'FM' ? 'Fleet Dispatch Hub' : 'Operational Center'}
                                                </h3>
                                                <div className="space-y-4">
                                                    {getOperationalDataByContext().map((row, i) => (
                                                        <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-brand/10 flex flex-col items-center justify-center border border-brand/20">
                                                                    <span className="text-[8px] font-black text-brand uppercase">UNIT</span>
                                                                    <span className="text-sm font-black text-white">{row.id}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black italic uppercase text-white">{row.guest}</p>
                                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{row.order}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-black text-brand uppercase tracking-widest">{row.status}</p>
                                                                <p className="text-xs font-black italic text-white leading-none mt-1">{row.time} active</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {(managerContext === 'RM' || managerContext === 'HM') && (
                                                        <div className="pt-6 border-t border-white/10 mt-6 animate-in fade-in duration-700">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h4 className="text-[10px] font-black uppercase text-brand tracking-widest">Takeaway Requests 🥡</h4>
                                                                <span className="px-2 py-0.5 bg-brand/10 text-brand rounded text-[8px] font-black uppercase">2 Pending</span>
                                                            </div>
                                                            <div className="p-4 bg-brand/5 rounded-2xl border border-brand/20 flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <ShoppingBag size={16} className="text-brand" />
                                                                    <div>
                                                                        <p className="text-[11px] font-black uppercase text-white">Sarah V.</p>
                                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Wagyu Burger, Fries</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[8px] font-black text-brand uppercase">Driver Arriving 10m</p>
                                                            </div>
                                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between opacity-60">
                                                                <div className="flex items-center gap-3">
                                                                    <ShoppingBag size={16} className="text-gray-500" />
                                                                    <div>
                                                                        <p className="text-[11px] font-black uppercase text-white">Pioneer #142</p>
                                                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Midnight Neon (2x)</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Packed & Ready</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                                                {/* SECONDARY MODULE */}
                                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl">
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter">City Pulse IQ</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { label: 'Demand Surge', value: 'High', color: 'text-brand' },
                                                        { label: 'Traffic Density', value: 'Medium', color: 'text-amber-500' },
                                                        { label: 'Event Bonus', value: '+€5.00', color: 'text-emerald-500' }
                                                    ].map((pulse, i) => (
                                                        <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0">
                                                            <span className="text-[10px] font-black uppercase text-gray-500">{pulse.label}</span>
                                                            <span className={`text-xs font-black italic uppercase ${pulse.color}`}>{pulse.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="pt-8">
                                                <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4 flex items-center gap-4 shadow-[0_10px_20px_rgba(52,211,153,0.05)]">
                                                    <Activity className="text-brand animate-pulse" size={20} />
                                                    <p className="text-[9px] font-bold text-gray-300 leading-tight uppercase">
                                                        Network Operating at Peak Efficiency.
                                                        <span className="text-brand ml-1">No latency detected.</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                   </div>
                                </motion.div>
                            )}

                            {view === 'orders' && (
                                <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-brand leading-none">Order Command</h1>
                                                <p className="text-gray-500 text-[10px] md:text-sm font-bold uppercase tracking-widest leading-none">Real-time Guest Requests & Fulfillment</p>
                                            </div>
                                            
                                            {/* Advanced Search Bar */}
                                            <div className="relative w-full md:w-80 group">
                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                    <Search size={16} className="text-gray-500 group-focus-within:text-brand transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={orderSearch}
                                                    onChange={(e) => setOrderSearch(e.target.value)}
                                                    placeholder="Search active orders..."
                                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand/40 focus:bg-white/10 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex bg-white/5 p-1.5 rounded-[1.5rem] border border-white/10 w-full md:w-fit overflow-x-auto no-scrollbar">
                                            {['All', 'Active', 'Completed', 'Takeaway'].map(filter => (
                                                <button 
                                                    key={filter} 
                                                    onClick={() => setOrderFilter(filter)}
                                                    className={`flex-1 md:w-32 px-4 py-3 rounded-2xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${
                                                        orderFilter === filter 
                                                        ? 'bg-brand text-dark-900 shadow-[0_10px_20px_rgba(52,211,153,0.2)]' 
                                                        : 'text-gray-500 hover:text-white'
                                                    }`}
                                                >
                                                    {filter}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        {orders
                                        .filter(order => {
                                            // Search Filter
                                            const searchMatch = order.guest.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                                              order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                                                              order.items.some(it => it.toLowerCase().includes(orderSearch.toLowerCase()));
                                            if (!searchMatch) return false;

                                            if (orderFilter === 'All') return true;
                                            if (orderFilter === 'Active') return order.status !== 'Served';
                                            if (orderFilter === 'Completed') return order.status === 'Served';
                                            if (orderFilter === 'Takeaway') return order.type.includes('Takeaway');
                                            return true;
                                        })
                                        .map((order, i) => (
                                            <div key={i} className="bg-[#0D1421]/60 border border-white/10 rounded-[2.5rem] p-8 flex flex-col lg:flex-row justify-between items-center gap-8 hover:border-brand/30 transition-all group shadow-xl relative overflow-hidden">
                                                <div className="flex items-center gap-6 w-full lg:w-auto">
                                                    <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex flex-col items-center justify-center text-brand">
                                                        <span className="text-[8px] font-black uppercase">ORDER</span>
                                                        <span className="text-sm font-black">{order.id}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-xl font-black italic uppercase text-white">{order.guest}</p>
                                                            <span className="px-2 py-0.5 bg-white/5 text-[8px] font-black uppercase text-gray-500 rounded border border-white/10">{order.type}</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">{order.items.join(', ')}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-10 w-full lg:w-auto justify-between lg:justify-end">
                                                    <div className="text-center lg:text-right">
                                                        <p className="text-2xl font-black italic text-white leading-none">{order.total}</p>
                                                        <p className="text-[9px] font-bold text-gray-600 uppercase mt-1">{order.time}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${
                                                            order.status === 'Served' || order.status === 'Ready to Go' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            order.status === 'Preparing' ? 'bg-brand/10 text-brand animate-pulse' :
                                                            'bg-white/5 text-gray-400'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            {order.type.includes('Takeaway') && order.status !== 'Ready to Go' && order.status !== 'Served' && (
                                                                <button 
                                                                    onClick={() => updateOrderStatus(order.id, 'Ready to Go')}
                                                                    className="px-4 py-2 bg-brand/20 border border-brand/40 text-brand rounded-xl text-[8px] font-black uppercase hover:bg-brand hover:text-dark-900 transition-all shadow-lg"
                                                                >
                                                                    Ready to Go 🥡
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => updateOrderStatus(order.id, (order.status === 'Served' || order.status === 'Ready to Go') ? 'Preparing' : 'Served')}
                                                                className="p-4 bg-brand text-dark-900 rounded-xl hover:scale-110 transition-transform shadow-lg shadow-brand/20"
                                                            >
                                                                <CheckCircle size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {view === 'finance' && (
                                <motion.div key="finance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-emerald-400 leading-none">Financial Intel</h1>
                                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Real-time Revenue & Payout Ledger</p>
                                        </div>
                                        <button onClick={handleExport} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
                                            <FileText size={14} /> Export Datev (SKR03)
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 bg-[#0D1421]/60 border border-white/10 rounded-[3rem] p-10 space-y-8">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Gross Performance</h3>
                                                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[10px] font-black uppercase outline-none">
                                                    <option>Last 30 Days</option>
                                                    <option>Last 7 Days</option>
                                                </select>
                                            </div>
                                            <div className="h-64 flex items-end justify-between gap-2 px-4">
                                                {[45, 62, 58, 75, 90, 82, 95].map((h, i) => (
                                                    <motion.div 
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        className="w-full bg-gradient-to-t from-brand/20 to-brand rounded-t-xl relative group"
                                                    >
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-dark-900 border border-brand/30 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black">
                                                            €{(h * 120).toLocaleString()}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 pt-4">
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Gross Invoiced</p>
                                                    <p className="text-xl font-black italic text-white">€15,280.00</p>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Platform Comm. (15%)</p>
                                                    <p className="text-xl font-black italic text-red-400">-€2,292.00</p>
                                                </div>
                                                <div className="p-4 bg-brand/5 rounded-2xl border border-brand/20 text-center">
                                                    <p className="text-[8px] font-black text-brand uppercase mb-1">Settlement Amount</p>
                                                    <p className="text-xl font-black italic text-brand">€12,988.00</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Settlement Status</h3>
                                            <div className="space-y-6">
                                                <div className="text-center py-8 bg-brand/5 border border-brand/20 rounded-[2rem] shadow-xl">
                                                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Next Scheduled Payout</p>
                                                    <p className="text-4xl font-black italic text-white">€3,412.50</p>
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-4">Expected: Friday, 01.05.2026</p>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Recent Payouts</p>
                                                    {[
                                                        { date: '24.04.2026', amount: '€4,210.30', status: 'Pending' },
                                                        { date: '17.04.2026', amount: '€3,890.50', status: 'Settled' }
                                                    ].map((p, i) => (
                                                        <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                                            <div>
                                                                <p className="text-xs font-black text-white">{p.amount}</p>
                                                                <p className="text-[8px] text-gray-500 uppercase">{p.date}</p>
                                                            </div>
                                                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${p.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{p.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'promotions' && (
                                <motion.div key="promos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-amber-500 leading-none">VIP Perks</h1>
                                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Loyalty Campaigns & Pioneer Incentives</p>
                                        </div>
                                        <button className="px-8 py-4 bg-amber-500 text-dark-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">Create New Perk</button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {promotions.map(p => (
                                            <div key={p.id} className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-6 relative overflow-hidden group hover:border-amber-500/30 transition-all cursor-pointer">
                                                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500"><Star size={24} /></div>
                                                <div>
                                                    <h3 className="text-xl font-black italic uppercase text-white">{p.title}</h3>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-widest">{p.target}</p>
                                                </div>
                                                <div className="flex justify-between items-end border-t border-white/5 pt-6">
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Vouchers Used</p>
                                                        <p className="text-2xl font-black italic text-white leading-none">{p.used}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>{p.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {view === 'feed' && (
                                <motion.div key="feed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-brand leading-none">Live Feed Console</h1>
                                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Broadcasting Vibe & Media to Discovery Hub</p>
                                        </div>
                                        <button className="px-8 py-4 bg-brand text-dark-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 flex items-center gap-2">
                                            <Upload size={16} /> Upload New Media
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-[#0D1421]/60 border border-white/10 rounded-[3rem] p-10 space-y-8">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Current Active Feed</h3>
                                            <div className="space-y-6">
                                                {[
                                                    { title: 'Neon Night Vibes', type: 'Video', notes: "Doubling lasers next week!", views: '1.2k', time: '2h ago' },
                                                    { title: 'Emerald Cocktail', type: 'Photo', notes: "Fresh organic mint only.", views: '840', time: '5h ago' }
                                                ].map((item, i) => (
                                                    <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4 group">
                                                        <div className="w-20 h-20 rounded-2xl bg-dark-900 border border-white/10 flex items-center justify-center text-gray-600 relative overflow-hidden flex-shrink-0">
                                                            {item.type === 'Video' ? <Video size={32} /> : <ImageIcon size={32} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-sm font-black italic uppercase text-white">{item.title}</p>
                                                                <p className="text-[8px] font-bold text-gray-600 uppercase">{item.time}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[8px] font-black text-brand uppercase bg-brand/10 px-2 py-0.5 rounded">{item.type}</span>
                                                                <span className="text-[8px] font-bold text-gray-500 uppercase">{item.views} Views</span>
                                                            </div>
                                                            <div className="mt-4 p-3 bg-dark-950 rounded-xl border border-white/5 italic text-[10px] text-gray-400">
                                                                "{item.notes}"
                                                            </div>
                                                        </div>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-2 text-gray-500 hover:text-red-400"><Trash2 size={16} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Draft Dispatch</h3>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Dispatch Note</label>
                                                    <textarea 
                                                        placeholder="Type vibe update or guest announcement..." 
                                                        className="w-full bg-dark-900 border border-white/10 rounded-2xl p-6 text-sm text-white min-h-[160px] outline-none focus:border-brand/40 transition-all resize-none" 
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Save Draft</button>
                                                    <button className="flex-1 py-4 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20">Post to Discovery</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'qr-terminal' && (
                                <motion.div key="terminal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 max-w-4xl mx-auto">
                                    <div className="text-center space-y-4">
                                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Voucher <span className="text-brand">Terminal</span></h1>
                                        <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em] italic leading-none">Scan Crew QR to authorize hospitality debt</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* SCANNER VIEW */}
                                        <div className="bg-dark-900 border border-brand/20 rounded-[3rem] p-10 flex flex-col items-center justify-center space-y-8 relative overflow-hidden group shadow-2xl">
                                            <div className="absolute inset-0 bg-brand/5 opacity-20 group-hover:opacity-40 transition-opacity" />
                                            <div className="w-64 h-64 border-2 border-dashed border-brand/30 rounded-[2.5rem] flex items-center justify-center relative">
                                                <div className="absolute inset-4 border-2 border-brand/10 rounded-[2rem] animate-pulse" />
                                                <Zap size={64} className="text-brand/20" />
                                                <motion.div 
                                                    animate={{ top: ['10%', '90%', '10%'] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                    className="absolute left-0 right-0 h-0.5 bg-brand shadow-[0_0_20px_rgba(33,255,165,0.8)] z-10"
                                                />
                                            </div>
                                            <button className="px-10 py-5 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all relative z-20">
                                                Activate Camera
                                            </button>
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic animate-pulse">Waiting for Crew Handshake...</p>
                                        </div>

                                        {/* MANUAL FORM */}
                                        <div className="glass-panel rounded-[3rem] p-10 space-y-8 border border-white/10 bg-[#0D1421]/60 shadow-2xl">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black italic uppercase text-white">Manual Voucher Entry</h3>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Fallback authorization ledger</p>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Voucher ID / Code</label>
                                                    <input type="text" placeholder="GRN-XXXX" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black uppercase tracking-widest text-brand outline-none focus:border-brand/40 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Authorized Value (€)</label>
                                                    <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-3xl font-black text-center text-white outline-none focus:border-brand/40 transition-all italic" />
                                                </div>
                                                <button className="w-full py-6 bg-brand text-dark-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all">
                                                    Authorize Payout
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* HISTORY LIST */}
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter px-4">Terminal History</h3>
                                        <div className="space-y-4">
                                            {[
                                                { crew: 'VIP Knights', item: '3x Premium Drinks', amount: '€54.00', time: '12:04 AM', status: 'Settled' },
                                                { crew: 'Night Explorers', item: 'Late Check-out Fee', amount: '€45.00', time: '11:50 PM', status: 'Settled' }
                                            ].map((h, i) => (
                                                <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg"><ShieldCheck size={24} /></div>
                                                        <div>
                                                            <p className="text-sm font-black italic uppercase text-white">{h.crew}</p>
                                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{h.item} • {h.time}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black italic text-white leading-none">{h.amount}</p>
                                                        <p className="text-[8px] font-black text-emerald-500 uppercase mt-1 tracking-widest">{h.status}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'feed' && (
                                <motion.div key="marketing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand"><Activity size={24} /></div>
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Marketing <span className="text-brand">Hub</span></h1>
                                            </div>
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Broadcast 15s 4K Reels to the Green Network</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-right">
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Global Reach</p>
                                                <p className="text-xl font-black italic text-brand">2.4M Pilots</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* 4K MEDIA STUDIO */}
                                        <div className="lg:col-span-1 bg-[#0D1421]/60 border border-brand/20 rounded-[3rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl -mr-10 -mt-10" />
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xl font-black italic uppercase text-white">Media <span className="text-brand">Studio</span></h3>
                                                <span className="px-2 py-1 bg-brand text-dark-900 text-[8px] font-black rounded uppercase">4K Ready</span>
                                            </div>
                                            
                                            <div 
                                                onClick={() => document.getElementById('media-upload').click()}
                                                className="aspect-[9/16] bg-black rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-600 hover:border-brand/40 hover:text-brand transition-all cursor-pointer group relative overflow-hidden"
                                            >
                                                {previewUrl ? (
                                                    <div className="absolute inset-0">
                                                        <img src={previewUrl} className="w-full h-full object-cover opacity-60" alt="Preview" />
                                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 text-center">
                                                            <div className="w-12 h-12 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand mb-4">
                                                                <CheckCircle2 size={24} />
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase text-brand">UHD 4K Ready</p>
                                                            <p className="text-[8px] font-bold text-white mt-1 uppercase">15.0s Clip Verified</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative z-10 flex flex-col items-center p-6 text-center">
                                                        {uploadStatus === 'processing' ? (
                                                            <div className="space-y-4 w-full px-8">
                                                                <div className="w-16 h-16 rounded-full border-4 border-brand/20 border-t-brand animate-spin mx-auto" />
                                                                <p className="text-[10px] font-black uppercase text-brand animate-pulse">Processing 4K Engine...</p>
                                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                                    <motion.div 
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${uploadProgress}%` }}
                                                                        className="h-full bg-brand shadow-[0_0_15px_rgba(50,205,50,0.5)]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                                    <Upload size={32} />
                                                                </div>
                                                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Upload 15s Reel</p>
                                                                <p className="text-[7px] font-bold text-gray-600 mt-2 uppercase">Videos exceeding 15s will be auto-clipped</p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                <input 
                                                    id="media-upload"
                                                    type="file" 
                                                    accept="video/*,image/*" 
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setUploadStatus('processing');
                                                            setUploadProgress(0);
                                                            const interval = setInterval(() => {
                                                                setUploadProgress(prev => {
                                                                    if (prev >= 100) {
                                                                        clearInterval(interval);
                                                                        setUploadStatus('complete');
                                                                        setPreviewUrl(URL.createObjectURL(file));
                                                                        return 100;
                                                                    }
                                                                    return prev + 5;
                                                                });
                                                            }, 100);
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Caption & Vibes</label>
                                                    <textarea 
                                                        value={broadcastCaption}
                                                        onChange={(e) => setBroadcastCaption(e.target.value)}
                                                        placeholder="Describe your product experience..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-brand outline-none transition-all h-24 resize-none"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        if (!previewUrl || !broadcastCaption) return alert("Please upload media and add a caption first.");
                                                        const newPost = {
                                                            id: Date.now(),
                                                            type: 'video',
                                                            url: previewUrl,
                                                            user: user?.name || 'Partner',
                                                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`,
                                                            likes: '0',
                                                            greenFlags: user?.greenFlags || 0,
                                                            caption: broadcastCaption,
                                                            isBusiness: true
                                                        };
                                                        const existingPosts = JSON.parse(localStorage.getItem('green_global_posts') || '[]');
                                                        localStorage.setItem('green_global_posts', JSON.stringify([newPost, ...existingPosts]));
                                                        alert("BROADCAST SUCCESSFUL: Your 4K Reel is now live for all pilots!");
                                                        setPreviewUrl(null);
                                                        setUploadStatus(null);
                                                        setBroadcastCaption('');
                                                    }}
                                                    className="w-full py-5 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    Blast to 4K Live Feed
                                                </button>
                                            </div>
                                        </div>

                                        {/* PERFORMANCE & ENGAGEMENT */}
                                        <div className="lg:col-span-2 space-y-8">
                                            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
                                                <div className="flex justify-between items-center mb-8">
                                                    <h3 className="text-xl font-black italic uppercase text-white">Social <span className="text-brand">Interaction Monitor</span></h3>
                                                    <div className="flex gap-2">
                                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live Data Sync</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-6">
                                                    {[
                                                        { label: 'Likes', value: '12.4K', trend: '+18%', icon: Heart, color: 'text-rose-500' },
                                                        { label: 'Comments', value: '892', trend: '+5%', icon: MessageCircle, color: 'text-brand' },
                                                        { label: 'Shares', value: '452', trend: '+12%', icon: Share2, color: 'text-violet-400' }
                                                    ].map((stat, i) => (
                                                        <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:border-brand/20 transition-all">
                                                            <stat.icon size={20} className={`${stat.color} mb-3`} />
                                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                                            <p className="text-2xl font-black italic text-white mt-1">{stat.value}</p>
                                                            <p className="text-[8px] font-black text-emerald-500 uppercase mt-2">{stat.trend} Surge</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-black italic uppercase text-white ml-6">Live <span className="text-brand">15s Feed Preview</span></h3>
                                                <div className="grid grid-cols-2 gap-6">
                                                    {[
                                                        { title: 'Summer Spritz 4K', views: '45K', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop' },
                                                        { title: 'Golden Hour Beats', views: '28K', img: 'https://images.unsplash.com/photo-1551024601-8f230c6c64b9?q=80&w=800&auto=format&fit=crop' }
                                                    ].map((post, i) => (
                                                        <div key={i} className="aspect-video bg-dark-900 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                                                            <img src={post.img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt="Post" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Play size={12} className="text-brand" fill="currentColor" />
                                                                    <p className="text-[10px] font-black italic text-white">{post.title}</p>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <div className="flex gap-3">
                                                                        <span className="text-[8px] font-black text-brand uppercase">{post.views} Views</span>
                                                                        <span className="text-[8px] font-black text-gray-400 uppercase">15.0s</span>
                                                                    </div>
                                                                    <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-brand hover:text-dark-900 transition-all"><Settings size={12} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'strategic-hub' && (
                                <motion.div key="strategic-hub" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand animate-pulse"><Sparkles size={28} /></div>
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Frankfurt <span className="text-brand">Strategic Hub</span></h1>
                                            </div>
                                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">AI-Powered City Momentum & Demand Forecast</p>
                                        </div>
                                        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand">Live Neural Data Sync</div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter ml-2">Upcoming High-Demand Events</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {[
                                                    { title: 'Eintracht Frankfurt vs. Real Madrid', category: 'Football (UCL)', date: 'Saturday, 09.05.2026', impact: '95%', surge: 'Critical Rush', icon: Trophy, color: 'text-red-500' },
                                                    { title: 'Automechanika Frankfurt', category: 'Trade Fair (Messe)', date: '12.05 - 16.05.2026', impact: '82%', surge: 'High Demand', icon: Box, color: 'text-amber-500' },
                                                    { title: 'Museumsuferfest', category: 'City Festival', date: '22.05 - 24.05.2026', impact: '75%', surge: 'Medium Surge', icon: Users, color: 'text-emerald-500' }
                                                ].map((event, i) => (
                                                    <div key={i} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between hover:bg-white/10 transition-all group overflow-hidden relative">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-10 -mt-10" />
                                                        <div className="flex items-center gap-6 relative z-10">
                                                            <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${event.color}`}><event.icon size={32} /></div>
                                                            <div>
                                                                <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">{event.title}</h4>
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{event.category} | {event.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right relative z-10">
                                                            <div className="flex items-center gap-2 justify-end mb-1">
                                                                <TrendingUp size={14} className={event.color} />
                                                                <span className={`text-2xl font-black italic ${event.color}`}>{event.impact}</span>
                                                            </div>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">{event.surge}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">AI Auditor Insights</h3>
                                            <div className="bg-brand/5 border border-brand/20 rounded-[3rem] p-8 space-y-8 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                                <div className="space-y-6 relative z-10">
                                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                                        <p className="text-[10px] font-black text-brand uppercase mb-3 flex items-center gap-2"><Sparkles size={12} /> Strategic Advice</p>
                                                        <p className="text-xs font-bold text-gray-300 leading-relaxed italic">
                                                            "The upcoming Champions League match will cause massive gridlock around Eco-Park Central. I recommend increasing valet staff by 20% and ensuring all EV chargers are pre-cleared by 15:00."
                                                        </p>
                                                    </div>

                                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                                        <p className="text-[10px] font-black text-amber-500 uppercase mb-3">Resource Forecast</p>
                                                        <p className="text-xs font-bold text-gray-300 leading-relaxed italic">
                                                            "Based on Messe attendance, your QR Paper stock will deplete in 4 days. Order placed for overnight delivery to avoid downtime."
                                                        </p>
                                                    </div>

                                                    <button className="w-full py-5 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand/20 hover:scale-105 transition-all">Optimize My Operations 🚀</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'documents' && (
                                <motion.div key="documents" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                                            {(managerContext === 'PM' || managerContext === 'WM') ? 'Legal & Compliance Center' : 'Digital Compliance Vault'}
                                        </h1>
                                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Legal Document Repository & Verification Status</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {[
                                            { group: 'Identity & Legal', docs: [{id: 'reg', name: 'Commercial Register'}, {id: 'mid', name: 'Manager ID'}, {id: 'tax', name: 'Tax Registration'}], icon: ShieldCheck, color: 'text-brand' },
                                            { group: 'Licenses', docs: [{id: 'gast', name: 'Gastronomy License'}, {id: 'liq', name: 'Liquor License'}, {id: 'fire', name: 'Fire Safety'}], icon: FileText, color: 'text-violet-400' },
                                            { group: 'Banking & VAT', docs: [{id: 'sepa', name: 'SEPA Mandate'}, {id: 'vatc', name: 'VAT Certification'}, {id: 'bankv', name: 'Bank Validation'}], icon: Building2, color: 'text-emerald-500' }
                                        ].map((group, i) => (
                                            <div key={group.group} className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity"><group.icon size={120} /></div>
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`p-4 rounded-2xl bg-white/5 ${group.color}`}><group.icon size={24} /></div>
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{group.group}</h3>
                                                </div>
                                                <div className="space-y-4 relative z-10">
                                                    {group.docs.map((doc) => (
                                                        <div key={doc.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-4 hover:bg-white/10 transition-all border-l-4 border-l-transparent hover:border-l-brand">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs font-black italic uppercase text-white">{doc.name}</span>
                                                                <span className="text-[8px] font-black text-amber-500 uppercase px-2 py-1 bg-amber-500/10 rounded">Pending</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <label className="flex-1 cursor-pointer">
                                                                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={() => alert(`UPLOADING: ${doc.name} received by GREEN Compliance Engine.`)} />
                                                                    <div className="w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                                                                        <Upload size={14} className="text-brand" />
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Upload (PDF/IMG)</span>
                                                                    </div>
                                                                </label>
                                                                <button className="p-3 bg-white/5 rounded-xl text-gray-600 hover:text-white transition-colors" title="View Document">
                                                                    <FileText size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {view === 'reputation' && (
                                <motion.div key="reputation" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><ShieldCheck size={28} /></div>
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Behavioral <span className="text-brand">Governance</span></h1>
                                            </div>
                                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Reputation Ledger & Punishment Strike tracking</p>
                                        </div>
                                        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.1)]">Official Green Standing</div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* REPUTATION STATS */}
                                        <div className="lg:col-span-1 space-y-8">
                                            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10">
                                                <div className="space-y-2 text-center">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Trust Quotient</p>
                                                    <p className="text-6xl font-black italic text-emerald-500 tracking-tighter">{(user?.greenFlags / 1000).toFixed(1)}K</p>
                                                    <p className="text-[8px] font-black text-emerald-500/50 uppercase">Verified Green Flags</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-[10px] font-black uppercase text-gray-400">Suspension Strike 1</p>
                                                        <p className="text-xs font-black text-white italic">{user?.redFlags}/3 Flags</p>
                                                    </div>
                                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(user?.redFlags / 3) * 100}%` }}
                                                            className={`h-full rounded-full ${user?.redFlags > 1 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-brand shadow-[0_0_15px_rgba(52,211,153,0.5)]'}`}
                                                        />
                                                    </div>
                                                    <p className="text-[7px] font-black text-gray-500 uppercase text-center tracking-[0.2em]">Next Strike triggers 6-Month Automatic Freeze</p>
                                                </div>
                                            </div>

                                            <div className="p-10 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[3rem] space-y-6">
                                                <h3 className="text-sm font-black italic uppercase text-white">How it works</h3>
                                                <ul className="space-y-4">
                                                    {[
                                                        { icon: ShieldCheck, text: 'Green Flags boost your visibility in the 4K Live Feed.', color: 'text-brand' },
                                                        { icon: ShieldAlert, text: '3 Red Flags = 6 Mo Ban. 6 Flags = 12 Mo. 9 Flags = Permaban.', color: 'text-red-500' },
                                                        { icon: Handshake, text: 'Resolve issues with customers to have flags revoked.', color: 'text-violet-400' }
                                                    ].map((rule, i) => (
                                                        <li key={i} className="flex gap-4 items-start">
                                                            <rule.icon size={16} className={`${rule.color} shrink-0 mt-1`} />
                                                            <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase">{rule.text}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* INCIDENT HISTORY */}
                                        <div className="lg:col-span-2 space-y-8">
                                            <div className="bg-[#0D1421]/60 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                                                <h3 className="text-xl font-black italic uppercase text-white">Incident <span className="text-brand">History</span></h3>
                                                
                                                <div className="space-y-4">
                                                    {[
                                                        { id: 'GRN-421', type: 'Red Flag', reason: 'Unsafe Driving Report', date: '02.05.2026', status: 'Pending', color: 'text-amber-500' },
                                                        { id: 'GRN-398', type: 'Red Flag', reason: 'Misleading Advertisement', date: '28.04.2026', status: 'Revoked', color: 'text-emerald-500' },
                                                        { id: 'GRN-112', type: 'Green Flag', reason: 'Exceptional Service Award', date: '15.04.2026', status: 'Permanent', color: 'text-brand' }
                                                    ].map((incident, i) => (
                                                        <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                                            <div className="flex items-center gap-6">
                                                                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${incident.color}`}><ShieldAlert size={20} /></div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-sm font-black italic uppercase text-white">{incident.reason}</p>
                                                                        <span className="text-[8px] font-black text-gray-500 bg-white/5 px-2 py-0.5 rounded uppercase">ID: {incident.id}</span>
                                                                    </div>
                                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{incident.type} • {incident.date}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {incident.status === 'Pending' && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
                                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${incident.color}`}>{incident.status}</p>
                                                                </div>
                                                                {incident.status === 'Active' && (
                                                                    <button 
                                                                        onClick={() => navigate(`/manager/resolution/${incident.id}`)}
                                                                        className="text-[8px] font-black text-brand uppercase mt-2 hover:underline"
                                                                    >
                                                                        Request Resolution
                                                                    </button>
                                                                )}
                                                                {incident.status === 'Pending' && (
                                                                    <p className="text-[7px] font-black text-gray-600 uppercase mt-2">Proposal Sent</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="p-8 bg-brand/5 border border-brand/20 rounded-[2rem] text-center space-y-4">
                                                    <p className="text-xs font-bold text-gray-300 italic">"Only customers who issued the flag can revoke it. Maintain high standards to avoid disciplinary action."</p>
                                                    <button className="text-[10px] font-black text-brand uppercase tracking-widest">Read Governance Terms & Standards</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'sitting' && (
                                <motion.div key="sitting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 pb-20">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Console Sitting</h1>
                                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Identity, Business Credentials & GPS Lockdown</p>
                                        </div>
                                        <button 
                                            onClick={() => alert("MANIFEST SAVED: All credentials encrypted and synchronized.")}
                                            className="px-12 py-5 bg-brand text-dark-900 rounded-[2.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Save Global Manifest
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* MANAGER PERSONAL DETAILS */}
                                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-400"><User size={24} /></div>
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Manager Identity</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase ml-1">Full Legal Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={personalInfo.name} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:border-violet-400 outline-none transition-all" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase ml-1">Direct Email</label>
                                                    <input 
                                                        type="email" 
                                                        value={personalInfo.email} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:border-violet-400 outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase ml-1">Mobile Line</label>
                                                    <input 
                                                        type="text" 
                                                        value={personalInfo.phone} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:border-violet-400 outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* BUSINESS CORE DETAILS */}
                                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 rounded-2xl bg-brand/10 text-brand"><Building2 size={24} /></div>
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Business Genesis</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase ml-1">Legal Entity Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={businessInfo.legalName} 
                                                        onChange={(e) => setBusinessInfo({...businessInfo, legalName: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:border-brand outline-none transition-all" 
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase ml-1">HQ Physical Address</label>
                                                    <input 
                                                        type="text" 
                                                        value={businessInfo.address} 
                                                        onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:border-brand outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase ml-1">VAT ID (EU/DE)</label>
                                                    <input type="text" defaultValue="DE123456789" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:border-brand outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase ml-1">Settlement IBAN</label>
                                                    <input 
                                                        type="text" 
                                                        value={bankingInfo.iban} 
                                                        onChange={(e) => setBankingInfo({...bankingInfo, iban: e.target.value})}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:border-brand outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* GPS Lockdown (Relocated) */}
                                        <div className="lg:col-span-2 bg-dark-900 border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="p-4 rounded-2xl bg-brand/10 text-brand"><Smartphone size={24} /></div>
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Geofence Ordering Hard-Lock</h3>
                                            </div>
                                            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                                                <div className="flex-1 space-y-6">
                                                    <div className="flex items-center justify-between p-8 bg-black/40 rounded-3xl border border-white/5">
                                                        <div>
                                                            <p className="text-sm font-black italic uppercase text-white">Proximity Enforcement</p>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Require physical presence for digital ordering</p>
                                                        </div>
                                                        <div className="w-12 h-6 bg-brand rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-xl" /></div>
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-64 space-y-4 px-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Lockdown Radius</label>
                                                    <div className="flex items-center gap-6">
                                                        <input type="range" min="10" max="500" defaultValue="50" className="flex-1 accent-brand h-2 bg-black/40 rounded-full appearance-none" />
                                                        <span className="text-xl font-black italic text-brand">50m</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'staff' && (
                                <motion.div key="staff" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-violet-400 leading-none">Team Hub</h1>
                                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Access Control & Active Personnel</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/manager/onboarding-staff')}
                                            className="px-8 py-4 bg-violet-500 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-500/20"
                                        >
                                            Onboard Staff
                                        </button>
                                    </div>
                                    
                                    <div className="bg-[#0D1421]/60 border border-white/10 rounded-[3rem] p-10 space-y-4 shadow-2xl">
                                        {staffList.map((member, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 hover:border-brand/20 transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 p-1">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} alt="Avatar" className="w-full h-full rounded-xl" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-sm font-black italic uppercase text-white tracking-tight leading-none">{member.name}</p>
                                                            <div className="flex gap-1">
                                                                {['Orders', 'Feed', 'Finance', 'Terminal'].filter(p => member.permissions?.includes(p)).map(p => (
                                                                    <span key={p} className="px-2 py-0.5 bg-brand/10 text-brand text-[6px] font-black uppercase rounded border border-brand/20">{p}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-brand uppercase tracking-widest mt-1 italic">ID: {member.id || `ST-10${i+24}`}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right hidden md:block">
                                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{member.role}</p>
                                                        <p className={`text-[8px] font-black uppercase mt-0.5 ${member.status === 'On Shift' ? 'text-emerald-500' : 'text-gray-600'}`}>{member.status}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate(`/manager/staff-permissions/${member.id || `ST-10${i+24}`}`)}
                                                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-brand hover:bg-brand/10 hover:border-brand/40 transition-all shadow-xl group-hover:scale-110"
                                                    >
                                                        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {view === 'onboarding' && (
                                <motion.div key="onboarding" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 max-w-2xl mx-auto pb-20">
                                    <div className="text-center space-y-4">
                                        <div className="w-20 h-20 bg-violet-500/10 rounded-[2rem] flex items-center justify-center text-violet-400 mx-auto border border-violet-500/20 shadow-2xl">
                                            <PlusCircle size={40} />
                                        </div>
                                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Staff <span className="text-violet-400">Onboarding</span></h1>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] leading-none">Search Personnel by Green ID</p>
                                    </div>

                                    <div className="bg-[#0D1421]/60 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                        <div className="relative">
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                            <input 
                                                type="text" 
                                                placeholder="Enter Staff ID (e.g. ST-1024)" 
                                                value={staffSearchId}
                                                onChange={(e) => setStaffSearchId(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-sm font-black uppercase tracking-widest text-brand outline-none focus:border-brand transition-all" 
                                            />
                                            <button 
                                                onClick={() => {
                                                    setIsSearchingStaff(true);
                                                    setTimeout(() => {
                                                        setIsSearchingStaff(false);
                                                        setFoundStaff({ id: 'ST-1024', name: 'Julian R.', role: 'Senior Personnel', avatar: 'Julian' });
                                                    }, 1500);
                                                }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-brand text-dark-900 rounded-xl text-[10px] font-black uppercase"
                                            >
                                                {isSearchingStaff ? 'Locating...' : 'Search'}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {foundStaff && (
                                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 animate-in fade-in slide-in-from-top-4">
                                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 p-1">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${foundStaff.avatar}`} alt="Avatar" className="w-full h-full rounded-xl" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black italic uppercase text-white">{foundStaff.name}</p>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{foundStaff.role}</p>
                                                        </div>
                                                        <div className="ml-auto">
                                                            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase">Verified ID</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Quick Templates</p>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {[
                                                                { id: 'pilot', label: 'Standard Pilot', icon: Zap },
                                                                { id: 'supervisor', label: 'Supervisor', icon: ShieldCheck },
                                                                { id: 'accountant', label: 'Accountant', icon: Receipt }
                                                            ].map(t => (
                                                                <button 
                                                                    key={t.id}
                                                                    onClick={() => applyTemplate(t.id)}
                                                                    className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${activeTemplate === t.id ? 'bg-brand text-dark-900 border-brand shadow-lg shadow-brand/20' : 'bg-white/5 border-white/5 text-gray-500'}`}
                                                                >
                                                                    <t.icon size={16} />
                                                                    <span className="text-[10px] font-black uppercase tracking-tighter">{t.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Operational Permissions</p>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, orders: !prev.orders }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.orders ? 'bg-brand/10 border-brand' : 'bg-white/5 border-white/5'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.orders ? 'bg-brand text-dark-900' : 'bg-white/5 text-gray-500'}`}><ShoppingBag size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.orders ? 'text-white' : 'text-gray-500'}`}>Orders & Queue</p>
                                                                <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">Process live service requests</p>
                                                            </button>
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, terminal: !prev.terminal }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.terminal ? 'bg-brand/10 border-brand' : 'bg-white/5 border-white/5'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.terminal ? 'bg-brand text-dark-900' : 'bg-white/5 text-gray-500'}`}><QrCode size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.terminal ? 'text-white' : 'text-gray-500'}`}>Scan Terminal</p>
                                                                <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">Verify tickets & vouchers</p>
                                                            </button>
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, finance: !prev.finance }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.finance ? 'bg-brand/10 border-brand' : 'bg-white/5 border-white/5'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.finance ? 'bg-brand text-dark-900' : 'bg-white/5 text-gray-500'}`}><Receipt size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.finance ? 'text-white' : 'text-gray-500'}`}>Financial Intel</p>
                                                                <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">View revenue & exports</p>
                                                            </button>
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, compliance: !prev.compliance }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.compliance ? 'bg-violet-500/10 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'bg-white/5 border-white/5'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.compliance ? 'bg-violet-500 text-white' : 'bg-white/5 text-gray-500'}`}><ShieldCheck size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.compliance ? 'text-white' : 'text-gray-500'}`}>Compliance</p>
                                                                <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">
                                                                    {(managerContext === 'PM' || managerContext === 'WM') ? 'Access legal & business docs' : 'Access vault & legal docs'}
                                                                </p>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button 
                                                        onClick={() => {
                                                            alert(`PERMISSION GRANTED: ${foundStaff.name} added to Team.`);
                                                            setView('staff');
                                                            setFoundStaff(null);
                                                            setStaffSearchId('');
                                                        }}
                                                        className="w-full py-6 bg-violet-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                                                    >
                                                        Grant Clearance & Add to Team
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    </motion.div>
                                )}

                                {view === 'stadium-seats' && (
                                    <motion.div key="stadium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-2">
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-brand">Seat Matrix</h1>
                                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Global Arena Inventory</p>
                                            </div>
                                            <button className="px-6 py-3 bg-brand/10 border border-brand/20 text-brand rounded-xl text-[10px] font-black uppercase">Sell Seats 🏟️</button>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                            {['Sector A', 'Sector B', 'VIP Box', 'Press'].map(sector => (
                                                <div key={sector} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                                                    <p className="text-xs font-black uppercase text-white">{sector}</p>
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {Array.from({ length: 15 }).map((_, i) => (
                                                            <div key={i} className={`aspect-square rounded-md border ${i % 3 === 0 ? 'bg-red-500/20 border-red-500/40' : 'bg-brand/20 border-brand/40'} flex items-center justify-center text-[8px] font-black`}>{i+1}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'parking-grid' && (
                                    <motion.div key="parking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                        <div className="flex justify-between items-center bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                                            <div className="flex gap-10">
                                                {parkingStructure.map(floor => (
                                                    <div key={floor.floor}>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Floor {floor.floor}</p>
                                                        <p className="text-2xl font-black italic text-white">{floor.free}<span className="text-xs text-gray-600"> / {floor.total}</span></p>
                                                    </div>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => setIsScanningStructure(true)}
                                                className="px-8 py-4 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl"
                                            >
                                                AI Structure Audit 🤖
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {Array.from({ length: 24 }).map((_, i) => (
                                                <div key={i} className="group relative bg-[#0D1421] border border-white/10 rounded-2xl p-4 hover:border-brand/50 transition-all cursor-pointer">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="text-[8px] font-black text-gray-500 uppercase">P1-{100+i}</span>
                                                        <div className={`w-2 h-2 rounded-full ${i % 5 === 0 ? 'bg-red-500 animate-pulse' : 'bg-brand shadow-[0_0_10px_var(--brand)]'}`} />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase text-white">VIP Valet</p>
                                                    <p className="text-[8px] font-bold text-gray-600 mt-1">€12.50 / Hour</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'wash-queue' && (
                                    <motion.div key="carwash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-2">
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-brand">Service Hub</h1>
                                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Live Wash Queue</p>
                                            </div>
                                            <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase">Add Manual Service +</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {carwashServices.map(service => (
                                                <div key={service.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden group hover:border-brand/40 transition-all">
                                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <Droplets size={48} />
                                                    </div>
                                                    <p className="text-[8px] font-black text-brand uppercase tracking-widest mb-2">{service.type}</p>
                                                    <h3 className="text-2xl font-black italic uppercase text-white mb-4">{service.name}</h3>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration</p>
                                                            <p className="text-lg font-black text-white">{service.duration}</p>
                                                        </div>
                                                        <p className="text-3xl font-black italic text-brand">€{service.price.toFixed(0)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'stadium-seats' && managerContext === 'SM' && (
                                    <motion.div key="stadium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 pb-20">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-2">
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-brand leading-none">AI Neural Scan</h1>
                                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Arena Inventory Mapping & Global Sync</p>
                                            </div>
                                        </div>

                                        {!aiMatrixResult ? (
                                            <div className="grid grid-cols-1 gap-10">
                                                <div className={`relative bg-dark-900 border-2 ${isScanningSeats ? 'border-brand shadow-[0_0_50px_rgba(33,255,165,0.2)]' : 'border-dashed border-white/10'} rounded-[4rem] p-16 flex flex-col items-center justify-center min-h-[500px] overflow-hidden group transition-all duration-700`}>
                                                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                                    {isScanningSeats ? (
                                                        <div className="relative z-10 text-center space-y-12">
                                                            <div className="relative w-80 h-48 mx-auto">
                                                                <div className="absolute inset-0 border-2 border-brand/20 rounded-2xl overflow-hidden">
                                                                    <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-brand shadow-[0_0_30px_rgba(33,255,165,1)] z-20" />
                                                                    <div className="absolute inset-0 flex flex-wrap gap-2 p-4 opacity-30">
                                                                        {Array.from({ length: 40 }).map((_, i) => (
                                                                            <motion.div key={i} animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 1, delay: i * 0.05, repeat: Infinity }} className="w-4 h-4 bg-brand/40 rounded-sm" />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter animate-pulse">Analyzing Arena Topology...</h3>
                                                        </div>
                                                    ) : (
                                                        <div className="relative z-10 text-center space-y-8">
                                                            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-gray-500 group-hover:text-brand transition-all mx-auto border border-white/5 group-hover:border-brand/40">
                                                                <Layers size={48} />
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Seed AI Matrix</h3>
                                                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Drop your Stadium Manifest or Layout File (PDF/CAD) to begin Neural Mapping</p>
                                                            </div>
                                                            <button onClick={() => { setIsScanningSeats(true); setTimeout(() => { setIsScanningSeats(false); setAiMatrixResult({ sectors: [{ id: 'S1', name: 'NORTH STAND', count: 1240, status: 'Mapped' }] }); }, 3000); }} className="px-10 py-5 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand/20">Initialize Mapping</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                                <div className="lg:col-span-2 space-y-6">
                                                    <div className="bg-[#0D1421] border border-white/5 rounded-[3rem] p-1 w-full aspect-[4/3] relative overflow-hidden">
                                                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#21ffa5 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }} />
                                                        <div className="absolute inset-8 grid grid-cols-12 gap-3">
                                                            {Array.from({ length: 96 }).map((_, i) => (
                                                                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: (i % 7 === 0 || i % 11 === 0) ? 1 : 0.05 }} className={`rounded-sm ${(i % 7 === 0 || i % 11 === 0) ? 'bg-brand shadow-[0_0_10px_rgba(33,255,165,0.4)]' : 'bg-white/10'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand">Occupancy Ledger</h4>
                                                        <div className="space-y-4">
                                                            {aiMatrixResult.sectors.map(s => (
                                                                <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                                                    <div><p className="text-xs font-black italic uppercase text-white">{s.name}</p><p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{s.count} Seats Detected</p></div>
                                                                    <span className="px-2 py-1 bg-brand/10 text-brand text-[8px] font-black rounded-lg uppercase">{s.status}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button onClick={() => setAiMatrixResult(null)} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Reset Matrix</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {view === 'qr-dispatcher' && managerContext === 'PM' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center p-6 md:p-12">
                                        <div className="w-full max-w-2xl bg-dark-900 border-2 border-brand/20 rounded-[3.5rem] p-12 space-y-12 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] rounded-full" />
                                            <div className="text-center space-y-4">
                                                <div className="w-24 h-24 bg-brand/10 rounded-[2.5rem] flex items-center justify-center text-brand mx-auto shadow-[0_0_50px_rgba(33,255,165,0.2)]"><QrCode size={48} /></div>
                                                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Access <span className="text-brand">Dispatcher</span></h2>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Encrypted QR Provisioning Hub</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Vehicle Plate #</label>
                                                    <input type="text" placeholder="e.g. B-G-2026" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-black italic focus:border-brand outline-none transition-all placeholder:text-gray-700" id="plateInput" />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Pass Duration</label>
                                                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black uppercase italic focus:border-brand outline-none transition-all appearance-none"><option>2 Hours Access</option><option>Match Day (8h)</option><option>Unlimited VIP</option></select>
                                                </div>
                                            </div>
                                            <button onClick={() => {
                                                const plate = document.getElementById('plateInput').value || 'GREEN-1';
                                                localStorage.setItem('green_parking_pass', JSON.stringify({ id: 'PASS-' + Date.now(), plate, venue: 'Eco-Park Central', type: 'parking', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
                                                alert('Access Pass Dispatched to Passenger Hub 🚀');
                                            }} className="w-full py-6 bg-brand text-dark-900 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.4em] shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">Dispatch Access Pass <ChevronRight size={20} /></button>
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'qr-dispatcher' && managerContext !== 'PM' && (
                                    <motion.div key="qr-terminal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
                                        <AnimatePresence mode="wait">
                                            {qrScanStep === 'idle' && (
                                                <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center space-y-8">
                                                    <div className="w-48 h-48 bg-brand/10 rounded-[3rem] flex items-center justify-center text-brand border-2 border-dashed border-brand/30 shadow-[0_0_50px_rgba(52,211,153,0.1)] relative overflow-hidden group">
                                                        <Zap size={80} className="group-hover:scale-110 transition-transform duration-500" fill="currentColor" />
                                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-brand/10 rounded-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Ready to <span className="text-brand">Scan</span></h2>
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Awaiting ticket or voucher...</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setQrScanStep('scanning')}
                                                        className="px-12 py-6 bg-brand text-dark-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                                                    >
                                                        Open Scanner Hub
                                                    </button>
                                                </motion.div>
                                            )}

                                            {qrScanStep === 'scanning' && (
                                                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full max-w-lg aspect-square bg-black rounded-[3rem] border-4 border-white/5 overflow-hidden shadow-2xl">
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-64 h-64 border-2 border-brand/50 rounded-[2rem] relative">
                                                            <motion.div 
                                                                animate={{ y: [0, 256, 0] }}
                                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                                className="absolute left-0 right-0 h-1 bg-brand shadow-[0_0_15px_var(--brand)]"
                                                            />
                                                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand rounded-tl-xl" />
                                                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand rounded-tr-xl" />
                                                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand rounded-bl-xl" />
                                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand rounded-br-xl" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-8 left-0 right-0 text-center">
                                                        <p className="text-[10px] font-black uppercase text-brand tracking-widest animate-pulse">Align QR Code within the frame</p>
                                                    </div>
                                                    <div 
                                                        className="absolute inset-0 cursor-crosshair" 
                                                        onClick={() => {
                                                            setQrScanStep('result');
                                                            setScannedData({
                                                                id: 'TKT-9921',
                                                                guest: 'Lukas M.',
                                                                service: managerContext === 'SM' ? 'VVIP Sector A, Row 4, Seat 12' : 
                                                                        managerContext === 'PM' ? 'Parking Level -1, Bay 104' :
                                                                        managerContext === 'WM' ? 'Premium Wash + Wax' : 'Standard Service',
                                                                payment: 'Verified (Mastercard)',
                                                                timestamp: new Date().toLocaleTimeString()
                                                            });
                                                        }} 
                                                    />
                                                </motion.div>
                                            )}

                                            {qrScanStep === 'result' && scannedData && (
                                                <motion.div key="result" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8">
                                                    <div className="bg-[#0D1421] border border-brand/30 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl" />
                                                        <div className="flex flex-col items-center text-center space-y-6">
                                                            <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center text-dark-900 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                                                                <CheckCircle size={40} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Ticket Secured</h3>
                                                                <p className="text-[10px] font-bold text-brand uppercase tracking-[0.3em] mt-1">Transaction Confirmed</p>
                                                            </div>
                                                            <div className="w-full space-y-4 pt-6 border-t border-white/10">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-black uppercase text-gray-500">Guest</span>
                                                                    <span className="text-sm font-black italic uppercase text-white">{scannedData.guest}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-black uppercase text-gray-500">Service</span>
                                                                    <span className="text-sm font-black italic uppercase text-brand text-right">{scannedData.service}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-black uppercase text-gray-500">Status</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <Shield size={12} className="text-brand" />
                                                                        <span className="text-[10px] font-black text-brand uppercase">{scannedData.payment}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <button 
                                                            onClick={() => setQrScanStep('scanning')}
                                                            className="w-full h-16 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:brightness-110 transition-all flex items-center justify-center gap-3"
                                                        >
                                                            <Zap size={18} fill="currentColor" />
                                                            Scan Next Customer
                                                        </button>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button onClick={() => setQrScanStep('scanning')} className="h-14 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all">Try Again</button>
                                                            <button onClick={() => setView('overview')} className="h-14 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all">Dashboard</button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                    <AnimatePresence>
                        {showSecurityGate && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-dark-950/90 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center text-brand mb-8 border border-brand/20 animate-pulse shadow-[0_0_50px_rgba(52,211,153,0.3)]"><ShieldCheck size={48} /></div>
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
                                    {(managerContext === 'PM' || managerContext === 'WM') ? 'Security Gate' : 'Vault Locked'}
                                </h2>
                                <p className="max-w-sm text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-10">Manager Identity Verification Required</p>
                                <div className="w-full max-w-xs space-y-4">
                                    <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-2xl font-black tracking-[0.5em] text-brand outline-none focus:border-brand transition-all" placeholder="••••" />
                                    <div className="flex gap-4">
                                        <button onClick={() => { if(passInput === securityPassword) { setIsUnlocked(true); setShowSecurityGate(false); } }} className="flex-1 py-5 bg-brand text-dark-900 rounded-2xl font-black uppercase text-xs shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all">Unlock</button>
                                        <button onClick={() => setShowSecurityGate(false)} className="flex-1 py-5 bg-white/5 text-gray-500 rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all">Cancel</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* HQ FLOATING CONTACT */}
                    <button onClick={() => window.alert('Opening Direct Line to GREEN HQ...')} className="fixed bottom-10 right-10 w-20 h-20 bg-brand text-dark-900 rounded-full shadow-[0_10px_50px_rgba(52,211,153,0.4)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-[200] border-4 border-[#0B121E] group">
                        <Activity size={32} strokeWidth={3} className="group-hover:animate-pulse" />
                    </button>

                    {/* AI INFRASTRUCTURE AGENT OVERLAYS */}
                    <AnimatePresence>
                        {(isScanningStructure || isScanningWash) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[300] bg-dark-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8">
                                {!structureApprovalPending && !washApprovalPending ? (
                                    <div className="text-center space-y-12">
                                        <div className="relative w-48 h-48 mx-auto">
                                            <div className="absolute inset-0 bg-brand/20 rounded-[3rem] animate-pulse" />
                                            <motion.div 
                                                animate={{ 
                                                    rotate: 360,
                                                    scale: [1, 1.1, 1]
                                                }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute inset-0 flex items-center justify-center text-brand"
                                            >
                                                <Bot size={80} />
                                            </motion.div>
                                            <div className="absolute inset-0 border-4 border-dashed border-brand/30 rounded-[3rem] animate-spin-slow" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">AI <span className="text-brand">Auditor</span> Active</h2>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.4em] animate-pulse">Parsing Physical Infrastructure...</p>
                                        </div>
                                        {/* Simulate Completion */}
                                        <button 
                                            onClick={() => {
                                                if (isScanningStructure) setStructureApprovalPending(true);
                                                if (isScanningWash) setWashApprovalPending(true);
                                            }}
                                            className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-brand animate-bounce"
                                        >
                                            Analysis Complete
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-xl bg-[#0D1421] border border-brand/30 rounded-[3.5rem] p-12 shadow-[0_0_100px_rgba(52,211,153,0.1)] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-brand shadow-[0_0_20px_var(--brand)]" />
                                        <div className="flex items-center gap-6 mb-10">
                                            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-dark-900 shadow-lg"><Sparkles size={32} /></div>
                                            <div>
                                                <h3 className="text-2xl font-black italic uppercase text-white leading-none">Draft Generated</h3>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Found: {isScanningStructure ? '4 Floors, 200 Spaces' : '5 Wash Service Types'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6 mb-12">
                                            {isScanningStructure ? (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {[
                                                        { l: 'Floor 0 (Entry)', v: '50 Spaces' },
                                                        { l: 'Floor 1 (VIP)', v: '50 Spaces' },
                                                        { l: 'Floor -1', v: '50 Spaces' },
                                                        { l: 'Pricing', v: 'Found 3 Tiers' }
                                                    ].map((item, i) => (
                                                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                                            <p className="text-[8px] font-black text-gray-500 uppercase mb-1">{item.l}</p>
                                                            <p className="text-sm font-black italic text-brand">{item.v}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {['Eco-Express', 'Premium Pearl', 'Ceramic Shield', 'Interior Deep', 'Wheel Detail'].map((wash, i) => (
                                                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                                                            <span className="text-xs font-black italic uppercase text-white">{wash}</span>
                                                            <span className="text-[10px] font-black text-brand uppercase tracking-widest">€{(i+1)*12}.00</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <button 
                                                onClick={() => {
                                                    setIsScanningStructure(false);
                                                    setIsScanningWash(false);
                                                    setStructureApprovalPending(false);
                                                    setWashApprovalPending(false);
                                                    triggerNotification('success', 'Operations Online', 'AI Draft has been merged into Live Matrix.');
                                                }}
                                                className="w-full py-6 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand/20 hover:scale-[1.02] transition-all"
                                            >
                                                Accept All & Go Live 🚀
                                            </button>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button className="py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all">Manual Edit</button>
                                                <button 
                                                    onClick={() => {
                                                        setIsScanningStructure(false);
                                                        setIsScanningWash(false);
                                                        setStructureApprovalPending(false);
                                                        setWashApprovalPending(false);
                                                    }}
                                                    className="py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-red-500/50 hover:text-red-500 transition-all"
                                                >
                                                    Discard
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                currentRole={user?.role}
                onItemClick={(id) => {
                    setView(id);
                    setIsSidebarOpen(false);
                }}
            />
        </div>
    );
};

export default ManagerDashboard;
