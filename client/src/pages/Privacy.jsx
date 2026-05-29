import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, EyeOff, Globe, Bell, Smartphone, MapPin, Database, UserCheck, CreditCard, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Privacy = () => {
    const navigate = useNavigate();
    const [showFullPolicy, setShowFullPolicy] = useState(false);

    const sections = [
        {
            icon: ShieldCheck,
            title: "1. Data Controller & Youth Protection",
            content: "Green Nightlife & Logistics GmbH is the primary data controller under GDPR. To ensure child safety, registration is strictly prohibited for children under 16 years of age. Minors aged 16-17 can only register and use the app if they receive a verified parental invitation from an active adult account."
        },
        {
            icon: MapPin,
            title: "2. Tactical Telemetry & Local Offers",
            content: "We process high-precision GPS telemetry to facilitate ride-hailing (contractual fulfillment, Art. 6.1.b). Additionally, with your voluntary consent (Art. 6.1.a), we use location data to push exclusive local discounts, VIP vouchers, and promotions near you. You can toggle this off in settings at any time."
        },
        {
            icon: UserCheck,
            title: "3. Social Media Wall & 15s Clips",
            content: "Our app includes an integrated Social Media Wall where customers and partners can voluntarily upload photos and short videos (up to 15 seconds) to share nightlife experiences. Uploads are based on voluntary consent (Art. 6.1.a), stored on secure servers, and can be permanently deleted by you at any time."
        },
        {
            icon: CreditCard,
            title: "4. Financial & Partner Verification",
            content: "All payments are routed through secure, PCI-compliant Stripe/PayPal gateways. For B2B partners, we verify business registrations, commercial addresses, tax credentials, driving licenses, and Personenbeförderungsscheins (P-Scheins) under strict legal obligations (Art. 6.1.c) to ensure compliance."
        },
        {
            icon: Globe,
            title: "5. Feedback, Support & Anonymous Intel",
            content: "Complaints and support tickets are processed to resolve service disputes. Feedback is used for app optimization. Before sharing any insights with our 3 selected market research partners, we strip all PII (names, emails, GPS) to render the data fully and irreversibly anonymous (exempt from GDPR)."
        },
        {
            icon: Smartphone,
            title: "6. Shift-Based Session Expiration",
            content: "While passengers remain logged in persistently, Manager, Staff, and Driver sessions are configured with a secure daily expiration limit. All active staff/fleet sessions automatically expire and force a secure logout daily at exactly 5:00 AM, coinciding with the end of the nightly operational shift."
        },
        {
            icon: Bell,
            title: "7. Strategic Enforcement: Red Flag Protocol",
            content: "To protect community integrity, we enforce a strict behavioral 'Red Flag' system. Accumulating 3 Red Flags within 2 months triggers an automatic 1-year suspension. A repeat violation after suspension results in a permanent and irreversible ecosystem-wide ban."
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8 overflow-y-auto font-sans selection:bg-brand/30">
            <header className="fixed top-8 left-8 z-[100]">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-4 bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-white/10 rounded-2xl text-brand hover:text-white hover:border-brand/40 transition-all shadow-2xl active:scale-90"
                >
                    <ArrowLeft size={24} />
                </button>
            </header>

            <div className="max-w-5xl mx-auto pt-24 relative z-10">
                <div className="flex justify-end mb-8">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-brand uppercase tracking-[0.4em] italic mb-1">Neural Privacy Protocol</p>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Version 2.4.0 • Updated May 2026</p>
                    </div>
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20 text-center space-y-4"
                >
                    <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                        Privacy <span className="text-brand">Manifesto</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.5em] text-xs">Protecting the Pulse of Nightlife & Mobility</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {sections.map((section, i) => (
                        <motion.section 
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[var(--bg-secondary)]/40 border border-white/5 p-10 rounded-[3rem] space-y-6 hover:border-brand/20 transition-all group backdrop-blur-3xl shadow-2xl"
                        >
                            <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-brand border border-brand/20 shadow-lg group-hover:scale-110 transition-transform">
                                <section.icon size={28} />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-black italic text-white uppercase tracking-tight group-hover:text-brand transition-colors">{section.title}</h2>
                                <p className="text-gray-400 text-sm font-medium leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                                    {section.content}
                                </p>
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* Read Full Legal Policy Button */}
                <div className="flex justify-center mb-16">
                    <button 
                        onClick={() => setShowFullPolicy(true)}
                        className="px-10 py-5 bg-brand text-dark-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand/10 flex items-center gap-2"
                    >
                        <ShieldCheck size={16} />
                        Read Full Legal Datenschutzerklärung (DSGVO)
                    </button>
                </div>

                <footer className="text-center py-20 border-t border-white/5 space-y-8">
                    <div className="flex justify-center gap-10">
                        <div className="flex flex-col items-center gap-2">
                            <Lock className="text-brand" size={32} />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">256-bit AES</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Database className="text-brand" size={32} />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">GDPR Compliant</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Globe className="text-brand" size={32} />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Global Hubs</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                        &copy; 2026 GREEN OPERATIONS GMBH • ALL RIGHTS RESERVED
                    </p>
                </footer>
            </div>

            <AnimatePresence>
                {showFullPolicy && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-dark-950/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 30 }}
                            className="bg-dark-900 border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
                        >
                            {/* Close button */}
                            <button 
                                onClick={() => setShowFullPolicy(false)}
                                className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-secondary hover:text-white transition-all z-10"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="p-8 border-b border-white/5">
                                <h2 className="text-3xl font-black italic uppercase text-brand tracking-tighter">Datenschutzerklärung (DSGVO)</h2>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Vollständige juristische Fassung • Version 2.5.0 (Mai 2026)</p>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-8 overflow-y-auto space-y-6 text-gray-300 text-sm leading-relaxed font-medium max-h-[60vh] pr-4">
                                <p className="text-gray-400 italic">Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Nachfolgend informieren wir Sie detailliert und gesetzeskonform über den Umgang mit Ihren Daten im Rahmen des Green-Ecosystems gemäß den Anforderungen der EU-Datenschutz-Grundverordnung (DSGVO) und des TDDDG.</p>
                                
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">1. Name und Anschrift des Verantwortlichen (Art. 13 Abs. 1 lit. a DSGVO)</h3>
                                    <p>Verantwortlich für die Datenverarbeitung im Green-Ecosystem ist:<br/>
                                    <strong>Green Nightlife & Logistics GmbH</strong><br/>
                                    Zeil 106, 60313 Frankfurt am Main, Deutschland<br/>
                                    E-Mail: ops@green-nightlife.com • Telefon: +49 69 1234567<br/>
                                    Geschäftsführung: Khiam Green</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">1.1 Kontaktdaten des Datenschutzbeauftragten (Art. 13 Abs. 1 lit. b DSGVO)</h3>
                                    <p>Wir haben einen externen Datenschutzbeauftragten bestellt. Sie erreichen diesen unter:<br/>
                                    <strong>PROLIANCE IT GmbH</strong><br/>
                                    Leopoldstraße 244, 80807 München, Deutschland<br/>
                                    E-Mail: dsb@green-nightlife.com • Website: www.datenschutzexperte.de</p>
                                </div>

                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-red-400">🛑 Wichtiges Mindestalter & Elternschutz-Regeln (Art. 8 DSGVO)</h4>
                                    <p className="text-xs text-gray-300 leading-normal"><strong>Unter 16 Jahren:</strong> Die Registrierung und Nutzung unserer App ist für Kinder unter 16 Jahren aus Gründen des Jugendschutzes und der gesetzlichen Vorgaben strengstens untersagt.<br/>
                                    <strong>Jugendliche (16 und 17 Jahre):</strong> Wenn du 16 oder 17 Jahre alt bist (also noch nicht volljährig), darfst du dich nur dann registrieren, wenn du eine offizielle Einladung von deinen Eltern (durch ein bereits registriertes Elternteil) erhalten hast. Ohne diese elterliche Einladung blockiert unser System deine Anmeldung automatisch.</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">2. Datenkategorien, Zwecke und Rechtsgrundlagen</h3>
                                    
                                    <div className="space-y-3 pl-2">
                                        <h4 className="font-extrabold text-white">2.1 Daten von Kunden (Fahrgäste & Social-Media-Nutzer)</h4>
                                        <p><strong>• 2.1.1 Echtzeit-Standortdaten (GPS):</strong> Erfassung des Standorts zur Fahrtenvermittlung (Art. 6.1.b DSGVO - Vertragserfüllung) und optional mit Ihrer ausdrücklichen Einwilligung zur Anzeige regionaler Angebote/Gutscheine in der Nähe (Art. 6.1.a DSGVO - Einwilligung, jederzeit in den Einstellungen widerrufbar).</p>
                                        <p><strong>• 2.1.2 Stammdaten:</strong> Vorname, Nachname, E-Mail, Telefonnummer, Geburtsdatum und Adresse zur Bereitstellung des Kundenkontos und Support (Art. 6.1.b DSGVO - Vertragserfüllung).</p>
                                        <p><strong>• 2.1.3 Zahlungsdaten:</strong> Bankverbindungen, Transaktions-IDs, Stripe/PayPal-Daten zur Zahlungsabwicklung (Art. 6.1.b DSGVO - Vertragserfüllung).</p>
                                        <p><strong>• 2.1.4 Social-Media-Inhalte (Bilder & 15s Videos):</strong> Freiwilliger Upload von Profilbildern, Fotos und Kurzvideos (max. 15s) auf der Social-Wall. Basiert auf Ihrer Einwilligung (Art. 6.1.a DSGVO) und kann von Ihnen jederzeit eigenständig in der App gelöscht werden.</p>
                                        <p><strong>• 2.1.5 Support-Daten & Feedback:</strong> Analyse von Feedback zur App-Verbesserung. Alle Feedback-Texte werden vor der Auswertung vollständig und unumkehrbar anonymisiert (ohne jeglichen Personenbezug, Art. 6.1.f DSGVO - Berechtigtes Interesse). Diese anonymen Statistik-Daten verkaufen wir an genau 3 ausgewählte Kooperationspartner zur Marktforschung:<br/>
                                        1. <strong>Green-City Analytics GmbH</strong> (Zeil 106, Frankfurt am Main) – Urbane Mobilitäts- und Verkehrsanalysen.<br/>
                                        2. <strong>NextGen Nightlife Marketing KG</strong> (Leopoldstraße 244, München) – Erforschung von Freizeit- und Konsumverhalten.<br/>
                                        3. <strong>EcoTransit Research Ltd.</strong> (Dublin, Irland) – Untersuchung von CO2-Reduzierungspotenzialen.</p>
                                    </div>

                                    <div className="space-y-3 pl-2">
                                        <h4 className="font-extrabold text-white">2.2 Daten von Partnern (Manager)</h4>
                                        <p><strong>• 2.2.1 Gewerbedokumente:</strong> Handelsregisterauszüge, Steuernachweise zur KYC-Identitätsprüfung (Art. 6.1.c DSGVO - Rechtliche Verpflichtung).</p>
                                        <p><strong>• 2.2.2 Geschäftliche Kontaktdaten:</strong> Name, E-Mail, Telefon zur B2B-Vertragsabwicklung (Art. 6.1.b DSGVO).</p>
                                    </div>

                                    <div className="space-y-3 pl-2">
                                        <h4 className="font-extrabold text-white">2.3 Daten von Angestellten (Staff)</h4>
                                        <p><strong>• 2.3.1 Mitarbeiter-ID & Berechtigungen:</strong> Zur Einrichtung von Systemrechten und Protokollierung betriebssicherheitsrelevanter Aktionen (Art. 6.1.b DSGVO / § 26 BDSG - Beschäftigungsverhältnis).</p>
                                    </div>

                                    <div className="space-y-3 pl-2">
                                        <h4 className="font-extrabold text-white">2.4 Daten von Fahrern (Drivers)</h4>
                                        <p><strong>• 2.4.1 Gesetzliche Nachweise (Führerschein & P-Schein):</strong> Verifizierung der staatlichen Erlaubnis zur gewerblichen Fahrgastbeförderung (Art. 6.1.c DSGVO - Rechtliche Verpflichtung).</p>
                                        <p><strong>• 2.4.2 Fahrzeugdaten:</strong> Nummernschild, Farbe, Automodell und Live-Standort zur Kunden-Identifikation (Art. 6.1.b DSGVO).</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">3. Empfänger von personenbezogenen Daten (Art. 13 Abs. 1 lit. e DSGVO)</h3>
                                    <p>Ihre Daten werden sicher an Zahlungsdienstleister (Stripe/PayPal), Cloud-Provider für Medienspeicherung und Partnerbetriebe (Hotel/Restaurant) weitergegeben, sofern dies zur Serviceerbringung nötig ist. Ansonsten erfolgt keine Weitergabe an unbefugte Dritte.</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">4. Speicherdauer & Sitzungsdauer (Art. 13 Abs. 2 lit. a DSGVO)</h3>
                                    <p>Social-Media-Inhalte werden beim Löschen sofort vom Server entfernt. Rechnungsdaten werden gemäß den steuerlichen und handelsrechtlichen Gesetzen bis zu 10 Jahre aufbewahrt (§ 257 HGB, § 147 AO).<br/>
                                    <strong>Sicherheitsrelevante Sitzungsdauer (JWT Session Expiration):</strong> Während Passagier-Sessions dauerhaft geöffnet bleiben, werden Manager, Staff und Fahrer aus IT-Sicherheitsgründen (Verhinderung unbefugter Zugriffe) täglich um <strong>exakt 05:00 Uhr morgens</strong> automatisch aus dem System ausgeloggt (Ablauf des JWT-Tokens).</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">5. Lokaler Speicher auf Ihrem Endgerät (§ 25 TDDDG)</h3>
                                    <p>Wir verwenden technisch notwendige Einträge im lokalen Speicher Ihres Browsers (`localStorage`), um die offline-simulierte Funktionalität des Ecosystems sicherzustellen (§ 25 Abs. 2 Nr. 2 TDDDG):<br/>
                                    • <strong>green_users:</strong> Verschlüsselte Benutzerdatenbank (Passwort-Hashes) zur Authentifizierung.<br/>
                                    • <strong>green_user_email, green_role, green_verified:</strong> Sitzungssteuerung und Berechtigungsabgleiche (erlöschen beim Logout).<br/>
                                    • <strong>green_active_orders, green_hotel_rooms, green_stadium_events:</strong> Lokale Bestelldaten und Anwendungszustände zur Simulationsabwicklung.<br/>
                                    • <strong>green_parent_invitations:</strong> Freigabe-Datenbank für jugendliche Konten (Eltern-Einladungen).</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">6. Automatisierte Entscheidungsfindung & Profiling (Art. 13 Abs. 2 lit. f, Art. 22 DSGVO)</h3>
                                    <p>Zur Erhaltung der Plattformintegrität und zum Schutz unserer Fahrer/Fahrgäste nutzen wir ein automatisiertes Verwarnungssystem:<br/>
                                    • <strong>Das Red-Flag-System:</strong> Systemregistrierte Verstöße (z.B. chronische böswillige Stornierungen vor Ankunft des Fahrers, unberechtigte Reklamationsversuche oder Verstöße gegen Nutzungsbedingungen) führen zur Vergabe von Verwarnungen („Red Flags“).<br/>
                                    • <strong>Die Logik:</strong> Das Sammeln von <strong>3 Red Flags innerhalb von 2 Monaten</strong> führt zu einer <strong>automatischen Sperrung des Kontos für genau 1 Jahr</strong>. Ein wiederholter Verstoß nach der Sperrzeit führt zum dauerhaften Ausschluss.<br/>
                                    • <strong>Ihre Rechte:</strong> Sie haben das Recht, <strong>Ihren Standpunkt darzulegen</strong>, ein **menschliches Eingreifen** seitens unseres Support-Teams zu verlangen und die Entscheidung anzufechten. Kontaktieren Sie uns hierzu unter `ops@green-nightlife.com` für eine persönliche Prüfung.</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">7. Ihre Betroffenenrechte (Art. 13 Abs. 2 lit. b DSGVO)</h3>
                                    <p>Sie haben jederzeit folgende Rechte bezüglich Ihrer personenbezogenen Daten:<br/>
                                    • Recht auf <strong>Auskunft</strong> (Art. 15 DSGVO) über gespeicherte Daten und Kopien.<br/>
                                    • Recht auf <strong>Berichtigung</strong> (Art. 16 DSGVO) unrichtiger Daten.<br/>
                                    • Recht auf <strong>Löschung</strong> (Art. 17 DSGVO) („Recht auf Vergessenwerden“).<br/>
                                    • Recht auf <strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO).<br/>
                                    • Recht auf <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) in strukturiertem Format.<br/>
                                    • Recht auf <strong>Widerspruch</strong> (Art. 21 DSGVO) gegen künftige Verarbeitungen aus besonderen Gründen.</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">8. Recht auf Beschwerde bei der Aufsichtsbehörde (Art. 13 Abs. 2 lit. d DSGVO)</h3>
                                    <p>Bei datenschutzrechtlichen Verstößen haben Sie oder Ihre Erziehungsberechtigten das Recht, sich an die zuständige Aufsichtsbehörde zu wenden:<br/>
                                    <strong>Der Hessische Beauftragte für Datenschutz und Informationsfreiheit</strong><br/>
                                    Gustav-Stresemann-Ring 1, 65189 Wiesbaden, Deutschland<br/>
                                    E-Mail: poststelle@datenschutz.hessen.de • Telefon: +49 611 1408-0</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 border-t border-white/5 flex justify-end">
                                <button 
                                    onClick={() => setShowFullPolicy(false)}
                                    className="px-8 py-3.5 bg-brand text-dark-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                                >
                                    Verstanden & Schließen
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-[60%] h-[60%] bg-brand/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 -right-1/4 w-[60%] h-[60%] bg-violet-500/5 blur-[150px] rounded-full" />
            </div>
        </div>
    );
};

export default Privacy;



