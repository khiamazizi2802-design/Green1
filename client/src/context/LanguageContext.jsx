import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    en: {
        explore: "Explore",
        categories: "Categories",
        ride: "Ride",
        food: "Food",
        hotels: "Hotels",
        partners: "Partners",
        clubs: "Clubs",
        events: "Events",
        innerCircle: "Inner Circle",
        lifestyleHub: "Lifestyle Hub",
        fairSplit: "Fair-Split Pro",
        execute: "Execute Split",
        totalBill: "Total Bill",
        stealth: "Stealth",
        live: "Live",
        manageCircle: "Manage Circle",
        viewReceipt: "View Social Receipt",
        discover: "Discover",
        search: "Search matrix...",
        welcome: "Welcome back",
        initiate: "GreenRide",
        "Dashboard": "Dashboard",
        "Room Service": "Room Service",
        "Bottle Service": "Bottle Service",
        "Ticket Orders": "Ticket Orders",
        "Live Orders": "Live Orders",
        "Ticket Hub": "Ticket Hub",
        "Room Hub": "Room Hub",
        "Team Hub": "Team Hub",
        "Nightly Audit": "Nightly Audit",
        "Cover Revenue": "Cover Revenue",
        "Financials": "Financials",
        "Compliance": "Compliance",
        "Marketing Hub": "Marketing Hub",
        "Reputation Hub": "Reputation Hub",
        "AI Strategic Hub": "AI Strategic Hub",
        "Fleet Control Hub": "Fleet Control Hub",
        "Sitting": "Sitting",
        "Menu Catalog": "Menu Catalog"
    },
    de: { // High-quality German
        explore: "Erkunden",
        categories: "Kategorien",
        ride: "Fahrt",
        food: "Essen",
        hotels: "Hotels",
        partners: "Partner",
        clubs: "Clubs",
        events: "Events",
        innerCircle: "Freundeskreis",
        lifestyleHub: "Lifestyle Hub",
        fairSplit: "Fair-Split Pro",
        execute: "Split ausführen",
        totalBill: "Gesamtbetrag",
        stealth: "Privat",
        live: "Live",
        manageCircle: "Kreis verwalten",
        viewReceipt: "Beleg anzeigen",
        discover: "Entdecken",
        search: "Netzwerk durchsuchen...",
        welcome: "Willkommen zurück",
        initiate: "GreenRide",
        "Dashboard": "Übersicht",
        "Room Service": "Zimmerservice",
        "Bottle Service": "Flaschenservice",
        "Ticket Orders": "Ticket-Bestellungen",
        "Live Orders": "Live-Bestellungen",
        "Ticket Hub": "Ticket-Zentrum",
        "Room Hub": "Zimmer-Zentrum",
        "Team Hub": "Team-Zentrum",
        "Nightly Audit": "Nachtprüfung",
        "Cover Revenue": "Eintrittsumsatz",
        "Financials": "Finanzen",
        "Compliance": "Compliance",
        "Marketing Hub": "Marketing-Zentrum",
        "Reputation Hub": "Reputation-Zentrum",
        "AI Strategic Hub": "KI-Strategie",
        "Fleet Control Hub": "Flottenzentrum",
        "Sitting": "Sitzordnung",
        "Menu Catalog": "Menükatalog"
    },
    fa: { // Farsi / Dari
        explore: "جستجو",
        categories: "دسته‌بندی‌ها",
        ride: "سفر",
        food: "غذا",
        hotels: "هتل‌ها",
        partners: "شرکا",
        clubs: "کلوب‌ها",
        events: "رویدادها",
        innerCircle: "حلقه دوستان",
        lifestyleHub: "مرکز لایف‌استایل",
        fairSplit: "تقسیم عادلانه",
        execute: "اجرای تقسیم",
        totalBill: "کل صورتحساب",
        stealth: "مخفی",
        live: "زنده",
        manageCircle: "مدیریت حلقه",
        viewReceipt: "مشاهده رسید",
        discover: "کشف کردن",
        search: "جستجو در شبکه...",
        welcome: "خوش آمدید",
        initiate: "سفر سبز"
    },
    fr: {
        explore: "Explorer",
        categories: "Catégories",
        ride: "Course",
        food: "Nourriture",
        hotels: "Hôtels",
        partners: "Partenaires",
        clubs: "Clubs",
        events: "Événements",
        innerCircle: "Cercle Intime",
        lifestyleHub: "Lifestyle Hub",
        fairSplit: "Fair-Split Pro",
        execute: "Exécuter le Partage",
        totalBill: "Facture Totale",
        stealth: "Discret",
        live: "En Direct",
        manageCircle: "Gérer le Cercle",
        viewReceipt: "Voir le Reçu",
        discover: "Découvrir",
        search: "Chercher...",
        welcome: "Bon retour",
        initiate: "GreenRide"
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('en');
    const [dir, setDir] = useState('ltr');

    useEffect(() => {
        if (lang === 'fa') {
            setDir('rtl');
            document.documentElement.dir = 'rtl';
        } else {
            setDir('ltr');
            document.documentElement.dir = 'ltr';
        }
    }, [lang]);

    const t = (key) => {
        return translations[lang][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
