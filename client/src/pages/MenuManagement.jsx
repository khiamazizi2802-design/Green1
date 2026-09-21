import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Trash2, ArrowLeft, Loader2, ChevronRight,
    Utensils, PlusCircle, Sparkles, Upload, BedDouble, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const getCategoryOptionsForContext = (ctx) => {
    if (ctx === 'HM') {
        return [
            { value: 'Doppelzimmer', label: 'Doppelzimmer / Comfort Suite' },
            { value: 'Einzelzimmer', label: 'Einzelzimmer' },
            { value: 'Deluxe Suite', label: 'Deluxe Suite' },
            { value: 'Executive Suite', label: 'Executive Suite' },
            { value: 'Penthouse', label: 'Presidential Penthouse' },
            { value: 'Family Suite', label: 'Familien Suite' },
            { value: 'Standard Room', label: 'Standard / Comfort Zimmer' },
            { value: 'Spa Suite', label: 'Spa & Wellness Suite' },
            { value: 'Shuttle Package', label: 'Zimmer + VIP Shuttle Package' }
        ];
    }
    if (ctx === 'SM') {
        return [
            { value: 'VIP Box', label: 'VIP Box / Loge' },
            { value: 'Main Stand', label: 'Pitch-Side / Main Stand' },
            { value: 'Executive Lounge', label: 'Executive Lounge Pass' },
            { value: 'Standard Pass', label: 'Standard E-Ticket' },
            { value: 'Valet Package', label: 'Valet Parking + Ticket Package' }
        ];
    }
    if (ctx === 'VM') {
        return [
            { value: 'Tickets', label: 'Entry Tickets / Passes' },
            { value: 'VIP', label: 'VIP Table / Premium Booking' },
            { value: 'Drinks', label: 'Drinks & Wine' },
            { value: 'Food', label: 'Food / Catering' },
            { value: 'Coffee', label: 'Coffee & Snacks' },
            { value: 'Dessert', label: 'Dessert & Sweets' }
        ];
    }
    if (ctx === 'WM') {
        return [
            { value: 'Detailing', label: 'Wash & Detailing' },
            { value: 'Service', label: 'Interior Service' },
            { value: 'Addon', label: 'Addon & Extras' },
            { value: 'Drinks', label: 'Lobby Drinks & Soda' },
            { value: 'Coffee', label: 'Lobby Coffee & Snacks' }
        ];
    }
    if (ctx === 'PM') {
        return [
            { value: 'Standard', label: 'Standard Parking Bay' },
            { value: 'Utility', label: 'EV Charger Bay' },
            { value: 'Drinks', label: 'Vending Drinks' },
            { value: 'Coffee', label: 'Vending Coffee' }
        ];
    }
    if (ctx === 'BM') {
        return [
            { value: 'Food', label: 'Food / Dining' },
            { value: 'Drinks', label: 'Drinks & Beverages' },
            { value: 'Shisha', label: 'Shisha / Hookah' },
            { value: 'Coffee', label: 'Coffee & Hot Drinks' },
            { value: 'Breakfast', label: 'Breakfast / Frühstück' },
            { value: 'Dessert', label: 'Dessert & Sweets' }
        ];
    }
    if (ctx === 'CM') {
        return [
            { value: 'Tickets', label: 'Entry Tickets / Passes' },
            { value: 'VIP', label: 'VIP Table / Premium Booking' },
            { value: 'Drinks', label: 'Drinks & Beverages' },
            { value: 'Food', label: 'Food / Dining' },
            { value: 'Shisha', label: 'Shisha / Hookah' }
        ];
    }
    // Default RM (Restaurant)
    return [
        { value: 'Food', label: 'Food / Dining' },
        { value: 'Drinks', label: 'Drinks & Beverages' },
        { value: 'Coffee', label: 'Coffee & Hot Drinks' },
        { value: 'Breakfast', label: 'Breakfast / Frühstück' },
        { value: 'Dessert', label: 'Dessert & Sweets' }
    ];
};

