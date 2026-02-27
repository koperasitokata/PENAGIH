
import React, { useState, useRef } from 'react';
import { PetugasProfile } from '../types';
import { X, Camera, Edit2, LogOut, User, Phone, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSettingsProps {
  petugas: PetugasProfile;
  onSave: (profile: PetugasProfile) => void;
  onLogout: () => void;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ petugas, onSave, onLogout, onClose }) => {
  const [photo, setPhoto] = useState<string | null>(petugas.foto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400; 
          const scaleSize = MAX_WIDTH / img.width;
          
          const targetWidth = scaleSize < 1 ? MAX_WIDTH : img.width;
          const targetHeight = scaleSize < 1 ? img.height * scaleSize : img.height;
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.imageSmoothingEnabled = true;
             ctx.imageSmoothingQuality = 'high';
             ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
             setPhoto(canvas.toDataURL('image/jpeg', 0.6));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ ...petugas, foto: photo || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden"
      >
        <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-black text-sm uppercase tracking-widest text-emerald-400">Identitas Petugas</h3>
          <button onClick={onClose} className="text-white/40">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-[2rem] bg-white/5 border-2 border-dashed border-emerald-400/30 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-white/10 transition-all relative group"
            >
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera size={32} className="text-white/20" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Edit2 size={20} className="text-white" />
              </div>
            </div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Petugas ID: {petugas.id_petugas}</p>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
               <User size={16} className="text-emerald-400" />
               <div>
                  <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">Nama</p>
                  <p className="text-xs font-bold text-white">{petugas.nama}</p>
               </div>
            </div>
            
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
               <Phone size={16} className="text-emerald-400" />
               <div>
                  <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">No. HP</p>
                  <p className="text-xs font-bold text-white">{petugas.no_hp}</p>
               </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
               <Shield size={16} className="text-emerald-400" />
               <div>
                  <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">Jabatan</p>
                  <p className="text-xs font-bold text-white">{petugas.jabatan}</p>
               </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all"
            >
              Update Foto Profil
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Logout / Ganti Akun
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
