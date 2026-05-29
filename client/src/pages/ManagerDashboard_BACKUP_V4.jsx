import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    Play,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Radar from '../components/Radar';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import { Banknote, Check } from 'lucide-react';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { lang, setLang } = useLanguage();
    const [view, setView] = useState('overview');
    const [editingStaffIndex, setEditingStaffIndex] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMasterControlOpen, setIsMasterControlOpen] = useState(false);
    const [simRole, setSimRole] = useState(() => localStorage.getItem('green_sim_role') || user?.role || 'manager');
    const [simTemplate, setSimTemplate] = useState('pilot');
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
        if (simRole === 'manager') return true; // Managers have global access
        if (simRole === 'staff') {
            // Mock permissions for Staff (these would come from the database in production)
            const staffPermissions = user?.permissions || ['overview', 'orders'];
            return staffPermissions.includes(viewId);
        }
        return false;
    };
    const [staffList, setStaffList] = useState(() => {
        const saved = localStorage.getItem('green_staff_list');
        const initial = [
            { id: 'ST-1021', name: 'Lukas Meyer', role: 'Floor Manager', status: 'On Shift', avatar: 'Lukas', permissions: ['Orders', 'Feed', 'Terminal'] },
            { id: 'ST-1022', name: 'Anja Schmidt', role: 'Receptionist', status: 'On Shift', avatar: 'Anja', permissions: ['Feed', 'Terminal'] },
            { id: 'ST-1023', name: 'Marc Becker', role: 'Staff Pilot', status: 'Offline', avatar: 'Marc', permissions: ['Terminal'] }
        ];
        if (saved) return [...initial, ...JSON.parse(saved)];
        return initial;
    });
    
    // Determine the initial context based on manager email/identity
    const getInitialContext = () => {
        if (user?.businessType) return user.businessType;
        if (user?.email?.includes('bar')) return 'BM';
        if (user?.email?.includes('restaurant') || user?.email?.includes('food')) return 'RM';
        if (user?.email?.includes('hotel') || user?.email?.includes('palace')) return 'HM';
        if (user?.email?.includes('club') || user?.email?.includes('party')) return 'CM';
        if (user?.email?.includes('stadium')) return 'SM';
        return 'FM'; // Default to Fleet Manager
    };

    const [managerContext, setManagerContext] = useState(() => {
        const saved = localStorage.getItem('green_manager_context');
        if (saved) return saved;
        const ctx = getInitialContext();
        localStorage.setItem('green_manager_context', ctx);
        return ctx;
    });

    const [selectedGuest, setSelectedGuest] = useState(null);

    // Dynamic Industry Terminology Mapping
    const getTacticalLabels = () => {
        const labels = {
            HM: { unit: 'Room Number', id: 'Booking Ref', badge: 'Hotel' },
            RM: { unit: 'Table Number', id: 'Check ID', badge: 'Dining' },
            BM: { unit: 'Table Number', id: 'Ticket ID', badge: 'Bar' },
            CM: { unit: 'Table Number', id: 'Guest ID', badge: 'Nightlife' },
            SM: { unit: 'Ticket Inventory', id: 'Batch ID', badge: 'Stadium' },
            WM: { unit: 'Service Bay', id: 'Service ID', badge: 'Carwash' },
            PM: { unit: 'Parking Space', id: 'Pass ID', badge: 'Parking' },
            FM: { unit: 'Vehicle ID', id: 'Mission ID', badge: 'Fleet' }
        };
        return labels[managerContext] || { unit: 'Unit', id: 'Order ID', badge: 'General' };
    };
    const tLabel = getTacticalLabels();

    const [stadiumSeats, setStadiumSeats] = useState(() => {
        const sectors = ['Sector A', 'Sector B', 'VIP Box', 'Press'];
        const initial = {};
        sectors.forEach(s => {
            initial[s] = Array.from({ length: 15 }).map((_, i) => ({
                id: i + 1,
                status: (i + 1) % 4 === 0 ? 'occupied' : 'available',
                guest: (i + 1) % 4 === 0 ? 'Julian R.' : null
            }));
        });
        return initial;
    });
    const [selectedSeat, setSelectedSeat] = useState(null);

    const [isAddingVehicle, setIsAddingVehicle] = useState(false);
    const [newVehicleData, setNewVehicleData] = useState({ model: '', year: '', plate: '', color: '', photo: null });

    useEffect(() => {
        // HQ SENTINEL: Staff are allowed in the Manager Portal for business operations (Bar, Restaurant, etc.)
        // Fleet staff (FM) are traditionally drivers, but for testing and support, we allow dashboard entry
        // and let the hasPermission() logic handle internal view security.
    }, [managerContext, simRole, navigate]);

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
    const [stadiumEvents, setStadiumEvents] = useState(() => {
        const saved = localStorage.getItem('green_stadium_events');
        if (saved) return JSON.parse(saved);
        return [
            {
                id: 'evt-1',
                name: 'Champions League Final',
                date: '2024-05-24',
                time: '20:45',
                published: true,
                tiers: [
                    { id: 't1', name: 'Standard Area', price: 85, quantity: 500, sold: 120 },
                    { id: 't2', name: 'VIP Box', price: 450, quantity: 50, sold: 42 },
                    { id: 't3', name: 'Diamond Lounge', price: 1200, quantity: 10, sold: 8 }
                ]
            }
        ];
    });
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
    const [newEventData, setNewEventData] = useState({ 
        name: '', 
        date: '', 
        time: '', 
        tiers: [{ id: 't1', name: 'General Admission', price: 45, quantity: 0, sold: 0 }] 
    });

    const handleSimulateUpload = () => {
        setIsSimulatingUpload(true);
        setTimeout(() => {
            const parsedCount = Math.floor(Math.random() * 500) + 100;
            const updatedTiers = [...newEventData.tiers];
            updatedTiers[0].quantity = parsedCount;
            setNewEventData({...newEventData, tiers: updatedTiers});
            setIsSimulatingUpload(false);
        }, 1500);
    };

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

    const handleAddEvent = () => {
        if (!newEventData.name || !newEventData.date) return alert("Please fill in event details");
        const newEvent = {
            ...newEventData,
            id: 'evt-' + Date.now(),
            published: false
        };
        const updated = [...stadiumEvents, newEvent];
        setStadiumEvents(updated);
        localStorage.setItem('green_stadium_events', JSON.stringify(updated));
        setIsAddingEvent(false);
        setNewEventData({ 
            name: '', 
            date: '', 
            time: '', 
            tiers: [{ id: 't1', name: 'General Admission', price: 45, quantity: 0, sold: 0 }] 
        });
    };

    const togglePublishEvent = (id) => {
        const updated = stadiumEvents.map(e => e.id === id ? { ...e, published: !e.published } : e);
        setStadiumEvents(updated);
        localStorage.setItem('green_stadium_events', JSON.stringify(updated));
    };

    const fleetDrivers = [
        { id: 1, name: "Marcus H.", car: "Tesla Model 3", status: "In Ride", rating: 4.9, earnings: "€142", lastActive: "Just now" },
        { id: 2, name: "Sarah K.", car: "VW ID.4", status: "Online", rating: 5.0, earnings: "€88", lastActive: "2m ago" },
        { id: 3, name: "Thomas M.", car: "Mercedes EQE", status: "Offline", rating: 4.8, earnings: "€210", lastActive: "1h ago" },
    ];

    const { socket } = useSocket();
    const [cashAlerts, setCashAlerts] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleAlert = (alert) => {
            setCashAlerts(prev => [alert, ...prev]);
            // Also update the local orders status if it exists
            const orderIdStr = String(alert.orderId);
            setOrders(prev => prev.map(o => o.id === orderIdStr ? { ...o, payment: 'Cash (Pending)' } : o));
        };

        socket.on('cash-payment-alert', handleAlert);
        return () => socket.off('cash-payment-alert', handleAlert);
    }, [socket]);

    const handleConfirmCash = (alert) => {
        socket.emit('confirm-cash-payment', {
            orderId: alert.orderId,
            tableId: alert.tableId
        });
        setCashAlerts(prev => prev.filter(a => a.orderId !== alert.orderId));
        // Mark as paid in local state
        const orderIdStr = String(alert.orderId);
        updateOrderStatus(orderIdStr, 'Served'); // Assuming served once paid
        setOrders(prev => prev.map(o => o.id === orderIdStr ? { ...o, payment: 'Cash (Paid)', status: 'Paid' } : o));
    };

    // SYNC: Load orders from localStorage
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('green_active_orders');
        if (saved) return JSON.parse(saved);
        return [
            { id: '#BK-9921', guest: 'Lukas M.', items: ['Deluxe King Suite', 'Spa Access Included'], total: '450.00', status: 'Received', type: 'Stay Booking', time: 'Just now', payment: 'Online', room: '204', checkIn: 'May 10', checkOut: 'May 12' },
            { id: '#8821', guest: 'Sarah J.', items: ['Midnight Neon (2x)', 'Truffle Fries'], total: '38.00', status: 'Preparing', type: 'Dine-In', time: '12m ago', payment: 'Online', table: '14' },
            { id: '#8822', guest: 'Pioneer #042', items: ['Gold Leaf Burger', 'Emerald Cocktail'], total: '61.00', status: 'Received', type: 'Takeaway', time: '5m ago', payment: 'Cash', plate: 'B-GR-2026', carColor: 'Blue' },
            { id: '#8823', guest: 'Dr. Müller', items: ['Lobster Thermidor', 'Champagne (Bottle)'], total: '195.00', status: 'Served', type: 'VIP Table 1', time: '45m ago', payment: 'Online', room: '402' }
        ];
    });

    const updateOrderStatus = (id, newStatus) => {
        const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
        setOrders(updated);
        localStorage.setItem('green_active_orders', JSON.stringify(updated));
    };

    // Ensure demo booking exists for visualization
    useEffect(() => {
        const demoBooking = { id: '#BK-9921', guest: 'Lukas M.', items: ['Deluxe King Suite', 'Spa Access Included'], total: '450.00', status: 'Received', type: 'Stay Booking', time: 'Just now', payment: 'Online', room: '204', checkIn: 'May 10', checkOut: 'May 12' };
        if (!orders.find(o => o.id === demoBooking.id)) {
            const updated = [demoBooking, ...orders];
            setOrders(updated);
            localStorage.setItem('green_active_orders', JSON.stringify(updated));
        }
    }, []);

    const getStatsByContext = () => {
        if (managerContext === 'CM' || managerContext === 'BM') return [
            { label: 'Guests Inside', value: '412', icon: Users, color: 'text-white', trend: '+12%' },
            { label: 'Weekly Sales', value: '€24,420', icon: DollarSign, color: 'text-brand', trend: 'Stable' },
            { label: 'Door Wait Time', value: '12m', icon: Timer, color: 'text-brand', trend: '-2m' },
            { label: 'VIP Capacity', value: '85%', icon: Star, color: 'text-white', trend: 'Peak' }
        ];
        if (managerContext === 'HM') return [
            { label: 'Current Guests', value: '128', icon: Users, color: 'text-white', trend: 'Stable' },
            { label: 'Nightlife Out', value: '14', icon: Car, color: 'text-brand', trend: 'Expected 03:00' },
            { label: 'Concierge Tasks', value: '8', icon: Activity, color: 'text-brand', trend: 'Active' },
            { label: 'Service Rating', value: '4.98', icon: Star, color: 'text-white', trend: 'Green' }
        ];
        if (managerContext === 'RM') return [
            { label: 'Active Tables', value: '24/30', icon: Utensils, color: 'text-white', trend: '80% Full' },
            { label: 'Kitchen Load', value: 'Medium', icon: Activity, color: 'text-brand', trend: 'Optimal' },
            { label: 'Avg Ticket', value: '€72.50', icon: DollarSign, color: 'text-brand', trend: '+12%' },
            { label: 'Waitlist', value: '4', icon: Clock, color: 'text-white', trend: '15m ETA' }
        ];
        if (managerContext === 'PM') return [
            { label: 'Occupancy', value: '84%', icon: Target, color: 'text-brand', trend: '+5% Today' },
            { label: 'Active Bays', value: '168/200', icon: MapPin, color: 'text-brand', trend: 'Stable' },
            { label: 'EV Charging', value: '12', icon: Zap, color: 'text-white', trend: 'High Demand' },
            { label: 'Avg Session', value: '2.4h', icon: Clock, color: 'text-brand', trend: '-10m' }
        ];
        if (managerContext === 'WM') return [
            { label: 'Active Queue', value: '4', icon: Droplets, color: 'text-white', trend: 'Fast' },
            { label: 'Throughput', value: '42 Cars', icon: Car, color: 'text-brand', trend: '+12% Day' },
            { label: 'Avg Cycle', value: '12m', icon: Timer, color: 'text-brand', trend: 'Optimal' },
            { label: 'Daily Rev.', value: '€1,240', icon: DollarSign, color: 'text-white', trend: 'Peak' }
        ];
        if (managerContext === 'SM') return [
            { label: 'Arena Fill', value: '92%', icon: Users, color: 'text-white', trend: 'Near Cap' },
            { label: 'Gate Flow', value: '1.2k/h', icon: Activity, color: 'text-brand', trend: 'Smooth' },
            { label: 'VIP Sales', value: '€42,800', icon: DollarSign, color: 'text-brand', trend: 'Stable' },
            { label: 'Alerts', value: '0', icon: ShieldCheck, color: 'text-white', trend: 'Clear' }
        ];
        return [
            { label: 'Weekly Accrual', value: '€28,450', icon: DollarSign, color: 'text-brand', trend: 'Friday Payout' },
            { label: 'Active Units', value: '18', icon: Car, color: 'text-brand', trend: 'Full Deployment' },
            { label: 'Completion Rate', value: '98.5%', icon: CheckCircle2, color: 'text-white', trend: 'Optimal' },
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
        <div className="relative w-full h-screen overflow-hidden bg-dark-950 font-sans text-primary flex flex-row">
            {/* Internal Business Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isInternalSidebarCollapsed ? 80 : 288 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="h-full bg-dark-900 border-r border-white/5 flex flex-col z-30 shadow-[10px_0_30px_rgba(0,0,0,0.3)] relative"
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
                        { 
                            id: 'orders', 
                            label: managerContext === 'HM' ? 'Room Service' : managerContext === 'CM' ? 'Bottle Service' : 'Live Orders', 
                            icon: managerContext === 'HM' ? BedDouble : managerContext === 'CM' ? GlassWater : ShoppingBag, 
                            badge: '3', 
                            hidden: (managerContext === 'FM' || managerContext === 'SM') 
                        },
                        { id: 'stadium-seats', label: 'Ticket Hub', icon: Ticket, visible: managerContext === 'SM' },
                        { id: 'staff', label: 'Team Hub', icon: Users },
                        { 
                            id: 'qr-dispatcher', 
                            label: managerContext === 'HM' ? 'Keycard Dispatch' : managerContext === 'CM' ? 'Guestlist Scan' : (managerContext === 'PM' || managerContext === 'WM') ? 'Access Dispatcher' : 'Scan Terminal', 
                            icon: QrCode, 
                            badge: 'Live', 
                            hidden: (managerContext === 'FM' || managerContext === 'CB' || managerContext === 'RM' || managerContext === 'SM' || managerContext === 'HM' || managerContext === 'CM') 
                        },
                        { 
                            id: 'finance', 
                            label: managerContext === 'HM' ? 'Nightly Audit' : managerContext === 'CM' ? 'Cover Revenue' : 'Financials', 
                            icon: Receipt 
                        },
                        { id: 'documents', label: 'Compliance', icon: ShieldCheck },
                        { id: 'feed', label: 'Marketing Hub', icon: Activity, badge: '4K' },
                        { id: 'reputation', label: 'Reputation Hub', icon: ShieldAlert, badge: user?.redFlags > 0 ? user.redFlags.toString() : null },
                        { id: 'strategic-hub', label: 'AI Strategic Hub', icon: Sparkles, badge: 'Insight' },
                        { id: 'fleet-control', label: 'Fleet Control Hub', icon: Car, visible: managerContext === 'FM', badge: 'Alert' },
                        { id: 'sitting', label: 'Sitting', icon: Settings },
                        { id: 'menu', label: 'Menu Catalog', icon: managerContext === 'SM' ? Trophy : Utensils, badge: 'New', hidden: (managerContext === 'FM' || managerContext === 'SM') }
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
                                : 'text-secondary hover:text-primary hover:bg-btn-sec border border-transparent'
                            }`}
                        >
                            <div className="min-w-[20px] flex items-center justify-center">
                                <item.icon size={20} className={view === item.id ? 'text-brand' : 'text-secondary group-hover:text-brand transition-colors'} />
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
                            <SearchIcon size={14} className={`absolute ${isInternalSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-4'} top-1/2 -translate-y-1/2 text-secondary`} />
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
                                    className="w-full bg-btn-sec border border-main rounded-2xl p-4 pl-10 text-[9px] font-black uppercase tracking-widest focus:border-brand/40 outline-none text-primary"
                                />
                            )}
                            {isInternalSidebarCollapsed && (
                                <div className="w-10 h-10 bg-btn-sec rounded-xl border border-main flex items-center justify-center cursor-pointer hover:border-brand/40" onClick={() => setIsInternalSidebarCollapsed(false)}>
                                    <Languages size={16} className="text-secondary" />
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
                                        className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all ${lang === l.code ? 'bg-brand/10 text-brand border border-brand/20' : 'hover:bg-btn-sec text-secondary'}`}
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
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-btn-sec text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all border border-main"
                    >
                        <X size={18} className="shrink-0" />
                        {!isInternalSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Exit Portal</span>}
                    </button>
                </div>
            </motion.aside>

            <div className="flex-1 flex flex-col h-full overflow-hidden bg-dark-950">
                <header className="h-20 border-b border-main bg-dark-900/30 backdrop-blur-3xl px-8 flex items-center justify-between z-20 shrink-0">
                    <div className="flex items-center gap-4">

                        <h2 className="text-sm font-black italic uppercase tracking-widest text-primary">{getBusinessName()}</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand">{user?.role} MODE</span>
                        </div>
                        <div className="text-right flex items-center gap-6">
                            <div className="flex gap-3">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg border border-white/20">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    <span className="text-[10px] font-black text-primary">{user?.greenFlags || 0}</span>
                                </div>
                                {user?.redFlags > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <ShieldAlert size={10} className="text-red-500" />
                                        <span className="text-[10px] font-black text-red-500">{user.redFlags}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-black text-primary italic leading-none">{user?.name || 'Authorized Manager'}</p>
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
                                            <div key={i} className="bg-btn-sec p-8 rounded-[2.5rem] border border-main relative group shadow-2xl">
                                                <div className="absolute -top-3 left-8 px-3 py-1 bg-brand text-black rounded-full text-[7px] font-black uppercase tracking-[0.2em] shadow-lg z-10">{stat.label} 🛰️</div>
                                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <stat.icon size={64} />
                                                </div>
                                                <div className={`w-12 h-12 rounded-xl bg-btn-sec flex items-center justify-center ${stat.color} mb-4 mt-2`}><stat.icon size={24} /></div>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-3xl font-black italic tracking-tighter leading-none text-primary">{stat.value}</p>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-brand/10 text-brand">
                                                        {stat.trend}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {(managerContext !== 'CM' && managerContext !== 'RM') && (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* PRIMARY MODULE */}
                                        <div className="lg:col-span-2 bg-glass border border-glass rounded-[3rem] p-10 relative shadow-2xl">
                                            <div className="absolute -top-3 left-10 px-4 py-1.5 bg-brand text-black rounded-full text-[8px] font-black uppercase tracking-[0.3em] shadow-lg">Operational Center 📡</div>
                                            <div className="relative z-10">
                                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 mt-2 text-primary">
                                                    {managerContext === 'RM' ? 'Kitchen Command Hub' : 
                                                     managerContext === 'CM' ? 'Live Entry Feed' :
                                                     managerContext === 'HM' ? 'Guest Nightlife Monitor' :
                                                     managerContext === 'PM' ? 'Parking Traffic Control' :
                                                     managerContext === 'WM' ? 'Service Queue Monitor' :
                                                     managerContext === 'SM' ? 'Arena Operations' :
                                                     managerContext === 'FM' ? 'Fleet Dispatch Hub' : 'Operational Hub'}
                                                </h3>
                                                <div className="space-y-4">
                                                    {getOperationalDataByContext().map((row, i) => (
                                                        <div key={i} className="flex items-center justify-between p-5 bg-btn-sec rounded-2xl border border-main hover:bg-white/10 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-brand/10 flex flex-col items-center justify-center border border-brand/20">
                                                                    <span className="text-[8px] font-black text-brand uppercase">UNIT</span>
                                                                    <span className="text-sm font-black text-primary">{row.id}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black italic uppercase text-primary">{row.guest}</p>
                                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{row.order}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-black text-brand uppercase tracking-widest">{row.status}</p>
                                                                <p className="text-xs font-black italic text-primary leading-none mt-1">{row.time} active</p>
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
                                        <div className="bg-btn-sec border border-glass rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl relative">
                                            <div className="absolute -top-3 left-10 px-4 py-1.5 bg-brand text-black rounded-full text-[8px] font-black uppercase tracking-[0.3em] shadow-lg">City Analytics 📈</div>
                                            <div className="space-y-6 mt-2">
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">City Pulse IQ</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { label: 'Demand Surge', value: 'High', color: 'text-brand' },
                                                        { label: 'Traffic Density', value: 'Medium', color: 'text-primary' },
                                                        { label: 'Event Bonus', value: '+€5.00', color: 'text-primary' }
                                                    ].map((pulse, i) => (
                                                        <div key={i} className="flex justify-between items-center pb-4 border-b border-main last:border-0">
                                                            <span className="text-[10px] font-black uppercase text-secondary">{pulse.label}</span>
                                                            <span className={`text-xs font-black italic uppercase ${pulse.color}`}>{pulse.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="pt-8">
                                                <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4 flex items-center gap-4 shadow-[0_10px_20px_rgba(52,211,153,0.05)]">
                                                    <Activity className="text-brand" size={20} />
                                                    <p className="text-[9px] font-bold text-gray-300 leading-tight uppercase">
                                                        Network Operating at Peak Efficiency.
                                                        <span className="text-brand ml-1">No latency detected.</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    )}
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
                                            {['All', 'Active', 'Completed', managerContext === 'HM' ? 'Room Only' : 'Takeaway'].map(filter => (
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
                                            const searchMatch = order.guest.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                                              order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                                                              order.items.some(it => it.toLowerCase().includes(orderSearch.toLowerCase()));
                                            if (!searchMatch) return false;
                                            if (orderFilter === 'All') return true;
                                            if (orderFilter === 'Active') return order.status !== 'Served';
                                            if (orderFilter === 'Completed') return order.status === 'Served';
                                            if (orderFilter === 'Takeaway' || orderFilter === 'Room Only') return order.type.includes('Takeaway') || order.type.includes('Stay Booking');
                                            return true;
                                        })
                                        .map((order, i) => {
                                            const isUrgent = parseInt(order.time) > 15 || order.status === 'Received';
                                            const isBooking = order.type === 'Stay Booking';
                                            const statusProgress = (order.status === 'Received' || order.status === 'Booked') ? 25 : 
                                                                  (order.status === 'Preparing' || order.status === 'Check-In') ? 50 : 
                                                                  (order.status === 'Ready' || order.status === 'Staying') ? 75 : 100;
                                            
                                            return (
                                                <div key={i} className={`bg-glass border-2 ${isUrgent && order.status !== 'Served' ? 'border-red-500/30' : 'border-glass'} rounded-[3rem] p-10 flex flex-col gap-8 hover:border-brand/40 transition-all group relative overflow-hidden shadow-2xl`}>
                                                    {/* Background Glow for Urgency */}
                                                    {isUrgent && order.status !== 'Served' && (
                                                        <div className="absolute inset-0 bg-red-500/[0.03] animate-pulse pointer-events-none" />
                                                    )}

                                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                                                        <div className="flex items-center gap-8 w-full lg:w-auto">
                                                            <div className="w-24 h-24 rounded-3xl bg-dark-900 border-2 border-main flex flex-col items-center justify-center text-primary relative overflow-hidden group-hover:border-brand/40 transition-colors">
                                                                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                <span className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] mb-1">{tLabel.unit}</span>
                                                                <span className="text-2xl font-black italic text-brand">{order.table || order.room || order.id.replace('#', '')}</span>
                                                                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${order.status === 'Served' ? 'bg-brand' : 'bg-brand/20'}`} />
                                                            </div>
                                                            
                                                            <div className="flex-1">
                                                                <div className="flex flex-wrap items-center gap-4">
                                                                    <h3 className="text-3xl font-black italic uppercase text-primary tracking-tighter">{order.guest}</h3>
                                                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                                                                        <span className="text-[10px] font-black text-brand uppercase tracking-widest">{tLabel.id}: {order.id}</span>
                                                                    </div>
                                                                    {managerContext === 'HM' && order.type === 'Stay Booking' && (
                                                                        <button 
                                                                            onClick={() => setSelectedGuest({ 
                                                                                ...order, 
                                                                                phone: '+49 176 4421 8892', 
                                                                                email: order.guest.toLowerCase().replace(' ', '.') + '@green-social.com', 
                                                                                loyalty: 'Pioneer Tier 1', 
                                                                                visits: '12', 
                                                                                lastStay: 'April 2026',
                                                                                address: 'Königsallee 12, 40212 Düsseldorf',
                                                                                dob: 'May 12, 1992',
                                                                                idNumber: 'PA-99281-XM'
                                                                            })}
                                                                            className="flex items-center gap-2 px-6 py-2 bg-brand text-dark-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20"
                                                                        >
                                                                            <User size={12} />
                                                                            Guest Details
                                                                        </button>
                                                                    )}
                                                                    {order.plate && <span className="px-5 py-2 bg-brand/10 border-2 border-brand/20 rounded-2xl text-xs font-black text-brand tracking-widest">{order.plate}</span>}
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-4 mt-4">
                                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                                                        <Timer size={12} className={isUrgent ? 'text-red-400 animate-pulse' : 'text-secondary'} />
                                                                        <span className={`text-[10px] font-black uppercase ${isUrgent ? 'text-red-400' : 'text-secondary'}`}>{order.time}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                                                        <ShoppingBag size={12} className="text-secondary" />
                                                                        <span className="text-[10px] font-black uppercase text-secondary">
                                                                            {managerContext === 'HM' && (order.type === 'Takeaway' || order.type === 'Stay Booking') ? 'Room Only' : order.type}
                                                                        </span>
                                                                    </div>
                                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${order.payment === 'Cash' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-brand/10 border-brand/20 text-brand'}`}>
                                                                        {order.payment}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-main pt-6 lg:pt-0">
                                                            <div className="text-left lg:text-right">
                                                                {order.payment === 'Cash' && order.status !== 'Paid' ? (
                                                                    <div className="flex flex-col items-end gap-3">
                                                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full animate-pulse">
                                                                            <Banknote size={14} className="text-amber-500" />
                                                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Awaiting Collection</span>
                                                                        </div>
                                                                        <div className="flex flex-col lg:flex-row items-center gap-6 bg-amber-500/5 p-4 rounded-3xl border border-amber-500/10">
                                                                            <div className="text-right">
                                                                                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1 opacity-60">Gross Value</p>
                                                                                <p className="text-4xl font-black italic text-amber-500 leading-none tracking-tighter">€{order.total}</p>
                                                                            </div>
                                                                            <button 
                                                                                onClick={() => {
                                                                                    if (socket) {
                                                                                        socket.emit('confirm-cash-payment', { orderId: order.id.replace('#', ''), tableId: order.table });
                                                                                    }
                                                                                    updateOrderStatus(order.id, 'Paid');
                                                                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment: 'Cash (Verified)', status: 'Paid' } : o));
                                                                                    alert(`CASH VERIFIED\n----------------\nTransaction ID: ${order.id}\nStatus: Verified & Synced\nCustomer has been notified via the Green Social Hub.`);
                                                                                }}
                                                                                className="h-14 px-8 bg-amber-500 text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3"
                                                                            >
                                                                                <CheckCircle2 size={18} />
                                                                                Confirm Receipt
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1 opacity-60">Gross Value</p>
                                                                        <p className="text-4xl font-black italic text-primary leading-none tracking-tighter">€{order.total}</p>
                                                                        {order.status === 'Paid' && (
                                                                            <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full w-fit ml-auto">
                                                                                <ShieldCheck size={10} className="text-brand" />
                                                                                <span className="text-[8px] font-black text-brand uppercase tracking-widest">Payment Verified</span>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            {order.payment !== 'Cash' || order.status === 'Paid' ? (
                                                                <div className="flex gap-3">
                                                                    {order.status !== 'Served' && (
                                                                        <button className="w-14 h-14 bg-white/5 border-2 border-main rounded-2xl flex items-center justify-center text-secondary hover:text-primary hover:border-white/20 transition-all">
                                                                            <MessageCircle size={22} />
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => updateOrderStatus(order.id, (order.status === 'Served' || order.status === 'Ready to Go') ? 'Preparing' : 'Served')}
                                                                        className={`h-14 px-8 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl ${
                                                                            order.status === 'Served' 
                                                                            ? 'bg-btn-sec text-secondary border-2 border-main opacity-50 cursor-not-allowed' 
                                                                            : 'bg-brand text-dark-900 shadow-brand/20 hover:scale-105 active:scale-95'
                                                                        }`}
                                                                    >
                                                                        <CheckCircle2 size={18} />
                                                                        {order.status === 'Served' ? 'Order Fulfilled' : 'Finalize & Serve'}
                                                                    </button>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    {/* ITEMS & PROGRESS BAR */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-2 border-t border-main pt-8 relative z-10">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                {order.type === 'Stay Booking' ? <BedDouble size={14} className="text-brand" /> : <Utensils size={14} className="text-brand" />}
                                                                <span className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">
                                                                    {order.type === 'Stay Booking' ? 'Reservation Overview' : 'Production Pipeline'}
                                                                </span>
                                                            </div>
                                                            {order.type === 'Stay Booking' ? (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    <div className="p-4 bg-btn-sec rounded-2xl border border-main group/item hover:border-brand/40 transition-all">
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Check-In</span>
                                                                            <Calendar size={10} className="text-brand" />
                                                                        </div>
                                                                        <p className="text-sm font-black italic uppercase text-primary">{order.checkIn}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-btn-sec rounded-2xl border border-main group/item hover:border-brand/40 transition-all">
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Check-Out</span>
                                                                            <Calendar size={10} className="text-brand" />
                                                                        </div>
                                                                        <p className="text-sm font-black italic uppercase text-primary">{order.checkOut}</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="flex items-center gap-4 p-4 bg-dark-950/40 rounded-2xl border border-main group/item hover:border-brand/20 transition-all">
                                                                        <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-xs">
                                                                            {item.match(/\((\d+)x\)/) ? item.match(/\((\d+)x\)/)[1] : '1'}
                                                                        </div>
                                                                        <span className="text-xs font-bold text-primary truncate">{item.replace(/\(\d+x\)/, '').trim()}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <Activity size={14} className={order.status === 'Received' ? 'text-amber-400' : order.status === 'Preparing' ? 'text-violet-400' : 'text-brand'} />
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'Received' ? 'text-amber-400' : order.status === 'Preparing' ? 'text-violet-400' : 'text-brand'}`}>
                                                                        STATUS: {order.status}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] font-black text-primary opacity-60">{statusProgress}%</span>
                                                            </div>
                                                            
                                                            <div className="relative pt-2">
                                                                {/* Progress Bar Container */}
                                                                <div className="h-4 bg-dark-900 rounded-full border border-main p-1 overflow-hidden relative z-10">
                                                                    <motion.div 
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${statusProgress}%` }}
                                                                        className={`h-full rounded-full transition-all duration-700 relative shadow-[0_0_15px_rgba(52,211,153,0.3)] ${
                                                                            order.status === 'Received' ? 'bg-amber-500 shadow-amber-500/30' :
                                                                            order.status === 'Preparing' ? 'bg-violet-500 shadow-violet-500/30' :
                                                                            'bg-brand shadow-brand/30'
                                                                        }`}
                                                                    >
                                                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                                                    </motion.div>
                                                                </div>

                                                                {/* Status Dots */}
                                                                <div className="absolute top-1 left-0 right-0 flex justify-between px-1 z-20 pointer-events-none">
                                                                    {(isBooking ? [
                                                                        { key: 'Booked', color: 'bg-amber-400' },
                                                                        { key: 'Check-In', color: 'bg-violet-400' },
                                                                        { key: 'Staying', color: 'bg-primary' },
                                                                        { key: 'Departed', color: 'bg-primary' }
                                                                    ] : [
                                                                        { key: 'Received', color: 'bg-amber-400' },
                                                                        { key: 'Preparing', color: 'bg-violet-400' },
                                                                        { key: 'Ready', color: 'bg-primary' },
                                                                        { key: 'Served', color: 'bg-primary' }
                                                                    ]).map((dot, idx) => {
                                                                        const isActive = statusProgress >= (idx + 1) * 25;
                                                                        return (
                                                                            <div key={dot.key} className="relative flex flex-col items-center">
                                                                                <div className={`w-2.5 h-2.5 rounded-full border-2 border-dark-900 transition-all duration-500 ${isActive ? dot.color + ' scale-125 shadow-[0_0_8px_rgba(255,255,255,0.2)]' : 'bg-main'}`} />
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between mt-3 px-1">
                                                                {(isBooking ? [
                                                                    { label: 'Booked', color: 'text-amber-400' },
                                                                    { label: 'Check-In', color: 'text-violet-400' },
                                                                    { label: 'Staying', color: 'text-primary' },
                                                                    { label: 'Departed', color: 'text-primary' }
                                                                ] : [
                                                                    { label: 'Received', color: 'text-amber-400' },
                                                                    { label: 'Preparing', color: 'text-violet-400' },
                                                                    { label: 'Ready', color: 'text-primary' },
                                                                    { label: 'Served', color: 'text-primary' }
                                                                ]).map((step, idx) => {
                                                                    const isActive = statusProgress >= (idx + 1) * 25;
                                                                    const isCurrent = (statusProgress / 25) === (idx + 1);
                                                                    return (
                                                                        <span key={step.label} className={`text-[8px] font-black uppercase tracking-widest transition-all duration-500 ${isActive ? (isCurrent ? step.color : 'text-primary') : 'text-secondary opacity-30'}`}>
                                                                            {step.label}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}


                            {view === 'finance' && (
                                <motion.div key="finance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-primary leading-none">Financial Intel</h1>
                                            <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-none">Real-time Revenue & Payout Ledger</p>
                                        </div>
                                        <button onClick={handleExport} className="px-6 py-3 bg-btn-sec border border-main rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
                                            <FileText size={14} /> Export Datev (SKR03)
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 bg-dark-900 border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-30"></div>
                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center text-brand shadow-[0_0_15px_rgba(33,255,165,0.2)]">
                                                        <Activity size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-primary leading-none">Gross Performance</h3>
                                                        <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em] mt-1">Real-time Revenue Telemetry</p>
                                                    </div>
                                                </div>
                                                <select className="bg-btn-sec border border-main rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none text-primary cursor-pointer hover:border-brand/40 transition-all">
                                                    <option>Last 30 Days</option>
                                                    <option>Last 7 Days</option>
                                                    <option>Year to Date</option>
                                                </select>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 border-b border-white/5 pb-8">
                                                <div className="p-4 bg-black/40 border border-main rounded-2xl flex flex-col justify-between">
                                                    <p className="text-[7px] font-black text-secondary uppercase tracking-[0.1em] mb-2">Primary Sales</p>
                                                    <p className="text-xl font-black text-primary italic">€8,450.00</p>
                                                    <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[65%] bg-blue-400"></div></div>
                                                </div>
                                                <div className="p-4 bg-black/40 border border-main rounded-2xl flex flex-col justify-between">
                                                    <p className="text-[7px] font-black text-secondary uppercase tracking-[0.1em] mb-2">Premium / VIP</p>
                                                    <p className="text-xl font-black text-primary italic">€5,200.00</p>
                                                    <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[80%] bg-purple-400"></div></div>
                                                </div>
                                                <div className="p-4 bg-black/40 border border-main rounded-2xl flex flex-col justify-between">
                                                    <p className="text-[7px] font-black text-secondary uppercase tracking-[0.1em] mb-2">Ancillary / F&B</p>
                                                    <p className="text-xl font-black text-primary italic">€1,630.00</p>
                                                    <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[40%] bg-emerald-400"></div></div>
                                                </div>
                                                <div className="p-4 bg-black/40 border border-main rounded-2xl flex flex-col justify-between">
                                                    <p className="text-[7px] font-black text-secondary uppercase tracking-[0.1em] mb-2">Tx Volume</p>
                                                    <p className="text-xl font-black text-primary italic">1,420</p>
                                                    <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[100%] bg-brand"></div></div>
                                                </div>
                                            </div>

                                            <div className="h-48 flex items-end justify-between gap-3 px-2 relative z-10 pt-4">
                                                {[
                                                    { h: 35, v: 4200, l: 'Mon' }, 
                                                    { h: 45, v: 5400, l: 'Tue' }, 
                                                    { h: 40, v: 4800, l: 'Wed' }, 
                                                    { h: 65, v: 7800, l: 'Thu' }, 
                                                    { h: 85, v: 10200, l: 'Fri' }, 
                                                    { h: 95, v: 11400, l: 'Sat' }, 
                                                    { h: 55, v: 6600, l: 'Sun' }
                                                ].map((bar, i) => (
                                                    <div key={i} className="flex flex-col items-center gap-3 w-full h-full justify-end group">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-primary bg-dark-900 border border-brand/30 px-2 py-1 rounded mb-1 whitespace-nowrap">
                                                            €{bar.v.toLocaleString()}
                                                        </div>
                                                        <motion.div 
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${bar.h}%` }}
                                                            className="w-full bg-btn-sec border border-main rounded-t-lg relative overflow-hidden group-hover:border-brand/50 group-hover:bg-brand/10 transition-all"
                                                        >
                                                            <div className="absolute bottom-0 w-full bg-brand/40 h-1" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-brand/20 to-transparent opacity-0 group-hover:opacity-100" />
                                                        </motion.div>
                                                        <span className="text-[8px] font-black text-secondary uppercase">{bar.l}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 relative z-10 border-t border-white/5">
                                                <div className="p-6 bg-black/40 rounded-[2rem] border border-main flex flex-col justify-center items-center">
                                                    <p className="text-[8px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Gross Invoiced</p>
                                                    <p className="text-2xl font-black italic text-primary">€15,280.00</p>
                                                </div>
                                                <div className="p-6 bg-red-500/5 rounded-[2rem] border border-red-500/10 flex flex-col justify-center items-center">
                                                    <p className="text-[8px] font-black text-red-500/70 uppercase tracking-[0.2em] mb-2">Platform Comm. (15%)</p>
                                                    <p className="text-2xl font-black italic text-red-400">-€2,292.00</p>
                                                </div>
                                                <div className="p-6 bg-brand/10 rounded-[2rem] border border-brand/30 flex flex-col justify-center items-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(33,255,165,0.15)_0%,transparent_70%)]" />
                                                    <p className="text-[8px] font-black text-brand uppercase tracking-[0.2em] mb-2 relative z-10">Settlement Amount</p>
                                                    <p className="text-2xl font-black italic text-brand relative z-10">€12,988.00</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-btn-sec border border-glass rounded-[3rem] p-10 space-y-8">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Settlement Status</h3>
                                            <div className="space-y-6">
                                                <div className="text-center py-8 bg-brand/5 border border-brand/20 rounded-[2rem] shadow-xl">
                                                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Next Scheduled Payout</p>
                                                    <p className="text-4xl font-black italic text-primary">€3,412.50</p>
                                                    <p className="text-[9px] font-bold text-secondary uppercase mt-4">Expected: Friday, 01.05.2026</p>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest ml-2">Recent Payouts</p>
                                                    {[
                                                        { date: '24.04.2026', amount: '€4,210.30', status: 'Pending' },
                                                        { date: '17.04.2026', amount: '€3,890.50', status: 'Settled' }
                                                    ].map((p, i) => (
                                                        <div key={i} className="flex justify-between items-center p-4 bg-btn-sec rounded-xl border border-main">
                                                            <div>
                                                                <p className="text-xs font-black text-primary">{p.amount}</p>
                                                                <p className="text-[8px] text-secondary uppercase">{p.date}</p>
                                                            </div>
                                                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${p.status === 'Settled' ? 'bg-btn-sec text-primary' : 'bg-amber-500/10 text-primary'}`}>{p.status}</span>
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
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">VIP Perks</h1>
                                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-none">Loyalty Campaigns & Pioneer Incentives</p>
                                        </div>
                                        <button className="px-8 py-4 bg-amber-500 text-dark-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">Create New Perk</button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {promotions.map(p => (
                                            <div key={p.id} className="bg-btn-sec border border-glass rounded-[3rem] p-8 space-y-6 relative overflow-hidden group hover:border-amber-500/30 transition-all cursor-pointer">
                                                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-primary"><Star size={24} /></div>
                                                <div>
                                                    <h3 className="text-xl font-black italic uppercase text-primary">{p.title}</h3>
                                                    <p className="text-[10px] font-bold text-secondary uppercase mt-1 tracking-widest">{p.target}</p>
                                                </div>
                                                <div className="flex justify-between items-end border-t border-main pt-6">
                                                    <div>
                                                        <p className="text-[9px] font-black text-secondary uppercase mb-1">Vouchers Used</p>
                                                        <p className="text-2xl font-black italic text-primary leading-none">{p.used}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${p.status === 'Active' ? 'bg-btn-sec text-primary' : 'bg-gray-500/10 text-secondary'}`}>{p.status}</span>
                                                </div>
                                            </div>
                                        ))}
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
                                                <div className="absolute inset-4 border-2 border-brand/10 rounded-[2rem]" />
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
                                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest italic">Waiting for Crew Handshake...</p>
                                        </div>

                                        {/* MANUAL FORM */}
                                        <div className="bg-glass rounded-[3rem] p-10 space-y-8 border border-glass shadow-2xl">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black italic uppercase text-primary">Manual Voucher Entry</h3>
                                                <p className="text-[9px] text-secondary font-bold uppercase tracking-widest">Fallback authorization ledger</p>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Voucher ID / Code</label>
                                                    <input type="text" placeholder="GRN-XXXX" className="w-full bg-btn-sec border border-main rounded-2xl p-5 text-sm font-black uppercase tracking-widest text-brand outline-none focus:border-brand/40 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Authorized Value (€)</label>
                                                    <input type="number" placeholder="0.00" className="w-full bg-btn-sec border border-main rounded-2xl p-5 text-3xl font-black text-center text-primary outline-none focus:border-brand/40 transition-all italic" />
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
                                                <div key={i} className="p-6 bg-btn-sec border border-main rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 rounded-xl bg-btn-sec flex items-center justify-center text-primary shadow-lg"><ShieldCheck size={24} /></div>
                                                        <div>
                                                            <p className="text-sm font-black italic uppercase text-primary">{h.crew}</p>
                                                            <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">{h.item} • {h.time}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black italic text-primary leading-none">{h.amount}</p>
                                                        <p className="text-[8px] font-black text-primary uppercase mt-1 tracking-widest">{h.status}</p>
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
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-primary">Marketing <span className="text-brand">Hub</span></h1>
                                            </div>
                                            <p className="text-secondary text-xs font-bold uppercase tracking-widest">Broadcast 15s 4K Reels to the Green Network</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="px-6 py-3 bg-btn-sec border border-main rounded-xl text-right">
                                                <p className="text-[8px] font-black text-secondary uppercase tracking-widest">Global Reach</p>
                                                <p className="text-xl font-black italic text-brand">2.4M Pilots</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* 4K MEDIA STUDIO */}
                                        <div className="lg:col-span-1 bg-glass border border-brand/20 rounded-[3rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl -mr-10 -mt-10" />
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xl font-black italic uppercase text-primary">Media <span className="text-brand">Studio</span></h3>
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
                                                                <p className="text-[10px] font-black uppercase text-brand">Processing 4K Engine...</p>
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
                                                                <div className="w-16 h-16 rounded-full bg-btn-sec border border-main flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                                    <Upload size={32} />
                                                                </div>
                                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Upload 15s Reel</p>
                                                                <p className="text-[7px] font-bold text-secondary mt-2 uppercase">Videos exceeding 15s will be auto-clipped</p>
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
                                                    <label className="text-[9px] font-black text-secondary uppercase tracking-widest ml-1">Caption & Vibes</label>
                                                    <textarea 
                                                        value={broadcastCaption}
                                                        onChange={(e) => setBroadcastCaption(e.target.value)}
                                                        placeholder="Describe your product experience..."
                                                        className="w-full bg-btn-sec border border-main rounded-2xl p-4 text-sm font-bold text-primary focus:border-brand outline-none transition-all h-24 resize-none"
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
                                            <div className="bg-glass border border-glass rounded-[3rem] p-10">
                                                <div className="flex justify-between items-center mb-8">
                                                    <h3 className="text-xl font-black italic uppercase text-primary">Social <span className="text-brand">Interaction Monitor</span></h3>
                                                    <div className="flex gap-2">
                                                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">Live Data Sync</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-6">
                                                    {[
                                                        { label: 'Likes', value: '12.4K', trend: '+18%', icon: Heart, color: 'text-rose-500' },
                                                        { label: 'Comments', value: '892', trend: '+5%', icon: MessageCircle, color: 'text-brand' },
                                                        { label: 'Shares', value: '452', trend: '+12%', icon: Share2, color: 'text-primary' }
                                                    ].map((stat, i) => (
                                                        <div key={i} className="p-8 bg-btn-sec rounded-[2.5rem] border border-main group hover:border-brand/20 transition-all">
                                                            <stat.icon size={20} className={`${stat.color} mb-3`} />
                                                            <p className="text-[9px] font-black text-secondary uppercase tracking-widest">{stat.label}</p>
                                                            <p className="text-2xl font-black italic text-primary mt-1">{stat.value}</p>
                                                            <p className="text-[8px] font-black text-primary uppercase mt-2">{stat.trend} Surge</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-black italic uppercase text-primary ml-6">Live <span className="text-brand">15s Feed Preview</span></h3>
                                                <div className="grid grid-cols-2 gap-6">
                                                    {[
                                                        { title: 'Summer Spritz 4K', views: '45K', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop' },
                                                        { title: 'Golden Hour Beats', views: '28K', img: 'https://images.unsplash.com/photo-1551024601-8f230c6c64b9?q=80&w=800&auto=format&fit=crop' }
                                                    ].map((post, i) => (
                                                        <div key={i} className="aspect-video bg-dark-900 rounded-[2.5rem] border border-main relative overflow-hidden group">
                                                            <img src={post.img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt="Post" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Play size={12} className="text-brand" fill="currentColor" />
                                                                    <p className="text-[10px] font-black italic text-primary">{post.title}</p>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <div className="flex gap-3">
                                                                        <span className="text-[8px] font-black text-brand uppercase">{post.views} Views</span>
                                                                        <span className="text-[8px] font-black text-gray-400 uppercase">15.0s</span>
                                                                    </div>
                                                                    <button className="p-2 bg-white/10 rounded-lg text-primary hover:bg-brand hover:text-dark-900 transition-all"><Settings size={12} /></button>
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
                                                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand"><Sparkles size={28} /></div>
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Frankfurt <span className="text-brand">Strategic Hub</span></h1>
                                            </div>
                                            <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-none">AI-Powered City Momentum & Demand Forecast</p>
                                        </div>
                                        <div className="px-6 py-3 bg-btn-sec border border-main rounded-xl text-[10px] font-black uppercase tracking-widest text-brand">Live Neural Data Sync</div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter ml-2">Upcoming High-Demand Events</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {[
                                                    { title: 'Eintracht Frankfurt vs. Real Madrid', category: 'Football (UCL)', date: 'Saturday, 09.05.2026', impact: '95%', surge: 'Critical Rush', icon: Trophy, color: 'text-red-500' },
                                                    { title: 'Automechanika Frankfurt', category: 'Trade Fair (Messe)', date: '12.05 - 16.05.2026', impact: '82%', surge: 'High Demand', icon: Box, color: 'text-primary' },
                                                    { title: 'Museumsuferfest', category: 'City Festival', date: '22.05 - 24.05.2026', impact: '75%', surge: 'Medium Surge', icon: Users, color: 'text-primary' }
                                                ].map((event, i) => (
                                                    <div key={i} className="bg-btn-sec border border-main rounded-[2.5rem] p-8 flex items-center justify-between hover:bg-white/10 transition-all group overflow-hidden relative">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-10 -mt-10" />
                                                        <div className="flex items-center gap-6 relative z-10">
                                                            <div className={`w-16 h-16 rounded-2xl bg-btn-sec flex items-center justify-center ${event.color}`}><event.icon size={32} /></div>
                                                            <div>
                                                                <h4 className="text-xl font-black italic uppercase text-primary tracking-tighter">{event.title}</h4>
                                                                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">{event.category} | {event.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right relative z-10">
                                                            <div className="flex items-center gap-2 justify-end mb-1">
                                                                <TrendingUp size={14} className={event.color} />
                                                                <span className={`text-2xl font-black italic ${event.color}`}>{event.impact}</span>
                                                            </div>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-secondary">{event.surge}</p>
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
                                                    <div className="p-5 bg-btn-sec rounded-2xl border border-main">
                                                        <p className="text-[10px] font-black text-brand uppercase mb-3 flex items-center gap-2"><Sparkles size={12} /> Strategic Advice</p>
                                                        <p className="text-xs font-bold text-gray-300 leading-relaxed italic">
                                                            "The upcoming Champions League match will cause massive gridlock around Eco-Park Central. I recommend increasing valet staff by 20% and ensuring all EV chargers are pre-cleared by 15:00."
                                                        </p>
                                                    </div>

                                                    <div className="p-5 bg-btn-sec rounded-2xl border border-main">
                                                        <p className="text-[10px] font-black text-primary uppercase mb-3">Resource Forecast</p>
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
                                        <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-none">Legal Document Repository & Verification Status</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {[
                                            managerContext === 'FM' ? (
                                                { group: 'Fleet Credentials', docs: [{id: 'tl', name: 'Transport License (P-Schein)'}, {id: 'fip', name: 'Fleet Insurance Policy'}, {id: 'cc', name: 'Chauffeur Certification'}], icon: ShieldCheck, color: 'text-brand' }
                                            ) : (
                                                { group: 'Identity & Legal', docs: [{id: 'reg', name: 'Commercial Register'}, {id: 'mid', name: 'Manager ID'}, {id: 'tax', name: 'Tax Registration'}], icon: ShieldCheck, color: 'text-brand' }
                                            ),
                                            managerContext === 'FM' ? (
                                                { group: 'Vehicle Compliance', docs: [{id: 'vr', name: 'Vehicle Registration (V5C)'}, {id: 'tuv', name: 'Roadworthiness Cert (TÜV)'}, {id: 'es', name: 'Emission Standards'}], icon: FileText, color: 'text-primary' }
                                            ) : (
                                                { group: 'Licenses', docs: [{id: 'gast', name: 'Gastronomy License'}, {id: 'liq', name: 'Liquor License'}, {id: 'fire', name: 'Fire Safety'}], icon: FileText, color: 'text-primary' }
                                            ),
                                            { group: 'Banking & VAT', docs: [{id: 'sepa', name: 'SEPA Mandate'}, {id: 'vatc', name: 'VAT Certification'}, {id: 'bankv', name: 'Bank Validation'}], icon: Building2, color: 'text-primary' }
                                        ].map((group, i) => (
                                            <div key={group.group} className="bg-btn-sec border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity"><group.icon size={120} /></div>
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`p-4 rounded-2xl bg-btn-sec ${group.color}`}><group.icon size={24} /></div>
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{group.group}</h3>
                                                </div>
                                                <div className="space-y-4 relative z-10">
                                                    {group.docs.map((doc) => (
                                                        <div key={doc.id} className="p-5 bg-btn-sec rounded-2xl border border-main flex flex-col gap-4 hover:bg-white/10 transition-all border-l-4 border-l-transparent hover:border-l-brand">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs font-black italic uppercase text-primary">{doc.name}</span>
                                                                {user?.role === 'super_admin' ? (
                                                                    <div className="flex gap-2">
                                                                        <button className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-primary transition-all"><X size={12} /></button>
                                                                        <button className="p-2 bg-brand/10 text-brand rounded-lg hover:bg-brand hover:text-dark-900 transition-all"><CheckCircle size={12} /></button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[8px] font-black text-primary uppercase px-2 py-1 bg-amber-500/10 rounded">Awaiting Admin</span>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <label className="flex-1 cursor-pointer">
                                                                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={() => alert(`UPLOADING: ${doc.name} received by GREEN Compliance Engine.`)} />
                                                                    <div className="w-full py-3 bg-btn-sec border border-main rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                                                                        <Upload size={14} className="text-brand" />
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Upload (PDF/IMG)</span>
                                                                    </div>
                                                                </label>
                                                                {user?.role === 'super_admin' && (
                                                                    <button className="p-3 bg-btn-sec rounded-xl text-secondary hover:text-primary transition-colors" title="View Document">
                                                                        <FileText size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {view === 'fleet-control' && managerContext === 'FM' && (
                                <motion.div key="fleet-control" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-brand">Fleet Control <span className="text-primary">Hub</span></h1>
                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.4em]">Asset Verification & Identity Resolution</p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* VEHICLE VERIFICATION TERMINAL */}
                                        <div className="bg-glass border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Verification Queue</h3>
                                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Global Asset Governance</p>
                                                </div>
                                                <span className="px-3 py-1 bg-brand/10 text-brand rounded-lg text-[9px] font-black uppercase">Admin Auth Required</span>
                                            </div>

                                            <div className="space-y-4">
                                                {[
                                                    { id: 'V-882', driver: 'Marcus H.', model: 'Tesla Model 3', plate: 'F-GR-2024', status: 'awaiting_upload', photo: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=200&auto=format&fit=crop' },
                                                    { id: 'V-991', driver: 'Sarah K.', model: 'Mercedes EQE', plate: 'F-GR-9921', status: 'awaiting_verification', hasV5C: true, photo: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=200&auto=format&fit=crop' }
                                                ].map((v) => (
                                                    <div key={v.id} className="p-6 bg-btn-sec border border-main rounded-3xl space-y-4 group hover:border-brand/30 transition-all">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-20 h-14 bg-dark-950 rounded-xl overflow-hidden border border-main">
                                                                    <img src={v.photo} className="w-full h-full object-cover" alt="Car" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black italic uppercase text-primary">{v.driver}</p>
                                                                    <p className="text-[9px] font-bold text-secondary uppercase">{v.model} • {v.plate}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                {v.status === 'awaiting_upload' ? (
                                                                    <span className="text-[8px] font-black text-primary bg-amber-500/10 px-2 py-1 rounded uppercase">Missing V5C</span>
                                                                ) : (
                                                                    <span className="text-[8px] font-black text-primary bg-blue-400/10 px-2 py-1 rounded uppercase">Awaiting Super-Admin</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 pt-2 border-t border-main">
                                                            {v.status === 'awaiting_upload' ? (
                                                                <button 
                                                                    onClick={() => alert(`Opening Secure Upload for ${v.plate}...`)}
                                                                    className="flex-1 py-3 bg-btn-sec border border-main rounded-xl text-[9px] font-black uppercase text-gray-400 hover:text-primary hover:bg-brand/20 hover:border-brand/30 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <Upload size={14} className="text-brand" /> Upload V5C Registration
                                                                </button>
                                                            ) : (
                                                                <button className="flex-1 py-3 bg-btn-sec border border-main rounded-xl text-[9px] font-black uppercase text-secondary cursor-not-allowed flex items-center justify-center gap-2 opacity-50">
                                                                    <FileText size={14} /> Document Uploaded
                                                                </button>
                                                            )}
                                                            
                                                            <div className="flex gap-2">
                                                                {user?.role === 'super_admin' ? (
                                                                    <>
                                                                        <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-primary transition-all"><X size={16} /></button>
                                                                        <button className="p-3 bg-brand/10 text-brand rounded-xl hover:bg-brand hover:text-dark-900 transition-all"><CheckCircle size={16} /></button>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex gap-2 opacity-30">
                                                                        <div className="p-3 bg-btn-sec text-secondary rounded-xl cursor-not-allowed" title="Super Admin Only"><Lock size={16} /></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* RED FLAG RESOLUTION CENTER */}
                                        <div className="bg-glass border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Security Red Flags</h3>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-lg">
                                                    <ShieldAlert size={14} className="text-red-500" />
                                                    <span className="text-[9px] font-black text-red-500 uppercase">1 Active Collision</span>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl space-y-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert size={80} className="text-red-500" /></div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                                                        <User size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-black italic uppercase text-primary">Identity Collision Detected</p>
                                                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Driver: Thomas M. (ID: GRN-284M)</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <p className="text-[7px] font-black text-secondary uppercase tracking-widest text-center">Master Profile</p>
                                                        <div className="aspect-square bg-dark-950 rounded-2xl border border-main overflow-hidden shadow-inner">
                                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas" className="w-full h-full" alt="Profile" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[7px] font-black text-red-500 uppercase tracking-widest text-center">Challenge Capture</p>
                                                        <div className="aspect-square bg-dark-950 rounded-2xl border border-red-500/30 overflow-hidden relative shadow-inner">
                                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Stranger" className="w-full h-full grayscale" alt="Stranger" />
                                                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                                <span className="text-[8px] font-black bg-red-500 text-primary px-2 py-1 rounded italic uppercase shadow-lg">NO MATCH</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <button className="flex-1 py-4 bg-btn-sec border border-main rounded-2xl text-[9px] font-black uppercase text-gray-400 hover:text-primary transition-all">Reject Dispute</button>
                                                    <button className="flex-1 py-4 bg-red-500 text-primary rounded-2xl text-[9px] font-black uppercase shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">Permaban Account</button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ASSET ASSIGNMENT TERMINAL */}
                                        <div className="lg:col-span-2 bg-glass border border-main rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-10 opacity-5"><Briefcase size={120} className="text-brand" /></div>
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Active Deployment & Asset Assignment</h3>
                                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Remotely manage driver vehicle pairings</p>
                                                </div>
                                                <button 
                                                    onClick={() => setIsAddingVehicle(true)}
                                                    className="px-6 py-3 bg-brand/10 border border-brand/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand flex items-center gap-2 hover:bg-brand hover:text-dark-900 transition-all"
                                                >
                                                    <PlusCircle size={14} /> Add New Asset to Pool
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                                {[
                                                    { name: 'Marcus H.', status: 'In Service', current: 'Tesla Model 3', rating: 4.9, avatar: 'Marcus' },
                                                    { name: 'Sarah K.', status: 'Standby', current: 'VW ID.4', rating: 5.0, avatar: 'Sarah' },
                                                    { name: 'Thomas M.', status: 'Locked', current: 'None', rating: 0.0, avatar: 'Thomas', isLocked: true }
                                                ].map((driver) => (
                                                    <div key={driver.name} className={`p-6 rounded-3xl border transition-all ${driver.isLocked ? 'bg-red-500/5 border-red-500/20 grayscale opacity-60' : 'bg-btn-sec border-main hover:border-brand/30'}`}>
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="w-12 h-12 rounded-xl bg-brand/10 p-1 border border-brand/20">
                                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.avatar}`} className="w-full h-full rounded-lg" alt="Driver" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black italic uppercase text-primary leading-none">{driver.name}</p>
                                                                <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${driver.isLocked ? 'text-red-500' : 'text-brand'}`}>{driver.status}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[7px] font-black text-secondary uppercase tracking-widest ml-1">Assigned Vehicle</label>
                                                                <div className="w-full p-4 bg-dark-950 border border-main rounded-2xl flex items-center justify-between group cursor-pointer hover:border-brand/50 transition-all">
                                                                    <div className="flex items-center gap-3">
                                                                        <Car size={16} className={driver.isLocked ? 'text-secondary' : 'text-brand'} />
                                                                        <span className="text-[10px] font-black uppercase text-primary italic">{driver.current}</span>
                                                                    </div>
                                                                    {!driver.isLocked && <ChevronRight size={14} className="text-secondary group-hover:text-brand transition-colors" />}
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <button disabled={driver.isLocked} className="flex-1 py-3 bg-btn-sec border border-main rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:bg-white/10 transition-all">History</button>
                                                                <button disabled={driver.isLocked} className="flex-1 py-3 bg-brand/10 border border-brand/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand hover:bg-brand hover:text-dark-900 transition-all">Switch Asset</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* --- FLEET ADDITION MODAL --- */}
                            <AnimatePresence>
                                {isAddingVehicle && (
                                    <>
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setIsAddingVehicle(false)}
                                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
                                        />
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] p-1"
                                        >
                                            <div className="bg-dark-900 border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl overflow-hidden relative">
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-brand shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Add New Fleet Asset</h3>
                                                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Manual Vehicle Integration</p>
                                                    </div>
                                                    <button onClick={() => setIsAddingVehicle(false)} className="p-3 bg-btn-sec rounded-xl text-gray-400 hover:text-primary transition-all"><X size={20} /></button>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="w-full aspect-video bg-dark-950 border-2 border-dashed border-main rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                                                        {newVehicleData.photo ? (
                                                            <img src={newVehicleData.photo} className="w-full h-full object-cover" alt="Preview" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div className="w-12 h-12 rounded-full bg-btn-sec flex items-center justify-center text-secondary"><Car size={24} /></div>
                                                                <p className="text-[8px] font-black uppercase text-secondary tracking-widest">Upload Vehicle Profile</p>
                                                            </div>
                                                        )}
                                                        <input 
                                                            type="file" 
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setNewVehicleData(prev => ({ ...prev, photo: reader.result }));
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        {[
                                                            { label: 'Manufacturer & Model', field: 'model', placeholder: 'e.g. Tesla Model Y' },
                                                            { label: 'Year', field: 'year', placeholder: 'e.g. 2025' },
                                                            { label: 'License Plate', field: 'plate', placeholder: 'e.g. F-GR-2025' },
                                                            { label: 'Color', field: 'color', placeholder: 'e.g. Midnight Blue' }
                                                        ].map((f) => (
                                                            <div key={f.field} className="space-y-1.5">
                                                                <label className="text-[7px] font-black text-secondary uppercase tracking-widest ml-1">{f.label}</label>
                                                                <input 
                                                                    type="text"
                                                                    value={newVehicleData[f.field]}
                                                                    onChange={(e) => setNewVehicleData(prev => ({ ...prev, [f.field]: e.target.value }))}
                                                                    placeholder={f.placeholder}
                                                                    className="w-full bg-dark-950 border border-main rounded-xl px-4 py-3 text-[10px] font-bold text-primary outline-none focus:border-brand/50 transition-all placeholder:text-gray-800"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => {
                                                        alert("FLEET ASSET REGISTERED\n----------------------\nStatus: Pending Final Inspection");
                                                        setIsAddingVehicle(false);
                                                    }}
                                                    className="w-full py-5 bg-brand text-dark-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-brand/20 active:scale-95 transition-all"
                                                >
                                                    Register Asset to Pool
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>

                            {view === 'reputation' && (
                                <motion.div key="reputation" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary"><ShieldCheck size={28} /></div>
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Behavioral <span className="text-brand">Governance</span></h1>
                                            </div>
                                            <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-none">Reputation Ledger & Punishment Strike tracking</p>
                                        </div>
                                        <div className="px-6 py-3 bg-btn-sec border border-main rounded-xl text-[10px] font-black uppercase tracking-widest text-primary bg-white/10">Official Green Standing</div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* REPUTATION STATS */}
                                        <div className="lg:col-span-1 space-y-8">
                                            <div className="bg-btn-sec border border-main rounded-[3rem] p-10 space-y-10">
                                                <div className="space-y-2 text-center">
                                                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Trust Quotient</p>
                                                    <p className="text-6xl font-black italic text-primary tracking-tighter">{(user?.greenFlags / 1000).toFixed(1)}K</p>
                                                    <p className="text-[8px] font-black text-primary/50 uppercase">Verified Green Flags</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-[10px] font-black uppercase text-gray-400">Suspension Strike 1</p>
                                                        <p className="text-xs font-black text-primary italic">{user?.redFlags}/3 Flags</p>
                                                    </div>
                                                    <div className="h-4 bg-btn-sec rounded-full overflow-hidden p-1 border border-main">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(user?.redFlags / 3) * 100}%` }}
                                                            className={`h-full rounded-full ${user?.redFlags > 1 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-brand shadow-[0_0_15px_rgba(52,211,153,0.5)]'}`}
                                                        />
                                                    </div>
                                                    <p className="text-[7px] font-black text-secondary uppercase text-center tracking-[0.2em]">Next Strike triggers 6-Month Automatic Freeze</p>
                                                </div>
                                            </div>

                                            <div className="p-10 bg-gradient-to-br from-white/5 to-transparent border border-main rounded-[3rem] space-y-6">
                                                <h3 className="text-sm font-black italic uppercase text-primary">How it works</h3>
                                                <ul className="space-y-4">
                                                    {[
                                                        { icon: ShieldCheck, text: 'Green Flags boost your visibility in the 4K Live Feed.', color: 'text-brand' },
                                                        { icon: ShieldAlert, text: '3 Red Flags = 6 Mo Ban. 6 Flags = 12 Mo. 9 Flags = Permaban.', color: 'text-red-500' },
                                                        { icon: Handshake, text: 'Resolve issues with customers to have flags revoked.', color: 'text-primary' }
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
                                            <div className="bg-glass border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                                                <h3 className="text-xl font-black italic uppercase text-primary">Incident <span className="text-brand">History</span></h3>
                                                
                                                <div className="space-y-4">
                                                    {[
                                                        { id: 'GRN-421', type: 'Red Flag', reason: 'Unsafe Driving Report', date: '02.05.2026', status: 'Pending', color: 'text-primary' },
                                                        { id: 'GRN-398', type: 'Red Flag', reason: 'Misleading Advertisement', date: '28.04.2026', status: 'Revoked', color: 'text-primary' },
                                                        { id: 'GRN-112', type: 'Green Flag', reason: 'Exceptional Service Award', date: '15.04.2026', status: 'Permanent', color: 'text-brand' }
                                                    ].map((incident, i) => (
                                                        <div key={i} className="p-6 bg-btn-sec rounded-[2rem] border border-main flex items-center justify-between group hover:bg-white/10 transition-all">
                                                            <div className="flex items-center gap-6">
                                                                <div className={`w-12 h-12 rounded-xl bg-btn-sec flex items-center justify-center ${incident.color}`}><ShieldAlert size={20} /></div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-sm font-black italic uppercase text-primary">{incident.reason}</p>
                                                                        <span className="text-[8px] font-black text-secondary bg-btn-sec px-2 py-0.5 rounded uppercase">ID: {incident.id}</span>
                                                                    </div>
                                                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mt-1">{incident.type} • {incident.date}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {incident.status === 'Pending' && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
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
                                                                    <p className="text-[7px] font-black text-secondary uppercase mt-2">Proposal Sent</p>
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
                                            <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-none">Identity, Business Credentials & GPS Lockdown</p>
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
                                        <div className="bg-btn-sec border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 rounded-2xl bg-violet-500/10 text-primary"><User size={24} /></div>
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Manager Identity</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Full Legal Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={personalInfo.name} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-violet-400 outline-none transition-all" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Direct Email</label>
                                                    <input 
                                                        type="email" 
                                                        value={personalInfo.email} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-violet-400 outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Mobile Line</label>
                                                    <input 
                                                        type="text" 
                                                        value={personalInfo.phone} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-violet-400 outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* BUSINESS CORE DETAILS */}
                                        <div className="bg-btn-sec border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 rounded-2xl bg-brand/10 text-brand"><Building2 size={24} /></div>
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Business Genesis</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Legal Entity Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={businessInfo.legalName} 
                                                        onChange={(e) => setBusinessInfo({...businessInfo, legalName: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-brand outline-none transition-all" 
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">HQ Physical Address</label>
                                                    <input 
                                                        type="text" 
                                                        value={businessInfo.address} 
                                                        onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">VAT ID (EU/DE)</label>
                                                    <input type="text" defaultValue="DE123456789" className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Settlement IBAN</label>
                                                    <input 
                                                        type="text" 
                                                        value={bankingInfo.iban} 
                                                        onChange={(e) => setBankingInfo({...bankingInfo, iban: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* GPS Lockdown (Relocated) */}
                                        {(managerContext !== 'FM' && managerContext !== 'SM') && (
                                            <div className="lg:col-span-2 bg-dark-900 border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className="p-4 rounded-2xl bg-brand/10 text-brand"><Smartphone size={24} /></div>
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Geofence Ordering Hard-Lock</h3>
                                                </div>
                                                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                                                    <div className="flex-1 space-y-6">
                                                        <div className="flex items-center justify-between p-8 bg-black/40 rounded-3xl border border-main">
                                                            <div>
                                                                <p className="text-sm font-black italic uppercase text-primary">Proximity Enforcement</p>
                                                                <p className="text-[10px] font-bold text-secondary uppercase mt-1">Require physical presence for digital ordering</p>
                                                            </div>
                                                            <div className="w-12 h-6 bg-brand rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-xl" /></div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full md:w-64 space-y-4 px-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Lockdown Radius</label>
                                                        <div className="flex items-center gap-6">
                                                            <input type="range" min="10" max="500" defaultValue="50" className="flex-1 accent-brand h-2 bg-black/40 rounded-full appearance-none" />
                                                            <span className="text-xl font-black italic text-brand">50m</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {view === 'staff' && (
                                <motion.div key="staff" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-primary leading-none">Team Hub</h1>
                                            <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-none">Access Control & Active Personnel</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/manager/onboarding-staff')}
                                            className="px-8 py-4 bg-violet-500 text-primary rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-500/20"
                                        >
                                            Onboard Staff
                                        </button>
                                    </div>
                                    
                                    <div className="bg-glass border border-main rounded-[3rem] p-10 space-y-4 shadow-2xl">
                                        {staffList.map((member, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-btn-sec rounded-3xl border border-main hover:bg-white/10 hover:border-brand/20 transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 p-1">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} alt="Avatar" className="w-full h-full rounded-xl" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-sm font-black italic uppercase text-primary tracking-tight leading-none">{member.name}</p>
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
                                                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest">{member.role}</p>
                                                        <p className={`text-[8px] font-black uppercase mt-0.5 ${member.status === 'On Shift' ? 'text-primary' : 'text-secondary'}`}>{member.status}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate(`/manager/staff-permissions/${member.id || `ST-10${i+24}`}`)}
                                                        className="p-4 bg-btn-sec border border-main rounded-2xl text-secondary hover:text-brand hover:bg-brand/10 hover:border-brand/40 transition-all shadow-xl group-hover:scale-110"
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
                                        <div className="w-20 h-20 bg-violet-500/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto border border-violet-500/20 shadow-2xl">
                                            <PlusCircle size={40} />
                                        </div>
                                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Staff <span className="text-primary">Onboarding</span></h1>
                                        <p className="text-secondary text-xs font-bold uppercase tracking-[0.3em] leading-none">Search Personnel by Green ID</p>
                                    </div>

                                    <div className="bg-glass border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                        <div className="relative">
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                                            <input 
                                                type="text" 
                                                placeholder="Enter Staff ID (e.g. ST-1024)" 
                                                value={staffSearchId}
                                                onChange={(e) => setStaffSearchId(e.target.value)}
                                                className="w-full bg-btn-sec border border-main rounded-2xl py-6 pl-16 pr-6 text-sm font-black uppercase tracking-widest text-brand outline-none focus:border-brand transition-all" 
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
                                                    <div className="p-6 bg-btn-sec rounded-3xl border border-main flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 p-1">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${foundStaff.avatar}`} alt="Avatar" className="w-full h-full rounded-xl" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black italic uppercase text-primary">{foundStaff.name}</p>
                                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{foundStaff.role}</p>
                                                        </div>
                                                        <div className="ml-auto">
                                                            <span className="px-4 py-1.5 bg-white/10 text-primary rounded-lg text-[9px] font-black uppercase">Verified ID</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Quick Templates</p>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {[
                                                                { id: 'pilot', label: 'Standard Pilot', icon: Zap },
                                                                { id: 'supervisor', label: 'Supervisor', icon: ShieldCheck },
                                                                { id: 'accountant', label: 'Accountant', icon: Receipt }
                                                            ].map(t => (
                                                                <button 
                                                                    key={t.id}
                                                                    onClick={() => applyTemplate(t.id)}
                                                                    className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${activeTemplate === t.id ? 'bg-brand text-dark-900 border-brand shadow-lg shadow-brand/20' : 'bg-btn-sec border-main text-secondary'}`}
                                                                >
                                                                    <t.icon size={16} />
                                                                    <span className="text-[10px] font-black uppercase tracking-tighter">{t.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Operational Permissions</p>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, orders: !prev.orders }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.orders ? 'bg-brand/10 border-brand' : 'bg-btn-sec border-main'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.orders ? 'bg-brand text-dark-900' : 'bg-btn-sec text-secondary'}`}><ShoppingBag size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.orders ? 'text-primary' : 'text-secondary'}`}>Orders & Queue</p>
                                                                <p className="text-[8px] font-bold text-secondary uppercase mt-1">Process live service requests</p>
                                                            </button>
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, terminal: !prev.terminal }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.terminal ? 'bg-brand/10 border-brand' : 'bg-btn-sec border-main'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.terminal ? 'bg-brand text-dark-900' : 'bg-btn-sec text-secondary'}`}><QrCode size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.terminal ? 'text-primary' : 'text-secondary'}`}>Scan Terminal</p>
                                                                <p className="text-[8px] font-bold text-secondary uppercase mt-1">Verify tickets & vouchers</p>
                                                            </button>
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, finance: !prev.finance }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.finance ? 'bg-brand/10 border-brand' : 'bg-btn-sec border-main'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.finance ? 'bg-brand text-dark-900' : 'bg-btn-sec text-secondary'}`}><Receipt size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.finance ? 'text-primary' : 'text-secondary'}`}>Financial Intel</p>
                                                                <p className="text-[8px] font-bold text-secondary uppercase mt-1">View revenue & exports</p>
                                                            </button>
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, compliance: !prev.compliance }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.compliance ? 'bg-violet-500/10 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'bg-btn-sec border-main'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.compliance ? 'bg-violet-500 text-primary' : 'bg-btn-sec text-secondary'}`}><ShieldCheck size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.compliance ? 'text-primary' : 'text-secondary'}`}>Compliance</p>
                                                                <p className="text-[8px] font-bold text-secondary uppercase mt-1">
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
                                                        className="w-full py-6 bg-violet-500 text-primary rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/30 hover:scale-[1.02] active:scale-95 transition-all"
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
                                <motion.div key="stadium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 pb-20">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand"><Ticket size={24} /></div>
                                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-primary">Ticket <span className="text-brand">Hub</span></h1>
                                            </div>
                                            <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-none">Inventory Command • Batch Management</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="px-6 py-3 bg-btn-sec border border-main rounded-xl text-right">
                                                <p className="text-[8px] font-black text-secondary uppercase tracking-widest">Global Availability</p>
                                                <p className="text-xl font-black italic text-brand">4,820 Seats</p>
                                            </div>
                                            <button 
                                                onClick={() => setIsAddingEvent(true)}
                                                className="px-8 py-4 bg-brand text-dark-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Upload Tickets
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* EVENT INVENTORY LIST */}
                                        <div className="lg:col-span-8 space-y-6">
                                            {stadiumEvents.map((event) => (
                                                <div key={event.id} className="bg-glass border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] rounded-full -mr-20 -mt-20 opacity-40" />
                                                    
                                                    <div className="flex justify-between items-start relative z-10">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-2xl font-black italic uppercase text-primary">{event.name}</h3>
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${event.published ? 'bg-brand text-dark-900' : 'bg-btn-sec text-secondary border border-main'}`}>
                                                                    {event.published ? 'LIVE ON APP' : 'DRAFT'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">{event.date} • {event.time} • Green Stadium Arena</p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={() => togglePublishEvent(event.id)}
                                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${event.published ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand/10 text-brand border border-brand/20'}`}
                                                            >
                                                                {event.published ? 'Unpublish' : 'Publish to App'}
                                                            </button>
                                                            <button className="p-2 bg-btn-sec border border-main rounded-xl text-secondary hover:text-primary transition-all">
                                                                <Settings size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                                        {event.tiers.map((tier, idx) => (
                                                            <div key={idx} className="p-6 bg-btn-sec rounded-[2rem] border border-main space-y-4 hover:border-brand/30 transition-all">
                                                                <div className="flex justify-between items-center">
                                                                    <p className="text-[9px] font-black text-secondary uppercase">{tier.name}</p>
                                                                    <p className="text-xs font-black italic text-brand">€{tier.price}</p>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between items-end text-[8px] font-black uppercase tracking-widest">
                                                                        <span className="text-secondary">Sales Progress</span>
                                                                        <span className="text-primary">{tier.sold} / {tier.quantity}</span>
                                                                    </div>
                                                                    <div className="h-1.5 bg-dark-900 rounded-full overflow-hidden border border-white/5">
                                                                        <motion.div 
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${(tier.sold / tier.quantity) * 100}%` }}
                                                                            className="h-full bg-brand shadow-[0_0_10px_rgba(33,255,165,0.4)]"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                                    <p className="text-[8px] font-bold text-secondary uppercase">Revenue</p>
                                                                    <p className="text-[10px] font-black text-primary">€{(tier.sold * tier.price).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* TACTICAL STATS & CONTROLS */}
                                        <div className="lg:col-span-4 space-y-8">
                                            <div className="bg-dark-900 border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl sticky top-6">
                                                <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                                                    <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400 border border-violet-500/20">
                                                        <Activity size={32} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Market Pulse</h3>
                                                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mt-1">Real-time Demand Index</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="p-6 bg-btn-sec rounded-2xl border border-main">
                                                        <p className="text-[8px] font-black text-secondary uppercase mb-2 tracking-widest">Total Sales Velocity</p>
                                                        <p className="text-3xl font-black italic text-brand">+14.2% <span className="text-[10px] text-secondary not-italic uppercase">vs Last Event</span></p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 bg-btn-sec rounded-2xl border border-main">
                                                            <p className="text-[7px] font-black text-secondary uppercase mb-1">Queue Traffic</p>
                                                            <p className="text-xs font-black uppercase text-primary italic">Minimal</p>
                                                        </div>
                                                        <div className="p-4 bg-btn-sec rounded-2xl border border-main">
                                                            <p className="text-[7px] font-black text-secondary uppercase mb-1">Server Load</p>
                                                            <p className="text-xs font-black uppercase text-brand italic">Optimal</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 pt-6">
                                                        <h4 className="text-[9px] font-black text-secondary uppercase tracking-widest ml-1">Quick Actions</h4>
                                                        <button className="w-full py-5 bg-btn-sec border border-main rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                                            <Zap size={14} className="text-brand" /> Instant Flash Sale
                                                        </button>
                                                        <button className="w-full py-5 bg-btn-sec border border-main rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                                            Export Sales Ledger
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ADD EVENT MODAL OVERLAY */}
                                    <AnimatePresence>
                                        {isAddingEvent && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6">
                                                <motion.div 
                                                    initial={{ scale: 0.9, y: 20 }} 
                                                    animate={{ scale: 1, y: 0 }} 
                                                    exit={{ scale: 0.9, y: 20 }}
                                                    className="w-full max-w-2xl bg-dark-900 border border-brand/20 rounded-[4rem] p-12 space-y-10 shadow-2xl relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] rounded-full" />
                                                    
                                                    <div className="text-center space-y-4">
                                                        <div className="w-20 h-20 bg-brand/10 rounded-[2rem] flex items-center justify-center text-brand mx-auto"><Upload size={40} /></div>
                                                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Upload <span className="text-brand">Tickets</span></h2>
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Import and verify ticket manifest</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="col-span-2 space-y-2">
                                                            <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Event Identity</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="e.g. World Tour: Neon Nights" 
                                                                value={newEventData.name}
                                                                onChange={e => setNewEventData({...newEventData, name: e.target.value})}
                                                                className="w-full bg-btn-sec border border-main rounded-3xl p-6 text-xl font-black italic focus:border-brand outline-none transition-all" 
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Deployment Date</label>
                                                            <input 
                                                                type="date" 
                                                                value={newEventData.date}
                                                                onChange={e => setNewEventData({...newEventData, date: e.target.value})}
                                                                className="w-full bg-btn-sec border border-main rounded-3xl p-6 text-sm font-black focus:border-brand outline-none transition-all uppercase" 
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Start Time</label>
                                                            <input 
                                                                type="time" 
                                                                value={newEventData.time}
                                                                onChange={e => setNewEventData({...newEventData, time: e.target.value})}
                                                                className="w-full bg-btn-sec border border-main rounded-3xl p-6 text-sm font-black focus:border-brand outline-none transition-all" 
                                                            />
                                                        </div>

                                                        <div className="col-span-2 pt-4 space-y-6 border-t border-white/5">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Inventory Data Source</label>
                                                                <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">CSV / EXCEL / XML</span>
                                                            </div>
                                                            
                                                            <div className="flex gap-4 items-center">
                                                                <button 
                                                                    onClick={handleSimulateUpload}
                                                                    disabled={isSimulatingUpload}
                                                                    className="flex-1 border-2 border-dashed border-main rounded-3xl p-8 hover:border-brand/40 hover:bg-brand/5 transition-all text-center space-y-3 group"
                                                                >
                                                                    {isSimulatingUpload ? (
                                                                        <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin mx-auto" />
                                                                    ) : (
                                                                        <Upload size={32} className="mx-auto text-secondary group-hover:text-brand transition-colors" />
                                                                    )}
                                                                    <div>
                                                                        <p className="text-sm font-black uppercase text-primary italic">
                                                                            {isSimulatingUpload ? 'Parsing Manifest...' : 'Select File to Upload'}
                                                                        </p>
                                                                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest mt-1">
                                                                            {isSimulatingUpload ? 'Extracting Seat Matrix Data' : 'Click to browse local files'}
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                                
                                                                <div className="w-12 flex flex-col items-center justify-center opacity-40">
                                                                    <div className="w-px h-12 bg-white" />
                                                                    <span className="text-[9px] font-black my-2 uppercase">OR</span>
                                                                    <div className="w-px h-12 bg-white" />
                                                                </div>
                                                                
                                                                <div className="flex-1 space-y-2">
                                                                    <label className="text-[9px] font-black text-secondary uppercase tracking-widest ml-4">Manual Override Quantity</label>
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="number" 
                                                                            value={newEventData.tiers[0].quantity}
                                                                            onChange={e => {
                                                                                const updatedTiers = [...newEventData.tiers];
                                                                                updatedTiers[0].quantity = parseInt(e.target.value) || 0;
                                                                                setNewEventData({...newEventData, tiers: updatedTiers});
                                                                            }}
                                                                            className="w-full bg-btn-sec border border-main rounded-3xl p-6 text-3xl font-black italic text-brand focus:border-brand outline-none transition-all pl-16" 
                                                                        />
                                                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black italic text-brand/40">#</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4 pt-6">
                                                        <button 
                                                            onClick={handleAddEvent}
                                                            className="flex-1 py-6 bg-brand text-dark-900 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                                                        >
                                                            Commit Batch
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsAddingEvent(false)}
                                                            className="px-10 py-6 bg-btn-sec border border-main rounded-[2.5rem] text-xs font-black uppercase tracking-widest text-secondary hover:text-primary transition-all"
                                                        >
                                                            Abort
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                                {view === 'parking-grid' && (
                                    <motion.div key="parking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                        <div className="flex justify-between items-center bg-btn-sec p-8 rounded-[2.5rem] border border-main">
                                            <div className="flex gap-10">
                                                {parkingStructure.map(floor => (
                                                    <div key={floor.floor}>
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Floor {floor.floor}</p>
                                                        <p className="text-2xl font-black italic text-primary">{floor.free}<span className="text-xs text-secondary"> / {floor.total}</span></p>
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
                                                <div key={i} className="group relative bg-dark-900 border border-main rounded-2xl p-4 hover:border-brand/50 transition-all cursor-pointer">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="text-[8px] font-black text-secondary uppercase">P1-{100+i}</span>
                                                        <div className={`w-2 h-2 rounded-full ${i % 5 === 0 ? 'bg-red-500' : 'bg-brand shadow-[0_0_10px_var(--brand)]'}`} />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase text-primary">VIP Valet</p>
                                                    <p className="text-[8px] font-bold text-secondary mt-1">€12.50 / Hour</p>
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
                                                <p className="text-secondary text-xs font-bold uppercase tracking-widest">Live Wash Queue</p>
                                            </div>
                                            <button className="px-6 py-3 bg-btn-sec border border-main text-primary rounded-xl text-[10px] font-black uppercase">Add Manual Service +</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {carwashServices.map(service => (
                                                <div key={service.id} className="p-8 bg-btn-sec border border-main rounded-[2.5rem] relative overflow-hidden group hover:border-brand/40 transition-all">
                                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <Droplets size={48} />
                                                    </div>
                                                    <p className="text-[8px] font-black text-brand uppercase tracking-widest mb-2">{service.type}</p>
                                                    <h3 className="text-2xl font-black italic uppercase text-primary mb-4">{service.name}</h3>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Duration</p>
                                                            <p className="text-lg font-black text-primary">{service.duration}</p>
                                                        </div>
                                                        <p className="text-3xl font-black italic text-brand">€{service.price.toFixed(0)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'qr-dispatcher' && managerContext === 'PM' && (
                                    <motion.div key="dispatcher-pm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full flex flex-col items-center justify-center p-6 md:p-12">

                                        <div className="w-full max-w-2xl bg-dark-900 border-2 border-brand/20 rounded-[3.5rem] p-12 space-y-12 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] rounded-full" />
                                            <div className="text-center space-y-4">
                                                <div className="w-24 h-24 bg-brand/10 rounded-[2.5rem] flex items-center justify-center text-brand mx-auto shadow-[0_0_50px_rgba(33,255,165,0.2)]"><QrCode size={48} /></div>
                                                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Access <span className="text-brand">Dispatcher</span></h2>
                                                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Encrypted QR Provisioning Hub</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Vehicle Plate #</label>
                                                    <input type="text" placeholder="e.g. B-G-2026" className="w-full bg-btn-sec border border-main rounded-2xl p-5 text-xl font-black italic focus:border-brand outline-none transition-all placeholder:text-gray-700" id="plateInput" />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Pass Duration</label>
                                                    <select className="w-full bg-btn-sec border border-main rounded-2xl p-5 text-sm font-black uppercase italic focus:border-brand outline-none transition-all appearance-none"><option>2 Hours Access</option><option>Match Day (8h)</option><option>Unlimited VIP</option></select>
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
                                                        <p className="text-xs text-secondary font-bold uppercase tracking-widest">Awaiting ticket or voucher...</p>
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
                                                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full max-w-lg aspect-square bg-black rounded-[3rem] border-4 border-main overflow-hidden shadow-2xl">
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
                                                        <p className="text-[10px] font-black uppercase text-brand tracking-widest">Align QR Code within the frame</p>
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
                                                    <div className="bg-dark-900 border border-brand/30 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl" />
                                                        <div className="flex flex-col items-center text-center space-y-6">
                                                            <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center text-dark-900 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                                                                <CheckCircle size={40} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Ticket Secured</h3>
                                                                <p className="text-[10px] font-bold text-brand uppercase tracking-[0.3em] mt-1">Transaction Confirmed</p>
                                                            </div>
                                                            <div className="w-full space-y-4 pt-6 border-t border-main">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-black uppercase text-secondary">Guest</span>
                                                                    <span className="text-sm font-black italic uppercase text-primary">{scannedData.guest}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-black uppercase text-secondary">Service</span>
                                                                    <span className="text-sm font-black italic uppercase text-brand text-right">{scannedData.service}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-black uppercase text-secondary">Status</span>
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
                                                            <button onClick={() => setQrScanStep('scanning')} className="h-14 bg-btn-sec border border-main rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:bg-white/10 transition-all">Try Again</button>
                                                            <button onClick={() => setView('overview')} className="h-14 bg-btn-sec border border-main rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:bg-white/10 transition-all">Dashboard</button>
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
                                <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center text-brand mb-8 border border-brand/20 shadow-[0_0_50px_rgba(52,211,153,0.3)]"><ShieldCheck size={48} /></div>
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-primary mb-2">
                                    {(managerContext === 'PM' || managerContext === 'WM') ? 'Security Gate' : 'Vault Locked'}
                                </h2>
                                <p className="max-w-sm text-secondary font-bold uppercase tracking-widest text-[10px] mb-10">Manager Identity Verification Required</p>
                                <div className="w-full max-w-xs space-y-4">
                                    <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)} className="w-full bg-btn-sec border border-main rounded-2xl p-6 text-center text-2xl font-black tracking-[0.5em] text-brand outline-none focus:border-brand transition-all" placeholder="••••" />
                                    <div className="flex gap-4">
                                        <button onClick={() => { if(passInput === securityPassword) { setIsUnlocked(true); setShowSecurityGate(false); } }} className="flex-1 py-5 bg-brand text-dark-900 rounded-2xl font-black uppercase text-xs shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all">Unlock</button>
                                        <button onClick={() => setShowSecurityGate(false)} className="flex-1 py-5 bg-btn-sec text-secondary rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all">Cancel</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* GRID MASTER CONTROL PANEL */}
                    <AnimatePresence>
                        {isMasterControlOpen && (
                            <motion.div 
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                className="fixed top-1/2 -translate-y-1/2 right-4 w-72 bg-[#0B121E]/90 backdrop-blur-2xl border border-brand/30 rounded-[2.5rem] p-8 z-[500] shadow-[0_0_100px_rgba(33,255,165,0.15)] space-y-8"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-black italic uppercase text-brand tracking-widest flex items-center gap-2">
                                        <Lock size={14} className="text-brand" /> Context Gateway
                                    </h3>
                                    <button onClick={() => setIsMasterControlOpen(false)} className="text-secondary hover:text-primary"><X size={16} /></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Context Switcher</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'HM', label: 'Hotel' },
                                                { id: 'RM', label: 'Restaurant' },
                                                { id: 'BM', label: 'Bar' },
                                                { id: 'CM', label: 'Nightlife' },
                                                { id: 'SM', label: 'Stadium' },
                                                { id: 'FM', label: 'Fleet' }
                                            ].map(ctx => (
                                                <button 
                                                    key={ctx.id}
                                                    onClick={() => {
                                                        setManagerContext(ctx.id);
                                                        localStorage.setItem('green_manager_context', ctx.id);
                                                        window.location.reload(); // Hard sync for sidebar
                                                    }}
                                                    className={`py-3 rounded-xl text-[8px] font-black uppercase transition-all ${managerContext === ctx.id ? 'bg-brand text-dark-900 shadow-lg' : 'bg-btn-sec text-secondary hover:bg-white/10'}`}
                                                >
                                                    {ctx.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-main">
                                        <p className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Identity Simulator</p>
                                        <div className="flex gap-2">
                                            {['manager', 'staff'].map(role => (
                                                <button 
                                                    key={role}
                                                    onClick={() => {
                                                        setSimRole(role);
                                                        localStorage.setItem('green_sim_role', role);
                                                    }}
                                                    className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${simRole === role ? 'bg-violet-500 text-primary shadow-lg shadow-violet-500/20' : 'bg-btn-sec text-secondary hover:bg-white/10'}`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {simRole === 'staff' && (
                                        <div className="space-y-3 pt-4 border-t border-main animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Assigned Job Role</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(() => {
                                                    let roles = [];
                                                    if (['RM', 'BM', 'CM'].includes(managerContext)) roles = [{id: 'waiter', l: 'Waiter'}, {id: 'cashier', l: 'Cashier'}];
                                                    else if (managerContext === 'HM') roles = [{id: 'reception', l: 'Reception'}];
                                                    else if (managerContext === 'SM') roles = [{id: 'parking', l: 'Parking'}, {id: 'valet', l: 'Valet'}];
                                                    else roles = [{id: 'staff', l: 'Staff'}];

                                                    return roles.map(r => (
                                                        <button 
                                                            key={r.id}
                                                            onClick={() => {
                                                                setSimTemplate(r.id);
                                                                localStorage.setItem('green_staff_template', r.id);
                                                            }}
                                                            className={`py-3 rounded-xl text-[8px] font-black uppercase transition-all ${simTemplate === r.id ? 'bg-amber-500 text-dark-900 shadow-lg' : 'bg-btn-sec text-secondary hover:bg-white/10'}`}
                                                        >
                                                            {r.l}
                                                        </button>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 pt-4 border-t border-main">
                                        <p className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Global Simulation</p>
                                        <button 
                                            onClick={() => alert("Simulation Synchronized. All AI nodes reporting optimal.")}
                                            className="w-full py-4 bg-btn-sec border border-main rounded-xl text-[8px] font-black uppercase tracking-widest text-brand hover:bg-brand/10 transition-all"
                                        >
                                            Force AI Sync
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* MASTER DOOR TRIGGER */}
                    <div className="fixed bottom-10 right-10 z-[200]">
                        <button 
                            onClick={() => setIsMasterControlOpen(!isMasterControlOpen)} 
                            className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all border-4 border-[#0B121E] group ${isMasterControlOpen ? 'bg-primary text-dark-900 rotate-45' : 'bg-dark-900 text-primary'}`}
                        >
                            <PlusCircle size={28} />
                        </button>
                    </div>


                    {/* AI INFRASTRUCTURE AGENT OVERLAYS */}
                    <AnimatePresence>
                        {(isScanningStructure || isScanningWash) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[300] bg-dark-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8">
                                {!structureApprovalPending && !washApprovalPending ? (
                                    <div className="text-center space-y-12">
                                        <div className="relative w-48 h-48 mx-auto">
                                            <div className="absolute inset-0 bg-brand/20 rounded-[3rem]" />
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
                                            <p className="text-xs text-secondary font-bold uppercase tracking-[0.4em]">Parsing Physical Infrastructure...</p>
                                        </div>
                                        {/* Simulate Completion */}
                                        <button 
                                            onClick={() => {
                                                if (isScanningStructure) setStructureApprovalPending(true);
                                                if (isScanningWash) setWashApprovalPending(true);
                                            }}
                                            className="px-10 py-5 bg-btn-sec border border-main rounded-2xl text-[10px] font-black uppercase text-brand animate-bounce"
                                        >
                                            Analysis Complete
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-xl bg-dark-900 border border-brand/30 rounded-[3.5rem] p-12 shadow-[0_0_100px_rgba(52,211,153,0.1)] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-brand shadow-[0_0_20px_var(--brand)]" />
                                        <div className="flex items-center gap-6 mb-10">
                                            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-dark-900 shadow-lg"><Sparkles size={32} /></div>
                                            <div>
                                                <h3 className="text-2xl font-black italic uppercase text-primary leading-none">Draft Generated</h3>
                                                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Found: {isScanningStructure ? '4 Floors, 200 Spaces' : '5 Wash Service Types'}</p>
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
                                                        <div key={i} className="p-4 bg-btn-sec border border-main rounded-2xl">
                                                            <p className="text-[8px] font-black text-secondary uppercase mb-1">{item.l}</p>
                                                            <p className="text-sm font-black italic text-brand">{item.v}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {['Eco-Express', 'Premium Pearl', 'Ceramic Shield', 'Interior Deep', 'Wheel Detail'].map((wash, i) => (
                                                        <div key={i} className="p-4 bg-btn-sec border border-main rounded-2xl flex justify-between items-center">
                                                            <span className="text-xs font-black italic uppercase text-primary">{wash}</span>
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
                                                <button className="py-5 bg-btn-sec border border-main rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-all">Manual Edit</button>
                                                <button 
                                                    onClick={() => {
                                                        setIsScanningStructure(false);
                                                        setIsScanningWash(false);
                                                        setStructureApprovalPending(false);
                                                        setWashApprovalPending(false);
                                                    }}
                                                    className="py-5 bg-btn-sec border border-main rounded-2xl text-[10px] font-black uppercase text-red-500/50 hover:text-red-500 transition-all"
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
                                                currentRole={simRole}
                                                onItemClick={(id) => {
                                                    setView(id);
                                                    setIsSidebarOpen(false);
                                                }}
                                            />

            {/* GUEST DETAILS MODAL */}
            <AnimatePresence>
                {selectedGuest && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedGuest(null)}
                            className="fixed inset-0 bg-dark-950/80 backdrop-blur-xl z-[300]"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-0 m-auto w-full max-w-xl h-fit z-[301] p-6"
                        >
                            <div className="bg-glass border-2 border-brand/20 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-8">
                                    <button onClick={() => setSelectedGuest(null)} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-secondary hover:text-primary transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-12">
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-24 bg-dark-900 border-2 border-brand rounded-3xl flex items-center justify-center text-brand">
                                            <User size={40} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-4xl font-black italic uppercase text-primary tracking-tighter">{selectedGuest.guest}</h2>
                                                <span className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[8px] font-black text-brand uppercase tracking-widest">{selectedGuest.loyalty}</span>
                                            </div>
                                            <p className="text-xs font-bold text-secondary uppercase tracking-widest opacity-60">Verified Green Network Member</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Total Visits</span>
                                                <Activity size={14} className="text-brand" />
                                            </div>
                                            <p className="text-2xl font-black italic text-primary">{selectedGuest.visits}</p>
                                        </div>
                                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Last Stay</span>
                                                <Calendar size={14} className="text-brand" />
                                            </div>
                                            <p className="text-2xl font-black italic text-primary">{selectedGuest.lastStay}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Shield size={14} className="text-brand" />
                                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-60">Identity & Location</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1 p-5 bg-dark-900 rounded-2xl border border-main">
                                                <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">Full Address</span>
                                                <span className="text-sm font-black text-primary">{selectedGuest.address}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 p-5 bg-dark-900 rounded-2xl border border-main">
                                                <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">ID / Passport Number</span>
                                                <span className="text-sm font-black text-brand tracking-widest">{selectedGuest.idNumber}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 p-5 bg-dark-900 rounded-2xl border border-main">
                                                <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">Date of Birth</span>
                                                <span className="text-sm font-black text-primary">{selectedGuest.dob}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 p-5 bg-dark-900 rounded-2xl border border-main">
                                                <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">Security Status</span>
                                                <span className="text-sm font-black text-brand uppercase tracking-tighter italic">Verified Member</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Smartphone size={14} className="text-brand" />
                                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-60">Contact Information</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-5 bg-dark-900 rounded-2xl border border-main">
                                                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Phone</span>
                                                <span className="text-sm font-black text-primary">{selectedGuest.phone}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-5 bg-dark-900 rounded-2xl border border-main">
                                                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Email</span>
                                                <span className="text-sm font-black text-primary">{selectedGuest.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-main flex gap-4">
                                        <button className="flex-1 h-14 bg-white/5 border-2 border-main rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary hover:border-white/20 transition-all flex items-center justify-center gap-3">
                                            <MessageCircle size={16} />
                                            Direct Message
                                        </button>
                                        <button className="flex-1 h-14 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3">
                                            <Star size={16} />
                                            Priority VIP Sync
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* REAL-TIME CASH ALERTS (Floating) */}
            <div className="fixed bottom-10 right-10 z-[200] space-y-4 max-w-sm w-full">
                <AnimatePresence>
                    {cashAlerts.map((alert) => (
                        <motion.div 
                            key={alert.orderId}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className="bg-white text-dark-950 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4 border-2 border-brand"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand"><Banknote size={24} /></div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tighter">Table {alert.tableId} Cash</h4>
                                    <p className="text-[10px] font-bold text-secondary uppercase">Collect €{parseFloat(alert.amount).toFixed(2)}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleConfirmCash(alert)}
                                className="w-10 h-10 bg-brand text-dark-900 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                            >
                                <Check size={20} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManagerDashboard;
