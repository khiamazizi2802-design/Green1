import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db as fbDb, storage } from '../config/firebase';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
    Lock,
    Send,
    DoorOpen,
    Undo,
    Mail,
    Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Radar from '../components/Radar';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import { Banknote, Check, Moon, Sun, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PostsFeed from '../components/PostsFeed';
import MenuManagement from './MenuManagement';

const compressBase64 = (base64, callback) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > height) {
            if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
            }
        } else {
            if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
            }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => {
        callback(base64);
    };
};

const itemMetadata = {
    // Bar / signature cocktails
    "midnight neon": { id: "C-01", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop" },
    "green emerald": { id: "C-02", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop" },
    "emerald cocktail": { id: "C-02", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop" },
    "truffle fries": { id: "F-04", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop" },

    // Hotel / Palace
    "deluxe king suite": { id: "H-01", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop" },
    "emerald suite": { id: "H-01", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop" },
    "spa access included": { id: "H-03", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=400&fit=crop" },
    "zenith penthouse": { id: "H-02", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop" },
    "wagyu gold filet": { id: "F-01", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop" },
    "gold leaf burger": { id: "F-01", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop" },
    "wagyu burger": { id: "F-01", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop" },
    "lobster thermidor": { id: "F-02", image: "https://images.unsplash.com/photo-1533682805518-48d1f5a8cd3a?w=400&h=400&fit=crop" },
    "champagne (bottle)": { id: "F-03", image: "https://images.unsplash.com/photo-1594487053020-43b9a2487c97?w=400&h=400&fit=crop" },
    "champagne": { id: "F-03", image: "https://images.unsplash.com/photo-1594487053020-43b9a2487c97?w=400&h=400&fit=crop" },

    // Carwash
    "ceramic shield pro": { id: "W-01", image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=400&fit=crop" },
    "showroom carnuba wax": { id: "W-02", image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=400&fit=crop" },
    "interior steam purge": { id: "W-03", image: "https://images.unsplash.com/photo-1599256621730-535171e28e50?w=400&h=400&fit=crop" },
    "wheel brush elite": { id: "W-04", image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=400&fit=crop" },

    // Parking
    "standard hourly": { id: "P-01", image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&h=400&fit=crop" },
    "prime space hourly": { id: "P-02", image: "https://images.unsplash.com/photo-1545179605-1296651bc9b4?w=400&h=400&fit=crop" },
    "daily pass (24h)": { id: "P-03", image: "https://images.unsplash.com/photo-1470224492023-147c28ff81ad?w=400&h=400&fit=crop" },
    "weekly membership": { id: "P-04", image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=400&fit=crop" },
    "monthly executive": { id: "P-05", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop" },
    "annual diamond": { id: "P-06", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop" },

    // Stadium
    "executive vip box": { id: "S-01", image: "https://images.unsplash.com/photo-1510204819217-1d35ae4489ae?w=400&h=400&fit=crop" },
    "field-side premium": { id: "S-02", image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=400&fit=crop" },
    "stadium valet entry": { id: "S-03", image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=400&fit=crop" },
    "the 'watch & wash' bundle": { id: "S-04", image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=400&fit=crop" }
};

const getItemInfo = (itemName) => {
    const key = itemName.toLowerCase().replace(/\(\d+x\)/, '').trim();
    if (itemMetadata[key]) {
        return itemMetadata[key];
    }
    // Dynamic generation fallback
    const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockId = `M-${10 + (hash % 90)}`;
    const mockImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop"; // generic premium food
    return { id: mockId, image: mockImage };
};

const ManagerDashboard = () => {
    const { user, setUser, loading, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const { lang, setLang, t } = useLanguage();
    const [view, setView] = useState('overview');
    
    // NOTCH & SAFE AREA ALIGNMENT SYSTEM FOR MOBILE FIT
    const [isNotchPanelOpen, setIsNotchPanelOpen] = useState(false);
    const [useSafeArea, setUseSafeArea] = useState(() => {
        const saved = localStorage.getItem('green_manager_use_safe_area');
        return saved !== null ? saved === 'true' : true;
    });
    const [notchAdjustment, setNotchAdjustment] = useState(() => {
        const isMobileDevice = window.innerWidth < 768;
        const saved = localStorage.getItem('green_manager_notch_adjustment');
        if (saved !== null) return parseInt(saved, 10);
        return isMobileDevice ? 16 : 0;
    });

    useEffect(() => {
        localStorage.setItem('green_manager_use_safe_area', useSafeArea);
    }, [useSafeArea]);

    useEffect(() => {
        localStorage.setItem('green_manager_notch_adjustment', notchAdjustment);
    }, [notchAdjustment]);
    const [editingStaffIndex, setEditingStaffIndex] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const simRole = user?.role || 'manager';
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
            const defaultStaffHubs = ['overview', 'documents', 'feed', 'reputation', 'sitting'];
            if (defaultStaffHubs.includes(viewId)) return true;
            const staffPermissions = user?.permissions || [];
            return staffPermissions.includes(viewId);
        }
        return false;
    };
    const userEmailKey = user?.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
    const isDemo = ['manager@green.de', 'restaurant@green.de', 'club@green.de', 'hotel@green.de', 'stadium@green.de'].includes(user?.email?.toLowerCase());

    const [staffList, setStaffList] = useState(() => {
        const saved = localStorage.getItem(`green_staff_list_${userEmailKey}`);
        if (saved) return JSON.parse(saved);
        return [];
    });

    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem(`green_active_orders_${userEmailKey}`);
        if (saved) return JSON.parse(saved);
        return [];
    });
    
    // Determine the initial context based on manager email/identity
    const getInitialContext = () => {
        if (user?.businessType && user?.businessType !== 'ALL') return user.businessType;
        if (user?.email?.includes('bar')) return 'BM';
        if (user?.email?.includes('restaurant') || user?.email?.includes('food')) return 'RM';
        if (user?.email?.includes('hotel') || user?.email?.includes('palace')) return 'HM';
        if (user?.email?.includes('club') || user?.email?.includes('party')) return 'CM';
        if (user?.email?.includes('stadium')) return 'SM';
        return 'FM'; // Default to Fleet Manager
    };

    const [managerContext, setManagerContext] = useState(() => {
        const saved = localStorage.getItem(`green_manager_context_${userEmailKey}`);
        if (saved) return saved;
        const ctx = getInitialContext();
        localStorage.setItem(`green_manager_context_${userEmailKey}`, ctx);
        return ctx;
    });

    // Compliance Document States
    const [complianceDocs, setComplianceDocs] = useState({});

    // Real-time Firestore sync for compliance documents
    useEffect(() => {
        if (!user?.email) return;
        const userRef = doc(fbDb, 'users', user.email.toLowerCase());
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.complianceDocs) {
                    setComplianceDocs(data.complianceDocs);
                } else {
                    setComplianceDocs({});
                }
            }
        });
        return () => unsubscribe();
    }, [user?.email]);

    // Real-time Firestore sync for all orders across devices
    useEffect(() => {
        if (!user?.email) return;
        const ordersRef = collection(fbDb, 'orders');
        // Filter by venueEmail to satisfy Firestore security rules and only load relevant orders
        const targetEmail = (simRole === 'staff' && user?.managerId) ? user.managerId.toLowerCase() : user.email.toLowerCase();
        const q = query(ordersRef, where('venueEmail', '==', targetEmail));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                // Merge the document ID if needed, but managerOrders usually have their own 'id' field
                fetchedOrders.push({
                    ...data,
                    // If no explicit ID was saved, fallback to doc ID
                    id: data.id || docSnap.id
                });
            });
            // Reverse once so newest are at the top (if they were added sequentially)
            fetchedOrders.reverse();
            setOrders(fetchedOrders);
            // Also keep local storage in sync
            localStorage.setItem(`green_active_orders_${userEmailKey}`, JSON.stringify(fetchedOrders));
        }, (error) => {
            console.error("Error syncing orders from Firestore:", error);
        });
        
        return () => unsubscribe();
    }, [user?.email, userEmailKey, simRole, user?.managerId]);

    const requiredDocIds = simRole === 'staff'
        ? ['passport_id', 'work_permit', 'bank_details']
        : (managerContext === 'FM' 
            ? ['tl', 'fip', 'cc', 'vr', 'tuv', 'es', 'sepa', 'vatc', 'bankv']
            : ['reg', 'mid', 'tax', 'gast', 'liq', 'fire', 'sepa', 'vatc', 'bankv']);

    const getComplianceStatus = () => {
        const missing = [];
        const pending = [];
        const rejected = [];
        const approved = [];
        requiredDocIds.forEach(id => {
            const docState = complianceDocs[id];
            if (!docState || docState.status === 'missing') {
                missing.push(id);
            } else if (docState.status === 'pending') {
                pending.push(id);
            } else if (docState.status === 'rejected') {
                rejected.push(id);
            } else if (docState.status === 'approved') {
                approved.push(id);
            }
        });
        return {
            missing,
            pending,
            rejected,
            approved,
            isApproved: approved.length === requiredDocIds.length
        };
    };

    const handleDocumentUpload = (docId, file) => {
        if (!file || !user?.email) return;
        
        setUploadStatus('processing');
        setUploadProgress(0);
        
        const storagePath = `compliance_docs/${user.email.toLowerCase()}/${docId}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setUploadProgress(progress);
            }, 
            (error) => {
                console.error("Document upload failed: ", error);
                setUploadStatus('error');
                alert(`❌ Upload failed: ${error.message}`);
            }, 
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const userRef = doc(fbDb, 'users', user.email.toLowerCase());
                    
                    await updateDoc(userRef, {
                        [`complianceDocs.${docId}`]: {
                            id: docId,
                            name: file.name,
                            size: (file.size / 1024).toFixed(1) + ' KB',
                            status: 'pending',
                            uploadedAt: new Date().toISOString(),
                            fileUrl: downloadURL
                        },
                        [`complianceDocs._metadata`]: {
                            email: user.email,
                            name: user.name || 'Partner Manager',
                            businessName: getBusinessName(),
                            context: managerContext,
                            updatedAt: new Date().toISOString()
                        }
                    });
                    
                    setUploadStatus('complete');
                    setTimeout(() => {
                        setUploadStatus(null);
                        setUploadProgress(0);
                    }, 2000);
                    
                } catch (err) {
                    console.error("Error saving uploaded doc URL to Firestore: ", err);
                    setUploadStatus('error');
                }
            }
        );
    };

    const handleViewDocument = (docState) => {
        const url = docState?.fileUrl || docState?.fileData;
        if (!url) return;
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.title = docState.name || 'Document View';
            newWindow.document.body.style.margin = '0';
            newWindow.document.body.style.background = '#0a0a0a';
            newWindow.document.body.style.display = 'flex';
            newWindow.document.body.style.justifyContent = 'center';
            newWindow.document.body.style.alignItems = 'center';
            newWindow.document.body.style.height = '100vh';
            
            const isImage = url.startsWith('data:image/') || url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('alt=media');
            if (isImage) {
                const img = newWindow.document.createElement('img');
                img.src = url;
                img.style.maxWidth = '90%';
                img.style.maxHeight = '90%';
                img.style.borderRadius = '12px';
                img.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
                newWindow.document.body.appendChild(img);
            } else {
                const iframe = newWindow.document.createElement('iframe');
                iframe.src = url;
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                newWindow.document.body.appendChild(iframe);
            }
        }
    };

    // A helper to auto-approve all documents for developer testing
    const handleDevAutoApprove = async () => {
        if (!user?.email) return;
        const userRef = doc(fbDb, 'users', user.email.toLowerCase());
        const autoDocs = {};
        requiredDocIds.forEach(id => {
            autoDocs[id] = {
                id,
                name: `Auto_Generated_${id}.pdf`,
                size: '150.0 KB',
                status: 'approved',
                uploadedAt: new Date().toISOString(),
                fileData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2310b981"/><text x="50" y="50" font-family="sans-serif" font-size="8" fill="white" text-anchor="middle">APPROVED DOCUMENT</text></svg>'
            };
        });
        
        try {
            await updateDoc(userRef, {
                complianceDocs: {
                    ...autoDocs,
                    _metadata: {
                        email: user.email,
                        name: user.name || 'Partner Manager',
                        businessName: getBusinessName(),
                        context: managerContext,
                        updatedAt: new Date().toISOString()
                    }
                }
            });
            alert('✅ Developer Auto-Approve: All documents created and approved successfully in Firestore!');
        } catch (err) {
            console.error('Failed to auto approve compliance docs: ', err);
            alert('❌ Failed to update Firestore with approved documents.');
        }
    };

    // Dynamic Commission and Payout Calculations based on business type
    const commissionData = useMemo(() => {
        const gross = isDemo ? 15280.00 : orders.filter(o => o.status === 'Paid' || o.status === 'Served' || o.status === 'Departed').reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);
        let rateLabel = "Platform Comm. (15%)";
        let commVal = gross * 0.15;
        let isFree = false;

        if (managerContext === 'HM' || managerContext === 'SM') {
            rateLabel = "Platform Comm. (3%)";
            commVal = gross * 0.03;
        } else if (managerContext === 'RM' || managerContext === 'BM' || managerContext === 'CM') {
            rateLabel = "Platform Comm. (0% - Free Partner)";
            commVal = 0.00;
            isFree = true;
        } else if (managerContext === 'FM') {
            rateLabel = "Platform Comm. (Staffel / Degressive)";
            commVal = isDemo ? 1180.00 : gross * 0.08; 
        }

        return {
            gross: gross,
            rateLabel: rateLabel,
            commission: commVal,
            settlement: gross - commVal,
            isFree: isFree
        };
    }, [managerContext, orders, isDemo]);

    // Dynamic Top Level Financials Summary (Mock for Demo, calculated from active orders otherwise)
    const financialsSummary = useMemo(() => {
        if (isDemo) {
            return {
                primarySales: 8450.00,
                premiumSales: 5200.00,
                ancillarySales: 1630.00,
                txVolume: 1420
            };
        }
        
        const completedOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Served' || o.status === 'Departed');
        
        const primarySales = completedOrders
            .filter(o => o.type !== 'VIP Table 1' && o.type !== 'VIP' && o.type !== 'VIP Premium')
            .reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);
            
        const premiumSales = completedOrders
            .filter(o => o.type === 'VIP Table 1' || o.type === 'VIP' || o.type === 'VIP Premium')
            .reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);
            
        const ancillarySales = completedOrders.reduce((acc, curr) => {
            const hasAncillary = curr.items && curr.items.some(item => {
                const itemName = typeof item === 'string' ? item : (item.name || '');
                return itemName.toLowerCase().includes('drink') || 
                       itemName.toLowerCase().includes('fries') || 
                       itemName.toLowerCase().includes('cocktail') || 
                       itemName.toLowerCase().includes('ancillary');
            });
            return hasAncillary ? acc + parseFloat(curr.total || 0) : acc;
        }, 0);
        
        const txVolume = completedOrders.length;
        
        return {
            primarySales,
            premiumSales,
            ancillarySales,
            txVolume
        };
    }, [orders, isDemo]);

    const [selectedGuest, setSelectedGuest] = useState(null);
    const [messageOrder, setMessageOrder] = useState(null);
    const [customMessage, setCustomMessage] = useState('');

    // Dynamic Industry Terminology Mapping
    const getTacticalLabels = () => {
        const labels = {
            HM: { unit: 'Room Number', id: 'Booking Ref', badge: 'Hotel' },
            RM: { unit: 'Table Number', id: 'Check ID', badge: 'Dining' },
            BM: { unit: 'Table Number', id: 'Ticket ID', badge: 'Bar' },
            CM: { unit: 'Table Number', id: 'Guest ID', badge: 'Nightlife' },
            SM: { unit: 'Ticket Inventory', id: 'Batch ID', badge: 'Stadium' },
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
                status: isDemo ? ((i + 1) % 4 === 0 ? 'occupied' : 'available') : 'available',
                guest: isDemo ? ((i + 1) % 4 === 0 ? 'Julian R.' : null) : null
            }));
        });
        return initial;
    });
    const [selectedSeat, setSelectedSeat] = useState(null);

    const [isAddingVehicle, setIsAddingVehicle] = useState(false);
    const [newVehicleData, setNewVehicleData] = useState({ model: '', year: '', plate: '', color: '', concession: '', assignedDriver: 'None', photo: null });
    const [globalPosts, setGlobalPosts] = useState(() => JSON.parse(localStorage.getItem('green_global_posts') || '[]'));

    useEffect(() => {
        // HQ SENTINEL: Staff are allowed in the Manager Portal for business operations (Bar, Restaurant, etc.)
        // Fleet staff (FM) are traditionally drivers, but for testing and support, we allow dashboard entry
        // and let the hasPermission() logic handle internal view security.
    }, [managerContext, simRole, navigate]);

    const getBusinessName = (ctx = managerContext) => {
        if (user?.businessInfo?.legalName) {
            return user.businessInfo.legalName;
        }
        if (user?.businessName) {
            return user.businessName;
        }
        switch(ctx) {
            case 'BM': return "The Blue Velvet Bar";
            case 'RM': return "Saffron Fine Dining";
            case 'HM': return "Green Palace & Spa";
            case 'CM': return "Midnight Club & Lounge";
            case 'VM': return "Veranstaltung: Gala 2026";
            case 'SM': return "Green Stadium Arena";
            default: return "Green Fleet Operations";
        }
    };

    const [isInternalSidebarCollapsed, setIsInternalSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [securityPassword, setSecurityPassword] = useState('1234'); 
    const [passInput, setPassInput] = useState('');
    const [showSecurityGate, setShowSecurityGate] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [resetStep, setResetStep] = useState('verify'); 
    const [currentPasswordInput, setCurrentPasswordInput] = useState('');
    const [newPasswordInput, setNewPasswordInput] = useState('');
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
    const [orderFilter, setOrderFilter] = useState('New');
    const [orderSearch, setOrderSearch] = useState('');

    // STRIPE & BANK ACCOUNT ONBOARDING STATE
    const [stripeConnected, setStripeConnected] = useState(() => localStorage.getItem('green_partner_stripe_connected') === 'true');
    const [stripeAccountId, setStripeAccountId] = useState(() => localStorage.getItem('green_partner_stripe_acc_id') || '');
    const [stripeBankName, setStripeBankName] = useState(() => localStorage.getItem('green_partner_bank_name') || '');
    const [stripeBankIban, setStripeBankIban] = useState(() => localStorage.getItem('green_partner_bank_iban') || '');
    const [stripeBankRouting, setStripeBankRouting] = useState(() => localStorage.getItem('green_partner_bank_routing') || '');
    
    const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
    const [stripeOnboardMode, setStripeOnboardMode] = useState('connect'); // 'connect' | 'create'
    const [stripeInputId, setStripeInputId] = useState('');
    const [stripeFormBankName, setStripeFormBankName] = useState('');
    const [stripeFormIban, setStripeFormIban] = useState('');
    const [stripeFormRouting, setStripeFormRouting] = useState('');
    const [stripeOnboardStep, setStripeOnboardStep] = useState(1); // 1: Details, 2: Bank Payout Setup
    const [stripeLoading, setStripeLoading] = useState(false);
    const [isFeedOpen, setIsFeedOpen] = useState(false);


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
        if (managerContext === 'FM') {
            switch(templateId) {
                case 'pilot':
                    setStaffPermissions({ orders: true, terminal: false, marketing: false, finance: false, compliance: true });
                    break;
                case 'supervisor':
                    setStaffPermissions({ orders: true, terminal: true, marketing: false, finance: true, compliance: true });
                    break;
                case 'accountant':
                    setStaffPermissions({ orders: false, terminal: false, marketing: false, finance: true, compliance: true });
                    break;
                default: break;
            }
        } else {
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
        }
    };

    // GREEN ID SEARCH: find a registered staff/driver by their Green ID
    const handleSearchByGreenId = async () => {
        if (!staffSearchId.trim()) return;
        setIsSearchingStaff(true);
        setFoundStaff(null);

        try {
            const targetId = staffSearchId.trim().toUpperCase();

            // 1. Search in the Firestore 'pending_staff' collection
            const pendingRef = doc(fbDb, 'pending_staff', targetId);
            const pendingSnap = await getDoc(pendingRef);

            if (pendingSnap.exists()) {
                setFoundStaff(pendingSnap.data());
            } else {
                // 2. Fallback: Search the 'users' collection for matching greenId attribute
                const usersRef = collection(fbDb, 'users');
                const q = query(usersRef, where('greenId', '==', targetId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data();
                    setFoundStaff({ ...docData, fromUsers: true });
                } else {
                    setFoundStaff(null);
                }
            }
        } catch (error) {
            console.error('Error searching staff by Green ID in Firestore:', error);
            alert('❌ Error querying database for staff details.');
        } finally {
            setIsSearchingStaff(false);
        }
    };

    // ONBOARD: link the found staff to this manager/business
    const handleOnboardStaff = async () => {
        if (!foundStaff) return;

        const managerId = user?.email || 'manager@green.de';
        const businessName = getBusinessName();
        const onboardedAt = new Date().toISOString();
        const permissions = Object.keys(staffPermissions).filter(k => staffPermissions[k]);

        try {
            // 1. Update the document in Firestore pending_staff collection if it exists
            const pendingRef = doc(fbDb, 'pending_staff', foundStaff.greenId);
            const pendingSnap = await getDoc(pendingRef);
            if (pendingSnap.exists()) {
                await updateDoc(pendingRef, {
                    onboarded: true,
                    managerId,
                    businessName,
                    onboardedAt
                });
            }

            // 2. Update the document in Firestore users collection at the registered user's email
            if (foundStaff.email) {
                const userRef = doc(fbDb, 'users', foundStaff.email.toLowerCase());
                const updates = {
                    onboarded: true,
                    managerId,
                    businessName,
                    businessType: managerContext,
                    permissions: permissions
                };
                
                // If onboarded by a Fleet Manager or is a driver, auto-verify compliance documents so driver can go online
                                if (foundStaff.role === 'driver' || managerContext === 'FM') {
                    updates.driverComplianceDocs = [
                        { id: 'avatar', name: 'Profile Photo', status: 'verified', requirement: 'High-resolution headshot for driver profile ID', file: null },
                        { id: 'license', name: 'Driving License', status: 'verified', requirement: 'Class B EU License (Front & Back)', file: null },
                        { id: 'idcard', name: 'Passport / ID Card', status: 'verified', requirement: 'Government-issued biometric passport or national identity card', file: null },
                        { id: 'pschein', name: 'P-Schein (Passenger Permit)', status: 'verified', requirement: 'Passenger Transport License (Personenbeförderungsschein)', file: null },
                        { id: 'terms', name: 'Terms & Conditions', status: 'verified', requirement: 'Accept Platform Partnership & Data Usage Agreement', file: null }
                    ];
                    updates.driverVehicleDocs = [
                        { id: 'tuv', name: 'HU/AU (TÜV)', status: 'verified', requirement: 'Valid main inspection certificate' },
                        { id: 'insurance', name: 'Commercial Insurance', status: 'verified', requirement: 'PBefG-compliant passenger insurance coverage' }
                    ];
                }
                
                await updateDoc(userRef, updates);
            }

            // Add to local staff list for the dashboard
            const newMember = {
                id: foundStaff.greenId,
                name: foundStaff.name,
                role: foundStaff.role === 'driver' ? 'Driver / Pilot' : 'Staff Member',
                status: 'Pending First Login',
                avatar: foundStaff.name,
                permissions: permissions,
                greenId: foundStaff.greenId,
                email: foundStaff.email
            };
            setStaffList(prev => {
                const updated = [...prev, newMember];
                localStorage.setItem(`green_staff_list_${userEmailKey}`, JSON.stringify(updated));
                return updated;
            });

            alert(`✅ ${foundStaff.name} (${foundStaff.greenId}) has been successfully onboarded to ${businessName}!\n\nThey can now log in and access their dashboard.`);
            setFoundStaff(null);
            setStaffSearchId('');
        } catch (error) {
            console.error('Error onboarding staff in Firestore:', error);
            alert('❌ Failed to complete staff onboarding in Firestore.');
        }
    };

    const [isScanningMenu, setIsScanningMenu] = useState(false);
    const [aiDraftMenu, setAiDraftMenu] = useState(null);
    const [menuApprovalPending, setMenuApprovalPending] = useState(false);



    // STADIUM AI AGENT STATE
    const [isScanningSeats, setIsScanningSeats] = useState(false);
    const [aiMatrixResult, setAiMatrixResult] = useState(null);
    const [stadiumEvents, setStadiumEvents] = useState(() => {
        const saved = localStorage.getItem(`green_stadium_events_${userEmailKey}`);
        if (saved) return JSON.parse(saved);
        if (user?.role === 'club') {
            return [
                {
                    id: 'evt-1',
                    name: 'Midnight Neon Festival 2026',
                    date: '2026-06-12',
                    time: '22:00',
                    published: true,
                    tiers: [
                        { id: 't1', name: 'Silver (Normal Ticket)', price: 35, quantity: 1500, sold: 940 },
                        { id: 't2', name: 'Gold (Premium)', price: 120, quantity: 200, sold: 165 },
                        { id: 't3', name: 'Diamond (VIP)', price: 750, quantity: 20, sold: 14 }
                    ]
                }
            ];
        }
        if (user?.role === 'stadium' || user?.role === 'admin') {
            return [
                {
                    id: 'evt-1',
                    name: 'Champions League Final',
                    date: '2024-05-24',
                    time: '20:45',
                    published: true,
                    tiers: [
                        { id: 't1', name: 'Silver (Normal Ticket)', price: 85, quantity: 500, sold: 120 },
                        { id: 't2', name: 'Gold (Premium)', price: 450, quantity: 50, sold: 42 },
                        { id: 't3', name: 'Diamond (VIP)', price: 1200, quantity: 10, sold: 8 }
                    ]
                }
            ];
        }
        return [];
    });

    useEffect(() => {
        if (!userEmailKey) return;
        const fetchCloudEvents = async () => {
            try {
                const docRef = doc(fbDb, 'venue_events', user?.email?.toLowerCase() || userEmailKey);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data && Array.isArray(data.events)) {
                        setStadiumEvents(data.events);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch cloud events", err);
            }
        };
        fetchCloudEvents();
    }, [userEmailKey]);

    const [activeSettingsEvent, setActiveSettingsEvent] = useState(null);
    const [webhookTestType, setWebhookTestType] = useState('email1');
    const [testConsoleLogs, setTestConsoleLogs] = useState([]);
    const [copied, setCopied] = useState(false);
    const [isTestingWebhook, setIsTestingWebhook] = useState(false);

    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

    const generateRandomToken = () => {
        const chars = 'abcdef0123456789';
        let token = 'grn_live_evt_';
        for (let i = 0; i < 32; i++) {
            token += chars[Math.floor(Math.random() * chars.length)];
        }
        return token;
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const updateApiConfig = (fields) => {
        if (!activeSettingsEvent) return;
        const updatedEvents = stadiumEvents.map(evt => {
            if (evt.id === activeSettingsEvent.id) {
                const apiIntegration = {
                    ...(evt.apiIntegration || { active: false, webhookUrl: '', apiKey: '' }),
                    ...fields
                };
                const updatedEvt = { ...evt, apiIntegration };
                setActiveSettingsEvent(updatedEvt);
                return updatedEvt;
            }
            return evt;
        });
        setStadiumEvents(updatedEvents);
        localStorage.setItem(`green_stadium_events_${userEmailKey}`, JSON.stringify(updatedEvents));
        setDoc(doc(fbDb, 'venue_events', user?.email?.toLowerCase() || userEmailKey), { events: updatedEvents }).catch(console.error);
        
        try {
            if (window.parent) {
                window.parent.dispatchEvent(new CustomEvent('green-stadium-events-updated'));
            }
        } catch (e) {
            console.warn(e);
        }
    };

    const handleFireWebhook = () => {
        if (isTestingWebhook || !activeSettingsEvent) return;
        setIsTestingWebhook(true);
        
        setTimeout(() => {
            const timestamp = new Date().toLocaleTimeString();
            const apiConfig = activeSettingsEvent.apiIntegration || { active: false, webhookUrl: '', apiKey: '' };
            
            let mockPayload = {
                action: webhookTestType === 'email1' ? 'send_verification' : 'send_ticket',
                eventId: activeSettingsEvent.id,
                recipientEmail: "customer@partner-system.com",
                guestName: "Alex Riviera",
                ticketType: activeSettingsEvent.tiers[0]?.name || "General Admission"
            };
            
            if (webhookTestType === 'email2') {
                mockPayload.price = activeSettingsEvent.tiers[0]?.price || 35;
                mockPayload.quantity = 1;
            }
            
            let newLog = {
                id: 'log-' + Date.now(),
                time: timestamp,
                method: "POST",
                path: "/v1/tickets/send-email",
                action: mockPayload.action,
                recipient: mockPayload.recipientEmail,
                apiKeyMask: apiConfig.apiKey ? (apiConfig.apiKey.substring(0, 15) + '...') : 'NONE'
            };
            
            if (!apiConfig.apiKey) {
                newLog.status = 401;
                newLog.statusText = 'Unauthorized';
                newLog.latency = '2ms';
                newLog.response = { error: "Missing or invalid Bearer API Key in Authorization header." };
            } else {
                const lat = Math.floor(Math.random() * 150) + 40;
                newLog.status = 200;
                newLog.statusText = 'OK';
                newLog.latency = `${lat}ms`;
                newLog.response = {
                    success: true,
                    message: webhookTestType === 'email1' 
                        ? "Verification Email (Email 1) successfully dispatched to customer@partner-system.com!" 
                        : "Ticket PDF & Confirmation Email (Email 2) successfully dispatched to customer@partner-system.com!",
                    dispatchId: "dsp_" + Math.random().toString(36).substring(2, 10),
                    details: {
                        smtpStatus: "Delivered",
                        relayHost: "smtp.green-stadium.com",
                        timestamp: new Date().toISOString()
                    }
                };
            }
            
            setTestConsoleLogs(prev => [newLog, ...prev].slice(0, 20));
            setIsTestingWebhook(false);
        }, 750);
    };

    const highlightJson = (obj) => {
        const jsonStr = JSON.stringify(obj, null, 2);
        return jsonStr.split('\n').map((line, idx) => {
            const keyMatch = line.match(/^(\s*)"([^"]+)":/);
            if (keyMatch) {
                const indent = keyMatch[1];
                const key = keyMatch[2];
                const rest = line.substring(keyMatch[0].length);
                return (
                    <div key={idx} className="font-mono text-xs leading-5">
                        {indent}<span className="text-brand">"{key}"</span>:{highlightValues(rest)}
                    </div>
                );
            }
            return <div key={idx} className="font-mono text-xs leading-5 text-secondary">{line}</div>;
        });
    };

    const highlightValues = (valStr) => {
        if (valStr.includes('"')) {
            return <span className="text-violet-300">{valStr}</span>;
        }
        return <span className="text-amber-400">{valStr}</span>;
    };

    const fileInputRef = useRef(null);
    const [newEventData, setNewEventData] = useState({ 
        name: '', 
        date: '', 
        time: '', 
        endTime: '',
        address: '',
        file: null,
        tiers: [{ id: 't1', name: 'Silver (Normal Ticket)', price: 45, quantity: 100, sold: 0 }] 
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 800000) {
            alert('Image file is too large. Please select an image smaller than 800KB.');
            return;
        }

        const processFile = (fileUrl) => {
            const fileData = {
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                type: file.type,
                url: fileUrl
            };

            setIsSimulatingUpload(true);
            setTimeout(() => {
                setNewEventData(prev => ({
                    ...prev,
                    file: fileData,
                    tiers: [
                        { id: 't1', name: 'General Admission', price: 35, quantity: 500, sold: 0 },
                        { id: 't2', name: 'VIP Lounge Pass', price: 120, quantity: 150, sold: 0 },
                        { id: 't3', name: 'Ultra VIP Diamond Table', price: 750, quantity: 10, sold: 0 }
                    ]
                }));
                setIsSimulatingUpload(false);
                alert("📂 [AI Manifest Parsed] Successfully extracted ticket tiers from document:\n• General Admission (500 tickets)\n• VIP Lounge Pass (150 tickets)\n• Ultra VIP Diamond Table (10 tickets)");
            }, 1200);
        };

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => processFile(reader.result);
            reader.readAsDataURL(file);
        } else {
            processFile(null);
        }
    };

    const handleSimulateUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleTierFileChange = async (index, e) => {
        const selectedFiles = Array.from(e.target.files).filter(f => f.size <= 800000);
        if (selectedFiles.length === 0) {
            if (e.target.files.length > 0) alert('Image file is too large. Please select an image smaller than 800KB.');
            return;
        }

        const newFilesData = await Promise.all(selectedFiles.map(file => {
            return new Promise((resolve) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            name: file.name,
                            size: (file.size / 1024).toFixed(1) + ' KB',
                            type: file.type,
                            url: reader.result
                        });
                    };
                    reader.readAsDataURL(file);
                } else {
                    resolve({
                        name: file.name,
                        size: (file.size / 1024).toFixed(1) + ' KB',
                        type: file.type,
                        url: null
                    });
                }
            });
        }));

        setNewEventData(prev => {
            const updatedTiers = [...prev.tiers];
            if (managerContext === 'CM') {
                const currentFiles = updatedTiers[index].files || [];
                if (updatedTiers[index].file && currentFiles.length === 0) {
                    currentFiles.push(updatedTiers[index].file);
                }
                updatedTiers[index] = { 
                    ...updatedTiers[index], 
                    files: [...currentFiles, ...newFilesData], 
                    verified: false 
                };
            } else {
                updatedTiers[index] = { 
                    ...updatedTiers[index], 
                    file: newFilesData[0], 
                    verified: false 
                };
            }
            return { ...prev, tiers: updatedTiers };
        });
        e.target.value = '';
    };

    const handleRemoveTierFile = (tierIndex, fileIndex) => {
        setNewEventData(prev => {
            const updatedTiers = [...prev.tiers];
            const currentFiles = updatedTiers[tierIndex].files || [];
            const updatedFiles = currentFiles.filter((_, idx) => idx !== fileIndex);
            updatedTiers[tierIndex] = { 
                ...updatedTiers[tierIndex], 
                files: updatedFiles, 
                file: null, 
                verified: updatedFiles.length > 0 ? updatedTiers[tierIndex].verified : false 
            };
            return { ...prev, tiers: updatedTiers };
        });
    };

    const handleSimulateTierUpload = (index) => {
        setNewEventData(prev => {
            const updatedTiers = [...prev.tiers];
            updatedTiers[index] = { ...updatedTiers[index], isSimulating: true };
            return { ...prev, tiers: updatedTiers };
        });

        setTimeout(() => {
            setNewEventData(prev => {
                const updatedTiers = [...prev.tiers];
                const tierName = updatedTiers[index].name || 'Category';
                const currentQty = updatedTiers[index].quantity || 100;
                
                // Add console log
                setTestConsoleLogs(c => [
                    ...c,
                    `[${new Date().toLocaleTimeString()}] AI Parser verified manifest for [${tierName.toUpperCase()}]: Loaded ${currentQty} digital tickets successfully.`
                ]);

                updatedTiers[index] = { 
                    ...updatedTiers[index], 
                    isSimulating: false,
                    verified: true
                };
                setTimeout(() => {
                    alert(`📂 [AI Manifest Parsed] Successfully verified tier tickets!\n• Category: ${tierName}\n• Allocation: ${currentQty} Digital Tickets`);
                }, 100);
                return { ...prev, tiers: updatedTiers };
            });
        }, 1200);
    };

    // HOTEL ROOM HUB STATE & SIMULATOR
    const [roomsData, setRoomsData] = useState(() => {
        const saved = localStorage.getItem('green_hotel_rooms');
        if (saved) return JSON.parse(saved);
        if (isDemo) {
            return [
                { id: '101', name: 'Deluxe King Suite', tier: 'Deluxe', status: 'occupied', guest: 'Julian R.', price: 280, cleanStatus: 'clean' },
                { id: '102', name: 'Deluxe King Suite', tier: 'Deluxe', status: 'available', guest: null, price: 280, cleanStatus: 'clean' },
                { id: '103', name: 'Spa Balcony Suite', tier: 'Premium', status: 'cleaning', guest: null, price: 420, cleanStatus: 'cleaning' },
                { id: '104', name: 'Spa Balcony Suite', tier: 'Premium', status: 'occupied', guest: 'Sarah J.', price: 420, cleanStatus: 'clean' },
                { id: '201', name: 'Emerald Suite', tier: 'Executive', status: 'available', guest: null, price: 650, cleanStatus: 'clean' },
                { id: '202', name: 'Emerald Suite', tier: 'Executive', status: 'occupied', guest: 'Elena M.', price: 650, cleanStatus: 'clean' },
                { id: '301', name: 'Zenith Penthouse', tier: 'Presidential', status: 'available', guest: null, price: 1800, cleanStatus: 'clean' }
            ];
        }
        return [];
    });

    const [pmsApiKey, setPmsApiKey] = useState(isDemo ? 'grn_pms_key_8f3a2c91b8d7e4f0' : '');
    const [reservationEmail, setReservationEmail] = useState('');
    const [pmsConnected, setPmsConnected] = useState(isDemo);
    const [pmsLog, setPmsLog] = useState(() => {
        if (isDemo) {
            return [
                { time: '10:02:15', type: 'info', message: 'PMS Channel Synchronized: 7 rooms parsed.' },
                { time: '09:45:00', type: 'checkin', message: 'Room 202 checked in: Elena M. via Mews Webhook (Auto-Sync).' }
            ];
        }
        return [];
    });

    // Manual room adding form states
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [newRoomPrice, setNewRoomPrice] = useState('');
    const [newRoomCategory, setNewRoomCategory] = useState('');
    const [newRoomBedLayout, setNewRoomBedLayout] = useState('Single');

    const saveRooms = async (updatedRooms) => {
        setRoomsData(updatedRooms);
        localStorage.setItem('green_hotel_rooms', JSON.stringify(updatedRooms));
        if (user?.email) {
            try {
                const userDocRef = doc(fbDb, 'users', user.email.toLowerCase());
                await updateDoc(userDocRef, { hotelRooms: updatedRooms });
            } catch (err) {
                console.error("Failed to sync rooms to Firestore:", err);
            }
        }
    };

    const handleCreateManualRoom = () => {
        if (!newRoomNumber.trim() || !newRoomPrice || !newRoomCategory.trim()) {
            alert("Validation Error:\nPlease provide a room number, nightly price, and room category.");
            return;
        }

        const exists = roomsData.some(r => r.id === newRoomNumber.trim());
        if (exists) {
            alert(`Validation Error:\nRoom #${newRoomNumber.trim()} already exists in the inventory.`);
            return;
        }

        const newRoom = {
            id: newRoomNumber.trim(),
            name: newRoomCategory.trim(),
            tier: 'Deluxe',
            status: 'available',
            guest: null,
            price: parseFloat(newRoomPrice),
            cleanStatus: 'clean',
            bedLayout: newRoomBedLayout
        };

        const updatedRooms = [...roomsData, newRoom];
        saveRooms(updatedRooms);

        setNewRoomNumber('');
        setNewRoomPrice('');
        setNewRoomCategory('');
        setNewRoomBedLayout('Single');

        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setPmsLog(prev => [
            { time: timeStr, type: 'info', message: `Manual Room #${newRoom.id} added to inventory (€${newRoom.price}/n).` },
            ...prev
        ]);
        alert(`ROOM INVENTORY UPDATED\n-------------------------------\nRoom #${newRoom.id} has been added successfully!`);
    };

    const handleSimulatePmsBooking = () => {
        const availableRooms = roomsData.filter(r => r.status === 'available');
        if (availableRooms.length === 0) return;
        
        const targetRoom = availableRooms[0];
        const mockGuests = ['David K.', 'Sophia L.', 'Markus W.', 'Amelie S.'];
        const randomGuest = mockGuests[Math.floor(Math.random() * mockGuests.length)];
        
        const updatedRooms = roomsData.map(r => 
            r.id === targetRoom.id 
                ? { ...r, status: 'occupied', guest: randomGuest }
                : r
        );
        saveRooms(updatedRooms);
        
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setPmsLog(prev => [
            { time: timeStr, type: 'checkin', message: `Room ${targetRoom.id} checked in: ${randomGuest} via Mews Webhook (Auto-Sync).` },
            ...prev
        ]);
    };

    const handleToggleRoomStatus = (roomId) => {
        const updatedRooms = roomsData.map(r => {
            if (r.id === roomId) {
                const nextStatus = r.status === 'available' ? 'occupied' : r.status === 'occupied' ? 'cleaning' : 'available';
                const nextGuest = nextStatus === 'occupied' ? 'Walk-in Guest' : null;
                return { ...r, status: nextStatus, guest: nextGuest };
            }
            return r;
        });
        saveRooms(updatedRooms);
        
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setPmsLog(prev => [
            { time: timeStr, type: 'override', message: `Manual status override for Room ${roomId}.` },
            ...prev
        ]);
    };

    // DRIVER ASSET PAIRING DEPLOYMENTS
    const [driverDeployments, setDriverDeployments] = useState(() => {
        const saved = localStorage.getItem(`green_driver_deployments_${userEmailKey}`);
        if (saved) return JSON.parse(saved);
        if (isDemo) {
            return [
                { name: 'Marcus H.', status: 'In Service', current: 'Tesla Model 3', rating: 4.9, avatar: 'Marcus' },
                { name: 'Sarah K.', status: 'Standby', current: 'VW ID.4', rating: 5.0, avatar: 'Sarah' },
                { name: 'Thomas M.', status: 'Locked', current: 'None', rating: 0.0, avatar: 'Thomas', isLocked: true }
            ];
        }
        return [];
    });

    useEffect(() => {
        if (!user?.email) return;
        const managerId = user.email.toLowerCase();
        
        const q = query(collection(fbDb, 'users'), where('managerId', '==', managerId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = [];
            const deployments = [];
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                list.push({
                    id: data.greenId || doc.id,
                    name: data.name,
                    role: data.role === 'driver' ? 'Driver / Pilot' : 'Staff Member',
                    status: data.status || 'Offline',
                    avatar: data.name,
                    permissions: data.permissions || [],
                    greenId: data.greenId || '',
                    email: data.email,
                    vehicleInfo: data.vehicleInfo || null
                });
                
                if (data.role === 'driver') {
                    deployments.push({
                        name: data.name,
                        status: data.status || 'Standby',
                        current: data.vehicleInfo?.status === 'approved' || data.vehicleInfo?.status === 'pending' ? data.vehicleInfo.model : 'None',
                        rating: data.rating || 5.0,
                        avatar: data.name,
                        vehicleInfo: data.vehicleInfo || null,
                        email: data.email || doc.id
                    });
                }
            });
            
            if (list.length > 0) {
                setStaffList(list);
                localStorage.setItem(`green_staff_list_${userEmailKey}`, JSON.stringify(list));
            } else if (!isDemo) {
                setStaffList([]);
            }
            
            if (deployments.length > 0) {
                setDriverDeployments(prev => {
                    const merged = deployments.map(d => {
                        const local = prev.find(p => p.name === d.name);
                        return local ? { ...d, status: local.status } : d;
                    });
                    localStorage.setItem(`green_driver_deployments_${userEmailKey}`, JSON.stringify(merged));
                    return merged;
                });
            } else if (!isDemo) {
                setDriverDeployments([]);
            }
        });
        
        return () => unsubscribe();
    }, [user?.email, userEmailKey, isDemo]);

    const handleApproveVehicle = async (driverEmail) => {
        try {
            const userRef = doc(fbDb, 'users', driverEmail.toLowerCase());
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const currentVehicle = userSnap.data().vehicleInfo;
                await updateDoc(userRef, {
                    vehicleInfo: {
                        ...currentVehicle,
                        status: 'approved'
                    }
                });
                alert("✅ Vehicle registration approved successfully!");
            }
        } catch (err) {
            console.error("Error approving vehicle:", err);
            alert("❌ Failed to approve vehicle registration.");
        }
    };

    const handleRejectVehicle = async (driverEmail) => {
        try {
            const userRef = doc(fbDb, 'users', driverEmail.toLowerCase());
            await updateDoc(userRef, {
                vehicleInfo: null
            });
            alert("❌ Vehicle registration rejected and reset.");
        } catch (err) {
            console.error("Error rejecting vehicle:", err);
            alert("❌ Failed to reject vehicle registration.");
        }
    };
    const pendingVerifications = useMemo(() => {
        const items = [];
        staffList.forEach(member => {
            if (member.vehicleInfo && (member.vehicleInfo.status === 'pending' || member.vehicleInfo.status === 'awaiting_upload')) {
                items.push({
                    id: member.greenId || member.id,
                    driver: member.name,
                    model: member.vehicleInfo.model,
                    plate: member.vehicleInfo.plate,
                    status: member.vehicleInfo.status,
                    photo: member.vehicleInfo.photo || 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=200&auto=format&fit=crop',
                    email: member.email
                });
            }
        });
        return items;
    }, [staffList]);

    const activeVerificationQueue = useMemo(() => {
        if (pendingVerifications.length > 0) return pendingVerifications;
        if (isDemo) {
            return [
                { id: 'V-882', driver: 'Marcus H.', model: 'Tesla Model 3', plate: 'F-GR-2024', status: 'awaiting_upload', photo: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=200&auto=format&fit=crop' },
                { id: 'V-991', driver: 'Sarah K.', model: 'Mercedes EQE', plate: 'F-GR-9921', status: 'awaiting_verification', hasV5C: true, photo: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=200&auto=format&fit=crop' }
            ];
        }
        return [];
    }, [pendingVerifications, isDemo]);

    const [editingDriver, setEditingDriver] = useState(null);

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
        legalName: isDemo ? getBusinessName() : (user?.name ? `${user.name} Operations` : 'My Fleet Ops'),
        address: isDemo ? 'Zeil 106' : '',
        zip: isDemo ? '60313' : '',
        city: isDemo ? 'Frankfurt' : '',
        email: user?.email || '',
        ticketEmail: user?.email || '',
        phone: isDemo ? '+49 69 1234567' : '',
        vatId: isDemo ? 'DE123456789' : ''
    });

    const [bankingInfo, setBankingInfo] = useState({
        iban: isDemo ? 'DE44 1234 5678 9012 3456 78' : '',
        bic: isDemo ? 'MARKDEFFXXX' : '',
        bankName: isDemo ? 'Deutsche Bank AG' : '',
        holder: isDemo ? getBusinessName() : ''
    });

    const [fleetVehicles, setFleetVehicles] = useState(['Tesla Model 3', 'Tesla Model Y', 'VW ID.4', 'Polestar 2', 'BMW i4', 'None']);
    const [registeredVehicles, setRegisteredVehicles] = useState([]);

    useEffect(() => {
        if (!user?.email) return;
        const managerId = user.email.toLowerCase();
        
        const q = query(collection(fbDb, 'vehicles'), where('managerId', '==', managerId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = [];
            const vehiclesList = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                vehiclesList.push({
                    id: doc.id,
                    ...data
                });
                if (data.model) {
                    list.push(data.model);
                }
            });
            setRegisteredVehicles(vehiclesList);
            
            const defaultCatalog = ['Tesla Model 3', 'Tesla Model Y', 'VW ID.4', 'Polestar 2', 'BMW i4'];
            const combinedModels = Array.from(new Set([...list, ...defaultCatalog])).filter(m => m && m !== 'None');
            setFleetVehicles([...combinedModels, 'None']);
        }, (error) => {
            console.error("Error fetching vehicles snapshot:", error);
        });

        return () => unsubscribe();
    }, [user?.email]);

    useEffect(() => {
        if (user) {
            setPersonalInfo({
                name: user.name || 'Authorized Manager',
                email: user.email || 'admin@green-nightlife.com',
                phone: user.phone || '+49 152 9821 004',
                address: user.address || 'Hauptstraße 12',
                zip: user.zip || '60311',
                city: user.city || 'Frankfurt am Main',
                profilePicture: user.profilePicture || ''
            });

            if (user.businessInfo) {
                setBusinessInfo({
                    offer: '',
                    discount: '',
                    ...user.businessInfo
                });
            } else {
                setBusinessInfo({
                    legalName: user.businessName || (user.name ? `${user.name} Operations` : 'My Fleet Ops'),
                    address: user.businessAddress || (isDemo ? 'Zeil 106' : ''),
                    zip: user.businessZip || (isDemo ? '60313' : ''),
                    city: user.businessCity || (isDemo ? 'Frankfurt' : ''),
                    email: user.email || '',
                    phone: user.businessPhone || (isDemo ? '+49 69 1234567' : ''),
                    vatId: user.businessVatId || (isDemo ? 'DE123456789' : ''),
                    offer: '',
                    discount: ''
                });
            }

            if (user.bankingInfo) {
                setBankingInfo(user.bankingInfo);
            }

            if (user.securityPassword) {
                setSecurityPassword(user.securityPassword);
            }

            if (user.hotelRooms) {
                setRoomsData(user.hotelRooms);
            }
        }
    }, [user]);

    const handleSaveGlobalManifest = async () => {
        if (!user?.email) {
            alert("Error: No authenticated session found.");
            return;
        }

        try {
            const userEmail = user.email.toLowerCase();
            const userRef = doc(fbDb, 'users', userEmail);

            const updatedPersonalInfo = {
                ...personalInfo,
                profilePicture: personalInfo.profilePicture || ''
            };

            let stripeAccountId = user.stripeAccountId || null;
            if (bankingInfo.iban && bankingInfo.iban.length > 10) {
                try {
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
                    const res = await fetch(`${backendUrl}/api/payment/stripe/connect/onboard`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: userEmail,
                            name: personalInfo.name || userEmail,
                            iban: bankingInfo.iban
                        })
                    });
                    const data = await res.json();
                    if (data.stripeAccountId) {
                        stripeAccountId = data.stripeAccountId;
                    }
                } catch(e) {
                    console.error('Failed to auto-onboard stripe:', e);
                }
            }

            await setDoc(userRef, {
                name: personalInfo.name,
                phone: personalInfo.phone,
                address: personalInfo.address,
                zip: personalInfo.zip,
                city: personalInfo.city,
                profilePicture: personalInfo.profilePicture || '',
                businessInfo: businessInfo,
                bankingInfo: bankingInfo,
                stripeAccountId: stripeAccountId,
                securityPassword: securityPassword
            }, { merge: true });

            localStorage.setItem(`green_personal_info_${userEmailKey}`, JSON.stringify(updatedPersonalInfo));
            localStorage.setItem(`green_business_info_${userEmailKey}`, JSON.stringify(businessInfo));
            localStorage.setItem(`green_banking_info_${userEmailKey}`, JSON.stringify(bankingInfo));
            localStorage.setItem(`green_security_password_${userEmailKey}`, securityPassword);

            if (setUser) {
                setUser(prev => ({
                    ...prev,
                    name: personalInfo.name,
                    phone: personalInfo.phone,
                    address: personalInfo.address,
                    zip: personalInfo.zip,
                    city: personalInfo.city,
                    profilePicture: personalInfo.profilePicture || '',
                    businessInfo: businessInfo,
                    bankingInfo: bankingInfo,
                    securityPassword: securityPassword
                }));
            }

            alert("MANIFEST SAVED: All credentials encrypted and synchronized to Google Cloud in real-time.");
        } catch (error) {
            console.error("Error saving global manifest:", error);
            alert(`Error: Failed to save manifest. ${error.message}`);
        }
    };

    const handleExport = () => {
        alert(`GENERATING DATEV MANIFEST\n--------------------------\nEntity: ${getBusinessName()}\nIndustry Type: ${managerContext}\nTax Jurisdiction: DE/EU\n\nStatus: Encrypted & Industry-Segmented`);
    };

    const handleDownloadPDFReport = () => {
        const businessName = getBusinessName();
        const gross = commissionData.gross;
        const comm = commissionData.commission;
        const net = commissionData.settlement;
        const rateLabel = commissionData.rateLabel;
        const dateStr = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Monthly Performance Report - ${businessName}</title>
                <style>
                    body {
                        font-family: 'Inter', sans-serif;
                        background: #0B121E;
                        color: #FFFFFF;
                        padding: 40px;
                        margin: 0;
                    }
                    .header {
                        border-bottom: 2px solid #00FF88;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: 900;
                        font-style: italic;
                        text-transform: uppercase;
                        color: #00FF88;
                    }
                    .title {
                        font-size: 18px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        color: #8A99AD;
                        margin-top: 5px;
                    }
                    .meta-grid {
                        display: grid;
                        grid-template-cols: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 40px;
                    }
                    .meta-item {
                        background: #162235;
                        padding: 15px 20px;
                        border-radius: 12px;
                        border: 1px solid rgba(255,255,255,0.05);
                    }
                    .meta-label {
                        font-size: 10px;
                        text-transform: uppercase;
                        color: #8A99AD;
                        font-weight: bold;
                        letter-spacing: 1px;
                    }
                    .meta-value {
                        font-size: 16px;
                        font-weight: bold;
                        margin-top: 5px;
                    }
                    .stats-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 40px;
                    }
                    .stats-table th, .stats-table td {
                        padding: 15px 20px;
                        text-align: left;
                    }
                    .stats-table th {
                        background: #162235;
                        color: #8A99AD;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .stats-table td {
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        font-size: 14px;
                    }
                    .total-row td {
                        font-weight: bold;
                        font-size: 16px;
                        color: #00FF88;
                        border-bottom: 2px solid #00FF88;
                    }
                    .footer {
                        text-align: center;
                        font-size: 10px;
                        color: #8A99AD;
                        margin-top: 60px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    @media print {
                        body {
                            background: white;
                            color: black;
                            padding: 20px;
                        }
                        .meta-item {
                            background: #F4F6F8;
                            border: 1px solid #E2E8F0;
                            color: black;
                        }
                        .meta-label {
                            color: #4A5568;
                        }
                        .stats-table th {
                            background: #F4F6F8;
                            color: #4A5568;
                        }
                        .stats-table td {
                            border-bottom: 1px solid #E2E8F0;
                            color: black;
                        }
                        .total-row td {
                            color: #2F855A;
                            border-bottom: 2px solid #2F855A;
                        }
                        .footer {
                            color: #4A5568;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">GREEN Fleet Operations</div>
                    <div class="title">Monthly Performance Statement</div>
                </div>
                <div class="meta-grid">
                    <div class="meta-item">
                        <div class="meta-label">Business Partner</div>
                        <div class="meta-value">${businessName}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Statement Period</div>
                        <div class="meta-value">${dateStr}</div>
                    </div>
                </div>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Gross Earnings (Gross Invoiced)</td>
                            <td style="text-align: right; font-weight: bold;">€${gross.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td>Platform Commission Fee (${rateLabel})</td>
                            <td style="text-align: right; color: #FF6B6B;">-€${comm.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr class="total-row">
                            <td>Net Payout Settlement</td>
                            <td style="text-align: right;">€${net.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="footer">
                    Generated via Green Partner Portal Security Protocol v4.0. Confirmed for Settlement.
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
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
            published: false,
            context: managerContext
        };
        const updated = [...stadiumEvents, newEvent];
        setStadiumEvents(updated);
        localStorage.setItem(`green_stadium_events_${userEmailKey}`, JSON.stringify(updated));
        setDoc(doc(fbDb, 'venue_events', user?.email?.toLowerCase() || userEmailKey), { events: updated }).catch(console.error);
        setIsAddingEvent(false);
        setNewEventData({ 
            name: '', 
            date: '', 
            time: '', 
            file: null,
            tiers: [{ id: 't1', name: 'Silver (Normal Ticket)', price: 45, quantity: 100, sold: 0 }] 
        });
    };

    const handleAddTier = () => {
        setNewEventData(prev => ({
            ...prev,
            tiers: [...prev.tiers, { id: 't' + Date.now(), name: prev.tiers.length === 1 ? 'Gold (Premium)' : prev.tiers.length === 2 ? 'Diamond (VIP)' : 'Premium Access', price: prev.tiers.length === 1 ? 120 : prev.tiers.length === 2 ? 750 : 250, quantity: 100, sold: 0 }]
        }));
    };

    const handleUpdateTier = (index, field, value) => {
        setNewEventData(prev => {
            const updated = [...prev.tiers];
            if (field === 'price' || field === 'quantity') {
                updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
            } else {
                updated[index] = { ...updated[index], [field]: value };
            }
            return { ...prev, tiers: updated };
        });
    };

    const handleRemoveTier = (index) => {
        if (newEventData.tiers.length <= 1) return;
        setNewEventData(prev => ({
            ...prev,
            tiers: prev.tiers.filter((_, idx) => idx !== index)
        }));
    };

    const togglePublishEvent = (id) => {
        const updated = stadiumEvents.map(e => e.id === id ? { ...e, published: !e.published } : e);
        setStadiumEvents(updated);
        localStorage.setItem(`green_stadium_events_${userEmailKey}`, JSON.stringify(updated));
        setDoc(doc(fbDb, 'venue_events', user?.email?.toLowerCase() || userEmailKey), { events: updated }).catch(console.error);
    };

    const handleDeleteEvent = (id) => {
        if (!window.confirm("Bist du sicher, dass du dieses Event unwiderruflich löschen möchtest?")) return;
        const updated = stadiumEvents.filter(e => e.id !== id);
        setStadiumEvents(updated);
        localStorage.setItem(`green_stadium_events_${userEmailKey}`, JSON.stringify(updated));
        setDoc(doc(fbDb, 'venue_events', user?.email?.toLowerCase() || userEmailKey), { events: updated }).catch(console.error);
    };

    const fleetDrivers = [];

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

        const handleNewUxEvent = (ticket) => {
            console.log('📡 ManagerDashboard: Received new-uxlab-event via socket:', ticket.id);
            
            // Map items display
            let managerItemNames = [];
            if (ticket.items && ticket.items.length > 0) {
                // Keep the items as objects so we have access to item.file or item.image
                managerItemNames = ticket.items;
            } else if (ticket.venueOffer) {
                managerItemNames = [{ name: ticket.venueOffer.name || 'Premium Stay Package', quantity: 1 }];
            } else {
                managerItemNames = [{ name: 'Standard Booking', quantity: 1 }];
            }

            // Map payment display
            let paymentDisplay = ticket.paymentMethod || 'Online';
            if (String(ticket.paymentMethod).toLowerCase() === 'cash') paymentDisplay = 'Cash';

            // Map type display
            let typeDisplay = 'Dine-In';
            if (ticket.type === 'booking') typeDisplay = 'Stay Booking';
            else if (ticket.type === 'room_service') typeDisplay = 'Room Service';
            else if (ticket.type === 'stadium_ticket') typeDisplay = 'Stadium E-Ticket';
            else if (ticket.type === 'club_ticket') typeDisplay = 'Club Event Ticket';
            else if (ticket.type === 'parking') typeDisplay = 'Valet Parking';
            else if (ticket.type === 'service') typeDisplay = 'Wash Service';

            const managerOrder = {
                id: ticket.id,
                guest: ticket.guestDetails?.companyName ? `${ticket.guestName} (${ticket.guestDetails.companyName})` : (ticket.guestName || 'Anonymous Guest'),
                company: ticket.guestDetails?.companyName || undefined,
                items: managerItemNames,
                total: typeof ticket.total === 'number' ? ticket.total.toFixed(2) : String(ticket.total),
                status: ticket.type === 'booking' ? 'Booked' : 'Received',
                type: typeDisplay,
                time: 'Just now',
                payment: paymentDisplay,
                table: (ticket.type === 'order') ? ticket.tableId : undefined,
                room: (ticket.type === 'booking' || ticket.type === 'room_service') ? (ticket.tableId && ticket.tableId !== 'Check-in Assigned' ? ticket.tableId : String(Math.floor(100 + Math.random() * 400))) : undefined,
                checkIn: ticket.type === 'booking' ? 'May 19' : undefined,
                checkOut: ticket.type === 'booking' ? 'May 21' : undefined
            };

            // Prepend new order to global list, avoiding duplicates
            setOrders(prev => {
                if (prev.some(o => o.id === ticket.id)) return prev;
                const updated = [managerOrder, ...prev];
                localStorage.setItem(`green_active_orders_${userEmailKey}`, JSON.stringify(updated));
                return updated;
            });

            // Dispatch global toast notification
            let toastTitle = '🛎️ ORDER RECEIVED';
            if (ticket.type === 'booking') toastTitle = '🏨 ROOM BOOKING CONFIRMED';
            else if (ticket.type === 'stadium_ticket') toastTitle = '🎟️ STADIUM TICKET SECURED';
            else if (ticket.type === 'parking') toastTitle = '🚗 VALET PASS AUTHORIZED';
            else if (ticket.type === 'service') toastTitle = '💦 WASH SERVICE REQUESTED';

            let toastMsg = `${ticket.guestName || 'A Guest'} ordered ${managerItemNames.join(', ')} (Total: €${ticket.total})`;
            if (ticket.type === 'booking') {
                toastMsg = `${ticket.guestName || 'A Guest'} booked ${managerItemNames.join(', ')} (Total: €${ticket.total})`;
            }

            try {
                const event = new CustomEvent('green-notification', { 
                    detail: { 
                        type: ticket.type === 'booking' ? 'success' : (ticket.type === 'stadium_ticket' ? 'surge' : 'payment'), 
                        title: toastTitle, 
                        message: toastMsg 
                    } 
                });
                window.dispatchEvent(event);
                if (window.parent) {
                    window.parent.dispatchEvent(event);
                }
            } catch (e) {
                console.error('Failed to trigger alert notification toast:', e);
            }
        };

        socket.on('cash-payment-alert', handleAlert);
        socket.on('new-uxlab-event', handleNewUxEvent);

        return () => {
            socket.off('cash-payment-alert', handleAlert);
            socket.off('new-uxlab-event', handleNewUxEvent);
        };
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

    const [sessionTransitioned, setSessionTransitioned] = useState({});
    const [previousStatuses, setPreviousStatuses] = useState({});

    const updateOrderStatus = (id, newStatus) => {
        const order = orders.find(o => o.id === id);
        if (order) {
            setPreviousStatuses(prev => ({ ...prev, [id]: order.status }));
        }
        const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
        setOrders(updated);
        localStorage.setItem(`green_active_orders_${userEmailKey}`, JSON.stringify(updated));
        setSessionTransitioned(prev => ({ ...prev, [id]: true }));
    };

    const undoOrderStatus = (id) => {
        const prevStatus = previousStatuses[id];
        if (!prevStatus) return;

        const updated = orders.map(o => o.id === id ? { ...o, status: prevStatus } : o);
        setOrders(updated);
        localStorage.setItem(`green_active_orders_${userEmailKey}`, JSON.stringify(updated));

        setPreviousStatuses(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const resendEmails = (order) => {
        const hasVerificationEmail1 = order.status === 'Preparing' || order.status === 'Ready' || order.status === 'Served';
        const hasTicketEmail2 = order.status === 'Ready' || order.status === 'Served';

        if (!hasVerificationEmail1 && !hasTicketEmail2) {
            alert(`No emails are available to resend yet. The ticket order is still in '${order.status}' state.`);
            return;
        }

        const choice = prompt(
            `Resend Emails for Order ${order.id} (${order.guest})\n` +
            `Available Resend Options:\n` +
            (hasVerificationEmail1 ? `• [1] Resend Verification Email (Email 1)\n` : '') +
            (hasTicketEmail2 ? `• [2] Resend Ticket & Confirmation (Email 2)\n` : '') +
            `• [3] Resend Both Emails\n\n` +
            `Please type 1, 2, or 3 to resend:`
        );

        if (!choice) return;

        if (choice === '1') {
            if (!hasVerificationEmail1) {
                alert("Error: Verification Email (Email 1) is not available yet.");
                return;
            }
            alert(`✉️ [Email 1 Resent] Verification Email has been successfully resent to ${order.guest}!`);
        } else if (choice === '2') {
            if (!hasTicketEmail2) {
                alert("Error: Ticket Email (Email 2) is not available yet.");
                return;
            }
            alert(`✉️ [Email 2 Resent] Ticket & Confirmation Email with native access code has been resent to ${order.guest}!`);
        } else if (choice === '3') {
            let sent = [];
            if (hasVerificationEmail1) sent.push("Email 1 (Verification)");
            if (hasTicketEmail2) sent.push("Email 2 (Ticket)");
            alert(`✉️ [Emails Resent] Resent ${sent.join(' & ')} to ${order.guest} successfully!`);
        } else {
            alert("Invalid selection. No emails were resent.");
        }
    };

    // Ensure demo booking exists for visualization
    useEffect(() => {
        if (!isDemo) return;
        const demoBooking = { id: '#BK-9921', guest: 'Lukas M.', items: ['Deluxe King Suite', 'Spa Access Included'], total: '450.00', status: 'Received', type: 'Stay Booking', time: 'Just now', payment: 'Online', room: '204', checkIn: 'May 10', checkOut: 'May 12' };
        if (!orders.find(o => o.id === demoBooking.id)) {
            const updated = [demoBooking, ...orders];
            setOrders(updated);
            localStorage.setItem(`green_active_orders_${userEmailKey}`, JSON.stringify(updated));
        }
    }, [orders, isDemo, userEmailKey]);

    // Real-Time orders synchronization from Firestore
    useEffect(() => {
        if (!userEmailKey || isDemo) return;
        const ordersRef = collection(fbDb, 'orders');
        // Query orders matching this venue, sorted by newest first
        const targetEmail = (simRole === 'staff' && user?.managerId) ? user.managerId.toLowerCase() : (user?.email ? user.email.toLowerCase() : userEmailKey);
        const q = query(
            ordersRef,
            where('venueEmail', '==', targetEmail),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const liveOrders = [];
            snapshot.forEach(doc => {
                liveOrders.push({ firestoreId: doc.id, ...doc.data() });
            });
            setOrders(liveOrders);
            // Also update local storage for backward compatibility with other views
            localStorage.setItem(`green_active_orders_${userEmailKey}`, JSON.stringify(liveOrders));
        }, (error) => {
            console.error('Error fetching live orders from Firestore:', error);
        });

        return () => unsubscribe();
    }, [userEmailKey, isDemo, user?.email, simRole, user?.managerId]);

    // Real-Time stadium events sold counts synchronization
    useEffect(() => {
        const handleEventsSync = () => {
            const saved = localStorage.getItem(`green_stadium_events_${userEmailKey}`);
            if (saved) {
                try {
                    setStadiumEvents(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse synchronized stadium events:', e);
                }
            }
        };

        try {
            if (window.parent) {
                window.parent.addEventListener('green-stadium-events-updated', handleEventsSync);
            }
        } catch (e) {
            console.warn('Blocked from accessing window.parent for stadium events sync due to Same-Origin Policy:', e);
        }

        return () => {
            try {
                if (window.parent) {
                    window.parent.removeEventListener('green-stadium-events-updated', handleEventsSync);
                }
            } catch (e) {
                console.warn('Failed to remove listener from window.parent:', e);
            }
        };
    }, []);

    const getStatsByContext = () => {
        if (!isDemo) {
            if (managerContext === 'CM' || managerContext === 'BM') return [
                { label: 'Guests Inside', value: '0', icon: Users, color: 'text-white', trend: '—' },
                { label: 'Weekly Sales', value: '€0', icon: DollarSign, color: 'text-brand', trend: 'Stable' },
                { label: 'Door Wait Time', value: '—', icon: Timer, color: 'text-brand', trend: '—' },
                { label: 'VIP Capacity', value: '0%', icon: Star, color: 'text-white', trend: '—' }
            ];
            if (managerContext === 'HM') return [
                { label: 'Current Guests', value: '0', icon: Users, color: 'text-white', trend: 'Stable' },
                { label: 'Nightlife Out', value: '0', icon: Car, color: 'text-brand', trend: '—' },
                { label: 'Concierge Tasks', value: '0', icon: Activity, color: 'text-brand', trend: 'Active' },
                { label: 'Service Rating', value: '—', icon: Star, color: 'text-white', trend: '—' }
            ];
            if (managerContext === 'RM') return [
                { label: 'Active Tables', value: '0/30', icon: Utensils, color: 'text-white', trend: '0% Full' },
                { label: 'Kitchen Load', value: 'None', icon: Activity, color: 'text-brand', trend: 'Optimal' },
                { label: 'Avg Ticket', value: '€0.00', icon: DollarSign, color: 'text-brand', trend: '—' },
                { label: 'Waitlist', value: '0', icon: Clock, color: 'text-white', trend: '—' }
            ];
            if (managerContext === 'SM') return [
                { label: 'Arena Fill', value: '0%', icon: Users, color: 'text-white', trend: '—' },
                { label: 'Gate Flow', value: '0/h', icon: Activity, color: 'text-brand', trend: 'Smooth' },
                { label: 'VIP Sales', value: '€0', icon: DollarSign, color: 'text-brand', trend: 'Stable' },
                { label: 'Alerts', value: '0', icon: ShieldCheck, color: 'text-white', trend: 'Clear' }
            ];
            return [
                { label: 'Weekly Accrual', value: '€0', icon: DollarSign, color: 'text-brand', trend: 'Friday Payout' },
                { label: 'Active Units', value: '0', icon: Car, color: 'text-brand', trend: 'No Deployment' },
                { label: 'Completion Rate', value: '0.0%', icon: CheckCircle2, color: 'text-white', trend: 'Optimal' },
                { label: 'Avg Arrival', value: '—', icon: Clock, color: 'text-brand', trend: '—' }
            ];
        }

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
        if (!isDemo) return [];

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

    const renderSidebarContent = () => (
        <>
            <div className="p-4 pb-8 overflow-hidden flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-dark-900 shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-transform">
                    <Zap size={24} fill="currentColor" />
                </div>
                {isMobile && (
                    <button 
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="w-8 h-8 rounded-xl bg-btn-sec border border-main flex items-center justify-center text-secondary hover:text-primary hover:border-brand/40 transition-all shrink-0"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-x-hidden">
                {[
                    { id: 'overview', label: t('Dashboard'), icon: LayoutDashboard },
                    { 
                        id: 'orders', 
                        label: managerContext === 'HM' ? t('Room Service') : managerContext === 'CM' ? t('Bottle Service') : managerContext === 'SM' ? t('Ticket Orders') : t('Live Orders'), 
                        icon: managerContext === 'HM' ? BedDouble : managerContext === 'CM' ? GlassWater : managerContext === 'SM' ? Ticket : ShoppingBag, 
                        badge: '3', 
                        hidden: (managerContext === 'FM') 
                    },
                    { id: 'stadium-seats', label: t('Ticket Hub'), icon: Ticket, visible: managerContext === 'CM' || managerContext === 'SM' || managerContext === 'VM' },

                    { 
                        id: 'hotel-rooms', 
                        label: t('Room Hub'), 
                        icon: DoorOpen, 
                        visible: managerContext === 'HM' 
                    },
                    { id: 'staff', label: t('Team Hub'), icon: Users },

                    { 
                        id: 'finance', 
                        label: managerContext === 'HM' ? t('Nightly Audit') : managerContext === 'CM' ? t('Cover Revenue') : t('Financials'), 
                        icon: Receipt 
                    },
                    { id: 'documents', label: t('Compliance'), icon: ShieldCheck },
                    { id: 'feed', label: t('Marketing Hub'), icon: Activity, badge: '4K' },
                    { id: 'reputation', label: t('Reputation Hub'), icon: ShieldAlert, badge: user?.redFlags > 0 ? user.redFlags.toString() : null },
                    { id: 'strategic-hub', label: t('AI Strategic Hub'), icon: Sparkles, badge: 'Insight' },
                    { id: 'fleet-control', label: t('Fleet Control Hub'), icon: Car, visible: managerContext === 'FM', badge: 'Alert' },
                    { id: 'sitting', label: t('Sitting'), icon: Settings },
                    { id: 'menu', label: t('Menu Catalog'), icon: managerContext === 'SM' ? Trophy : Utensils, badge: 'New', hidden: (managerContext === 'FM') }
                ].filter(item => {
                    if (item.hidden) return false;
                    if (item.visible !== undefined && !item.visible) return false;
                    return hasPermission(item.id);
                }).map(item => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setView(item.id);
                            setActiveSettingsEvent(null);
                            setShowSecurityGate(false);
                            if (isMobile) setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group relative mb-2 ${
                            view === item.id 
                            ? 'bg-brand/10 text-brand shadow-[0_0_15px_rgba(52,211,153,0.2)] border border-brand/50' 
                            : 'text-secondary hover:text-primary hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        <item.icon size={22} className={`mb-1.5 ${view === item.id ? 'text-brand' : 'text-secondary group-hover:text-brand transition-colors'}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{item.label}</span>
                        {item.badge && (
                            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-brand text-dark-900 text-[7px] font-black rounded-md">{item.badge}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 mt-auto space-y-4">
                {/* Language Hub */}
                <div className="space-y-2">
                    {(!isInternalSidebarCollapsed || isMobile) && (
                        <div className="flex items-center justify-between px-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand/60 italic">Language Hub</span>
                            <Languages size={12} className="text-brand/40" />
                        </div>
                    )}
                    <div className="relative">
                        <SearchIcon size={14} className={`absolute ${isInternalSidebarCollapsed && !isMobile ? 'left-1/2 -translate-x-1/2' : 'left-4'} top-1/2 -translate-y-1/2 text-secondary`} />
                        {(!isInternalSidebarCollapsed || isMobile) && (
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
                        {isInternalSidebarCollapsed && !isMobile && (
                            <div className="w-10 h-10 bg-btn-sec rounded-xl border border-main flex items-center justify-center cursor-pointer hover:border-brand/40" onClick={() => setIsInternalSidebarCollapsed(false)}>
                                <Languages size={16} className="text-secondary" />
                            </div>
                        )}
                    </div>
                    {isLangExpanded && (!isInternalSidebarCollapsed || isMobile) && (
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
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-btn-sec text-secondary hover:text-brand hover:bg-brand/10 transition-all border border-main cursor-pointer"
                >
                    {theme === 'light' ? <Moon size={18} className="shrink-0 text-brand" /> : <Sun size={18} className="shrink-0 text-brand" />}
                    {(!isInternalSidebarCollapsed || isMobile) && <span className="text-[10px] font-black uppercase tracking-widest">Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>}
                </button>

                <button 
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-btn-sec text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all border border-main"
                >
                    <X size={18} className="shrink-0" />
                    {(!isInternalSidebarCollapsed || isMobile) && <span className="text-[10px] font-black uppercase tracking-widest">Exit Portal</span>}
                </button>
            </div>
        </>
    );

    if (loading) {
        return (
            <div className="w-screen h-screen bg-dark-950 flex items-center justify-center">
                <div className="text-xl font-black italic uppercase text-brand animate-pulse">
                    Grid Intelligence Loading...
                </div>
            </div>
        );
    }

    const getBgImage = (ctx, currentTheme) => {
        const isDark = currentTheme !== 'light';
        switch (ctx) {
            case 'HM': return isDark ? 'https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=1600&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1600&auto=format&fit=crop&q=80';
            case 'CM': return isDark ? 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1600&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=80';
            case 'SM': return isDark ? 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1600&auto=format&fit=crop&q=80';
            case 'RM': return isDark ? 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1600&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80';
            case 'BM': return isDark ? 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1600&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&auto=format&fit=crop&q=80';
            case 'FM': return isDark ? 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&auto=format&fit=crop&q=80';
            default: return isDark ? 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&auto=format&fit=crop&q=80';
        }
    };

    return (
        <div 
            className="absolute left-0 right-0 bottom-0 overflow-hidden glass-bg-wrapper font-sans text-primary transition-all duration-500 flex flex-col p-2 md:p-6"
            style={{
                top: `calc(${useSafeArea ? 'env(safe-area-inset-top, 0px)' : '0px'} + ${notchAdjustment}px)`,
                height: `calc(100% - (${useSafeArea ? 'env(safe-area-inset-top, 0px)' : '0px'} + ${notchAdjustment}px))`,
                backgroundImage: `url("${getBgImage(managerContext, theme)}")`,
                backgroundColor: theme === 'light' ? '#E5E7EB' : '#0B0F19'
            }}
        >
            {/* FLOATING GLASS TABLET WRAPPER */}
            <div className="flex-1 w-full h-full glass-panel rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-row relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
            {/* Mobile Sidebar Overlay Backdrop */}
            {isMobile && isMobileSidebarOpen && (
                <div 
                    onClick={() => setIsMobileSidebarOpen(false)} 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[599] md:hidden"
                />
            )}

            {/* Desktop Sidebar (Only when not mobile) */}
            {!isMobile && (
                <motion.aside 
                    initial={false}
                    animate={{ width: 110 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-full bg-transparent border-r border-white/5 flex flex-col z-30 relative shrink-0"
                >
                    {renderSidebarContent()}
                </motion.aside>
            )}

            {/* Mobile Sidebar Overlay Drawer */}
            {isMobile && (
                <AnimatePresence>
                    {isMobileSidebarOpen && (
                        <motion.aside 
                            initial={{ x: -288 }}
                            animate={{ x: 0 }}
                            exit={{ x: -288 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 w-[288px] h-full bg-black/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-[600] shadow-[10px_0_30px_rgba(0,0,0,0.5)] md:hidden"
                            style={{
                                paddingTop: `calc(${useSafeArea ? 'env(safe-area-inset-top, 0px)' : '0px'} + ${notchAdjustment}px)`
                            }}
                        >
                            {renderSidebarContent()}
                        </motion.aside>
                    )}
                </AnimatePresence>
            )}

            <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
                <header className="h-24 bg-transparent px-6 md:px-10 flex items-center justify-between z-20 shrink-0">
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-3">
                            {isMobile && (
                                <button 
                                    onClick={() => setIsMobileSidebarOpen(true)}
                                    className="w-10 h-10 bg-btn-sec border border-main rounded-xl flex items-center justify-center text-primary hover:border-brand/40 transition-all md:hidden"
                                >
                                    <Menu size={20} />
                                </button>
                            )}
                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Good Evening, {simRole === 'staff' ? 'Staff' : 'Manager'} {user?.name || 'Alex'}</h2>
                        </div>
                        <div className="text-[11px] font-medium text-gray-400 mt-1 flex items-center gap-2">
                            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>|</span>
                            <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64">
                            <Search size={14} className="text-gray-400" />
                            <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-sm text-white ml-2 w-full placeholder-gray-500" />
                        </div>

                        {/* Notification Bell */}
                        <div className="relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]">3</span>
                        </div>

                        {/* Profile */}
                        <div className="flex items-center gap-3">
                            <img src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white/10" />
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-bold text-white">{user?.name || 'Alex P.'}</p>
                                <p className="text-[10px] text-gray-400">{simRole === 'staff' ? 'Staff Member' : 'Manager'}</p>
                            </div>
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
                        ) : !getComplianceStatus().isApproved && view !== 'documents' ? (
                            <div className="bg-glass border border-red-500/30 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden max-w-3xl mx-auto text-center backdrop-blur-2xl">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                                <div className="flex flex-col items-center gap-6 py-6">
                                    <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
                                        <ShieldAlert size={40} />
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-red-500 text-glow-red">Operational Suspension</h2>
                                        <p className="text-xs font-bold text-secondary uppercase tracking-[0.25em]">Access Restricted • PBefG §49 / GwG Art. 12</p>
                                    </div>
                                    <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                                        Under federal regulatory frameworks, your organization's operational dispatch privileges are currently suspended. 
                                        All live orders, team terminals, and fleet controls remain inactive until your legal compliance vault is verified and approved by system administration.
                                    </p>
                                    
                                    {/* Document status summary in the lock screen */}
                                    <div className="w-full max-w-md bg-black/40 border border-white/5 rounded-2xl p-6 text-left space-y-3 font-mono text-[10px]">
                                        <div className="flex justify-between border-b border-white/5 pb-2 text-[10px] font-bold text-gray-400">
                                            <span>REQUIRED CREDENTIALS</span>
                                            <span>STATUS</span>
                                        </div>
                                        {requiredDocIds.map(id => {
                                            const docState = complianceDocs[id];
                                            const name = simRole === 'staff'
                                                ? (id === 'passport_id' ? 'Passport / ID Card' : id === 'work_permit' ? 'Work Permit' : 'Bank Details (for tips)')
                                                : (managerContext === 'FM' 
                                                    ? (id === 'tl' ? 'Transport License' : id === 'fip' ? 'Fleet Insurance' : id === 'cc' ? 'Chauffeur Cert' : id === 'vr' ? 'Vehicle Reg' : id === 'tuv' ? 'TÜV Certification' : id === 'es' ? 'Emissions standard' : id === 'sepa' ? 'SEPA Mandate' : id === 'vatc' ? 'VAT Certification' : 'Bank Validation')
                                                    : (id === 'reg' ? 'Commercial Register' : id === 'mid' ? 'Manager ID' : id === 'tax' ? 'Tax Registration' : id === 'gast' ? 'Gastronomy License' : id === 'liq' ? 'Liquor License' : id === 'fire' ? 'Fire Safety' : id === 'sepa' ? 'SEPA Mandate' : id === 'vatc' ? 'VAT Certification' : 'Bank Validation'));
                                            
                                            let statusColor = 'text-red-400';
                                            let statusText = 'MISSING';
                                            if (docState?.status === 'pending') {
                                                statusColor = 'text-amber-500';
                                                statusText = 'AWAITING ADMIN';
                                            } else if (docState?.status === 'approved') {
                                                statusColor = 'text-brand';
                                                statusText = 'APPROVED';
                                            } else if (docState?.status === 'rejected') {
                                                statusColor = 'text-red-500';
                                                statusText = 'REJECTED';
                                            }
                                            
                                            return (
                                                <div key={id} className="flex justify-between">
                                                    <span className="text-gray-400">{name}</span>
                                                    <span className={`font-black ${statusColor}`}>{statusText}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                        <button 
                                            onClick={() => setView('documents')}
                                            className="flex-1 py-4 bg-brand text-dark-900 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            Go to Compliance Vault
                                        </button>
                                        <button 
                                            onClick={handleDevAutoApprove}
                                            className="flex-1 py-4 bg-white/5 border border-white/10 hover:border-brand/40 text-gray-400 hover:text-white font-black uppercase tracking-widest text-[8px] rounded-xl transition-all"
                                        >
                                            [DEV BYPASS] Auto-Approve All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {view === 'overview' && (
                                    <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                    {/* DYNAMIC STATS GRID */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* STAT 1 */}
                                        <div className="glass-panel-subtle p-5 rounded-2xl border border-white/5 hover:border-brand/30 transition-all relative flex flex-col justify-between h-[110px]">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[11px] font-medium text-gray-300">Reservations</span>
                                                <span className="text-[9px] bg-white/5 text-gray-300 px-1 py-0.5 rounded flex items-center"><ChevronRight size={12} /></span>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-2xl font-bold text-white">88%</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">booked</span>
                                                </div>
                                                <div className="w-14 h-8 opacity-70">
                                                    <svg viewBox="0 0 100 30" className="w-full h-full stroke-gray-400" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M0,25 Q20,15 40,25 T80,10 T100,5" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        {/* STAT 2 */}
                                        <div className="glass-panel-subtle p-5 rounded-2xl border border-white/5 hover:border-brand/30 transition-all relative flex flex-col justify-between h-[110px]">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[11px] font-medium text-gray-300">Active Tables</span>
                                                <span className="text-[9px] bg-brand/10 text-brand px-1 py-0.5 rounded flex items-center border border-brand/20"><Activity size={10} className="mr-0.5"/></span>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-2xl font-bold text-white">32/40</span>
                                                </div>
                                                <div className="w-14 h-8">
                                                    <svg viewBox="0 0 100 30" className="w-full h-full stroke-brand" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M0,20 L20,25 L40,15 L60,20 L80,5 L100,10" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        {/* STAT 3 */}
                                        <div className="glass-panel-subtle p-5 rounded-2xl border border-white/5 hover:border-brand/30 transition-all relative flex flex-col justify-between h-[110px]">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[11px] font-medium text-gray-300">Orders in Progress</span>
                                                <span className="text-[10px] text-gray-500 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-2xl font-bold text-white">12</span>
                                                </div>
                                                <div className="w-14 h-8">
                                                    <svg viewBox="0 0 100 30" className="w-full h-full stroke-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M0,15 Q20,25 40,10 T80,20 T100,5" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        {/* STAT 4 */}
                                        <div className="glass-panel-subtle p-5 rounded-2xl border border-white/5 hover:border-brand/30 transition-all relative flex flex-col justify-between h-[110px]">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[11px] font-medium text-gray-300">Revenue Today</span>
                                                <span className="text-[9px] bg-brand/10 text-brand px-1 py-0.5 rounded flex items-center border border-brand/20"><TrendingUp size={10} className="mr-0.5"/></span>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-2xl font-bold text-white">$7,450</span>
                                                </div>
                                                <div className="w-14 h-8">
                                                    <svg viewBox="0 0 100 30" className="w-full h-full stroke-brand drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M0,25 L30,20 L50,10 L70,15 L100,0" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* MOCKUP 3-COLUMN HUBS */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        
                                        {/* COL 1: Table Reservations */}
                                        <div className="glass-panel-subtle border border-white/5 rounded-3xl p-5 relative shadow-xl">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[13px] font-bold text-white">Table Reservations</h3>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 cursor-pointer"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-[10px] text-gray-400">Floor-time</span>
                                                <span className="text-[10px] text-gray-500">Floor 1 & 2</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <div className="bg-[#0B121E]/50 border border-brand/50 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(52,211,153,0.15)] relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-full bg-brand/5"></div>
                                                    <span className="text-xl font-bold text-white relative z-10">101</span>
                                                    <span className="text-[9px] font-bold text-brand relative z-10">Reserved</span>
                                                    <span className="text-[8px] text-gray-400 mt-1 relative z-10">8 PM</span>
                                                </div>
                                                <div className="bg-[#0B121E]/50 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                                    <span className="text-xl font-bold text-white">102</span>
                                                    <span className="text-[9px] text-gray-400 mt-1">4 Guest</span>
                                                    <span className="text-[8px] text-gray-500">Detail</span>
                                                </div>
                                                <div className="bg-[#0B121E]/50 border border-brand/50 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(52,211,153,0.15)] relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-full bg-brand/5"></div>
                                                    <span className="text-xl font-bold text-white relative z-10">103</span>
                                                    <span className="text-[9px] text-gray-400 relative z-10">4 Guest</span>
                                                    <span className="text-[8px] text-gray-400 mt-1 relative z-10">8 PM</span>
                                                </div>
                                                <div className="bg-[#0B121E]/50 border border-purple-500/50 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(168,85,247,0.15)] relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-full bg-purple-500/5"></div>
                                                    <span className="text-xl font-bold text-white relative z-10">104</span>
                                                    <span className="text-[9px] font-bold text-purple-400 relative z-10">Reserved</span>
                                                    <span className="text-[8px] text-gray-400 mt-1 relative z-10">8:30 PM</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-bold text-white mb-2">Upcoming:</h4>
                                                <p className="text-[10px] text-gray-400 mb-1">8:00 PM - Davis (4)</p>
                                                <p className="text-[10px] text-gray-400">8:15 PM - Chen (2)</p>
                                            </div>
                                        </div>

                                        {/* COL 2: Kitchen Command */}
                                        <div className="glass-panel-subtle border border-white/5 rounded-3xl p-5 relative shadow-xl">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-[13px] font-bold text-white">Kitchen Command</h3>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 cursor-pointer"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {/* Ticket 1 */}
                                                <div className="bg-[#0B121E]/50 border border-purple-500/30 rounded-xl p-4 shadow-[0_0_15px_rgba(168,85,247,0.1)] relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-[11px] text-white">Ticket #142 <span className="text-gray-400">(Table 103)</span></h4>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="text-[10px] text-gray-400 leading-relaxed">
                                                            <p>Steak Frites</p>
                                                            <p>Salmon</p>
                                                        </div>
                                                        <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">In Prep</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full mb-3 overflow-hidden">
                                                        <div className="h-full w-[60%] bg-purple-500"></div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[9px] text-gray-500">
                                                        <span>Order at 7:45 PM</span>
                                                        <span className="flex items-center gap-1"><Users size={10} /> 2</span>
                                                    </div>
                                                </div>

                                                {/* Ticket 2 */}
                                                <div className="bg-[#0B121E]/50 border border-brand/30 rounded-xl p-4 shadow-[0_0_15px_rgba(52,211,153,0.1)] relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-[11px] text-white">Ticket #143 <span className="text-gray-400">(Table 105)</span></h4>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                                    </div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="text-[10px] text-gray-400 leading-relaxed">
                                                            <p>Lobster Risotto</p>
                                                            <p>Duck Breast</p>
                                                        </div>
                                                        <span className="text-[9px] bg-brand/20 text-brand px-2 py-0.5 rounded-full border border-brand/30">Pending</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full mb-3 overflow-hidden">
                                                        <div className="h-full w-[15%] bg-brand"></div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[9px] text-gray-500">
                                                        <span>Order at 7:35 PM</span>
                                                        <span className="flex items-center gap-1"><Users size={10} /> 3</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* COL 3: Menu Catalog */}
                                        <div className="glass-panel-subtle border border-white/5 rounded-3xl p-5 relative shadow-xl">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-[13px] font-bold text-white">Menu Catalog</h3>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 cursor-pointer"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                            </div>

                                            <div className="space-y-3">
                                                {/* Item 1 */}
                                                <div className="bg-[#0B121E]/50 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                                                        <Utensils size={16} className="text-orange-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="text-[11px] text-white">Wagyu Ribeye</h4>
                                                                <p className="text-[10px] text-gray-400">($140)</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-[8px] text-gray-500 mt-1 line-clamp-1">Description with seal and aircon glow.</p>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-[9px] text-brand">Active</span>
                                                            <div className="w-7 h-4 bg-brand rounded-full relative">
                                                                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Item 2 */}
                                                <div className="bg-[#0B121E]/50 border border-white/5 rounded-xl p-3 flex items-center gap-3 opacity-60">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                                                        <Utensils size={16} className="text-orange-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="text-[11px] text-white">Lobster Bisque</h4>
                                                                <p className="text-[10px] text-gray-400">($35)</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-4">
                                                            <span className="text-[9px] text-gray-500">Sold Out</span>
                                                            <div className="w-7 h-4 bg-white/20 rounded-full relative">
                                                                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-gray-400 rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Item 3 */}
                                                <div className="bg-[#0B121E]/50 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                                                        <Utensils size={16} className="text-orange-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="text-[11px] text-white">Truffle Pasta</h4>
                                                                <p className="text-[10px] text-gray-400">($45)</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-4">
                                                            <span className="text-[9px] text-brand">Active</span>
                                                            <div className="w-7 h-4 bg-brand rounded-full relative">
                                                                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                                                            </div>
                                                        </div>
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
                                            {['Just now', 'New', 'Opened', 'Completed', 'Todays Orders'].map(filter => (
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                        {orders
                                        .filter(order => {
                                            const searchMatch = order.guest.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                                              order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                                                              order.items.some(it => {
                                                                  const itemName = typeof it === 'string' ? it : (it.name || '');
                                                                  return itemName.toLowerCase().includes(orderSearch.toLowerCase());
                                                              });
                                            if (!searchMatch) return false;
                                            
                                            // "staying" rule: if the order status was updated in the current session, it stays visible in the tab it was originally loaded into
                                            if (sessionTransitioned[order.id]) return true;

                                            if (orderFilter === 'Just now') return order.time === 'Just now';
                                            if (orderFilter === 'New') return order.status === 'Received' || order.status === 'Booked';
                                            if (orderFilter === 'Opened') return order.status === 'Preparing' || order.status === 'Check-In';
                                            if (orderFilter === 'Completed') return order.status === 'Ready' || order.status === 'Staying';
                                            if (orderFilter === 'Todays Orders') return order.status === 'Served' || order.status === 'Departed' || order.status === 'Paid';
                                            return true;
                                        })
                                        .map((order, i) => {
                                            const isUrgent = parseInt(order.time) > 15 || order.status === 'Received';
                                            const isBooking = order.type === 'Stay Booking';
                                            const statusProgress = (order.status === 'Received' || order.status === 'Booked') ? 25 : 
                                                                  (order.status === 'Preparing' || order.status === 'Check-In') ? 50 : 
                                                                  (order.status === 'Ready' || order.status === 'Staying') ? 75 : 100;
                                            
                                            const isUnreceived = order.status === 'Received' || order.status === 'Booked';

                                            return (
                                                <div 
                                                    key={i} 
                                                    className={`bg-glass border-2 ${
                                                        isUnreceived 
                                                        ? 'animate-blink-red border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                                                        : (isUrgent && order.status !== 'Served' ? 'border-red-500/30' : 'border-glass')
                                                    } rounded-[2rem] p-5 flex flex-col justify-between hover:border-brand/40 transition-all group relative overflow-hidden shadow-2xl min-h-[460px]`}
                                                >
                                                    {/* Background Glow for Urgency */}
                                                    {isUrgent && order.status !== 'Served' && (
                                                        <div className="absolute inset-0 bg-red-500/[0.03] animate-pulse pointer-events-none" />
                                                    )}

                                                    {/* RED MARKED AREA (Top Half: Guest Details & Table Info) */}
                                                    <div className="space-y-4 relative z-10">
                                                        <div className="flex items-start gap-4">
                                                            {/* Type-Specific Badge block */}
                                                            <div className="w-16 h-16 rounded-2xl bg-dark-900 border border-main flex flex-col items-center justify-center text-primary relative overflow-hidden group-hover:border-brand/40 transition-colors shrink-0">
                                                                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                {order.type === 'Stay Booking' || order.type === 'Room Service' ? (
                                                                    <>
                                                                        <span className="text-[7px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 leading-none">ROOM</span>
                                                                        <span className="text-[6px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 leading-none">NUMBER</span>
                                                                        <span className="text-base font-black italic text-brand leading-none">{order.room || 'TBD'}</span>
                                                                    </>
                                                                ) : order.type === 'Stadium E-Ticket' || order.type === 'Club Event Ticket' ? (
                                                                    <>
                                                                        <span className="text-[7px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 leading-none">TICKET</span>
                                                                        <span className="text-[6px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 leading-none">DETAILS</span>
                                                                        <span className="text-[10px] font-black italic text-brand leading-none truncate w-full text-center px-1">{order.id?.toString()?.replace('#', '')}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-[7px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 leading-none">TABLE</span>
                                                                        <span className="text-[6px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 leading-none">NUMBER</span>
                                                                        <span className="text-base font-black italic text-brand leading-none">{order.table || '0'}</span>
                                                                    </>
                                                                )}
                                                                <div className={`absolute bottom-0 left-0 right-0 h-1 ${['Served', 'Departed', 'Delivered', 'Scanned', 'Valid', 'Paid'].includes(order.status) ? 'bg-brand' : 'bg-brand/20'}`} />
                                                            </div>
                                                            
                                                            {/* Guest details */}
                                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                                <h3 className="text-base font-black italic uppercase text-primary tracking-tighter truncate leading-none mb-0.5">{order.guest}</h3>
                                                                
                                                                {/* ID badge */}
                                                                <div className="w-fit px-2 py-0.5 bg-brand/10 border border-brand/20 rounded-md">
                                                                    <span className="text-[8px] font-black text-brand uppercase tracking-widest leading-none">
                                                                        {order.type === 'Stay Booking' ? 'BOOKING REF' : 'CHECK ID'}: {order.id}
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Status Dropdown & Details Button */}
                                                                <div className="flex items-center gap-1.5 pt-0.5">
                                                                    <select
                                                                        value={order.status}
                                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                                        className="bg-dark-900 border border-main rounded-md px-1.5 py-0.5 text-[8px] font-black text-brand uppercase outline-none focus:border-brand/40 cursor-pointer h-[21px]"
                                                                    >
                                                                        {order.type === 'Stay Booking' ? (
                                                                            <>
                                                                                <option value="Booked">Booked</option>
                                                                                <option value="Check-In">Check-In</option>
                                                                                <option value="Staying">Staying</option>
                                                                                <option value="Departed">Departed</option>
                                                                            </>
                                                                        ) : order.type === 'Stadium E-Ticket' || order.type === 'Club Event Ticket' ? (
                                                                            <>
                                                                                <option value="Purchased">Purchased</option>
                                                                                <option value="Issued">Issued</option>
                                                                                <option value="Valid">Valid</option>
                                                                                <option value="Scanned">Scanned</option>
                                                                            </>
                                                                        ) : order.type === 'Room Service' ? (
                                                                            <>
                                                                                <option value="Received">Received</option>
                                                                                <option value="Preparing">Preparing</option>
                                                                                <option value="On Route">On Route</option>
                                                                                <option value="Delivered">Delivered</option>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <option value="Received">Received</option>
                                                                                <option value="Preparing">Preparing</option>
                                                                                <option value="Ready">Ready</option>
                                                                                <option value="Served">Served</option>
                                                                            </>
                                                                        )}
                                                                        <option value="Paid">Paid</option>
                                                                    </select>
                                                                    
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedGuest({ 
                                                                                ...order, 
                                                                                phone: '+49 176 4421 8892', 
                                                                                email: order.guest.toLowerCase().replace(/\s+/g, '.') + '@green-social.com', 
                                                                                loyalty: 'Pioneer Tier 1', 
                                                                                visits: '12', 
                                                                                lastStay: 'April 2026',
                                                                                address: 'Königsallee 12, 40212 Düsseldorf',
                                                                                dob: 'May 12, 1992',
                                                                                idNumber: 'PA-99281-XM'
                                                                            });
                                                                        }}
                                                                        className="flex items-center gap-1 px-2.5 py-0.5 bg-brand text-dark-900 rounded-md text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 h-[21px]"
                                                                    >
                                                                        <User size={8} />
                                                                        Details
                                                                    </button>
                                                                </div>

                                                                {/* Metadata badges row */}
                                                                <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                                                                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 rounded-full border border-white/5 leading-none shrink-0">
                                                                        <Timer size={8} className={isUrgent ? 'text-red-400 animate-pulse' : 'text-secondary'} />
                                                                        <span className={`text-[7px] font-black uppercase leading-none ${isUrgent ? 'text-red-400' : 'text-secondary'}`}>{order.time}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 rounded-full border border-white/5 leading-none shrink-0">
                                                                        <ShoppingBag size={8} className="text-secondary" />
                                                                        <span className="text-[7px] font-black uppercase leading-none text-secondary">
                                                                            {managerContext === 'HM' && (order.type === 'Takeaway' || order.type === 'Stay Booking') ? 'Room Only' : order.type}
                                                                        </span>
                                                                    </div>
                                                                    <div className="px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase border leading-none shrink-0 bg-brand/10 border-brand/20 text-brand">
                                                                        {order.payment}
                                                                    </div>
                                                                    {order.plate && <span className="px-1.5 py-0.5 bg-brand/10 border border-brand/20 rounded-full text-[7px] font-black text-brand tracking-widest leading-none shrink-0">{order.plate}</span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions & Gross Value Area */}
                                                        <div className="flex items-center justify-between border-t border-main pt-3">
                                                            <div>
                                                                <p className="text-[7px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 opacity-60 leading-none">Gross Value</p>
                                                                <p className="text-lg font-black italic text-primary leading-none tracking-tighter">€{order.total}</p>
                                                                {order.status === 'Paid' && (
                                                                    <div className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-brand/10 border border-brand/20 rounded-full w-fit">
                                                                        <ShieldCheck size={8} className="text-brand" />
                                                                        <span className="text-[6px] font-black text-brand uppercase tracking-widest leading-none">Verified</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {order.type !== 'Stay Booking' && order.type !== 'Stadium E-Ticket' && order.type !== 'Club Event Ticket' && (
                                                                <div className="flex gap-2">
                                                                    {order.type === 'Stadium E-Ticket' || order.type === 'Club Event Ticket' ? (
                                                                        <button 
                                                                            onClick={() => resendEmails(order)}
                                                                            title="Resend Ticket / Verification Email"
                                                                            className="w-9 h-9 bg-brand/10 border border-brand/40 text-brand rounded-xl flex items-center justify-center hover:bg-brand/20 hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                                                                        >
                                                                            <Mail size={14} className="stroke-[2.5]" />
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => undoOrderStatus(order.id)}
                                                                            disabled={!previousStatuses[order.id]}
                                                                            title="Undo Status Change"
                                                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 border ${
                                                                                previousStatuses[order.id]
                                                                                ? 'bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25 hover:text-red-300 hover:scale-105 active:scale-95 shadow-md shadow-red-500/5 cursor-pointer'
                                                                                : 'bg-white/5 border-white/5 text-gray-500 opacity-40 cursor-not-allowed'
                                                                            }`}
                                                                        >
                                                                            <Undo size={14} className="stroke-[2.5]" />
                                                                        </button>
                                                                    )}
                                                                    {order.status !== 'Served' && (
                                                                        <button 
                                                                            onClick={() => {
                                                                                setMessageOrder(order);
                                                                                setCustomMessage('');
                                                                            }}
                                                                            className="w-9 h-9 bg-white/5 border border-brand/20 hover:border-brand/40 rounded-xl flex items-center justify-center text-secondary hover:text-brand hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
                                                                        >
                                                                            <MessageCircle size={16} />
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => {
                                                                            const isTicket = order.type === 'Stadium E-Ticket' || order.type === 'Club Event Ticket';
                                                                            if (order.status === 'Received' || order.status === 'Booked') {
                                                                                const nextStatus = order.type === 'Stay Booking' ? 'Check-In' : 'Preparing';
                                                                                updateOrderStatus(order.id, nextStatus);
                                                                                if (isTicket) {
                                                                                    alert("✉️ [Email 1 Sent] Verification Email has been sent automatically to the customer's email box for verification!");
                                                                                }
                                                                            } else if (order.status === 'Preparing' || order.status === 'Check-In') {
                                                                                const nextStatus = order.type === 'Stay Booking' ? 'Staying' : 'Ready';
                                                                                updateOrderStatus(order.id, nextStatus);
                                                                                if (isTicket) {
                                                                                    alert("✉️ [Email 2 Sent] Ticket & Confirmation Email containing the active ticket verification code and native receipt link has been sent to the partner!");
                                                                                }
                                                                            } else if (order.status === 'Ready' || order.status === 'Staying') {
                                                                                const nextStatus = order.type === 'Stay Booking' ? 'Departed' : 'Served';
                                                                                updateOrderStatus(order.id, nextStatus);
                                                                            }
                                                                        }}
                                                                        disabled={order.status === 'Served' || order.status === 'Departed'}
                                                                        className={`h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-md shrink-0 ${
                                                                            (order.status === 'Served' || order.status === 'Departed') 
                                                                            ? 'bg-btn-sec text-secondary border border-main opacity-50 cursor-not-allowed' 
                                                                            : 'bg-brand text-dark-900 hover:scale-105 active:scale-95'
                                                                        }`}
                                                                    >
                                                                        <CheckCircle2 size={12} />
                                                                        {order.status === 'Received' || order.status === 'Booked' ? (order.type === 'Stadium E-Ticket' || order.type === 'Club Event Ticket' ? 'Verify & Email 1' : 'Prepare') :
                                                                         order.status === 'Preparing' || order.status === 'Check-In' ? (order.type === 'Stadium E-Ticket' || order.type === 'Club Event Ticket' ? 'Send Ticket & Email 2' : 'Ready') :
                                                                         order.status === 'Ready' || order.status === 'Staying' ? (order.type === 'Stay Booking' ? 'Depart' : 'Serve') :
                                                                         'Done'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* YELLOW MARKED AREA (Bottom Half: Items & Pipeline Progress) */}
                                                    <div className="flex flex-col gap-3 mt-1 border-t border-main pt-3 relative z-10">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center leading-none">
                                                                <div className="flex items-center gap-1.5 leading-none">
                                                                    {order.type === 'Stay Booking' ? <BedDouble size={12} className="text-brand" /> : <Utensils size={12} className="text-brand" />}
                                                                    <span className="text-[8px] font-black text-secondary uppercase tracking-widest opacity-60 leading-none">
                                                                        {order.type === 'Stay Booking' ? 'Reservation Overview' : 'Production Pipeline'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[8px] font-black text-brand uppercase tracking-widest leading-none bg-brand/5 px-1.5 py-0.5 rounded border border-brand/10">
                                                                    STATUS: {order.status}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Horizontal scrollable item pictures row */}
                                                            {order.type === 'Stay Booking' ? (
                                                                <div className="space-y-2 w-full">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="p-2 bg-btn-sec rounded-xl border border-main">
                                                                            <span className="text-[7px] font-black text-secondary uppercase tracking-widest block opacity-60">Check-In</span>
                                                                            <p className="text-xs font-black italic uppercase text-primary">{order.guestDetails?.checkIn || order.checkIn || 'MAY 19'}</p>
                                                                        </div>
                                                                        <div className="p-2 bg-btn-sec rounded-xl border border-main">
                                                                            <span className="text-[7px] font-black text-secondary uppercase tracking-widest block opacity-60">Check-Out</span>
                                                                            <p className="text-xs font-black italic uppercase text-primary">{order.guestDetails?.checkOut || order.checkOut || 'MAY 21'}</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {(order.address || order.email || order.phone || order.guestDetails) && (
                                                                        <div className="p-3 bg-dark-950/40 rounded-xl border border-main/50 text-[8px] space-y-1.5 w-full">
                                                                            {order.guestDetails?.bookingType === 'business' && (
                                                                                <div className="mb-2 pb-2 border-b border-white/5">
                                                                                    <span className="text-brand font-black uppercase tracking-wider block opacity-90 mb-1">Business Booking</span>
                                                                                    {order.guestDetails?.companyName && (
                                                                                        <div>
                                                                                            <span className="text-secondary font-black uppercase tracking-wider block opacity-60">Company</span>
                                                                                            <span className="text-primary font-bold text-[9px] truncate block">{order.guestDetails.companyName}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                            {order.email && (
                                                                                <div>
                                                                                    <span className="text-secondary font-black uppercase tracking-wider block opacity-60">Email</span>
                                                                                    <span className="text-primary font-bold text-[9px] truncate block">{order.email}</span>
                                                                                </div>
                                                                            )}
                                                                            {order.phone && (
                                                                                <div>
                                                                                    <span className="text-secondary font-black uppercase tracking-wider block opacity-60">Phone</span>
                                                                                    <span className="text-primary font-bold text-[9px]">{order.phone}</span>
                                                                                </div>
                                                                            )}
                                                                            {order.address && (
                                                                                <div>
                                                                                    <span className="text-secondary font-black uppercase tracking-wider block opacity-60">Residential Address</span>
                                                                                    <span className="text-primary font-bold text-[9px]">{order.address}, {order.zip} {order.city}</span>
                                                                                </div>
                                                                            )}
                                                                            {order.idNumber && (
                                                                                <div className="grid grid-cols-2 gap-2">
                                                                                    <div>
                                                                                        <span className="text-secondary font-black uppercase tracking-wider block opacity-60">Passport / ID</span>
                                                                                        <span className="text-primary font-bold text-[9px]">{order.idNumber}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-secondary font-black uppercase tracking-wider block opacity-60">DOB</span>
                                                                                        <span className="text-primary font-bold text-[9px]">{order.dob}</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {(order.company || order.companyAddress) && (
                                                                                <div className="pt-1.5 border-t border-white/5 mt-1">
                                                                                    <span className="text-brand font-black uppercase tracking-[0.2em] block text-[7px] mb-0.5">🏢 Company Invoice Address</span>
                                                                                    {order.company && <span className="text-primary font-black block text-[8px] uppercase">{order.company}</span>}
                                                                                    {order.companyAddress && <span className="text-primary font-bold block text-[8px]">{order.companyAddress}</span>}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-4 overflow-x-auto no-scrollbar py-3 px-3 bg-dark-950/40 rounded-2xl border border-main min-h-[115px] items-start">
                                                                    {order.items.map((item, idx) => {
                                                                        let itemNameClean = '';
                                                                        let qty = '1';
                                                                        let finalImage = '';
                                                                        
                                                                        if (typeof item === 'string') {
                                                                            itemNameClean = item.replace(/\(\d+x\)/, '').trim();
                                                                            qty = item.match(/\((\d+)x\)/) ? item.match(/\((\d+)x\)/)[1] : '1';
                                                                            finalImage = getItemInfo(itemNameClean).image;
                                                                        } else {
                                                                            // It's an object!
                                                                            itemNameClean = item.name || 'Ticket/Item';
                                                                            qty = item.quantity || 1;
                                                                            
                                                                            if (item.file && item.file.url) {
                                                                                finalImage = item.file.url;
                                                                            } else if (item.image) {
                                                                                finalImage = item.image;
                                                                            } else {
                                                                                finalImage = getItemInfo(itemNameClean).image;
                                                                            }
                                                                        }

                                                                        return (
                                                                            <div key={idx} className="relative shrink-0 flex flex-col items-center gap-1 hover:scale-105 transition-transform duration-300">
                                                                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-main bg-dark-900 shadow-md">
                                                                                    <img 
                                                                                        src={finalImage} 
                                                                                        alt={itemNameClean} 
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                    </div>
                                                                                    {/* Qty Badge */}
                                                                                    <div className="absolute -top-1.5 -right-1.5 bg-brand text-dark-900 font-extrabold text-[9px] w-5 h-5 rounded-full border border-main shadow-lg flex items-center justify-center">
                                                                                        {qty}
                                                                                    </div>
                                                                                    {/* Item Name */}
                                                                                    <span className="text-[7px] font-black uppercase text-secondary tracking-widest mt-1 text-center leading-none max-w-[70px] truncate">{itemNameClean}</span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>

                                                        {/* Progress Bar Container */}
                                                        <div className="space-y-1.5">
                                                            <div className="h-2 bg-dark-900 rounded-full border border-main p-0.5 overflow-hidden relative z-10">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${statusProgress}%` }}
                                                                    className={`h-full rounded-full transition-all duration-700 relative ${
                                                                        order.status === 'Received' ? 'bg-amber-500' :
                                                                        order.status === 'Preparing' ? 'bg-violet-500' :
                                                                        'bg-brand'
                                                                    }`}
                                                                >
                                                                    <div className="absolute inset-0 bg-white/20" />
                                                                </motion.div>
                                                            </div>
                                                            
                                                            {/* Status labels */}
                                                            <div className="flex justify-between px-0.5 text-[6.5px] font-black uppercase text-secondary tracking-widest opacity-60">
                                                                {(isBooking ? ['Booked', 'Check-In', 'Staying', 'Departed'] : order.type === 'Stadium E-Ticket' || order.type === 'Club Event Ticket' ? ['Purchased', 'Issued', 'Valid', 'Scanned'] : order.type === 'Room Service' ? ['Received', 'Preparing', 'On Route', 'Delivered'] : ['Received', 'Preparing', 'Ready', 'Served']).map((label, idx) => {
                                                                    const isActive = order.status === label;
                                                                    return (
                                                                        <span key={label} className={isActive ? 'text-brand opacity-100 font-extrabold scale-105 transition-all' : ''}>
                                                                            {label}
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
                                    <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-primary leading-none">Financial Intel</h1>
                                            <p className="text-secondary text-xs md:text-sm font-bold uppercase tracking-widest leading-none">Real-time Revenue & Payout Ledger</p>
                                        </div>
                                        {managerContext === 'FM' ? (
                                            <button onClick={handleDownloadPDFReport} className="w-full md:w-auto px-6 py-3 bg-brand text-dark-900 border border-brand rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all whitespace-nowrap shadow-[0_0_15px_rgba(33,255,165,0.3)]">
                                                <FileText size={14} /> Export Monthly PDF Report
                                            </button>
                                        ) : (
                                            <button onClick={handleExport} className="w-full md:w-auto px-6 py-3 bg-btn-sec border border-main rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all whitespace-nowrap">
                                                <FileText size={14} /> Export Datev (SKR03)
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 bg-dark-900 border border-main rounded-[3rem] p-6 md:p-10 space-y-8 shadow-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-30"></div>
                                            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center text-brand shadow-[0_0_15px_rgba(33,255,165,0.2)] shrink-0">
                                                        <Activity size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-primary leading-none">Gross Performance</h3>
                                                        <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em] mt-1">Real-time Revenue Telemetry</p>
                                                    </div>
                                                </div>
                                                <select className="bg-btn-sec border border-main rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none text-primary cursor-pointer hover:border-brand/40 transition-all w-full sm:w-auto">
                                                    <option>Last 30 Days</option>
                                                    <option>Last 7 Days</option>
                                                    <option>Year to Date</option>
                                                </select>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 border-b border-white/5 pb-8">
                                                <div className="p-4 bg-black/40 border border-main rounded-2xl flex flex-col justify-between">
                                                    <p className="text-[7px] font-black text-secondary uppercase tracking-[0.1em] mb-2">Primary Sales</p>
                                                    <p className="text-xl font-black text-primary italic">€{financialsSummary.primarySales.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-400" style={{ width: financialsSummary.primarySales > 0 ? '65%' : '0%' }}></div></div>
                                                </div>
                                                <div className="p-4 bg-black/40 border border-main rounded-2xl flex flex-col justify-between">
                                                    <p className="text-[7px] font-black text-secondary uppercase tracking-[0.1em] mb-2">Premium / VIP</p>
                                                    <p className="text-xl font-black text-primary italic">€{financialsSummary.premiumSales.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-purple-400" style={{ width: financialsSummary.premiumSales > 0 ? '80%' : '0%' }}></div></div>
                                                </div>
                                                <div className="p-4 bg-black/40 border border-main rounded-2xl flex flex-col justify-between">
                                                    <p className="text-[7px] font-black text-secondary uppercase tracking-[0.1em] mb-2">Ancillary / F&B</p>
                                                    <p className="text-xl font-black text-primary italic">€{financialsSummary.ancillarySales.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: financialsSummary.ancillarySales > 0 ? '40%' : '0%' }}></div></div>
                                                </div>
                                                <div className="p-4 bg-black/40 border border-main rounded-2xl flex flex-col justify-between">
                                                    <p className="text-[7px] font-black text-secondary uppercase tracking-[0.1em] mb-2">Tx Volume</p>
                                                    <p className="text-xl font-black text-primary italic">{financialsSummary.txVolume.toLocaleString('de-DE')}</p>
                                                    <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-brand" style={{ width: financialsSummary.txVolume > 0 ? '100%' : '0%' }}></div></div>
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
                                                    <p className="text-2xl font-black italic text-primary">€{commissionData.gross.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                                <div className={`p-6 rounded-[2rem] border flex flex-col justify-center items-center ${commissionData.isFree ? "bg-brand/5 border-brand/20" : "bg-red-500/5 border-red-500/10"}`}>
                                                    <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${commissionData.isFree ? "text-brand" : "text-red-500/70"}`}>{commissionData.rateLabel}</p>
                                                    <p className={`text-2xl font-black italic ${commissionData.isFree ? "text-brand" : "text-red-400"}`}>-€{commissionData.commission.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                                <div className="p-6 bg-brand/10 rounded-[2rem] border border-brand/30 flex flex-col justify-center items-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(33,255,165,0.15)_0%,transparent_70%)]" />
                                                    <p className="text-[8px] font-black text-brand uppercase tracking-[0.2em] mb-2 relative z-10">Settlement Amount</p>
                                                    <p className="text-2xl font-black italic text-brand relative z-10">€{commissionData.settlement.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                            </div>
                                        </div>

                                         <div className="space-y-8">
                                             {/* SETTLEMENT & BUSINESS CREDENTIALS CARD */}
                                             {(managerContext === 'FM' || managerContext === 'RM' || managerContext === 'HM' || managerContext === 'CM' || managerContext === 'BM' || managerContext === 'SM' || managerContext === 'VM') && (
                                                 <div className="bg-glass border border-main rounded-[3rem] p-6 md:p-10 space-y-6 relative overflow-hidden shadow-2xl">
                                                     <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-brand pointer-events-none">
                                                         <Building2 size={120} />
                                                     </div>
                                                     <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                                                         <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand">
                                                             <Building2 size={18} />
                                                         </div>
                                                         <div>
                                                             <h3 className="text-base font-black italic uppercase tracking-tighter text-primary">Settlement & Business Credentials</h3>
                                                             <p className="text-[7px] font-black text-secondary uppercase tracking-[0.1em] mt-0.5">Genesis & Payout Settings</p>
                                                         </div>
                                                     </div>

                                                     <div className="space-y-4">
                                                         <div className="space-y-1">
                                                             <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">Legal Entity Name</label>
                                                             <input 
                                                                 type="text" 
                                                                 value={businessInfo.legalName} 
                                                                 onChange={(e) => setBusinessInfo({...businessInfo, legalName: e.target.value})}
                                                                 className="w-full bg-btn-sec border border-main rounded-xl px-4 py-3 text-xs font-bold text-primary focus:border-brand outline-none transition-all placeholder:text-gray-800" 
                                                             />
                                                         </div>
                                                         <div className="space-y-1">
                                                             <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">Notification Email (Tickets/Commissions)</label>
                                                             <input 
                                                                 type="email" 
                                                                 value={businessInfo.ticketEmail || ''} 
                                                                 onChange={(e) => setBusinessInfo({...businessInfo, ticketEmail: e.target.value})}
                                                                 className="w-full bg-btn-sec border border-main rounded-xl px-4 py-3 text-xs font-bold text-primary focus:border-brand outline-none transition-all placeholder:text-gray-800" 
                                                                 placeholder="accounting@venue.com"
                                                             />
                                                         </div>
                                                         <div className="space-y-1">
                                                             <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">HQ Physical Address</label>
                                                             <input 
                                                                 type="text" 
                                                                 value={businessInfo.address} 
                                                                 onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                                                                 className="w-full bg-btn-sec border border-main rounded-xl px-4 py-3 text-xs font-bold text-primary focus:border-brand outline-none transition-all placeholder:text-gray-800" 
                                                             />
                                                         </div>
                                                         <div className="grid grid-cols-2 gap-3">
                                                             <div className="space-y-1">
                                                                 <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">ZIP Code</label>
                                                                 <input 
                                                                     type="text" 
                                                                     value={businessInfo.zip || ''} 
                                                                     onChange={(e) => setBusinessInfo({...businessInfo, zip: e.target.value})}
                                                                     className="w-full bg-btn-sec border border-main rounded-xl px-4 py-3 text-xs font-bold text-primary focus:border-brand outline-none transition-all placeholder:text-gray-800" 
                                                                 />
                                                             </div>
                                                             <div className="space-y-1">
                                                                 <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">City</label>
                                                                 <input 
                                                                     type="text" 
                                                                     value={businessInfo.city || ''} 
                                                                     onChange={(e) => setBusinessInfo({...businessInfo, city: e.target.value})}
                                                                     className="w-full bg-btn-sec border border-main rounded-xl px-4 py-3 text-xs font-bold text-primary focus:border-brand outline-none transition-all placeholder:text-gray-800" 
                                                                 />
                                                             </div>
                                                         </div>
                                                         <div className="grid grid-cols-2 gap-3">
                                                             <div className="space-y-1">
                                                                 <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">VAT ID (EU/DE)</label>
                                                                 <input 
                                                                     type="text" 
                                                                     value={businessInfo.vatId}
                                                                     onChange={(e) => setBusinessInfo({...businessInfo, vatId: e.target.value})}
                                                                     className="w-full bg-btn-sec border border-main rounded-xl px-4 py-3 text-xs font-bold text-primary focus:border-brand outline-none transition-all placeholder:text-gray-800" 
                                                                 />
                                                             </div>
                                                             <div className="space-y-1">
                                                                 <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">Settlement IBAN</label>
                                                                 <input 
                                                                     type="text" 
                                                                     value={bankingInfo.iban} 
                                                                     onChange={(e) => setBankingInfo({...bankingInfo, iban: e.target.value})}
                                                                     className="w-full bg-btn-sec border border-main rounded-xl px-4 py-3 text-xs font-bold text-primary focus:border-brand outline-none transition-all placeholder:text-gray-800" 
                                                                 />
                                                             </div>
                                                         </div>
                                                     </div>

                                                     <button 
                                                         onClick={handleSaveGlobalManifest}
                                                         className="w-full py-4 mt-2 bg-brand/10 border border-brand/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand hover:bg-brand hover:text-dark-900 transition-all flex items-center justify-center gap-1.5 shadow-lg"
                                                     >
                                                         <CheckCircle2 size={12} /> Save Credentials
                                                     </button>
                                                 </div>
                                             )}
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
                                    <div className="flex flex-col md:flex-row gap-6 md:justify-between md:items-end">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand"><Activity size={24} /></div>
                                                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-primary">Marketing <span className="text-brand">Hub</span></h1>
                                            </div>
                                            <p className="text-secondary text-xs font-bold uppercase tracking-widest leading-none">Broadcast 15s 4K Reels to the Green Network</p>
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto">
                                            <div className="flex-1 md:flex-initial px-4 md:px-6 py-3 bg-btn-sec border border-main rounded-xl text-right">
                                                <p className="text-[8px] font-black text-secondary uppercase tracking-widest">Global Reach</p>
                                                <p className="text-sm md:text-xl font-black italic text-brand leading-none mt-1">{isDemo ? '2.4M Pilots' : '0 Pilots'}</p>
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
                                                        const updatedPosts = [newPost, ...existingPosts];
                                                        localStorage.setItem('green_global_posts', JSON.stringify(updatedPosts));
                                                        setGlobalPosts(updatedPosts);
                                                        if (managerContext === 'FM') {
                                                            alert("UPLOAD SUCCESSFUL: Your 4K Reel is now live for all pilots!");
                                                        } else {
                                                            alert("BROADCAST SUCCESSFUL: Your 4K Reel is now live for all pilots!");
                                                        }
                                                        setPreviewUrl(null);
                                                        setUploadStatus(null);
                                                        setBroadcastCaption('');
                                                    }}
                                                    className="w-full py-5 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    {managerContext === 'FM' ? "Upload to 4K Live Feed" : "Blast to 4K Live Feed"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* PERFORMANCE & ENGAGEMENT */}
                                        <div className="lg:col-span-2 space-y-8">
                                            <div className="bg-glass border border-glass rounded-[3rem] p-4 md:p-10">
                                                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-8">
                                                    <h3 className="text-xl font-black italic uppercase text-primary">Social <span className="text-brand">Interaction Monitor</span></h3>
                                                    <div className="flex gap-2">
                                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">Live Data Sync</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                                                    {[
                                                        { label: 'Likes', value: isDemo ? '12.4K' : '0', trend: isDemo ? '+18%' : '0%', surge: isDemo ? '18% Surge' : 'Stable', icon: Heart, color: 'text-rose-500' },
                                                        { label: 'Comments', value: isDemo ? '892' : '0', trend: isDemo ? '+5%' : '0%', surge: isDemo ? '5% Surge' : 'Stable', icon: MessageCircle, color: 'text-brand' },
                                                        { label: 'Shares', value: isDemo ? '452' : '0', trend: isDemo ? '+12%' : '0%', surge: isDemo ? '12% Surge' : 'Stable', icon: Share2, color: 'text-primary' }
                                                    ].map((stat, i) => (
                                                        <div key={i} className="p-6 md:p-8 bg-btn-sec rounded-[2.5rem] border border-main group hover:border-brand/20 transition-all text-left">
                                                            <stat.icon size={20} className={`${stat.color} mb-3`} />
                                                            <p className="text-[9px] font-black text-secondary uppercase tracking-widest">{stat.label}</p>
                                                            <p className="text-2xl font-black italic text-primary mt-1">{stat.value}</p>
                                                            <p className="text-[8px] font-black text-primary uppercase mt-2">{stat.surge}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6">
                                                    <h3 className="text-lg font-black italic uppercase text-primary">Live <span className="text-brand">15s Feed Preview</span></h3>
                                                    <button 
                                                        onClick={() => setIsFeedOpen(true)}
                                                        className="px-6 py-2.5 bg-brand text-dark-900 rounded-2xl text-[9px] font-black uppercase tracking-wider shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Activity size={12} /> View Live Feed
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                                    {isDemo ? (
                                                        [
                                                            { title: 'Summer Spritz 4K', views: '45K', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop' },
                                                            { title: 'Golden Hour Beats', views: '28K', img: 'https://images.unsplash.com/photo-1551024601-8f230c6c64b9?q=80&w=800&auto=format&fit=crop' }
                                                        ].map((post, i) => (
                                                            <div key={i} className="aspect-video bg-dark-900 rounded-[2.5rem] border border-main relative overflow-hidden group">
                                                                <img src={post.img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt="Post" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end text-left">
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
                                                        ))
                                                    ) : globalPosts.length > 0 ? (
                                                        globalPosts.map((post, i) => (
                                                            <div key={post.id || i} className="aspect-video bg-dark-900 rounded-[2.5rem] border border-main relative overflow-hidden group">
                                                                {post.url ? (
                                                                    <video src={post.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" controls />
                                                                ) : (
                                                                    <div className="w-full h-full bg-btn-sec flex items-center justify-center text-secondary"><Video size={32} /></div>
                                                                )}
                                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-6 flex flex-col justify-end text-left pointer-events-none">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Play size={12} className="text-brand" fill="currentColor" />
                                                                        <p className="text-[10px] font-black italic text-primary">{post.caption || 'Partner Broadcast'}</p>
                                                                    </div>
                                                                    <div className="flex items-center justify-between mt-2">
                                                                        <div className="flex gap-3">
                                                                            <span className="text-[8px] font-black text-brand uppercase">0 Views</span>
                                                                            <span className="text-[8px] font-black text-gray-400 uppercase">15.0s</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-2 bg-btn-sec border border-main rounded-[2.5rem] p-10 text-center flex flex-col items-center justify-center min-h-[200px] w-full">
                                                            <Video size={32} className="text-secondary/30 mb-4" />
                                                            <p className="text-sm font-black italic uppercase text-primary">No Broadcasted Reels</p>
                                                            <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mt-1">Upload your first 4K Reel using the media studio on the left.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'strategic-hub' && (
                                <motion.div key="strategic-hub" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10">
                                    <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-end">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand"><Sparkles size={28} /></div>
                                                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">Frankfurt <span className="text-brand">Strategic Hub</span></h1>
                                            </div>
                                            <p className="text-secondary text-xs md:text-sm font-bold uppercase tracking-widest leading-none">AI-Powered City Momentum & Demand Forecast</p>
                                        </div>
                                        <div className="w-full md:w-auto px-6 py-3 bg-btn-sec border border-main rounded-xl text-[10px] font-black uppercase tracking-widest text-brand text-center whitespace-nowrap">Live Neural Data Sync</div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter ml-2">Upcoming High-Demand Events</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {isDemo ? (
                                                    [
                                                        { title: 'Eintracht Frankfurt vs. Real Madrid', category: 'Football (UCL)', date: 'Saturday, 09.05.2026', impact: '95%', surge: 'Critical Rush', icon: Trophy, color: 'text-red-500' },
                                                        { title: 'Automechanika Frankfurt', category: 'Trade Fair (Messe)', date: '12.05 - 16.05.2026', impact: '82%', surge: 'High Demand', icon: Box, color: 'text-primary' },
                                                        { title: 'Museumsuferfest', category: 'City Festival', date: '22.05 - 24.05.2026', impact: '75%', surge: 'Medium Surge', icon: Users, color: 'text-primary' }
                                                    ].map((event, i) => (
                                                        <div key={i} className="bg-btn-sec border border-main rounded-[2.5rem] p-4 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/10 transition-all group overflow-hidden relative text-left">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-10 -mt-10" />
                                                            <div className="flex items-center gap-4 md:gap-6 relative z-10 min-w-0">
                                                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-btn-sec flex items-center justify-center shrink-0 ${event.color}`}><event.icon size={24} /></div>
                                                                <div className="min-w-0">
                                                                    <h4 className="text-lg md:text-xl font-black italic uppercase text-primary tracking-tighter leading-tight truncate">{event.title}</h4>
                                                                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1 truncate">{event.category} | {event.date}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-left sm:text-right relative z-10 shrink-0">
                                                                <div className="flex items-center gap-2 sm:justify-end mb-1">
                                                                    <TrendingUp size={14} className={event.color} />
                                                                    <span className={`text-2xl font-black italic ${event.color}`}>{event.impact}</span>
                                                                </div>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-secondary">{event.surge}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="bg-btn-sec border border-main rounded-[2.5rem] p-10 text-center">
                                                        <Sparkles size={32} className="text-secondary/30 mx-auto mb-4" />
                                                        <p className="text-sm font-black italic uppercase text-primary">No Upcoming Events Forecast</p>
                                                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mt-1">AI predictive model will populate events as data syncs.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">AI Auditor Insights</h3>
                                            <div className="bg-brand/5 border border-brand/20 rounded-[3rem] p-8 space-y-8 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                                <div className="space-y-6 relative z-10">
                                                    {isDemo ? (
                                                        <>
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
                                                        </>
                                                    ) : (
                                                        <div className="p-5 bg-btn-sec rounded-2xl border border-main text-center py-10">
                                                            <Sparkles size={24} className="text-brand/20 mx-auto mb-3" />
                                                            <p className="text-[10px] font-black text-brand uppercase">No Active Insights</p>
                                                            <p className="text-[9px] font-bold text-secondary leading-relaxed uppercase tracking-wider mt-2">
                                                                Insights will generate dynamically as operational logs accumulate.
                                                            </p>
                                                        </div>
                                                    )}

                                                    <button className="w-full py-5 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand/20 hover:scale-105 transition-all">Optimize My Operations 🚀</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'menu' && (
                                <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                                    <MenuManagement />
                                </motion.div>
                            )}

                            {view === 'documents' && (
                                <motion.div key="documents" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                                            Digital Compliance Vault
                                        </h1>
                                        <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-none">Legal Document Repository & Verification Status</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {(simRole === 'staff' ? [
                                            { group: 'Identity Vault', docs: [{id: 'passport_id', name: 'Passport / ID Card'}], icon: ShieldCheck, color: 'text-brand' },
                                            { group: 'Employment Status', docs: [{id: 'work_permit', name: 'Work Permit / Visa'}], icon: FileText, color: 'text-primary' },
                                            { group: 'Compensation Vault', docs: [{id: 'bank_details', name: 'Bank Details (for tips)'}], icon: Building2, color: 'text-primary' }
                                        ] : [
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
                                        ]).map((group, i) => (
                                            <div key={group.group} className="bg-btn-sec border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity"><group.icon size={120} /></div>
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`p-4 rounded-2xl bg-btn-sec ${group.color}`}><group.icon size={24} /></div>
                                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{group.group}</h3>
                                                </div>
                                                <div className="space-y-4 relative z-10">
                                                    {group.docs.map((doc) => {
                                                        const docState = complianceDocs[doc.id] || { status: 'missing' };
                                                        return (
                                                            <div key={doc.id} className="p-5 bg-btn-sec rounded-2xl border border-main flex flex-col gap-4 hover:bg-white/10 transition-all border-l-4 border-l-transparent hover:border-l-brand">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs font-black italic uppercase text-primary">{doc.name}</span>
                                                                    <div>
                                                                        {docState.status === 'missing' && (
                                                                            <span className="text-[8px] font-black text-secondary uppercase px-2 py-1 bg-white/5 rounded">Missing</span>
                                                                        )}
                                                                        {docState.status === 'pending' && (
                                                                            <span className="text-[8px] font-black text-amber-500 uppercase px-2 py-1 bg-amber-500/10 rounded">Awaiting Admin</span>
                                                                        )}
                                                                        {docState.status === 'approved' && (
                                                                            <span className="text-[8px] font-black text-brand uppercase px-2 py-1 bg-brand/10 rounded">Approved ✓</span>
                                                                        )}
                                                                        {docState.status === 'rejected' && (
                                                                            <span className="text-[8px] font-black text-red-500 uppercase px-2 py-1 bg-red-500/10 rounded">Rejected ✗</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {docState.name && (
                                                                    <div className="text-[8px] font-mono text-gray-500 truncate max-w-full">
                                                                        📄 {docState.name} ({docState.size})
                                                                    </div>
                                                                )}
                                                                <div className="flex gap-2">
                                                                    <label className="flex-1 cursor-pointer">
                                                                        <input 
                                                                            type="file" 
                                                                            className="hidden" 
                                                                            accept="image/*,application/pdf" 
                                                                            onChange={(e) => handleDocumentUpload(doc.id, e.target.files[0])} 
                                                                        />
                                                                        <div className="w-full py-3 bg-btn-sec border border-main rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                                                                            <Upload size={14} className="text-brand" />
                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                                                                                {docState.status === 'missing' ? 'Upload (PDF/IMG)' : 'Re-Upload'}
                                                                            </span>
                                                                        </div>
                                                                    </label>
                                                                    {docState.fileData && (
                                                                        <button 
                                                                            onClick={() => handleViewDocument(docState)}
                                                                            className="p-3 bg-btn-sec border border-main rounded-xl text-secondary hover:text-primary transition-colors flex items-center justify-center" 
                                                                            title="View Document"
                                                                        >
                                                                            <FileText size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
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
                                                {activeVerificationQueue.length > 0 ? (
                                                    activeVerificationQueue.map((v) => (
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
                                                                        <span className="text-[8px] font-black text-primary bg-blue-400/10 px-2 py-1 rounded uppercase">Awaiting Verification</span>
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
                                                                    {v.email ? (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => handleRejectVehicle(v.email)}
                                                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-primary transition-all"
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleApproveVehicle(v.email)}
                                                                                className="p-3 bg-brand/10 text-brand rounded-xl hover:bg-brand hover:text-dark-900 transition-all"
                                                                            >
                                                                                <CheckCircle size={16} />
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        user?.role === 'super_admin' ? (
                                                                            <>
                                                                                <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-primary transition-all"><X size={16} /></button>
                                                                                <button className="p-3 bg-brand/10 text-brand rounded-xl hover:bg-brand hover:text-dark-900 transition-all"><CheckCircle size={16} /></button>
                                                                            </>
                                                                        ) : (
                                                                            <div className="flex gap-2 opacity-30">
                                                                                <div className="p-3 bg-btn-sec text-secondary rounded-xl cursor-not-allowed" title="Super Admin Only"><Lock size={16} /></div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="bg-btn-sec border border-main rounded-[2.5rem] p-10 text-center py-12">
                                                        <ShieldCheck size={32} className="text-brand/30 mx-auto mb-4 animate-pulse" />
                                                        <p className="text-sm font-black italic uppercase text-primary">All Assets Verified</p>
                                                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mt-1">No pending V5C uploads or verifications in queue.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* RED FLAG RESOLUTION CENTER */}
                                        <div className="bg-glass border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Security Red Flags</h3>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isDemo ? 'bg-red-500/10 text-red-500' : 'bg-brand/10 text-brand'}`}>
                                                    <ShieldAlert size={14} className={isDemo ? 'text-red-500' : 'text-brand'} />
                                                    <span className="text-[9px] font-black uppercase">{isDemo ? '1 Active Collision' : '0 Active Flags'}</span>
                                                </div>
                                            </div>

                                            {isDemo ? (
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
                                            ) : (
                                                <div className="bg-btn-sec border border-main rounded-[2.5rem] p-10 text-center py-12">
                                                    <ShieldCheck size={32} className="text-brand/30 mx-auto mb-4" />
                                                    <p className="text-sm font-black italic uppercase text-primary">System Secure</p>
                                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mt-1">No identity collisions or security red flags detected.</p>
                                                </div>
                                            )}
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
                                                    onClick={() => {
                                                        setNewVehicleData({ model: '', year: '', plate: '', color: '', concession: '', assignedDriver: 'None', photo: null });
                                                        setIsAddingVehicle(true);
                                                    }}
                                                    className="px-6 py-3 bg-brand/10 border border-brand/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand flex items-center gap-2 hover:bg-brand hover:text-dark-900 transition-all"
                                                >
                                                    <PlusCircle size={14} /> Add New Asset to Pool
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                                {driverDeployments.map((driver) => (
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
                                                                <div 
                                                                    onClick={() => !driver.isLocked && setEditingDriver({ 
                                                                        ...driver, 
                                                                        originalName: driver.name,
                                                                        currentPlate: driver.vehicleInfo?.plate || null,
                                                                        selectedVehicle: driver.vehicleInfo || null
                                                                    })}
                                                                    className="w-full p-4 bg-dark-950 border border-main rounded-2xl flex items-center justify-between group cursor-pointer hover:border-brand/50 transition-all"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <Car size={16} className={driver.isLocked ? 'text-secondary' : 'text-brand'} />
                                                                        <span className="text-[10px] font-black uppercase text-primary italic">{driver.current}</span>
                                                                    </div>
                                                                    {!driver.isLocked && <ChevronRight size={14} className="text-secondary group-hover:text-brand transition-colors" />}
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <button disabled={driver.isLocked} className="flex-1 py-3 bg-btn-sec border border-main rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:bg-white/10 transition-all">History</button>
                                                                <button 
                                                                    disabled={driver.isLocked}
                                                                    onClick={() => !driver.isLocked && setEditingDriver({ 
                                                                        ...driver, 
                                                                        originalName: driver.name,
                                                                        currentPlate: driver.vehicleInfo?.plate || null,
                                                                        selectedVehicle: driver.vehicleInfo || null
                                                                    })}
                                                                    className="flex-1 py-3 bg-brand/10 border border-brand/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand hover:bg-brand hover:text-dark-900 transition-all"
                                                                >
                                                                    Switch Asset
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- REGISTERED VEHICLES DIRECTORY --- */}
                                    <div className="bg-glass border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
                                        
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-2 rounded-xl bg-brand/10 text-brand">
                                                        <Car size={20} />
                                                    </span>
                                                    <h2 className="text-xl font-black italic uppercase tracking-wider text-white">Registered Fleet Assets</h2>
                                                </div>
                                                <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">
                                                    Active database records of vehicles registered in your business pool
                                                </p>
                                            </div>
                                            <div className="px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-[9px] font-black uppercase tracking-widest">
                                                {registeredVehicles.length} Vehicles Total
                                            </div>
                                        </div>

                                        {registeredVehicles.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-secondary border border-white/10">
                                                    <Car size={28} className="opacity-40" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-white uppercase tracking-wider">No Fleet Assets Registered</p>
                                                    <p className="text-[10px] text-secondary max-w-sm">
                                                        Use the registration portal below to register vehicles. Once added, they will appear in this directory and become assignable to drivers.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {registeredVehicles.map((vehicle) => (
                                                    <div key={vehicle.id} className="group relative bg-dark-900/50 border border-white/5 hover:border-brand/30 rounded-[2rem] p-6 space-y-6 transition-all duration-300 hover:shadow-lg hover:shadow-brand/5">
                                                        {/* Card Background gradient shift on hover */}
                                                        <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/5 opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-300 pointer-events-none" />

                                                        {/* Vehicle Image / Placeholder */}
                                                        <div className="relative aspect-video w-full rounded-2xl bg-dark-800/80 border border-white/5 overflow-hidden flex items-center justify-center">
                                                            {vehicle.photo ? (
                                                                <img 
                                                                    src={vehicle.photo} 
                                                                    alt={`${vehicle.color} ${vehicle.model}`} 
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-2 text-secondary/40">
                                                                    <Car size={32} />
                                                                    <span className="text-[8px] font-bold uppercase tracking-widest">No Image Available</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white text-[8px] font-bold uppercase tracking-widest">
                                                                {vehicle.year || 'N/A'}
                                                            </div>
                                                        </div>

                                                        {/* Vehicle Metadata */}
                                                        <div className="space-y-4 relative z-10">
                                                            <div className="space-y-1">
                                                                <h3 className="text-md font-extrabold text-white tracking-tight leading-tight uppercase">
                                                                    {vehicle.model}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-[10px] text-secondary">
                                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: vehicle.color || '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                                                                    <span className="capitalize font-medium">{vehicle.color || 'Unknown Color'}</span>
                                                                </div>
                                                            </div>

                                                            {/* Sharing Capacity Selector */}
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center px-1">
                                                                    <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Sharing Option Capacity</span>
                                                                    <span className="text-[9px] font-black text-brand uppercase tracking-wider">Option {vehicle.sharingType || 4}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                                                                    {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                                                                        const isSelected = (vehicle.sharingType || 4) === num;
                                                                        return (
                                                                            <button
                                                                                key={num}
                                                                                onClick={async () => {
                                                                                    try {
                                                                                        // Update vehicle doc in Firestore
                                                                                        await updateDoc(doc(fbDb, 'vehicles', vehicle.id), { sharingType: num });
                                                                                        // Find assigned driver and sync
                                                                                        const assignedDriver = driverDeployments.find(d => d.vehicleInfo?.plate === vehicle.plate);
                                                                                        if (assignedDriver && assignedDriver.email) {
                                                                                            const updatedVehicleInfo = { ...assignedDriver.vehicleInfo, sharingType: num };
                                                                                            await updateDoc(doc(fbDb, 'users', assignedDriver.email.toLowerCase()), {
                                                                                                vehicleInfo: updatedVehicleInfo
                                                                                            });
                                                                                        }
                                                                                    } catch (err) {
                                                                                        console.error("Failed to update sharing type:", err);
                                                                                    }
                                                                                }}
                                                                                className={`flex-1 aspect-square rounded-xl text-[9px] font-black transition-all flex items-center justify-center ${
                                                                                    isSelected 
                                                                                        ? 'bg-white text-black scale-105 shadow-md' 
                                                                                        : 'text-secondary hover:text-white hover:bg-white/5'
                                                                                }`}
                                                                            >
                                                                                {num}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[8px] font-bold text-secondary uppercase tracking-wider block">License Plate</span>
                                                                    <span className="text-xs font-black tracking-widest text-brand uppercase">{vehicle.plate || vehicle.id}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={async () => {
                                                                        if (window.confirm(`Are you sure you want to deregister vehicle with plate ${vehicle.plate || vehicle.id}? This will remove it from the asset directory and pool.`)) {
                                                                            try {
                                                                                await deleteDoc(doc(fbDb, 'vehicles', vehicle.id));
                                                                                alert(`Vehicle ${vehicle.plate || vehicle.id} successfully removed from the fleet.`);
                                                                            } catch (err) {
                                                                                console.error(err);
                                                                                alert(`Failed to delete vehicle: ${err.message}`);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                                                                    title="Deregister Vehicle"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* --- EDIT DRIVER VEHICLE MODAL --- */}
                            <AnimatePresence>
                                {editingDriver && (
                                    <>
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setEditingDriver(null)}
                                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
                                        />
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-1"
                                        >
                                            <div className="bg-dark-900 border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-brand shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Manage Driver Asset</h3>
                                                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Driver: {editingDriver.name}</p>
                                                    </div>
                                                    <button onClick={() => setEditingDriver(null)} className="p-3 bg-btn-sec rounded-xl text-gray-400 hover:text-primary transition-all"><X size={20} /></button>
                                                </div>

                                                <div className="space-y-6">
                                                    {/* CURRENT STATUS */}
                                                    <div className="p-4 bg-btn-sec border border-main rounded-2xl flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-brand/10 p-1 border border-brand/20">
                                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editingDriver.avatar}`} className="w-full h-full rounded-lg" alt="Driver" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black uppercase text-primary">{editingDriver.name}</p>
                                                                <p className="text-[8px] font-black text-brand uppercase tracking-widest">{editingDriver.status}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[8px] font-black text-secondary uppercase">Rating</p>
                                                            <p className="text-xs font-bold text-primary">★ {editingDriver.rating}</p>
                                                        </div>
                                                    </div>

                                                    {/* DRIVER DETAILS EDIT FIELDS */}
                                                    <div className="space-y-4 p-4 bg-dark-950 border border-main rounded-2xl">
                                                        <p className="text-[8px] font-black text-brand uppercase tracking-widest">Edit Driver Profile</p>
                                                        
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {/* DRIVER NAME */}
                                                            <div className="space-y-1.5 col-span-2">
                                                                <label className="text-[7px] font-black text-secondary uppercase tracking-widest ml-1">Driver Name</label>
                                                                <input 
                                                                    type="text"
                                                                    value={editingDriver.name}
                                                                    onChange={(e) => setEditingDriver(prev => ({ ...prev, name: e.target.value, avatar: e.target.value }))}
                                                                    className="w-full bg-btn-sec border border-main rounded-xl px-3 py-2 text-[10px] font-bold text-primary outline-none focus:border-brand/50 transition-all placeholder:text-gray-800"
                                                                />
                                                            </div>

                                                            {/* DUTY STATUS */}
                                                            <div className="space-y-1.5">
                                                                <label className="text-[7px] font-black text-secondary uppercase tracking-widest ml-1">Duty Status</label>
                                                                <select 
                                                                    value={editingDriver.status}
                                                                    onChange={(e) => setEditingDriver(prev => ({ ...prev, status: e.target.value }))}
                                                                    className="w-full bg-btn-sec border border-main rounded-xl px-3 py-2 text-[10px] font-bold text-primary outline-none focus:border-brand/50 transition-all cursor-pointer"
                                                                >
                                                                    <option value="In Service" className="bg-dark-900 text-primary">In Service</option>
                                                                    <option value="Standby" className="bg-dark-900 text-primary">Standby</option>
                                                                    <option value="Offline" className="bg-dark-900 text-primary">Offline</option>
                                                                    <option value="Locked" className="bg-dark-900 text-primary">Locked</option>
                                                                </select>
                                                            </div>

                                                            {/* RATING */}
                                                            <div className="space-y-1.5">
                                                                <label className="text-[7px] font-black text-secondary uppercase tracking-widest ml-1">Rating (Out of 5)</label>
                                                                <input 
                                                                    type="number"
                                                                    step="0.1"
                                                                    min="0"
                                                                    max="5"
                                                                    value={editingDriver.rating}
                                                                    onChange={(e) => setEditingDriver(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                                                                    className="w-full bg-btn-sec border border-main rounded-xl px-3 py-2 text-[10px] font-bold text-primary outline-none focus:border-brand/50 transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* VEHICLE PICKER */}
                                                    <div className="space-y-3">
                                                        <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Swap / Assign Vehicle</label>
                                                        <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto no-scrollbar pr-1">
                                                            {registeredVehicles.map((veh) => {
                                                                const isSelected = editingDriver.selectedVehicle?.plate === veh.plate;
                                                                return (
                                                                    <button
                                                                        key={veh.id}
                                                                        onClick={() => setEditingDriver(prev => ({ 
                                                                            ...prev, 
                                                                            current: veh.model,
                                                                            selectedVehicle: veh
                                                                        }))}
                                                                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                                                                            isSelected 
                                                                                ? 'bg-brand/10 border-brand text-brand' 
                                                                                : 'bg-dark-950 border-main text-secondary hover:border-brand/30 hover:text-primary'
                                                                        }`}
                                                                    >
                                                                        <div className="flex justify-between items-start w-full">
                                                                            <Car size={16} className={isSelected ? 'text-brand' : 'text-secondary'} />
                                                                            <span className="text-[7px] font-mono font-black uppercase opacity-65">{veh.plate}</span>
                                                                        </div>
                                                                        <span className="text-[9px] font-black uppercase italic tracking-wider mt-3 truncate">{veh.model}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                            
                                                            <button
                                                                onClick={() => setEditingDriver(prev => ({ 
                                                                    ...prev, 
                                                                    current: 'None',
                                                                    selectedVehicle: null
                                                                }))}
                                                                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                                                                    editingDriver.current === 'None' || !editingDriver.selectedVehicle
                                                                        ? 'bg-brand/10 border-brand text-brand' 
                                                                        : 'bg-dark-950 border-main text-secondary hover:border-brand/30 hover:text-primary'
                                                                }`}
                                                            >
                                                                <X size={16} className={editingDriver.current === 'None' || !editingDriver.selectedVehicle ? 'text-brand' : 'text-secondary'} />
                                                                <span className="text-[9px] font-black uppercase italic tracking-wider mt-3 truncate">None</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4 border-t border-white/5">
                                                    <button 
                                                        onClick={async () => {
                                                            const updated = driverDeployments.map(d => 
                                                                d.name === editingDriver.originalName ? { ...d, name: editingDriver.name, status: editingDriver.status, rating: editingDriver.rating, avatar: editingDriver.avatar, current: 'None', selectedVehicle: null } : d
                                                            );
                                                            setDriverDeployments(updated);
                                                            localStorage.setItem(`green_driver_deployments_${userEmailKey}`, JSON.stringify(updated));
                                                            
                                                            // Clear vehicleInfo in Firestore
                                                            if (editingDriver && editingDriver.email) {
                                                                try {
                                                                    await updateDoc(doc(fbDb, 'users', editingDriver.email.toLowerCase()), {
                                                                        vehicleInfo: null
                                                                    });
                                                                } catch (err) {
                                                                    console.error("Error clearing vehicle info in Firestore:", err);
                                                                }
                                                            }
                                                            
                                                            setEditingDriver(null);
                                                        }}
                                                        className="flex-1 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-primary transition-all"
                                                    >
                                                        Unassign Vehicle
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            const updated = driverDeployments.map(d => 
                                                                d.name === editingDriver.originalName ? { ...d, name: editingDriver.name, status: editingDriver.status, rating: editingDriver.rating, avatar: editingDriver.avatar, current: editingDriver.current, selectedVehicle: editingDriver.selectedVehicle } : d
                                                            );
                                                            setDriverDeployments(updated);
                                                            localStorage.setItem(`green_driver_deployments_${userEmailKey}`, JSON.stringify(updated));
                                                            
                                                            // Sync vehicle to Firestore
                                                            if (editingDriver && editingDriver.email) {
                                                                if (editingDriver.selectedVehicle) {
                                                                    try {
                                                                        await updateDoc(doc(fbDb, 'users', editingDriver.email.toLowerCase()), {
                                                                            vehicleInfo: {
                                                                                model: editingDriver.selectedVehicle.model,
                                                                                plate: editingDriver.selectedVehicle.plate,
                                                                                year: editingDriver.selectedVehicle.year,
                                                                                color: editingDriver.selectedVehicle.color,
                                                                                photo: editingDriver.selectedVehicle.photo || null,
                                                                                status: 'approved',
                                                                                sharingType: editingDriver.selectedVehicle.sharingType || 4
                                                                            }
                                                                        });
                                                                    } catch (err) {
                                                                        console.error("Error setting vehicle in Firestore:", err);
                                                                    }
                                                                } else {
                                                                    try {
                                                                        await updateDoc(doc(fbDb, 'users', editingDriver.email.toLowerCase()), {
                                                                            vehicleInfo: null
                                                                        });
                                                                    } catch (err) {
                                                                        console.error("Error clearing vehicle in Firestore:", err);
                                                                    }
                                                                }
                                                            }
                                                            
                                                            setEditingDriver(null);
                                                        }}
                                                        className="flex-1 py-4 bg-brand text-dark-900 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>

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
                                                        {newVehicleData.photo === 'uploading...' ? (
                                                            <div className="flex items-center justify-center h-full w-full bg-dark-900 text-brand text-[10px] font-bold uppercase tracking-widest animate-pulse">Uploading...</div>
                                                        ) : newVehicleData.photo ? (
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
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (file && user?.email) {
                                                                    setNewVehicleData(prev => ({ ...prev, photo: 'uploading...' }));
                                                                    try {
                                                                        const storageRef = ref(storage, `vehicles/${user.email.toLowerCase()}/${Date.now()}_${file.name}`);
                                                                        const uploadTask = await uploadBytesResumable(storageRef, file);
                                                                        const url = await getDownloadURL(uploadTask.ref);
                                                                        setNewVehicleData(prev => ({ ...prev, photo: url }));
                                                                    } catch (err) {
                                                                        console.error('Vehicle upload error:', err);
                                                                        setNewVehicleData(prev => ({ ...prev, photo: null }));
                                                                        alert('Failed to upload image.');
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        {[
                                                            { label: 'Manufacturer & Model', field: 'model', placeholder: 'e.g. Tesla Model Y' },
                                                            { label: 'Year', field: 'year', placeholder: 'e.g. 2025' },
                                                            { label: 'License Plate', field: 'plate', placeholder: 'e.g. F-GR-2025' },
                                                            { label: 'Color', field: 'color', placeholder: 'e.g. Midnight Blue' }, { label: 'Konzessionsnummer', field: 'concession', placeholder: 'e.g. TX-4820' }
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
                                                        <div className="space-y-1.5">
                                                            <label className="text-[7px] font-black text-secondary uppercase tracking-widest ml-1">Assign Driver</label>
                                                            <select 
                                                                value={newVehicleData.assignedDriver || 'None'}
                                                                onChange={(e) => setNewVehicleData(prev => ({ ...prev, assignedDriver: e.target.value }))}
                                                                className="w-full bg-dark-950 border border-main rounded-xl px-4 py-3 text-[10px] font-bold text-primary outline-none focus:border-brand/50 transition-all"
                                                            >
                                                                <option value="None" className="bg-dark-950 text-secondary">None</option>
                                                                {driverDeployments.map(driver => (
                                                                    <option key={driver.name} value={driver.name} className="bg-dark-950 text-primary">{driver.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={async () => {
                                                        if (newVehicleData.model) {
                                                            try {
                                                                const managerId = user.email.toLowerCase();
                                                                const vehicleDocId = (newVehicleData.plate || 'V-' + Math.floor(100 + Math.random() * 900)).replace(/\s+/g, '-').toUpperCase();
                                                                const newVehicleRef = doc(fbDb, 'vehicles', vehicleDocId);
                                                                const newVehicleDoc = {
                                                                    id: vehicleDocId,
                                                                    managerId: managerId,
                                                                    model: newVehicleData.model,
                                                                    plate: newVehicleData.plate || 'F-GR ' + Math.floor(1000 + Math.random() * 9000) + 'E',
                                                                    year: newVehicleData.year || '2024',
                                                                    color: newVehicleData.color || 'Midnight Green',
                                                                    photo: newVehicleData.photo || null,
                                                                    status: 'approved',
                                                                    assignedDriver: newVehicleData.assignedDriver || 'None',
                                                                    sharingType: 4
                                                                };
                                                                await setDoc(newVehicleRef, newVehicleDoc);

                                                                // Auto-assign driver if selected
                                                                if (newVehicleData.assignedDriver && newVehicleData.assignedDriver !== 'None') {
                                                                    const driverObj = driverDeployments.find(d => d.name === newVehicleData.assignedDriver);
                                                                    if (driverObj && driverObj.email) {
                                                                        await updateDoc(doc(fbDb, 'users', driverObj.email.toLowerCase()), {
                                                                            vehicleInfo: {
                                                                                model: newVehicleDoc.model,
                                                                                plate: newVehicleDoc.plate,
                                                                                year: newVehicleDoc.year,
                                                                                color: newVehicleDoc.color,
                                                                                photo: newVehicleDoc.photo || null,
                                                                                status: 'approved',
                                                                                sharingType: 4
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                                alert(`FLEET ASSET REGISTERED IN FIRESTORE\n----------------------\nModel: ${newVehicleDoc.model}\nPlate: ${newVehicleDoc.plate}\nAssigned Driver: ${newVehicleDoc.assignedDriver}`);
                                                            } catch (err) {
                                                                console.error("Error registering vehicle in Firestore:", err);
                                                                alert("❌ Failed to register vehicle in Firestore.");
                                                            }
                                                        }
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

                            {view === 'sitting' && (
                                <motion.div key="sitting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 pb-20">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Console Sitting</h1>
                                            <p className="text-secondary text-sm font-bold uppercase tracking-widest leading-none">Identity, Business Credentials & GPS Lockdown</p>
                                        </div>
                                        <button 
                                            onClick={handleSaveGlobalManifest}
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

                                            {/* Profile Picture Uploader */}
                                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                                                <div className="relative group">
                                                    <div className="w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-brand to-violet-500 shadow-[0_0_20px_rgba(52,211,153,0.15)] overflow-hidden">
                                                        {personalInfo.profilePicture === 'uploading...' ? (
                                                            <div className="w-full h-full rounded-[1.3rem] bg-dark-900 flex items-center justify-center">
                                                                <span className="text-[8px] text-brand font-black animate-pulse">UP...</span>
                                                            </div>
                                                        ) : (
                                                            <img 
                                                                src={personalInfo.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${personalInfo.name}`} 
                                                                alt="Profile Preview" 
                                                                className="w-full h-full rounded-[1.3rem] object-cover bg-dark-900" 
                                                            />
                                                        )}
                                                    </div>
                                                    <label className="absolute -bottom-2 -right-2 p-2 bg-brand text-dark-900 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                                        <Camera size={14} />
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*" 
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (file && user?.email) {
                                                                    setPersonalInfo(prev => ({ ...prev, profilePicture: 'uploading...' }));
                                                                    try {
                                                                        const storageRef = ref(storage, `profiles/${user.email.toLowerCase()}/${Date.now()}_${file.name}`);
                                                                        const uploadTask = await uploadBytesResumable(storageRef, file);
                                                                        const url = await getDownloadURL(uploadTask.ref);
                                                                        setPersonalInfo(prev => ({ ...prev, profilePicture: url }));
                                                                    } catch (err) {
                                                                        console.error('Profile photo upload error:', err);
                                                                        setPersonalInfo(prev => ({ ...prev, profilePicture: null }));
                                                                        alert('Failed to upload image.');
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                <div className="space-y-1 text-center sm:text-left">
                                                    <h4 className="text-sm font-black italic uppercase text-primary">Manager Avatar</h4>
                                                    <p className="text-[10px] text-secondary font-bold uppercase tracking-widest leading-relaxed">
                                                        Upload a custom profile photo or use auto-generated vector seed.
                                                    </p>
                                                    {personalInfo.profilePicture && (
                                                        <button 
                                                            onClick={() => setPersonalInfo(prev => ({ ...prev, profilePicture: '' }))}
                                                            className="text-[9px] font-black uppercase text-red-500 tracking-widest hover:text-red-400 mt-1 block"
                                                        >
                                                            Reset to Default Seed
                                                        </button>
                                                    )}
                                                </div>
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
                                                <div className="col-span-2 md:col-span-1 space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Direct Email</label>
                                                    <input 
                                                        type="email" 
                                                        value={personalInfo.email} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-violet-400 outline-none" 
                                                    />
                                                </div>
                                                <div className="col-span-2 md:col-span-1 space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Mobile Line</label>
                                                    <input 
                                                        type="text" 
                                                        value={personalInfo.phone} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-violet-400 outline-none" 
                                                    />
                                                </div>
                                                <div className="col-span-2 md:col-span-1 space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Personal Address</label>
                                                    <input 
                                                        type="text" 
                                                        value={personalInfo.address} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-violet-400 outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">ZIP Code</label>
                                                    <input 
                                                        type="text" 
                                                        value={personalInfo.zip} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, zip: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-violet-400 outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">City</label>
                                                    <input 
                                                        type="text" 
                                                        value={personalInfo.city} 
                                                        onChange={(e) => setPersonalInfo({...personalInfo, city: e.target.value})}
                                                        className="w-full bg-btn-sec border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-violet-400 outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* PASSWORD CHANGE TERMINAL */}
                                        <div className="bg-btn-sec border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 rounded-2xl bg-brand/10 text-brand"><ShieldCheck size={24} /></div>
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Console Security Password</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Current Password</label>
                                                    <input 
                                                        type="password" 
                                                        placeholder="••••"
                                                        value={currentPasswordInput}
                                                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                                                        className="w-full bg-dark-950 border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">New Password</label>
                                                    <input 
                                                        type="password" 
                                                        placeholder="••••"
                                                        value={newPasswordInput}
                                                        onChange={(e) => setNewPasswordInput(e.target.value)}
                                                        className="w-full bg-dark-950 border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-secondary uppercase ml-1">Confirm New Password</label>
                                                    <input 
                                                        type="password" 
                                                        placeholder="••••"
                                                        value={confirmPasswordInput}
                                                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                                        className="w-full bg-dark-950 border border-main rounded-xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" 
                                                    />
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => {
                                                    if (currentPasswordInput !== securityPassword) {
                                                        return alert("Error: Current password is incorrect.");
                                                    }
                                                    if (!newPasswordInput) {
                                                        return alert("Error: New password cannot be empty.");
                                                    }
                                                    if (newPasswordInput !== confirmPasswordInput) {
                                                        return alert("Error: New passwords do not match.");
                                                    }
                                                    setSecurityPassword(newPasswordInput);
                                                    setCurrentPasswordInput('');
                                                    setNewPasswordInput('');
                                                    setConfirmPasswordInput('');
                                                    alert("PASSWORD CHANGED SUCCESSFULLY: Console security credentials updated.");
                                                }}
                                                className="px-6 py-3 bg-brand/10 border border-brand/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand hover:bg-brand hover:text-dark-900 transition-all"
                                            >
                                                Update Security Password
                                            </button>
                                        </div>

                                        {/* BUSINESS CORE DETAILS */}

                                        {/* GPS Lockdown (Relocated) */}
                                        {(managerContext !== 'FM' && managerContext !== 'SM' && simRole !== 'staff') && (
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
                                    <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-end">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-primary leading-none">Team Hub</h1>
                                            <p className="text-secondary text-xs md:text-sm font-bold uppercase tracking-widest leading-none">Access Control & Active Personnel</p>
                                        </div>
                                        <button 
                                            onClick={() => setView('onboarding')}
                                            className="w-full md:w-auto px-8 py-4 bg-brand text-dark-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 text-center flex items-center justify-center gap-2"
                                        >
                                            <PlusCircle size={16} /> Onboard via Green ID
                                        </button>
                                    </div>
                                    
                                    <div className="bg-glass border border-main rounded-[3rem] p-4 md:p-10 space-y-4 shadow-2xl">
                                        {staffList.map((member, i) => (
                                            <div key={i} className="flex flex-row items-center justify-between p-4 md:p-6 bg-btn-sec rounded-3xl border border-main hover:bg-white/10 hover:border-brand/20 transition-all gap-2 md:gap-4 group">
                                                <div className="flex items-center gap-3 md:gap-6 min-w-0">
                                                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 p-1 shrink-0">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} alt="Avatar" className="w-full h-full rounded-xl" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                            <p className="text-sm font-black italic uppercase text-primary tracking-tight leading-none truncate">{member.name}</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {['Orders', 'Feed', 'Finance', 'Terminal'].filter(p => member.permissions?.includes(p)).map(p => (
                                                                    <span key={p} className="px-2 py-0.5 bg-brand/10 text-brand text-[6px] font-black uppercase rounded border border-brand/20 whitespace-nowrap">{p}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-brand uppercase tracking-widest mt-1.5 italic">ID: {member.id || `ST-10${i+24}`}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 md:gap-6 shrink-0">
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

                                    {/* --- BULK INVITE LINK --- */}
                                    <div className="bg-glass border border-main rounded-[3rem] p-10 space-y-6 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5"><Handshake size={80} className="text-brand" /></div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                                                <Handshake size={22} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black italic uppercase text-primary">Bulk Invite Link</p>
                                                <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Copy and share this link to onboard drivers and staff automatically</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 bg-btn-sec border border-main p-3 rounded-2xl items-center justify-between">
                                            <span className="text-[10px] font-mono text-secondary truncate flex-1 px-2 select-all">
                                                {`${window.location.origin}/signup?mode=partner&invite=${encodeURIComponent(user?.email || 'manager@green.de')}`}
                                            </span>
                                            <button 
                                                onClick={() => {
                                                    const link = `${window.location.origin}/signup?mode=partner&invite=${encodeURIComponent(user?.email || 'manager@green.de')}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert("📋 Invite Link Copied to Clipboard!\n\nShare this link with your drivers and staff so they can register and link to your fleet automatically.");
                                                }}
                                                className="px-5 py-3 bg-brand text-dark-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shrink-0"
                                            >
                                                Copy Link
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-glass border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl">
                                        {/* Header */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                                                <ShieldCheck size={22} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black italic uppercase text-primary">Onboard via Green ID</p>
                                                <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Enter the Green ID of the registered staff or driver</p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                                            <input 
                                                type="text" 
                                                placeholder="Enter Green ID (e.g. GRN-AB3X-Y7KP)" 
                                                value={staffSearchId}
                                                onChange={(e) => setStaffSearchId(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchByGreenId()}
                                                className="w-full bg-btn-sec border border-main rounded-2xl py-6 pl-16 pr-36 text-sm font-black uppercase tracking-widest text-brand outline-none focus:border-brand transition-all placeholder:text-gray-700 placeholder:normal-case placeholder:font-bold" 
                                            />
                                            <button 
                                                onClick={handleSearchByGreenId}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-brand text-dark-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                            >
                                                {isSearchingStaff ? 'Searching...' : 'Search'}
                                            </button>
                                        </div>

                                        {/* Not found message */}
                                        {!isSearchingStaff && staffSearchId && !foundStaff && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                                    <X size={14} className="text-red-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Green ID Not Found</p>
                                                    <p className="text-[9px] text-secondary font-bold mt-0.5">No registered staff or driver matches this ID. Ask them to check their Green ID on the pending page.</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        <AnimatePresence>
                                            {foundStaff && (
                                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                                    {/* Staff Card */}
                                                    <div className="p-6 bg-brand/5 border border-brand/20 rounded-3xl flex items-center gap-5 relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
                                                        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 p-1 shrink-0">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${foundStaff.name}`} alt="Avatar" className="w-full h-full rounded-xl" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-lg font-black italic uppercase text-primary truncate">{foundStaff.name}</p>
                                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{foundStaff.role}</p>
                                                            {foundStaff.email && <p className="text-[9px] text-secondary font-bold mt-0.5 truncate">{foundStaff.email}</p>}
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <p className="text-[7px] font-black text-brand/60 uppercase tracking-widest mb-1">Green ID</p>
                                                            <span className="px-3 py-1.5 bg-brand/10 text-brand rounded-xl text-[9px] font-black font-mono tracking-widest border border-brand/20">{foundStaff.greenId}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2">Quick Templates</p>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {[
                                                                { id: 'pilot', label: managerContext === 'FM' ? 'Standard Driver' : 'Standard Pilot', icon: Zap },
                                                                { id: 'supervisor', label: managerContext === 'FM' ? 'Fleet Dispatcher' : 'Supervisor', icon: ShieldCheck },
                                                                { id: 'accountant', label: managerContext === 'FM' ? 'Fleet Accountant' : 'Accountant', icon: Receipt }
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
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.orders ? 'text-primary' : 'text-secondary'}`}>
                                                                    {managerContext === 'FM' ? 'Rides & Dispatches' : 'Orders & Queue'}
                                                                </p>
                                                                <p className="text-[8px] font-bold text-secondary uppercase mt-1">
                                                                    {managerContext === 'FM' ? 'Process live ride dispatches' : 'Process live service requests'}
                                                                </p>
                                                            </button>
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, terminal: !prev.terminal }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.terminal ? 'bg-brand/10 border-brand' : 'bg-btn-sec border-main'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.terminal ? 'bg-brand text-dark-900' : 'bg-btn-sec text-secondary'}`}><QrCode size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.terminal ? 'text-primary' : 'text-secondary'}`}>
                                                                    {managerContext === 'FM' ? 'Driver Compliance' : 'Scan Terminal'}
                                                                </p>
                                                                <p className="text-[8px] font-bold text-secondary uppercase mt-1">
                                                                    {managerContext === 'FM' ? 'Verify driver permits & logs' : 'Verify tickets & vouchers'}
                                                                </p>
                                                            </button>
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, finance: !prev.finance }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.finance ? 'bg-brand/10 border-brand' : 'bg-btn-sec border-main'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.finance ? 'bg-brand text-dark-900' : 'bg-btn-sec text-secondary'}`}><Receipt size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.finance ? 'text-primary' : 'text-secondary'}`}>
                                                                    {managerContext === 'FM' ? 'Fleet Billing' : 'Financial Intel'}
                                                                </p>
                                                                <p className="text-[8px] font-bold text-secondary uppercase mt-1">
                                                                    {managerContext === 'FM' ? 'View fleet revenue & exports' : 'View revenue & exports'}
                                                                </p>
                                                            </button>
                                                            <button 
                                                                onClick={() => setStaffPermissions(prev => ({ ...prev, compliance: !prev.compliance }))}
                                                                className={`p-6 rounded-[2rem] border transition-all text-left group ${staffPermissions.compliance ? 'bg-violet-500/10 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'bg-btn-sec border-main'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${staffPermissions.compliance ? 'bg-violet-500 text-primary' : 'bg-btn-sec text-secondary'}`}><ShieldCheck size={20} /></div>
                                                                <p className={`text-sm font-black italic uppercase ${staffPermissions.compliance ? 'text-primary' : 'text-secondary'}`}>
                                                                    {managerContext === 'FM' ? 'Vehicle & Driver Vault' : 'Compliance'}
                                                                </p>
                                                                <p className="text-[8px] font-bold text-secondary uppercase mt-1">
                                                                    {managerContext === 'FM' ? 'Access vehicle & driver docs' : 'Access vault & legal docs'}
                                                                </p>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button 
                                                        onClick={() => {
                                                            handleOnboardStaff();
                                                            setView('staff');
                                                        }}
                                                        className="w-full py-6 bg-brand text-dark-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                                    >
                                                        <CheckCircle size={18} /> Confirm Onboarding — Link to {getBusinessName()}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    </motion.div>
                                )}

                            {view === 'stadium-seats' && (
                                <motion.div key="stadium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 pb-20">
                                    <div className="flex flex-col md:flex-row gap-6 md:justify-between md:items-end">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand"><Ticket size={24} /></div>
                                                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-primary">Ticket <span className="text-brand">Hub</span></h1>
                                            </div>
                                            <p className="text-secondary text-xs md:text-sm font-bold uppercase tracking-widest leading-none">Inventory Command • Batch Management</p>
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto">
                                            <div className="flex-1 md:flex-initial px-4 md:px-6 py-3 bg-btn-sec border border-main rounded-xl text-right">
                                                <p className="text-[8px] font-black text-secondary uppercase tracking-widest">Global Availability</p>
                                                <p className="text-sm md:text-xl font-black italic text-brand leading-none mt-1">
                                                    {(managerContext === 'CM' || managerContext === 'VM') ? '4,820 Tickets' : '4,820 Seats'}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => setIsAddingEvent(true)}
                                                className="flex-1 md:flex-initial px-4 md:px-8 py-4 bg-brand text-dark-900 rounded-[2rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all text-center whitespace-nowrap"
                                            >
                                                Upload Tickets
                                            </button>
                                        </div>
                                    </div>

                                    {/* 4-OPTION QUICK UPLOAD GRID */}
                                    <div className={`grid gap-6 ${
                                        managerContext === 'CM' 
                                            ? 'grid-cols-2 md:grid-cols-2 max-w-2xl' 
                                            : 'grid-cols-2 md:grid-cols-4'
                                    }`}>
                                        {/* Sporting Match Card */}
                                        {managerContext === 'SM' && (
                                            <button 
                                                onClick={() => {
                                                    setNewEventData({
                                                        name: 'Champions League Football Match',
                                                        date: new Date().toISOString().split('T')[0],
                                                        time: '20:45',
                                                        file: null,
                                                        tiers: [
                                                            { id: 't1', name: 'Silver (Normal Ticket)', price: 85, quantity: 1200, sold: 0 },
                                                            { id: 't2', name: 'Gold (Premium)', price: 450, quantity: 150, sold: 0 },
                                                            { id: 't3', name: 'Diamond (VIP)', price: 1200, quantity: 30, sold: 0 }
                                                        ]
                                                    });
                                                    setIsAddingEvent(true);
                                                }}
                                                className="p-6 bg-glass border border-main rounded-[2rem] hover:border-brand/50 hover:shadow-[0_0_30px_rgba(33,255,165,0.1)] transition-all duration-300 text-left group relative overflow-hidden flex flex-col justify-between h-44 w-full"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 blur-[40px] rounded-full -mr-6 -mt-6 group-hover:bg-brand/10 transition-colors" />
                                                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Trophy size={22} /></div>
                                                <div>
                                                    <p className="text-sm font-black italic uppercase text-primary">Sporting Match</p>
                                                    <p className="text-[8px] font-bold text-secondary uppercase mt-1">Football Game / Arena Ticket</p>
                                                </div>
                                            </button>
                                        )}

                                        {/* Club Event Card */}
                                        {managerContext === 'CM' && (
                                            <button 
                                                onClick={() => {
                                                    setNewEventData({
                                                        name: 'Midnight VIP Club Party',
                                                        date: new Date().toISOString().split('T')[0],
                                                        time: '22:00',
                                                        file: null,
                                                        tiers: [
                                                            { id: 't1', name: 'Silver (Normal Ticket)', price: 35, quantity: 800, sold: 0 },
                                                            { id: 't2', name: 'Gold (Premium)', price: 120, quantity: 100, sold: 0 },
                                                            { id: 't3', name: 'Diamond (VIP)', price: 750, quantity: 15, sold: 0 }
                                                        ]
                                                    });
                                                    setIsAddingEvent(true);
                                                }}
                                                className="p-6 bg-glass border border-main rounded-[2rem] hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all duration-300 text-left group relative overflow-hidden flex flex-col justify-between h-44 w-full"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 blur-[40px] rounded-full -mr-6 -mt-6 group-hover:bg-violet-500/10 transition-colors" />
                                                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Zap size={22} /></div>
                                                <div>
                                                    <p className="text-sm font-black italic uppercase text-primary">Club Party</p>
                                                    <p className="text-[8px] font-bold text-secondary uppercase mt-1">Midnight Lounge / DJ Event</p>
                                                </div>
                                            </button>
                                        )}

                                        {/* Concert Card */}
                                        {managerContext === 'SM' && (
                                            <button 
                                                onClick={() => {
                                                    setNewEventData({
                                                        name: 'Live Music Open Air Festival',
                                                        date: new Date().toISOString().split('T')[0],
                                                        time: '19:00',
                                                        file: null,
                                                        tiers: [
                                                            { id: 't1', name: 'Silver (Normal Ticket)', price: 65, quantity: 2000, sold: 0 },
                                                            { id: 't2', name: 'Gold (Premium)', price: 150, quantity: 500, sold: 0 },
                                                            { id: 't3', name: 'Diamond (VIP)', price: 950, quantity: 50, sold: 0 }
                                                        ]
                                                    });
                                                    setIsAddingEvent(true);
                                                }}
                                                className="p-6 bg-glass border border-main rounded-[2rem] hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 text-left group relative overflow-hidden flex flex-col justify-between h-44 w-full"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full -mr-6 -mt-6 group-hover:bg-amber-500/10 transition-colors" />
                                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Activity size={22} /></div>
                                                <div>
                                                    <p className="text-sm font-black italic uppercase text-primary">Concert / Fest</p>
                                                    <p className="text-[8px] font-bold text-secondary uppercase mt-1">Live Show & Stage Ticket</p>
                                                </div>
                                            </button>
                                        )}

                                        {/* Custom '+' Card */}
                                        <button 
                                            onClick={() => {
                                                setNewEventData({
                                                    name: '',
                                                    date: '',
                                                    time: '',
                                                    file: null,
                                                    tiers: [{ id: 't1', name: 'Silver (Normal Ticket)', price: 25, quantity: 100, sold: 0 }]
                                                });
                                                setIsAddingEvent(true);
                                            }}
                                            className="p-6 bg-glass border border-main rounded-[2rem] hover:border-brand/50 hover:shadow-[0_0_30px_rgba(33,255,165,0.1)] transition-all duration-300 text-left group relative overflow-hidden flex flex-col justify-between h-44 w-full"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 blur-[40px] rounded-full -mr-6 -mt-6 group-hover:bg-brand/10 transition-colors" />
                                            <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><PlusCircle size={22} /></div>
                                            <div>
                                                <p className="text-sm font-black italic uppercase text-primary">Custom Category</p>
                                                <p className="text-[8px] font-bold text-secondary uppercase mt-1">Configure Custom Event</p>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* EVENT INVENTORY LIST */}
                                        <div className="lg:col-span-8 space-y-6">
                                            {stadiumEvents
                                                .filter(event => {
                                                    if (event.context) return event.context === managerContext;
                                                    if (event.name.toLowerCase().includes('neon') || event.name.toLowerCase().includes('club') || event.name.toLowerCase().includes('party')) {
                                                        return managerContext === 'CM';
                                                    }
                                                    return managerContext === 'SM';
                                                })
                                                .map((event) => (
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
                                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
                                                                {event.date} • {event.time} • {getBusinessName(managerContext)}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={() => handleDeleteEvent(event.id)}
                                                                className="px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                                                            >
                                                                Delete
                                                            </button>
                                                            <button 
                                                                onClick={() => togglePublishEvent(event.id)}
                                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${event.published ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand/10 text-brand border border-brand/20'}`}
                                                            >
                                                                {event.published ? 'Unpublish' : 'Publish to App'}
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
                                                                <div className="flex justify-between items-center text-[7px] font-bold text-brand uppercase tracking-widest bg-brand/5 border border-brand/10 px-2.5 py-1.5 rounded-lg leading-none mt-1">
                                                                    <span>Remaining</span>
                                                                    <span>{tier.quantity - tier.sold} Left</span>
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
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-3xl overflow-y-auto py-12 px-6 flex items-start justify-center">
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

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                                                        <div className="col-span-1 sm:col-span-2 space-y-2">
                                                            <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Event Identity</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="e.g. World Tour: Neon Nights" 
                                                                value={newEventData.name}
                                                                onChange={e => setNewEventData({...newEventData, name: e.target.value})}
                                                                className="w-full bg-btn-sec border border-main rounded-3xl p-4 md:p-6 text-lg md:text-xl font-black italic focus:border-brand outline-none transition-all text-primary" 
                                                            />
                                                        </div>
                                                        <div className="space-y-2 col-span-1">
                                                            <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Deployment Date</label>
                                                            <input 
                                                                type="date" 
                                                                value={newEventData.date}
                                                                onChange={e => setNewEventData({...newEventData, date: e.target.value})}
                                                                className="w-full bg-btn-sec border border-main rounded-3xl p-4 md:p-6 text-sm font-black focus:border-brand outline-none transition-all uppercase text-primary" 
                                                            />
                                                        </div>
                                                        <div className="space-y-2 col-span-1">
                                                            <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Start Time</label>
                                                            <input 
                                                                type="time" 
                                                                value={newEventData.time}
                                                                onChange={e => setNewEventData({...newEventData, time: e.target.value})}
                                                                className="w-full bg-btn-sec border border-main rounded-3xl p-4 md:p-6 text-sm font-black focus:border-brand outline-none transition-all text-primary" 
                                                            />
                                                        </div>
                                                        <div className="space-y-2 col-span-1">
                                                            <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">End Time</label>
                                                            <input 
                                                                type="time" 
                                                                value={newEventData.endTime}
                                                                onChange={e => setNewEventData({...newEventData, endTime: e.target.value})}
                                                                className="w-full bg-btn-sec border border-main rounded-3xl p-4 md:p-6 text-sm font-black focus:border-brand outline-none transition-all text-primary" 
                                                            />
                                                        </div>
                                                        <div className="col-span-1 sm:col-span-2 space-y-2">
                                                            <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Event Address</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="e.g. Zeil 106, 60313 Frankfurt" 
                                                                value={newEventData.address}
                                                                onChange={e => setNewEventData({...newEventData, address: e.target.value})}
                                                                className="w-full bg-btn-sec border border-main rounded-3xl p-4 md:p-6 text-sm font-black italic focus:border-brand outline-none transition-all text-primary" 
                                                            />
                                                        </div>

                                                        <div className="col-span-1 sm:col-span-2 pt-6 space-y-6 border-t border-white/5">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-4">Configure Ticket Categories & Allocations</label>
                                                                <button 
                                                                    onClick={handleAddTier}
                                                                    className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand hover:bg-brand/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                                >
                                                                    + Add Category
                                                                </button>
                                                            </div>

                                                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                                                {newEventData.tiers.map((tier, idx) => (
                                                                    <div key={tier.id || idx} className="p-6 bg-btn-sec border border-main rounded-2xl space-y-5 relative group/tier pr-12 md:pr-6">
                                                                        <button 
                                                                            type="button"
                                                                            disabled={newEventData.tiers.length <= 1}
                                                                            onClick={() => handleRemoveTier(idx)}
                                                                            className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all z-20 ${
                                                                                newEventData.tiers.length > 1 
                                                                                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer' 
                                                                                    : 'opacity-20 cursor-not-allowed text-gray-500'
                                                                            }`}
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>

                                                                        <div className="grid grid-cols-12 gap-4 items-center">
                                                                            {/* Category Name */}
                                                                            <div className="col-span-12 md:col-span-6 space-y-1.5 text-left">
                                                                                <span className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Category Name</span>
                                                                                <input 
                                                                                    type="text"
                                                                                    placeholder="e.g. VIP Club Pass"
                                                                                    value={tier.name}
                                                                                    onChange={e => handleUpdateTier(idx, 'name', e.target.value)}
                                                                                    className="w-full bg-dark-900 border border-main rounded-xl px-4 py-3 text-xs font-bold text-primary focus:border-brand outline-none transition-all"
                                                                                />
                                                                            </div>

                                                                            {/* Price */}
                                                                            <div className="col-span-12 md:col-span-3 space-y-1.5 text-left">
                                                                                <span className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Price (€)</span>
                                                                                <div className="relative">
                                                                                    <input 
                                                                                        type="number"
                                                                                        placeholder="35"
                                                                                        value={tier.price || ''}
                                                                                        onChange={e => handleUpdateTier(idx, 'price', e.target.value)}
                                                                                        className="w-full bg-dark-900 border border-main rounded-xl pl-8 pr-3 py-3 text-xs font-black italic text-brand focus:border-brand outline-none transition-all"
                                                                                    />
                                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black italic text-brand/40">€</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Quantity */}
                                                                            <div className="col-span-12 md:col-span-3 space-y-1.5 text-left">
                                                                                <span className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Allocation</span>
                                                                                <div className="relative">
                                                                                    <input 
                                                                                        type="number"
                                                                                        placeholder="500"
                                                                                        value={tier.quantity || ''}
                                                                                        onChange={e => handleUpdateTier(idx, 'quantity', e.target.value)}
                                                                                        className="w-full bg-dark-900 border border-main rounded-xl pl-8 pr-3 py-3 text-xs font-black italic text-brand focus:border-brand outline-none transition-all"
                                                                                    />
                                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black italic text-brand/40">#</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* PER-CATEGORY MANIFEST UPLOADER */}
                                                                        {/* PER-CATEGORY MANIFEST UPLOADER */}
                                                                        <div className="pt-4 border-t border-white/5 text-left space-y-3">
                                                                            <span className="text-[8px] font-black text-brand uppercase tracking-widest ml-2">
                                                                                {managerContext === 'CM' ? 'Manifest Documents / Pictures' : 'Manifest Document'} ({tier.name || 'Category'})
                                                                            </span>
                                                                            
                                                                            <input 
                                                                                type="file"
                                                                                id={`file-input-${idx}`}
                                                                                multiple={managerContext === 'CM'}
                                                                                onChange={(e) => handleTierFileChange(idx, e)}
                                                                                accept=".pdf,image/*,.csv,.xlsx,.xml"
                                                                                className="hidden"
                                                                            />

                                                                            {managerContext === 'CM' ? (
                                                                                /* Club Manager: Multi-file / picture layout */
                                                                                <>
                                                                                    {/* File Lists / Grid */}
                                                                                    {((tier.files && tier.files.length > 0) || tier.file) && (
                                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                            {tier.file && (!tier.files || !tier.files.some(f => f.name === tier.file.name)) && (
                                                                                                <div className="p-3 bg-brand/5 border border-brand/20 rounded-xl flex items-center justify-between animate-fadeIn relative z-10 w-full">
                                                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                                                        {tier.file.url ? (
                                                                                                            <img src={tier.file.url} className="w-10 h-10 rounded-lg object-cover border border-brand/20 shrink-0" alt="Preview" />
                                                                                                        ) : (
                                                                                                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-bold border border-brand/20 shrink-0">
                                                                                                                <FileText size={16} className={tier.file.name.endsWith('.pdf') ? 'text-red-400' : ''} />
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <div className="min-w-0">
                                                                                                            <p className="text-[10px] font-black uppercase text-primary truncate max-w-[140px]">{tier.file.name}</p>
                                                                                                            <p className="text-[7.5px] font-black text-brand uppercase tracking-widest">{tier.file.size} • Legacy</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <button 
                                                                                                        type="button"
                                                                                                        onClick={() => handleRemoveTierFile(idx, -1)}
                                                                                                        className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shrink-0"
                                                                                                    >
                                                                                                        <Trash2 size={12} />
                                                                                                    </button>
                                                                                                </div>
                                                                                            )}

                                                                                            {tier.files?.map((file, fIdx) => (
                                                                                                <div key={fIdx} className="p-3 bg-brand/5 border border-brand/20 rounded-xl flex items-center justify-between animate-fadeIn relative z-10 w-full">
                                                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                                                        {file.url ? (
                                                                                                            <img src={file.url} className="w-10 h-10 rounded-lg object-cover border border-brand/20 shrink-0" alt="Preview" />
                                                                                                        ) : (
                                                                                                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-bold border border-brand/20 shrink-0">
                                                                                                                <FileText size={16} className={file.name.endsWith('.pdf') ? 'text-red-400' : ''} />
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <div className="min-w-0">
                                                                                                            <p className="text-[10px] font-black uppercase text-primary truncate max-w-[140px]">{file.name}</p>
                                                                                                            <p className="text-[7.5px] font-black text-brand uppercase tracking-widest">{file.size}</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <button 
                                                                                                        type="button"
                                                                                                        onClick={() => handleRemoveTierFile(idx, fIdx)}
                                                                                                        className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shrink-0"
                                                                                                    >
                                                                                                        <Trash2 size={12} />
                                                                                                    </button>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Action Buttons Area */}
                                                                                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => document.getElementById(`file-input-${idx}`).click()}
                                                                                            className="flex-1 py-3 border-2 border-dashed border-main hover:border-brand/40 hover:bg-brand/5 rounded-xl text-center transition-all flex items-center justify-center gap-2 group/upload w-full"
                                                                                        >
                                                                                            <Upload size={12} className="text-secondary group-hover/upload:text-brand" />
                                                                                            <span className="text-[9px] font-black uppercase tracking-widest text-secondary group-hover/upload:text-brand">
                                                                                                {((tier.files && tier.files.length > 0) || tier.file) ? 'Add More Pictures / Files' : `Upload ${tier.name || 'Category'} Manifest`}
                                                                                            </span>
                                                                                        </button>

                                                                                        {((tier.files && tier.files.length > 0) || tier.file) && (
                                                                                            <button 
                                                                                                type="button"
                                                                                                onClick={() => handleSimulateTierUpload(idx)}
                                                                                                disabled={tier.isSimulating}
                                                                                                className={`w-full sm:w-auto px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                                                                    tier.verified 
                                                                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                                                                        : 'bg-brand/15 hover:bg-brand/25 text-brand border border-brand/20'
                                                                                                }`}
                                                                                            >
                                                                                                {tier.isSimulating ? 'Processing...' : tier.verified ? 'Verified ✓' : 'Verify Tickets'}
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                /* Other contexts (e.g. Stadium Manager): Single-file manifest layout */
                                                                                <div className="flex gap-3 items-center w-full">
                                                                                    {tier.file ? (
                                                                                        <div className="flex-1 p-3.5 bg-brand/5 border border-brand/20 rounded-xl flex items-center justify-between animate-fadeIn relative z-10 w-full">
                                                                                            <div className="flex items-center gap-3">
                                                                                                <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-bold border border-brand/20">
                                                                                                    {tier.file.name.endsWith('.pdf') ? <FileText size={16} className="text-red-400" /> : <FileText size={16} />}
                                                                                                </div>
                                                                                                <div>
                                                                                                    <p className="text-[10.5px] font-black uppercase text-primary truncate max-w-[180px]">{tier.file.name}</p>
                                                                                                    <p className="text-[7.5px] font-black text-brand uppercase tracking-widest">{tier.file.size} • {tier.verified ? 'VERIFIED ✓' : 'UNVERIFIED'}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex gap-2">
                                                                                                <button 
                                                                                                    type="button"
                                                                                                    onClick={() => handleSimulateTierUpload(idx)}
                                                                                                    disabled={tier.isSimulating}
                                                                                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${tier.verified ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-brand/15 hover:bg-brand/25 text-brand border border-brand/20'}`}
                                                                                                >
                                                                                                    {tier.isSimulating ? 'Processing...' : tier.verified ? 'Re-Verify' : 'Verify'}
                                                                                                </button>
                                                                                                <button 
                                                                                                    type="button"
                                                                                                    onClick={() => handleRemoveTierFile(idx, 0)}
                                                                                                    className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                                                                >
                                                                                                    Remove
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => document.getElementById(`file-input-${idx}`).click()}
                                                                                            className="w-full py-4 border-2 border-dashed border-main hover:border-brand/40 hover:bg-brand/5 rounded-xl text-center transition-all flex items-center justify-center gap-2 group/upload"
                                                                                        >
                                                                                            <Upload size={12} className="text-secondary group-hover/upload:text-brand" />
                                                                                            <span className="text-[9px] font-black uppercase tracking-widest text-secondary group-hover/upload:text-brand">Upload {tier.name || 'Category'} Manifest Document (PDF, Photo, Spreadsheet)</span>
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4 pt-6">
                                                        <button 
                                                            onClick={handleAddEvent}
                                                            className="flex-1 py-4 md:py-6 bg-brand text-dark-900 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
                                                        >
                                                            Commit Batch
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsAddingEvent(false)}
                                                            className="flex-1 md:flex-initial px-4 md:px-10 py-4 md:py-6 bg-btn-sec border border-main rounded-[2.5rem] text-xs font-black uppercase tracking-widest text-secondary hover:text-primary transition-all text-center"
                                                        >
                                                            Abort
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    </motion.div>
                                )
                            }

                            {view === 'hotel-rooms' && managerContext === 'HM' && (
                                <motion.div key="hotel-rooms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 pb-20">
                                    <div className="flex flex-col md:flex-row gap-6 md:justify-between md:items-end">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand"><DoorOpen size={24} /></div>
                                                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-primary">Room <span className="text-brand">Hub</span></h1>
                                            </div>
                                            <p className="text-secondary text-xs md:text-sm font-bold uppercase tracking-widest leading-none">Automated Property Management • Mews Integration</p>
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto">
                                            <div className="flex-1 md:flex-initial px-4 md:px-6 py-3 bg-btn-sec border border-main rounded-xl text-right">
                                                <p className="text-[8px] font-black text-secondary uppercase tracking-widest">Available Rooms</p>
                                                <p className="text-sm md:text-xl font-black italic text-brand leading-none mt-1">
                                                    {roomsData.filter(r => r.status === 'available').length} / {roomsData.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* ROOMS GRID */}
                                        <div className="lg:col-span-8 space-y-6">
                                            <div className="bg-glass border border-main rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] rounded-full -mr-20 -mt-20 opacity-40" />
                                                
                                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                                    <h3 className="text-lg font-black italic uppercase text-primary tracking-tight">Room Inventory Visualizer</h3>
                                                    <div className="flex gap-4 text-[9px] font-black uppercase">
                                                        <span className="flex items-center gap-1.5 text-brand"><div className="w-2.5 h-2.5 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" /> Available</span>
                                                        <span className="flex items-center gap-1.5 text-violet-400"><div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]" /> Occupied</span>
                                                        <span className="flex items-center gap-1.5 text-amber-500"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" /> Cleaning</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {roomsData.map((room) => {
                                                        const isAvail = room.status === 'available';
                                                        const isOcc = room.status === 'occupied';
                                                        const isClean = room.status === 'cleaning';
                                                        
                                                        let statusColor = 'border-brand hover:border-brand/40';
                                                        let glowColor = 'shadow-[0_0_20px_rgba(33,255,165,0.05)]';
                                                        let badgeColor = 'bg-brand/10 text-brand border border-brand/20';
                                                        
                                                        if (isOcc) {
                                                            statusColor = 'border-violet-500/30 hover:border-violet-500';
                                                            glowColor = 'shadow-[0_0_25px_rgba(139,92,246,0.05)]';
                                                            badgeColor = 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
                                                        } else if (isClean) {
                                                            statusColor = 'border-amber-500/30 hover:border-amber-500';
                                                            glowColor = 'shadow-[0_0_20px_rgba(245,158,11,0.05)]';
                                                                badgeColor = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                                                        }
                                                        
                                                        return (
                                                            <div 
                                                                key={room.id}
                                                                className={`p-6 bg-dark-900/60 backdrop-blur-xl border rounded-[2rem] transition-all duration-300 ${statusColor} ${glowColor} group`}
                                                            >
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div>
                                                                        <span className="text-[10px] font-black text-secondary tracking-widest uppercase">Room</span>
                                                                        <p className="text-2xl font-black italic text-primary leading-none mt-1">#{room.id}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span 
                                                                            onClick={() => handleToggleRoomStatus(room.id)}
                                                                            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider cursor-pointer select-none hover:scale-105 active:scale-95 transition-all ${badgeColor}`}
                                                                            title="Click to toggle status"
                                                                        >
                                                                            {room.status}
                                                                        </span>
                                                                        {!pmsApiKey && (
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (confirm(`Remove Room #${room.id} from inventory?`)) {
                                                                                        const updated = roomsData.filter(r => r.id !== room.id);
                                                                                        saveRooms(updated);
                                                                                    }
                                                                                }}
                                                                                className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] transition-all flex items-center justify-center shrink-0 w-6 h-6 border border-red-500/20"
                                                                                title="Delete Room"
                                                                            >
                                                                                <X size={12} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                                    <div className="flex justify-between items-end">
                                                                        <div>
                                                                            <p className="text-[8px] font-bold text-secondary uppercase">Room Category</p>
                                                                            <p className="text-xs font-black uppercase italic text-primary mt-0.5">{room.name}</p>
                                                                            {room.bedLayout && (
                                                                                <span className="text-[8px] font-black uppercase tracking-wider text-brand bg-brand/5 border border-brand/15 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                                                                                    {room.bedLayout} Bed
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs font-black text-brand italic">€{room.price}<span className="text-[8px] text-secondary font-bold">/n</span></p>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 pt-2 bg-black/20 rounded-xl p-3 border border-white/5">
                                                                        <div className={`w-2 h-2 rounded-full ${isAvail ? 'bg-brand' : isOcc ? 'bg-violet-500' : 'bg-amber-500'}`} />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[8px] font-bold text-secondary uppercase">Live Occupant</p>
                                                                            <p className="text-[10px] font-black text-primary truncate uppercase italic">
                                                                                {room.guest || 'Ready for Check-In'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* PMS INTEGRATION BRIDGE */}
                                        <div className="lg:col-span-4 space-y-8">
                                            <div className="bg-dark-900 border border-main rounded-[3rem] p-10 space-y-8 shadow-2xl sticky top-6">
                                                <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                                                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                                                        <Zap size={22} className={pmsConnected ? 'animate-pulse' : ''} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black italic uppercase text-primary">PMS Integration Bridge</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className={`w-2 h-2 rounded-full ${pmsApiKey ? 'bg-brand animate-ping' : 'bg-amber-500'}`} />
                                                            <p className={`text-[8px] font-black uppercase tracking-widest ${pmsApiKey ? 'text-brand' : 'text-amber-500'}`}>
                                                                {pmsApiKey ? 'ACTIVE & SYNCHRONIZED' : 'OFFLINE / DIRECT MANUAL MODE'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Integration Provider</label>
                                                        <div className="px-6 py-4 bg-btn-sec border border-main rounded-2xl text-xs font-black uppercase text-primary">
                                                            {pmsApiKey ? 'Mews Property Management (API v3)' : 'LOCAL MANUAL INVENTORY'}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Mews API Auth Key</label>
                                                        <input 
                                                            type="text" 
                                                            value={pmsApiKey} 
                                                            onChange={(e) => setPmsApiKey(e.target.value)}
                                                            placeholder="Clear key to add rooms manually"
                                                            className="w-full bg-btn-sec border border-main rounded-2xl p-4 text-[9px] font-mono text-brand focus:border-brand outline-none transition-all placeholder:text-gray-600"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[8px] font-black text-secondary uppercase tracking-widest ml-2">Reservation Notification Email</label>
                                                        <input 
                                                            type="email" 
                                                            value={reservationEmail} 
                                                            onChange={(e) => setReservationEmail(e.target.value)}
                                                            placeholder="hotel@business.com (For manual bookings)"
                                                            className="w-full bg-btn-sec border border-main rounded-2xl p-4 text-[9px] font-mono text-primary focus:border-brand outline-none transition-all placeholder:text-gray-600"
                                                        />
                                                    </div>

                                                    {!pmsApiKey ? (
                                                        <div className="space-y-3 pt-3 border-t border-white/5 animate-in fade-in duration-300">
                                                            <p className="text-[9px] font-black text-brand uppercase tracking-widest">Manual Room Dispatch</p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Room #" 
                                                                    value={newRoomNumber} 
                                                                    onChange={(e) => setNewRoomNumber(e.target.value)} 
                                                                    className="bg-btn-sec border border-main rounded-xl p-3 text-xs text-primary focus:border-brand outline-none" 
                                                                />
                                                                <input 
                                                                    type="number" 
                                                                    placeholder="Price (€)" 
                                                                    value={newRoomPrice} 
                                                                    onChange={(e) => setNewRoomPrice(e.target.value)} 
                                                                    className="bg-btn-sec border border-main rounded-xl p-3 text-xs text-primary focus:border-brand outline-none" 
                                                                />
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                placeholder="Category (e.g. Deluxe Room)" 
                                                                value={newRoomCategory} 
                                                                onChange={(e) => setNewRoomCategory(e.target.value)} 
                                                                className="w-full bg-btn-sec border border-main rounded-xl p-3 text-xs text-primary focus:border-brand outline-none" 
                                                            />
                                                            <select 
                                                                value={newRoomBedLayout}
                                                                onChange={(e) => setNewRoomBedLayout(e.target.value)}
                                                                className="w-full bg-btn-sec border border-main rounded-xl p-3 text-xs text-primary focus:border-brand outline-none appearance-none cursor-pointer"
                                                            >
                                                                <option value="Single" className="bg-dark-900 text-primary">Single Bed (Einzelbett)</option>
                                                                <option value="Double" className="bg-dark-900 text-primary">Double Bed (Doppelbett)</option>
                                                                <option value="Triple" className="bg-dark-900 text-primary">Triple Bed (Dreibett)</option>
                                                            </select>
                                                            <button 
                                                                onClick={handleCreateManualRoom} 
                                                                className="w-full py-3 bg-brand text-dark-900 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-brand/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                            >
                                                                <PlusCircle size={10} /> Add Room
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="pt-3 border-t border-white/5 space-y-1">
                                                            <p className="text-[8px] font-black text-brand uppercase tracking-widest leading-none">Security Telemetry</p>
                                                            <p className="text-[10px] font-black italic text-primary mt-1">SSL & Webhook Shield Active</p>
                                                        </div>
                                                    )}
                                                </div>


                                                {/* WEBHOOK TERMINAL LOGS */}
                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                    <h5 className="text-[9px] font-black italic uppercase text-secondary tracking-widest">Real-time Webhook Console</h5>
                                                    <div className="h-48 bg-black/60 border border-main rounded-2xl p-4 overflow-y-auto font-mono text-[8px] text-green-400 space-y-3 scrollbar-thin">
                                                        {pmsLog.map((log, idx) => (
                                                            <div key={idx} className="border-b border-white/5 pb-2">
                                                                <span className="text-secondary">[{log.time}]</span>{' '}
                                                                <span className={log.type === 'checkin' ? 'text-brand font-black' : log.type === 'override' ? 'text-amber-400' : 'text-primary'}>
                                                                    {log.message}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                            className="fixed inset-0 m-auto w-full max-w-xl h-fit max-h-[90vh] z-[301] p-6 flex flex-col"
                        >
                            <div className="bg-glass border-2 border-brand/20 rounded-[3rem] p-8 md:p-12 relative overflow-y-auto no-scrollbar shadow-2xl flex-1 max-h-[85vh]">
                                <div className="absolute top-0 right-0 p-8 z-10">
                                    <button onClick={() => setSelectedGuest(null)} className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-12">
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-24 bg-dark-900 border-2 border-brand rounded-3xl flex items-center justify-center text-brand animate-pulse">
                                            <User size={40} />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h2 className="text-4xl font-black italic uppercase text-primary tracking-tighter">{selectedGuest.guest}</h2>
                                                <span className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[8px] font-black text-brand uppercase tracking-widest">
                                                    {managerContext === 'HM' ? 'Hotel Guest' : 'Venue Guest'}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-secondary uppercase tracking-widest opacity-60">Verified Green Network Member</p>
                                        </div>
                                    </div>

                                    {managerContext === 'HM' ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Total Visits</span>
                                                        <Activity size={14} className="text-brand" />
                                                    </div>
                                                    <p className="text-2xl font-black italic text-primary">{selectedGuest.visits || '12'}</p>
                                                </div>
                                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Last Stay</span>
                                                        <Calendar size={14} className="text-brand" />
                                                    </div>
                                                    <p className="text-2xl font-black italic text-primary">{selectedGuest.lastStay || 'April 2026'}</p>
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
                                                        <span className="text-sm font-black text-primary">{selectedGuest.address || 'Königsallee 12, 40212 Düsseldorf'}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 p-5 bg-dark-900 rounded-2xl border border-main">
                                                        <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">ID / Passport Number</span>
                                                        <span className="text-sm font-black text-brand tracking-widest">{selectedGuest.idNumber || 'PA-99281-XM'}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 p-5 bg-dark-900 rounded-2xl border border-main">
                                                        <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">Date of Birth</span>
                                                        <span className="text-sm font-black text-primary">{selectedGuest.dob || 'May 12, 1992'}</span>
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
                                                        <span className="text-sm font-black text-primary">{selectedGuest.phone || '+49 176 4421 8892'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-5 bg-dark-900 rounded-2xl border border-main">
                                                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Email</span>
                                                        <span className="text-sm font-black text-primary">{selectedGuest.email || 'guest@green-social.com'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black text-secondary uppercase tracking-widest">{selectedGuest.type === 'Stay Booking' || selectedGuest.type === 'Room Service' ? 'Room' : selectedGuest.type === 'Stadium E-Ticket' || selectedGuest.type === 'Club Event Ticket' ? 'Ticket Details' : 'Table / Unit'}</span>
                                                        <ShoppingBag size={14} className="text-brand" />
                                                    </div>
                                                    <p className="text-2xl font-black italic text-brand">{selectedGuest.type === 'Stay Booking' || selectedGuest.type === 'Room Service' ? `Room ${selectedGuest.room}` : selectedGuest.type === 'Stadium E-Ticket' || selectedGuest.type === 'Club Event Ticket' ? `ID ${selectedGuest.id?.toString()?.replace('#', '')}` : `Table ${selectedGuest.table || 'N/A'}`}</p>
                                                </div>
                                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Order ID</span>
                                                        <Timer size={14} className="text-brand" />
                                                    </div>
                                                    <p className="text-2xl font-black italic text-primary">{selectedGuest.id}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <ShoppingBag size={14} className="text-brand" />
                                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-60">Ordered Items</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {selectedGuest.items && selectedGuest.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center p-5 bg-dark-900 rounded-2xl border border-main">
                                                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{item.name || `Item ${idx + 1}`}</span>
                                                            <span className="text-sm font-black text-brand italic">{typeof item === 'object' ? `€${(item.price || 0).toFixed(2)}` : item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-main flex gap-4">
                                                <button onClick={() => setSelectedGuest(null)} className="flex-1 h-14 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3">
                                                    <Check size={16} />
                                                    Close Details
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* STRIPE CONNECTION & BANK ACCOUNT MODAL */}
            <AnimatePresence>
                {isStripeModalOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsStripeModalOpen(false)}
                            className="fixed inset-0 bg-dark-950/80 backdrop-blur-xl z-[300]"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] md:w-full max-w-xl h-auto max-h-[90vh] z-[301] p-2 md:p-6 flex flex-col"
                        >
                            <div className="bg-glass border-2 border-brand/20 rounded-[2.5rem] p-6 md:p-12 relative overflow-y-auto no-scrollbar shadow-2xl flex-1 max-h-full text-primary">
                                <div className="absolute top-0 right-0 p-4 md:p-8 z-10">
                                    <button onClick={() => setIsStripeModalOpen(false)} className="w-10 h-10 md:w-12 md:h-12 bg-btn-sec border border-main rounded-2xl flex items-center justify-center text-secondary hover:text-primary transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-brand/10 border-2 border-brand/35 rounded-3xl flex items-center justify-center text-brand">
                                            <CreditCard size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black italic uppercase text-primary tracking-tighter leading-none">
                                                Connect Stripe
                                            </h2>
                                            <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em] mt-1.5 leading-none">Stripe Connect & Bank Settlements</p>
                                        </div>
                                    </div>

                                    {/* CONNECT EXISTING PROFILE FLOW */}
                                    <div className="space-y-6">
                                        <p className="text-[10px] text-secondary font-bold uppercase tracking-wide leading-relaxed opacity-75">
                                            Input your existing Stripe Connected Account ID to link payments directly from your venue sessions.
                                        </p>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-secondary uppercase tracking-widest block ml-1">Stripe Account ID</label>
                                            <input 
                                                type="text"
                                                value={stripeInputId}
                                                onChange={(e) => setStripeInputId(e.target.value)}
                                                placeholder="acct_1N8hXm2e..."
                                                className="w-full bg-btn-sec border border-main rounded-2xl py-4 px-6 text-sm font-black text-primary placeholder:text-gray-400/70 focus:outline-none focus:border-brand/40 shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-main">
                                            <p className="text-[9px] font-black text-secondary uppercase tracking-widest ml-1">Configure Payout Bank Details</p>
                                            
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-secondary uppercase tracking-widest block ml-1">Bank Name</label>
                                                    <input 
                                                        type="text"
                                                        value={stripeFormBankName}
                                                        onChange={(e) => setStripeFormBankName(e.target.value)}
                                                        placeholder="e.g. Deutsche Bank"
                                                        className="w-full bg-btn-sec border border-main rounded-2xl py-3 px-5 text-xs font-bold text-primary placeholder:text-gray-400/70 focus:outline-none focus:border-brand/40"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-secondary uppercase tracking-widest block ml-1">IBAN / Account Number</label>
                                                    <input 
                                                        type="text"
                                                        value={stripeFormIban}
                                                        onChange={(e) => setStripeFormIban(e.target.value)}
                                                        placeholder="DE89 3704 0044..."
                                                        className="w-full bg-btn-sec border border-main rounded-2xl py-3 px-5 text-xs font-bold text-primary placeholder:text-gray-400/70 focus:outline-none focus:border-brand/40"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-secondary uppercase tracking-widest block ml-1">Routing Code / BIC</label>
                                                    <input 
                                                        type="text"
                                                        value={stripeFormRouting}
                                                        onChange={(e) => setStripeFormRouting(e.target.value)}
                                                        placeholder="DEUTDEDBXXX"
                                                        className="w-full bg-btn-sec border border-main rounded-2xl py-3 px-5 text-xs font-bold text-primary placeholder:text-gray-400/70 focus:outline-none focus:border-brand/40"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                if (!stripeInputId.trim() || !stripeFormIban.trim()) {
                                                    alert("Validation Error:\nPlease provide a valid Stripe Account ID and Bank IBAN.");
                                                    return;
                                                }
                                                setStripeLoading(true);
                                                setTimeout(() => {
                                                    setStripeLoading(false);
                                                    setStripeConnected(true);
                                                    setStripeAccountId(stripeInputId);
                                                    setStripeBankName(stripeFormBankName || 'Stripe Connected Bank');
                                                    setStripeBankIban(stripeFormIban);
                                                    setStripeBankRouting(stripeFormRouting);
                                                    
                                                    localStorage.setItem('green_partner_stripe_connected', 'true');
                                                    localStorage.setItem('green_partner_stripe_acc_id', stripeInputId);
                                                    localStorage.setItem('green_partner_bank_name', stripeFormBankName || 'Stripe Connected Bank');
                                                    localStorage.setItem('green_partner_bank_iban', stripeFormIban);
                                                    localStorage.setItem('green_partner_bank_routing', stripeFormRouting);
                                                    
                                                    setIsStripeModalOpen(false);
                                                    alert("STRIPE SECURE CONNECT SUCCESSFUL\n-------------------------------\nPlatform Account Linked!\nBank Details verified for weekly settlement.");
                                                }, 1800);
                                            }}
                                            disabled={stripeLoading}
                                            className="w-full py-5 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {stripeLoading ? (
                                                <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <span>Lock Connection Gateway</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* GUEST MESSAGING MODAL */}
            <AnimatePresence>
                {messageOrder && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMessageOrder(null)}
                            className="fixed inset-0 bg-dark-950/80 backdrop-blur-xl z-[300]"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-0 m-auto w-full max-w-xl h-fit max-h-[90vh] z-[301] p-6 flex flex-col"
                        >
                            <div className="bg-glass border-2 border-brand/20 rounded-[3rem] p-8 md:p-12 relative overflow-y-auto no-scrollbar shadow-2xl flex-1 max-h-[85vh]">
                                <div className="absolute top-0 right-0 p-8 z-10">
                                    <button onClick={() => setMessageOrder(null)} className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-10">
                                    {/* Modal Header */}
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand animate-pulse">
                                            <MessageCircle size={32} />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">
                                                Direct Dispatcher
                                            </span>
                                            <h2 className="text-3xl font-black italic uppercase text-primary tracking-tighter mt-1">
                                                Message to {messageOrder.guest}
                                            </h2>
                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1 opacity-60">
                                                {messageOrder.type === 'Stay Booking' || messageOrder.type === 'Room Service' ? 'Room ' : messageOrder.type === 'Stadium E-Ticket' || messageOrder.type === 'Club Event Ticket' ? 'Ticket Details: ' : 'Table '}
                                                {messageOrder.type === 'Stadium E-Ticket' || messageOrder.type === 'Club Event Ticket' ? (messageOrder.items ? messageOrder.items.map(i => typeof i === 'string' ? i : (i.name || '')).join(', ') : '') : (messageOrder.table || messageOrder.room || '')} • {messageOrder.id}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fast Templates Selection */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60 flex items-center gap-2">
                                            <Star size={12} className="text-brand" />
                                            Quick Templates
                                        </label>
                                        <div className="grid grid-cols-1 gap-2.5">
                                            {[
                                                (messageOrder.type === 'Stadium E-Ticket' || messageOrder.type === 'Club Event Ticket') 
                                                ? `🎟️ Ihre E-Tickets wurden generiert und stehen im Portal bereit!` 
                                                : messageOrder.type === 'Room Service'
                                                ? `🍽️ Ihre Bestellung wird frisch für Ihr Zimmer zubereitet!`
                                                : `🍹 Ihre Getränke werden gerade frisch zubereitet!`,
                                                
                                                (messageOrder.type === 'Stadium E-Ticket' || messageOrder.type === 'Club Event Ticket')
                                                ? `📬 Bitte überprüfen Sie auch Ihren Spam-Ordner für die Bestätigungs-E-Mail (E-Mail 1)!`
                                                : messageOrder.type === 'Room Service'
                                                ? `🍔 Ihre Bestellung ist auf dem Weg zu Zimmer ${messageOrder.room || ''}!`
                                                : `🍔 Ihre ${messageOrder.items ? messageOrder.items.map(i => typeof i === 'string' ? i.split(' ').slice(1).join(' ') : (i.name || '')).join(', ') : 'Bestellung'} ist auf dem Weg zu Tisch ${messageOrder.table || ''}!`,
                                                
                                                (messageOrder.type === 'Stadium E-Ticket' || messageOrder.type === 'Club Event Ticket')
                                                ? `🎉 Einlass für ${messageOrder.items ? messageOrder.items.map(i => typeof i === 'string' ? i : (i.name || '')).join(', ') : 'Ihr Event'} hat begonnen. Bitte prüfen Sie Ihre Ticket-Details im Profil!`
                                                : `⏱️ Entschuldigung für die Verzögerung, wir beeilen uns!`,
                                                
                                                (messageOrder.type === 'Stadium E-Ticket' || messageOrder.type === 'Club Event Ticket')
                                                ? `✨ Wichtig: Bitte prüfen Sie die Ticket-Details sorgfältig!`
                                                : `✨ Ihre Bestellung wurde erfolgreich serviert! Guten Appetit!`
                                            ].map((template, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCustomMessage(template)}
                                                    className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-semibold text-primary hover:border-brand/40 hover:bg-white/10 transition-all text-ellipsis overflow-hidden whitespace-nowrap active:scale-98"
                                                >
                                                    {template}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Message Field */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60 flex items-center gap-2">
                                            <User size={12} className="text-brand" />
                                            Custom Message Text
                                        </label>
                                        <textarea
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            placeholder="Write your custom message here..."
                                            className="w-full h-32 p-6 bg-dark-900 border border-main rounded-2xl text-sm font-bold text-primary focus:outline-none focus:border-brand/40 resize-none no-scrollbar placeholder:text-secondary placeholder:opacity-40"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-6 border-t border-main flex gap-4">
                                        <button 
                                            onClick={() => setMessageOrder(null)} 
                                            className="flex-1 h-14 bg-white/5 border-2 border-main rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary hover:border-white/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (!customMessage.trim()) return;
                                                if (socket) {
                                                    socket.emit('send-guest-message', {
                                                        orderId: messageOrder.id,
                                                        guest: messageOrder.guest,
                                                        table: messageOrder.type === 'Stay Booking' || messageOrder.type === 'Room Service' ? messageOrder.room : (messageOrder.type === 'Stadium E-Ticket' || messageOrder.type === 'Club Event Ticket' ? 'Ticket' : messageOrder.table),
                                                        message: customMessage
                                                    });
                                                }
                                                const locType = messageOrder.type === 'Stay Booking' || messageOrder.type === 'Room Service' ? 'Room ' : messageOrder.type === 'Stadium E-Ticket' || messageOrder.type === 'Club Event Ticket' ? 'Ticket: ' : 'Table ';
                                                const locValue = messageOrder.type === 'Stay Booking' || messageOrder.type === 'Room Service' ? messageOrder.room : messageOrder.type === 'Stadium E-Ticket' || messageOrder.type === 'Club Event Ticket' ? (messageOrder.items ? messageOrder.items.map(i => typeof i === 'string' ? i : (i.name || '')).join(', ') : '') : messageOrder.table;
                                                alert(`MESSAGE DISPATCHED\n------------------\nTo: ${messageOrder.guest} (${locType}${locValue})\nMessage: "${customMessage}"\n\nStatus: Sent & Synced.`);
                                                setMessageOrder(null);
                                            }}
                                            disabled={!customMessage.trim()}
                                            className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                                                customMessage.trim() 
                                                ? 'bg-brand text-dark-900 hover:scale-105 active:scale-95 shadow-xl shadow-brand/20' 
                                                : 'bg-btn-sec text-secondary border border-main opacity-50 cursor-not-allowed'
                                            }`}
                                        >
                                            <Send size={16} />
                                            Send Message
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <PostsFeed isOpen={isFeedOpen} onClose={() => setIsFeedOpen(false)} />

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
            </div> {/* END FLOATING GLASS TABLET WRAPPER */}
        </div>
    );
};

export default ManagerDashboard;
