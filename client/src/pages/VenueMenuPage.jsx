import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Plus, Sparkles, BellRing, Info, ChevronRight, Search, 
    ShieldCheck, ShoppingBag, MapPin, X, QrCode, Ticket, CreditCard, Wallet, Check, Zap, BedDouble, Trash2,
    Landmark
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRide } from '../context/RideContext';
import { useSocket } from '../context/SocketContext';

const VenueMenuPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { socket } = useSocket();
    
    const venueName = location.state?.venueName || "Eco-Park Central";
    const venueOffer = location.state?.venueOffer || "Reserve Level -1 Spots";
    const isTakeawayMode = location.state?.isTakeawayMode || false;
    
    const isWashHub = venueName.toLowerCase().includes('wash');
    const isParking = venueName.toLowerCase().includes('park');
    const isHotel = venueName.toLowerCase().includes('hotel') || venueName.toLowerCase().includes('luxe');
    const isStadium = venueName.toLowerCase().includes('stadium') || venueName.toLowerCase().includes('arena');
    const isDining = venueName.toLowerCase().includes('dining') || venueName.toLowerCase().includes('restaurant') || venueName.toLowerCase().includes('bistro') || venueName.toLowerCase().includes('eat') || venueName.toLowerCase().includes('food') || venueName.toLowerCase().includes('cafe') || venueName.toLowerCase().includes('café') || venueName.toLowerCase().includes('diner') || venueName.toLowerCase().includes('steakhouse') || venueName.toLowerCase().includes('gastronomy') || venueName.toLowerCase().includes('sushi') || venueName.toLowerCase().includes('pizza') || venueName.toLowerCase().includes('kitchen') || venueName.toLowerCase().includes('bistro');
    const isClub = (venueName.toLowerCase().includes('club') || venueName.toLowerCase().includes('disco') || venueName.toLowerCase().includes('lounge') || venueName.toLowerCase().includes('night') || venueName.toLowerCase().includes('bar') || venueName.toLowerCase().includes('festival') || venueName.toLowerCase().includes('event') || venueName.toLowerCase().includes('underground')) && !isDining && !isHotel && !isStadium && !isWashHub && !isParking;

    const isGroupActive = localStorage.getItem('green_group_state') === 'active';

    const [cart, setCart] = useState(location.state?.existingCart || []);
    const { venueTickets, setVenueTickets } = useRide();
    const [dynamicClubTickets, setDynamicClubTickets] = useState([]);
    const [showTicketHub, setShowTicketHub] = useState(false);
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [selectedTable, setSelectedTable] = useState(location.state?.selectedTable || null);

    const [activeFilter, setActiveFilter] = useState("All");

    const [showPaymentTerminal, setShowPaymentTerminal] = useState(location.state?.showPaymentTerminal || false);
    const [paymentStep, setPaymentStep] = useState(location.state?.paymentStep || 'table'); // 'table', 'guest', 'method'
    const [paymentMethod, setPaymentMethod] = useState(() => {
        if (location.state?.paymentMethod) {
            const parsed = Number(location.state.paymentMethod);
            return isNaN(parsed) ? location.state.paymentMethod : parsed;
        }
        try {
            const activeId = localStorage.getItem('green_active_payment_id');
            if (activeId) {
                const parsed = Number(activeId);
                return isNaN(parsed) ? activeId : parsed;
            }
        } catch (e) {}
        return null;
    });
    const [externalMethod, setExternalMethod] = useState(null);
    const [guestName, setGuestName] = useState(location.state?.guestName || "");
    const [guestDetails, setGuestDetails] = useState({
        firstName: '',
        lastName: '',
        address: '',
        email: '',
        phone: '',
        zip: '',
        city: '',
        idNumber: '',
        companyName: '',
        companyAddress: '',
        dob: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [attendees, setAttendees] = useState([]); // For stadium multi-ticket personalization
    const [lastOrderDetails, setLastOrderDetails] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const parkingCategories = [
        {
            name: "Hourly Rates",
            items: [
                { id: 'ph1', name: "Standard Hourly", price: 4.50, desc: "Billed per hour. Maximum 12 hours.", image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&h=400&fit=crop", tags: ["Self-Park"] },
                { id: 'ph2', name: "Prime Space Hourly", price: 8.00, desc: "Premium spots near exits/elevators.", image: "https://images.unsplash.com/photo-1545179605-1296651bc9b4?w=400&h=400&fit=crop", tags: ["Self-Park"] },
            ]
        },
        {
            name: "Standard Passes",
            items: [
                { id: 'pd1', name: "Daily Pass (24h)", price: 25.00, desc: "Full day access. No Valet included.", image: "https://images.unsplash.com/photo-1470224492023-147c28ff81ad?w=400&h=400&fit=crop", tags: ["No Valet"] },
            ]
        },
        {
            name: "Elite Subscriptions",
            items: [
                { id: 'pw1', name: "Weekly Membership", price: 120.00, desc: "7 days of priority parking. Valet Service Included.", image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=400&fit=crop", tags: ["Valet Included"] },
                { id: 'pm1', name: "Monthly Executive", price: 350.00, desc: "Unlimited access. 24/7 Valet Service & Carwash discounts.", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop", tags: ["Valet Included"] },
                { id: 'py1', name: "Annual Diamond", price: 3200.00, desc: "Dedicated spot. Full Concierge & Valet Service.", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop", tags: ["Valet Included"] },
            ]
        }
    ];

    const carwashCategories = [
        {
            name: "Professional Services",
            items: [
                { id: 'w1', name: "Ceramic Shield Pro", price: 85.00, desc: "9H Nano-ceramic coating for extreme gloss and 12-month protection.", image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=400&fit=crop", tags: ["Service"] },
                { id: 'w2', name: "Showroom Carnuba Wax", price: 45.00, desc: "Hand-applied Brazilian wax for exhibition-quality depth.", image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=400&fit=crop", tags: ["Service"] },
                { id: 'w3', name: "Interior Steam Purge", price: 35.00, desc: "Deep steam cleaning to eliminate bacteria and stubborn odors.", image: "https://images.unsplash.com/photo-1599256621730-535171e28e50?w=400&h=400&fit=crop", tags: ["Service"] },
            ]
        }
    ];

    const hotelCategories = [
        {
            name: "Zimmer (Rooms)",
            items: [
                { id: 'hr1', name: "Deluxe Zimmer", price: 180.00, desc: "Luxuriöses Zimmer mit Stadtblick, King-Size-Bett und modernster Smart-Room-Steuerung.", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=400&fit=crop", tags: ["Rooms", "Luxury", "Hotel Room"] },
                { id: 'hr2', name: "Executive Suite", price: 350.00, desc: "Großzügige Suite mit eigener Terrasse, persönlicher Bar und exklusivem Zugang zur VIP-Lounge.", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop", tags: ["Rooms", "Elite", "Suite"] }
            ]
        },
        {
            name: "Speisen (Food)",
            items: [
                { id: 'hf1', name: "Wagyu Gold Filet", price: 85.00, desc: "A5 Grade Wagyu with truffle butter and 24k gold flakes.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop", tags: ["Food", "Fine Dining"] },
                { id: 'hf2', name: "Lobster Thermidor", price: 65.00, desc: "Classic French preparation with creamy brandy sauce.", image: "https://images.unsplash.com/photo-1533682805518-48d1f5a8cd3a?w=400&h=400&fit=crop", tags: ["Seafood"] },
            ]
        },
        {
            name: "Getränke (Drinks)",
            items: [
                { id: 'hd1', name: "Midnight Neon Cocktail", price: 14.50, desc: "Blue Curacao, Vodka, Lime, Electric Glow Dust.", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop", tags: ["Drinks"] },
                { id: 'hd2', name: "Green Emerald Mojito", price: 16.00, desc: "Premium Gin, Midori, Cucumber, Fresh Mint, Soda.", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop", tags: ["Drinks"] }
            ]
        },
        {
            name: "Desserts",
            items: [
                { id: 'hde1', name: "Golden Lava Chocolate Cake", price: 18.00, desc: "Warm chocolate cake with a molten gold-dusted center, served with vanilla ice cream.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop", tags: ["Dessert", "Sweet"] },
                { id: 'hde2', name: "Pistachio Panna Cotta", price: 14.00, desc: "Creamy panna cotta infused with premium Sicilian pistachios.", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop", tags: ["Dessert", "Sweet"] }
            ]
        }
    ];

    const diningCategories = [
        {
            name: "Speisen (Food)",
            items: [
                { id: 'df1', name: "Wagyu Gold Filet", price: 85.00, desc: "A5 Grade Wagyu with truffle butter and 24k gold flakes.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop", tags: ["Food", "Fine Dining"] },
                { id: 'df2', name: "Lobster Thermidor", price: 65.00, desc: "Classic French preparation with creamy brandy sauce.", image: "https://images.unsplash.com/photo-1533682805518-48d1f5a8cd3a?w=400&h=400&fit=crop", tags: ["Seafood"] },
                { id: 'df3', name: "Truffle Tagliatelle", price: 32.00, desc: "Handmade pasta, fresh black truffles, aged parmesan cream.", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=400&fit=crop", tags: ["Food", "Vegetarian"] }
            ]
        },
        {
            name: "Getränke (Drinks)",
            items: [
                { id: 'dd1', name: "Midnight Neon Cocktail", price: 14.50, desc: "Blue Curacao, Vodka, Lime, Electric Glow Dust.", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop", tags: ["Drinks"] },
                { id: 'dd2', name: "Green Emerald Mojito", price: 16.00, desc: "Premium Gin, Midori, Cucumber, Fresh Mint, Soda.", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop", tags: ["Drinks"] },
                { id: 'dd3', name: "Chablis Premier Cru 0.75L", price: 75.00, desc: "Crisp French white wine, perfect with seafood.", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=400&fit=crop", tags: ["Drinks", "Wine"] }
            ]
        },
        {
            name: "Desserts",
            items: [
                { id: 'de1', name: "Golden Lava Chocolate Cake", price: 18.00, desc: "Warm chocolate cake with a molten gold-dusted center, served with vanilla ice cream.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop", tags: ["Dessert", "Sweet"] },
                { id: 'de2', name: "Pistachio Panna Cotta", price: 14.00, desc: "Creamy panna cotta infused with premium Sicilian pistachios.", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop", tags: ["Dessert", "Sweet"] }
            ]
        }
    ];

    const stadiumCategories = [
        {
            name: "Matchday Tickets",
            items: [
                { id: 'st1', name: "Executive VIP Box", price: 2500.00, desc: "Private suite for 12, premium catering, and field-side balcony access.", image: "https://images.unsplash.com/photo-1510204819217-1d35ae4489ae?w=400&h=400&fit=crop", tags: ["VIP"] },
                { id: 'st2', name: "Field-Side Premium", price: 450.00, desc: "Front row seats with lounge access and unlimited drinks.", image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=400&fit=crop", tags: ["Premium"] },
            ]
        },
        {
            name: "VIP Parking & Valet",
            items: [
                { id: 'sv1', name: "Stadium Valet Entry", price: 45.00, desc: "VIP gate vehicle drop-off. Car returned to exit at full-time.", image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=400&fit=crop", tags: ["Valet"] },
                { id: 'sv2', name: "The 'Watch & Wash' Bundle", price: 120.00, desc: "Valet drop-off + Full Ceramic detail at Green Wash Hub during the match.", image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=400&fit=crop", tags: ["Bundle", "Valet"] },
            ]
        }
    ];

    const clubCategories = [
        {
            name: "Event-Tickets & Eintrittskarten",
            items: dynamicClubTickets.length > 0 ? dynamicClubTickets : [
                { id: 't1', name: "Standard Eintrittskarte", price: 20.00, desc: "Standard entry ticket to the club. Includes one free welcome drink.", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop", tags: ["Ticket", "Fast-Lane"] },
                { id: 't2', name: "VIP Eintrittskarte (Fast-Lane)", price: 45.00, desc: "Fast-lane entry, VIP lounge access, and premium wardrobe service.", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop", tags: ["VIP", "Fast-Lane"] },
                { id: 't3', name: "Backstage Experience Pass", price: 150.00, desc: "All-access backstage entry, artist meet & greet (if applicable), and open bar access.", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop", tags: ["VIP Gold", "All-Access"] }
            ]
        },
        {
            name: "VIP Bottle Service",
            items: [
                { id: 'b1', name: "Belvedere Vodka 0.75L", price: 180.00, desc: "Served on ice with 4 mixers of your choice (Red Bull, Tonic, or Cola).", image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=400&fit=crop", tags: ["Bottle Service"] },
                { id: 'b2', name: "Dom Pérignon Champagne", price: 380.00, desc: "Prestige Cuvée, served perfectly chilled with fresh strawberries.", image: "https://images.unsplash.com/photo-1594487523522-f282d9c493ab?w=400&h=400&fit=crop", tags: ["Prestige", "Champagne"] }
            ]
        },
        {
            name: "Midnight Beverages",
            items: [
                { id: 'c1', name: "Midnight Neon Cocktail", price: 14.50, desc: "Blue Curacao, Vodka, Lime, Electric Glow Dust.", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop", tags: ["Drinks"] },
                { id: 'c2', name: "Green Emerald Mojito", price: 16.00, desc: "Premium Gin, Midori, Cucumber, Fresh Mint, Soda.", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop", tags: ["Drinks"] }
            ]
        }
    ];

    const menuCategories = isStadium ? stadiumCategories : isClub ? clubCategories : isHotel ? hotelCategories : isDining ? diningCategories : isWashHub ? carwashCategories : isParking ? parkingCategories : [
        {
            name: "Signature Cocktails",
            items: [
                { id: 'c1', name: "Midnight Neon", price: 14.50, desc: "Blue Curacao, Vodka, Lime, Electric Dust", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop", tags: ["Drinks"] },
                { id: 'c2', name: "Green Emerald", price: 16.00, desc: "Gin, Midori, Cucumber, Mint, Soda", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop", tags: ["Drinks"] },
            ]
        }
    ];

    const hasTicketsInCart = cart.some(item => 
        item.tags?.includes('Ticket') || 
        item.tags?.includes('Fast-Lane') || 
        item.tags?.includes('VIP') ||
        item.id.startsWith('t') || 
        item.id.startsWith('st') ||
        item.id.startsWith('dynamic')
    );

    const hasFoodOrDrinksInCart = cart.some(item => !item.tags?.includes('Ticket') && !item.tags?.includes('Fast-Lane') && !item.tags?.includes('VIP') && !item.id.startsWith('t') && !item.id.startsWith('st') && !item.id.startsWith('dynamic'));

    const triggerToast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleOrder = (item) => {
        const itemIsTicket = item.tags?.includes('Ticket') || 
            item.tags?.includes('Fast-Lane') || 
            item.tags?.includes('VIP') ||
            item.id.startsWith('t') || 
            item.id.startsWith('st') ||
            item.id.startsWith('dynamic');

        if (itemIsTicket) {
            // Trying to add a ticket
            if (hasFoodOrDrinksInCart) {
                triggerToast("Tickets must be purchased separately. Please clear your food/drink cart first.");
                return;
            }
        } else {
            // Trying to add food/drinks
            if (hasTicketsInCart) {
                triggerToast("Food and drinks can only be ordered at the business place. Please complete your ticket purchase first.");
                return;
            }
        }
        setCart([...cart, item]);
    };

    // Load dynamic tickets uploaded by B2B Manager
    useEffect(() => {
        const saved = localStorage.getItem('green_stadium_events');
        if (saved) {
            try {
                const raw = JSON.parse(saved);
                const published = raw.filter(e => e.published);
                
                const items = [];
                published.forEach(evt => {
                    evt.tiers.forEach((t, tIdx) => {
                        items.push({
                            id: `dynamic-${evt.id}-${t.id || tIdx}`,
                            name: `${evt.name} - ${t.name}`,
                            price: Number(t.price) || 20.00,
                            desc: `Entry ticket for ${evt.name}. Date: ${evt.date} at ${evt.time}. Allocation: ${t.quantity - (t.sold || 0)} available.`,
                            image: tIdx % 2 === 0 
                                ? "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop" 
                                : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
                            tags: ["Ticket", t.name.includes('VIP') ? "VIP" : "Standard"]
                        });
                    });
                });
                setDynamicClubTickets(items);
            } catch (e) {
                console.error('Failed to parse green_stadium_events in VenueMenuPage:', e);
            }
        }
    }, []);

    // Sync states when returning from payment method page or location state changes
    useEffect(() => {
        if (location.state) {
            if (location.state.showPaymentTerminal !== undefined) {
                setShowPaymentTerminal(location.state.showPaymentTerminal);
            }
            if (location.state.paymentStep !== undefined) {
                setPaymentStep(location.state.paymentStep);
            }
            if (location.state.existingCart !== undefined) {
                setCart(location.state.existingCart);
            }
            if (location.state.selectedTable !== undefined) {
                setSelectedTable(location.state.selectedTable);
            }
            if (location.state.guestName !== undefined) {
                setGuestName(location.state.guestName);
            }
            if (location.state.guestDetails !== undefined) {
                setGuestDetails(location.state.guestDetails);
            }
            if (location.state.attendees !== undefined) {
                setAttendees(location.state.attendees);
            }
        }

        // Sync active payment method from location state or localStorage
        let activeId = null;
        if (location.state?.paymentMethod !== undefined) {
            activeId = location.state.paymentMethod;
        } else {
            try {
                activeId = localStorage.getItem('green_active_payment_id');
            } catch (e) {}
        }
        
        if (activeId !== null && activeId !== undefined) {
            const parsed = Number(activeId);
            setPaymentMethod(isNaN(parsed) ? activeId : parsed);
        }
    }, [location.state]);

    // Auto-initialize attendees for stadium or club event tickets
    useEffect(() => {
        if (showPaymentTerminal && paymentStep === 'guest' && (isStadium || isClub)) {
            const ticketItems = cart.filter(item => item.id.startsWith('st') || item.id.startsWith('t'));
            const totalTickets = ticketItems.length;
            if (totalTickets > 1) {
                // Initialize or maintain attendee list (excluding lead guest)
                setAttendees(prev => {
                    if (prev.length === totalTickets - 1) return prev;
                    return Array(totalTickets - 1).fill(null).map((_, i) => prev[i] || { name: '', email: '', phone: '' });
                });
            } else {
                setAttendees([]);
            }
        }
    }, [showPaymentTerminal, paymentStep, isStadium, isClub, cart]);

    const getPaymentMethods = () => {
        try {
            const savedMethods = localStorage.getItem('green_payment_methods');
            if (savedMethods) {
                const methods = JSON.parse(savedMethods);
                if (methods && methods.length > 0) {
                    return methods.map(m => {
                        let label = m.provider || m.type;
                        let icon = CreditCard;
                        
                        if (m.type === 'Credit Card') {
                            const last4Digits = m.last4 ? m.last4.replace(/\s/g, '').slice(-4) : '4242';
                            label = `${m.provider || 'Card'} (•••• ${last4Digits})`;
                            icon = CreditCard;
                        } else if (m.type === 'Bank Account') {
                            const last4Digits = m.iban ? m.iban.replace(/\s/g, '').slice(-4) : '5678';
                            label = `${m.provider || 'Bank'} (•••• ${last4Digits})`;
                            icon = Landmark;
                        } else if (m.type === 'PayPal') {
                            label = `PayPal (${m.email || 'alex.p@uplink.net'})`;
                            icon = Wallet;
                        } else if (m.type === 'Klarna') {
                            label = `Klarna (${m.provider || 'Klarna'})`;
                            icon = Sparkles;
                        } else if (m.type === 'Revolut') {
                            label = `Revolut (${m.provider || 'Revolut'})`;
                            icon = Zap;
                        }
                        
                        return {
                            id: m.id, // Real numeric ID from secure bank hub
                            label,
                            icon
                        };
                    });
                }
            }
        } catch (e) {
            console.error('Failed to get dynamic payment methods:', e);
        }

        // Fallback defaults
        return [
            { id: 1, label: 'Mastercard (•••• 4242)', icon: CreditCard },
            { id: 2, label: 'Deutsche Bank (•••• 5678)', icon: Landmark },
            { id: 3, label: 'PayPal (alex.p@uplink.net)', icon: Wallet }
        ];
    };

    const isBooking = isHotel && cart.some(item => item.tags?.includes('Luxury') || item.tags?.includes('Elite'));

    const activePaymentMethods = (isHotel ? [
        { id: 'room_charge', label: 'Charge to Room (Folio)', icon: BedDouble },
        { id: 'external', label: 'External Card', icon: CreditCard },
        ...getPaymentMethods(),
        { id: 'cash', label: 'Cash (Pay at Door)', icon: ShoppingBag }
    ] : [
        ...getPaymentMethods()
    ]).filter(m => {
        if ((isStadium || isParking || isClub) && m.id === 'cash') return false;
        if (isBooking && (m.id === 'room_charge' || m.id === 'cash')) return false;
        return true;
    });

    useEffect(() => {
        if (showPaymentTerminal && paymentStep === 'method') {
            const activeIds = activePaymentMethods.map(m => String(m.id));
            if (!paymentMethod || !activeIds.includes(String(paymentMethod))) {
                if (activeIds.length > 0) {
                    setPaymentMethod(activePaymentMethods[0].id);
                }
            }
        }
    }, [showPaymentTerminal, paymentStep, isBooking, paymentMethod, cart]);

    // duplicate removed: const hasTicketsInCart = cart.some(item => 
        // ticket check duplicate removed
        // fast-lane check duplicate removed
        // vip check duplicate removed
        // id check duplicate removed
        // st check duplicate removed
    // duplicate checks ended

    const handleCheckout = () => {
        // 1. If they are booking a hotel room (B2C hotel booking):
        // ALWAYS collect detailed guest onboarding info (First Name, Surname, address, email, phone, company invoicing) first.
        // Bypasses table/room selector because room is assigned by hotel at check-in.
        if (isBooking) {
            setPaymentStep('guest');
            setShowPaymentTerminal(true);
            return;
        }

        // 2. If they are buying event/stadium/club tickets:
        // ALWAYS collect ticket holder details (name, email, phone) for email delivery,
        // even if group is active (group admin still provides ticket holder info).
        if (hasTicketsInCart) {
            setPaymentStep('guest');
            setShowPaymentTerminal(true);
            return;
        }

        // 2. If group is active (and no tickets in cart):
        // bypass guest details: just choose table, then confirm directly as UNPAID.
        if (isGroupActive) {
            if (!selectedTable) {
                setPaymentStep('table');
                setShowPaymentTerminal(true);
                return;
            }
            confirmPayment();
            return;
        }

        // 3. If they chose to order food or drinks (no tickets in cart and group is not active):
        // they only choose table and then pay! No guest name/email/phone required.
        if (!selectedTable) {
            setPaymentStep('table');
            setShowPaymentTerminal(true);
            return;
        }

        // Directly go to payment method selection, bypassing guest details entirely!
        setPaymentStep('method');
        setShowPaymentTerminal(true);
    };

    const confirmPayment = () => {
        setIsProcessing(true);
        
        // Simulation delay
        setTimeout(() => {
            const isCash = String(paymentMethod) === 'cash';
            const isRoomCharge = String(paymentMethod) === 'room_charge';
            
            let paymentMethodName = paymentMethod;
            if (paymentMethod) {
                const matched = getPaymentMethods().find(m => String(m.id) === String(paymentMethod));
                if (matched) {
                    paymentMethodName = matched.label;
                }
            }
            
            const newTicket = {
                id: `#${Date.now()}`,
                type: (isStadium && hasTicketsInCart) ? 'stadium_ticket' : (isClub && hasTicketsInCart) ? 'club_ticket' : isParking ? 'parking' : isWashHub ? 'service' : isBooking ? 'booking' : (isHotel ? 'room_service' : 'order'),
                venueName,
                venueOffer,
                tableId: isStadium ? 'E-Ticket' : isClub ? 'Club-Pass' : hasTicketsInCart ? 'E-Ticket' : isParking ? 'Valet-Pass' : isWashHub ? 'Wash-Ticket' : isBooking ? 'Check-in Assigned' : selectedTable,
                guestName: isBooking ? `${guestDetails.firstName} ${guestDetails.lastName}`.trim() : guestName,
                guestDetails: (isBooking || isStadium || isClub || hasTicketsInCart) ? guestDetails : null,
                attendees: (isStadium || isClub) ? attendees : [],
                items: [...cart],
                total: totalCost,
                paymentMethod: isGroupActive ? 'group_tab' : (paymentMethod === 'external' ? externalMethod : paymentMethodName),
                paymentStatus: isGroupActive ? 'UNPAID' : ((isRoomCharge || !isCash) ? 'PAID' : 'PENDING'),
                orderStatus: hasTicketsInCart ? 'PENDING' : (isGroupActive ? 'GROUP ORDER' : ((isStadium || isClub) ? 'DISPATCHED' : 'PENDING')),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            if (isGroupActive) {
                try {
                    const currentTab = JSON.parse(localStorage.getItem('green_group_tab') || '[]');
                    const newTabItems = cart.map(item => ({
                        member: 'YOU',
                        item: item.name,
                        price: item.price,
                        status: 'pending',
                        payer: 'self'
                    }));
                    localStorage.setItem('green_group_tab', JSON.stringify([...currentTab, ...newTabItems]));
                } catch (e) {
                    console.error('Failed to sync new order items with group tab:', e);
                }
            }
            
            setVenueTickets(prev => [newTicket, ...prev]);
            setLastOrderDetails(newTicket);
            
            // Emit real-time WebSocket event for the UX Lab ecosystem
            if (socket) {
                console.log('📡 Emitting submit-uxlab-event for ticket:', newTicket.id);
                socket.emit('submit-uxlab-event', newTicket);
            }
            
            // ── REAL-TIME MANAGER DASHBOARD SYNCHRONIZATION ──
            try {
                const managerOrders = JSON.parse(localStorage.getItem('green_active_orders') || '[]');
                
                let managerItemNames = [];
                if (newTicket.items && newTicket.items.length > 0) {
                    managerItemNames = newTicket.items.map(it => `${it.quantity || 1}x ${it.name}`);
                } else if (newTicket.venueOffer) {
                    managerItemNames = [newTicket.venueOffer.name || 'Premium Stay Package'];
                } else {
                    managerItemNames = ['Standard Booking'];
                }

                // Map payment display
                let paymentDisplay = 'Online';
                if (isCash) paymentDisplay = 'Cash';
                else if (paymentMethod === 'room_charge') paymentDisplay = 'Room Charge';
                // Map type display
                let typeDisplay = 'Dine-In';
                if (isBooking) typeDisplay = 'Stay Booking';
                else if (isHotel) typeDisplay = 'Room Service';
                else if (isStadium && hasTicketsInCart) typeDisplay = 'Stadium E-Ticket';
                else if (isClub && hasTicketsInCart) typeDisplay = 'Club Event Ticket';
                else if (isParking) typeDisplay = 'Valet Parking';
                else if (isWashHub) typeDisplay = 'Wash Service';

                const managerOrder = {
                    guest: guestDetails?.companyName ? `${newTicket.guestName} (${guestDetails.companyName})` : (newTicket.guestName || 'Anonymous Guest'),
                    company: guestDetails?.companyName || undefined,
                    items: managerItemNames,
                    total: typeof newTicket.total === 'number' ? newTicket.total.toFixed(2) : String(newTicket.total),
                    status: isBooking ? 'Booked' : 'Received',
                    type: typeDisplay,
                    time: 'Just now',
                    payment: paymentDisplay,
                    table: (!isBooking && !isHotel && !isStadium && !isClub && !isParking && !isWashHub && !hasTicketsInCart) ? newTicket.tableId : undefined,
                    room: (isBooking || isHotel) ? (newTicket.tableId && newTicket.tableId !== 'Check-in Assigned' ? newTicket.tableId : String(Math.floor(100 + Math.random() * 400))) : undefined,
                    checkIn: isBooking ? 'May 19' : undefined,
                    checkOut: isBooking ? 'May 21' : undefined
                };

                // Prepend new order to global list
                const updatedOrders = [managerOrder, ...managerOrders];
                localStorage.setItem('green_active_orders', JSON.stringify(updatedOrders));

                // Sync to stadium/club events sold counts
                const savedEvents = localStorage.getItem('green_stadium_events');
                if (savedEvents && (isStadium || isClub)) {
                    const events = JSON.parse(savedEvents);
                    const updatedEvents = events.map(evt => {
                        // Check if venueName or event name matches
                        const matchesVenue = evt.name.toLowerCase().includes(venueName.toLowerCase()) || venueName.toLowerCase().includes(evt.name.toLowerCase());
                        if (matchesVenue) {
                            return {
                                ...evt,
                                tiers: evt.tiers.map(t => {
                                    // Match cart item names with tier names
                                    const purchasedItem = cart.find(cItem => cItem.name.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(cItem.name.toLowerCase()));
                                    if (purchasedItem) {
                                        return { ...t, sold: (t.sold || 0) + (purchasedItem.quantity || 1) };
                                    }
                                    return t;
                                })
                            };
                        }
                        return evt;
                    });
                    localStorage.setItem('green_stadium_events', JSON.stringify(updatedEvents));
                }

                // Dispatch cross-iframe update events
                if (window.parent) {
                    window.parent.dispatchEvent(new CustomEvent('green-orders-updated'));
                    window.parent.dispatchEvent(new CustomEvent('green-stadium-events-updated'));
                }
            } catch (e) {
                console.error('Failed to sync order with Manager Dashboard:', e);
            }
            
            // Log Simulated Dispatch
            if (isStadium) {
                console.log(`🎟️ STADIUM TICKET DISPATCH:`);
                console.log(`- Lead: ${guestName} (${guestDetails.email})`);
                attendees.forEach((a, i) => {
                    console.log(`- Attendee #${i+2}: ${a.name || 'Anonymous'} (${a.email || 'SMS Invite'})`);
                    if (!a.email) {
                        console.log(`  > SMS INVITE SENT TO: ${a.phone || 'SYSTEM GENERATED'}`);
                    }
                });
            }

            setCart([]);
            setIsProcessing(false);
            setShowPaymentTerminal(false);
            
            if (isGroupActive) {
                navigate('/order/tracker', {
                    state: {
                        cart: newTicket.items,
                        venueName: newTicket.venueName,
                        venueOffer: newTicket.venueOffer,
                        orderId: newTicket.id,
                        tableId: newTicket.tableId,
                        paymentStatus: 'UNPAID',
                        orderStatus: hasTicketsInCart ? 'PENDING' : 'GROUP ORDER',
                        guestName: newTicket.guestName,
                        guestEmail: newTicket.guestDetails?.email,
                        guestPhone: newTicket.guestDetails?.phone
                    }
                });
            } else {
                setShowTicketHub(true);
            }

            const successMsg = isGroupActive
                ? `Group order sent for Table ${selectedTable || 'BAR'}! Added to Group Tab ledger.`
                : isStadium 
                    ? `Mission Secured. Personalized tickets dispatched to ${guestName} and ${attendees.length} guests.`
                    : isHotel 
                        ? `Request Sent for Room ${selectedTable}. Added to Folio.` 
                        : isWashHub
                            ? `Request Sent for Ticket #${Date.now().toString().slice(-4)}. Payment Pending.`
                            : `Order Sent for Table ${selectedTable}. Payment Pending.`;
            
            triggerToast(successMsg);
        }, 2000);
    };

    // duplicate triggerToast removed: const triggerToast = (msg) => {
        // setToastMsg duplicate removed
        // setShowToast duplicate removed
        // setTimeout duplicate removed
    // duplicate triggerToast ended

    const getCheckoutLabel = () => {
        if (isParking) return 'GET ACCESS PASS';
        if (isStadium) return 'GENERATE TICKETS';
        if (isBooking) return 'BOOK ROOM';
        if (isHotel) return 'ORDER ROOM SERVICE';
        if (isWashHub) return 'REQUEST SERVICE';
        
        return 'SEND ORDER';
    };

    const totalCost = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans relative pb-32">
            <AnimatePresence>
                {showToast && (
                    <motion.div 
                        initial={{ y: -100, opacity: 0, x: "-50%" }} 
                        animate={{ y: 24, opacity: 1, x: "-50%" }} 
                        exit={{ y: -100, opacity: 0, x: "-50%" }} 
                        className="fixed top-0 left-1/2 z-[200] w-[90%] max-w-md px-6 py-4 bg-black border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                            <Zap size={20} className="fill-brand" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-1">Operational Protocol</p>
                            <p className="text-[11px] font-bold text-white uppercase leading-relaxed">{toastMsg}</p>
                        </div>
                        <div className="ml-auto w-1 h-8 bg-white/5 rounded-full relative overflow-hidden">
                            <motion.div 
                                initial={{ height: "100%" }} 
                                animate={{ height: 0 }} 
                                transition={{ duration: 3, ease: "linear" }}
                                className="absolute bottom-0 left-0 right-0 bg-brand/40"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-main)]"><ArrowLeft size={24} /></button>
                <div className="text-center">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">{venueName}</h1>
                    <p className="text-[8px] font-black uppercase text-brand tracking-[0.2em]">Live Digital Menu</p>
                </div>
                <div className="flex items-center gap-3 relative">
                    <AnimatePresence>
                        {venueTickets.length > 0 && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                onClick={() => setShowTicketHub(true)}
                                className="w-12 h-12 bg-[var(--bg-secondary)] border-2 border-brand/40 rounded-2xl flex items-center justify-center text-brand transition-all relative"
                                style={{ 
                                    boxShadow: '0 0 20px var(--brand-glow), inset 0 0 10px var(--brand-glow)'
                                }}
                            >
                                <Ticket size={22} className="relative z-10" />
                                <motion.div 
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-brand/20 rounded-2xl blur-md"
                                />
                                {venueTickets.length > 1 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--text-primary)] text-[var(--bg-primary)] text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">
                                        {venueTickets.length}
                                    </div>
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-12">
                {/* Tactical Ordering Protocol Information Card */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-main)]/10 p-5 rounded-[2.5rem] flex gap-4 text-left relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                        <Info size={20} />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand">Order Protocol Warning</span>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase leading-relaxed">
                            Only tickets can be purchased in advance. Food and drinks can only be ordered when you are physically present at the business place (club, bar, restaurant, hotel, or event) to access their live on-premise menu.
                        </p>
                    </div>
                </div>
                {menuCategories.map((cat, idx) => (
                    <section key={idx} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">{cat.name}</h2>
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-brand/20 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {cat.items.map((item) => (
                                <div key={item.id} className="bg-[var(--bg-secondary)]/50 border border-white/5 rounded-[2.5rem] p-4 flex flex-col hover:border-brand/30 transition-all group">
                                    <div className="relative h-40 w-full rounded-[2rem] overflow-hidden mb-4">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-60" />
                                    </div>
                                    <h3 className="text-sm font-black italic uppercase text-[var(--text-primary)] mb-1">{item.name}</h3>
                                    <p className="text-[10px] text-[var(--text-primary)] opacity-60 font-black uppercase tracking-widest line-clamp-2 mb-4 h-8">{item.desc}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="text-lg font-black italic text-brand">€{item.price.toFixed(2)}</span>
                                        <button onClick={() => handleOrder(item)} className="w-10 h-10 bg-brand text-dark-900 rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 active:scale-90 transition-transform"><Plus size={20} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/90 to-transparent z-50">
                    <div className="max-w-lg mx-auto flex gap-4">
                        <button onClick={() => setCart([])} className="px-6 py-5 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">Cancel</button>
                        <button onClick={handleCheckout} className="flex-1 py-6 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--border-main)] rounded-[2rem] flex items-center justify-between px-8 group transition-all shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)]">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-[var(--bg-primary)]">
                                {getCheckoutLabel()}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-black italic text-[var(--bg-primary)]">€{totalCost.toFixed(2)}</span>
                                <ChevronRight size={22} className="text-[var(--bg-primary)] group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Terminal Bottom Sheet */}
            <AnimatePresence>
                {showPaymentTerminal && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentTerminal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div 
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
                            className="bg-[var(--bg-primary)] border-t border-white/10 rounded-t-[3.5rem] p-8 pb-12 space-y-8 shadow-2xl relative z-10 w-full max-w-lg"
                        >
                            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto" />
                            
                            <AnimatePresence mode="wait">
                                {paymentStep === 'table' ? (
                                    <motion.div key="table" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="text-center space-y-2">
                                            <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Identify Your {isHotel ? 'Room' : 'Table'}</h3>
                                            <p className="text-[10px] text-brand font-black uppercase tracking-[0.3em]">Operational Location Required</p>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                                                const isOccupied = !isHotel && [3, 7, 10].includes(num); // Simulated occupied tables for non-hotels
                                                return (
                                                    <button 
                                                        key={num} 
                                                        disabled={isOccupied}
                                                        onClick={() => { setSelectedTable(num); }}
                                                        className={`h-16 rounded-2xl border text-lg font-black transition-all relative overflow-hidden ${
                                                            selectedTable === num ? 'bg-brand border-brand text-dark-950' : 
                                                            isOccupied ? 'bg-red-500/5 border-red-500/20 text-red-500/30 cursor-not-allowed' :
                                                            'bg-[var(--bg-secondary)] border-[var(--border-main)] text-[var(--text-secondary)] hover:border-brand/30 hover:text-[var(--text-primary)]'
                                                        }`}
                                                    >
                                                        {num}
                                                        {isOccupied && (
                                                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="relative group">
                                            <input 
                                                type="text" 
                                                placeholder={`Or Type ${isHotel ? 'Room' : 'Table'} Number...`}
                                                className="w-full py-5 px-8 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-xs font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400 focus:border-brand/50 outline-none transition-all"
                                                value={selectedTable && selectedTable !== 'BAR' && selectedTable !== 'Front Desk' ? selectedTable : ''}
                                                onChange={(e) => setSelectedTable(e.target.value)}
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-gray-400 tracking-widest italic">Manual Entry</div>
                                        </div>
                                        <button 
                                            onClick={() => { 
                                                const tbl = selectedTable || (isHotel ? 'Front Desk' : 'BAR');
                                                if (!selectedTable) setSelectedTable(tbl);
                                                
                                                // Group mode: always bypass payment method step, confirm directly as UNPAID
                                                if (isGroupActive) {
                                                    confirmPayment();
                                                } else {
                                                    setPaymentStep('method');
                                                }
                                            }} 
                                            className={`w-full py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${selectedTable ? 'bg-brand text-dark-950 shadow-brand/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-main)] text-[var(--text-secondary)]'}`}
                                        >
                                            {selectedTable && selectedTable !== 'BAR' && selectedTable !== 'Front Desk' ? `Confirm ${isHotel ? 'Room' : 'Table'} ${isGroupActive ? '→ Group Tab' : ''}` : (isHotel ? 'Contacting Front Desk' : 'Ordering at the Bar')}
                                        </button>
                                    </motion.div>
                                ) : paymentStep === 'guest' ? (
                                    <motion.div key="guest" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                        <div className="text-center space-y-2 relative">
                                            <button onClick={() => (hasTicketsInCart || isBooking) ? setShowPaymentTerminal(false) : setPaymentStep('table')} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--text-primary)] transition-all"><ArrowLeft size={20} /></button>
                                            
                                            {hasTicketsInCart && (
                                                <button 
                                                    onClick={() => setAttendees([...attendees, { name: '', email: '', phone: '' }])}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black border border-white/10 text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 group transition-all hover:border-brand/40"
                                                >
                                                    <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                                                </button>
                                            )}

                                            <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">
                                                {(isStadium || isClub) ? 'Ticket Hub' : isParking ? 'Pass Authorization' : isWashHub ? 'Service Authorization' : isBooking ? 'Guest Registration' : 'Guest Verification'}
                                            </h3>
                                            <p className="text-[10px] text-brand font-black uppercase tracking-[0.3em]">
                                                {isStadium ? 'Stadium Mission Authorization' : isClub ? 'Club Event Admission Protocol' : isParking ? 'Digital Access Pass Protocol' : isWashHub ? 'Wash Service Protocol' : isBooking ? 'Full Check-in Protocol' : `Room #${selectedTable} Security Check`}
                                            </p>
                                        </div>
                                        
                                        <div className={`space-y-4 ${ (isBooking || isStadium || isParking || isWashHub || isClub) ? 'max-h-[50vh] overflow-y-auto pr-2 no-scrollbar px-1' : ''}`}>
                                            {isBooking ? (
                                                <div className="space-y-4 px-2">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand mb-2">Gast-Details / Guest Information</p>
                                                    
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Vorname / First Name</label>
                                                            <input 
                                                                type="text" placeholder="John"
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                value={guestDetails.firstName || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setGuestDetails({...guestDetails, firstName: val});
                                                                    setGuestName(val + ' ' + (guestDetails.lastName || ''));
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Nachname / Surname</label>
                                                            <input 
                                                                type="text" placeholder="Doe"
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                value={guestDetails.lastName || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setGuestDetails({...guestDetails, lastName: val});
                                                                    setGuestName((guestDetails.firstName || '') + ' ' + val);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">E-Mail / Email Address</label>
                                                            <input 
                                                                type="email" placeholder="john.doe@example.com"
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                value={guestDetails.email}
                                                                onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Telefon / Phone Number</label>
                                                            <input 
                                                                type="tel" placeholder="+49 152..."
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                value={guestDetails.phone}
                                                                onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Straße & Hausnr. / Address</label>
                                                        <input 
                                                            type="text" placeholder="Hauptstraße 12"
                                                            className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                            value={guestDetails.address}
                                                            onChange={(e) => setGuestDetails({...guestDetails, address: e.target.value})}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">PLZ / Zip Code</label>
                                                            <input 
                                                                type="text" placeholder="60311"
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                value={guestDetails.zip}
                                                                onChange={(e) => setGuestDetails({...guestDetails, zip: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Ort / City</label>
                                                            <input 
                                                                type="text" placeholder="Frankfurt"
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                value={guestDetails.city}
                                                                onChange={(e) => setGuestDetails({...guestDetails, city: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Ausweisnr. / Passport ID</label>
                                                            <input 
                                                                type="text" placeholder="C00000000"
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                value={guestDetails.idNumber}
                                                                onChange={(e) => setGuestDetails({...guestDetails, idNumber: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Geburtsdatum / DOB</label>
                                                            <input 
                                                                type="text" placeholder="DD.MM.YYYY"
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                value={guestDetails.dob}
                                                                onChange={(e) => setGuestDetails({...guestDetails, dob: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand">Firmenrechnung / Company Invoicing (Optional)</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Firmenname / Company Name</label>
                                                                <input 
                                                                    type="text" placeholder="Green Mobility GmbH"
                                                                    className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                    value={guestDetails.companyName}
                                                                    onChange={(e) => setGuestDetails({...guestDetails, companyName: e.target.value})}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Firmenadresse / Company Address</label>
                                                                <input 
                                                                    type="text" placeholder="Zeil 106, 60313 Frankfurt"
                                                                    className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400/40 focus:border-brand/50 outline-none transition-all"
                                                                    value={guestDetails.companyAddress}
                                                                    onChange={(e) => setGuestDetails({...guestDetails, companyAddress: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-left space-y-4">
                                                    <div className="px-2">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand mb-4">
                                                            {isParking ? 'Lead Driver' : isWashHub ? 'Service Requestor' : 'Lead Ticket Holder'}
                                                        </p>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Full Name / Primary Holder..."
                                                            className="w-full py-5 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-xs font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400 focus:border-brand/50 outline-none transition-all"
                                                            value={guestName}
                                                            onChange={(e) => setGuestName(e.target.value)}
                                                        />
                                                    </div>

                                                    {(hasTicketsInCart || isStadium || isParking || isWashHub || isClub) && (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-4 px-2">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand mt-4">Communication Hub</p>
                                                            <input 
                                                                type="email" placeholder="Personal Email..."
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]"
                                                                value={guestDetails.email}
                                                                onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                                                            />
                                                            {!hasTicketsInCart && (

                                                                <input 
                                                                type="tel" placeholder="Mobile Number (SMS Delivery)..."
                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]"
                                                                value={guestDetails.phone}
                                                                onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                                                            />

                                                            )}
                                                            
                                                            {hasTicketsInCart && attendees.length > 0 && (
                                                                <div className="mt-8 space-y-10">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex-1 h-px bg-[var(--border-main)]/5" />
                                                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)]/30">Additional Members</p>
                                                                        <div className="flex-1 h-px bg-[var(--border-main)]/5" />
                                                                    </div>
                                                                    {attendees.map((attendee, idx) => (
                                                                        <div key={idx} className="space-y-3 p-6 bg-[var(--bg-secondary)]/50 border border-[var(--border-main)] rounded-[2rem]">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]/60 italic">Member #{idx + 2}</p>
                                                                                <div className="flex items-center gap-3">
                                                                                    <button 
                                                                                        onClick={() => setAttendees(attendees.filter((_, i) => i !== idx))}
                                                                                        className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                                                                    >
                                                                                        <Trash2 size={12} />
                                                                                    </button>
                                                                                    <ShieldCheck size={14} className="text-brand opacity-40" />
                                                                                </div>
                                                                            </div>
                                                                            <input 
                                                                                type="text" placeholder="Full Name..."
                                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]"
                                                                                value={attendee.name}
                                                                                onChange={(e) => {
                                                                                    const newAttendees = [...attendees];
                                                                                    newAttendees[idx] = { ...newAttendees[idx], name: e.target.value };
                                                                                    setAttendees(newAttendees);
                                                                                }}
                                                                            />
                                                                            <input 
                                                                                type="email" placeholder="Email Address..."
                                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]"
                                                                                value={attendee.email}
                                                                                onChange={(e) => {
                                                                                    const newAttendees = [...attendees];
                                                                                    newAttendees[idx] = { ...newAttendees[idx], email: e.target.value };
                                                                                    setAttendees(newAttendees);
                                                                                }}
                                                                            />
                                                                            <div className="p-3 bg-brand/5 border border-brand/10 rounded-xl">
                                                                                <p className="text-[7px] font-black text-brand uppercase tracking-widest leading-tight">
                                                                                    * Unregistered users will receive a registration invite via Email to secure their ticket.
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => {
                                                if (isBooking) {
                                                    setPaymentStep('method');
                                                } else {
                                                    if (hasTicketsInCart) {
                                                        setPaymentStep('method');
                                                    } else {
                                                        setPaymentStep(isGroupActive ? 'table' : 'method');
                                                    }
                                                }
                                            }}
                                            disabled={isBooking ? (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone || !guestDetails.address || !guestDetails.zip || !guestDetails.city || !guestDetails.idNumber || !guestDetails.dob) : (hasTicketsInCart ? (!guestName || !guestDetails.email) : !guestName)}
                                            className={`w-full py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${(isBooking ? (guestDetails.firstName && guestDetails.lastName && guestDetails.email && guestDetails.phone && guestDetails.address && guestDetails.zip && guestDetails.city && guestDetails.idNumber && guestDetails.dob) : (hasTicketsInCart ? (guestName && guestDetails.email) : guestName)) ? 'bg-brand text-dark-950 shadow-brand/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-main)] text-[var(--text-secondary)]/50'}`}
                                        >
                                            {isBooking ? 'Complete Registration' : isParking ? 'Authorize Pass' : (isStadium || isClub || hasTicketsInCart) ? `Authorize Tickets` : isWashHub ? 'Authorize Service' : 'Continue to Settlement'}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="text-center space-y-2 relative">
                                            <button 
                                                onClick={() => {
                                                    const hasGuestStep = hasTicketsInCart || isBooking;
                                                    setPaymentStep(hasGuestStep ? 'guest' : 'table');
                                                }} 
                                                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                <ArrowLeft size={20} />
                                            </button>
                                            <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Settlement Method</h3>
                                            <p className="text-[10px] text-brand font-black uppercase tracking-[0.3em]">{(isStadium || isClub || hasTicketsInCart) ? `E-Ticket Authorization ${guestName ? `• ${guestName}` : ''}` : isParking ? `Parking Pass Authorization ${guestName ? `• ${guestName}` : ''}` : isWashHub ? `Service Authorization ${guestName ? `• ${guestName}` : ''}` : isBooking ? `New Booking ${guestName ? `• ${guestName}` : ''}` : `${isHotel ? 'Room' : 'Table'} #${selectedTable}${guestName ? ` • ${guestName}` : ''}`} • €{totalCost.toFixed(2)}</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between px-2 mb-4">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Active Channels</h3>
                                            <button 
                                                onClick={() => navigate('/payment/methods', {
                                                    state: {
                                                        paymentFlowContext: {
                                                            existingCart: cart,
                                                            venueName,
                                                            venueOffer,
                                                            isTakeawayMode,
                                                            selectedTable,
                                                            guestName,
                                                            guestDetails,
                                                            attendees,
                                                            showPaymentTerminal: true,
                                                            paymentStep: 'method'
                                                        }
                                                    }
                                                })}
                                                className="text-[8px] font-black text-brand uppercase tracking-widest border-b border-brand/30 pb-0.5"
                                            >
                                                Manage Methods
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {activePaymentMethods.map(method => {
                                                let Icon = method.icon || CreditCard;
                                                let displayLabel = method.label;

                                                // 1. Strip out obfuscation parentheses for saved/dynamic methods
                                                if (displayLabel.includes(' (')) {
                                                    displayLabel = displayLabel.split(' (')[0];
                                                }

                                                // 2. Map sub-options dynamically to parent button for External Card
                                                if (method.id === 'external' && externalMethod) {
                                                    if (externalMethod === 'mastercard') { displayLabel = 'Credit Card'; Icon = CreditCard; }
                                                    else if (externalMethod === 'paypal') { displayLabel = 'PayPal'; Icon = Wallet; }
                                                    else if (externalMethod === 'klarna') { displayLabel = 'Klarna'; Icon = Sparkles; }
                                                    else if (externalMethod === 'revolut') { displayLabel = 'Revolut'; Icon = Zap; }
                                                }

                                                const isSelected = paymentMethod !== null && paymentMethod !== undefined && String(paymentMethod) === String(method.id);
                                                
                                                return (
                                                    <div key={method.id} className="space-y-2">
                                                        <button 
                                                            onClick={() => {
                                                                setPaymentMethod(method.id);
                                                                if (method.id !== 'external') setExternalMethod(null);
                                                                try {
                                                                    localStorage.setItem('green_active_payment_id', String(method.id));
                                                                } catch (e) {
                                                                    console.error('Failed to sync active method selection to storage:', e);
                                                                }
                                                            }}
                                                            className={`w-full p-5 rounded-3xl border flex items-center justify-between group transition-all ${isSelected ? 'bg-brand border-brand text-dark-950' : 'bg-[var(--bg-secondary)] border-[var(--border-main)] text-[var(--text-primary)] hover:border-brand/30'}`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-black/10' : 'bg-black/10'}`}>
                                                                    <Icon size={20} />
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{displayLabel}</span>
                                                            </div>
                                                            {isSelected && <Check size={18} />}
                                                        </button>

                                                        {/* Sub-options for External Card in Hotels */}
                                                        {isHotel && method.id === 'external' && isSelected && (
                                                            <div className="space-y-4 pt-2">
                                                                <motion.div 
                                                                    initial={{ opacity: 0, y: -10 }} 
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="grid grid-cols-2 gap-2 pl-4 pr-2"
                                                                >
                                                                    {[
                                                                        { id: 'mastercard', label: 'Credit Card', icon: CreditCard },
                                                                        { id: 'paypal', label: 'PayPal', icon: Wallet },
                                                                        { id: 'klarna', label: 'Klarna', icon: Sparkles },
                                                                        { id: 'revolut', label: 'Revolut', icon: Zap }
                                                                    ].map(sub => (
                                                                        <button 
                                                                            key={sub.id}
                                                                            onClick={() => setExternalMethod(sub.id)}
                                                                            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${externalMethod === sub.id ? 'bg-brand/20 border-brand text-dark-950' : 'bg-white/5 border-black/5 text-gray-500 hover:border-black/20'}`}
                                                                        >
                                                                            <sub.icon size={14} />
                                                                            <span className="text-[8px] font-black uppercase tracking-widest">{sub.label}</span>
                                                                        </button>
                                                                    ))}
                                                                </motion.div>

                                                                {/* Mock Card Entry Form */}
                                                                {externalMethod === 'mastercard' && (
                                                                    <motion.div 
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        className="pl-4 pr-2 space-y-3"
                                                                    >
                                                                        <div className="relative">
                                                                            <input 
                                                                                type="text" placeholder="Card Number (0000 0000 0000 0000)"
                                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]"
                                                                                value={guestDetails.cardNumber}
                                                                                onChange={(e) => setGuestDetails({...guestDetails, cardNumber: e.target.value})}
                                                                            />
                                                                            <CreditCard size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <input 
                                                                                type="text" placeholder="MM/YY"
                                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]"
                                                                                value={guestDetails.cardExpiry}
                                                                                onChange={(e) => setGuestDetails({...guestDetails, cardExpiry: e.target.value})}
                                                                            />
                                                                            <input 
                                                                                type="text" placeholder="CVV"
                                                                                className="w-full py-4 px-6 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]"
                                                                                value={guestDetails.cardCvv}
                                                                                onChange={(e) => setGuestDetails({...guestDetails, cardCvv: e.target.value})}
                                                                            />
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button 
                                            onClick={confirmPayment}
                                            disabled={!paymentMethod || (paymentMethod === 'external' && !externalMethod) || (externalMethod === 'mastercard' && !guestDetails.cardNumber) || isProcessing}
                                            className="w-full py-6 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--border-main)] rounded-[2.5rem] flex items-center justify-center gap-4 group transition-all shadow-2xl disabled:opacity-30 relative overflow-hidden"
                                        >
                                            {isProcessing ? (
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-[var(--bg-primary)] rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <ShieldCheck size={20} className="text-brand" />
                                                    <span className="text-xs font-black uppercase tracking-[0.2em] italic text-[var(--bg-primary)]">
                                                        {isHotel && paymentMethod === 'room_charge' ? 'AUTHORIZE ROOM CHARGE' : 'CONFIRM & SEND ORDER'}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TICKET HUB SHEET */}
            <AnimatePresence>
                {showTicketHub && (
                    <div className="fixed inset-0 z-[120] flex items-end justify-center">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setShowTicketHub(false)} 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-[var(--bg-primary)] border-t border-white/10 rounded-t-[3.5rem] p-8 pb-12 space-y-8 shadow-2xl relative z-10 w-full max-w-lg overflow-y-auto max-h-[80vh] no-scrollbar">
                             <div className="w-12 h-1 bg-white/10 rounded-full mx-auto" />
                             <div className="text-center pt-2 relative">
                                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand text-black rounded-full text-[7px] font-black uppercase tracking-[0.3em] shadow-lg whitespace-nowrap">Operational Ticket Hub 🛰️</div>
                                 <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter mt-4">Active Missions</h3>
                             </div>

                            <div className="space-y-4">
                                {venueTickets.map((ticket) => {
                                    const isHotelTicket = ticket.venueName.toLowerCase().includes('hotel') || ticket.venueName.toLowerCase().includes('luxe');
                                    const isStadiumTicket = ticket.venueName.toLowerCase().includes('stadium') || ticket.venueName.toLowerCase().includes('arena');
                                    const isParkingTicket = ticket.venueName.toLowerCase().includes('park') || ticket.venueName.toLowerCase().includes('garage');
                                    const isWashTicket = ticket.venueName.toLowerCase().includes('wash');
                                    const isClubTicket = ticket.venueName.toLowerCase().includes('club') || ticket.venueName.toLowerCase().includes('disco') || ticket.venueName.toLowerCase().includes('lounge') || ticket.venueName.toLowerCase().includes('night') || ticket.venueName.toLowerCase().includes('bar') || ticket.venueName.toLowerCase().includes('festival') || ticket.venueName.toLowerCase().includes('event');
                                    
                                    let locationLabel = 'Table';
                                    let displayTitle = 'Digital Order';
                                    
                                    if (isHotelTicket) {
                                        locationLabel = 'Room';
                                        displayTitle = 'Room Service';
                                    } else if (isStadiumTicket || isClubTicket) {
                                        locationLabel = 'Ticket';
                                        displayTitle = 'Digital Ticket';
                                    } else if (isParkingTicket) {
                                        locationLabel = 'Pass';
                                        displayTitle = 'Digital Pass';
                                    } else if (isWashTicket) {
                                        locationLabel = 'Ticket';
                                        displayTitle = 'Digital Service';
                                    }

                                    // Dynamic Status Mapping from B2B Manager Dashboard
                                    let currentStatus = ticket.orderStatus || 'PENDING';
                                    try {
                                        const savedOrders = JSON.parse(localStorage.getItem('green_active_orders') || '[]');
                                        const matchedOrder = savedOrders.find(o => String(o.id) === String(ticket.id));
                                        if (matchedOrder) {
                                            const b2bStatus = matchedOrder.status;
                                            if (ticket.type === 'booking') {
                                                if (b2bStatus === 'Received' || b2bStatus === 'Booked') {
                                                    currentStatus = 'PENDING';
                                                } else if (b2bStatus === 'Check-In' || b2bStatus === 'Staying') {
                                                    currentStatus = 'CHECKED IN';
                                                } else if (b2bStatus === 'Departed') {
                                                    currentStatus = 'CHECKED OUT';
                                                } else {
                                                    currentStatus = b2bStatus.toUpperCase();
                                                }
                                            } else {
                                                if (b2bStatus === 'Received' || b2bStatus === 'Preparing') {
                                                    currentStatus = 'PENDING';
                                                } else if (b2bStatus === 'Ready') {
                                                    currentStatus = 'READY';
                                                } else if (b2bStatus === 'Served' || b2bStatus === 'Paid' || b2bStatus === 'Departed') {
                                                    currentStatus = 'SERVED';
                                                } else {
                                                    currentStatus = b2bStatus.toUpperCase();
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        console.error('Failed to resolve dynamic ticket status:', e);
                                    }
                                    
                                    return (
                                        <div 
                                            key={ticket.id}
                                            className="bg-[var(--bg-secondary)] border border-white/5 p-5 rounded-[2.5rem] flex items-center justify-between group hover:border-brand/30 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                                                    {ticket.type === 'parking' ? <QrCode size={24} /> : (ticket.type === 'stadium_ticket' || ticket.type === 'booking') ? <Ticket size={24} /> : ticket.type === 'service' ? <Sparkles size={24} /> : <ShoppingBag size={24} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-black italic uppercase text-[var(--text-primary)] leading-none">{displayTitle}</h4>
                                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${ticket.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                            {ticket.paymentStatus}
                                                        </span>
                                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500`}>
                                                            ORDER: {currentStatus}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                                        {ticket.venueName} • {locationLabel} #{ticket.tableId} • {ticket.timestamp}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigate('/order/tracker', { 
                                                        state: { 
                                                            cart: ticket.items, 
                                                            venueName: ticket.venueName, 
                                                            tableId: ticket.tableId, 
                                                            orderId: ticket.id, 
                                                            paymentMethod: ticket.paymentMethod, 
                                                            paymentStatus: ticket.paymentStatus, 
                                                            orderStatus: ticket.orderStatus,
                                                            guestName: ticket.guestName,
                                                            guestEmail: ticket.guestDetails?.email,
                                                            guestPhone: ticket.guestDetails?.phone
                                                        } 
                                                    });
                                                    setShowTicketHub(false);
                                                }}
                                                className="px-5 py-2.5 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                            >
                                                Open
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {venueTickets.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-600 italic">No Active Tickets Detected</p>
                                </div>
                            )}

                            <button 
                                onClick={() => setShowTicketHub(false)}
                                className="w-full py-5 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                            >
                                Dismiss Hub
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* TABLE PICKER SHEET */}
            <AnimatePresence>
                {showTablePicker && (
                    <div className="fixed inset-0 z-[130] flex items-end justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTablePicker(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-[var(--bg-primary)] border-t border-white/10 rounded-t-[3.5rem] p-8 pb-12 space-y-8 shadow-2xl relative z-10 w-full max-w-lg">
                             <div className="w-12 h-1 bg-white/10 rounded-full mx-auto" />
                             <div className="text-center pt-2 relative">
                                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand text-black rounded-full text-[7px] font-black uppercase tracking-[0.3em] shadow-lg whitespace-nowrap">Select Your {isHotel ? 'Room' : 'Table'} Number 📍</div>
                                 <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter mt-4">Identify Your Location</h3>
                             </div>
                            <div className="grid grid-cols-4 gap-4 py-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                    <button 
                                        key={num} 
                                        onClick={() => { setSelectedTable(num); setShowTablePicker(false); }}
                                        className={`h-16 rounded-2xl border text-lg font-black transition-all ${selectedTable === num ? 'bg-brand border-brand text-[var(--bg-primary)] shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-white/5 border-white/10 text-gray-500 hover:border-brand/30'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            {/* Manual Entry for Room/Table */}
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    placeholder={`Enter ${isHotel ? 'Room' : 'Table'} Number Manually...`}
                                    className="w-full py-5 px-8 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-xs font-black uppercase tracking-widest text-[var(--text-primary)] placeholder:text-gray-400 focus:border-brand/50 outline-none transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setSelectedTable(e.target.value);
                                            setShowTablePicker(false);
                                        }
                                    }}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-gray-600 tracking-widest">Press Enter</div>
                            </div>
                            <button onClick={() => { setSelectedTable(isHotel ? 'Front Desk' : 'Bar'); setShowTablePicker(false); }} className="w-full py-5 bg-[var(--bg-secondary)] border border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                {isHotel ? 'Contacting Front Desk' : 'Ordering at the Bar'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VenueMenuPage;
