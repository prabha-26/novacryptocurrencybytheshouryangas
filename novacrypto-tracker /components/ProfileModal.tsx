import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { X, User, Mail, Calendar, Save, Loader2, Camera, Trash2, Smartphone, CreditCard, Building2, FileBadge } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [mobile, setMobile] = useState(user.mobile || '');
  const [avatar, setAvatar] = useState<string | undefined>(user.avatar);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
      setMobile(user.mobile || '');
      setAvatar(user.avatar);
      setError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 500 * 1024) {
            setError("Image size must be less than 500KB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setAvatar(result);
            setError(null);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mobile.length !== 10 || isNaN(Number(mobile))) {
          throw new Error("Mobile number must be 10 digits");
      }
      await onUpdate({ name, email, avatar, mobile });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar backdrop-blur-xl">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">User Profile</h3>
            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col - Avatar */}
                <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-36 h-36 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-xl shadow-emerald-500/20 overflow-hidden">
                            <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border-4 border-white/50 dark:border-slate-900/50 overflow-hidden relative backdrop-blur-sm">
                                {avatar ? (
                                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-bold text-slate-700 dark:text-slate-200">{name.charAt(0).toUpperCase()}</span>
                                )}
                                
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Camera className="w-8 h-8 text-white/90" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute 0 bottom-1 right-1 bg-white dark:bg-slate-700 rounded-full p-2.5 shadow-md border border-slate-100 dark:border-slate-600">
                            <Camera className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        </div>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />

                    <div className="mt-6 flex flex-col gap-2 w-full">
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-500/10"
                        >
                            Change Photo
                        </button>
                        {avatar && (
                            <button 
                                type="button" 
                                onClick={handleRemoveAvatar}
                                className="px-4 py-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center border border-red-500/10"
                            >
                                <Trash2 className="w-3 h-3 mr-1" /> Remove
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Col - Form */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/50 dark:border-slate-700/50 pb-2 mb-4">Personal Details</h4>
                        
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                            </div>

                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">Mobile Number</label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        type="text"
                                        value={mobile}
                                        maxLength={10}
                                        onChange={(e) => setMobile(e.target.value)}
                                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/50 dark:border-slate-700/50 pb-2 mb-4">Banking Information</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">Account Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        value={user.accountNumber || 'Generating...'}
                                        disabled
                                        className="w-full bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 font-mono font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">IFSC Code</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        value={user.ifsc || 'NOVA0001234'}
                                        disabled
                                        className="w-full bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 font-mono font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">PAN Card</label>
                                <div className="relative">
                                    <FileBadge className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        value={user.panCard || 'Generating...'}
                                        disabled
                                        className="w-full bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 font-mono font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center text-xs text-slate-400 justify-center font-medium">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        Member since {new Date(user.joinedAt).toLocaleDateString()}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs text-center font-bold animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
                    </button>
                </div>
            </div>
        </form>
      </div>
     </div>
  );
};

export default ProfileModal;