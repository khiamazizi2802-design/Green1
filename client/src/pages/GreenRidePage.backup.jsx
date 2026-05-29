import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    LocateFixed,
    ArrowLeft,
    CreditCard,
    Zap,
    Navigation,
    ChevronRight,
    Sparkles,
    Wallet,
    Banknote,
    Globe,
    ShoppingBag,
    X,
    Star,
    Smile,
    Send,
    MessageSquare,
    Phone,
    Users,
    Heart,
    Car,
    ShieldCheck
} from 'lucide-react';
import AdvancedRadar from '../components/AdvancedRadar';
import { useRide } from '../context/RideContext';
import { useSocket } from '../context/SocketContext';
import { triggerNotification } from '../components/NotificationToast';

const GreenRidePage = () => {
    const navigate = useNavigate();
    const { isPoolingEnabled, setIsPoolingEnabled, calculatePrice, isFTDOnly, setIsFTDOnly } = useRide();
    const [pickup, setPickup] = useState('Main St 123 (Current)');
    const [destination, setDestination] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState({ name: 'Mastercard', icon: CreditCard, label: 'MC •••• 4242' });
    const [rideStatus, setRideStatus] = useState('idle'); // idle, searching, accepted
    const [showTopNotification, setShowTopNotification] = useState(false);
    const [driverInfo, setDriverInfo] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'driver', text: "I'm on my way! traffic is light.", timestamp: new Date() }
    ]);
    const [messageInput, setMessageInput] = useState('');
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showRideSummary, setShowRideSummary] = useState(false);
    const [view, setView] = useState('dashboard');
    const [coRiderRating, setCoRiderRating] = useState(0);
    const [selectedCoRiderTags, setSelectedCoRiderTags] = useState({}); // Keyed by rider ID
    const [waitingSeconds, setWaitingSeconds] = useState(120); // 2 minute countdown
    const [mockCoRiders] = useState([
        { id: 'cr-1', name: 'Sarah L.', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
        { id: 'cr-2', name: 'James K.', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' }
    ]);
    const [showPremiumBrands, setShowPremiumBrands] = useState(false);
    const [selectedSharedType, setSelectedSharedType] = useState('green3');
    const [paymentModalMode, setPaymentModalMode] = useState('select');
    const [showEndTripReasons, setShowEndTripReasons] = useState(false);
    const [endTripReason, setEndTripReason] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [userPaymentMethods, setUserPaymentMethods] = useState([
        { id: 'cash', name: 'Cash', icon: Banknote, color: 'text-yellow-400', label: 'Pay at destination' },
        { id: 'default', name: 'Mastercard', icon: CreditCard, color: 'text-brand', label: 'MC •••• 4242' }
    ]);
    const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
    const [bankForm, setBankForm] = useState({ name: '', iban: '', bic: '' });

    const [serviceType, setServiceType] = useState('standard'); // 'standard', 'shared', 'max'

    const sharedTypes = [

        { id: 'green3', label: 'Green3', icon: Users, desc: '3 Seats Shared' },
        { id: 'greenmax', label: 'Green Max', icon: Car, desc: '6+ Seats Van' }
    ];

    const driverTags = [
        { emoji: '🚀', label: 'Mach Flow' },
        { emoji: '🛡️', label: 'Shield Mode' },
        { emoji: '🥃', label: 'Green Vibe' },
        { emoji: '🧠', label: 'Smart Route' },
        { emoji: '✨', label: 'Void Clean' },
        { emoji: '🤝', label: 'Handshake' }
    ];

    const customerTags = [
        { emoji: '😊', label: 'Friendly' },
        { emoji: '🤫', label: 'Silent' },
        { emoji: '😇', label: 'Polite' },
        { emoji: '⌚', label: 'Punctual' },
        { emoji: '🛡️', label: 'Respectful' }
    ];

    // Simulation Sequence
    React.useEffect(() => {
        if (rideStatus === 'accepted') {
            // Simulate driver arriving after 6 seconds
            const timer = setTimeout(() => {
                setRideStatus('arrived');
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [rideStatus]);

    React.useEffect(() => {
        let interval;
        if (rideStatus === 'arrived' && waitingSeconds > 0) {
            interval = setInterval(() => {
                setWaitingSeconds(prev => prev - 1);
            }, 1000);
        }
        
        // Auto-board after 4 seconds (Driver handles it)
        if (rideStatus === 'arrived') {
            const boardingTimer = setTimeout(() => {
                setRideStatus('boarding');
                
                // Finalize boarding after 3 seconds
                setTimeout(() => {
                    setRideStatus('in_ride');
                    
                    // NEW: Simulate driver completing the trip after 10 seconds of driving
                    setTimeout(() => {
                        setRideStatus('completed');
                    }, 10000);
                }, 3000);
            }, 4000);
            return () => {
                clearInterval(interval);
                clearTimeout(boardingTimer);
            };
        }
        
        return () => clearInterval(interval);
    }, [rideStatus, waitingSeconds]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const newMessage = { sender: 'user', text: messageInput, timestamp: new Date() };
        setChatMessages([...chatMessages, newMessage]);
        setMessageInput('');

        // Mock reply
        setTimeout(() => {
            const reply = { sender: 'driver', text: "Got it! See you soon.", timestamp: new Date() };
            setChatMessages(prev => [...prev, reply]);
        }, 2000);
    };

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleAddCard = () => {
        const lastFour = cardForm.number.slice(-4);
        const newMethod = {
            id: `card-${Date.now()}`,
            name: 'Credit Card',
            icon: CreditCard,
            color: 'text-brand',
            label: `CC •••• ${lastFour}`
        };
        setUserPaymentMethods([...userPaymentMethods, newMethod]);
        setSelectedPayment(newMethod);
        setPaymentModalMode('select');
        setCardForm({ name: '', number: '', expiry: '', cvv: '' });
    };

    const handleAddBank = () => {
        const maskedIban = cardForm.iban ? `IBAN •••• ${cardForm.iban.slice(-4)}` : 'Bank Account';
        const newMethod = {
            id: `bank-${Date.now()}`,
            name: 'Bank Account',
            icon: Wallet,
            color: 'text-blue-400',
            label: maskedIban
        };
        setUserPaymentMethods([...userPaymentMethods, newMethod]);
        setSelectedPayment(newMethod);
        setPaymentModalMode('select');
        setBankForm({ name: '', iban: '', bic: '' });
    };

    const brands = [
        { name: 'VW', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg' },
        { name: 'Toyota', logo: 'https://www.vectorlogo.zone/logos/toyota/toyota-icon.svg' },
        { name: 'Ford', logo: 'https://www.vectorlogo.zone/logos/ford/ford-icon.svg' },
        { name: 'Peugeot', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Peugeot_Logo.svg' },
        { name: 'Opel', logo: 'https://www.logo.wine/a/logo/Opel/Opel-Logo.wine.svg' },
        { name: 'Tesla', logo: 'https://www.vectorlogo.zone/logos/tesla/tesla-icon.svg' },
        { name: 'Mercedes', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg' },
        { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' }
    ];

    const { socket } = useSocket();

    const handleExecute = () => {
        if (!destination) return;
        setIsProcessing(true);
        
        // STAGE 1: Payment Processing (Simulating Stripe/Adyen background check)
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentConfirmed(true);
            const paymentMsg = selectedPayment.id === 'cash' 
                ? 'Payment set to Cash. Please pay €24.50 at destination.' 
                : `€24.50 has been authorized via ${selectedPayment.name} (${selectedPayment.label})`;
            triggerNotification('payment', selectedPayment.id === 'cash' ? 'Cash Selected' : 'Payment Secured', paymentMsg);
            
            // STAGE 2: Payment Confirmed (Show success checkmark for 1.5s)
            setTimeout(() => {
                setPaymentConfirmed(false);
                setRideStatus('searching');
                
                // STAGE 3: Search Simulation
                setTimeout(() => {
                    setDriverInfo({
                        name: 'Marcus Weber',
                        rating: 4.9,
                        car: 'Audi E-Tron (Executive)',
                        plate: 'F-GR 2024',
                        eta: '3 min',
                        img: 'Marcus'
                    });
                    setRideStatus('accepted');
                    setShowTopNotification(true);
                    setTimeout(() => setShowTopNotification(false), 5000);
                }, 3500);
            }, 1500);
        }, 2500);
    };

    const handleGPSLocation = () => {
        console.log('GPS: handleGPSLocation called');
        if (!navigator.geolocation) {
            console.error('GPS: Geolocation not supported');
            alert('GPS not supported by your browser');
            return;
        }

        setPickup('Locating...');
        console.log('GPS: Requesting start');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('GPS: Success', position);
                const { latitude, longitude } = position.coords;
                setPickup(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
                // In a real app, we would reverse geocode here
            },
            (error) => {
                console.error('Error getting location:', error);
                console.log('GPS: Error code', error.code, 'message', error.message);
                setPickup('GPS access denied / unavailable');
                alert(`GPS Error: ${error.message} (Code: ${error.code})`);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    // Auto-hide Top Notification when it appears
    React.useEffect(() => {
        if (showTopNotification) {
            const timer = setTimeout(() => {
                setShowTopNotification(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showTopNotification]);

    // Force hide Top Notification if status changes from accepted
    React.useEffect(() => {
        if (rideStatus !== "accepted") { setShowTopNotification(false); }
    }, [rideStatus]);

    const renderBottomSheetContent = () => {
        if (rideStatus === 'searching') {
            return (
                <div className="flex flex-col items-center justify-center py-12 space-y-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-brand/10 border-t-brand animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Navigation size={32} className="text-brand animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Scanning the Grid</h2>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.3em]">Connecting to nearby Hubs...</p>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex gap-2 items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '200ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '400ms' }} />
                        </div>
                        <button 
                            onClick={() => setRideStatus('idle')}
                            className="w-full py-4 mt-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white/60 hover:bg-white/10 transition-all"
                        >
                            Cancel Search
                        </button>
                    </div>
                </div>
            );
        }

        if (rideStatus === 'idle') {
            return (
                <div className="space-y-3.5">
                    {/* Ultra-Mini Route Section */}
                    <div className="grid grid-cols-[1fr_auto] gap-2.5">
                        <div className="flex flex-col gap-1.5 flex-1">
                            <div className="h-11 rounded-lg flex items-center px-3 gap-3" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                <input
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    className="bg-transparent w-full focus:outline-none font-black text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                                    placeholder="Pick-up origin"
                                />
                            </div>
                            <div className="h-11 rounded-lg flex items-center px-3 gap-3" style={{ background: 'var(--brand-glow)', border: '2px solid var(--brand)' }}>
                                <MapPin size={14} className="shrink-0" style={{ color: 'var(--brand)', animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                <input
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="bg-transparent w-full focus:outline-none font-black text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                                    placeholder="Target destination"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleGPSLocation}
                            className="w-10 h-auto rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--brand)' }}
                            title="Use Current Location"
                        >
                            <Navigation size={18} />
                        </button>
                    </div>

                    {/* Premium Selection Toggle */}
                    <div
                        onClick={() => {
                            const newMode = !showPremiumBrands;
                            setShowPremiumBrands(newMode);
                            if (newMode) {
                                setIsPoolingEnabled(false);
                            } else {
                                setSelectedBrand(null);
                            }
                        }}
                        className={`h-12 rounded-xl flex items-center justify-between px-4 cursor-pointer transition-all border ${showPremiumBrands ? 'bg-brand/10 border-brand/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${showPremiumBrands ? 'bg-brand/20 text-brand' : 'bg-white/5 text-white/40'}`}>
                                <Car size={16} />
                            </div>
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest ${showPremiumBrands ? 'text-brand' : 'text-[var(--text-primary)]'}`}>Premium Fleet Selection</p>
                                <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-tighter mt-0.5">Choose specific vehicle marks</p>
                            </div>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-all ${showPremiumBrands ? 'bg-brand' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showPremiumBrands ? 'right-1' : 'left-1'}`} />
                        </div>
                    </div>

                    <AnimatePresence>
                        {showPremiumBrands && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4, ease: "circOut" }}
                                className="w-full origin-top overflow-hidden relative cursor-grab active:cursor-grabbing"
                                style={{
                                    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                                }}
                            >
                                <motion.div 
                                    drag="x"
                                    dragConstraints={{ left: -320, right: 0 }}
                                    dragElastic={0}
                                    dragMomentum={true}
                                    dragTransition={{ power: 0.2, timeConstant: 200 }}
                                    
                                    className="flex gap-6 px-12 w-max pb-6 items-center"
                                >
                                    {brands.map((brand, index) => {
                                        const isSelected = selectedBrand === brand.name;
                                        return (
                                            <button
                                                key={`${brand.name}-${index}`}
                                                onClick={() => setSelectedBrand(prev => prev === brand.name ? null : brand.name)}
                                                className="relative flex flex-col items-center gap-2 shrink-0 transition-all duration-300"
                                                style={{ transform: isSelected ? 'scale(1.15)' : 'scale(1)' }}
                                            >
                                                {isSelected && (
                                                    <div className="absolute inset-[-4px] rounded-2xl animate-pulse pointer-events-none"
                                                        style={{ background: 'var(--brand-glow)', filter: 'blur(6px)' }} />
                                                )}

                                                <div className="w-13 h-13 rounded-2xl flex items-center justify-center relative z-10 overflow-hidden shadow-xl"
                                                    style={{
                                                        background: '#ffffff',
                                                        border: isSelected ? '2px solid var(--brand)' : '2px solid rgba(255,255,255,0.1)',
                                                        boxShadow: isSelected
                                                            ? '0 0 16px var(--brand-glow), 0 4px 16px rgba(0,0,0,0.5)'
                                                            : '0 2px 8px rgba(0,0,0,0.4)',
                                                    }}>
                                                    <img
                                                        src={brand.logo}
                                                        alt={brand.name}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                </div>
                                                <span
                                                    className="text-[8px] font-black uppercase tracking-widest mt-0.5"
                                                    style={{ color: isSelected ? 'var(--brand)' : 'rgba(255,255,255,0.4)' }}
                                                >
                                                    {brand.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* FTD Search Toggle */}
                    <div
                        onClick={() => setIsFTDOnly(!isFTDOnly)}
                        className={`h-12 rounded-xl flex items-center justify-between px-4 cursor-pointer transition-all border mb-3 ${isFTDOnly ? 'bg-danger/10 border-danger/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isFTDOnly ? 'bg-danger/20 text-danger' : 'bg-white/5 text-white/40'}`}>
                                <Heart size={16} className={isFTDOnly ? 'fill-danger' : ''} />
                            </div>
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest ${isFTDOnly ? 'text-danger' : 'text-[var(--text-primary)]'}`}>FTD Search Mode</p>
                                <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-tighter mt-0.5">Prioritize favorite drivers</p>
                            </div>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-all ${isFTDOnly ? 'bg-danger' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isFTDOnly ? 'right-1' : 'left-1'}`} />
                        </div>
                    </div>

                                        {/* Service Selection Hub */}
                    <div className="flex gap-2.5 mb-3">
                        {[
                            { id: 'standard', label: 'Green', icon: Car, desc: 'Premium' },
                            { id: 'shared', label: 'Shared', icon: Users, desc: 'Save 20%' },
                            { id: 'max', label: 'Max', icon: Car, desc: '6+ Seats' }
                        ].map((type) => {
                            const isSelected = serviceType === type.id;
                            
                            // Dynamic Pricing Logic: Show KM rate until destination is set
                            const mockDistance = 8.4; // Sample distance for calculation
                            const pricing = calculatePrice(destination ? mockDistance : 0, type.id === 'shared' ? 2 : 1);
                            const displayPrice = destination ? `€${pricing.discountedPrice}` : '€2.50/km';

                            return (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setServiceType(type.id);
                                        setIsPoolingEnabled(type.id === 'shared');
                                        if (type.id !== 'standard') {
                                            setShowPremiumBrands(false);
                                            setSelectedBrand(null);
                                        }
                                    }}
                                    className={`flex-1 py-3 px-2 rounded-xl border transition-all flex flex-col items-center gap-1 group relative overflow-hidden ${isSelected ? 'bg-brand/10 border-brand shadow-[0_0_15px_var(--brand-glow)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                >
                                    <type.icon size={16} className={isSelected ? 'text-brand' : 'text-gray-500 group-hover:text-white/60'} />
                                    <div className="text-center">
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-brand' : 'text-gray-500'}`}>{type.label}</p>
                                        <p className={`text-[6px] font-bold uppercase tracking-tighter mt-0.5 ${isSelected ? 'text-brand/60' : 'text-gray-600'}`}>{type.desc}</p>
                                    </div>
                                    <div className="mt-1">
                                        <span className={`text-[8px] font-black transition-all duration-500 ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                            {displayPrice}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Minimalist Actions Hub */}
                    <div className="flex items-center gap-3">
                        <div
                            onClick={() => setShowPaymentOptions(true)}
                            className="flex-1 h-10 rounded-xl flex items-center justify-between px-3 group cursor-pointer transition-all shadow-sm"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-glow)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                        >
                            <div className="flex items-center gap-2">
                                <selectedPayment.icon size={12} className={selectedPayment.color || 'text-brand'} />
                                <p className="text-[10px] font-black italic text-[var(--text-primary)]">{selectedPayment.label}</p>
                            </div>
                            <ChevronRight size={12} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors" />
                        </div>

                        <div className="flex items-center gap-2 flex-[1.4]">
                            <button
                                onClick={() => navigate(-1)}
                                className="danger-button px-3 h-10 rounded-xl text-[8px] flex-1"
                            >
                                Abort
                            </button>
                            <div className="flex flex-col gap-1 flex-[2.5]">
                                {!destination && (
                                    <p className="text-[7px] text-brand/60 font-black uppercase tracking-widest text-center animate-pulse">
                                        Target Needed
                                    </p>
                                )}
                                <button
                                    onClick={handleExecute}
                                    disabled={!destination || isProcessing || paymentConfirmed}
                                    className={`neon-button w-full h-10 rounded-xl text-[9px] flex items-center justify-center gap-2 disabled:opacity-50 ${paymentConfirmed ? '!bg-success shadow-brand-glow' : ''}`}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            <span>Securing...</span>
                                        </div>
                                    ) : paymentConfirmed ? (
                                        <div className="flex items-center gap-2 animate-bounce">
                                            <ShieldCheck size={14} />
                                            <span>Paid & Confirmed</span>
                                        </div>
                                    ) : (
                                        <>
                                            {serviceType === 'shared' ? 'Join Pool' : serviceType === 'max' ? 'Book Max' : 'Whistle'}

                                            <Zap size={10} className="fill-current" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (rideStatus === 'in_ride' && driverInfo) {
            return (
                /* In-Ride View - Active Journey Mode */
                <div className="flex flex-col gap-5 pt-1">
                    {/* Status Header - Pulsing Live Indicator */}
                    <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full animate-ping absolute inset-0 opacity-75" style={{ background: 'var(--brand)' }}></div>
                                <div className="w-2.5 h-2.5 rounded-full relative z-10" style={{ background: 'linear-gradient(135deg,var(--brand),#064E3B)' }}></div>
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] animate-pulse" style={{ color: 'var(--brand)' }}>Heading to Destination</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[var(--text-secondary)] text-[9px] font-mono">{driverInfo.plate}</span>
                            <div className="h-4 w-[1px] bg-[var(--border-main)]" />
                            <div className="flex items-center gap-1">
                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-[var(--text-primary)] text-[10px] font-black">{driverInfo.rating}</span>
                            </div>
                        </div>
                    </div>

                    {/* Compact Driver/Vehicle Row with Price & Distance */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl border shadow-sm relative overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-main)' }}>
                        <img src={driverInfo.image} alt="Driver" className="w-12 h-12 rounded-xl object-cover" style={{ border: '1px solid var(--border-main)' }} />
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-[var(--text-primary)] text-sm font-black italic uppercase">{driverInfo.name}</h4>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand/10 border border-brand/20">
                                    <Sparkles size={8} className="text-brand" />
                                    <span className="text-[7px] font-black uppercase tracking-tighter text-brand">Auto Rating: 4.8</span>
                                </div>
                            </div>
                            <p className="text-[var(--text-secondary)] text-[10px] font-medium mt-0.5">{driverInfo.car} • {driverInfo.color}</p>

                            {/* Ride Stats: KM & Price */}
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-[var(--text-secondary)] text-[7px] uppercase tracking-widest font-black">Distance</span>
                                    <span className="text-[var(--text-primary)] text-[10px] font-black">2.4 km</span>
                                </div>
                                <div className="w-[1px] h-5 bg-[var(--border-main)]" />
                                <div className="flex flex-col">
                                    <span className="text-[var(--text-secondary)] text-[7px] uppercase tracking-widest font-black">Est. Fare</span>
                                    <div className="flex items-center gap-2">
                                        {isPoolingEnabled && (
                                            <span className="text-[var(--text-secondary)]/50 text-[8px] line-through font-black">€19.00</span>
                                        )}
                                        <span className="text-[10px] font-black" style={{ color: 'var(--brand)' }}>€{isPoolingEnabled ? '15.20' : '19.00'}</span>
                                    </div>
                                    {isPoolingEnabled && (
                                        <span className="text-[6px] font-black text-green-400 uppercase tracking-tighter">Shared Mode: -20%</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <div className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-main)]">
                                <span className="block text-sm font-black italic" style={{ color: 'var(--brand)' }}>8 min</span>
                            </div>
                            <span className="text-[var(--text-secondary)] text-[7px] uppercase tracking-[0.2em] font-black">Remaining</span>
                        </div>
                    </div>

                    {/* Safety & Actions Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className="col-span-2 h-11 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border"
                            style={{
                                background: isFavorite ? 'rgba(255,105,180,0.1)' : 'var(--bg-secondary)',
                                borderColor: isFavorite ? 'rgba(255,105,180,0.3)' : 'var(--border-main)',
                                color: isFavorite ? '#FF69B4' : 'var(--text-primary)'
                            }}
                        >
                            <Star size={14} className={isFavorite ? "fill-current" : ""} />
                            {isFavorite ? "Favorite Saved" : "Favorite Driver"}
                        </button>
                        <button 
                            onClick={() => setShowFeedbackModal(true)}
                            className="h-10 rounded-lg text-[9px] font-bold uppercase flex flex-col items-center justify-center gap-0.5 transition-all" 
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-main)', color: 'var(--text-secondary)' }}
                        >
                            <span>💬</span> Feedback
                        </button>
                        <button
                            onClick={() => setShowEndTripReasons(true)}
                            className="h-10 rounded-lg text-[9px] font-bold uppercase flex flex-col items-center justify-center gap-0.5 transition-all"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
                        >
                            <span>🛑</span> <span className="text-[6px]">End Early</span>
                        </button>
                    </div>
                </div>
            );
        }

        if (rideStatus === 'boarding') {
            return (
                <div className="flex flex-col items-center justify-center py-12 space-y-8">
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 rounded-[2.5rem] bg-brand/10 border border-brand/30 flex items-center justify-center text-brand"
                    >
                        <ShoppingBag size={40} className="animate-pulse" />
                    </motion.div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Safe Boarding</h2>
                        <p className="text-[10px] text-brand font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Passenger Profile...</p>
                        <button 
                            onClick={() => setRideStatus('in_ride')}
                            className="mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white/60 hover:bg-white/10 transition-all"
                        >
                            Manual Boarding Confirm
                        </button>
                    </div>
                </div>
            );
        }

        if (rideStatus === 'completed' && driverInfo) {
            return (
                /* Completed View - Receipt & Rating */
                <div className="flex flex-col gap-5 pt-1">
                    {/* Success Header */}
                    <div className="text-center">
                        <h2 className="text-2xl font-black italic text-[var(--text-primary)] uppercase tracking-tighter">You've Arrived</h2>
                        <p className="text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.3em] mt-1">Ride Completed • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    {/* Receipt Card */}
                    <div className="rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-main)', boxShadow: 'var(--shadow-main)' }}>
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider font-bold">Total Fare</span>
                            <span className="text-2xl font-black text-[var(--text-primary)]">€{serviceType === "shared" ? "19.60" : "24.50"}</span>
                        </div>
                        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-4 rounded flex items-center justify-center" style={{ background: 'var(--brand-glow)' }}>
                                <selectedPayment.icon size={10} className="text-brand" />
                            </div>
                            <span className="text-white/50 text-[10px] font-medium">{selectedPayment.label}</span>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none" style={{ background: 'var(--brand-glow)' }} />
                    </div>

                    {/* Rating Section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <img src={driverInfo.image} alt="Driver" className="w-8 h-8 rounded-full border border-white/20" />
                            <div className="flex-1">
                                <p className="text-white text-xs font-bold">Rate {driverInfo.name}</p>
                                <p className="text-white/40 text-[9px]">How was your ride?</p>
                            </div>
                        </div>

                        {/* Interactive Stars */}
                        <div className="flex justify-between gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`h-10 flex-1 border rounded-lg flex items-center justify-center transition-all group ${rating >= star
                                        ? 'border-brand/40'
                                        : 'bg-white/5 border-white/5 hover:border-white/20'
                                        }`}
                                    style={rating >= star ? { background: 'rgba(52,211,153,0.1)', boxShadow: '0 0 10px rgba(52,211,153,0.15)' } : {}}
                                >
                                    <Star
                                        size={18}
                                        className={`transition-colors ${rating >= star ? '' : 'text-white/10 group-hover:text-white/30'}`}
                                        style={rating >= star ? { color: 'var(--brand)', fill: 'var(--brand)' } : {}}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Driver Tags */}
                        <div className="flex flex-wrap gap-2 mt-1">
                            {driverTags.map((tag) => (
                                <button
                                    key={tag.label}
                                    onClick={() => toggleTag(tag.label)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5 ${selectedTags.includes(tag.label)
                                        ? 'text-white border-transparent'
                                        : 'border-white/10 text-white/50 hover:border-brand/20 hover:text-white/70'
                                        }`}
                                    style={selectedTags.includes(tag.label) ? { background: 'linear-gradient(135deg,var(--brand),#064E3B)', boxShadow: '0 0 12px rgba(52,211,153,0.3)' } : { background: 'rgba(255,255,255,0.04)' }}
                                >
                                    <span>{tag.emoji}</span>
                                    <span>{tag.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Co-Rider Rating Section (Only if Pooling/Shared) */}
                    {isPoolingEnabled && (
                        <div className="flex flex-col gap-4 p-5 rounded-[2rem] bg-brand/5 border border-brand/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-brand" />
                                    <h3 className="text-sm font-black italic uppercase text-white">Rate Co-Riders</h3>
                                </div>
                                <span className="text-[8px] font-black bg-brand/10 text-brand px-2 py-0.5 rounded-full uppercase tracking-widest">Shared Security</span>
                            </div>

                            {mockCoRiders.map((rider, idx) => (
                                <div key={rider.id} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <img src={rider.image} alt={rider.name} className="w-8 h-8 rounded-full border border-white/10" />
                                        <div className="flex-1">
                                            <p className="text-white text-[11px] font-bold">{rider.name}</p>
                                            <p className="text-white/40 text-[8px] uppercase tracking-widest">Fellow Passenger</p>
                                        </div>
                                        <div className="text-[10px] font-black text-brand uppercase tracking-tighter italic">Vibe ID</div>
                                    </div>
                                    
                                    {/* Personality Check for Co-Rider */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {customerTags.map((tag) => (
                                            <button
                                                key={tag.label}
                                                onClick={() => {
                                                    setSelectedCoRiderTags(prev => {
                                                        const currentRiderTags = prev[rider.id] || [];
                                                        const newRiderTags = currentRiderTags.includes(tag.label)
                                                            ? currentRiderTags.filter(t => t !== tag.label)
                                                            : [...currentRiderTags, tag.label];
                                                        return { ...prev, [rider.id]: newRiderTags };
                                                    });
                                                }}
                                                className={`px-2 py-1 rounded-lg text-[8px] font-bold border transition-all flex items-center gap-1 ${(selectedCoRiderTags[rider.id] || []).includes(tag.label)
                                                    ? 'bg-brand/20 border-brand text-brand'
                                                    : 'bg-white/5 border-white/5 text-white/40'
                                                }`}
                                            >
                                                <span>{tag.emoji}</span>
                                                <span>{tag.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {idx < mockCoRiders.length - 1 && <div className="h-px bg-white/5 mx-2" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Done Button */}
                    <button
                        onClick={() => {
                            setRideStatus('idle');
                            setDriverInfo(null);
                            setPickup('Main St 123 (Current)');
                            setDestination('');
                            setCoRiderRating(0);
                            setSelectedCoRiderTags({});
                        }}
                        className="w-full h-12 font-black uppercase text-xs tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-2 text-white"
                        style={{ background: 'linear-gradient(135deg,var(--brand),#064E3B)', boxShadow: '0 0 20px rgba(52,211,153,0.3)' }}
                    >
                        Done
                    </button>
                </div>
            );
        }


        if (rideStatus === 'arrived' && driverInfo) {
            return (
                <div className="flex flex-col gap-5 pt-1 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse shadow-[0_0_12px_var(--brand-glow)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Driver has Arrived</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-xl bg-brand/10 border border-brand/20 flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand/60">Free Waiting</span>
                            <span className="text-sm font-black font-mono text-brand italic">{formatTime(waitingSeconds)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <img src={driverInfo.image} alt="Driver" className="w-13 h-13 rounded-xl object-cover border border-white/10" />
                        <div className="flex-1">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">{driverInfo.name}</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{driverInfo.car} • {driverInfo.plate}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <Sparkles size={10} className="text-brand" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-brand">Vehicle ID Verfied</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowChat(true)}
                            className="h-12 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={16} /> Contact
                        </button>
                        <div className="flex flex-col gap-2">
                            <div className="h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic text-brand/60 flex items-center justify-center bg-brand/5 border border-brand/20 animate-pulse">
                                Driver confirming boarding...
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        /* Standard Driver Details (Accepted State - Driver En Route) */
        if (driverInfo) {
            return (
                <div className="flex flex-col gap-5 pt-1">
                    {/* Status Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)', boxShadow: '0 0 6px var(--brand-glow)' }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--brand)' }}>Driver En Route</span>
                        </div>
                        <span className="text-white/40 text-[10px] font-mono">ID: #8291</span>
                    </div>

                    {/* Main Driver & Car Info */}
                    <div className="flex gap-4">
                        {/* Driver Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-2xl p-1 border shadow-2xl" style={{ background: 'var(--dark-950)', borderColor: 'var(--glass-border)' }}>
                                <img src={driverInfo.image} alt="Driver" className="w-full h-full object-cover rounded-xl" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/10 flex items-center gap-1 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-end))' }}>
                                <span className="text-white">★</span> {driverInfo.rating}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-0.5">
                                <h3 className="text-xl font-black italic tracking-tighter uppercase" style={{ color: 'var(--brand)' }}>{driverInfo.name}</h3>
                                <div className="px-3 py-1 rounded-xl bg-brand-glow border border-glass-border">
                                    <span className="text-lg font-black italic text-brand">{driverInfo.eta}</span>
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-brand/60 ml-1.5">Arrival</span>
                                </div>
                            </div>
                            <p className="text-white/40 text-xs font-black italic uppercase tracking-wider mb-2 leading-none">{driverInfo.car}</p>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg text-[10px] text-white/40 uppercase tracking-widest font-black" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>{driverInfo.color}</span>
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-white/70 font-black" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>{driverInfo.plate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-1">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRideStatus('idle')}
                                className="flex-[1] h-11 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-center gap-2"
                            >
                                <X size={14} /> Cancel
                            </button>
                            <button
                                onClick={() => setShowChat(true)}
                                className="flex-[2] h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white"
                                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-end))', boxShadow: '0 0 18px var(--brand-glow)' }}
                            >
                                Message Driver
                            </button>
                        </div>
                        {isPoolingEnabled && (
                            <button
                                onClick={() => {
                                    setIsPoolingEnabled(false);
                                    alert("Sharing stopped. Driver notified to maintain private route.");
                                }}
                                className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border border-brand/20 bg-brand/5 text-brand hover:bg-brand/10 transition-all"
                            >
                                Exit Pool • Switch to Private
                            </button>
                        )}
                    </div>
                    {/* Demo Start Ride Button - Hidden in prod */}
                    <button
                        onClick={() => setRideStatus('arrived')}
                        className="w-full h-8 mt-1 bg-white/5 border border-white/5 rounded-lg text-[9px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                        Demo: Arrive Now
                    </button>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="relative h-screen overflow-hidden text-[var(--text-primary)] font-sans" style={{ background: 'var(--bg-primary)' }}>
            {/* 3D Holographic Map — Frankfurt City Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ opacity: 0.22, mixBlendMode: 'screen' }}>
                <img
                    src="/frankfurt_white_model.jpg"
                    alt="Frankfurt 3D Mapping"
                    className="w-full h-full object-cover"
                    style={{
                        transform: 'scale(1.1)',
                        transformOrigin: 'center',
                        filter: 'brightness(1.4) saturate(0.1) hue-rotate(180deg)'
                    }}
                />
            </div>

            {/* Background Advanced Radar - Fixed Full Screen Center shifted up */}
            <div className="absolute inset-0 z-10 -translate-y-16">
                <AdvancedRadar selectedFilter={selectedBrand} />
            </div>

            {/* Top Navigation - Compact HUD Overlay */}
            <header className="absolute top-0 left-0 right-0 z-20 p-4 pt-4 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 backdrop-blur-md rounded-xl flex items-center justify-center hover:scale-110 transition-all pointer-events-auto"
                    style={{ background: 'var(--bg-secondary)', border: '2.5px solid var(--border-main)' }}
                >
                    <ArrowLeft size={18} className="text-[var(--brand)]" />
                </button>
                <div className="text-right">
                    <h2 className="text-sm font-black italic tracking-tighter uppercase leading-none drop-shadow-sm"
                        style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-end))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GREEN</h2>
                    <p className="text-[6px] font-black uppercase tracking-[0.3em] mt-0.5 italic" style={{ color: 'var(--brand)' }}>Active Grid View</p>
                </div>
            </header>

            {/* Top Sheet Notification System - Dark Glass Style */}
            <AnimatePresence>
                {rideStatus === 'searching' && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-20 left-4 right-4 z-50 pointer-events-none"
                    >
                        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(13,18,28,0.85)', border: '1px solid rgba(52,211,153,0.2)', backdropFilter: 'blur(30px)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{ background: 'rgba(52,211,153,0.1)' }}>
                                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(52,211,153,0.2)' }} />
                                <Sparkles size={18} style={{ color: 'var(--brand)' }} className="relative z-10" />
                            </div>
                            <div>
                                <h3 className="text-white text-xs font-black uppercase tracking-widest">Scanning Grid...</h3>
                                <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Locating nearby premium units</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {rideStatus === 'accepted' && driverInfo && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-20 left-4 right-4 z-50 pointer-events-auto"
                    >
                        <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'rgba(13,18,28,0.9)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(30px)', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
                            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'var(--brand)' }} />

                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <img src={driverInfo.image} alt="Driver" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-end))' }}>
                                        <span>★</span> {driverInfo.rating}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-white text-sm font-black uppercase tracking-wider">{driverInfo.name}</h3>
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: 'var(--brand)', background: 'var(--brand-glow)', border: '1px solid var(--glass-border)' }}>Accepted</span>
                                    </div>
                                    <p className="text-white/50 text-[10px] font-medium mt-0.5">{driverInfo.car} • {driverInfo.color}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-white/40 text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>{driverInfo.plate}</span>
                                        <span className="text-white/30 text-[9px]">•</span>
                                        <span className="text-[9px] font-bold" style={{ color: 'var(--brand)' }}>{driverInfo.eta} away</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment Selection Modal Overlay */}
            <AnimatePresence>
                {showPaymentOptions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto p-4"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                        onClick={() => {
                            setShowPaymentOptions(false);
                            setPaymentModalMode('select');
                        }}
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="p-6 rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden"
                            style={{ background: 'rgba(13,18,28,0.95)', border: '1px solid rgba(52,211,153,0.12)', backdropFilter: 'blur(30px)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white text-lg font-black italic uppercase tracking-wider">
                                    {paymentModalMode === 'select' ? 'Select Payment' :
                                        paymentModalMode === 'card-form' ? 'Add Credit Card' : 'Add Bank Info'}
                                </h3>
                                <button
                                    onClick={() => {
                                        if (paymentModalMode === 'select') {
                                            setShowPaymentOptions(false);
                                        } else {
                                            setPaymentModalMode('select');
                                        }
                                    }}
                                    className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-main)' }}
                                >
                                    {paymentModalMode === 'select' ? <X size={18} className="text-[var(--text-secondary)]" /> : <ArrowLeft size={18} className="text-[var(--text-secondary)]" />}
                                </button>
                            </div>

                            {paymentModalMode === 'select' ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                    {userPaymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => {
                                                setSelectedPayment(method);
                                                setShowPaymentOptions(false);
                                            }}
                                            className={`w-full h-14 rounded-xl flex items-center px-4 gap-4 transition-all group ${selectedPayment.id === method.id
                                                ? 'border border-brand/40'
                                                : 'border border-white/5 hover:border-white/10'
                                                }`}
                                            style={selectedPayment.id === method.id ? { background: 'rgba(52,211,153,0.08)', boxShadow: '0 0 15px rgba(52,211,153,0.15)' } : { background: 'rgba(255,255,255,0.04)' }}
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: selectedPayment.id === method.id ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)' }}>
                                                <method.icon size={18} className={method.color} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <span className={`block text-xs font-black uppercase tracking-wider ${selectedPayment.id === method.id ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                                                    {method.name}
                                                </span>
                                                <span className="text-[10px] text-white/40 font-medium">{method.label}</span>
                                            </div>
                                            {selectedPayment.id === method.id && (
                                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--brand)', boxShadow: '0 0 10px rgba(52,211,153,0.6)' }} />
                                            )}
                                        </button>
                                    ))}

                                    <div className="pt-2 grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPaymentModalMode('card-form')}
                                            className="h-12 rounded-xl flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/5 hover:border-brand/20 hover:bg-white/10 transition-all text-[8px] font-black uppercase tracking-widest text-white/60"
                                        >
                                            <CreditCard size={14} className="text-brand" />
                                            Add Card
                                        </button>
                                        <button
                                            onClick={() => setPaymentModalMode('bank-form')}
                                            className="h-12 rounded-xl flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/5 hover:border-blue-400/20 hover:bg-white/10 transition-all text-[8px] font-black uppercase tracking-widest text-white/60"
                                        >
                                            <Banknote size={14} className="text-blue-400" />
                                            Add Bank
                                        </button>
                                    </div>
                                </div>
                            ) : paymentModalMode === 'card-form' ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                                            <Smile size={14} />
                                        </div>
                                        <input
                                            placeholder="Cardholder Name"
                                            value={cardForm.name}
                                            onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                            className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-10 text-xs font-bold text-white focus:border-brand/40 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                                            <CreditCard size={14} />
                                        </div>
                                        <input
                                            placeholder="Card Number"
                                            value={cardForm.number}
                                            maxLength={16}
                                            onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                                            className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-10 text-xs font-bold text-white focus:border-brand/40 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            placeholder="MM/YY"
                                            value={cardForm.expiry}
                                            maxLength={5}
                                            onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                                            className="h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold text-white focus:border-brand/40 outline-none transition-all text-center"
                                        />
                                        <input
                                            placeholder="CVV"
                                            type="password"
                                            value={cardForm.cvv}
                                            maxLength={3}
                                            onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                                            className="h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold text-white focus:border-brand/40 outline-none transition-all text-center"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddCard}
                                        disabled={!cardForm.number || !cardForm.name}
                                        className="w-full h-12 bg-brand text-dark-950 font-black uppercase tracking-widest text-[10px] rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                                        style={{ boxShadow: '0 0 20px rgba(52,211,153,0.3)' }}
                                    >
                                        Seal Securely
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <input
                                        placeholder="Account Holder"
                                        value={bankForm.name}
                                        onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold text-white focus:border-blue-400/40 outline-none transition-all"
                                    />
                                    <input
                                        placeholder="IBAN"
                                        value={bankForm.iban}
                                        onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold text-white focus:border-blue-400/40 outline-none transition-all font-mono"
                                    />
                                    <input
                                        placeholder="BIC / SWIFT"
                                        value={bankForm.bic}
                                        onChange={(e) => setBankForm({ ...bankForm, bic: e.target.value })}
                                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold text-white focus:border-blue-400/40 outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleAddBank}
                                        disabled={!bankForm.iban || !bankForm.name}
                                        className="w-full h-12 bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                                        style={{ boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                                    >
                                        Verify Bank Link
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Modal - Personalized Messaging */}
            <AnimatePresence>
                {showFeedbackModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-auto p-4"
                        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
                    >
                        <motion.div
                            initial={{ y: 100, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 100, scale: 0.95 }}
                            className="p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl relative overflow-hidden"
                            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(40px)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, var(--brand), transparent)' }} />
                            
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-13 h-13 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                                    <MessageSquare size={32} className="text-brand" />
                                </div>
                                <h3 className="text-white text-xl font-black italic uppercase tracking-widest">Hey Alex,</h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">What's on your mind?</p>
                            </div>

                            <div className="relative group">
                                <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Share anything about the driver, car, or your experience..."
                                    className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand/40 focus:bg-white/10 transition-all resize-none font-medium"
                                />
                                <div className="absolute bottom-3 right-3 text-[8px] font-black uppercase text-white/10 group-focus-within:text-brand/40 transition-colors">
                                    Live Channel
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <button
                                    onClick={() => setShowFeedbackModal(false)}
                                    className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/5 hover:bg-white/5 transition-all"
                                >
                                    Not Now
                                </button>
                                <button
                                    onClick={() => {
                                        if (feedbackText.trim()) {
                                            triggerNotification('success', 'Feedback Sent', 'Thank you for helping us improve Green.');
                                            setFeedbackText('');
                                            setShowFeedbackModal(false);
                                        }
                                    }}
                                    className="h-12 rounded-2xl bg-brand text-dark-900 font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                                >
                                    Send Feedback
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Early Trip Termination Reason Selection Modal */}
            <AnimatePresence>
                {showEndTripReasons && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-auto p-4"
                        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
                    >
                        <motion.div
                            initial={{ y: 100, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 100, scale: 0.95 }}
                            className="p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl relative overflow-hidden"
                            style={{ background: 'var(--glass-bg)', border: '1px solid rgba(239,68,68,0.2)', backdropFilter: 'blur(40px)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #EF4444, transparent)' }} />
                            
                            <h3 className="text-white text-xl font-black italic uppercase tracking-widest mb-2">End Trip Early?</h3>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-8">Please select a reason for the record</p>

                            <div className="space-y-3 mb-6">
                                {[
                                    { id: 'emergency', label: 'Emergency', icon: '🚨' },
                                    { id: 'wrong', label: 'Wrong Destination', icon: '📍' },
                                    { id: 'discomfort', label: 'Safety/Discomfort', icon: '🛡️' },
                                    { id: 'other', label: 'Other / Personal', icon: '👤' }
                                ].map((reason) => (
                                    <button
                                        key={reason.id}
                                        onClick={() => setEndTripReason(reason.id)}
                                        className={`w-full h-14 rounded-2xl flex items-center px-5 gap-4 transition-all group ${endTripReason === reason.id ? 'bg-red-500/20 border-red-500' : 'bg-white/5 border-white/5 hover:border-red-500/30'}`}
                                        style={{ border: '1px solid', borderColor: endTripReason === reason.id ? '#EF4444' : 'rgba(255,255,255,0.05)' }}
                                    >
                                        <span className="text-xl">{reason.icon}</span>
                                        <span className={`flex-1 text-left text-[11px] font-black uppercase tracking-widest ${endTripReason === reason.id ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{reason.label}</span>
                                        {endTripReason === reason.id && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setRideStatus('completed');
                                        setShowEndTripReasons(false);
                                        triggerNotification('system', 'Trip Terminated', endTripReason ? `Trip ended early: ${endTripReason}` : 'Trip ended early by user request.');
                                    }}
                                    className="w-full h-14 rounded-2xl bg-red-500 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                                >
                                    Confirm End Trip
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setShowEndTripReasons(false);
                                        setEndTripReason(null);
                                    }}
                                    className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/5 hover:bg-white/5 transition-all"
                                >
                                    Cancel & Continue
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overflowing Floating Bottom Sheet - Soft Ultra-Compact Design */}
            <motion.div
                initial={{ y: 300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="fixed bottom-12 left-4 right-4 z-40"
            >
                <div className="rounded-[2rem] p-4 relative" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', boxShadow: '0 -4px 40px var(--shadow-main), 0 0 60px rgba(52,211,153,0.05)' }}>
                    {/* Subtle top shimmer line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(to right, transparent, rgba(52,211,153,0.3), transparent)' }} />
                    {renderBottomSheetContent()}
                </div>
            </motion.div>

            {/* Holographic Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(52,211,153,1) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(52,211,153,1) 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

            {/* Chat Overlay */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed inset-0 z-[60] pt-20 px-4 pb-8 flex flex-col pointer-events-auto"
                        style={{ background: 'var(--bg-primary)' }}
                    >
                        {/* Chat Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={driverInfo?.image} alt="Driver" className="w-10 h-10 rounded-xl border border-[var(--border-main)]" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[var(--bg-primary)] rounded-full" />
                                </div>
                                <div>
                                    <h3 className="text-[var(--text-primary)] text-lg font-black italic uppercase">{driverInfo?.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--brand)' }}>Online</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/80 hover:text-[var(--text-primary)] transition-all">
                                    <Phone size={18} />
                                </button>
                                <button
                                    onClick={() => setShowChat(false)}
                                    className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/80 hover:text-[var(--text-primary)] transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
                            {chatMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-4 rounded-2xl text-white ${msg.sender === 'user'
                                            ? 'rounded-tr-sm'
                                            : 'rounded-tl-sm'
                                            }`}
                                        style={msg.sender === 'user'
                                            ? { background: 'linear-gradient(135deg,var(--brand),#064E3B)' }
                                            : { background: 'var(--bg-secondary)', border: '1px solid var(--border-main)' }
                                        }
                                    >
                                        <p className="text-sm font-medium">{msg.text}</p>
                                        <p className={`text-[9px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-dark-950' : 'text-white'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="h-14 rounded-2xl flex items-center p-1.5 pl-4 gap-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-white/20"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim()}
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                style={{ background: 'linear-gradient(135deg,var(--brand),#064E3B)', boxShadow: '0 0 12px rgba(52,211,153,0.3)' }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GreenRidePage;