const getAIAssignedImage = (name, category, bizType) => {
    const lowercaseName = (name || '').toLowerCase();
    const lowercaseCat = (category || '').toLowerCase();
    
    if (bizType === 'WM') {
        if (lowercaseName.includes('wash') || lowercaseName.includes('clean')) {
            return 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&auto=format&fit=crop&q=60';
        }
        return 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&auto=format&fit=crop&q=60';
    }
    
    if (bizType === 'PM') {
        if (lowercaseName.includes('charge') || lowercaseName.includes('ev')) {
            return 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60';
        }
        return 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=500&auto=format&fit=crop&q=60';
    }
    
    if (bizType === 'HM') {
        if (lowercaseName.includes('spa') || lowercaseName.includes('massage') || lowercaseName.includes('well')) {
            return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60';
        }
        if (lowercaseName.includes('valet') || lowercaseName.includes('car') || lowercaseName.includes('luggage')) {
            return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60';
        }
        if (lowercaseName.includes('shuttle') || lowercaseName.includes('transport') || lowercaseName.includes('airport')) {
            return 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop&q=60';
        }
        return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60';
    }

    if (bizType === 'SM') {
        if (lowercaseName.includes('plat') || lowercaseName.includes('food') || lowercaseName.includes('cater')) {
            return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60';
        }
        if (lowercaseName.includes('park') || lowercaseName.includes('gold')) {
            return 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=500&auto=format&fit=crop&q=60';
        }
        return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60';
    }

    if (bizType === 'VM') {
        if (lowercaseName.includes('ticket') || lowercaseName.includes('pass') || lowercaseName.includes('entry')) {
            return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60';
        }
        if (lowercaseName.includes('vip') || lowercaseName.includes('table') || lowercaseName.includes('premium')) {
            return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60';
        }
        return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60';
    }

    // Default RM / BM / CM
    if (lowercaseName.includes('shisha') || lowercaseName.includes('hookah') || lowercaseCat.includes('shisha')) {
        return 'https://images.unsplash.com/photo-1542841791-1925b02a2bcb?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('burger') || lowercaseName.includes('beef') || lowercaseName.includes('meat') || lowercaseName.includes('cheeseburger')) {
        return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('fries') || lowercaseName.includes('potato') || lowercaseName.includes('chips')) {
        return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('salad') || lowercaseName.includes('green') || lowercaseName.includes('vegetable')) {
        return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('mojito') || lowercaseName.includes('drink') || lowercaseName.includes('cocktail') || lowercaseName.includes('spritz') || lowercaseName.includes('wine') || lowercaseName.includes('beer') || lowercaseCat.includes('drink') || lowercaseCat.includes('beverage')) {
        return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('sushi') || lowercaseName.includes('fish') || lowercaseName.includes('salmon')) {
        return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('steak') || lowercaseName.includes('ribeye') || lowercaseName.includes('grill')) {
        return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('dessert') || lowercaseName.includes('cake') || lowercaseName.includes('tiramisu') || lowercaseName.includes('sweet') || lowercaseCat.includes('dessert') || lowercaseCat.includes('sweet')) {
        return 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('coffee') || lowercaseName.includes('cappuccino') || lowercaseName.includes('espresso') || lowercaseName.includes('latte') || lowercaseName.includes('tea') || lowercaseCat.includes('coffee') || lowercaseCat.includes('hot drink')) {
        return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('breakfast') || lowercaseName.includes('egg') || lowercaseName.includes('frühstück') || lowercaseCat.includes('breakfast')) {
        return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60';
    }
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
};

