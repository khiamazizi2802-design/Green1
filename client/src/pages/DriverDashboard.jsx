import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    DollarSign,
    TrendingUp,
    Star,
    Navigation,
    LogOut,
    Bell,
    PlayCircle,
    Calendar,
    ChevronRight,
    MapPin,
    Zap,
    User,
    ShieldCheck,
    TrendingDown,
    Menu,
    CheckCircle,
    Check,
    X,
    Compass,
    Upload,
    Edit3,
    MessageSquare,
    Clock,
    Shield,
    Filter,
    Download,
    Scale,
    FileSearch,
    Eye,
    EyeOff,
    Briefcase,
    Users,
    FileText,
    AlertCircle,
    Key,
    Lock,
    Mail,
    Smartphone,
    ChevronLeft,
    Car,
    Moon,
    Sun,
    RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db as fbDb } from '../config/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import Radar from '../components/Radar';
import Button from '../components/Button';
import Sheet from '../components/Sheet';
import PostsFeed from '../components/PostsFeed';
import Sidebar from '../components/Sidebar';
import DocumentArea from '../components/DocumentArea';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';

// Fix for Leaflet default icon issue in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Marker Icons for that Premium "Green" feel
// Custom Tactical Pointer for the Driver
const driverIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="relative w-10 h-10 flex items-center justify-center">
        <div class="absolute inset-0 bg-brand/20 rounded-full" />
        <div class="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" class="w-full h-full text-brand drop-shadow-[0_0_8px_rgba(0,212,255,0.8)] fill-current">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
        </div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const pickupIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #FFFFFF; width: 16px; height: 16px; border-radius: 4px; border: 2px solid white; box-shadow: 0 0 10px rgba(255,255,255,0.1);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const dropoffIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #FFFFFF; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(255,255,255,0.1);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

// Component to auto-center map when sequence changes (Optimized to be less aggressive)
const MapRecenter = ({ pos }) => {
    const map = useMap();
    const lastPos = React.useRef(null);
    
    useEffect(() => {
        if (!pos) return;
        // Only recenter if distance moved is significant or if it's the first time
        if (!lastPos.current || Math.abs(pos.lat - lastPos.current.lat) > 0.001 || Math.abs(pos.lng - lastPos.current.lng) > 0.001) {
            map.panTo([pos.lat, pos.lng], { animate: true, duration: 1.5 });
            lastPos.current = pos;
        }
    }, [pos, map]);
    return null;
};

