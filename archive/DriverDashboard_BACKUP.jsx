import React, { useState, useEffect } from 'react';
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
    X,
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
    Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
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
    const { lang, setLang, t } = useLanguage();

    const [activeTab, setActiveTab] = useState('day');
    const [showPosts, setShowPosts] = useState(false);
    const [incomingRide, setIncomingRide] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasUpdates, setHasUpdates] = useState(true);
    const [view, setView] = useState('dashboard'); // 'dashboard' or 'verification'

    const [personalDocs, setPersonalDocs] = useState([
        { id: 'p-schein', name: 'P-Schein', status: 'missing', requirement: 'Hessen-wide Passenger Transport License' },
        { id: 'license', name: 'Driver License', status: 'verified', requirement: 'Class B EU License (Front & Back)' },
        { id: 'record', name: 'Certificate of Conduct', status: 'pending', requirement: 'Police Criminal Record (Polizeiliches Führungszeugnis)' },
        { id: 'terms', name: 'Terms & Conditions', status: 'missing', requirement: 'Platform Partnership & Data Usage Agreement' }
    ]);

    const [vehicleDocs, setVehicleDocs] = useState([
        { id: 'tuv', name: 'HU/AU (TÜV)', status: 'verified', requirement: 'Valid main inspection certificate' },
        { id: 'insurance', name: 'Commercial Insurance', status: 'missing', requirement: 'PBefG-compliant passenger insurance coverage' }
    ]);
    const [mapPreference, setMapPreference] = useState('google'); // 'google' or 'apple'
    const [theme, setTheme] = useState('dark');
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
    
    // Premium Simulated States
    const [profileSheetOpen, setProfileSheetOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'Khiam',
        lastName: 'Azizi',
        address: 'Ginnheimer Landstraße 42',
        email: 'khiam.azizi@green.com',
        zipCode: '60487',
        city: 'Frankfurt am Main',
        phone: '+49 157 8888 9999',
        profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    });

    const [vehicleSheetOpen, setVehicleSheetOpen] = useState(false);
    const [vehicleRegisterData, setVehicleRegisterData] = useState({
        licensePlate: 'F-GR-2026',
        model: 'Tesla Model S',
        buildYear: '2024',
        color: 'Metallic Green'
    });
    const [vehicleStatus, setVehicleStatus] = useState('unregistered'); // 'unregistered', 'pending', 'approved'

    const [documentsSheetOpen, setDocumentsSheetOpen] = useState(false);
    const [driverDocs, setDriverDocs] = useState([
        { id: 'profile-pic', name: 'Profile Photo', desc: 'High-resolution professional headshot', status: 'missing', type: 'image' },
        { id: 'driving-license', name: 'Driving License', desc: 'Class B EU Driving License scan', status: 'missing', type: 'image' },
        { id: 'passport', name: 'Passport / ID Card', desc: 'Biometric Passport or National ID card', status: 'missing', type: 'image' },
        { id: 'p-schein', name: 'P-Schein (Passenger Permit)', desc: 'Passenger Transport Licensing Document', status: 'missing', type: 'image' },
        { id: 'terms-agreement', name: 'Platform Terms & Conditions', desc: 'Accept legal platform agreement', status: 'missing', type: 'checkbox' }
    ]);

    const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year', 'custom'
    const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

    const [isLoggedOutSimulated, setIsLoggedOutSimulated] = useState(false);
    const [settingsNewPassword, setSettingsNewPassword] = useState('');
    const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');

    const [vehicleInfo, setVehicleInfo] = useState({ year: 2024, model: 'Tesla Model S', class: 'premium' });
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
    const [arrivalNotify, setArrivalNotify] = useState(null); // { name: string }
    const [dismissingMission, setDismissingMission] = useState(null); // { id: string, customer: string }

    const handleUploadDocument = (id) => {
        setPersonalDocs(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'pending' } : doc));
        setVehicleDocs(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'pending' } : doc));
        alert("Photo upload initiated (Simulated)");
    };

    const handleAcceptTerms = (id) => {
        setPersonalDocs(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'verified' } : doc));
        setTermsDenied(false);
        alert("Terms & Conditions Accepted!");
    };

    const handleDenyTerms = () => {
        setTermsDenied(true);
    };

    const [tripHistory, setTripHistory] = useState([
        { id: 'TRIP-1024', date: '2026-03-08 14:20', from: 'Frankfurt Airport', to: 'Mainz Hbf', amount: 42.50, status: 'completed', distance: '32 km' },
        { id: 'TRIP-1025', date: '2026-03-08 16:45', from: 'Zeil 10', to: 'Bornheim', amount: 18.20, status: 'completed', distance: '5.4 km' },
        { id: 'TRIP-1026', date: '2026-03-09 09:15', from: 'Sachsenhausen', to: 'Airport Terminal 1', amount: 38.00, status: 'completed', distance: '14.2 km' },
        { id: 'TRIP-1027', date: '2026-03-09 17:30', from: 'Messe Frankfurt', to: 'Westend', amount: 22.00, status: 'completed', distance: '6.2 km' },
        { id: 'TRIP-1028', date: '2026-03-01 11:15', from: 'Wiesbaden Hbf', to: 'Frankfurt Hbf', amount: 55.00, status: 'completed', distance: '40 km' },
        { id: 'TRIP-1029', date: '2026-02-14 20:00', from: 'Bockenheim', to: 'Nordend', amount: 15.50, status: 'completed', distance: '4.8 km' }
    ]);

    const [inboxMessages, setInboxMessages] = useState([
        { id: 1, title: 'New Bonus Program', content: 'Earn 20% more for rides between 18:00 and 22:00 starting next Monday!', date: 'Today' },
        { id: 2, title: 'Frankfurt Auto Show', content: 'High demand expected near the Messe area. Prepare for increased surge pricing.', date: 'Yesterday' }
    ]);

    const [showReceipt, setShowReceipt] = useState(null);

    const stats = {
        day: { earnings: 142.50, trips: 12, hours: 6.5, rating: 4.8 },
        week: { earnings: 840.20, trips: 64, hours: 38.2, rating: 4.9 },
        month: { earnings: 3250.00, trips: 245, hours: 162, rating: 4.85 },
        year: { earnings: 38540.00, trips: 2840, hours: 1920, rating: 4.88 }
    };

    const currentStats = stats[activeTab];

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Live Telemetry Sync Protocol for Cross-Iframe Compliance Vault Review
    useEffect(() => {
        const handleStorageSync = () => {
            // Sync Vehicle Status
            const storedVehicle = localStorage.getItem('driver_vehicle_data');
            if (storedVehicle) {
                try {
                    const parsed = JSON.parse(storedVehicle);
                    if (parsed.status) {
                        setVehicleStatus(parsed.status);
                        setVehicleRegisterData(parsed);
                    }
                } catch (e) {
                    console.error("Error parsing stored vehicle", e);
                }
            }

            // Sync Compliance Documents Status
            const storedDocs = localStorage.getItem('driver_compliance_docs');
            if (storedDocs) {
                try {
                    const parsed = JSON.parse(storedDocs);
                    // Update only if status actually changed to avoid infinite state loop
                    setDriverDocs(parsed);
                } catch (e) {
                    console.error("Error parsing stored docs", e);
                }
            }
        };

        // Run initially
        handleStorageSync();

        // Listen for storage events across frames
        window.addEventListener('storage', handleStorageSync);
        
        // Polling fallback every 2 seconds for immediate reactive UX
        const interval = setInterval(handleStorageSync, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageSync);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (!isOnline) return;

        // Determine Sharing Mode based on primary mission
        if (activeMissions.length > 0) {
            const primary = activeMissions[0];
            const dist = parseFloat(primary.distance);
            if (dist > 25) setSharingMode('autobahn');
            else setSharingMode('urban');
        } else {
            setSharingMode('urban');
        }

        const timer = setTimeout(() => {
            const types = ['green', 'max', 'premium'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const basePrice = randomType === 'max' ? 24.50 : (randomType === 'premium' ? 28.00 : 18.40);
            
            const newRide = {
                id: `RIDE-${Date.now()}`,
                customer: activeMissions.length > 0 ? 'Aggregated Guest' : 'Primary Passenger',
                pickup: activeMissions.length > 0 ? 'Shared Hub Sector' : 'Kurfürstendamm 21',
                destination: activeMissions.length > 0 ? 'Shared Drop-off' : 'Berlin Hauptbahnhof',
                basePrice: basePrice,
                price: basePrice,
                distance: activeMissions.length > 0 ? '8.4 km' : (Math.random() > 0.7 ? '32.5 km' : '4.2 km'),
                coords: { lat: 50.115 + (Math.random() * 0.01), lng: 8.685 + (Math.random() * 0.01) },
                isFollowUp: activeMissions.length > 0,
                rideType: randomType,
                capacity: randomType === 'max' ? 8 : (randomType === 'premium' ? 4 : 3)
            };

            // DUAL-MODE LOGIC SIMULATION
            const radius = sharingMode === 'autobahn' ? 3000 : 1000;
            const angle = sharingMode === 'autobahn' ? 90 : 30;

            // AGGREGATION REQUEST SIMULATION: Only show if within corridor rules
            if (rideStatus === 'active_multi' && randomType !== 'premium') {
                const detourDist = Math.random() * 5000;
                if (detourDist < radius) {
                    setIncomingRide(newRide);
                    console.log(`AGGREGATION REQUEST [${sharingMode.toUpperCase()}]: Corridor match found. Driver confirmation required.`);
                }
            }
        }, 8000);
        return () => clearTimeout(timer);
    }, [isOnline, rideStatus, activeMissions, sharingMode]);

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
            sequence.push({ id: m.id, type: 'pickup', coord: m.pickupCoord, label: `Pick-up: ${m.customer}`, customer: m.customer });
        });
        dropoffs.forEach(m => {
            sequence.push({ id: m.id, type: 'dropoff', coord: m.destCoord, label: `Drop-off: ${m.customer}`, customer: m.customer });
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
        // Enforce: Premium rides stop any further sharing
        if (incomingRide.rideType === 'premium' && activeMissions.length > 0) {
            alert("CANNOT MERGE: Premium missions require dedicated transit.");
            return;
        }

        const newMission = {
            ...incomingRide,
            status: 'requested',
            startTime: Date.now(),
            pickupCoord: incomingRide.coords || { lat: 50.115, lng: 8.685 },
            destCoord: { lat: 50.112, lng: 8.692 } // Realistic Drop-off for simulation
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
        lockAction();
        // Find mission to send notification
        const mission = activeMissions.find(m => m.id === (missionId || currentSequence[0]?.id));
        if (mission) {
            const targetId = mission.id;
            setArrivalNotify({ name: mission.customer });
            setTimeout(() => setArrivalNotify(null), 10000);
            
            setActiveMissions(prev => prev.map(m => 
                m.id === targetId ? { ...m, status: 'arrived', arrivedTime: Date.now() } : m
            ));
        }
        
        // Sequence stays on pickup until trip starts
    };

    const handleStartTrip = (missionId) => {
        if (isActionLocked) return;
        lockAction();
        const id = missionId || currentSequence[0]?.id;

        setActiveMissions(prev => prev.map(m => 
            m.id === id ? { ...m, status: 'guest_in_car', startTime: Date.now() } : m
        ));
        
        // Update sequence logic to focus on drop-off
        setCurrentSequence(prev => prev.map(s => 
            s.id === id && s.type === 'pickup' ? { ...s, type: 'dropoff', label: `Drop-off: ${s.customer}` } : s
        ));
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
        }

        const remaining = activeMissions.filter(m => m.id !== id);
        setActiveMissions(remaining);
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
        if (earlyDropOffs.length > 0) {
            setShowOfflineReport(true);
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
            { id: 'M-1', customer: 'Lukas M.', pickup: 'Hauptwache', pickupCoord: { lat: 50.113, lng: 8.680 }, destCoord: { lat: 50.125, lng: 8.710 }, status: 'picked_up', startTime: Date.now() - 600000, rideType: 'green', basePrice: 18.00 },
            { id: 'M-2', customer: 'Sarah K.', pickup: 'Zeil', pickupCoord: { lat: 50.114, lng: 8.685 }, destCoord: { lat: 50.110, lng: 8.720 }, status: 'accepted', startTime: Date.now(), rideType: 'green', basePrice: 15.00 }
        ];

        // Scenario 2: Sequential Premium Chain
        const premiumMissions = [
            { id: 'P-1', customer: 'Dominik W.', pickup: 'Westend', pickupCoord: { lat: 50.118, lng: 8.665 }, destCoord: { lat: 50.130, lng: 8.680 }, status: 'picked_up', startTime: Date.now() - 300000, rideType: 'premium', basePrice: 45.00 },
            { id: 'P-2', customer: 'Helena R.', pickup: 'Skyline Plaza', pickupCoord: { lat: 50.108, lng: 8.650 }, destCoord: { lat: 50.090, lng: 8.620 }, status: 'pending', startTime: Date.now(), rideType: 'premium', basePrice: 52.00 }
        ];

        // Logic: If already sharing, only send Green. If Premium eligible and car empty, can send Premium.
        const canTakePremium = isPremiumEligible && activeMissions.every(m => m.rideType === 'premium');

        if (canTakePremium && activeMissions.length === 0) {
            setActiveMissions([premiumMissions[0]]);
            setActiveRidesCount(1);
            setCurrentOccupancy(1);
            setRideStatus('active_multi');
            // Mock receiving the second one later
            setTimeout(() => {
                setActiveMissions(prev => [...prev, premiumMissions[1]]);
            }, 3000);
            setActiveMissions(mixedMissions);
            setActiveRidesCount(2);
            setCurrentOccupancy(1);
            setRideStatus('active_multi');
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
        <div className="relative w-full h-screen overflow-hidden bg-dark-950 font-sans text-white flex flex-col items-center">
            {/* Arrival Notification Top Sheet */}
            <AnimatePresence>
                {arrivalNotify && (
                    <motion.div 
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="absolute top-4 z-[100] w-full max-w-[340px] px-4"
                    >
                        <div className="bg-dark-900/80 backdrop-blur-3xl border border-brand/30 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
                                <Bell className="text-brand" size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-0.5">Rider Notified</p>
                                <p className="text-[12px] font-bold text-white leading-tight">
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
            </AnimatePresence>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activeView={view}
                onItemClick={(id) => {
                    if (id === 'overview') {
                        setView('dashboard');
                    } else if (id === 'profile-pic') {
                        setProfileSheetOpen(true);
                    } else if (id === 'vehicle-hub') {
                        setVehicleSheetOpen(true);
                    } else if (id === 'verification') {
                        setDocumentsSheetOpen(true);
                    } else if (id === 'navigation-settings' || id === 'settings') {
                        setView('settings');
                    } else if (id === 'history') {
                        setView('history');
                    } else {
                        setView(id);
                    }
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
                        <p className="text-[12px] font-bold text-white">
                            You are about to end the mission for <span className="text-red-500 italic uppercase font-black">{dismissingMission?.customer}</span> before reaching the destination.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Select Reason</p>
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
                                className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-red-500/50 transition-all">
                                    <reason.icon size={18} className="text-gray-400 group-hover:text-red-500" />
                                </div>
                                <span className="text-[13px] font-bold text-white uppercase tracking-tight">{reason.label}</span>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setDismissingMission(null)}
                        className="w-full py-4 bg-white/5 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                    >
                        Keep Mission Active
                    </button>
                </div>
            </Sheet>

            {/* Header - Fixed at top */}
            {/* Header - Fixed at top - Only visible in main dashboard view */}
            {view === 'dashboard' && (
                <header className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center bg-gradient-to-b from-dark-950 to-transparent pointer-events-none">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <div className="flex items-center gap-4 relative z-30 pointer-events-auto">
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-brand hover:bg-brand/10 transition-all shadow-lg relative group"
                            >
                                <Menu size={22} />
                                {personalDocs.some(d => d.status === 'missing') && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0B121E]" />
                                )}
                            </button>
                            
                            {view !== 'dashboard' && (
                                <button 
                                    onClick={() => setView('dashboard')}
                                    className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all shadow-lg"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setView('social-profile')}>
                                <span className="text-[6px] font-black text-brand uppercase tracking-widest bg-brand/5 px-1.5 py-0.5 rounded border border-brand/20 shadow-[0_0_10px_rgba(0,212,255,0.1)]">ID: GRN-{user?.id || '921Z'}</span>
                            </div>
                            <div className="cursor-pointer" onClick={() => setView('social-profile')}>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-brand' : 'bg-gray-500'}`} />
                                    {isOnline ? 'Searching' : 'Offline'}
                                </p>
                                <h2 className="text-sm font-black italic uppercase tracking-tighter -mt-1">{user?.name}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Center - Daily Balance */}
                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto top-6 z-30">
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <div
                                    className="flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-md transition-all group"
                                    style={{
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--border-main)',
                                        boxShadow: '0 8px 32px var(--shadow-main)'
                                    }}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand/80 mb-0.5 group-hover:text-brand transition-colors">Total Funds</span>
                                        <div className="flex items-center justify-center min-w-[70px]">
                                            <span className={`text-lg font-black italic tracking-tighter transition-all duration-300 ${isBalanceVisible ? 'text-white' : 'text-white/40 mt-1'}`}>
                                                {isBalanceVisible ? `€${currentStats.earnings.toFixed(2)}` : '••••••'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-[1px] h-8 bg-white/10 mx-1" />
                                    <button
                                        onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                                        className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-brand active:scale-95"
                                    >
                                        {isBalanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <span className="text-[6px] font-bold text-gray-500 uppercase tracking-widest mt-1">Settled Weekly to Fleet Manager Vault</span>
                            </motion.div>
                    </div>

                    <div className="flex gap-3 relative z-30 pointer-events-auto">
                        <button
                            onClick={() => setShowPosts(!showPosts)}
                            className={`p-3 rounded-2xl transition-all ${showPosts ? 'bg-brand text-dark-900 shadow-lg shadow-brand/30 ring-2 ring-brand/50' : 'glass text-gray-400 hover:text-white'}`}
                        >
                            <Zap size={22} className={showPosts ? 'animate-pulse' : ''} />
                        </button>
                        <button
                            onClick={() => setView('inbox')}
                            className={`p-3 rounded-2xl transition-all ${hasUpdates ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-400/50' : 'glass text-gray-400 hover:text-white'}`}
                        >
                            <Bell size={22} className={hasUpdates ? 'animate-bounce' : ''} />
                        </button>
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
                            <div className="fixed top-8 left-6 right-6 z-[100] flex justify-between items-center pointer-events-none">
                                <div className="flex gap-4 pointer-events-auto">
                                    <button 
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-brand hover:bg-brand/10 transition-all shadow-lg"
                                    >
                                        <Menu size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setView('dashboard')}
                                        className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all shadow-lg"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setView('dashboard')}
                                    className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-brand hover:bg-brand/10 transition-all shadow-lg pointer-events-auto group"
                                >
                                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center mb-10">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-brand/10 border-4 border-brand/20 p-2 shadow-2xl relative group">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="w-full h-full rounded-[2rem] object-cover" />
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-dark-900 border-4 border-[#0B121E]">
                                        <CheckCircle size={20} />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter mt-6">{user?.name}</h2>
                                <p className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mt-2">Certified Green Pilot • Tier 1</p>
                                
                                <div className="flex gap-8 mt-8">
                                    <div className="text-center">
                                        <p className="text-xl font-black italic">4.92</p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Rating</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-black italic text-brand">{user?.greenFlags > 1000 ? (user.greenFlags / 1000).toFixed(1) + 'K' : user?.greenFlags || '2.4K'}</p>
                                        <div className="flex items-center justify-center gap-1">
                                            <Zap size={8} className="text-brand fill-brand" />
                                            <p className="text-[8px] font-bold text-brand uppercase tracking-widest">Flags</p>
                                        </div>
                                    </div>
                                    {user?.redFlags > 0 && (
                                        <div className="text-center">
                                            <p className="text-xl font-black italic text-red-500">{user.redFlags}</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <AlertCircle size={8} className="text-red-500 fill-red-500" />
                                                <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Red Flags</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="text-xl font-black italic">1.2K</p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Missions</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-black italic">8.4K</p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Followers</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex justify-between items-end px-2">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">My <span className="text-brand">Discovery Stories</span></h3>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => alert("Simulating: Opening Gallery for Photos...")}
                                            className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
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
                                        <div key={i} className="aspect-[9/16] bg-dark-900 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                                            <img src={story.img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt="Story" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                                                <p className="text-[10px] font-black italic text-white uppercase truncate">{story.title}</p>
                                                <p className="text-[8px] font-bold text-brand uppercase mt-1">{story.views} Views</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (rideStatus === 'active_multi' || activeMissions.length > 0) ? (
                        <motion.div 
                            key="hub"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex-1 w-full p-6 flex flex-col pt-24 min-h-0"
                        >
                            {/* --- NEURAL DATA STRIP (SLIM STATS) --- */}
                            <div className="flex items-center gap-4 mb-4 px-4 py-2 bg-white/2 border border-white/5 rounded-2xl backdrop-blur-md">
                                <button 
                                    onClick={() => {
                                        setActiveMissions([]);
                                        setRideStatus('none');
                                    }}
                                    className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all mr-2"
                                    title="Exit Mission Control"
                                >
                                    <ChevronLeft size={14} strokeWidth={3} />
                                </button>
                                {[
                                    { label: 'LOAD', value: 'OPTIMAL', color: 'text-brand' },
                                    { label: 'MISSIONS', value: activeMissions.length, color: 'text-white' },
                                    { label: 'CAPACITY', value: `${currentOccupancy}/${vehicleCapacity}`, color: 'text-brand' },
                                    { label: 'SESSION', value: '4:12', color: 'text-white/60' }
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 pr-4 border-r border-white/5 last:border-0">
                                        <span className="text-[6px] font-black uppercase tracking-widest text-gray-500">{s.label}</span>
                                        <span className={`text-[9px] font-black italic uppercase ${s.color}`}>{s.value}</span>
                                    </div>
                                ))}
                                <div className="flex-1" />
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all ${sharingMode === 'autobahn' ? 'bg-brand/10 border-brand text-brand' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                    <div className={`w-1 h-1 rounded-full ${sharingMode === 'autobahn' ? 'bg-brand' : 'bg-gray-600'}`} />
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em]">{sharingMode} MODE</span>
                                </div>
                            </div>

                            {/* --- GLOBAL LIVE NAVIGATION HUB (MAP) --- */}
                            <div className="relative h-[35vh] min-h-[250px] bg-dark-900/40 border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl group z-0">
                                {/* Objective HUD Overlay */}
                                {currentSequence.length > 0 && (
                                    <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-between items-start pointer-events-none">
                                        <div className="bg-dark-950/90 backdrop-blur-md border border-brand/40 p-4 rounded-3xl shadow-2xl max-w-[240px] pointer-events-auto ring-4 ring-black/40">
                                            <p className="text-[8px] font-black text-brand uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand"></div> Next Objective
                                            </p>
                                            <h4 className="text-sm font-black italic uppercase text-white truncate">{currentSequence[0].label}</h4>
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        animate={{ width: ['20%', '95%', '20%'] }}
                                                        transition={{ duration: 8, repeat: Infinity }}
                                                        className="h-full bg-brand shadow-[0_0_10px_var(--brand)]" 
                                                    />
                                                </div>
                                                <span className="text-[8px] font-black text-brand uppercase">ETA 4 MIN</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                setRideStatus('none');
                                                setActiveMissions([]);
                                                setCurrentSequence([]);
                                            }}
                                            className="pointer-events-auto p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500/20 shadow-xl transition-all"
                                            title="Abort All Missions"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                                <MapContainer 
                                    center={[currentPos.lat, currentPos.lng]} 
                                    zoom={14} 
                                    zoomControl={false}
                                    style={{ height: '100%', width: '100%', background: '#0B121E' }}
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />
                                    
                                    <MapRecenter pos={currentPos} />

                                    {/* Driver Marker */}
                                    <Marker position={[currentPos.lat, currentPos.lng]} icon={driverIcon} />

                                    {/* Path Polyline */}
                                    {currentSequence.length > 0 && (
                                        <Polyline 
                                            positions={[
                                                [currentPos.lat, currentPos.lng],
                                                ...currentSequence.map(s => [s.coord.lat, s.coord.lng])
                                            ]}
                                            color="var(--brand)"
                                            weight={4}
                                            opacity={0.6}
                                            dashArray="10, 10"
                                        />
                                    )}

                                </MapContainer>

                                <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-gradient-to-t from-brand/20 to-transparent"></div>
                                <div className="absolute inset-0 pointer-events-none z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                            </div>

                            {/* --- ACTION HUD: MISSION COMMAND CENTER --- */}
                            {currentSequence.length > 0 && (
                                <div className="mt-6 flex flex-col gap-4 px-2">
                                    {/* Navigation Row */}
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={openExternalMap}
                                            className="flex-1 py-5 bg-brand text-dark-900 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-brand/20 flex items-center justify-center gap-3 active:scale-95 transition-all border-4 border-white/10"
                                        >
                                            <Navigation size={20} /> START GPS NAVIGATION
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setCurrentPos(prev => ({ lat: prev.lat + 0.0015, lng: prev.lng + 0.0015 }));
                                            }}
                                            className="p-5 bg-dark-800 border border-white/10 rounded-3xl text-brand hover:bg-brand/10 transition-all shadow-lg active:scale-95"
                                        >
                                            <Zap size={24} />
                                        </button>
                                    </div>

                                    {/* Core Action Row */}
                                    <div className="flex gap-3">
                                        {(() => {
                                            const target = currentSequence[0];
                                            const mission = activeMissions.find(m => m.id === target?.id);
                                            const isShared = activeMissions.length > 1;
                                            
                                            const getRideConfig = () => {
                                                if (isShared) return { label: 'SHARED POOL', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: '⚡' };
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
                                                            <span className="text-[6px] font-black tracking-widest opacity-60 uppercase">Mission Class</span>
                                                            <span className="text-[11px] font-black italic tracking-tight">{config.label}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 bg-white/2 border border-white/5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <span className="text-[6px] font-black tracking-widest text-gray-500 uppercase">Target Sector</span>
                                                        <span className="text-[10px] font-black text-white italic">{mission?.pickup?.split(' ')[0] || mission?.destination?.split(' ')[0] || 'FRANKFURT'}</span>
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
                                            <h3 className="text-[7px] font-black uppercase tracking-[0.1em] text-white/40 italic">Pick-Up</h3>
                                        </div>
                                        <div className="px-1.5 py-0.5 bg-brand/5 border border-brand/20 rounded-md">
                                            <span className="text-[6px] font-black text-brand uppercase">{activeMissions.filter(m => m.status !== 'guest_in_car' && m.status !== 'collect_payment').length} In</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-2 min-h-[120px]">
                                        {activeMissions.filter(m => m.status !== 'guest_in_car' && m.status !== 'collect_payment').map((m, i) => {
                                            const minutesInCar = Math.floor((Date.now() - m.startTime) / 60000);
                                            const isNextObjective = currentSequence.length > 0 && currentSequence[0].label.includes(m.customer);
                                            const maxWait = sharingMode === 'autobahn' ? 40 : 25;
                                            const isHighPressure = minutesInCar > (maxWait * 0.6);
                                            
                                            return (
                                                <motion.div 
                                                    layout
                                                    key={m.id} 
                                                    className={`flex-shrink-0 w-32 bg-dark-900/90 backdrop-blur-2xl border rounded-[1.5rem] p-2.5 space-y-2 transition-all relative z-10 ${isNextObjective ? 'border-brand shadow-[0_0_10px_rgba(0,212,255,0.2)]' : (isHighPressure ? 'border-orange-500/30' : 'border-white/5')}`}
                                                >
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMissions(prev => prev.filter(mission => mission.id !== m.id));
                                                        }}
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center border border-dark-900 z-20 hover:scale-110 transition-transform"
                                                    >
                                                        <X size={10} strokeWidth={3} />
                                                    </button>
                                                    <div className="flex justify-between items-center">
                                                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.customer}`} className="w-full h-full" alt="" />
                                                        </div>
                                                        <span className={`text-[10px] font-black italic tracking-tighter ${isHighPressure ? 'text-orange-500' : 'text-white'}`}>{minutesInCar}m</span>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="text-[8px] font-black italic uppercase text-white truncate">{m.customer}</p>
                                                        <p className="text-[6px] font-bold text-gray-500 uppercase truncate mt-0.5">{m.pickup}</p>
                                                    </div>

                                                    <div className="pt-0.5">
                                                        {m.status !== 'accepted' && m.status !== 'arrived' && (
                                                            <button 
                                                                onClick={() => setActiveMissions(prev => prev.map(mission => mission.id === m.id ? { ...mission, status: 'accepted' } : mission))}
                                                                className="w-full py-2 bg-brand text-dark-900 rounded-lg text-[7px] font-black uppercase tracking-widest"
                                                            >
                                                                ACCEPT
                                                            </button>
                                                        )}
                                                        {m.status === 'accepted' && (
                                                            <button 
                                                                onClick={() => handleArrived(m.id)}
                                                                className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[7px] font-black uppercase tracking-widest text-gray-400"
                                                            >
                                                                ARRIVED
                                                            </button>
                                                        )}
                                                        {m.status === 'arrived' && (
                                                            <button 
                                                                onClick={() => handleStartTrip(m.id)}
                                                                className="w-full py-2 bg-brand text-dark-900 rounded-lg text-[7px] font-black uppercase tracking-widest"
                                                            >
                                                                START
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* DROP-OFF TERMINAL */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            <h3 className="text-[7px] font-black uppercase tracking-[0.1em] text-white/40 italic">Drop-Off</h3>
                                        </div>
                                        <div className="px-1.5 py-0.5 bg-blue-500/5 border border-blue-500/20 rounded-md">
                                            <span className="text-[6px] font-black text-blue-400 uppercase">{activeMissions.filter(m => m.status === 'guest_in_car' || m.status === 'collect_payment').length} Act</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-2 min-h-[120px]">
                                        {activeMissions.filter(m => m.status === 'guest_in_car' || m.status === 'collect_payment').map((m, i) => {
                                            const minutesInCar = Math.floor((Date.now() - m.startTime) / 60000);
                                            const isNextObjective = currentSequence.length > 0 && currentSequence[0].label.includes(m.customer);
                                            const maxWait = sharingMode === 'autobahn' ? 40 : 25;
                                            const isHighPressure = minutesInCar > (maxWait * 0.6);
                                            
                                            return (
                                                <motion.div 
                                                    layout
                                                    key={m.id} 
                                                    className={`flex-shrink-0 w-32 bg-dark-900/90 backdrop-blur-2xl border rounded-[1.5rem] p-2.5 space-y-2 transition-all relative z-10 ${isNextObjective ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : (isHighPressure ? 'border-orange-500/30' : 'border-white/5')}`}
                                                >
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDismissingMission({ id: m.id, customer: m.customer });
                                                        }}
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center border border-dark-900 z-20 hover:scale-110 transition-transform"
                                                    >
                                                        <X size={10} strokeWidth={3} />
                                                    </button>
                                                    <div className="flex justify-between items-center">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 overflow-hidden">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.customer}`} className="w-full h-full" alt="" />
                                                        </div>
                                                        <span className={`text-[10px] font-black italic tracking-tighter ${isHighPressure ? 'text-orange-500' : 'text-white'}`}>{minutesInCar}m</span>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="text-[8px] font-black italic uppercase text-white truncate">{m.customer}</p>
                                                        <p className="text-[6px] font-bold text-gray-500 uppercase truncate mt-0.5">{m.destination}</p>
                                                    </div>

                                                    <div className="pt-0.5">
                                                        {m.status === 'collect_payment' ? (
                                                            <button 
                                                                onClick={() => handleDropOff(m.id)}
                                                                className="w-full py-2 bg-amber-500 text-dark-900 rounded-lg text-[7px] font-black uppercase"
                                                            >
                                                                CASH
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleDropOff(m.id)}
                                                                className="w-full py-2 bg-blue-500 text-white rounded-lg text-[7px] font-black uppercase"
                                                            >
                                                                DROP
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="radar"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`relative w-full h-[600px] flex items-center justify-center transition-opacity duration-1000 ${isOnline || hasUpdates ? 'opacity-90' : 'opacity-40'}`}
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
                            <div className="grid grid-cols-3 gap-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                                {[
                                    { label: 'Station', load: 'HIGH', color: 'text-orange-500', icon: '🚉' },
                                    { label: 'Club Zone', load: 'PEAK', color: 'text-brand', icon: '🕺' },
                                    { label: 'Stadium', load: 'LOW', color: 'text-gray-500', icon: '🏟️' }
                                ].map((zone, i) => (
                                    <div key={i} className="bg-dark-900/80 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-4 text-center relative shadow-xl">
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-brand text-black rounded-full text-[5px] font-black uppercase tracking-widest shadow-md whitespace-nowrap">{zone.label} {zone.icon}</div>
                                        <p className={`text-[11px] font-black italic mt-1 ${zone.color}`}>{zone.load}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {rideStatus === 'none' && isOnline && (
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
                                className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.25em] italic transition-all shadow-xl flex items-center justify-center gap-3 border-4 ${isOnline ? 'bg-brand text-dark-900 border-white/20 shadow-brand/20' : 'bg-[#1F2937] text-gray-400 border-white/5 shadow-black/40'}`}
                            >
                                <Zap size={24} className={isOnline ? 'animate-pulse' : ''} />
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
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Incident Reports Required: {earlyDropOffs.length}</p>
                    </div>

                    <div className="space-y-6">
                        {earlyDropOffs.map((trip, idx) => (
                            <div key={trip.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
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
                                            className={`w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left border ${reportData[trip.id]?.reason === reason.id ? 'bg-brand/20 border-brand text-brand' : 'bg-white/5 border-white/5 text-gray-500'}`}
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
                                            className="w-full bg-dark-950 border border-white/10 rounded-2xl p-4 text-[10px] font-medium text-white focus:border-brand outline-none h-24 no-scrollbar resize-none"
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
                            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] italic text-xs shadow-xl transition-all ${!earlyDropOffs.some(t => !reportData[t.id]?.reason) ? 'bg-brand text-dark-900 shadow-brand/20 active:scale-95' : 'bg-dark-800 text-gray-600 border border-white/5 cursor-not-allowed opacity-50'}`}
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
                            className="absolute inset-0 z-50 bg-[#0B121E] overflow-y-auto no-scrollbar pb-32 px-6 pt-24 space-y-10"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setView('dashboard')}
                                        className="p-2 -ml-2 bg-white/5 rounded-xl text-gray-400 hover:text-brand transition-all"
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
                                        documents={personalDocs}
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

                            {view === 'history' && (() => {
                                // Dynamic filtering logic based on intervals from March 9, 2026
                                const filteredTrips = tripHistory.filter(trip => {
                                    const tripDateStr = trip.date.split(' ')[0]; // YYYY-MM-DD
                                    if (timeRange === 'day') {
                                        return tripDateStr === '2026-03-09';
                                    } else if (timeRange === 'week') {
                                        return tripDateStr >= '2026-03-02' && tripDateStr <= '2026-03-09';
                                    } else if (timeRange === 'month') {
                                        return tripDateStr.startsWith('2026-03');
                                    } else if (timeRange === 'year') {
                                        return tripDateStr.startsWith('2026');
                                    } else if (timeRange === 'custom') {
                                        return tripDateStr >= customStartDate && tripDateStr <= customEndDate;
                                    }
                                    return true;
                                });

                                const grossEarnings = filteredTrips.reduce((acc, curr) => acc + curr.amount, 0);
                                const commission = grossEarnings * 0.15; // 15% platform commission
                                const netEarnings = grossEarnings - commission;

                                return (
                                    <div className="space-y-8 animate-fadeIn">
                                        {/* Neural Filter - Calendar & Period Search */}
                                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-6">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-brand" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Grid Calendar Filter</h4>
                                                </div>
                                                <div className="flex bg-dark-900/50 rounded-xl p-1 border border-white/5 gap-1 overflow-x-auto no-scrollbar shrink-0 max-w-[65%]">
                                                    {['day', 'week', 'month', 'year', 'custom'].map(r => (
                                                        <button
                                                            key={r}
                                                            onClick={() => setTimeRange(r)}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${timeRange === r ? 'bg-brand text-dark-900 shadow-brand-glow' : 'text-gray-500 hover:text-white'}`}
                                                        >
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {timeRange === 'custom' ? (
                                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 animate-fadeIn">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black text-brand uppercase tracking-widest ml-1">Start Date</label>
                                                        <input
                                                            type="date"
                                                            value={customStartDate}
                                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                                            className="w-full bg-dark-950 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-brand outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black text-brand uppercase tracking-widest ml-1">End Date</label>
                                                        <input
                                                            type="date"
                                                            value={customEndDate}
                                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                                            className="w-full bg-dark-950 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-brand outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Selected Interval</p>
                                                        <div className="w-full bg-dark-950 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase tracking-tighter text-white">
                                                            {timeRange === 'day' && 'Today (09.03.2026)'}
                                                            {timeRange === 'week' && 'This Week (02.03 - 09.03)'}
                                                            {timeRange === 'month' && 'This Month (March 2026)'}
                                                            {timeRange === 'year' && 'Year 2026'}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Payout Status</p>
                                                        <div className="w-full bg-dark-950/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-brand italic">DISPATCHED</span>
                                                            <div className="w-2 h-2 rounded-full bg-brand" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Earnings Summary Grid */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                                <p className="text-[7px] font-black uppercase tracking-widest text-gray-500 mb-2">Gross Sales</p>
                                                <p className="text-sm font-black italic tracking-tighter text-white">€{grossEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                                <p className="text-[7px] font-black uppercase tracking-widest text-gray-500 mb-2">15% Comm. (Fee)</p>
                                                <p className="text-sm font-black italic tracking-tighter text-red-400">-€{commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center border-brand/20 shadow-[0_0_15px_rgba(5,150,105,0.05)]">
                                                <p className="text-[7px] font-black uppercase tracking-widest text-brand mb-2">Net Payout</p>
                                                <p className="text-sm font-black italic tracking-tighter text-brand">€{netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Trips in Interval ({filteredTrips.length})</p>
                                                <p className="text-[8px] font-black text-brand uppercase tracking-widest italic">Live ledger updated</p>
                                            </div>
                                            {filteredTrips.map(trip => (
                                                <div key={trip.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex justify-between items-center group hover:border-brand/30 transition-all">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{trip.date}</p>
                                                        <h4 className="font-black italic uppercase tracking-tighter text-white">€{trip.amount.toFixed(2)}</h4>
                                                        <p className="text-[10px] font-medium text-gray-400">{trip.from} → {trip.to}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowReceipt(trip)}
                                                        className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand group-hover:bg-brand group-hover:text-dark-900 transition-all"
                                                    >
                                                        Receipt
                                                    </button>
                                                </div>
                                            ))}
                                            {filteredTrips.length === 0 && (
                                                <div className="p-8 bg-white/5 border border-dashed border-white/10 rounded-3xl text-center">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No rides completed in selected period</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {view === 'inbox' && (
                                <div className="space-y-6">
                                    {inboxMessages.map(msg => (
                                        <div key={msg.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-lg font-black italic uppercase tracking-tighter text-brand">{msg.title}</h4>
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{msg.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 font-medium leading-relaxed">{msg.content}</p>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline">Learn More →</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {view === 'support' && (
                                <div className="space-y-10">
                                    <div className="bg-brand/10 border border-brand/20 rounded-3xl p-8 space-y-6 text-center">
                                        <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center text-brand mx-auto">
                                            <MessageSquare size={32} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Chat with GreenBot</h4>
                                            <p className="text-sm text-gray-500 font-medium">Get instant answers to common questions about your driving partner status.</p>
                                        </div>
                                        <button className="w-full py-4 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand/20">
                                            Start Chat
                                        </button>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Support</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
                                                <Bell size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black italic uppercase tracking-tighter text-white underline">support@green.com</p>
                                                <p className="text-[10px] text-gray-600 font-bold uppercase">Average response: 2 hours</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {view === 'vehicle-hub' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* VEHICLE PHOTO UPLOAD AREA */}
                                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="w-full aspect-[16/9] bg-dark-950 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                                                {vehicleInfo.photo ? (
                                                    <img src={vehicleInfo.photo} className="w-full h-full object-cover" alt="Vehicle" />
                                                ) : (
                                                    <div className="flex flex-col items-center space-y-3">
                                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                            <Car size={32} className="text-gray-600" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Upload Vehicle Shot</p>
                                                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tight">Gallery or Camera roll</p>
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
                                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
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
                                                        className="w-full bg-dark-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-brand/50 transition-all placeholder:text-gray-700"
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
                                                <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
                                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-2 border border-amber-500/30">
                                                        <Clock className="text-amber-500" size={20} />
                                                    </div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500">Awaiting Admin Approval</p>
                                                </div>
                                            )}

                                            {profilePicStatus === 'missing' && (
                                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer" onClick={() => {
                                                    alert("Simulating: Opening Phone Gallery...");
                                                    setTempPhotoPreview(`https://api.dicebear.com/7.x/avataaars/svg?seed=selected-${Date.now()}`);
                                                    setProfilePicStatus('pending');
                                                    setHasInitialPic(true);
                                                }}>
                                                    <Upload className="text-white/70 mb-1" size={24} />
                                                    <p className="text-[7px] font-black uppercase tracking-widest text-white/50">Tap to Upload</p>
                                                </div>
                                            )}

                                            {profilePicStatus === 'verified' && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => {
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
                                                className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-dark-900 shadow-xl ring-4 ring-[#0B121E] hover:scale-110 transition-transform"
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
                                                <input type="text" placeholder="First Name" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-brand outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Surname</label>
                                                <input type="text" placeholder="Surname" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-brand outline-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Email Address</label>
                                            <input type="email" placeholder="email@green.com" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-brand outline-none" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                            <input type="tel" placeholder="+49 151 ..." className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-brand outline-none" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Address</label>
                                            <input type="text" placeholder="Street and Number" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-brand outline-none" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">City</label>
                                                <input type="text" placeholder="City" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-brand outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] ml-1">Zip Code</label>
                                                <input type="text" placeholder="Zip Code" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-brand outline-none" />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => { alert("Profile saved successfully!"); setView('dashboard'); }}
                                            className="w-full py-5 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                        >
                                            Save Profile Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === 'settings' && (
                                <div className="space-y-8 animate-fadeIn">
                                    {isLoggedOutSimulated ? (
                                        <div className="p-8 bg-dark-900/90 border border-red-500/20 rounded-[2.5rem] text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                                            <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
                                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mx-auto animate-bounce">
                                                <Lock size={32} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Simulated Session Terminated</h4>
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                    You have signed out of the active driver session. Enter credentials or click bypass to reactivate.
                                                </p>
                                            </div>

                                            <div className="space-y-4 text-left">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">E-Mail Address</label>
                                                    <input
                                                        type="email"
                                                        value={userEmail}
                                                        disabled
                                                        className="w-full bg-dark-950 border border-white/5 rounded-2xl p-4 text-xs font-bold text-gray-400 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="Enter password..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-brand outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setIsLoggedOutSimulated(false)}
                                                    className="w-full py-4 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20 active:scale-95 transition-all"
                                                >
                                                    Simulate Log In
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsLoggedOutSimulated(false);
                                                    }}
                                                    className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 active:scale-95 transition-all"
                                                >
                                                    Quick Bypass
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Profile Identity Card */}
                                            <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                                    <Shield size={80} className="text-brand" />
                                                </div>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Profile Identity</p>
                                                <div className="space-y-6">
                                                    <div className="space-y-1.5 px-2">
                                                        <label className="text-[10px] font-black text-brand uppercase tracking-widest ml-1">Email Address</label>
                                                        <input
                                                            type="email"
                                                            value={userEmail}
                                                            onChange={(e) => setUserEmail(e.target.value)}
                                                            className="w-full bg-dark-800 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-inner"
                                                        />
                                                    </div>

                                                    <div className="space-y-4 px-2 pt-4 border-t border-white/5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Lock size={14} className="text-brand" />
                                                                <label className="text-[10px] font-black text-brand uppercase tracking-widest">Change Password Protocol</label>
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Live Security gate</span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                                                                <input
                                                                    type="password"
                                                                    value={settingsNewPassword}
                                                                    placeholder="••••••••"
                                                                    onChange={(e) => setSettingsNewPassword(e.target.value)}
                                                                    className="w-full bg-dark-800 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:border-brand outline-none"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm Password</label>
                                                                <input
                                                                    type="password"
                                                                    value={settingsConfirmPassword}
                                                                    placeholder="••••••••"
                                                                    onChange={(e) => setSettingsConfirmPassword(e.target.value)}
                                                                    className="w-full bg-dark-800 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:border-brand outline-none"
                                                                />
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                if (!settingsNewPassword || !settingsConfirmPassword) {
                                                                    alert("Please fill both password fields.");
                                                                    return;
                                                                }
                                                                if (settingsNewPassword !== settingsConfirmPassword) {
                                                                    alert("Passwords do not match!");
                                                                    return;
                                                                }
                                                                alert("Password successfully updated!");
                                                                setSettingsNewPassword('');
                                                                setSettingsConfirmPassword('');
                                                            }}
                                                            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[9px] text-white transition-all"
                                                        >
                                                            Update Password
                                                        </button>
                                                    </div>

                                                    <div className="pt-4 border-t border-white/5 flex gap-3">
                                                        <button
                                                            onClick={() => alert("Identity settings successfully stored!")}
                                                            className="flex-1 py-4 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20 active:scale-95 transition-all"
                                                        >
                                                            Save Profile
                                                        </button>
                                                        <button
                                                            onClick={() => setIsLoggedOutSimulated(true)}
                                                            className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl font-black uppercase tracking-widest text-[10px] text-red-500 active:scale-95 transition-all"
                                                        >
                                                            Simulate Sign Out
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Appearance Settings */}
                                            <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">App Appearance</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => setTheme('dark')}
                                                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${theme === 'dark' ? 'bg-brand/10 border-brand' : 'bg-dark-800 border-white/5 opacity-50'}`}
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-[#0B121E] border border-white/10 flex items-center justify-center text-white">
                                                            <Zap size={20} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Dark Mode</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setTheme('light')}
                                                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${theme === 'light' ? 'bg-brand/10 border-brand shadow-[0_0_20px_rgba(5,150,105,0.1)]' : 'bg-white border-gray-200 text-gray-400'}`}
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-800 shadow-sm">
                                                            <Zap size={20} fill="currentColor" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Light Mode</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Map Settings */}
                                            <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Navigation Preference</p>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {[
                                                        { id: 'google', name: 'Google Maps', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Google_Maps_icon_%282015-2020%29.svg' },
                                                        { id: 'apple', name: 'Apple Maps', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Apple_Maps_logo.svg' }
                                                    ].map((map) => (
                                                        <button
                                                            key={map.id}
                                                            onClick={() => setMapPreference(map.id)}
                                                            className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${mapPreference === map.id ? 'bg-brand/10 border-brand' : 'bg-white/5 border-white/5'}`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
                                                                    <img src={map.icon} alt={map.name} className="w-full h-full object-contain" />
                                                                </div>
                                                                <span className={`text-sm font-black italic uppercase tracking-tighter ${mapPreference === map.id ? 'text-white' : 'text-gray-500'}`}>{map.name}</span>
                                                            </div>
                                                            {mapPreference === map.id && <CheckCircle size={16} className="text-brand" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
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
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4">Access Restricted</h2>
                        <p className="max-w-md text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-10">
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
                            className="w-full max-w-sm bg-dark-900 border border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                <ShieldCheck size={100} className="text-brand" />
                            </div>

                            <button 
                                onClick={() => { setShowSecurityReset(false); setResetConfirmed(false); }}
                                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
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
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Confirm your identity to receive a secure recovery link.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Confirm Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                                    <input 
                                                        type="email" 
                                                        placeholder="email@example.com"
                                                        value={confirmEmail}
                                                        onChange={(e) => setConfirmEmail(e.target.value)}
                                                        className="w-full bg-dark-800 border border-white/5 rounded-2xl p-4 pl-10 text-xs font-bold text-white focus:border-brand outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Confirm Number</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                                    <input 
                                                        type="tel" 
                                                        placeholder="+49 151 ..."
                                                        value={confirmPhone}
                                                        onChange={(e) => setConfirmPhone(e.target.value)}
                                                        className="w-full bg-dark-800 border border-white/5 rounded-2xl p-4 pl-10 text-xs font-bold text-white focus:border-brand outline-none"
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
                                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${confirmEmail && confirmPhone ? 'bg-brand text-dark-900 shadow-lg shadow-brand/20 active:scale-95' : 'bg-white/5 text-gray-500 border border-white/5'}`}
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
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
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
                                                className="text-[10px] font-bold text-white underline hover:text-brand"
                                            >
                                                Open Security Terminal
                                            </a>
                                        </div>
                                        <button
                                            onClick={() => setShowSecurityReset(false)}
                                            className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400"
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
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Mission Complete?</h3>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-relaxed">
                                        Confirming will finalize the node for <span className="text-white">{currentSequence[0]?.label.split(': ')[1]}</span>.
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
                                        className="w-full py-4 bg-white/5 border border-white/10 rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] text-gray-500"
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
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <p className="text-[6px] font-black text-gray-500 uppercase mb-0.5">Fare</p>
                                        <p className="text-lg font-black italic text-white">€{lastCompletedRide?.finalAmount?.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-brand/10 p-3 rounded-xl border border-brand/20 relative overflow-hidden">
                                        <Zap size={8} className="absolute top-2 right-2 text-brand opacity-40" />
                                        <p className="text-[6px] font-black text-brand uppercase mb-0.5">Bonus</p>
                                        <p className="text-lg font-black italic text-brand">€72.50</p>
                                    </div>
                                </div>

                                {/* Mandatory Vibe Check - High Density */}
                                <div className="bg-dark-950/40 border border-white/5 rounded-2xl p-4 space-y-3 mx-2">
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Rate Vibe</p>
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
                                                className={`flex items-center justify-center h-10 rounded-lg border-2 transition-all ${selectedEmojis.includes(vibe.id) ? 'bg-brand/20 border-brand' : 'bg-white/5 border-transparent opacity-40'}`}
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
                                        className="w-full py-2.5 bg-white/5 rounded-xl font-black uppercase tracking-widest text-[8px] text-gray-500 hover:text-white"
                                    >
                                        ↩ Resume Trip
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Sheet>

            {/* Incoming Ride Notification */}
            {incomingRide && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[200] animate-in slide-in-from-top-10 duration-500">
                    <div className="bg-[#111827] border border-brand/40 rounded-[2rem] p-6 text-white shadow-[0_0_50px_rgba(5,150,105,0.2)] relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute inset-0 bg-brand/5" />

                        <div className="relative z-10 flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 ${incomingRide.rideType === 'premium' ? 'bg-amber-500/10 text-amber-500' : (incomingRide.rideType === 'max' ? 'bg-violet-500/10 text-violet-500' : 'bg-brand/10 text-brand')}`}>
                                    {incomingRide.rideType === 'premium' ? <Star size={24} /> : (incomingRide.rideType === 'max' ? <Briefcase size={24} /> : <Zap size={24} />)}
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${incomingRide.rideType === 'premium' ? 'text-amber-500' : (incomingRide.rideType === 'max' ? 'text-violet-500' : 'text-brand')}`}>
                                        {incomingRide.rideType.toUpperCase()} CLASS
                                    </p>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">
                                        {incomingRide.rideType === 'premium' ? 'Direct Mission' : 'Share Option'}
                                    </h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Base Payout</p>
                                <p className="text-xl font-black text-white">€{incomingRide.price}</p>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Max Occupancy</p>
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-gray-400" />
                                    <span className="text-sm font-black text-white">{incomingRide.capacity} Seats</span>
                                </div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Share Bonus</p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="text-brand" />
                                    <span className="text-sm font-black text-brand">Up to {incomingRide.rideType === 'max' ? '250%' : (incomingRide.rideType === 'green' ? '180%' : '100%')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 space-y-3 mb-6">
                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                                <Navigation size={16} className="text-brand shrink-0" />
                                <p className="text-sm font-bold truncate">{incomingRide.pickup}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                                <MapPin size={16} className="text-orange-500 shrink-0" />
                                <p className="text-sm font-bold truncate">{incomingRide.destination}</p>
                            </div>
                        </div>

                        <div className="relative z-10 flex gap-3">
                            <button
                                onClick={() => setIncomingRide(null)}
                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-gray-400"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={handleAcceptRide}
                                className="flex-[2] py-4 bg-brand text-dark-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand/20"
                            >
                                Accept & Map
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Profile Details Sheet */}
            <Sheet
                isOpen={profileSheetOpen}
                onClose={() => setProfileSheetOpen(false)}
                title="My Profile Details"
            >
                <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar text-white">
                    {/* Avatar Upload Hub */}
                    <div className="flex flex-col items-center gap-4 py-4 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand/50 shadow-[0_0_20px_rgba(5,150,105,0.3)]">
                                <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit3 size={18} className="text-brand" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h4 className="font-black italic uppercase tracking-tighter text-white">{profileData.name} {profileData.lastName}</h4>
                            <p className="text-[9px] font-black uppercase text-brand tracking-widest mt-1">Active Driving Partner</p>
                        </div>
                        
                        {/* Handset Gallery Mockup */}
                        <div className="w-[90%] bg-dark-900/80 rounded-2xl p-4 border border-white/5 space-y-3">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest text-center">Select Profile Picture (Gallery Mock)</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
                                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
                                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
                                ].map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setProfileData(prev => ({ ...prev, profilePic: url }))}
                                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${profileData.profilePic === url ? 'border-brand scale-95 shadow-[0_0_10px_rgba(5,150,105,0.4)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Vorname</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/5 focus:border-brand rounded-2xl p-4 text-xs font-bold text-white outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Nachname</label>
                                <input
                                    type="text"
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/5 focus:border-brand rounded-2xl p-4 text-xs font-bold text-white outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Adresse</label>
                            <input
                                type="text"
                                value={profileData.address}
                                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full bg-white/5 border border-white/5 focus:border-brand rounded-2xl p-4 text-xs font-bold text-white outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 space-y-1">
                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">PLZ / Zip</label>
                                <input
                                    type="text"
                                    value={profileData.zipCode}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, zipCode: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/5 focus:border-brand rounded-2xl p-4 text-xs font-bold text-white outline-none"
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Stadt / City</label>
                                <input
                                    type="text"
                                    value={profileData.city}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/5 focus:border-brand rounded-2xl p-4 text-xs font-bold text-white outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">E-Mail Adresse</label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-white/5 border border-white/5 focus:border-brand rounded-2xl p-4 text-xs font-bold text-white outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Telefonnummer</label>
                            <input
                                type="text"
                                value={profileData.phone}
                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full bg-white/5 border border-white/5 focus:border-brand rounded-2xl p-4 text-xs font-bold text-white outline-none"
                            />
                        </div>

                        <button
                            onClick={() => {
                                alert("Profil erfolgreich aktualisiert!");
                                setProfileSheetOpen(false);
                            }}
                            className="w-full py-4 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20 active:scale-95 transition-all mt-4"
                        >
                            Profil speichern
                        </button>
                    </div>
                </div>
            </Sheet>

            {/* 2. Vehicle Registration Sheet */}
            <Sheet
                isOpen={vehicleSheetOpen}
                onClose={() => setVehicleSheetOpen(false)}
                title="Register Vehicle Hub"
            >
                <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar text-white">
                    {/* Status Alert Badge */}
                    {vehicleStatus === 'unregistered' && (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center space-y-2">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Registration Status</p>
                            <p className="text-xs font-bold text-gray-400">Please register your vehicle below to start receiving VIP rides.</p>
                        </div>
                    )}

                    {vehicleStatus === 'pending' && (
                        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] text-center space-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Car size={40} className="text-amber-500" />
                            </div>
                            <p className="text-[9px] font-black uppercase text-amber-500 tracking-[0.2em] italic animate-pulse">PENDING RELEASE PROTOCOL</p>
                            <h4 className="font-black italic uppercase tracking-tighter text-white">Awaiting Admin Verification</h4>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                Sent to Admin Portal. Director <span className="text-amber-500">Khiam Azizi</span> will authorize this vehicle shortly.
                            </p>
                        </div>
                    )}

                    {vehicleStatus === 'approved' && (
                        <div className="p-5 bg-brand/10 border border-brand/20 rounded-[2rem] text-center space-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <CheckCircle size={40} className="text-brand" />
                            </div>
                            <p className="text-[9px] font-black uppercase text-brand tracking-[0.2em] italic">VERIFIED ACTIVE PARTNER</p>
                            <h4 className="font-black italic uppercase tracking-tighter text-white">Vehicle Authorized & Active</h4>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                License Plate <span className="text-brand font-black">{vehicleRegisterData.licensePlate}</span> is fully compliant.
                            </p>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Kennzeichen / License Plate</label>
                            <input
                                type="text"
                                value={vehicleRegisterData.licensePlate}
                                disabled={vehicleStatus !== 'unregistered'}
                                onChange={(e) => setVehicleRegisterData(prev => ({ ...prev, licensePlate: e.target.value }))}
                                className="w-full bg-white/5 border border-white/5 focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl p-4 text-xs font-bold text-white outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Automodell / Vehicle Model</label>
                            <input
                                type="text"
                                value={vehicleRegisterData.model}
                                disabled={vehicleStatus !== 'unregistered'}
                                onChange={(e) => setVehicleRegisterData(prev => ({ ...prev, model: e.target.value }))}
                                className="w-full bg-white/5 border border-white/5 focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl p-4 text-xs font-bold text-white outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Baujahr / Build Year</label>
                                <input
                                    type="text"
                                    value={vehicleRegisterData.buildYear}
                                    disabled={vehicleStatus !== 'unregistered'}
                                    onChange={(e) => setVehicleRegisterData(prev => ({ ...prev, buildYear: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/5 focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl p-4 text-xs font-bold text-white outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-brand uppercase tracking-widest ml-1">Farbe / Color</label>
                                <input
                                    type="text"
                                    value={vehicleRegisterData.color}
                                    disabled={vehicleStatus !== 'unregistered'}
                                    onChange={(e) => setVehicleRegisterData(prev => ({ ...prev, color: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/5 focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl p-4 text-xs font-bold text-white outline-none"
                                />
                            </div>
                        </div>

                        {vehicleStatus === 'unregistered' && (
                            <button
                                onClick={() => {
                                    setVehicleStatus('pending');
                                    // Save to localStorage for Admin compliance inspection modal
                                    const regData = {
                                        ...vehicleRegisterData,
                                        status: 'pending',
                                        submittedAt: new Date().toISOString()
                                    };
                                    localStorage.setItem('driver_vehicle_data', JSON.stringify(regData));
                                    alert("Vehicle release request successfully dispatched to Director Khiam Azizi!");
                                }}
                                className="w-full py-4 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20 active:scale-95 transition-all mt-4"
                            >
                                Request Release from Admin
                            </button>
                        )}

                        {vehicleStatus !== 'unregistered' && (
                            <button
                                onClick={() => {
                                    setVehicleStatus('unregistered');
                                    localStorage.removeItem('driver_vehicle_data');
                                }}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 mt-4"
                            >
                                Reset Registration Form
                            </button>
                        )}
                    </div>
                </div>
            </Sheet>

            {/* 3. Documents Verification Hub Sheet */}
            <Sheet
                isOpen={documentsSheetOpen}
                onClose={() => setDocumentsSheetOpen(false)}
                title="Compliance Document Vault"
            >
                <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar text-white">
                    {/* Compliance Overview Card */}
                    <div className="p-5 bg-white/5 border border-white/5 rounded-[2rem] space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <ShieldCheck size={48} className="text-brand" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Platform Vault Compliance</p>
                        <h4 className="font-black italic uppercase tracking-tighter text-white">Vault Security Clearance</h4>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-brand rounded-full transition-all"
                                    style={{ 
                                        width: `${(driverDocs.filter(d => d.status === 'verified').length / driverDocs.length) * 100}%` 
                                    }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-brand italic shrink-0">
                                {driverDocs.filter(d => d.status === 'verified').length}/{driverDocs.length} Approved
                            </span>
                        </div>
                    </div>

                    {/* Document List */}
                    <div className="space-y-4">
                        {driverDocs.map((doc) => (
                            <div key={doc.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h5 className="font-black italic uppercase tracking-tight text-white">{doc.name}</h5>
                                        <p className="text-[9px] font-medium text-gray-500 leading-tight mt-0.5">{doc.desc}</p>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                        doc.status === 'verified' ? 'bg-brand/10 text-brand' : 
                                        (doc.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500')
                                    }`}>
                                        {doc.status}
                                    </span>
                                </div>

                                {doc.type === 'checkbox' ? (
                                    <div className="flex items-center gap-3 bg-dark-900/60 p-4 rounded-2xl border border-white/5">
                                        <input
                                            type="checkbox"
                                            id={`check-${doc.id}`}
                                            checked={doc.status === 'verified'}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setDriverDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: checked ? 'verified' : 'missing' } : d));
                                            }}
                                            className="w-5 h-5 rounded border-white/10 bg-dark-800 text-brand focus:ring-brand accent-brand cursor-pointer"
                                        />
                                        <label htmlFor={`check-${doc.id}`} className="text-[10px] font-black uppercase tracking-widest text-gray-300 cursor-pointer select-none">
                                            I accept terms & conditions
                                        </label>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {doc.status === 'missing' && (
                                            <button
                                                onClick={() => {
                                                    setDriverDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'pending' } : d));
                                                    // Sync to localStorage
                                                    const updated = driverDocs.map(d => d.id === doc.id ? { ...d, status: 'pending' } : d);
                                                    localStorage.setItem('driver_compliance_docs', JSON.stringify(updated));
                                                    alert(`${doc.name} scan file uploaded successfully! Awaiting verification.`);
                                                }}
                                                className="w-full py-3 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 hover:border-brand/30 rounded-2xl flex items-center justify-center gap-2 transition-all"
                                            >
                                                <Upload size={14} className="text-gray-500" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Upload Scanner File</span>
                                            </button>
                                        )}

                                        {doc.status === 'pending' && (
                                            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center">
                                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Awaiting Verification Review</p>
                                            </div>
                                        )}

                                        {doc.status === 'verified' && (
                                            <div className="p-3 bg-brand/5 border border-brand/10 rounded-2xl text-center flex items-center justify-center gap-2">
                                                <CheckCircle size={12} className="text-brand" />
                                                <p className="text-[8px] font-black text-brand uppercase tracking-widest">Document Audited & Certified</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Sheet>

            <PostsFeed isOpen={showPosts} onClose={() => setShowPosts(false)} />
        </div>
    );
};

export default DriverDashboard;