const MenuManagement = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [manualItems, setManualItems] = useState([]);
    const [hotelReservationEmail, setHotelReservationEmail] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    
    const userEmailKey = user?.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
    const [managerContext, setManagerContext] = useState(() => localStorage.getItem(`green_manager_context_${userEmailKey}`) || 'RM');

    const getCategoryOptions = () => getCategoryOptionsForContext(managerContext);

    // Load existing menu from Firestore and localStorage
    useEffect(() => {
        const loadExistingMenu = async () => {
            if (loading || !user) return;
            
            const ctx = localStorage.getItem(`green_manager_context_${userEmailKey}`) || 'RM';
            setManagerContext(ctx);
            
            const categories = getCategoryOptionsForContext(ctx);
            const defaultCat = categories.length > 0 ? categories[0].value : 'Food';

            let loadedItems = [];
            let savedEmail = localStorage.getItem(`green_hotel_reservation_email_${userEmailKey}`) || '';

            // 1. Fetch from Firestore
            try {
                const docRef = doc(db, 'business_menus', user?.email?.toLowerCase() || userEmailKey);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data && Array.isArray(data.items)) {
                        loadedItems = data.items;
                    }
                    if (data?.hotelReservationEmail) {
                        savedEmail = data.hotelReservationEmail;
                    }
                }
            } catch (err) {
                console.warn('Firestore menu read failed:', err.message);
            }

            // 2. Fallback to local backup
            if (loadedItems.length === 0) {
                try {
                    const saved = localStorage.getItem(`green_published_menu_${ctx}_${userEmailKey}`);
                    if (saved) {
                        loadedItems = JSON.parse(saved);
                    }
                } catch (e) {
                    console.error('Failed to parse local menu backup:', e);
                }
            }

            if (!savedEmail && loadedItems.length > 0) {
                savedEmail = loadedItems.find(i => i.reservationEmail)?.reservationEmail || '';
            }
            setHotelReservationEmail(savedEmail);

            // Set state. If empty, push a default row to start editing instantly.
            if (loadedItems.length > 0) {
                const validCatValues = categories.map(c => c.value);
                const sanitizedItems = loadedItems.map(item => ({
                    ...item,
                    category: validCatValues.includes(item.category) ? item.category : defaultCat
                }));
                setManualItems(sanitizedItems);
            } else {
                setManualItems([{
                    id: Date.now(),
                    name: '',
                    price: '',
                    category: defaultCat,
                    description: '',
                    image: ''
                }]);
            }
        };

        loadExistingMenu();
    }, [user, loading, userEmailKey]);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-20">
                <div className="text-xl font-black italic uppercase text-[#00e5ff] animate-pulse">
                    Grid Intelligence Loading...
                </div>
            </div>
        );
    }

    const publishManualMenu = async () => {
        // Filter out empty rows (e.g., no name and no price)
        const validItems = manualItems.filter(item => item.name.trim() !== '' || item.price.trim() !== '');

        if (validItems.length === 0) {
            alert('Please fill out at least one product with a Name and Price.');
            return;
        }

        setIsPublishing(true);
        try {
            const categories = getCategoryOptionsForContext(managerContext);
            const defaultCat = categories.length > 0 ? categories[0].value : 'Standard Room';
            const validCatValues = categories.map(c => c.value);

            const formattedItems = validItems.map((item, idx) => {
                const galleryUrls = item.gallery && item.gallery.length > 0 ? item.gallery : (item.image ? [item.image] : []);
                const finalCategory = validCatValues.includes(item.category) ? item.category : defaultCat;
                return {
                    id: item.id || (Date.now() + idx),
                    name: item.name.trim(),
                    price: item.price.trim(),
                    category: finalCategory,
                    description: (item.description || '').trim(),
                    image: (item.image || galleryUrls[0] || '').trim() || getAIAssignedImage(item.name, finalCategory, managerContext),
                    gallery: galleryUrls,
                    stadiumQrCode: item.stadiumQrCode || '',
                    stadiumTicketLink: item.stadiumTicketLink || '',
                    status: 'verified'
                };
            });

            await setDoc(doc(db, 'business_menus', user?.email?.toLowerCase() || userEmailKey), {
                items: formattedItems,
                hotelReservationEmail: hotelReservationEmail.trim(),
                updatedAt: new Date().toISOString()
            });

            localStorage.setItem(`green_published_menu_${managerContext}_${userEmailKey}`, JSON.stringify(formattedItems));
            localStorage.setItem(`green_hotel_reservation_email_${userEmailKey}`, hotelReservationEmail.trim());
            alert(`Catalog finalized! ${formattedItems.length} items published live to the Green Grid.`);
            navigate(`/manager${window.location.search}`);
        } catch (err) {
            console.error('Failed to publish manual catalog:', err);
            localStorage.setItem(`green_published_menu_${managerContext}_${userEmailKey}`, JSON.stringify(validItems));
            localStorage.setItem(`green_hotel_reservation_email_${userEmailKey}`, hotelReservationEmail.trim());
            alert(`Catalog finalized locally (${validItems.length} items).`);
            navigate(`/manager${window.location.search}`);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleFieldChange = (index, field, value) => {
        const updated = [...manualItems];
        updated[index][field] = value;
        setManualItems(updated);
    };

    const handleRowImageUpload = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 800000) {
            alert('Image file is too large. Please select an image smaller than 800KB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            handleFieldChange(index, 'image', reader.result);
        };
        reader.readAsDataURL(file);
    };

    const addNewRow = () => {
        const categories = getCategoryOptions();
        const defaultCat = categories.length > 0 ? categories[0].value : 'Food';
        setManualItems([...manualItems, {
            id: Date.now() + Math.random(),
            name: '',
            price: '',
            category: defaultCat,
            description: '',
            image: ''
        }]);
    };

    const removeItem = (id) => {
        // Keep at least one row
        if (manualItems.length === 1) {
            const categories = getCategoryOptions();
            const defaultCat = categories.length > 0 ? categories[0].value : 'Food';
            setManualItems([{
                id: Date.now(),
                name: '',
                price: '',
                category: defaultCat,
                description: '',
                image: ''
            }]);
            return;
        }
        setManualItems(manualItems.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-10 pb-20 w-full">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-[#ffffff]">
                        {managerContext === 'HM' ? 'Zimmer Angebote' : managerContext === 'SM' ? 'Ticket Angebote' : 'Angebote'} <span className="text-[#00e5ff]">Hub</span>
                    </h1>
                    <p className="text-[#9ca3af] text-sm font-bold uppercase tracking-widest leading-none">
                        {managerContext === 'HM' ? 'Zimmer, Suiten, Fotos & Preise verwalten' : managerContext === 'SM' ? 'Event-Tickets, Sektoren & Preise verwalten' : 'Produkte & Angebote verwalten'}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                    {/* Bulk Spreadsheet Editor Grid */}
                    <div className="dark-catalog-card bg-[#0a0f1c80] backdrop-blur-xl border border-[#ffffff1a] rounded-[2rem] p-0.5 shadow-2xl relative overflow-hidden">
                        <div className="dark-catalog-card bg-[#0a0f1c] rounded-[1.9rem] p-4 md:p-6 overflow-hidden space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-[#00e5ff1a] border border-[#00e5ff33] rounded-xl flex items-center justify-center text-[#00e5ff] shadow-md">
                                        {managerContext === 'HM' ? <BedDouble size={18} /> : managerContext === 'SM' ? <Ticket size={18} /> : <Utensils size={18} />}
                                    </div>
                                     <h3 className="text-lg font-black italic uppercase text-white tracking-tighter drop-shadow" style={{ color: '#ffffff' }}>
                                        {managerContext === 'HM' ? 'Zimmer & Suiten' : managerContext === 'SM' ? 'Tickets & Sektoren' : 'Angebote'} <span className="text-[#00e5ff]" style={{ color: '#00e5ff' }}>Katalog</span>
                                    </h3>
                                </div>
                                <button 
                                    onClick={addNewRow}
                                    className="px-4 py-2 bg-[#00e5ff1a] border border-[#00e5ff33] hover:border-[#00e5ff80] rounded-xl text-[9px] md:text-[11px] lg:text-xs font-black uppercase text-[#00e5ff] tracking-widest flex items-center gap-2 hover:scale-[1.03] transition-all"
                                >
                                    <Plus size={12} /> {managerContext === 'HM' ? '+ Neues Zimmer' : managerContext === 'SM' ? '+ Neues Ticket' : '+ Neues Angebot'}
                                </button>
                            </div>

                            <div className="overflow-x-auto no-scrollbar rounded-2xl border border-[#ffffff1a]">
                                <table className="w-full text-left border-collapse min-w-[850px]">
                                    <thead>
                                         <tr className="border-b border-[#ffffff1a] bg-[#ffffff14] text-[8px] md:text-[10px] lg:text-xs font-black text-white uppercase tracking-[0.2em]">
                                            <th className="p-3 pl-4 w-[20%] text-white font-black" style={{ color: '#ffffff' }}>{managerContext === 'HM' ? 'Zimmer / Suite Name' : managerContext === 'SM' ? 'Ticket / Sektor Name' : 'Bezeichnung'}</th>
                                            <th className="p-3 w-[15%] text-white font-black" style={{ color: '#ffffff' }}>Kategorie</th>
                                            <th className="p-3 w-[10%] text-center text-white font-black" style={{ color: '#ffffff' }}>{managerContext === 'HM' ? 'Preis / Nacht (€)' : 'Preis (€)'}</th>
                                            {managerContext === 'SM' && <th className="p-3 w-[18%] text-white font-black" style={{ color: '#ffffff' }}>Stadion QR-Code / Link</th>}
                                            <th className="p-3 w-[22%] text-white font-black" style={{ color: '#ffffff' }}>Beschreibung & Ausstattung</th>
                                            <th className="p-3 w-[12%] text-white font-black" style={{ color: '#ffffff' }}>Fotos (Galerie)</th>
                                            <th className="p-3 pr-4 w-[3%] text-right text-white font-black" style={{ color: '#ffffff' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ffffff1a]">
                                        {manualItems.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-white/[0.01] transition-all">
                                                {/* Name */}
                                                <td className="p-2.5 pl-4">
                                                        <input 
                                                            type="text" 
                                                            placeholder={managerContext === 'HM' ? 'z.B. Deluxe Ocean Suite' : managerContext === 'SM' ? 'z.B. VIP Loge Sektor A' : 'Bezeichnung'}
                                                            className="w-full bg-[#ffffff0d] border border-[#ffffff26] rounded-lg p-2 text-[10px] md:text-xs lg:text-sm font-bold text-white focus:border-[#00e5ff] outline-none placeholder-gray-400"
                                                            style={{ color: '#ffffff' }}
                                                            value={item.name}
                                                            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                        />
                                                </td>
                                                {/* Category */}
                                                <td className="p-2.5">
                                                    <select 
                                                        className="w-full bg-[#ffffff0d] border border-[#ffffff1a] rounded-xl p-2.5 text-xs md:text-sm lg:text-base font-black uppercase italic text-[#00e5ff] focus:border-[#00e5ff66] outline-none transition-all appearance-none"
                                                        value={item.category}
                                                        onChange={(e) => handleFieldChange(index, 'category', e.target.value)}
                                                        style={{
                                                            color: '#00e5ff',
                                                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300ff88' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 12px center',
                                                            backgroundSize: '8px',
                                                            paddingRight: '24px'
                                                        }}
                                                    >
                                                        {getCategoryOptions().map(option => (
                                                            <option key={option.value} value={option.value} className="bg-[#0a0f1c] text-white font-bold" style={{ color: '#ffffff', backgroundColor: '#0a0f1c' }}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                {/* Price */}
                                                <td className="p-2.5">
                                                    <input 
                                                        type="text" 
                                                        placeholder="0.00"
                                                        className="w-full bg-[#ffffff0d] border border-[#00e5ff44] rounded-xl p-2.5 text-xs md:text-sm lg:text-base font-black text-white focus:border-[#00e5ff] outline-none transition-all placeholder:text-gray-400 text-center"
                                                        style={{ color: '#ffffff' }}
                                                        value={item.price}
                                                        onChange={(e) => handleFieldChange(index, 'price', e.target.value)}
                                                    />
                                                </td>
                                                {/* Stadion QR-Code / Link Column */}
                                                {managerContext === 'SM' && (
                                                    <td className="p-2.5">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <label className="cursor-pointer px-2 py-1 bg-[#ffffff0d] border border-[#00e5ff4d] hover:bg-[#00e5ff1a] rounded-lg text-[8px] font-black uppercase text-[#00e5ff] tracking-widest flex items-center gap-1 shrink-0">
                                                                    <span>🖼️ QR Upload</span>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        className="hidden" 
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                const reader = new FileReader();
                                                                                reader.onloadend = () => {
                                                                                    handleFieldChange(index, 'stadiumQrCode', reader.result);
                                                                                    alert(`✅ Stadion QR-Code Bild für "${item.name || 'Ticket'}" hochgeladen!`);
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                                 {item.stadiumQrCode && (
                                                                    <span className="text-[7px] text-green-400 font-bold bg-green-500/10 px-1 py-0.5 rounded border border-green-500/20">
                                                                        QR Bild ✓
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <input 
                                                                type="text" 
                                                                placeholder="🔗 Ticket-Link URL..."
                                                                className="w-full bg-[#ffffff0d] border border-[#ffffff26] rounded-lg p-1.5 text-[8px] font-bold text-white focus:border-[#00e5ff] outline-none placeholder-gray-500"
                                                                style={{ color: '#ffffff' }}
                                                                value={item.stadiumTicketLink || ''}
                                                                onChange={(e) => handleFieldChange(index, 'stadiumTicketLink', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>
                                                )}
                                                {/* Description */}
                                                <td className="p-2.5">
                                                        <input 
                                                            type="text" 
                                                            placeholder={managerContext === 'HM' ? 'z.B. King Bed, Balkon, Spa Zugang' : 'z.B. Fast-Lane Einlass, Catering'}
                                                            className="w-full bg-[#ffffff0d] border border-[#ffffff26] rounded-lg p-2 text-[9px] md:text-[11px] lg:text-xs font-bold text-white focus:border-[#00e5ff] outline-none placeholder-gray-400"
                                                            style={{ color: '#ffffff' }}
                                                            value={item.description || ''}
                                                            onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                                                        />
                                                </td>
                                                {/* Visual Asset Upload/URL Gallery */}
                                                <td className="p-2.5">
                                                    <div className="flex items-center gap-2 flex-wrap max-w-xs">
                                                        {/* Thumbnail gallery list */}
                                                        {(item.gallery && item.gallery.length > 0 ? item.gallery : (item.image ? [item.image] : [])).map((imgUrl, imgIdx) => (
                                                            <div key={imgIdx} className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#ffffff1a] shrink-0 group/rowthumb shadow-md">
                                                                <img src={imgUrl} alt="Thumb" className="w-full h-full object-cover" />
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const currentGallery = item.gallery && item.gallery.length > 0 ? item.gallery : (item.image ? [item.image] : []);
                                                                        const updatedGallery = currentGallery.filter((_, idx) => idx !== imgIdx);
                                                                        handleFieldChange(index, 'gallery', updatedGallery);
                                                                        handleFieldChange(index, 'image', updatedGallery[0] || '');
                                                                    }}
                                                                    className="absolute inset-0 bg-black/80 opacity-0 group-hover/rowthumb:opacity-100 flex items-center justify-center text-red-500 text-[8px] font-black uppercase transition-opacity"
                                                                >
                                                                    X
                                                                </button>
                                                            </div>
                                                        ))}

                                                        {/* Add More Photos Upload Trigger */}
                                                        <label htmlFor={`file-upload-multi-${item.id}`} className="cursor-pointer px-2.5 py-1.5 bg-[#ffffff0d] border border-[#00e5ff4d] rounded-lg hover:bg-[#00e5ff1a] hover:text-[#00e5ff] transition-all flex items-center gap-1 shrink-0">
                                                            <Upload size={11} className="text-[#00e5ff]" />
                                                            <span className="text-[8px] font-black uppercase text-[#00e5ff] tracking-widest">+ Upload</span>
                                                        </label>
                                                        <input 
                                                            id={`file-upload-multi-${item.id}`}
                                                            type="file" 
                                                            accept="image/*" 
                                                            multiple
                                                            className="hidden" 
                                                            onChange={(e) => {
                                                                const files = Array.from(e.target.files);
                                                                if (!files.length) return;
                                                                files.forEach(file => {
                                                                    if (file.size > 800000) return alert('File size must be < 800KB');
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        const currentGallery = item.gallery && item.gallery.length > 0 ? item.gallery : (item.image ? [item.image] : []);
                                                                        const updatedGallery = [...currentGallery, reader.result];
                                                                        handleFieldChange(index, 'gallery', updatedGallery);
                                                                        if (!item.image) handleFieldChange(index, 'image', reader.result);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                });
                                                            }} 
                                                        />
                                                    </div>
                                                </td>
                                                {/* Delete button */}
                                                <td className="p-2.5 pr-4 text-right">
                                                    <button 
                                                        onClick={() => removeItem(item.id)} 
                                                        className="w-8 h-8 bg-[#ffffff0d] border border-[#ffffff1a] rounded-lg text-[#9ca3af] hover:text-red-500 hover:border-red-500/40 transition-all flex items-center justify-center inline-flex"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Hotel Reception Email Input Box */}
                            {managerContext === 'HM' && (
                                <div className="mt-4 p-4 md:p-5 bg-[#ffffff05] border border-[#00e5ff33] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[#00e5ff] font-black text-xs md:text-sm uppercase tracking-wider">
                                            <span className="text-base">📧</span>
                                            <span>Hotel Rezeption E-Mail (Automatischer Reservierungsversand)</span>
                                        </div>
                                        <p className="text-[10px] md:text-xs text-[#9ca3af]">
                                            Unser System sendet jede Kunden-Zimmerbuchung automatisch an diese zentral hinterlegte E-Mail-Adresse.
                                        </p>
                                    </div>
                                    <div className="w-full md:w-80">
                                        <input 
                                            type="email"
                                            placeholder="z.B. rezeption@hotel.de"
                                            className="w-full bg-[#ffffff0d] border border-[#00e5ff66] rounded-xl p-3 text-xs md:text-sm font-bold text-white focus:border-[#00e5ff] outline-none transition-all placeholder:text-gray-500 shadow-inner"
                                            style={{ color: '#ffffff' }}
                                            value={hotelReservationEmail}
                                            onChange={(e) => setHotelReservationEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Finalize Button */}
                    <div className="pb-16 pt-2">
                        <button 
                            onClick={publishManualMenu}
                            disabled={isPublishing}
                            className="w-full py-5 bg-[#000000] text-[#ffffff] border border-[#00e5ff] rounded-[1.5rem] text-xs md:text-sm lg:text-base font-black uppercase tracking-[0.3em] shadow-lg hover:bg-[#00e5ff1a] hover:text-[#00e5ff] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isPublishing ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} /> Speichere Angebote...
                                </>
                            ) : (
                                <>
                                    {managerContext === 'HM' ? `ZIMMER-ANGEBOTE SPEICHERN & LIVE SCHALTEN (${manualItems.length})` : managerContext === 'SM' ? `TICKET-ANGEBOTE SPEICHERN & LIVE SCHALTEN (${manualItems.length})` : `ANGEBOTE SPEICHERN & LIVE SCHALTEN (${manualItems.length})`} <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
            </div>
        </div>
    );
};

export default MenuManagement;
