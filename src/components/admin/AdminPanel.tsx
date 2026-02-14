import React, { useState, useEffect } from 'react';
import {
    FaTimes,
    FaSave,
    FaPlus,
    FaTrash,
    FaArrowLeft,
    FaCheck,
    FaImage,
    FaUsers,
    FaList,
    FaFont,
    FaFileAlt,
    FaEye,
    FaExternalLinkAlt,
    FaGripVertical,
    FaShieldAlt,
    FaArrowRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FileUploader } from './FileUploader';
import config from '../../config';
import { Content, Event, TeamMember, Registration, MediaAsset } from '../../types/admin';

// Default / Empty States
const emptyEvent: Event = {
    id: '',
    title: '',
    date: '',
    time: '',
    description: '',
    image: null,
    category: 'Cultural',
    participationType: 'Solo',
    teamSize: '',
    coordinatorPhone: '', // Event coordinator contact
    isPassEvent: false, // Default to Manual pricing
    ticketTiers: [],
    entryFee: '',
    rules: [],
    maxSlots: 100,
    registeredCount: 0
};

const emptyTeamMember: TeamMember = {
    name: '',
    role: '',
    category: 'Volunteers',
    subCategory: '',
    image: null,
    instagram: '',
    linkedin: '',
    isActive: true,
    order: 0
};

const teamCategories = [
    'Faculty Coordinators',
    'Student Coordinators',
    'Vistara Club Members',
    'Volunteers'
];

const roleOptions = [
    'President',
    'General Secretary',
    'Secretary'
];

const subCategoryOptions = [
    'Core Team',
    'Tech Club',
    'Music Club',
    'Dance Club',
    'Compering Club',
    'Media Club',
    'Fashion Club'
];

interface AdminPanelProps {
    content: Content;
    setContent: (content: Content) => void;
    events: Event[];
    setEvents: (events: Event[]) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ content, setContent, events, setEvents, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState<Event>(emptyEvent);

    const [newGalleryUrl, setNewGalleryUrl] = useState('');
    const [newRule, setNewRule] = useState('');


    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [newTeamMember, setNewTeamMember] = useState<TeamMember>(emptyTeamMember);
    const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [isLoadingRegs, setIsLoadingRegs] = useState(false);
    const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all'); // 'all' or eventId

