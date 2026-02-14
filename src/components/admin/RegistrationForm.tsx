import React, { useState } from 'react';
import { FaCloudUploadAlt, FaCheck, FaSpinner, FaPlus, FaTrash, FaCreditCard } from 'react-icons/fa';
import { motion } from 'framer-motion';
import config from '../../config';
import { Event } from '../../types/admin';

interface RegistrationFormProps {
    email?: string;
    onSubmit: (data: any) => void;
    selectedEvent?: Event | null;
    onClose?: () => void;
    upiId?: string;
    qrCodeUrl?: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ email = '', onSubmit, selectedEvent, onClose, upiId = '', qrCodeUrl = '' }) => {
    const isSoloEvent = selectedEvent?.participationType === 'Solo';
    const isTeamEvent = selectedEvent?.participationType === 'Team';

    // Parse team size with better handling
    let maxTeamSize = 4; // default
    if (selectedEvent?.teamSize) {
        const parsed = parseInt(selectedEvent.teamSize.toString());
        if (!isNaN(parsed) && parsed > 0) {
            maxTeamSize = parsed;
        }
    }

    console.log('RegistrationForm - Event:', selectedEvent?.title);
    console.log('RegistrationForm - Team Size (raw):', selectedEvent?.teamSize);
    console.log('RegistrationForm - Max Team Size (parsed):', maxTeamSize);
    
    // Helper to calculate total including GST for the form
    const calculateTotalFee = (feeStr: string | undefined): string => {
        if (!feeStr) return "0";

        // If the string contains an '=' sign, extract strictly the part after it for the form
        if (feeStr.includes('=')) {
            const parts = feeStr.split('=');
            return parts[parts.length - 1].trim();
        }

        // Extract the base number (first number found)
        const baseMatch = feeStr.match(/\d+/);
        if (!baseMatch) return feeStr;
        
        const base = parseInt(baseMatch[0]);
        // If string contains '%', 'GST', or '+' we assume 18% GST needs to be added for the final total
        if (feeStr.toLowerCase().includes('gst') || feeStr.includes('18%') || feeStr.includes('+')) {
            const total = Math.round(base * 1.18);
            return `₹ ${total}`;
        }
        
        // If it's already a clean number, just add ₹
        return feeStr.includes('₹') ? feeStr.replace('₹', '₹ ') : `₹ ${feeStr}`;
    };

    const [formData, setFormData] = useState({
        email,
        eventId: selectedEvent?.id || '',
        eventName: selectedEvent?.title || 'General Pass',
        participationType: selectedEvent?.participationType || 'Solo',

        // Solo fields
        name: '',
        phone: '',
        college: '',
        department: '',
        degree: '',
        course: '',
        year: '',
        idCardUrl: '',

        // Team fields
        teamName: '',
        teamMembers: [{ name: '', phone: '' }],
        teamLeaderIdCardUrl: '',

        // Payment
        paymentScreenshotUrl: ''
    });

    const [uploadingIdCard, setUploadingIdCard] = useState(false);
    const [uploadingPayment, setUploadingPayment] = useState(false);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTeamMemberChange = (index: number, field: 'name' | 'phone', value: string) => {
        const updatedMembers = [...formData.teamMembers];
        updatedMembers[index][field] = value;
        setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
    };

    const addTeamMember = () => {
        if (formData.teamMembers.length < maxTeamSize) {
            setFormData(prev => ({
                ...prev,
                teamMembers: [...prev.teamMembers, { name: '', phone: '' }]
            }));
        }
    };

    const removeTeamMember = (index: number) => {
        if (formData.teamMembers.length > 1) {
            const updatedMembers = formData.teamMembers.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
        }
    };

    const uploadFile = async (file: File, type: 'idCard' | 'teamLeaderIdCard' | 'payment') => {
        if (!file) return;

        if (type === 'idCard') setUploadingIdCard(true);
        else if (type === 'teamLeaderIdCard') setUploadingIdCard(true);
        else setUploadingPayment(true);

        const data = new FormData();
        data.append('file', file);
        data.append('folder', 'registrations');

        try {
            const res = await fetch(`${config.API_URL}/upload`, {
                method: 'POST',
                body: data
            });
            const response = await res.json();

            if (response.success) {
                const fileUrl = response.data?.url || response.url;
                if (type === 'idCard') {
                    setFormData(prev => ({ ...prev, idCardUrl: fileUrl }));
                } else if (type === 'teamLeaderIdCard') {
                    setFormData(prev => ({ ...prev, teamLeaderIdCardUrl: fileUrl }));
                } else {
                    setFormData(prev => ({ ...prev, paymentScreenshotUrl: fileUrl }));
                }
            } else {
                alert("Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading file.");
        } finally {
            if (type === 'idCard' || type === 'teamLeaderIdCard') setUploadingIdCard(false);
            else setUploadingPayment(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isSoloEvent) {
            if (!formData.name || !formData.phone || !formData.college || !formData.department ||
                !formData.degree || !formData.course || !formData.year || !formData.idCardUrl ||
                !formData.paymentScreenshotUrl) {
                alert("Please fill all required fields for solo registration");
                return;
            }
        } else if (isTeamEvent) {
            if (!formData.teamName || !formData.college || !formData.department ||
                !formData.degree || !formData.course || !formData.year ||
                !formData.teamLeaderIdCardUrl || !formData.paymentScreenshotUrl) {
                alert("Please fill all required team fields");
                return;
            }

            const allMembersValid = formData.teamMembers.every(member => member.name && member.phone);
            if (!allMembersValid) {
                alert("Please fill all team member names and phone numbers");
                return;
            }
        }

        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md overflow-y-auto">
            <div className="w-full min-h-screen md:min-h-0 py-20 md:py-32 flex items-start md:items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0c0c0c] border-0 md:border-2 border-zinc-800 w-full sm:max-w-2xl md:max-w-3xl sm:mx-4 rounded-none sm:rounded-2xl shadow-2xl relative min-w-0 font-bricolage overflow-hidden"
                    style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
                >
                    <div className="p-5 md:p-8 border-b border-white/10 relative">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 md:top-8 md:right-8 text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-white/5 rounded-full border border-white/5"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        <h2 className="font-display text-xl md:text-3xl font-black text-white pr-12 tracking-tight uppercase">Complete Registration</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Event:</span>
                            <span className="font-black text-xs md:text-sm bg-gradient-to-b from-white via-[#C0C0C0] to-[#505050] bg-clip-text text-transparent uppercase tracking-tight leading-none">
                                {selectedEvent?.title || 'Festival Pass'}
                            </span>
                            {selectedEvent?.participationType && (
                                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold uppercase tracking-tighter">
                                    {selectedEvent.participationType}
                                </span>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-10">
                        {/* Premium Registration Fee Card */}
                        <div className="relative group overflow-hidden px-1">
                            {/* Animated Background Glows */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[60px]" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 blur-[60px]" />
                            
                            <div className="relative bg-[#0d0d0d]/80 backdrop-blur-2xl border-2 border-white/10 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
                                {/* Subtle Grid Pattern Overlay */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                
                                <div className="space-y-4 relative z-10 w-full md:w-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_20px_#A855F7] animate-pulse" />
                                            <div className="absolute inset-0 w-full h-full rounded-full bg-purple-500/50 animate-ping" />
                                        </div>
                                        <p className="text-[10px] md:text-xs font-black text-purple-400 uppercase tracking-[0.4em] drop-shadow-sm">Official Entry Fee</p>
                                    </div>
                                    
                                    <div className="relative inline-block">
                                        <h3 className="text-4xl md:text-7xl font-black bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent font-bricolage tracking-tighter leading-none py-1 drop-shadow-2xl">
                                            {calculateTotalFee(selectedEvent?.entryFee)}
                                        </h3>
                                        <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0" />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                            <span className="w-10 h-[1px] bg-zinc-800" />
                                            Valid for 1 {selectedEvent?.participationType === 'Solo' ? 'Person' : 'Team'}
                                        </p>
                                    </div>
                                </div>

                                {/* Premium Visual Element (Right Side) */}
                                <div className="hidden md:flex flex-col items-end text-right gap-4 relative z-10">
                                    <div className="relative group/icon">
                                        <div className="absolute -inset-4 bg-purple-500/20 blur-2xl rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
                                        <div className="relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/20 shadow-2xl transform group-hover/icon:scale-110 transition-all duration-500 backdrop-blur-xl">
                                            <FaCreditCard className="text-white text-4xl" />
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-2">
                                        <span>Official</span>
                                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                        <span>Secure</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isSoloEvent && (
                            <>
                                {/* Solo Event Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8 px-1">
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name *</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white focus:border-purple-500 focus:outline-none"
                                            value={formData.name || ''}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Mobile Number *</label>
                                        <input
                                            required
                                            type="tel"
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white focus:border-purple-500 focus:outline-none"
                                            value={formData.phone || ''}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address *</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                                            value={formData.email || ''}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">College Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter your college name"
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                                            value={formData.college || ''}
                                            onChange={(e) => handleChange('college', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Department *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: Computer Science"
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                                            value={formData.department || ''}
                                            onChange={(e) => handleChange('department', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Degree *</label>
                                        <select
                                            required
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white focus:border-purple-500 focus:outline-none"
                                            value={formData.degree || ''}
                                            onChange={(e) => handleChange('degree', e.target.value)}
                                        >
                                            <option value="">Select Degree</option>
                                            <option value="B.E/B.Tech">B.E / B.Tech</option>
                                            <option value="M.E/M.Tech">M.E / M.Tech</option>
                                            <option value="Arts & Science">Arts & Science</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Course / Branch *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: CSE, Mechanical, B.Com"
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                                            value={formData.course || ''}
                                            onChange={(e) => handleChange('course', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Year of Study *</label>
                                        <select
                                            required
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white focus:border-purple-500 focus:outline-none"
                                            value={formData.year || ''}
                                            onChange={(e) => handleChange('year', e.target.value)}
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">ID Card Upload *</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="id-upload"
                                                onChange={(e) => e.target.files && uploadFile(e.target.files[0], 'idCard')}
                                            />
                                            <label
                                                htmlFor="id-upload"
                                                className={`w-full flex items-center justify-center gap-2 p-4 md:p-5 border-2 border-dashed rounded-md cursor-pointer transition-colors ${formData.idCardUrl
                                                    ? 'border-green-500 bg-green-500/10 text-green-400'
                                                    : 'border-white/20 bg-[#111] hover:bg-white/5 text-gray-400'
                                                    }`}
                                            >
                                                {uploadingIdCard ? (
                                                    <span className="animate-pulse flex items-center gap-2 text-sm md:text-base"><FaSpinner size={18} className="animate-spin" /> Uploading...</span>
                                                ) : formData.idCardUrl ? (
                                                    <>
                                                        <FaCheck size={18} /> <span className="text-sm md:text-base">ID Card Uploaded</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaCloudUploadAlt size={20} /> <span className="text-sm md:text-base">Upload ID Card</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {isTeamEvent && (
                            <>
                                {/* Team Event Fields */}
                                <div className="grid grid-cols-1 gap-6 md:gap-10 px-1">
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Team Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter your team name"
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                                            value={formData.teamName || ''}
                                            onChange={(e) => handleChange('teamName', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                Team Members * ({formData.teamMembers.length}/{maxTeamSize})
                                            </label>
                                            {formData.teamMembers.length < maxTeamSize && (
                                                <button
                                                    type="button"
                                                    onClick={addTeamMember}
                                                    className="text-xs md:text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-md hover:bg-purple-500/30 flex items-center gap-1"
                                                >
                                                    <FaPlus size={12} /> Add Member
                                                </button>
                                            )}
                                        </div>

                                        {formData.teamMembers.map((member, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 bg-black/40 rounded-lg border border-white/5">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Member {index + 1} Name *</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="Full name"
                                                        className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                                                        value={member.name}
                                                        onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number *</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            required
                                                            type="tel"
                                                            placeholder="Phone number"
                                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                                                            value={member.phone}
                                                            onChange={(e) => handleTeamMemberChange(index, 'phone', e.target.value)}
                                                        />
                                                        {formData.teamMembers.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTeamMember(index)}
                                                                className="bg-red-500/20 text-red-400 px-3 rounded-md hover:bg-red-500/30"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Team Leader Email *</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="Enter team leader email"
                                            className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                                            value={formData.email || ''}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">College Name *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Enter college name"
                                                className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                                                value={formData.college || ''}
                                                onChange={(e) => handleChange('college', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Department *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Ex: Computer Science"
                                                className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                                                value={formData.department || ''}
                                                onChange={(e) => handleChange('department', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Degree *</label>
                                            <select
                                                required
                                                className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white focus:border-purple-500 focus:outline-none"
                                                value={formData.degree || ''}
                                                onChange={(e) => handleChange('degree', e.target.value)}
                                            >
                                                <option value="">Select Degree</option>
                                                <option value="B.E/B.Tech">B.E / B.Tech</option>
                                                <option value="M.E/M.Tech">M.E / M.Tech</option>
                                                <option value="Arts & Science">Arts & Science</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Course / Branch *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Ex: CSE, Mechanical"
                                                className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                                                value={formData.course || ''}
                                                onChange={(e) => handleChange('course', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Year of Study *</label>
                                            <select
                                                required
                                                className="w-full bg-[#1a1a1a] border-2 border-white/10 rounded-md p-2.5 md:p-3.5 text-sm md:text-base text-white focus:border-purple-500 focus:outline-none"
                                                value={formData.year || ''}
                                                onChange={(e) => handleChange('year', e.target.value)}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Team Leader ID Card *</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="team-leader-id-upload"
                                                onChange={(e) => e.target.files && uploadFile(e.target.files[0], 'teamLeaderIdCard')}
                                            />
                                            <label
                                                htmlFor="team-leader-id-upload"
                                                className={`w-full flex items-center justify-center gap-2 p-4 md:p-5 border-2 border-dashed rounded-md cursor-pointer transition-colors ${formData.teamLeaderIdCardUrl
                                                    ? 'border-green-500 bg-green-500/10 text-green-400'
                                                    : 'border-white/20 bg-[#111] hover:bg-white/5 text-gray-400'
                                                    }`}
                                            >
                                                {uploadingIdCard ? (
                                                    <span className="animate-pulse flex items-center gap-2 text-sm md:text-base"><FaSpinner size={18} className="animate-spin" /> Uploading...</span>
                                                ) : formData.teamLeaderIdCardUrl ? (
                                                    <>
                                                        <FaCheck size={18} /> <span className="text-sm md:text-base">ID Card Uploaded</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaCloudUploadAlt size={20} /> <span className="text-sm md:text-base">Upload Leader ID Card</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="grid grid-cols-1 gap-3 md:gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <FaCreditCard className="text-purple-500" /> Payment Details
                                </label>
                                <div className="bg-[#161616]/50 backdrop-blur-sm p-6 md:p-8 rounded-xl border-2 border-white/5 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Account Number</p>
                                            <p className="text-xl md:text-2xl font-black text-white font-bricolage tracking-tight leading-none">15330400000010</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1">IFSC Code</p>
                                            <p className="text-xl md:text-2xl font-black text-white font-bricolage tracking-tight leading-none">BARB0VJVELT</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Payment Screenshot *</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="pay-upload"
                                        onChange={(e) => e.target.files && uploadFile(e.target.files[0], 'payment')}
                                    />
                                    <label
                                        htmlFor="pay-upload"
                                        className={`w-full flex items-center justify-center gap-2 p-4 md:p-5 border-2 border-dashed rounded-md cursor-pointer transition-colors ${formData.paymentScreenshotUrl
                                            ? 'border-green-500 bg-green-500/10 text-green-400'
                                            : 'border-white/20 bg-[#111] hover:bg-white/5 text-gray-400'
                                            }`}
                                    >
                                        {uploadingPayment ? (
                                            <span className="animate-pulse flex items-center gap-2 text-sm md:text-base"><FaSpinner size={18} className="animate-spin" /> Uploading...</span>
                                        ) : formData.paymentScreenshotUrl ? (
                                            <>
                                                <FaCheck size={18} /> <span className="text-sm md:text-base">Screenshot Uploaded</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCloudUploadAlt size={20} /> <span className="text-sm md:text-base">Upload Screenshot</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={uploadingIdCard || uploadingPayment}
                            className="w-full bg-white text-black font-bold py-3.5 md:py-4 text-sm md:text-base rounded-md hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 active:scale-[0.98] touch-manipulation"
                        >
                            {uploadingIdCard || uploadingPayment ? 'Uploading Files...' : 'Submit Registration'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};