const DriverDashboard = () => {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const { lang, setLang, t } = useLanguage();

    // NOTCH & SAFE AREA INTEGRATION
    const [useSafeArea, setUseSafeArea] = useState(() => {
        return localStorage.getItem('green_manager_use_safe_area') !== 'false';
    });
    const [notchAdjustment, setNotchAdjustment] = useState(() => {
        return parseInt(localStorage.getItem('green_manager_notch_adjustment') || (window.innerWidth < 768 ? '16' : '0'), 10);
    });
    const [isNotchPanelOpen, setIsNotchPanelOpen] = useState(false);

    React.useEffect(() => {
        localStorage.setItem('green_manager_use_safe_area', useSafeArea ? 'true' : 'false');
    }, [useSafeArea]);

    React.useEffect(() => {
        localStorage.setItem('green_manager_notch_adjustment', notchAdjustment.toString());
    }, [notchAdjustment]);

    const [activeTab, setActiveTab] = useState('day');
    const [showPosts, setShowPosts] = useState(false);
    const [incomingRide, setIncomingRide] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasUpdates, setHasUpdates] = useState(true);
    const [view, setView] = useState('dashboard'); // 'dashboard' or 'verification'
    const [sharedTripsEnabled, setSharedTripsEnabled] = useState(true);
    
    // Driver Identity Profile States
    const [profileSheetOpen, setProfileSheetOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: user?.name?.split(' ')[0] || 'Parsa',
        lastName: user?.name?.split(' ')[1] || 'Azizi',
        address: 'Mainzer Landstraße 123',
        email: user?.email || 'driver@greenride.com',
        zipCode: '60327',
        city: 'Frankfurt am Main',
        phoneNumber: '+49 176 12345678',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Parsa'}`
    });
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([{ sender: 'ai', text: 'Hello! I am the Super Admin AI assistant. How can I help you today?' }]);
    const [chatInput, setChatInput] = useState('');

    const [documentsSheetOpen, setDocumentsSheetOpen] = useState(false);
    const [driverDocs, setDriverDocs] = useState(() => {
        const saved = localStorage.getItem('driver_compliance_docs');
        return saved ? JSON.parse(saved) : [
            { id: 'avatar', name: 'Profile Photo', status: 'missing', requirement: 'High-resolution headshot for driver profile ID', file: null },
            { id: 'license', name: 'Driving License', status: 'verified', requirement: 'Class B EU License (Front & Back)', file: null },
            { id: 'idcard', name: 'Passport / ID Card', status: 'missing', requirement: 'Government-issued biometric passport or national identity card', file: null },
            { id: 'pschein', name: 'P-Schein (Passenger Permit)', status: 'missing', requirement: 'Passenger Transport License (Personenbeförderungsschein)', file: null },
            { id: 'terms', name: 'Terms & Conditions', status: 'missing', requirement: 'Accept Platform Partnership & Data Usage Agreement', file: null }
        ];
    });

    const [vehicleDocs, setVehicleDocs] = useState([
        { id: 'tuv', name: 'HU/AU (TÜV)', status: 'verified', requirement: 'Valid main inspection certificate' },
        { id: 'insurance', name: 'Commercial Insurance', status: 'missing', requirement: 'PBefG-compliant passenger insurance coverage' }
    ]);
    const [mapPreference, setMapPreference] = useState('google'); // 'google' or 'apple'
    const { theme, setTheme } = useTheme();
    const [userEmail, setUserEmail] = useState(user?.email || 'driver@green.com');
    const [userPassword, setUserPassword] = useState('********');
    const [showPassword, setShowPassword] = useState(false);
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [termsDenied, setTermsDenied] = useState(false);
    const [profilePicStatus, setProfilePicStatus] = useState('missing'); // 'missing', 'pending', 'verified'
    const [hasInitialPic, setHasInitialPic] = useState(false);
    const [tempPhotoPreview, setTempPhotoPreview] = useState(null);

    // NEW: Capacity and Active Rides
    const [vehicleCapacity, setVehicleCapacity] = useState(3); // e.g., Tesla Model 3
    const [currentOccupancy, setCurrentOccupancy] = useState(0);
    const [activeRidesCount, setActiveRidesCount] = useState(0);
    const [activeRide, setActiveRide] = useState(null);
    const [rideStatus, setRideStatus] = useState('none'); // 'none', 'accepted', 'arrived', 'picked_up'
    
    // --- MULTI-MISSION SHARED FLOW CORE ---
    const [activeMissions, setActiveMissions] = useState([]); 
    const [currentSequence, setCurrentSequence] = useState([]); 
    const [currentPos, setCurrentPos] = useState({ lat: 50.1109, lng: 8.6821 }); 
    
    const [missionSheetOpen, setMissionSheetOpen] = useState(false);
    const [missionStep, setMissionStep] = useState('confirm'); // 'confirm' | 'summary'
    const [earlyDropOffs, setEarlyDropOffs] = useState([]); // List of trip IDs that ended early
    const [showOfflineReport, setShowOfflineReport] = useState(false);
    const [reportData, setReportData] = useState({}); // { tripId: { reason, details } }
    // Vehicle Registration States
    const [vehicleSheetOpen, setVehicleSheetOpen] = useState(false);
    const [vehicleInfo, setVehicleInfo] = useState(() => {
        const saved = localStorage.getItem('driver_vehicle_data');
        return saved ? JSON.parse(saved) : { plate: '', model: '', year: '', color: '', photo: null, status: 'unregistered' };
    });
    const [timeRange, setTimeRange] = useState('week');
    const [selectedMonth, setSelectedMonth] = useState('April 2026');
    const [selectedWeek, setSelectedWeek] = useState('Week 17');
    const [lastCompletedRide, setLastCompletedRide] = useState(null);
    const [riderRating, setRiderRating] = useState(5);
    const [selectedEmojis, setSelectedEmojis] = useState([]);
    const [earningsFilterDate, setEarningsFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [isExporting, setIsExporting] = useState(false);
    const [showSecurityReset, setShowSecurityReset] = useState(false);
    const [resetConfirmed, setResetConfirmed] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');
    const [confirmPhone, setConfirmPhone] = useState('');
    const [sharingMode, setSharingMode] = useState('urban'); // 'urban' | 'autobahn'
    const [isReordering, setIsReordering] = useState(false);
    const [arrivalNotify, setArrivalNotify] = useState(null); // { name: string, id: string }
    const [paymentNotify, setPaymentNotify] = useState(null); // { name: string, amount: number }
    const notifiedMissions = React.useRef(new Set());
    const [dismissingMission, setDismissingMission] = useState(null); // { id: string, customer: string }

    React.useEffect(() => {
        const syncVehicleData = () => {
            const saved = localStorage.getItem('driver_vehicle_data');
            if (saved) {
                const parsed = JSON.parse(saved);
                setVehicleInfo(prev => {
                    // Only update if status or values changed to avoid re-renders
                    if (prev.status !== parsed.status || prev.plate !== parsed.plate || prev.model !== parsed.model || prev.photo !== parsed.photo) {
                        return parsed;
                    }
                    return prev;
                });
            }
        };
        window.addEventListener('storage', syncVehicleData);
        const interval = setInterval(syncVehicleData, 1000);
        return () => {
            window.removeEventListener('storage', syncVehicleData);
            clearInterval(interval);
        };
    }, []);

    React.useEffect(() => {
        const syncDocsData = () => {
            const saved = localStorage.getItem('driver_compliance_docs');
            if (saved) {
                const parsed = JSON.parse(saved);
                setDriverDocs(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
                        return parsed;
                    }
                    return prev;
                });
            }
        };
        window.addEventListener('storage', syncDocsData);
        const interval = setInterval(syncDocsData, 1000);
        return () => {
            window.removeEventListener('storage', syncDocsData);
            clearInterval(interval);
        };
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput.trim();
        setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setChatInput('');

        // Simulate AI answering
        setTimeout(() => {
            const lowerMsg = userMsg.toLowerCase();
            const aiResponse = (lowerMsg.includes('termine') || lowerMsg.includes('appointment'))
                ? "I see you are requesting a Termine. I cannot schedule this automatically. Please wait for the real Super Admin to review your request. Current wait time is approximately 12 hours."
                : "I understand. However, for this specific problem, you will need to wait for the real Super Admin to answer. Current wait time is approximately 12 hours.";
            
            setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        }, 1000);
    };

    const handleUploadDocument = (id) => {
        setDriverDocs(prev => {
            const updated = prev.map(doc => doc.id === id ? { ...doc, status: 'pending' } : doc);
            localStorage.setItem('driver_compliance_docs', JSON.stringify(updated));
            return updated;
        });
        setVehicleDocs(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'pending' } : doc));
        alert("Photo upload initiated (Simulated)");
    };

    const handleAcceptTerms = (id) => {
        setDriverDocs(prev => {
            const updated = prev.map(doc => doc.id === id ? { ...doc, status: 'verified' } : doc);
            localStorage.setItem('driver_compliance_docs', JSON.stringify(updated));
            return updated;
        });
        setTermsDenied(false);
        alert("Terms & Conditions Accepted!");
    };

    const handleDenyTerms = () => {
        setTermsDenied(true);
    };

    const [tripHistory, setTripHistory] = useState([]);
    const [inboxMessages, setInboxMessages] = useState([]);
    const [showReceipt, setShowReceipt] = useState(null);
    const [stats, setStats] = useState({
        day: { earnings: 0.00, trips: 0, hours: 0.0, rating: 5.0 },
        week: { earnings: 0.00, trips: 0, hours: 0.0, rating: 5.0 },
        month: { earnings: 0.00, trips: 0, hours: 0.0, rating: 5.0 },
        year: { earnings: 0.00, trips: 0, hours: 0.0, rating: 5.0 }
    });

    useEffect(() => {
        const isDemoUser = user?.email?.toLowerCase().endsWith('@green.de');
        if (isDemoUser) {
            setTripHistory([
                { id: 'TRIP-1024', date: '2026-03-08 14:20', from: 'Frankfurt Airport', to: 'Mainz Hbf', amount: 42.50, status: 'completed', distance: '32 km' },
                { id: 'TRIP-1025', date: '2026-03-08 16:45', from: 'Zeil 10', to: 'Bornheim', amount: 18.20, status: 'completed', distance: '5.4 km' },
                { id: 'TRIP-1026', date: '2026-03-09 09:15', from: 'Sachsenhausen', to: 'Airport Terminal 1', amount: 38.00, status: 'completed', distance: '14.2 km' },
                { id: 'TRIP-1027', date: '2026-03-09 17:30', from: 'Messe Frankfurt', to: 'Westend', amount: 22.00, status: 'completed', distance: '6.2 km' },
                { id: 'TRIP-1028', date: '2026-03-01 11:15', from: 'Wiesbaden Hbf', to: 'Frankfurt Hbf', amount: 55.00, status: 'completed', distance: '40 km' },
                { id: 'TRIP-1029', date: '2026-02-14 20:00', from: 'Bockenheim', to: 'Nordend', amount: 15.50, status: 'completed', distance: '4.8 km' }
            ]);
            setInboxMessages([
                { id: 1, title: 'New Bonus Program', content: 'Earn 20% more for rides between 18:00 and 22:00 starting next Monday!', date: 'Today' },
                { id: 2, title: 'Frankfurt Auto Show', content: 'High demand expected near the Messe area. Prepare for increased surge pricing.', date: 'Yesterday' }
            ]);
            setStats({
                day: { earnings: 142.50, trips: 12, hours: 6.5, rating: 4.8 },
                week: { earnings: 840.20, trips: 64, hours: 38.2, rating: 4.9 },
                month: { earnings: 3250.00, trips: 245, hours: 162, rating: 4.85 },
                year: { earnings: 38540.00, trips: 2840, hours: 1920, rating: 4.88 }
            });
        } else {
            setTripHistory([]);
            setInboxMessages([]);
            setStats({
                day: { earnings: 0.00, trips: 0, hours: 0.0, rating: 5.0 },
                week: { earnings: 0.00, trips: 0, hours: 0.0, rating: 5.0 },
                month: { earnings: 0.00, trips: 0, hours: 0.0, rating: 5.0 },
                year: { earnings: 0.00, trips: 0, hours: 0.0, rating: 5.0 }
            });
            setDriverDocs(prev => {
                const reset = prev.map(d => ({ ...d, status: 'missing' }));
                localStorage.setItem('driver_compliance_docs', JSON.stringify(reset));
                return reset;
            });
            setVehicleDocs(prev => prev.map(d => ({ ...d, status: 'missing' })));
        }
    }, [user]);

    useEffect(() => {
        if (!user?.email) return;
        
        const unsubscribe = onSnapshot(doc(fbDb, 'users', user.email.toLowerCase()), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.vehicleInfo) {
                    setVehicleInfo(data.vehicleInfo);
                    localStorage.setItem('driver_vehicle_data', JSON.stringify(data.vehicleInfo));
                } else {
                    const isDemoUser = user?.email?.toLowerCase().endsWith('@green.de');
                    if (!isDemoUser) {
                        setVehicleInfo({ plate: '', model: '', year: '', color: '', photo: null, status: 'unregistered' });
                        localStorage.removeItem('driver_vehicle_data');
                    }
                }
            }
        });
        
        return () => unsubscribe();
    }, [user?.email]);


    const currentStats = stats[activeTab];

    useEffect(() => {
        if (!socket || !isOnline) return;

        const handleNewRequest = (request) => {
            console.log('Incoming Real-Time Request:', request);
            setIncomingRide({
                ...request,
                customer: request.passengerName,
                price: 24.50, 
                basePrice: 24.50,
                distance: '4.2 km',
                coords: { lat: 50.115, lng: 8.685 },
                isRealTime: true,
                rideType: request.rideType || 'green',
                capacity: request.capacity || 3,
                paymentType: request.paymentType || 'Digital'
            });
        };

        const handleRequestsList = (list) => {
            console.log('Active Missions List Received:', list);
            if (list.length > 0 && !incomingRide) {
                handleNewRequest(list[0]); // Show the most recent available mission
            }
        };

        socket.on('new-ride-request', handleNewRequest);
        socket.on('active-requests-list', handleRequestsList);
        
        // Fetch any missions already in the air
        socket.emit('get-active-requests');

        return () => {
            socket.off('new-ride-request', handleNewRequest);
            socket.off('active-requests-list', handleRequestsList);
        };
    }, [socket, isOnline, incomingRide]);



    // Tactical Manual Re-Sequencing Logic
    const moveMission = (index, direction) => {
        const newMissions = [...activeMissions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex >= 0 && targetIndex < newMissions.length) {
            const temp = newMissions[index];
            newMissions[index] = newMissions[targetIndex];
            newMissions[targetIndex] = temp;
            
            setIsReordering(true);
            setTimeout(() => {
                setActiveMissions(newMissions);
                setIsReordering(false);
                alert("TACTICAL OVERRIDE: Passenger sequence updated. All riders have been notified.");
            }, 800);
        }
    };

    const getMultiplier = (type, count) => {
        if (type === 'premium' || count <= 1) return 1.0;
        if (type === 'green') {
            if (count === 2) return 1.5;
            if (count === 3) return 1.8;
        }
        if (type === 'max') {
            const steps = [1.0, 1.3, 1.6, 1.8, 2.0, 2.2, 2.4, 2.5];
            return steps[count - 1] || 2.5;
        }
        return 1.0;
    };

    const getPassengerRate = (type, count) => {
        if (type === 'premium') return 1.0;
        if (type === 'green') {
            if (count === 1) return 1.0;
            if (count === 2) return 0.7;
            if (count === 3) return 0.55;
        }
        if (type === 'max') {
            const rates = [1.0, 0.8, 0.65, 0.55, 0.45, 0.4, 0.35, 0.3];
            return rates[count - 1] || 0.3;
        }
        return 1.0;
    };

    // --- SEQUENCING ENGINE: NEAREST DROP-OFF OPTIMIZATION ---
    // --- TACTICAL AUTOPILOT SIMULATION ---
    useEffect(() => {
        if (!isOnline || rideStatus === 'none' || currentSequence.length === 0) return;
        
        const interval = setInterval(() => {
            const target = currentSequence[0].coord;
            setCurrentPos(prev => {
                const dLat = target.lat - prev.lat;
                const dLng = target.lng - prev.lng;
                const distance = Math.sqrt(dLat * dLat + dLng * dLng);
                
                if (distance < 0.0005) return prev; // Already arrived

                // Move 10% closer to target each tick for smooth visual progression
                return {
                    lat: prev.lat + dLat * 0.1,
                    lng: prev.lng + dLng * 0.1
                };
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [isOnline, rideStatus, currentSequence]);

    useEffect(() => {
        if (activeMissions.length === 0) {
            setCurrentSequence([]);
            return;
        }

        // Logic: Find the nearest pending target (Pickup or Drop-off)
        const sequence = [];
        const pickups = activeMissions.filter(m => !m.pickupDone);
        const dropoffs = activeMissions.filter(m => m.pickupDone);

        // Logic: Always show the immediate next target in the sequence
        pickups.forEach(m => {
            sequence.push({ id: m.id, type: 'pickup', coord: m.pickupCoord, label: `Pick-up: ${m.customer}`, customer: m.customer, address: m.pickup });
        });
        dropoffs.forEach(m => {
            sequence.push({ id: m.id, type: 'dropoff', coord: m.destCoord, label: `Drop-off: ${m.customer}`, customer: m.customer, address: m.destination });
        });

        // Nearest-neighbor sorting for the sequence
        sequence.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.coord.lat - currentPos.lat, 2) + Math.pow(a.coord.lng - currentPos.lng, 2));
            const distB = Math.sqrt(Math.pow(b.coord.lat - currentPos.lat, 2) + Math.pow(b.coord.lng - currentPos.lng, 2));
            return distA - distB;
        });

        setCurrentSequence(sequence);
    }, [activeMissions, currentPos]);

    const handleAcceptRide = () => {
        if (!incomingRide) return;

        // If it's a real-time request from another user, notify them
        if (incomingRide.isRealTime && socket) {
            socket.emit('accept-ride', {
                passengerId: incomingRide.passengerId,
                driverName: user?.name || "Expert Driver"
            });
        }

        const newMission = {
            ...incomingRide,
            status: 'accepted',
            startTime: Date.now(),
            pickupCoord: incomingRide.coords || { lat: 50.115, lng: 8.685 },
            destCoord: { lat: 50.112, lng: 8.692 }, // Realistic Drop-off for simulation
            paymentType: (incomingRide.payment?.toLowerCase().includes('cash')) ? 'Cash' : 'Digital',
            price: incomingRide.fare || 18.40
        };

        setActiveMissions(prev => [...prev, newMission]);
        setIncomingRide(null);
        setRideStatus('active_multi');
    };

    const [isActionLocked, setIsActionLocked] = useState(false);
    const lockAction = () => {
        setIsActionLocked(true);
        setTimeout(() => setIsActionLocked(false), 2000);
    };

    const handleArrived = (missionId) => {
        if (isActionLocked) return;
        
        // Find mission to send notification
        const id = missionId || currentSequence[0]?.id;
        const mission = activeMissions.find(m => m.id === id);
        
        if (mission) {
            // Guard: Prevent duplicate notification for the same mission
            if (notifiedMissions.current.has(mission.id)) {
                // If already notified but status isn't arrived yet (race condition), just update status
                if (mission.status !== 'arrived') {
                    setActiveMissions(prev => prev.map(m => 
                        m.id === mission.id ? { ...m, status: 'arrived', arrivedTime: Date.now() } : m
                    ));
                }
                return;
            }

            lockAction();
            notifiedMissions.current.add(mission.id);
            
            setArrivalNotify({ name: mission.customer, id: `${mission.id}-${Date.now()}` });
            setTimeout(() => setArrivalNotify(null), 10000);
            
            // Notify Passenger via Socket
            if (socket && mission.passengerId) {
                socket.emit('driver-arrived', { passengerId: mission.passengerId });
            }

            setActiveMissions(prev => prev.map(m => 
                m.id === mission.id ? { ...m, status: 'arrived', arrivedTime: Date.now() } : m
            ));
        }
    };

    const handleStartTrip = (missionId) => {
        if (isActionLocked) return;
        lockAction();
        const id = missionId || currentSequence[0]?.id;
        const mission = activeMissions.find(m => m.id === id);

        // Clear any pending arrival notification when trip starts
        setArrivalNotify(null);

        if (mission && socket && mission.passengerId) {
            socket.emit('start-ride', { passengerId: mission.passengerId });
        }

        setActiveMissions(prev => prev.map(m => 
            m.id === id ? { ...m, status: 'guest_in_car', pickupDone: true, startTime: Date.now() } : m
        ));
        
        // Immediate sequence refresh for UI responsiveness
        setCurrentSequence(prev => {
            const newSeq = prev.map(s => 
                s.id === id && s.type === 'pickup' ? { ...s, type: 'dropoff', label: `Drop-off: ${s.customer}` } : s
            );
            // Move the current drop-off to the front if it was the just-started mission
            const currentIdx = newSeq.findIndex(s => s.id === id);
            if (currentIdx > 0) {
                const [item] = newSeq.splice(currentIdx, 1);
                newSeq.unshift(item);
            }
            return newSeq;
        });
    };

    const handleDropOff = (missionId) => {
        if (isActionLocked) return;
        const id = missionId || currentSequence[0]?.id;
        const mission = activeMissions.find(m => m.id === id);
        
        if (mission && mission.status === 'guest_in_car') {
            lockAction();
            // Transition to payment phase instead of immediate removal
            setActiveMissions(prev => prev.map(m => 
                m.id === id ? { ...m, status: 'collect_payment' } : m
            ));
            return;
        }

        if (mission && mission.status === 'collect_payment') {
            lockAction();
            
            // Notify Passenger trip completed
            if (socket && mission.passengerId) {
                socket.emit('complete-ride', { passengerId: mission.passengerId });
            }

            // B & C: Skip confirm if digital
            if (mission.paymentType === 'Digital') {
                setActiveMissions(prev => prev.filter(m => m.id !== id));
                setPaymentNotify({ customer: mission.customer, amount: mission.price });
                setTimeout(() => setPaymentNotify(null), 5000);
            } else {
                setActiveMissions(prev => prev.map(m => 
                    m.id === id ? { ...m, status: 'confirm_payment' } : m
                ));
            }
            return;
        }

        if (mission && mission.status === 'confirm_payment') {
            lockAction();
            const price = mission.price || 18.40;
            
            // Save to earnings
            setStats(prev => ({
                ...prev,
                day: { ...prev.day, earnings: prev.day.earnings + price, trips: prev.day.trips + 1 }
            }));

            // Trigger Top Sheet Notification
            setPaymentNotify({ customer: mission.customer, amount: price });
            setTimeout(() => setPaymentNotify(null), 5000);

            // Clean up mission
            const remaining = activeMissions.filter(m => m.id !== id);
            setActiveMissions(remaining);
            
            // If it was the last mission, clear sequence
            if (remaining.length === 0) {
                setCurrentSequence([]);
                setRideStatus('none');
            }
            return;
        }
        setCurrentSequence(prev => prev.filter(s => s.id !== id));
        
        if (remaining.length === 0) {
            setRideStatus('none');
        }
    };

    const handleNoShow = () => {
        if (currentSequence.length === 0) return;
        const target = currentSequence[0];
        alert(`NO-SHOW: Moving to next node to protect passenger schedule.`);
        
        const remaining = activeMissions.filter(m => m.id !== target.id);
        setActiveMissions(remaining);
        setActiveRidesCount(prev => Math.max(0, prev - 1));
        
        if (remaining.length === 0) {
            setRideStatus('none');
        }
    };

    const openExternalMap = () => {
        if (currentSequence.length === 0) return;
        const target = currentSequence[0];
        const url = mapPreference === 'google' 
            ? `https://www.google.com/maps/dir/?api=1&destination=${target.coord.lat},${target.coord.lng}`
            : `http://maps.apple.com/?daddr=${target.coord.lat},${target.coord.lng}`;
        window.open(url, '_blank');
    };

    const handleCompleteRide = () => {
        if (currentSequence.length === 0) return;
        const target = currentSequence[0];

        setLastCompletedRide({
            ...target,
            finalAmount: (target?.basePrice || 15.00) * getMultiplier(target?.rideType, currentOccupancy),
            duration: '14m',
            date: new Date().toLocaleDateString(),
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Step transition: confirm -> summary
        setMissionStep('summary');
    };

    const finalizeMission = () => {
        const target = lastCompletedRide;
        const remaining = activeMissions.filter(m => m.id !== target.id);
        
        setActiveMissions(remaining);
        setCurrentOccupancy(prev => Math.max(0, prev - 1));
        setActiveRidesCount(prev => Math.max(0, prev - 1));
        
        setMissionSheetOpen(false);
        setMissionStep('confirm');
        setSelectedEmojis([]);

        if (remaining.length === 0) {
            setRideStatus('none');
        }
    };

    const handleEarlyDropOff = () => {
        if (currentSequence.length === 0) return;
        const target = currentSequence[0];
        
        // Track for end-of-shift report
        setEarlyDropOffs(prev => [...prev, { id: target.id, customer: target.customer, time: new Date().toLocaleTimeString() }]);
        
        // INSTANT PURGE: Remove from active missions and update occupancy
        setActiveMissions(prev => prev.filter(m => m.id !== target.id));
        setCurrentOccupancy(prev => Math.max(0, prev - 1));
        setActiveRidesCount(prev => Math.max(0, prev - 1));
        
        // Clear mission UI if it was open
        setMissionSheetOpen(false);
        setMissionStep('confirm');
    };

    const handleOfflineRequest = () => {
        if (!isOnline) {
            setIsOnline(true);
            return;
        }

        // Going offline logic
        if (activeMissions.length > 0) {
            // If there are active missions, show the report sheet
            setEarlyDropOffs(activeMissions);
            setShowOfflineReport(true);
            // We stay "online" until they submit the report, or maybe set to false immediately if that's the desired flow
            // The user's previous code set it to false immediately in the report flow.
            setIsOnline(false);
        } else {
            setIsOnline(false);
        }
    };

    const finalizeOffline = () => {
        setIsOnline(false);
        setShowOfflineReport(false);
        setEarlyDropOffs([]);
        setReportData({});
        alert("Shift Report Submitted Successfully.");
    };

    const simulateGroupRide = () => {
        const isPremiumEligible = vehicleInfo.year >= 2024;
        
        // Scenario 1: Mixed Shared Ride (Green/Max)
        const mixedMissions = [
            { id: 'M-1', customer: 'Lukas M.', pickup: 'Hauptwache', destination: 'Bornheim Mitte', pickupDone: true, pickupCoord: { lat: 50.113, lng: 8.680 }, destCoord: { lat: 50.125, lng: 8.710 }, status: 'picked_up', startTime: Date.now() - 600000, rideType: 'green', basePrice: 18.00, paymentType: 'Digital' },
            { id: 'M-2', customer: 'Sarah K.', pickup: 'Zeil', destination: 'Sachsenhausen', pickupDone: false, pickupCoord: { lat: 50.114, lng: 8.685 }, destCoord: { lat: 50.110, lng: 8.720 }, status: 'accepted', startTime: Date.now(), rideType: 'green', basePrice: 15.00, paymentType: 'Cash' }
        ];

        // Scenario 2: Sequential Premium Chain
        const premiumMissions = [
            { id: 'P-1', customer: 'Dominik W.', pickup: 'Westend', destination: 'Opernplatz', pickupDone: true, pickupCoord: { lat: 50.118, lng: 8.665 }, destCoord: { lat: 50.130, lng: 8.680 }, status: 'picked_up', startTime: Date.now() - 300000, rideType: 'premium', basePrice: 45.00, paymentType: 'Digital' },
            { id: 'P-2', customer: 'Helena R.', pickup: 'Skyline Plaza', destination: 'Airport Terminal 1', pickupDone: false, pickupCoord: { lat: 50.108, lng: 8.650 }, destCoord: { lat: 50.090, lng: 8.620 }, status: 'accepted', startTime: Date.now(), rideType: 'premium', basePrice: 52.00, paymentType: 'Digital' }
        ];

        // Logic: If car is empty, we can start a mission chain
        if (activeMissions.length === 0) {
            // Randomly choose between Premium Chain (if eligible) or Mixed Shared Hub
            const startPremium = isPremiumEligible && Math.random() > 0.5;

            if (startPremium) {
                setActiveMissions([premiumMissions[0]]);
                setActiveRidesCount(1);
                setCurrentOccupancy(1);
                setRideStatus('active_multi');
                
                // Mock receiving the follow-up premium mission 3 seconds later
                setTimeout(() => {
                    setActiveMissions(prev => {
                        // CRITICAL: Only add if we haven't exited the mission view
                        if (prev.length > 0) {
                            return [...prev, premiumMissions[1]];
                        }
                        return prev;
                    });
                }, 3000);
            } else {
                setActiveMissions(mixedMissions);
                setActiveRidesCount(2);
                setCurrentOccupancy(1); // One in car (Lukas), one accepted (Sarah)
                setRideStatus('active_multi');
            }
        }
    };

    const handleResumeTrip = () => {
        if (lastCompletedRide) {
            setActiveMissions(prev => [...prev, { ...lastCompletedRide, status: 'picked_up' }]);
            setCurrentOccupancy(prev => prev + 1);
            setActiveRidesCount(prev => prev + 1);
            setShowRideSummary(false);
            alert("TRIP RESTORED: Resuming active mission.");
        }
    };

    const handleSidebarClick = (id) => {
        if (id === 'verification') {
            setView('verification');
        } else if (id === 'social-profile' || id === 'night-crew') {
            setView('social-profile');
        } else if (id === 'driving-mode' || id === 'stats' || id === 'earnings') {
            setView('dashboard');
        } else if (id === 'profile-pic' || id === 'personal-data') {
            setView('profile-pic');
        } else if (id === 'history') {
            setView('history');
        } else if (id === 'inbox') {
            setView('inbox');
        } else if (id === 'support') {
            setView('support');
        } else if (id === 'app-settings' || id === 'settings' || id === 'navigation-settings') {
            setView('settings');
        }
    };

    return (
        <div 
            className="absolute left-0 right-0 bottom-0 overflow-hidden bg-dark-950 font-sans text-primary flex flex-col items-center transition-all duration-300"
            style={{
                top: `calc(${useSafeArea ? 'env(safe-area-inset-top, 0px)' : '0px'} + ${notchAdjustment}px)`,
                height: `calc(100% - (${useSafeArea ? 'env(safe-area-inset-top, 0px)' : '0px'} + ${notchAdjustment}px))`
            }}
        >
            {/* Arrival Notification Top Sheet */}
            <AnimatePresence mode="popLayout">
                {arrivalNotify && (
                    <motion.div 
                        key={arrivalNotify.id}
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="absolute top-4 z-[110] w-full max-w-[340px] px-4"
                    >
                        <div className="bg-dark-900/80 backdrop-blur-3xl border border-brand/30 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
                                <Bell className="text-brand" size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-0.5">Rider Notified</p>
                                <p className="text-[12px] font-bold text-primary leading-tight">
                                    <span className="text-brand italic font-black uppercase">{arrivalNotify.name}</span> has been alerted of your arrival.
                                </p>
                            </div>
                            <div className="w-1 h-10 bg-brand/20 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ height: "100%" }}
                                    animate={{ height: "0%" }}
                                    transition={{ duration: 10, ease: "linear" }}
                                    className="w-full bg-brand"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
                {paymentNotify && (
                    <motion.div 
                        key={`pay-${paymentNotify.customer}`}
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="absolute top-4 z-[120] w-full max-w-[340px] px-4"
                    >
                        <div className="bg-emerald-500/10 backdrop-blur-3xl border border-emerald-500/30 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                <Check className="text-emerald-500" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Payment Complete</p>
                                <p className="text-[12px] font-bold text-primary leading-tight">
                                    Collected <span className="text-emerald-500 italic font-black uppercase">€{paymentNotify.amount.toFixed(2)}</span> from {paymentNotify.customer}.
                                </p>
                            </div>
                            <div className="w-1 h-10 bg-emerald-500/20 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ height: "100%" }}
                                    animate={{ height: "0%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    className="w-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activeView={view}
                onItemClick={(id) => {
                    if (id === 'profile') setProfileSheetOpen(true);
                    else if (id === 'vehicle') setVehicleSheetOpen(true);
                    else if (id === 'documents') setDocumentsSheetOpen(true);
                    else if (id === 'earnings') setView('history');
                    else if (id === 'overview') setView('dashboard');
                    else if (id === 'discovery-feed') setShowPosts(true);
                    else if (id === 'theme-toggle') setTheme(theme === 'dark' ? 'light' : 'dark');
                    else setView(id);
                }}
                user={user}
            />

            {/* EARLY EXIT PROTOCOL SHEET */}
            <Sheet 
                isOpen={!!dismissingMission} 
                onClose={() => setDismissingMission(null)}
                title="Early Exit Protocol"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Warning</p>
                        <p className="text-[12px] font-bold text-primary">
                            You are about to end the mission for <span className="text-red-500 italic uppercase font-black">{dismissingMission?.customer}</span> before reaching the destination.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary px-2">Select Reason</p>
                        {[
                            { id: 'early_dropoff', label: 'Early Drop-off Request', icon: MapPin },
                            { id: 'safety', label: 'Safety / Behavior Concern', icon: ShieldCheck },
                            { id: 'technical', label: 'Vehicle Technical Issue', icon: Zap },
                            { id: 'guest_cancel', label: 'Guest Changed Mind', icon: X }
                        ].map((reason) => (
                            <button
                                key={reason.id}
                                onClick={() => {
                                    setActiveMissions(prev => prev.filter(m => m.id !== dismissingMission.id));
                                    setDismissingMission(null);
                                    alert(`Mission Ended: ${reason.label}`);
                                }}
                                className="w-full flex items-center gap-4 p-4 bg-surface border border-main rounded-2xl hover:bg-surface-light hover:border-white/20 transition-all group text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-surface border border-main flex items-center justify-center group-hover:border-red-500/50 transition-all">
                                    <reason.icon size={18} className="text-muted group-hover:text-red-500" />
                                </div>
                                <span className="text-[13px] font-bold text-primary uppercase tracking-tight">{reason.label}</span>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setDismissingMission(null)}
                        className="w-full py-4 bg-surface text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all"
                    >
                        Keep Mission Active
                    </button>
                </div>
            </Sheet>

            {/* Header - Fixed at top */}
            {/* Header - Fixed at top - Only visible in main dashboard view */}
            {view === 'dashboard' && (
                <header className="absolute top-0 left-0 right-0 z-20 p-3 md:p-6 flex justify-between items-center bg-gradient-to-b from-dark-950 to-transparent pointer-events-none">
                    <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
                        <div className="flex items-center gap-2 md:gap-4 relative z-30 pointer-events-auto">
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 md:p-3 bg-surface backdrop-blur-md border border-main rounded-2xl text-brand hover:bg-brand/10 transition-all shadow-lg relative group"
                            >
                                <Menu size={20} className="md:w-[22px] md:h-[22px]" />
                                {driverDocs.some(d => d.status === 'missing') && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--bg-primary)]" />
                                )}
                            </button>
                            
                            {view !== 'dashboard' && (
                                <button 
                                    onClick={() => setView('dashboard')}
                                    className="p-2 md:p-3 bg-surface backdrop-blur-md border border-main rounded-2xl text-primary hover:bg-surface-light transition-all shadow-lg"
                                >
                                    <ArrowLeft size={18} className="md:w-[20px] md:h-[20px]" />
                                </button>
                            )}

                            {rideStatus === 'none' && (
                                <>
                                    <div className="hidden md:flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setView('social-profile')}>
                                        <span className="text-[6px] font-black text-brand uppercase tracking-widest bg-brand/5 px-1.5 py-0.5 rounded border border-brand/20 shadow-[0_0_10px_rgba(0,212,255,0.1)]">ID: GRN-{user?.id || '921Z'}</span>
                                    </div>
                                    <div className="cursor-pointer" onClick={() => setView('social-profile')}>
                                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-brand flex items-center gap-1">
                                            <motion.span 
                                                animate={isOnline ? { scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] } : {}}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-brand shadow-[0_0_8px_var(--brand)]' : 'bg-gray-500'}`} 
                                            />
                                            {isOnline ? 'Searching' : 'Offline'}
                                        </p>
                                        <h2 className="hidden md:block text-sm font-black italic uppercase tracking-tighter -mt-1">{user?.name}</h2>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Center - Daily Balance */}
                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto top-3 md:top-6 z-30">
                        {rideStatus === 'none' && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <div
                                    className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl backdrop-blur-md transition-all group"
                                    style={{
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--border-main)',
                                        boxShadow: '0 8px 32px var(--shadow-main)'
                                    }}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-brand/80 mb-0.5 group-hover:text-brand transition-colors">Funds</span>
                                        <div className="flex items-center justify-center min-w-[60px] md:min-w-[70px]">
                                            <span className={`text-sm md:text-lg font-black italic tracking-tighter transition-all duration-300 ${isBalanceVisible ? 'text-primary' : 'text-primary opacity- mt-1'}`}>
                                                {isBalanceVisible ? `€${currentStats.earnings.toFixed(2)}` : '••••••'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-[1px] h-6 md:h-8 bg-surface-light mx-0.5 md:mx-1" />
                                    <button
                                        onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                                        className="p-1.5 md:p-2 rounded-xl hover:bg-surface-light transition-colors text-primary opacity- hover:text-brand active:scale-95"
                                    >
                                        {isBalanceVisible ? <EyeOff size={14} className="md:w-[16px] md:h-[16px]" /> : <Eye size={14} className="md:w-[16px] md:h-[16px]" />}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex gap-1.5 md:gap-3 relative z-30 pointer-events-auto items-center">
                        {rideStatus === 'none' && (
                            <>
                                {/* Notch / Header Height Fit Controller */}
                                <div className="relative z-50">
                                    <button 
                                        onClick={() => setIsNotchPanelOpen(!isNotchPanelOpen)}
                                        className={`p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl border border-white/10 text-primary transition-all flex items-center justify-center gap-1.5 ${notchAdjustment > 0 || useSafeArea ? 'border-brand/40 text-brand shadow-[0_0_15px_rgba(52,211,153,0.1)]' : ''}`}
                                        title="Notch & Safe Area Alignment"
                                    >
                                        <Smartphone size={18} className={notchAdjustment > 0 ? 'text-brand animate-pulse' : 'text-secondary'} />
                                    </button>
                                    
                                    <AnimatePresence>
                                        {isNotchPanelOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-72 bg-[#0B121E]/95 backdrop-blur-2xl border border-brand/20 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[999]"
                                            >
                                                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone size={14} className="text-brand" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Notch & Safe-Fit</span>
                                                    </div>
                                                    <button onClick={() => setIsNotchPanelOpen(false)} className="text-secondary hover:text-primary">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                
                                                <div className="space-y-4 text-left font-sans">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black uppercase text-secondary">Auto Safe Area</span>
                                                        <button 
                                                            onClick={() => setUseSafeArea(!useSafeArea)}
                                                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${useSafeArea ? 'bg-brand' : 'bg-white/10'}`}
                                                        >
                                                            <div className={`w-4 h-4 bg-dark-950 rounded-full transition-transform ${useSafeArea ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black uppercase text-secondary">Custom Offset</span>
                                                            <span className="text-xs font-black text-brand italic">{notchAdjustment}px</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                onClick={() => setNotchAdjustment(Math.max(0, notchAdjustment - 2))}
                                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-primary font-black"
                                                            >
                                                                -
                                                            </button>
                                                            <input 
                                                                type="range" 
                                                                min="0" 
                                                                max="60" 
                                                                value={notchAdjustment}
                                                                onChange={(e) => setNotchAdjustment(parseInt(e.target.value, 10))}
                                                                className="flex-1 accent-brand h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                            />
                                                            <button 
                                                                onClick={() => setNotchAdjustment(Math.min(60, notchAdjustment + 2))}
                                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-primary font-black"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                                        <button 
                                                            onClick={() => setNotchAdjustment(0)}
                                                            className={`py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${notchAdjustment === 0 ? 'bg-brand/10 border-brand text-brand' : 'bg-white/5 border-white/5 text-secondary hover:text-primary'}`}
                                                        >
                                                            0px
                                                            <span className="block text-[6px] opacity-40">Desktop</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setNotchAdjustment(20)}
                                                            className={`py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${notchAdjustment === 20 ? 'bg-brand/10 border-brand text-brand' : 'bg-white/5 border-white/5 text-secondary hover:text-primary'}`}
                                                        >
                                                            20px
                                                            <span className="block text-[6px] opacity-40">Compact</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setNotchAdjustment(44)}
                                                            className={`py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${notchAdjustment === 44 ? 'bg-brand/10 border-brand text-brand' : 'bg-white/5 border-white/5 text-secondary hover:text-primary'}`}
                                                        >
                                                            44px
                                                            <span className="block text-[6px] opacity-40">Sim Notch</span>
                                                        </button>
                                                    </div>
                                                    
                                                    <p className="text-[7px] text-gray-500 leading-normal uppercase tracking-wider">
                                                        Fits UI automatically to notches, status bars, and custom cases. Live syncing active.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={() => setSharedTripsEnabled(!sharedTripsEnabled)}
                                    className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all flex items-center justify-center ${sharedTripsEnabled ? 'bg-[var(--brand)] text-[var(--bg-primary)] shadow-lg shadow-brand/30 ring-2 ring-brand/50' : 'glass text-muted hover:text-primary'}`}
                                    title={sharedTripsEnabled ? "Shared Trips: ON" : "Shared Trips: OFF"}
                                >
                                    <Users size={18} className={`md:w-[22px] md:h-[22px] ${sharedTripsEnabled ? 'opacity-100' : 'opacity-50'}`} />
                                </button>
                            </>
                        )}
                    </div>
                </header>
            )}
            <main className={`flex-1 w-full relative z-10 flex flex-col overflow-hidden ${(rideStatus === 'active_multi' || view !== 'dashboard') ? 'justify-start' : 'items-center justify-center'}`}>
                <AnimatePresence mode="wait">
                    {view === 'social-profile' ? (
                        <motion.div 
                            key="social"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            className="flex-1 w-full flex flex-col pt-24 px-6 pb-20 overflow-y-auto no-scrollbar"
                        >
                            <div className="absolute top-8 left-6 right-6 z-[100] flex justify-between items-center pointer-events-none">
                                <div className="flex gap-4 pointer-events-auto">
                                    <button 
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="p-3 bg-surface backdrop-blur-md border border-main rounded-2xl text-brand hover:bg-brand/10 transition-all shadow-lg"
                                    >
                                        <Menu size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setView('dashboard')}
                                        className="p-3 bg-surface backdrop-blur-md border border-main rounded-2xl text-primary hover:bg-surface-light transition-all shadow-lg"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setShowPosts(true)}
                                    className="p-3 bg-surface backdrop-blur-md border border-main rounded-2xl text-brand hover:bg-brand/10 transition-all shadow-lg pointer-events-auto group"
                                    title="Open Social Discovery Feed"
                                >
                                    <Compass size={20} className="group-hover:rotate-45 transition-transform duration-300" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center mb-10">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-brand/10 border-4 border-brand/20 p-2 shadow-2xl relative group">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="w-full h-full rounded-[2rem] object-cover" />
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--brand)] rounded-xl flex items-center justify-center text-[var(--bg-primary)] border-4 border-[var(--bg-primary)]">
                                        <CheckCircle size={20} />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter mt-6">{user?.name}</h2>
                                <p className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mt-2">Certified Green Pilot • Tier 1</p>
                                
                                <div className="flex gap-8 mt-8">
                                    <div className="text-center">
                                        <p className="text-xl font-black italic">4.92</p>
                                        <p className="text-[8px] font-bold text-secondary uppercase tracking-widest">Rating</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-black italic text-brand">{user?.greenFlags > 1000 ? (user.greenFlags / 1000).toFixed(1) + 'K' : user?.greenFlags || '2.4K'}</p>
                                        <div className="flex items-center justify-center gap-1">
                                            <Zap size={8} className="text-brand fill-brand" />
                                            <p className="text-[8px] font-bold text-brand uppercase tracking-widest">Approvals</p>
                                        </div>
                                    </div>
                                    {user?.redFlags > 0 && (
                                        <div className="text-center">
                                            <p className="text-xl font-black italic text-red-500">{user.redFlags}</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <AlertCircle size={8} className="text-red-500 fill-red-500" />
                                                <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Strikes</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="text-xl font-black italic">1.2K</p>
                                        <p className="text-[8px] font-bold text-secondary uppercase tracking-widest">Missions</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-black italic">8.4K</p>
                                        <p className="text-[8px] font-bold text-secondary uppercase tracking-widest">Followers</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex justify-between items-end px-2">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">My <span className="text-brand">Discovery Stories</span></h3>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => alert("Simulating: Opening Gallery for Photos...")}
                                            className="p-2 bg-surface border border-main rounded-xl text-muted hover:text-primary"
                                        >
                                            <Upload size={14} />
                                        </button>
                                        <button 
                                            onClick={() => alert("Simulating: Launching Camera for Reel...")}
                                            className="px-4 py-2 bg-brand text-dark-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20"
                                        >
                                            New Reel +
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { title: 'Neon Night Cruise', views: '2.4K', img: 'https://images.unsplash.com/photo-1549239120-0a4c321d1bc1?q=80&w=400&auto=format&fit=crop' },
                                        { title: 'Rainy City Vibes', views: '1.8K', img: 'https://images.unsplash.com/photo-1533045607062-a5e2f75a74e5?q=80&w=400&auto=format&fit=crop' },
                                        { title: 'Tesla Speed Run', views: '4.2K', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop' },
                                        { title: 'Morning Hustle', views: '982', img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=400&auto=format&fit=crop' }
                                    ].map((story, i) => (
                                        <div key={i} className="aspect-[9/16] bg-dark-900 rounded-[2rem] border border-main relative overflow-hidden group">
                                            <img src={story.img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt="Story" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                                                <p className="text-[10px] font-black italic text-primary uppercase truncate">{story.title}</p>
                                                <p className="text-[8px] font-bold text-brand uppercase mt-1">{story.views} Views</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (rideStatus === 'active_multi' || activeMissions.length > 0) ? (
                        <motion.div 
                            key="mission-hub"
                            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`flex-1 w-full p-4 md:p-6 flex flex-col min-h-0 overflow-y-auto no-scrollbar pb-10 ${rideStatus === 'active_multi' ? 'pt-20 md:pt-24' : 'pt-24'}`}
                        >
                            {/* --- NEURAL DATA STRIP (SLIM STATS) --- */}
                            <div className="flex items-center gap-3 md:gap-4 mb-4 px-3 md:px-4 py-2 bg-white/2 border border-main rounded-2xl backdrop-blur-md overflow-x-auto no-scrollbar">
                                <button 
                                    onClick={() => {
                                        setActiveMissions([]);
                                        setRideStatus('none');
                                    }}
                                    className="shrink-0 p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500 hover:text-primary transition-all mr-2"
                                    title="Exit Mission Control"
                                >
                                    <ChevronLeft size={14} strokeWidth={3} />
                                </button>
                                {[
                                    { label: 'LOAD', value: 'OPTIMAL', color: 'text-brand' },
                                    { label: 'MISSIONS', value: activeMissions.length, color: 'text-primary' },
                                    { label: 'CAPACITY', value: `${currentOccupancy}/${vehicleCapacity}`, color: 'text-brand' },
                                    { label: 'SESSION', value: '4:12', color: 'text-muted' }
                                ].map((s, i) => (
                                    <div key={i} className="shrink-0 flex items-center gap-2 pr-3 md:pr-4 border-r border-main last:border-0">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-brand/60">{s.label}</span>
                                        <span className={`text-[10px] font-black italic uppercase ${s.color}`}>{s.value}</span>
                                    </div>
                                ))}
                                <div className="flex-1 min-w-[20px]" />
                                <div className={`shrink-0 flex items-center gap-2 px-3 py-1 rounded-lg border transition-all ${sharingMode === 'autobahn' ? 'bg-brand/10 border-brand text-brand' : 'bg-surface border-main text-muted'}`}>
                                    <div className={`w-1 h-1 rounded-full ${sharingMode === 'autobahn' ? 'bg-brand' : 'bg-gray-600'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{sharingMode} MODE</span>
                                </div>
                                <button 
                                    onClick={() => setSharedTripsEnabled(!sharedTripsEnabled)}
                                    className={`shrink-0 flex items-center gap-2 px-3 py-1 rounded-lg border transition-all active:scale-95 ${sharedTripsEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-surface border-main text-muted'}`}
                                >
                                    <div className={`w-1 h-1 rounded-full ${sharedTripsEnabled ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{sharedTripsEnabled ? 'Pool Active' : 'Pool Disabled'}</span>
                                </button>
                            </div>

                            {/* Map Removed - Space reserved for Mission Cards */}


                            {/* --- ACTION HUD: MISSION COMMAND CENTER --- */}
                            {currentSequence.length > 0 && (
                                <div className="mt-6 flex flex-col gap-4 px-2">
                                    {/* Navigation Row */}
                                    <div className="flex gap-2 md:gap-3">
                                        <button 
                                            onClick={openExternalMap}
                                            className="flex-1 py-4 md:py-5 bg-brand text-dark-900 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-brand/20 flex items-center justify-center gap-2 md:gap-3 active:scale-95 transition-all border-2 md:border-4 border-main"
                                        >
                                            <Navigation size={18} className="md:w-[20px] md:h-[20px]" /> 
                                            <span className="truncate max-w-[200px]">
                                                {currentSequence[0]?.type === 'pickup' ? 'PICK-UP' : 'DROP-OFF'}: {currentSequence[0]?.address || 'LOCATION'}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setCurrentPos(prev => ({ lat: prev.lat + 0.0015, lng: prev.lng + 0.0015 }));
                                            }}
                                            className="p-4 md:p-5 bg-dark-800 border border-main rounded-2xl md:rounded-3xl text-brand hover:bg-brand/10 transition-all shadow-lg active:scale-95"
                                        >
                                            <Zap size={20} className="md:w-[24px] md:h-[24px]" />
                                        </button>
                                    </div>

                                    {/* Core Action Row */}
                                    <div className="flex gap-3">
                                        {(() => {
                                            const target = currentSequence[0];
                                            const mission = activeMissions.find(m => m.id === target?.id);
                                            const isShared = activeMissions.length > 1;
                                            
                                            const getRideConfig = () => {
                                                if (isShared || mission?.rideType === 'shared') return { label: 'SHARED POOL', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: '⚡' };
                                                if (mission?.rideType === 'premium') return { label: 'PREMIUM LUX', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: '👑' };
                                                if (mission?.rideType === 'max') return { label: 'GREEN MAX', color: 'bg-brand/10 border-brand/30 text-brand', icon: '🔋' };
                                                return { label: 'GREEN ECONOMY', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', icon: '🌱' };
                                            };

                                            const config = getRideConfig();

                                            return (
                                                <div className="w-full flex gap-3 h-16">
                                                    <div className={`flex-[1.5] flex items-center justify-center gap-3 rounded-[1.5rem] border backdrop-blur-xl transition-all ${config.color}`}>
                                                        <span className="text-sm">{config.icon}</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black tracking-widest text-secondary uppercase">Mission Class</span>
                                                            <span className="text-[11px] font-black italic tracking-tight">{config.label}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 bg-white/2 border border-main rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <span className="text-[8px] font-black tracking-widest text-secondary uppercase">Target Sector</span>
                                                        <span className="text-[11px] font-black text-primary italic">{mission?.pickup?.split(' ')[0] || mission?.destination?.split(' ')[0] || 'FRANKFURT'}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* --- DUAL-PHASE MISSION CONTROL TERMINALS --- */}
                            <div className="mt-4 space-y-4 pb-10">
                                {/* PICK-UP TERMINAL */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-brand" />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic">Pick-Up</h3>
                                        </div>
                                        <div className="px-1.5 py-0.5 bg-brand/5 border border-brand/20 rounded-md">
                                            <span className="text-[8px] font-black text-brand uppercase tracking-widest">{activeMissions.filter(m => m.status !== 'guest_in_car' && m.status !== 'collect_payment').length} In</span>
                                        </div>
                                    </div>
                                    <motion.div 
                                        layout
                                        className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-2 min-h-[120px]"
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {activeMissions.filter(m => m.status !== 'guest_in_car' && m.status !== 'collect_payment').map((m, i) => {
                                            const minutesInCar = Math.floor((Date.now() - m.startTime) / 60000);
                                            const isNextObjective = currentSequence.length > 0 && currentSequence[0].label.includes(m.customer);
                                            const maxWait = sharingMode === 'autobahn' ? 40 : 25;
                                            const isHighPressure = minutesInCar > (maxWait * 0.6);
                                            
                                            return (
                                                <motion.div 
                                                    layout
                                                    key={m.id} 
                                                    className={`flex-shrink-0 w-52 bg-[var(--bg-secondary)] backdrop-blur-2xl border rounded-[2.5rem] p-5 space-y-4 transition-all relative z-10 ${isNextObjective ? 'border-[var(--brand)] shadow-[0_0_20px_var(--brand-glow)]' : (isHighPressure ? 'border-orange-500/30' : 'border-main')}`}
                                                >
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMissions(prev => prev.filter(mission => mission.id !== m.id));
                                                        }}
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-primary rounded-full flex items-center justify-center border border-dark-900 z-20 hover:scale-110 transition-transform"
                                                    >
                                                        <X size={10} strokeWidth={3} />
                                                    </button>
                                                    <div className="flex justify-between items-center">
                                                        <div className="w-7 h-7 rounded-lg bg-btn-sec border border-main overflow-hidden">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.customer}`} className="w-full h-full" alt="" />
                                                        </div>
                                                        <span className={`text-[12px] font-black italic tracking-tighter ${isHighPressure ? 'text-orange-500' : 'text-primary'}`}>{minutesInCar}m</span>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="text-[14px] font-black italic uppercase text-primary truncate">{m.customer}</p>
                                                        <p className="text-[11px] font-black text-brand/70 uppercase truncate mt-0.5">{m.pickup}</p>
                                                    </div>

                                                    <div className="pt-0.5">
                                                        <AnimatePresence mode="wait">
                                                            {(m.status === 'accepted' || m.status === 'requested' || m.status === 'pending') && (
                                                                <motion.button 
                                                                    key="arrived-btn"
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    onClick={() => handleArrived(m.id)}
                                                                    className="w-full py-4 bg-btn-sec border border-main rounded-2xl text-[13px] font-black uppercase tracking-widest text-muted hover:text-primary hover:border-white/20 transition-colors"
                                                                >
                                                                    ARRIVED
                                                                </motion.button>
                                                            )}
                                                            {m.status === 'arrived' && (
                                                                <motion.div 
                                                                    key="start-group"
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                                    className="flex gap-2"
                                                                >
                                                                    <motion.button 
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => setActiveMissions(prev => prev.map(mission => mission.id === m.id ? { ...mission, status: 'accepted' } : mission))}
                                                                        className="w-12 h-10 bg-surface border border-main rounded-xl flex items-center justify-center text-muted hover:text-primary transition-all"
                                                                        title="Undo Arrival"
                                                                    >
                                                                        <RotateCcw size={16} />
                                                                    </motion.button>
                                                                    <motion.button 
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleStartTrip(m.id)}
                                                                        className="flex-1 py-4 bg-[var(--brand)] text-[var(--bg-primary)] rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 transition-all"
                                                                    >
                                                                        START
                                                                    </motion.button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </motion.div>
                                </div>

                                {/* DROP-OFF TERMINAL */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic">Drop-Off</h3>
                                        </div>
                                        <div className="px-1.5 py-0.5 bg-blue-500/5 border border-blue-500/20 rounded-md">
                                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{activeMissions.filter(m => m.status === 'guest_in_car' || m.status === 'collect_payment').length} Act</span>
                                        </div>
                                    </div>
                                    <motion.div 
                                        layout
                                        className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-2 min-h-[200px]"
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {activeMissions.filter(m => m.status === 'guest_in_car' || m.status === 'collect_payment' || m.status === 'confirm_payment').map((m, i) => {
                                                const minutesInCar = Math.floor((Date.now() - m.startTime) / 60000);
                                                const isNextObjective = currentSequence.length > 0 && currentSequence[0].label.includes(m.customer);
                                                const maxWait = sharingMode === 'autobahn' ? 40 : 25;
                                                const isHighPressure = minutesInCar > (maxWait * 0.6);
                                                
                                                return (
                                                    <motion.div 
                                                        layout
                                                        key={m.id} 
                                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                        className={`flex-shrink-0 w-52 bg-[var(--bg-secondary)] backdrop-blur-2xl border rounded-[2.5rem] p-5 space-y-4 transition-all relative z-10 ${isNextObjective ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : (isHighPressure ? 'border-orange-500/30' : 'border-main')}`}
                                                    >
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDismissingMission({ id: m.id, customer: m.customer });
                                                            }}
                                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-primary rounded-full flex items-center justify-center border border-dark-900 z-20 hover:scale-110 transition-transform"
                                                        >
                                                            <X size={10} strokeWidth={3} />
                                                        </button>
                                                        <div className="flex justify-between items-center">
                                                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 overflow-hidden">
                                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.customer}`} className="w-full h-full" alt="" />
                                                            </div>
                                                            <span className={`text-[12px] font-black italic tracking-tighter ${isHighPressure ? 'text-orange-500' : 'text-primary'}`}>{minutesInCar}m</span>
                                                        </div>
                                                        
                                                        <div>
                                                            <p className="text-[14px] font-black italic uppercase text-primary truncate">{m.customer}</p>
                                                            <p className="text-[11px] font-black text-brand/70 uppercase truncate mt-0.5">{m.destination}</p>
                                                        </div>

                                                        <div className="pt-0.5">
                                                            <AnimatePresence mode="wait">
                                                                {m.status === 'confirm_payment' ? (
                                                                    <motion.button 
                                                                        key="confirm-btn"
                                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleDropOff(m.id)}
                                                                        className="w-full py-4 bg-emerald-500 text-[#000000] rounded-2xl text-[12px] font-black uppercase active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                                                                    >
                                                                        {m.paymentType === 'Cash' ? 'CONFIRM CASH' : 'CONFIRM DIGITAL'}
                                                                    </motion.button>
                                                                ) : m.status === 'collect_payment' ? (
                                                                    <motion.button 
                                                                        key="collect-btn"
                                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleDropOff(m.id)}
                                                                        className="w-full py-4 bg-amber-500 text-[#000000] rounded-2xl text-[11px] font-black uppercase active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                                                                    >
                                                                        {m.paymentType === 'Cash' ? 'COLLECT CASH' : 'VERIFY DIGITAL'}: €{(m.price || 18.40).toFixed(2)}
                                                                    </motion.button>
                                                                ) : (
                                                                    <motion.button 
                                                                        key="dropoff-btn"
                                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleDropOff(m.id)}
                                                                        className="w-full py-4 bg-blue-500 text-[#000000] rounded-2xl text-[14px] font-black uppercase active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                                                                    >
                                                                        DROP OFF
                                                                    </motion.button>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                                {/* Spacer to prevent cards from being hidden by the bottom bar */}
                                <div className="h-48 shrink-0" />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="radar"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`relative w-full h-[45vh] md:h-[600px] flex items-center justify-center transition-opacity duration-1000 ${isOnline || hasUpdates ? 'opacity-90' : 'opacity-40'}`}
                        >
                            <Radar isOnline={isOnline} hasUpdates={hasUpdates} showLogos={false} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Online Toggle & Sector Intelligence */}
                {/* Online Toggle & Sector Intelligence - Only visible on main dashboard */}
                {view === 'dashboard' && (
                    <div className="absolute bottom-6 w-full max-w-[420px] px-6 space-y-6 z-[60]">
                        {rideStatus === 'none' && isOnline && (
                            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                                {[
                                    { label: 'Station', load: 'HIGH', color: 'text-orange-500', icon: '🚉' },
                                    { label: 'Club Zone', load: 'PEAK', color: 'text-brand', icon: '🕺' },
                                    { label: 'Stadium', load: 'LOW', color: 'text-secondary', icon: '🏟️' }
                                ].map((zone, i) => (
                                    <div key={i} className="bg-dark-900/80 backdrop-blur-md border border-main rounded-xl md:rounded-[1.5rem] p-3 md:p-4 text-center relative shadow-xl">
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 md:px-3 py-0.5 md:py-1 bg-brand text-black rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest shadow-md whitespace-nowrap">{zone.label} {zone.icon}</div>
                                        <p className={`text-[9px] md:text-[11px] font-black italic mt-1 ${zone.color}`}>{zone.load}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {rideStatus === 'none' && isOnline && sharedTripsEnabled && (
                            <button
                                onClick={simulateGroupRide}
                                className="w-full py-4 bg-brand/10 border border-brand/40 rounded-2xl font-black uppercase tracking-[0.2em] italic text-brand text-[10px] shadow-lg shadow-brand/10"
                            >
                                Launch Shared-Ride Hub
                            </button>
                        )}
                        {rideStatus === 'none' && (
                            <button
                                onClick={handleOfflineRequest}
                                className={`w-full py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.25em] italic transition-all shadow-xl flex items-center justify-center gap-3 border-2 md:border-4 ${isOnline ? 'bg-brand text-dark-900 border-white/20 shadow-brand/20' : 'bg-[#1F2937] text-muted border-main shadow-black/40'}`}
                            >
                                <Zap size={22} className={`md:w-[24px] md:h-[24px] ${isOnline ? 'animate-pulse' : ''}`} />
                                {isOnline ? 'Go Offline' : 'Go Online'}
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* Post-Shift Tactical Report Sheet */}
            <Sheet
                isOpen={showOfflineReport}
                onClose={() => setShowOfflineReport(false)}
                className="max-w-[420px] mx-auto overflow-hidden"
            >
                <div className="max-h-[85vh] overflow-y-auto no-scrollbar pb-10 space-y-8">
                    <div className="text-center space-y-2 pt-4">
                        <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mx-auto mb-4 border border-brand/20">
                            <FileText size={32} />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Shift Intelligence</h2>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Incident Reports Required: {earlyDropOffs.length}</p>
                    </div>

                    <div className="space-y-6">
                        {earlyDropOffs.map((trip, idx) => (
                            <div key={trip.id} className="bg-surface border border-main rounded-[2rem] p-6 space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <div>
                                        <p className="text-[10px] font-black text-brand uppercase tracking-widest">{trip.customer}</p>
                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">Early Trip End @ {trip.time}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
                                        <AlertCircle size={16} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { label: '👤 Customer Request', id: 'request' },
                                        { label: '🚫 Customer Behavior', id: 'behavior' },
                                        { label: '🔧 Other Reasons', id: 'other' }
                                    ].map((reason) => (
                                        <button
                                            key={reason.id}
                                            onClick={() => setReportData(prev => ({ ...prev, [trip.id]: { ...prev[trip.id], reason: reason.id } }))}
                                            className={`w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left border ${reportData[trip.id]?.reason === reason.id ? 'bg-brand/20 border-brand text-brand' : 'bg-surface border-main text-secondary'}`}
                                        >
                                            {reason.label}
                                        </button>
                                    ))}
                                </div>

                                {reportData[trip.id]?.reason === 'other' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Provide Details</label>
                                        <textarea
                                            placeholder="Write situation details here..."
                                            value={reportData[trip.id]?.details || ''}
                                            onChange={(e) => setReportData(prev => ({ ...prev, [trip.id]: { ...prev[trip.id], details: e.target.value } }))}
                                            className="w-full bg-dark-950 border border-main rounded-2xl p-4 text-[10px] font-medium text-primary focus:border-brand outline-none h-24 no-scrollbar resize-none"
                                        />
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="px-2">
                        <button
                            onClick={finalizeOffline}
                            disabled={earlyDropOffs.some(t => !reportData[t.id]?.reason)}
                            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] italic text-xs shadow-xl transition-all ${!earlyDropOffs.some(t => !reportData[t.id]?.reason) ? 'bg-brand text-dark-900 shadow-brand/20 active:scale-95' : 'bg-dark-800 text-gray-600 border border-main cursor-not-allowed opacity-50'}`}
                        >
                            Submit Report & Go Offline
                        </button>
                    </div>
                </div>
            </Sheet>




                {/* Unified View Overlays */}
                <AnimatePresence>
                    {view !== 'dashboard' && view !== 'social-profile' && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute inset-0 z-50 bg-dark-950 overflow-y-auto no-scrollbar pb-32 px-6 pt-24 space-y-10"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setView('dashboard')}
                                        className="p-2 -ml-2 bg-btn-sec rounded-xl text-muted hover:text-brand transition-all"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
                                        {view === 'verification' ? 'Verification Hub' :
                                            view === 'history' ? 'Earnings History' :
                                                view === 'inbox' ? 'Inbox & Programs' :
                                                    view === 'support' ? 'Help & Support' :
                                                        view === 'profile-pic' ? 'My Profile' :
                                                            view === 'settings' ? 'App Settings' :
                                                                view === 'vehicle-hub' ? 'Vehicle Control' :
                                                                'Settings'}
                                    </h3>
                                </div>
                            </div>

                            {view === 'verification' && (
                                <div className="space-y-10">
                                    <DocumentArea
                                        title="Personal Verification"
                                        description="Driver Credentials & Identity"
                                        documents={driverDocs}
                                        onUpload={handleUploadDocument}
                                        onAccept={handleAcceptTerms}
                                        onDeny={handleDenyTerms}
                                    />

                                    <DocumentArea
                                        title="Vehicle Checks"
                                        description="Documents for driving in Frankfurt/Main"
                                        documents={vehicleDocs}
                                        onUpload={handleUploadDocument}
                                    />
                                </div>
                            )}

                            {view === 'history' && (
                                <div className="space-y-8">
                                    {/* Neural Filter - Calendar & Period Search */}
                                    <div className="bg-surface border border-main rounded-[2.5rem] p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-brand" />
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Grid Calendar Filter</h4>
                                            </div>
                                            <div className="flex bg-dark-900/50 rounded-xl p-1 border border-main">
                                                {['week', 'month'].map(r => (
                                                    <button
                                                        key={r}
                                                        onClick={() => setTimeRange(r)}
                                                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${timeRange === r ? 'bg-brand text-dark-900 shadow-brand-glow' : 'text-secondary hover:text-primary'}`}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">Search Period</p>
                                                <div className="relative group">
                                                    <select 
                                                        value={timeRange === 'week' ? selectedWeek : selectedMonth}
                                                        onChange={(e) => timeRange === 'week' ? setSelectedWeek(e.target.value) : setSelectedMonth(e.target.value)}
                                                        className="w-full bg-dark-950 border border-main rounded-2xl p-4 text-xs font-black uppercase tracking-tighter text-primary appearance-none focus:border-brand outline-none cursor-pointer group-hover:border-white/20 transition-all"
                                                    >
                                                        {timeRange === 'week' ? (
                                                            <>
                                                                <option>Week 17</option>
                                                                <option>Week 16</option>
                                                                <option>Week 15</option>
                                                                <option>Week 14</option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option>April 2026</option>
                                                                <option>March 2026</option>
                                                                <option>February 2026</option>
                                                                <option>January 2026</option>
                                                            </>
                                                        )}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand">
                                                        <Filter size={14} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[8px] font-black text-secondary uppercase tracking-widest ml-1">Payout Status</p>
                                                <div className="w-full bg-dark-950/50 border border-main rounded-2xl p-4 flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-brand italic">DISPATCHED</span>
                                                    <div className="w-2 h-2 rounded-full bg-brand" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Earnings Summary Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: timeRange === 'week' ? 'This Week' : 'Selected Month', amount: timeRange === 'week' ? 452.20 : 1840.00, color: 'text-brand' },
                                            { label: 'Avg / Trip', amount: 14.50, color: 'text-primary' },
                                            { label: '3% Platform Fee', amount: (timeRange === 'week' ? 452.20 : 1840.00) * 0.03, color: 'text-brand' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-surface border border-main rounded-2xl p-4 text-center">
                                                <p className="text-[7px] font-black uppercase tracking-widest text-secondary mb-2">{stat.label}</p>
                                                <p className={`text-sm font-black italic tracking-tighter ${stat.color}`}>€{stat.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Recent Trips</p>
                                        {tripHistory.map(trip => (
                                            <div key={trip.id} className="bg-surface border border-main rounded-3xl p-6 flex justify-between items-center group hover:border-brand/30 transition-all">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{trip.date}</p>
                                                    <h4 className="font-black italic uppercase tracking-tighter text-primary">€{trip.amount.toFixed(2)}</h4>
                                                    <p className="text-[10px] font-medium text-muted">{trip.from} → {trip.to}</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowReceipt(trip)}
                                                    className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand group-hover:bg-brand group-hover:text-dark-900 transition-all"
                                                >
                                                    Receipt
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {view === 'inbox' && (
                                <div className="space-y-6">
                                    {inboxMessages.map(msg => (
                                        <div key={msg.id} className="bg-surface border border-main rounded-3xl p-6 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-lg font-black italic uppercase tracking-tighter text-brand">{msg.title}</h4>
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{msg.date}</span>
                                            </div>
                                            <p className="text-sm text-muted font-medium leading-relaxed">{msg.content}</p>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline">Learn More →</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {view === 'support' && (
                                <div className="space-y-10">
                                    {isChatOpen ? (
                                        <div className="bg-surface border border-main rounded-[2.5rem] p-6 h-[400px] flex flex-col">
                                            <div className="flex justify-between items-center pb-4 border-b border-main mb-4">
                                                <h4 className="font-black italic uppercase tracking-tighter text-primary">Super Admin Support</h4>
                                                <button onClick={() => setIsChatOpen(false)} className="text-muted hover:text-primary"><X size={20} /></button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar mb-4">
                                                {chatMessages.map((msg, i) => (
                                                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${msg.sender === 'user' ? 'bg-[var(--brand)] text-[var(--bg-primary)] rounded-tr-sm' : 'bg-surface-light text-primary border border-main rounded-tl-sm'}`}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={chatInput}
                                                    onChange={e => setChatInput(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className="flex-1 bg-surface-light border border-main rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-brand"
                                                />
                                                <button type="submit" className="p-3 bg-[var(--brand)] text-[var(--bg-primary)] rounded-xl hover:scale-105 transition-all flex items-center justify-center">
                                                    <Navigation size={20} className="rotate-90" />
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="bg-brand/10 border border-brand/20 rounded-3xl p-8 space-y-6 text-center">
                                            <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center text-brand mx-auto">
                                                <MessageSquare size={32} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter text-primary">Chat with Super Admin</h4>
                                                <p className="text-sm text-secondary font-medium">Chat directly with the Super Admin. Please note, due to high volume, wait times are approximately 12 hours.</p>
                                            </div>
                                            <button onClick={() => setIsChatOpen(true)} className="w-full py-4 bg-[var(--brand)] text-[var(--bg-primary)] rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand/20">
                                                Start Chat
                                            </button>
                                        </div>
                                    )}

                                    <div className="bg-surface border border-main rounded-3xl p-8 space-y-4">
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Email Support</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-surface-light rounded-2xl flex items-center justify-center text-muted">
                                                <Bell size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black italic uppercase tracking-tighter text-primary underline">support@green.com</p>
                                                <p className="text-[10px] text-muted font-bold uppercase">Average response: 2 hours</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {view === 'vehicle-hub' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* VEHICLE PHOTO UPLOAD AREA */}
                                    <div className="bg-surface border border-main rounded-[2.5rem] p-8 space-y-6">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="w-full aspect-[16/9] bg-dark-950 border-2 border-dashed border-main rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                                                {vehicleInfo.photo ? (
                                                    <img src={vehicleInfo.photo} className="w-full h-full object-cover" alt="Vehicle" />
                                                ) : (
                                                    <div className="flex flex-col items-center space-y-3">
                                                        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
                                                            <Car size={32} className="text-gray-600" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Upload Vehicle Shot</p>
                                                            <p className="text-[8px] font-bold text-secondary uppercase tracking-tight">Gallery or Camera roll</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setVehicleInfo(prev => ({ ...prev, photo: reader.result }));
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                />
                                            </div>
                                            <div className="flex gap-4 w-full">
                                                <div className="flex-1 p-4 bg-brand/5 border border-brand/20 rounded-2xl flex items-center justify-center gap-3">
                                                    <Zap size={14} className="text-brand" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-brand">Auto-Verification</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* VEHICLE DATA GRID */}
                                    <div className="bg-surface border border-main rounded-[2.5rem] p-8 space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            {[
                                                { label: 'Manufacturer & Model', field: 'model', placeholder: 'e.g. Tesla Model S' },
                                                { label: 'Year of Production', field: 'year', placeholder: 'e.g. 2024' },
                                                { label: 'License Plate', field: 'plate', placeholder: 'e.g. F-GR-2024' },
                                                { label: 'Vehicle Color', field: 'color', placeholder: 'e.g. Midnight Silver' }
                                            ].map((item) => (
                                                <div key={item.field} className="space-y-2">
                                                    <label className="text-[7px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">{item.label}</label>
                                                    <input 
                                                        type="text"
                                                        value={vehicleInfo[item.field] || ''}
                                                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, [item.field]: e.target.value }))}
                                                        placeholder={item.placeholder}
                                                        className="w-full bg-dark-950 border border-main rounded-xl px-4 py-3 text-[10px] font-bold text-primary outline-none focus:border-brand/50 transition-all placeholder:text-gray-700"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <button className="w-full py-5 bg-brand text-dark-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-brand/10 hover:shadow-brand/20 active:scale-[0.98] transition-all">
                                            Update Vehicle Profile
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === 'profile-pic' && (
                                <div className="space-y-10 flex flex-col items-center py-6">
                                    {/* Avatar Section */}
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-[2.5rem] bg-brand/20 border-4 border-brand/50 p-1.5 shadow-2xl relative overflow-hidden">
                                            <img 
                                                src={tempPhotoPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                                                alt="Avatar" 
                                                className={`w-full h-full rounded-[2.1rem] bg-dark-800 ${profilePicStatus === 'pending' ? 'grayscale opacity-50' : ''}`} 
                                            />
                                            
                                            {profilePicStatus === 'pending' && (
                                                <div className="absolute inset-0 bg-[var(--bg-primary)]/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
                                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-2 border border-amber-500/30">
                                                        <Clock className="text-amber-500" size={20} />
                                                    </div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500">Awaiting Admin Approval</p>
                                                </div>
                                            )}

                                            {profilePicStatus === 'missing' && (
                                                <div className="absolute inset-0 bg-[var(--bg-primary)]/40 flex flex-col items-center justify-center cursor-pointer" onClick={() => {
                                                    alert("Simulating: Opening Phone Gallery...");
                                                    setTempPhotoPreview(`https://api.dicebear.com/7.x/avataaars/svg?seed=selected-${Date.now()}`);
                                                    setProfilePicStatus('pending');
                                                    setHasInitialPic(true);
                                                }}>
                                                    <Upload className="text-primary opacity- mb-1" size={24} />
                                                    <p className="text-[7px] font-black uppercase tracking-widest text-primary opacity-">Tap to Upload</p>
                                                </div>
                                            )}

                                            {profilePicStatus === 'verified' && (
                                                <div className="absolute inset-0 bg-[var(--bg-primary)]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => {
                                                    alert("Simulating: Opening Phone Gallery for change request...");
                                                    setProfilePicStatus('pending');
                                                }}>
                                                    <Upload className="text-brand" size={40} />
                                                </div>
                                            )}
                                        </div>
                                        {profilePicStatus !== 'pending' && (
                                            <button 
                                                onClick={() => {
                                                    alert("Simulating: Opening Phone Gallery...");
                                                    setTempPhotoPreview(`https://api.dicebear.com/7.x/avataaars/svg?seed=selected-${Date.now()}`);
                                                    setProfilePicStatus('pending');
                                                    setHasInitialPic(true);
                                                }}
                                                className="absolute -bottom-2 -right-2 w-12 h-12 bg-[var(--brand)] rounded-2xl flex items-center justify-center text-[var(--bg-primary)] shadow-xl ring-4 ring-[var(--bg-primary)] hover:scale-110 transition-transform"
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Personal Data Form */}
                                    <div className="w-full space-y-6 max-w-xl">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">First Name</label>
                                                <input type="text" placeholder="First Name" className="w-full bg-surface border border-main rounded-2xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Surname</label>
                                                <input type="text" placeholder="Surname" className="w-full bg-surface border border-main rounded-2xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Email Address</label>
                                            <input type="email" placeholder="email@green.com" className="w-full bg-surface border border-main rounded-2xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                            <input type="tel" placeholder="+49 151 ..." className="w-full bg-surface border border-main rounded-2xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Address</label>
                                            <input type="text" placeholder="Street and Number" className="w-full bg-surface border border-main rounded-2xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">City</label>
                                                <input type="text" placeholder="City" className="w-full bg-surface border border-main rounded-2xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Zip Code</label>
                                                <input type="text" placeholder="Zip Code" className="w-full bg-surface border border-main rounded-2xl p-4 text-sm font-bold text-primary focus:border-brand outline-none" />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => { alert("Profile saved successfully!"); setView('dashboard'); }}
                                            className="w-full py-5 bg-[var(--brand)] text-[var(--bg-primary)] rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                        >
                                            Save Profile Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === 'settings' && (
                                <div className="space-y-8">
                                    <div className="p-6 bg-surface border border-main rounded-[2.5rem] space-y-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                            <Shield size={80} className="text-brand" />
                                        </div>
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Profile Identity</p>
                                        <div className="space-y-6">
                                            <div className="space-y-1.5 px-2">
                                                <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={userEmail}
                                                    onChange={(e) => setUserEmail(e.target.value)}
                                                    className="w-full bg-surface border border-main rounded-2xl p-4 text-sm font-bold text-primary focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-inner"
                                                />
                                            </div>

                                            <div className="space-y-4 px-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Lock size={14} className="text-brand" />
                                                        <label className="text-[10px] font-black text-brand uppercase tracking-widest">Security Protocol</label>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Last changed: 3 months ago</span>
                                                </div>

                                                <button
                                                    onClick={() => setShowSecurityReset(true)}
                                                    className="w-full py-5 bg-surface border-2 border-dashed border-main hover:border-brand/30 hover:bg-brand/5 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all"
                                                >
                                                    <Key size={20} className="text-secondary group-hover:text-brand transition-colors" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-primary">Request Security Reset</span>
                                                </button>
                                                <p className="text-[8px] font-bold text-secondary uppercase leading-relaxed text-center px-4">
                                                    Password changes require dual-factor verification via email and SMS for your protection.
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => alert("Identity updated successfully!")}
                                                className="w-full py-4 bg-[var(--brand)] text-[var(--bg-primary)] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20 active:scale-95 transition-all mt-2"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>

                                    {/* Appearance Settings */}
                                    <div className="p-6 bg-surface border border-main rounded-[2.5rem] space-y-6">
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest">App Appearance</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setTheme('dark')}
                                                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${theme === 'dark' ? 'bg-brand/10 border-brand' : 'bg-dark-800 border-main opacity-50'}`}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-dark-950 border border-main flex items-center justify-center text-primary">
                                                    <Zap size={20} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Dark Mode</span>
                                            </button>
                                            <button
                                                onClick={() => setTheme('light')}
                                                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${theme === 'light' ? 'bg-brand/10 border-brand shadow-[0_0_20px_rgba(5,150,105,0.1)]' : 'bg-white border-gray-200 text-muted'}`}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-800 shadow-sm">
                                                    <Zap size={20} fill="currentColor" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Light Mode</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Map Settings */}
                                    <div className="p-6 bg-surface border border-main rounded-[2.5rem] space-y-4">
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Navigation Preference</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { id: 'google', name: 'Google Maps', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Google_Maps_icon_%282015-2020%29.svg' },
                                                { id: 'apple', name: 'Apple Maps', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Apple_Maps_logo.svg' }
                                            ].map((map) => (
                                                <button
                                                    key={map.id}
                                                    onClick={() => setMapPreference(map.id)}
                                                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${mapPreference === map.id ? 'bg-brand/10 border-brand' : 'bg-surface border-main'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
                                                            <img src={map.icon} alt={map.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className={`text-sm font-black italic uppercase tracking-tighter ${mapPreference === map.id ? 'text-primary' : 'text-secondary'}`}>{map.name}</span>
                                                    </div>
                                                    {mapPreference === map.id && <CheckCircle size={16} className="text-brand" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            {/* Terms Denied Block Overlay */}
            <AnimatePresence>
                {termsDenied && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-dark-950 flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
                            <X size={48} strokeWidth={3} />
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-primary mb-4">Access Restricted</h2>
                        <p className="max-w-md text-muted font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-10">
                            You have denied the platform terms & conditions. To ensure safety and legal compliance, you cannot use the Green platform without accepting the agreement.
                        </p>
                        <button
                            onClick={() => setTermsDenied(false)}
                            className="px-10 py-5 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand/20"
                        >
                            Review Terms Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Security Reset Confirmation Overlay */}
            <AnimatePresence>
                {showSecurityReset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-dark-950/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-sm bg-dark-900 border border-main rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                <ShieldCheck size={100} className="text-brand" />
                            </div>

                            <button 
                                onClick={() => { setShowSecurityReset(false); setResetConfirmed(false); }}
                                className="absolute top-6 right-6 p-2 text-secondary hover:text-primary transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <AnimatePresence mode="wait">
                                {!resetConfirmed ? (
                                    <motion.div
                                        key="request"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-2">
                                                <Key size={24} />
                                            </div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Request <span className="text-brand">Reset</span></h3>
                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-relaxed">Confirm your identity to receive a secure recovery link.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Confirm Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={14} />
                                                    <input 
                                                        type="email" 
                                                        placeholder="email@example.com"
                                                        value={confirmEmail}
                                                        onChange={(e) => setConfirmEmail(e.target.value)}
                                                        className="w-full bg-dark-800 border border-main rounded-2xl p-4 pl-10 text-xs font-bold text-primary focus:border-brand outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Confirm Number</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={14} />
                                                    <input 
                                                        type="tel" 
                                                        placeholder="+49 151 ..."
                                                        value={confirmPhone}
                                                        onChange={(e) => setConfirmPhone(e.target.value)}
                                                        className="w-full bg-dark-800 border border-main rounded-2xl p-4 pl-10 text-xs font-bold text-primary focus:border-brand outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setResetLoading(true);
                                                setTimeout(() => {
                                                    setResetLoading(false);
                                                    setResetConfirmed(true);
                                                }, 1500);
                                            }}
                                            disabled={!confirmEmail || !confirmPhone || resetLoading}
                                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${confirmEmail && confirmPhone ? 'bg-brand text-dark-900 shadow-lg shadow-brand/20 active:scale-95' : 'bg-surface text-secondary border border-main'}`}
                                        >
                                            {resetLoading ? (
                                                <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>Dispatch Recovery Link <Zap size={14} /></>
                                            )}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-6 space-y-6"
                                    >
                                        <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center text-brand mx-auto">
                                            <CheckCircle size={32} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Dispatch <span className="text-brand">Success</span></h3>
                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-relaxed">
                                                A secure verification link has been sent to your email and phone number.
                                            </p>
                                            <div className="p-6 bg-brand/5 border border-brand/20 rounded-[2.5rem] relative mt-4 shadow-xl">
                                                <div className="absolute -top-3 left-8 px-3 py-1 bg-brand text-black rounded-full text-[7px] font-black uppercase tracking-widest shadow-lg">Network Protocol 🛰️</div>
                                                <p className="text-[11px] font-black italic text-brand leading-relaxed">Partner Onboarding Active</p>
                                                <p className="text-[9px] text-[var(--text-muted)] mt-1 font-bold">Full business licensing and venue registration will be finalized in the Partner Dashboard.</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-brand/5 border border-brand/10 rounded-2xl">
                                            <p className="text-[8px] font-black text-brand uppercase tracking-widest">Development Link:</p>
                                            <a 
                                                href="/security-recovery" 
                                                className="text-[10px] font-bold text-primary underline hover:text-brand"
                                            >
                                                Open Security Terminal
                                            </a>
                                        </div>
                                        <button
                                            onClick={() => setShowSecurityReset(false)}
                                            className="w-full py-4 bg-surface hover:bg-surface-light rounded-2xl font-black uppercase tracking-widest text-[10px] text-muted"
                                        >
                                            Close Terminal
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unified Mission Lifecycle Sheet */}
            <Sheet 
                isOpen={missionSheetOpen && view === 'dashboard'} 
                onClose={() => setMissionSheetOpen(false)}
                className="max-w-[420px] mx-auto overflow-hidden"
            >
                <div className="max-h-[85vh] overflow-y-auto no-scrollbar pb-10">
                    <AnimatePresence mode="wait">
                        {missionStep === 'confirm' ? (
                            <motion.div 
                                key="confirm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8 py-4"
                            >
                                <div className="text-center space-y-3 px-6">
                                    <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mx-auto mb-4 border border-brand/20">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Mission Complete?</h3>
                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em] leading-relaxed">
                                        Confirming will finalize the node for <span className="text-primary">{currentSequence[0]?.label.split(': ')[1]}</span>.
                                    </p>
                                </div>

                                <div className="space-y-3 px-2">
                                    <button
                                        onClick={handleCompleteRide}
                                        className="w-full py-5 bg-brand text-dark-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all"
                                    >
                                        Proceed to Settlement
                                    </button>
                                    <button
                                        onClick={() => setMissionSheetOpen(false)}
                                        className="w-full py-4 bg-surface border border-main rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] text-secondary"
                                    >
                                        Mistake - Go Back
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="summary"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4 py-2"
                            >
                                <div className="text-center">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Mission Accomplished</h2>
                                    <p className="text-[8px] font-bold text-brand uppercase tracking-[0.2em]">Data Synchronized</p>
                                </div>

                                {/* High-Density Metrics */}
                                <div className="grid grid-cols-2 gap-2 px-2">
                                    <div className="bg-surface p-3 rounded-xl border border-main">
                                        <p className="text-[6px] font-black text-secondary uppercase mb-0.5">Fare</p>
                                        <p className="text-lg font-black italic text-primary">€{lastCompletedRide?.finalAmount?.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-brand/10 p-3 rounded-xl border border-brand/20 relative overflow-hidden">
                                        <Zap size={8} className="absolute top-2 right-2 text-brand opacity-40" />
                                        <p className="text-[6px] font-black text-brand uppercase mb-0.5">Bonus</p>
                                        <p className="text-lg font-black italic text-brand">€72.50</p>
                                    </div>
                                </div>

                                {/* Mandatory Vibe Check - High Density */}
                                <div className="bg-dark-950/40 border border-main rounded-2xl p-4 space-y-3 mx-2">
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[8px] font-black text-muted uppercase tracking-widest">Rate Vibe</p>
                                        <span className="text-[7px] text-gray-600 font-bold uppercase italic">Required</span>
                                    </div>

                                    <div className="grid grid-cols-5 gap-1.5">
                                        {[
                                            { emoji: '😊', id: 'friendly' },
                                            { emoji: '🤫', id: 'silent' },
                                            { emoji: '😇', id: 'polite' },
                                            { emoji: '⌚', id: 'punctual' },
                                            { emoji: '🛡️', id: 'safety' }
                                        ].map((vibe) => (
                                            <button 
                                                key={vibe.id}
                                                onClick={() => {
                                                    setSelectedEmojis(prev => 
                                                        prev.includes(vibe.id) ? prev.filter(i => i !== vibe.id) : [...prev, vibe.id]
                                                    );
                                                }}
                                                className={`flex items-center justify-center h-10 rounded-lg border-2 transition-all ${selectedEmojis.includes(vibe.id) ? 'bg-brand/20 border-brand' : 'bg-surface border-transparent opacity-40'}`}
                                            >
                                                <span className="text-xl">{vibe.emoji}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 px-2">
                                    <button 
                                        onClick={finalizeMission}
                                        className="w-full py-5 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-[0.15em] italic text-[11px] shadow-lg shadow-brand/20 active:scale-95 transition-all"
                                    >
                                        Complete & Sync: €{(lastCompletedRide?.finalAmount + 72.50).toFixed(2)}
                                    </button>
                                    <button 
                                        onClick={() => setMissionStep('confirm')}
                                        className="w-full py-2.5 bg-surface rounded-xl font-black uppercase tracking-widest text-[8px] text-secondary hover:text-primary"
                                    >
                                        ↩ Resume Trip
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Sheet>

            {/* Incoming Ride Notification - High Visibility Refactor */}
            <AnimatePresence>
                {incomingRide && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[190]"
                            onClick={() => setIncomingRide(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] z-[200]"
                        >
                            <div className={`bg-[#1a1c1e] border-2 rounded-[2.5rem] p-8 text-primary shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden ${
                                incomingRide.rideType === 'premium' ? 'border-amber-500/50 shadow-amber-500/10' : 
                                incomingRide.rideType === 'max' ? 'border-white/50 shadow-white/5' : 
                                incomingRide.rideType === 'green' ? 'border-emerald-500/50 shadow-emerald-500/10' : 
                                'border-blue-500/50 shadow-blue-500/10'
                            }`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                                <div className="relative z-10 flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                                            incomingRide.rideType === 'premium' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 
                                            incomingRide.rideType === 'max' ? 'bg-white/10 text-white border-white/20' : 
                                            incomingRide.rideType === 'green' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 
                                            'bg-blue-500/20 text-blue-500 border-blue-500/30'
                                        }`}>
                                            {incomingRide.rideType === 'premium' ? <Star size={28} /> : 
                                             incomingRide.rideType === 'max' ? <Briefcase size={28} /> : 
                                             incomingRide.rideType === 'green' ? <Zap size={28} /> : 
                                             <Users size={28} />}
                                        </div>
                                        <div>
                                            <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${
                                                incomingRide.rideType === 'premium' ? 'text-amber-500' : 
                                                incomingRide.rideType === 'max' ? 'text-white' : 
                                                incomingRide.rideType === 'green' ? 'text-emerald-500' : 
                                                'text-blue-500'
                                            }`}>
                                                {incomingRide.rideType.toUpperCase()} MISSION
                                            </p>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                                {incomingRide.rideType === 'premium' ? 'Direct Route' : 
                                                 incomingRide.rideType === 'shared pool' ? 'Shared Hub' : 'Green Transit'}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1 opacity-80">Base Payout</p>
                                        <p className="text-3xl font-black text-white tracking-tighter">€{incomingRide.price}</p>
                                    </div>
                                </div>

                                <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-dark-900/50 backdrop-blur-md p-4 rounded-3xl border border-main">
                                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-2 opacity-80">Max Occupancy</p>
                                        <div className="flex items-center gap-2 text-white">
                                            <User size={16} />
                                            <span className="text-base font-black">{incomingRide.capacity} Seats</span>
                                        </div>
                                    </div>
                                    <div className="bg-dark-900/50 backdrop-blur-md p-4 rounded-3xl border border-main">
                                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-2 opacity-80">Share Bonus</p>
                                        <div className={`flex items-center gap-2 ${
                                            incomingRide.rideType === 'premium' ? 'text-amber-500' : 
                                            incomingRide.rideType === 'max' ? 'text-white' : 
                                            incomingRide.rideType === 'green' ? 'text-emerald-500' : 
                                            'text-blue-500'
                                        }`}>
                                            <TrendingUp size={16} />
                                            <span className="text-base font-black">+{incomingRide.rideType === 'max' ? '250%' : (incomingRide.rideType === 'green' ? '180%' : '100%')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-4 mb-10">
                                    <div className="flex items-center gap-4 bg-dark-900/50 p-4 rounded-3xl border border-main/50">
                                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                                            <Navigation size={18} className="text-brand" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-80">Pickup Location</p>
                                            <p className="text-sm font-bold truncate text-white">{incomingRide.pickup}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-dark-900/50 p-4 rounded-3xl border border-main/50">
                                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                                            <MapPin size={18} className="text-orange-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-secondary uppercase tracking-widest opacity-80">Destination</p>
                                            <p className="text-sm font-bold truncate text-white">{incomingRide.destination}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 flex gap-4 mt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIncomingRide(null)}
                                        className="flex-1 py-5 bg-white/5 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white/70 hover:text-white"
                                    >
                                        Dismiss
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(255,255,255,0.4)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAcceptRide}
                                        className="flex-[2] py-5 bg-white text-[#000000] rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                    >
                                        Accept & Launch
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* TACTICAL DRIVER PROFILE EDITOR SHEET */}
            <Sheet
                isOpen={profileSheetOpen}
                onClose={() => setProfileSheetOpen(false)}
                title="Driver Identity Profile"
            >
                <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 no-scrollbar pb-6">
                    {/* Header Intro */}
                    <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-1">Telemetry Status</p>
                            <p className="text-[12px] font-bold text-primary">Verify and update your professional identity profile.</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center animate-pulse">
                            <ShieldCheck className="text-brand" size={16} />
                        </div>
                    </div>

                    {/* Profile Picture Upload Section */}
                    <div className="flex flex-col items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl text-center relative group">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-brand/40 group-hover:border-brand transition-all shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                            <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Upload size={20} className="text-brand" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white">Upload Photo</span>
                            </label>
                            <input 
                                type="file" 
                                id="avatar-upload" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setProfileData(prev => ({ ...prev, avatar: reader.result }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-black italic tracking-tighter uppercase text-white leading-tight">
                                {profileData.firstName} {profileData.lastName}
                            </h3>
                            <p className="text-[9px] font-black text-brand uppercase tracking-widest mt-1">Active Duty Driver</p>
                        </div>
                    </div>

                    {/* Details Input Form */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">First Name</label>
                                <input 
                                    type="text" 
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Last Name</label>
                                <input 
                                    type="text" 
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Email Address</label>
                            <input 
                                type="email" 
                                value={profileData.email}
                                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Phone Number</label>
                            <input 
                                type="text" 
                                value={profileData.phoneNumber}
                                onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Street Address</label>
                            <input 
                                type="text" 
                                value={profileData.address}
                                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 space-y-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Zip Code</label>
                                <input 
                                    type="text" 
                                    value={profileData.zipCode}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, zipCode: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10"
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">City</label>
                                <input 
                                    type="text" 
                                    value={profileData.city}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-2">
                        <button 
                            onClick={() => setProfileSheetOpen(false)}
                            className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-white/60 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                setProfileSheetOpen(false);
                                alert("TELEMETRY SYNCED: Profile successfully saved to GreenRide Mainframe!");
                            }}
                            className="flex-[2] py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            Save Profile
                        </button>
                    </div>
                </div>
            </Sheet>

            {/* TACTICAL DRIVER VEHICLE REGISTRATION SHEET */}
            <Sheet
                isOpen={vehicleSheetOpen}
                onClose={() => setVehicleSheetOpen(false)}
                title="Active Asset Registration"
            >
                <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 no-scrollbar pb-6">
                    {/* Status Banner */}
                    <div className="p-4 rounded-2xl flex items-center justify-between border transition-all duration-300 bg-black/45 border-white/10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Asset Verification Status</p>
                            {vehicleInfo.status === 'approved' ? (
                                <p className="text-[12px] font-black text-brand flex items-center gap-1.5 uppercase tracking-wider">
                                    <ShieldCheck size={14} className="text-brand animate-bounce" /> Verified by Khiam Azizi
                                </p>
                            ) : vehicleInfo.status === 'pending' ? (
                                <p className="text-[12px] font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
                                    <Clock size={14} className="text-amber-400" /> Awaiting Approval by Khiam Azizi
                                </p>
                            ) : (
                                <p className="text-[12px] font-black text-white/50 flex items-center gap-1.5 uppercase tracking-wider">
                                    <AlertCircle size={14} className="text-white/30" /> Unregistered Asset
                                </p>
                            )}
                        </div>
                        <div className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-md ${
                            vehicleInfo.status === 'approved' ? 'bg-brand/10 border border-brand/20 text-brand' :
                            vehicleInfo.status === 'pending' ? 'bg-amber-400/10 border border-amber-400/20 text-amber-400' :
                            'bg-white/5 border border-white/10 text-white/40'
                        }`}>
                            {vehicleInfo.status === 'approved' ? 'Active Duty' : vehicleInfo.status === 'pending' ? 'Pending Director' : 'Inactive'}
                        </div>
                    </div>

                    {/* Vehicle Photo Area */}
                    <div className="w-full aspect-[16/9] bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group">
                        {vehicleInfo.photo ? (
                            <>
                                <img src={vehicleInfo.photo} className="w-full h-full object-cover" alt="Vehicle preview" />
                                {vehicleInfo.status === 'unregistered' && (
                                    <label htmlFor="vehicle-photo-upload" className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Upload size={20} className="text-brand" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white">Upload New Shot</span>
                                    </label>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center space-y-3 p-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <Car size={32} className="text-white/40" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Upload Vehicle Shot</p>
                                    <p className="text-[8px] font-bold text-secondary uppercase tracking-tight">Camera or gallery image</p>
                                </div>
                            </div>
                        )}
                        {vehicleInfo.status === 'unregistered' && (
                            <input 
                                type="file" 
                                id="vehicle-photo-upload" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setVehicleInfo(prev => {
                                                const updated = { ...prev, photo: reader.result };
                                                localStorage.setItem('driver_vehicle_data', JSON.stringify(updated));
                                                return updated;
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        )}
                    </div>

                    {/* Details Input Form */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Manufacturer & Model</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Tesla Model Y"
                                disabled={vehicleInfo.status !== 'unregistered'}
                                value={vehicleInfo.model || ''}
                                onChange={(e) => setVehicleInfo(prev => {
                                    const updated = { ...prev, model: e.target.value };
                                    localStorage.setItem('driver_vehicle_data', JSON.stringify(updated));
                                    return updated;
                                })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10 disabled:opacity-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">License Plate (Kennzeichen)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. F-GR-2026"
                                    disabled={vehicleInfo.status !== 'unregistered'}
                                    value={vehicleInfo.plate || ''}
                                    onChange={(e) => setVehicleInfo(prev => {
                                        const updated = { ...prev, plate: e.target.value.toUpperCase() };
                                        localStorage.setItem('driver_vehicle_data', JSON.stringify(updated));
                                        return updated;
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10 disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Build Year (Baujahr)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 2025"
                                    disabled={vehicleInfo.status !== 'unregistered'}
                                    value={vehicleInfo.year || ''}
                                    onChange={(e) => setVehicleInfo(prev => {
                                        const updated = { ...prev, year: e.target.value };
                                        localStorage.setItem('driver_vehicle_data', JSON.stringify(updated));
                                        return updated;
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Vehicle Color</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Midnight Blue"
                                disabled={vehicleInfo.status !== 'unregistered'}
                                value={vehicleInfo.color || ''}
                                onChange={(e) => setVehicleInfo(prev => {
                                    const updated = { ...prev, color: e.target.value };
                                    localStorage.setItem('driver_vehicle_data', JSON.stringify(updated));
                                    return updated;
                                })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[12px] font-bold text-white focus:outline-none focus:border-brand/50 transition-all placeholder:text-white/10 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                        {vehicleInfo.status === 'approved' ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl text-center">
                                    <p className="text-[10px] font-bold text-brand uppercase tracking-wider">⚡ ASSET REGISTERED & TELEMETRY LIVE</p>
                                    <p className="text-[8px] font-semibold text-white/40 mt-1 uppercase">Ready for premium dispatch operations</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (confirm("Are you sure you want to reset this registration? This will revoke active verification status!")) {
                                            const updated = { ...vehicleInfo, status: 'unregistered' };
                                            setVehicleInfo(updated);
                                            localStorage.setItem('driver_vehicle_data', JSON.stringify(updated));
                                            if (user?.email) {
                                                updateDoc(doc(fbDb, 'users', user.email.toLowerCase()), {
                                                    vehicleInfo: null
                                                }).catch(err => console.error("Error resetting vehicle in Firestore:", err));
                                            }
                                        }
                                    }}
                                    className="w-full py-5 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    Reset Registration
                                </button>
                            </div>
                        ) : vehicleInfo.status === 'pending' ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-400/5 border border-amber-400/20 rounded-2xl text-center animate-pulse">
                                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">⏳ PENDING VERIFICATION</p>
                                    <p className="text-[8px] font-semibold text-white/40 mt-1 uppercase">Awaiting manual release inside staff dashboard</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        const updated = { ...vehicleInfo, status: 'unregistered' };
                                        setVehicleInfo(updated);
                                        localStorage.setItem('driver_vehicle_data', JSON.stringify(updated));
                                        if (user?.email) {
                                            updateDoc(doc(fbDb, 'users', user.email.toLowerCase()), {
                                                vehicleInfo: null
                                            }).catch(err => console.error("Error recalling vehicle in Firestore:", err));
                                        }
                                        alert("APPROVAL REQUEST RECALLED: Reverted back to draft status.");
                                    }}
                                    className="w-full py-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white"
                                >
                                    Recall Approval Request
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setVehicleSheetOpen(false)}
                                    className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-white/60 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        if (!vehicleInfo.model || !vehicleInfo.plate || !vehicleInfo.year || !vehicleInfo.color) {
                                            alert("Please fill out all fields before requesting approval.");
                                            return;
                                        }
                                        const updated = { ...vehicleInfo, status: 'pending', driverName: `${profileData.firstName} ${profileData.lastName}` };
                                        setVehicleInfo(updated);
                                        localStorage.setItem('driver_vehicle_data', JSON.stringify(updated));
                                        if (user?.email) {
                                            updateDoc(doc(fbDb, 'users', user.email.toLowerCase()), {
                                                vehicleInfo: updated
                                            }).catch(err => console.error("Error updating vehicle in Firestore:", err));
                                        }
                                        setVehicleSheetOpen(false);
                                        alert("VEHICLE REGISTRATION INITIATED • Secure approval request dispatched to the GreenRide Admin Portal! Awaiting verification by Chief Director Khiam Azizi.");
                                    }}
                                    className="flex-[2] py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    Request Admin Approval
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Sheet>

            {/* TACTICAL DRIVER DOCUMENT VAULT SHEET */}
            <Sheet
                isOpen={documentsSheetOpen}
                onClose={() => setDocumentsSheetOpen(false)}
                title="Compliance & Document Vault"
            >
                <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 no-scrollbar pb-6">
                    {/* Security Badge */}
                    <div className="p-4 rounded-2xl flex items-center justify-between border transition-all duration-300 bg-black/45 border-white/10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Vault Security Level</p>
                            <p className="text-[12px] font-black text-brand flex items-center gap-1.5 uppercase tracking-wider">
                                <ShieldCheck size={14} className="text-brand" /> AES-256 Military Grade Encryption
                            </p>
                        </div>
                        <div className="px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-md bg-brand/10 border border-brand/20 text-brand">
                            SECURE
                        </div>
                    </div>

                    {/* Document List */}
                    <div className="space-y-4">
                        {driverDocs.map((doc) => (
                            <div key={doc.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/20 transition-all flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black italic text-white uppercase tracking-tight">{doc.name}</p>
                                            <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${
                                                doc.status === 'verified' ? 'bg-brand/15 border border-brand/20 text-brand' :
                                                doc.status === 'pending' ? 'bg-amber-400/15 border border-amber-400/20 text-amber-400 animate-pulse' :
                                                'bg-red-500/15 border border-red-500/20 text-red-400'
                                            }`}>
                                                {doc.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">{doc.requirement}</p>
                                    </div>

                                    {/* Upload/Action Button */}
                                    {doc.id !== 'terms' && (
                                        <div className="relative">
                                            <input 
                                                type="file"
                                                accept="image/*"
                                                id={`file-input-${doc.id}`}
                                                className="hidden"
                                                disabled={doc.status === 'verified'}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const base64 = reader.result;
                                                        const updatedDocs = driverDocs.map(d => 
                                                            d.id === doc.id ? { ...d, status: 'pending', file: base64 } : d
                                                        );
                                                        setDriverDocs(updatedDocs);
                                                        localStorage.setItem('driver_compliance_docs', JSON.stringify(updatedDocs));
                                                        alert(`Document uploaded for ${doc.name} • Dispatched for manual audit!`);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    if (doc.status === 'verified') return;
                                                    document.getElementById(`file-input-${doc.id}`).click();
                                                }}
                                                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                                    doc.status === 'verified'
                                                        ? 'bg-brand/10 text-brand cursor-default'
                                                        : 'bg-white text-black hover:scale-105 active:scale-95'
                                                }`}
                                            >
                                                {doc.status === 'verified' ? 'Verified' : doc.file ? 'Replace File' : 'Upload File'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* File Preview / Thumbnail */}
                                {doc.file && (
                                    <div className="relative w-24 h-16 bg-black/40 rounded-lg overflow-hidden border border-white/10 group">
                                        <img src={doc.file} className="w-full h-full object-cover" alt="Verification preview" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-[8px] font-black uppercase tracking-wider text-white">Preview</span>
                                        </div>
                                    </div>
                                )}

                                {/* Custom UI for Terms & Conditions Checkbox */}
                                {doc.id === 'terms' && (
                                    <div className="flex items-start gap-3 mt-1 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-brand/20 transition-all">
                                        <input
                                            type="checkbox"
                                            id="terms-checkbox"
                                            disabled={doc.status === 'verified'}
                                            checked={doc.status === 'verified'}
                                            onChange={(e) => {
                                                const accepted = e.target.checked;
                                                const updatedDocs = driverDocs.map(d => 
                                                    d.id === 'terms' ? { ...d, status: accepted ? 'verified' : 'missing' } : d
                                                );
                                                setDriverDocs(updatedDocs);
                                                localStorage.setItem('driver_compliance_docs', JSON.stringify(updatedDocs));
                                            }}
                                            className="w-4 h-4 mt-0.5 rounded border-white/10 bg-white/5 text-brand focus:ring-0 focus:ring-offset-0"
                                        />
                                        <label htmlFor="terms-checkbox" className="text-[11px] font-bold text-white/60 leading-normal uppercase cursor-pointer select-none">
                                            I accept the GreenRide Partner Terms & Platform Data Usage Agreement.
                                        </label>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Summary Info */}
                    <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                        {driverDocs.every(d => d.status === 'verified') ? (
                            <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-brand uppercase tracking-wider">👑 COMPLIANCE ACTIVE • SERVICE PERMITTED</p>
                                <p className="text-[8px] font-semibold text-white/40 mt-1 uppercase">All strategic documentation is cleared by administration</p>
                            </div>
                        ) : driverDocs.some(d => d.status === 'pending') ? (
                            <div className="p-4 bg-amber-400/5 border border-amber-400/20 rounded-2xl text-center animate-pulse">
                                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">⏳ MANUAL COMPLIANCE AUDIT ACTIVE</p>
                                <p className="text-[8px] font-semibold text-white/40 mt-1 uppercase">Director Khiam Azizi is reviewing pending documents</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">⚠️ COMPLIANCE DEFICIT DETECTED</p>
                                <p className="text-[8px] font-semibold text-white/40 mt-1 uppercase">Upload all required credentials to activate dispatch access</p>
                            </div>
                        )}

                        <button 
                            onClick={() => setDocumentsSheetOpen(false)}
                            className="w-full py-5 bg-white text-black hover:scale-[1.01] active:scale-[0.99] rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Return to Cockpit
                        </button>
                    </div>
                </div>
            </Sheet>

            <PostsFeed isOpen={showPosts} onClose={() => setShowPosts(false)} />
        </div>
    );
};

export default DriverDashboard;