    // Registration View Modal State
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (activeTab === 'registrations') fetchRegistrations();
            if (activeTab === 'team') fetchTeamMembers();
        }
    }, [isOpen, activeTab]);

    const fetchTeamMembers = async () => {
        try {
            const res = await fetch(`${config.API_URL}/team`);
            const data = await res.json();
            if (data.success) setTeamMembers(data.data);
        } catch (error) {
            console.error("Failed to fetch team", error);
        }
    };

    const fetchRegistrations = async () => {
        setIsLoadingRegs(true);
        try {
            const res = await fetch(`${config.API_URL}/admin/registrations`);
            const data = await res.json();
            if (data.success) {
                setRegistrations(data.data);
            }
        } catch (error) {
            console.error("Failed to load registrations", error);
        }
        setIsLoadingRegs(false);
    };

    const saveContentToBackend = async (newContent: Content, silent = false) => {
        try {
            // 🛡️ SANITIZATION: Ensure all media assets are objects before sending
            const sanitizedContent = { ...newContent };

            // 1. Sanitize Gallery Images
            if (Array.isArray(sanitizedContent.galleryImages)) {
                sanitizedContent.galleryImages = sanitizedContent.galleryImages.map(img => {
                    // @ts-ignore - handling string legacy data
                    if (typeof img === 'string') {
                        const urlString = img as string;
                        // Auto-detect type roughly
                        const isVid = urlString.match(/\.(mp4|webm|ogg)$/i);
                        return { url: urlString, type: isVid ? 'video' : 'image' } as MediaAsset;
                    }
                    return img;
                }).filter(Boolean); // Remove nulls/undefined
            }

            // 2. Sanitize Hero Media
            // @ts-ignore - handling string legacy data
            if (sanitizedContent.heroBackgroundMedia && typeof sanitizedContent.heroBackgroundMedia === 'string') {
                const img = sanitizedContent.heroBackgroundMedia as unknown as string;
                const isVid = img.match(/\.(mp4|webm|ogg)$/i);
                sanitizedContent.heroBackgroundMedia = { url: img, type: isVid ? 'video' : 'image' } as MediaAsset;
            }

            const res = await fetch(`${config.API_URL}/content/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: sanitizedContent }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Server Error");

            if (!silent) alert("Changes Saved to Database!");
        } catch (error: any) {
            console.error("Failed to save content", error);
            alert(`Error saving content: ${error.message}`);
        }
    };

    const saveEventsToBackend = async (newEvents: Event[]) => {
        try {
            await fetch(`${config.API_URL}/events/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: newEvents }),
            });
        } catch (error) {
            console.error("Failed to save events", error);
        }
    };

    const saveTeamToBackend = async (members: TeamMember[]) => {
        try {
            await fetch(`${config.API_URL}/team/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamMembers: members }),
            });
        } catch (error: any) {
            console.error("Failed to save team", error);
            alert(`Failed to save team changes: ${error.message}`);
        }
    };

    // --- Registration Verification ---
    const handleVerifyRegistration = async (reg: Registration) => {
        // Optimistic Update
        const updatedRegs = registrations.map(r => r._id === reg._id ? { ...r, isActive: true } : r);
        setRegistrations(updatedRegs);
        if (selectedRegistration && selectedRegistration._id === reg._id) {
            setSelectedRegistration({ ...selectedRegistration, isActive: true });
        }

        try {
            await fetch(`${config.API_URL}/admin/verify-registration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId: reg._id, isActive: true })
            });
            console.log("Verified user:", reg.name);
            // alert(`User ${reg.name} Verified!`); // Optional: Remove alert for smoother UX
        } catch (error) {
            console.error("Verification failed", error);
            alert("Verification failed");
            // Revert optimistic update
            setRegistrations(registrations);
        }
    };


    if (!isOpen) return null;

    const handleContentChange = (key: keyof Content, value: any) => {
        setContent({ ...content, [key]: value });
    };

    const handlePriceChange = (tier: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setContent({
            ...content,
            ticketPrices: {
                ...content.ticketPrices,
                [tier]: numValue
            }
        });
    };

    const handleAddGalleryItem = async () => {
        if (newGalleryUrl.trim()) {
            const currentImages = content.galleryImages || [];
            const newImage: MediaAsset = { url: newGalleryUrl.trim(), type: 'image' };
            const updatedImages = [...currentImages, newImage];
            const newContentObj = { ...content, galleryImages: updatedImages };
            setContent(newContentObj);
            setNewGalleryUrl('');
            await saveContentToBackend(newContentObj, true);
        }
    };

    const handleDeleteGalleryItem = async (index: number) => {
        if (window.confirm("Delete this image permanently?")) {
            const currentImages = content.galleryImages || [];
            const updatedGallery = currentImages.filter((_, i) => i !== index);
            const newContentObj = { ...content, galleryImages: updatedGallery };
            setContent(newContentObj);
            await saveContentToBackend(newContentObj, true);
        }
    };



    const handleDeleteEvent = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            const updatedEvents = events.filter((e) => e.id !== id);
            setEvents(updatedEvents);
            await saveEventsToBackend(updatedEvents);
        }
    };

    const handleEditEvent = (event: Event) => {
        setNewEvent({
            ...event,
            ticketTiers: event.ticketTiers || [],
            rules: event.rules || [],
            maxSlots: event.maxSlots || 100,
            registeredCount: event.registeredCount || 0,
            // Ensure defaults for new fields
            isPassEvent: event.isPassEvent !== undefined ? event.isPassEvent : true,
            entryFee: event.entryFee || '',
        });
        setEditingId(event.id);
        setIsAddingEvent(true);
    };

    const handleSaveEvent = () => {
        if (!newEvent.title || !newEvent.description) {
            alert("Please fill in all required fields (Title, Description)");
            return;
        }

        let updatedEvents;
        if (editingId) {
            updatedEvents = events.map((e) =>
                e.id === editingId ? { ...newEvent, id: editingId, image: newEvent.image || e.image } : e
            );
        } else {
            const eventToAdd: Event = {
                ...newEvent,
                id: Date.now().toString(),
                image:
                    newEvent.image ||
                    { url: 'https://images.unsplash.com/photo-1514525253440-b393452e8d03?q=80&w=2070&auto=format&fit=crop', type: 'image' }
            };
            updatedEvents = [...events, eventToAdd];
        }

        setEvents(updatedEvents);
        saveEventsToBackend(updatedEvents);
        alert("Event Saved Successfully!");
        resetForm();
    };

    const resetForm = () => {
        setIsAddingEvent(false);
        setNewEvent(emptyEvent);
        setEditingId(null);
        setNewRule('');
    };

    const toggleTicketTier = (tier: string) => {
        if (newEvent.ticketTiers.includes(tier)) {
            setNewEvent({ ...newEvent, ticketTiers: newEvent.ticketTiers.filter((t) => t !== tier) });
        } else {
            setNewEvent({ ...newEvent, ticketTiers: [...newEvent.ticketTiers, tier] });
        }
    };

    const handleAddRule = () => {
        if (newRule.trim()) {
            setNewEvent({ ...newEvent, rules: [...(newEvent.rules || []), newRule.trim()] });
            setNewRule('');
        }
    };

    const handleRemoveRule = (index: number) => {
        setNewEvent({ ...newEvent, rules: newEvent.rules.filter((_, i) => i !== index) });
    };

    // --- TEAM MEMBER LOGIC ---

    const cancelTeamEdit = () => {
        setIsAddingTeamMember(false);
        setNewTeamMember(emptyTeamMember);
        setEditingTeamId(null);
    };

    const handleEditTeamMember = (member: TeamMember) => {
        setNewTeamMember({ ...member });
        setEditingTeamId(member._id || member.id || null);
        setIsAddingTeamMember(true);
    };

    const handleDeleteTeamMember = async (id: string) => {
        if (!id) {
            alert("This member cannot be deleted yet. Please refresh the page and try again.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this team member?")) {
            const updatedTeam = teamMembers.filter((m) => (m._id || m.id) !== id);
            setTeamMembers(updatedTeam);
            await saveTeamToBackend(updatedTeam);
            await fetchTeamMembers();
        }
    };

    const handleSaveTeamMember = async () => {
        if (!newTeamMember.name) {
            alert("Name is required!");
            return;
        }

        let updatedTeam;
        if (editingTeamId) {
            updatedTeam = teamMembers.map((m) =>
                (m._id || m.id) === editingTeamId ? { ...newTeamMember, _id: editingTeamId } : m
            );
        } else {
            // Append new member to the END of the list with correct order
            const newOrder = teamMembers.length;
            updatedTeam = [...teamMembers, { ...newTeamMember, order: newOrder }];
        }

        setTeamMembers(updatedTeam);
        await saveTeamToBackend(updatedTeam);
        await fetchTeamMembers();
        toast.success("Team Member Saved!", {
            description: `${newTeamMember.name} has been added successfully.`,
        });
        cancelTeamEdit();
    };

    const handleDeleteAllTeamMembers = async () => {
        if (window.confirm("ARE YOU SURE? This will delete ALL team members permanently. This action cannot be undone.")) {
            setTeamMembers([]);
            await saveTeamToBackend([]);
            await fetchTeamMembers();
        }
    };

    const handleOnDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(teamMembers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order property based on new index
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setTeamMembers(updatedItems);
        await saveTeamToBackend(updatedItems);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 md:p-6 text-white font-bricolage overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] animate-pulse rounded-full pointer-events-none z-0" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#080808] border-2 border-zinc-900 rounded-none md:rounded-[32px] w-full max-w-7xl h-full md:h-[90vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden"
            >
                {/* HEADER - Cyber Console Style */}
                <div className="px-6 py-6 border-b border-white/5 flex justify-between items-center bg-[#0c0c0c] relative z-20">
                    <div className="flex items-center gap-6">
                        {isAddingEvent && (
                            <button
                                onClick={resetForm}
                                className="group h-10 w-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all active:scale-90"
                            >
                                <FaArrowLeft size={16} />
                            </button>
                        )}
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_#A855F7]" />
                                <h2 
                                    className="text-2xl font-black uppercase tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent"
                                    style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
                                >
                                    {isAddingEvent ? (editingId ? 'Module_Edit' : 'Module_Create') : 'System_Dashboard'}
                                </h2>
                            </div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                                {isAddingEvent ? 'Modifying internal event parameters' : 'Vistara Administrative Control Interface'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Status: Uplink_Active</span>
                            <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest mt-1">Auth: Level_4</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-10 w-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-red-500 hover:border-red-500 transition-all active:scale-90"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>
                </div>

                {/* NAVIGATION TABS - Minimalist Line Style */}
                {!isAddingEvent && !isAddingTeamMember && (
                    <div className="flex px-6 bg-[#0c0c0c] border-b border-white/5 overflow-x-auto no-scrollbar">
                        {['general', 'events', 'registrations', 'team'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'text-white'
                                    : 'text-zinc-600 hover:text-zinc-400'
                                    }`}
                            >
                                {tab === 'general' ? 'Core_Config' : tab.replace('s', '') + '_Registry'}
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTab" 
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_10px_#A855F7]" 
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#080808] custom-scrollbar">
                    {/* --- GENERAL SETTINGS --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-12 max-w-4xl">
                            <header className="space-y-3">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-bricolage">Core Configuration</h3>
                                <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">System-wide parameters for payment processing, visual branding, and essential assets.</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Payment Configuration */}
                                <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-3xl space-y-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FaSave size={40} />
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Financial Gateway</h4>
                                        <p className="text-xs text-zinc-600 uppercase font-black tracking-tight">Standard Payment Parameters</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">UPI Endpoint</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={content.upiId || ''}
                                                    onChange={(e) => {
                                                        const newContent = { ...content, upiId: e.target.value };
                                                        setContent(newContent);
                                                        saveContentToBackend(newContent, true);
                                                    }}
                                                    className="w-full bg-black/50 border-2 border-zinc-800 rounded-2xl py-4 px-5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 transition-all font-inter"
                                                    placeholder="identifier@upi"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Visual Auth (QR)</label>
                                            <div className="bg-black/50 border-2 border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-6">
                                                <div className="relative group/qr">
                                                    {content.qrCodeUrl ? (
                                                        <div className="relative">
                                                            <div className="absolute -inset-4 bg-white/5 blur-xl rounded-full opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                                                            <img 
                                                                src={content.qrCodeUrl} 
                                                                alt="Payment QR" 
                                                                className="relative w-40 h-40 object-contain bg-white rounded-xl p-2 shadow-2xl transition-transform hover:scale-105" 
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-40 h-40 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600">
                                                            <FaImage size={30} />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="w-full">
                                                    <FileUploader
                                                        label="Update QR Asset"
                                                        initialUrl={content.qrCodeUrl ? { url: content.qrCodeUrl, type: 'image' } : null}
                                                        onUpload={(asset) => {
                                                            if (asset) {
                                                                const newContent = { ...content, qrCodeUrl: asset.url };
                                                                setContent(newContent);
                                                                saveContentToBackend(newContent, true);
                                                            }
                                                        }}
                                                        folder="payment"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Placeholder for other config or info */}
                                <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-3xl flex flex-col justify-center items-center text-center space-y-6">
                                    <div className="h-16 w-16 bg-purple-500/10 rounded-full flex items-center justify-center">
                                        <FaShieldAlt className="text-purple-500 text-2xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-white font-black uppercase tracking-widest text-sm">Integrity Shield</h4>
                                        <p className="text-zinc-600 text-xs px-8 leading-relaxed uppercase font-black tracking-tight">
                                            All changes are logged and synchronized across the secure Esperanza blockchain infrastructure.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Global Save Button */}
                            <div className="flex justify-start pt-8 pb-10">
                                <button
                                    onClick={() => saveContentToBackend(content)}
                                    className="group relative h-16 px-12 bg-white rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                                    <div className="relative flex items-center gap-3 text-black font-black uppercase text-sm tracking-tight">
                                        <FaSave size={18} />
                                        Save Changes
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- REGISTRATION LIST VIEW --- */}
                    {activeTab === 'registrations' && !isAddingEvent && !isAddingTeamMember && (
                        <div className="space-y-10">
                            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-bricolage">
                                        {selectedEventFilter === 'all' ? 'All Registrations' : 'Event Registrations'}
                                    </h3>
                                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                                        {selectedEventFilter === 'all' 
                                            ? `Viewing ${registrations.length} registrations`
                                            : `Filtering by event: ${events.find(e => e.id === selectedEventFilter)?.title || 'Unknown'}`
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedEventFilter !== 'all' && (
                                        <button
                                            onClick={() => setSelectedEventFilter('all')}
                                            className="h-12 px-6 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                    <button
                                        onClick={fetchRegistrations}
                                        className="h-12 px-6 bg-purple-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-purple-600 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                        Refresh Data
                                    </button>
                                </div>
                            </header>

                            {isLoadingRegs ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-900 rounded-[32px]">
                                    <div className="h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Loading...</p>
                                </div>
                            ) : selectedEventFilter === 'all' ? (
                                /* SHOW EVENT CARDS - GRID REDESIGN */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* All Registrations Summary */}
                                    <div
                                        onClick={() => setSelectedEventFilter('all-list')}
                                        className="relative p-8 bg-white rounded-3xl cursor-pointer group transition-all hover:scale-[1.02] overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 text-black/5 group-hover:text-black/10 transition-colors">
                                            <FaList size={60} />
                                        </div>
                                        <div className="relative z-10 space-y-4">
                                            <h4 className="text-black font-black uppercase tracking-tighter text-sm">Overview</h4>
                                            <div>
                                                <p className="text-5xl font-black text-black tracking-tighter leading-none mb-1">{registrations.length}</p>
                                                <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Total Registry Entries</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-black/40 group-hover:text-black transition-colors pt-4">
                                                <span className="text-[9px] font-black uppercase tracking-widest">View Details</span>
                                                <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Individual Event Log Cards */}
                                    {events.map((event, index) => {
                                        const eventRegs = registrations.filter(r => r.eventId === event.id);
                                        const verifiedCount = eventRegs.filter(r => r.isActive).length;

                                        return (
                                            <div
                                                key={event.id || index}
                                                onClick={() => setSelectedEventFilter(event.id)}
                                                className="relative p-8 bg-zinc-900/30 border-2 border-zinc-800 rounded-3xl cursor-pointer group transition-all hover:border-purple-500/30 hover:bg-zinc-900/50"
                                            >
                                                <div className="space-y-6">
                                                    <div className="space-y-1">
                                                        <h4 className="text-white font-black uppercase tracking-tight text-xs truncate group-hover:text-purple-400 transition-colors">{event.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1 w-1 rounded-full bg-purple-500" />
                                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{event.category}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            <p className="text-3xl font-black text-white tracking-tighter leading-none mb-1">{eventRegs.length}</p>
                                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Registrations</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black text-green-500/80 uppercase tracking-tight leading-none mb-1">{verifiedCount}</p>
                                                            <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.2em]">Verified</p>
                                                        </div>
                                                    </div>

                                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                                                            style={{ width: `${(eventRegs.length / (event.maxSlots || 100)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* SHOW REGISTRATION TABLE - CYBER REDESIGN */
                                <div className="bg-zinc-900/20 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm">
                                    <div className="overflow-x-auto no-scrollbar">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-zinc-900/40">
                                                    <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Name</th>
                                                    <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">College</th>
                                                    <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Event</th>
                                                    <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                                                    <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {(selectedEventFilter === 'all-list'
                                                    ? registrations
                                                    : registrations.filter(r => r.eventId === selectedEventFilter)
                                                ).map((reg, index) => (
                                                    <tr key={reg._id || index} className="group hover:bg-white/[0.02] transition-colors">
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-zinc-800 border border-white/10 rounded-xl flex items-center justify-center text-xs font-black text-zinc-500">
                                                                    {reg.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-white tracking-tight uppercase leading-none mb-1">{reg.name}</p>
                                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{reg.phone}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <p className="text-xs font-black text-zinc-500 uppercase tracking-tight">{reg.college}</p>
                                                        </td>
                                                        <td className="p-6">
                                                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
                                                                {reg.eventName || 'SYSTEM_CORE'}
                                                            </span>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-1.5 w-1.5 rounded-full ${reg.isActive ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-yellow-500 shadow-[0_0_8px_#eab308]'}`} />
                                                                <span className={`text-[9px] font-black uppercase tracking-widest ${reg.isActive ? 'text-green-500' : 'text-yellow-500'}`}>
                                                                    {reg.isActive ? 'Verified' : 'Pending'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 text-right">
                                                            <button
                                                                onClick={() => setSelectedRegistration(reg)}
                                                                className="h-10 px-5 bg-zinc-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2 ml-auto"
                                                            >
                                                                <FaEye size={12} /> View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {(selectedEventFilter === 'all-list'
                                            ? registrations
                                            : registrations.filter(r => r.eventId === selectedEventFilter)
                                        ).length === 0 && (
                                                <div className="p-20 text-center space-y-4">
                                                    <div className="h-16 w-16 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center mx-auto opacity-20">
                                                        <FaUsers size={30} />
                                                    </div>
                                                    <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em]">No Registrations Found.</p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TEAM MEMBER FORM --- */}
                    {isAddingTeamMember && (
                        <div className="space-y-12 max-w-4xl">
                            <header className="space-y-3">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-bricolage">
                                    {editingTeamId ? 'Edit Member' : 'Add New Member'}
                                </h3>
                                <p className="text-zinc-500 text-sm uppercase font-black tracking-widest">Team Management</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={newTeamMember.name}
                                            onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                                            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 transition-all font-inter"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Role</label>
                                        <input
                                            type="text"
                                            list="roleOptionsList"
                                            value={newTeamMember.role}
                                            onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                                            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 transition-all font-inter"
                                            placeholder="Ex: Technical Lead"
                                        />
                                        <datalist id="roleOptionsList">
                                            {roleOptions.map(role => <option key={role} value={role} />)}
                                        </datalist>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Category</label>
                                            <select
                                                value={newTeamMember.category}
                                                onChange={(e) => setNewTeamMember({ ...newTeamMember, category: e.target.value })}
                                                className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 transition-all font-inter appearance-none"
                                            >
                                                {teamCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Sub Category</label>
                                            <input
                                                type="text"
                                                list="subCategoryOptionsList"
                                                value={newTeamMember.subCategory || ''}
                                                onChange={(e) => setNewTeamMember({ ...newTeamMember, subCategory: e.target.value })}
                                                className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 transition-all font-inter"
                                                placeholder="Sub-Category"
                                            />
                                            <datalist id="subCategoryOptionsList">
                                                {subCategoryOptions.map(sub => <option key={sub} value={sub} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Profile Picture</label>
                                        <div className="bg-zinc-900/30 border-2 border-zinc-800 rounded-[32px] p-6 flex flex-col items-center gap-4">
                                            <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-zinc-800 bg-black">
                                                {newTeamMember.image?.url ? (
                                                    <img src={newTeamMember.image.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                                                        <FaUsers size={40} />
                                                    </div>
                                                )}
                                            </div>
                                            <FileUploader
                                                label="Upload Image"
                                                initialUrl={newTeamMember.image}
                                                onUpload={(asset) => setNewTeamMember({ ...newTeamMember, image: asset })}
                                                folder="team"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Social Links</label>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Instagram URL"
                                                value={newTeamMember.instagram}
                                                onChange={(e) => setNewTeamMember({ ...newTeamMember, instagram: e.target.value })}
                                                className="w-full bg-zinc-900/30 border border-white/5 rounded-xl py-3 px-4 text-xs text-zinc-400 focus:text-white transition-all"
                                            />
                                            <input
                                                type="text"
                                                placeholder="LinkedIn URL"
                                                value={newTeamMember.linkedin}
                                                onChange={(e) => setNewTeamMember({ ...newTeamMember, linkedin: e.target.value })}
                                                className="w-full bg-zinc-900/30 border border-white/5 rounded-xl py-3 px-4 text-xs text-zinc-400 focus:text-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        id="isActiveParams"
                                        checked={newTeamMember.isActive !== false}
                                        onChange={(e) => setNewTeamMember({ ...newTeamMember, isActive: e.target.checked })}
                                        className="peer hidden"
                                    />
                                    <label 
                                        htmlFor="isActiveParams"
                                        className="h-6 w-11 bg-zinc-800 rounded-full flex items-center px-1 cursor-pointer transition-colors peer-checked:bg-purple-500"
                                    >
                                        <div className="h-4 w-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                                    </label>
                                </div>
                                <label htmlFor="isActiveParams" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer peer-checked:text-white">
                                    Status: Active
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4 pb-20">
                                <button 
                                    onClick={cancelTeamEdit} 
                                    className="h-14 px-8 bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white border border-white/5 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveTeamMember} 
                                    className="h-14 px-10 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-3"
                                >
                                    <FaSave size={14} /> Save Member
                                </button>
                            </div>
                        </div>
                    )}

                    {isAddingEvent && (
                        /* --- EVENT FORM REDESIGN --- */
                        <div className="space-y-12 max-w-4xl">
                            <header className="space-y-3">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-bricolage">
                                    {editingId ? 'Edit Event' : 'Create Event'}
                                </h3>
                                <p className="text-zinc-500 text-sm uppercase font-black tracking-widest">Event Management</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Event Title</label>
                                        <input
                                            type="text"
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 transition-all font-inter"
                                            placeholder="Event Title"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Category</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Technical_Symphony"
                                            value={newEvent.category}
                                            onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                                            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 transition-all font-inter"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Coordinator Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 XXXXX XXXXX"
                                            value={newEvent.coordinatorPhone || ''}
                                            onChange={(e) => setNewEvent({ ...newEvent, coordinatorPhone: e.target.value })}
                                            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 transition-all font-inter"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Description</label>
                                        <textarea
                                            value={newEvent.description}
                                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                            className="w-full h-[188px] bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-4 px-6 text-sm text-zinc-300 focus:border-purple-500/50 transition-all font-inter resize-none"
                                            placeholder="Enter event details..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-zinc-900/30 border-2 border-zinc-800 rounded-[32px] space-y-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_#A855F7]" />
                                    <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Registration Details</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Max Capacity</label>
                                        <input
                                            type="number"
                                            value={newEvent.maxSlots}
                                            onChange={(e) => setNewEvent({ ...newEvent, maxSlots: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Registered Count</label>
                                        <input
                                            type="number"
                                            value={newEvent.registeredCount}
                                            onChange={(e) => setNewEvent({ ...newEvent, registeredCount: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Entry Fee</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 500 Credits"
                                            value={newEvent.entryFee || ''}
                                            onChange={(e) => setNewEvent({ ...newEvent, entryFee: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-8">
                                        <button 
                                            onClick={() => setNewEvent({ ...newEvent, participationType: 'Solo', teamSize: '' })}
                                            className={`flex-1 h-14 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest ${newEvent.participationType === 'Solo' ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            Solo Participation
                                        </button>
                                        <button 
                                            onClick={() => setNewEvent({ ...newEvent, participationType: 'Team' })}
                                            className={`flex-1 h-14 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest ${newEvent.participationType === 'Team' ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            Team Participation
                                        </button>
                                    </div>
                                    {newEvent.participationType === 'Team' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-2.5"
                                        >
                                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Team Size</label>
                                            <input
                                                type="text"
                                                value={newEvent.teamSize || ''}
                                                onChange={(e) => setNewEvent({ ...newEvent, teamSize: e.target.value })}
                                                placeholder="Ex: 2 - 6 Units"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-6 text-white font-inter"
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Event Image</label>
                                    <div className="bg-zinc-900/30 border-2 border-zinc-800 rounded-[32px] p-8">
                                        <FileUploader
                                            label="Upload Event Image"
                                            initialUrl={newEvent.image}
                                            onUpload={(asset) => setNewEvent({ ...newEvent, image: asset })}
                                            folder="events"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Rules</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={newRule}
                                            onChange={(e) => setNewRule(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                                            placeholder="Add a rule..."
                                            className="flex-1 bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-purple-500/50 transition-all"
                                        />
                                        <button
                                            onClick={handleAddRule}
                                            className="h-14 w-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                        >
                                            <FaPlus size={16} />
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        <div className="grid grid-cols-1 gap-3">
                                            {newEvent.rules?.map((rule, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="flex items-center gap-4 bg-zinc-900/40 p-5 rounded-2xl border border-white/5 group"
                                                >
                                                    <span className="text-purple-500 font-black font-mono">[{index + 1}]</span>
                                                    <p className="flex-1 text-[11px] font-black text-zinc-400 uppercase tracking-tight">{rule}</p>
                                                    <button
                                                        onClick={() => handleRemoveRule(index)}
                                                        className="h-8 w-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-10 pb-20">
                                <button 
                                    onClick={handleSaveEvent} 
                                    className="h-20 w-full bg-white text-black text-xs font-black uppercase tracking-[0.3em] rounded-[32px] hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4"
                                >
                                    <FaSave size={18} /> Save Event
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- EVENTS LIST --- */}
                    {activeTab === 'events' && !isAddingEvent && (
                        <div className="space-y-10">
                            <header className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Event List</h3>
                                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Manage all events</p>
                                </div>
                                <button
                                    onClick={() => { resetForm(); setIsAddingEvent(true); }}
                                    className="h-12 px-6 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <FaPlus size={12} /> Add New Event
                                </button>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {events.map((event, index) => (
                                    <div 
                                        key={event.id || index} 
                                        className="bg-[#0c0c0c] border-2 border-zinc-900 rounded-[32px] overflow-hidden group hover:border-purple-500/30 transition-all flex flex-col"
                                    >
                                        <div className="h-48 bg-zinc-900 relative overflow-hidden">
                                            {event.image?.url ? (
                                                <img src={event.image.url} alt={event.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-800">
                                                    <FaImage size={40} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                            <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <button 
                                                    onClick={() => handleEditEvent(event)} 
                                                    className="h-9 w-9 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center"
                                                >
                                                    <FaFont size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteEvent(event.id)} 
                                                    className="h-9 w-9 bg-red-500/20 backdrop-blur-md border border-red-500/20 rounded-xl hover:bg-red-500 text-white transition-all flex items-center justify-center"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-4 left-6">
                                                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                                                    {event.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-4 flex-1 flex flex-col">
                                            <h4 className="font-black text-white text-lg uppercase tracking-tight line-clamp-1">{event.title}</h4>
                                            <p className="text-zinc-600 text-xs line-clamp-2 leading-relaxed font-inter">{event.description}</p>
                                            
                                            <div className="pt-4 mt-auto grid grid-cols-2 gap-4 border-t border-white/5">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest leading-none">Registrations</p>
                                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-tight">{event.registeredCount}/{event.maxSlots}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest leading-none">Date</p>
                                                    <p className="text-xs font-black text-purple-500/80 uppercase tracking-tight">{event.date || 'TBA'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- TEAM LIST --- */}
                    {activeTab === 'team' && !isAddingTeamMember && (
                        <div className="space-y-10">
                            <header className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Team Members</h3>
                                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Manage team members</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeleteAllTeamMembers}
                                        className="h-12 px-6 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        WIPE_ALL_NODES
                                    </button>
                                    <button
                                        onClick={() => { cancelTeamEdit(); setIsAddingTeamMember(true); }}
                                        className="h-12 px-6 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <FaPlus size={12} /> Inject_New_Node
                                    </button>
                                </div>
                            </header>

                            <DragDropContext onDragEnd={handleOnDragEnd}>
                                <Droppable droppableId="team-members">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-4"
                                        >
                                            {teamMembers.map((member, index) => (
                                                <Draggable
                                                    key={member._id || member.id || index}
                                                    draggableId={member._id || member.id || String(index)}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className="bg-zinc-900/20 border border-white/5 rounded-3xl p-4 md:p-6 flex items-center gap-6 group hover:border-purple-500/20 hover:bg-zinc-900/40 transition-all"
                                                        >
                                                            <div 
                                                                {...provided.dragHandleProps}
                                                                className="text-zinc-800 group-hover:text-zinc-600 transition-colors cursor-grab active:cursor-grabbing p-2"
                                                            >
                                                                <FaGripVertical />
                                                            </div>
                                                            <div className={`h-16 w-16 rounded-full overflow-hidden border-2 flex-shrink-0 transition-colors ${member.isActive ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-zinc-800 grayscale'}`}>
                                                                {member.image?.url ? (
                                                                    <img src={member.image.url} alt={member.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-800">
                                                                        <FaUsers size={20} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                                                <div>
                                                                    <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">{member.name}</p>
                                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">ID: {member._id?.substring(0, 8) || 'TEMP'}</p>
                                                                </div>
                                                                <div className="hidden md:block">
                                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{member.role || 'Member'}</p>
                                                                    <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden">
                                                                        <div className="h-full w-2/3 bg-purple-500/50" />
                                                                    </div>
                                                                </div>
                                                                <div className="hidden md:flex justify-end pr-6">
                                                                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/5 px-3 py-1.5 rounded-full border border-purple-500/10">
                                                                        {member.subCategory || member.category}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleEditTeamMember(member)} className="h-10 w-10 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"><FaFont size={12} /></button>
                                                                <button onClick={() => handleDeleteTeamMember(member._id!)} className="h-10 w-10 bg-red-500/10 border border-red-500/10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"><FaTrash size={12} /></button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    )}

                </div>
            </motion.div>

            {/* --- REGISTRATION DETAILS MODAL --- */}
            <AnimatePresence>
                {selectedRegistration && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedRegistration(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-4xl bg-[#080808] border-2 border-zinc-800 rounded-[48px] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)]"
                        >
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                            
                            <div className="relative p-10 md:p-14 max-h-[90vh] overflow-y-auto custom-scrollbar">
                                <header className="flex items-start justify-between mb-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Registration Details</span>
                                        </div>
                                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter font-bricolage leading-tight">
                                            {selectedRegistration.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="px-4 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                                                {selectedRegistration.eventName || 'Legacy_Entry'}
                                            </span>
                                            <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border-2 ${selectedRegistration.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                Status: {selectedRegistration.isActive ? 'VERIFIED' : 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedRegistration(null)}
                                        className="h-14 w-14 bg-zinc-900 border border-white/5 rounded-[22px] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all group"
                                    >
                                        <FaTimes size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <div className="space-y-12">
                                        <section className="space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-px flex-1 bg-white/5" />
                                                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Personal Information</h4>
                                                <div className="h-px flex-1 bg-white/5" />
                                            </div>
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
                                                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Email</span>
                                                    <span className="text-white text-xs font-bold tracking-tight">{selectedRegistration.email}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
                                                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Phone</span>
                                                    <span className="text-white text-xs font-bold tracking-tight">{selectedRegistration.phone}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
                                                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Institution</span>
                                                    <span className="text-white text-xs font-bold tracking-tight">{selectedRegistration.college}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
                                                        <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest block mb-2">Cycle</span>
                                                        <span className="text-purple-500 text-xs font-bold">{selectedRegistration.year} Year</span>
                                                    </div>
                                                    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
                                                        <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest block mb-1">Code</span>
                                                        <span className="text-white text-[10px] font-mono opacity-60 truncate block">{(selectedRegistration as any).registrationCode || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-6">
                                             <div className="flex items-center gap-3">
                                                <div className="h-px flex-1 bg-white/5" />
                                                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Team Members</h4>
                                                <div className="h-px flex-1 bg-white/5" />
                                            </div>
                                            {(selectedRegistration as any).teamMembers && ((selectedRegistration as any).teamMembers as any[]).length > 0 ? (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {((selectedRegistration as any).teamMembers as any[]).map((member: any, i: number) => (
                                                        <div key={i} className="bg-zinc-900/20 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-purple-500 font-mono text-[10px] opacity-40">[{i+1}]</span>
                                                                <span className="text-zinc-300 text-[11px] font-black uppercase tracking-tight">{member.name}</span>
                                                            </div>
                                                            <div className="h-1 w-8 bg-zinc-800 rounded-full" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 border-2 border-dashed border-zinc-900 rounded-2xl">
                                                    <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Solo Participant</p>
                                                </div>
                                            )}
                                        </section>
                                    </div>

                                    <div className="space-y-12">
                                        <section className="space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-px flex-1 bg-white/5" />
                                                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Payment Proof</h4>
                                                <div className="h-px flex-1 bg-white/5" />
                                            </div>
                                            <div className="aspect-[4/5] bg-zinc-950 rounded-[40px] overflow-hidden border-2 border-zinc-900 group relative">
                                                {(selectedRegistration.paymentScreenshotUrl) ? (
                                                    <>
                                                        <img 
                                                            src={selectedRegistration.paymentScreenshotUrl} 
                                                            alt="Payment Proof" 
                                                            className="w-full h-full object-cover grayscale opacity-50 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                                            <a 
                                                                href={selectedRegistration.paymentScreenshotUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="w-full h-16 bg-white text-black rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl"
                                                            >
                                                                <FaExternalLinkAlt size={14} /> View Full Image
                                                            </a>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800 gap-6">
                                                        <div className="h-20 w-20 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                                                            <FaFileAlt size={32} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest border border-zinc-900 px-4 py-2 rounded-full">No Proof Found</span>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        <div className="pt-2">
                                            {!selectedRegistration.isActive && (
                                                <button 
                                                    onClick={() => handleVerifyRegistration(selectedRegistration!)}
                                                    className="group h-24 w-full bg-white rounded-[32px] overflow-hidden relative transition-all active:scale-[0.98]"
                                                >
                                                    <div className="absolute inset-0 bg-green-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                                    <div className="relative flex flex-col items-center justify-center gap-1">
                                                        <span className="text-black group-hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-colors">VERIFY REGISTRATION</span>
                                                        <div className="flex items-center gap-2 text-zinc-400 group-hover:text-white/80 transition-colors">
                                                            <span className="h-px w-8 bg-zinc-200 group-hover:bg-white/30" />
                                                            <FaCheck size={12} />
                                                            <span className="h-px w-8 bg-zinc-200 group-hover:bg-white/30" />
                                                        </div>
                                                    </div>
                                                </button>
                                            )}
                                            {selectedRegistration.isActive && (
                                                <div className="h-24 w-full bg-zinc-900/40 border-2 border-green-500/20 rounded-[32px] flex items-center justify-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                                                        <FaCheck size={16} />
                                                    </div>
                                                    <span className="text-white text-[11px] font-black uppercase tracking-[0.3em]">Verified</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Grain Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[999] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};
