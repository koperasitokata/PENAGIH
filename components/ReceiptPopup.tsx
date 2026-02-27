import React, { useState } from 'react';
import { PinjamanAktif, Nasabah } from '../types';
import html2canvas from 'html2canvas';
import { CheckCircle2, X, Loader2, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../src/config';

interface ReceiptPopupProps {
  record: PinjamanAktif;
  nasabah: Nasabah;
  amountPaid: number;
  photo?: string;
  date: string | Date;
  onClose: () => void;
}

const ReceiptPopup: React.FC<ReceiptPopupProps> = ({ record, nasabah, amountPaid, photo, date, onClose }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    const element = document.getElementById('receipt-card');

    if (element) {
      try {
        // pastikan gambar sudah load
        const images = element.getElementsByTagName('img');
        await Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        }));

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.95)
        );

        if (!blob) throw new Error('Gagal buat gambar');

        const file = new File(
          [blob],
          `STRUK-${nasabah.nama.replace(/\s+/g, '-')}.jpg`,
          { type: 'image/jpeg' }
        );

        // ✅ SHARE (WA, Telegram, dll)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Struk Pembayaran',
            text: `Struk pembayaran ${nasabah.nama}`
          });
        } else {
          // fallback terakhir
          window.print();
        }

      } catch (err) {
        console.error(err);
        alert('Gagal share, gunakan print atau screenshot.');
        window.print();
      }
    } else {
      window.print();
    }

    setIsSharing(false);
  };

  const timestampStr = new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md print:p-0 print:bg-white">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        id="receipt-card" 
        className="bg-white w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl flex flex-col print:shadow-none print:rounded-none print:max-w-none relative max-h-[90vh] overflow-y-auto"
      >

        {/* HEADER */}
        <div 
          className="p-4 text-white flex flex-col items-center gap-1 print:bg-white print:text-black print:border-b print:border-black"
          style={{ background: 'linear-gradient(to right, #4f46e5, #2563eb)' }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="font-black text-sm tracking-[0.2em] uppercase">
            Setoran Berhasil
          </h2>
          <p className="text-[8px] font-bold opacity-70 tracking-widest">
            {APP_CONFIG.APP_NAME} {APP_CONFIG.APP_TAGLINE}
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4">

          <div className="text-center space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Struk Pembayaran Angsuran
            </p>
            <p className="text-xl font-black">
              Rp {amountPaid.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between">
              <span>Nasabah</span>
              <span className="font-bold">{nasabah.nama}</span>
            </div>
            <div className="flex justify-between">
              <span>ID Pinjam</span>
              <span>{record.id_pinjaman}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu</span>
              <span>{timestampStr}</span>
            </div>
            <div className="flex justify-between">
              <span>Sisa</span>
              <span className="text-red-600 font-bold">
                Rp {record.sisa_hutang.toLocaleString()}
              </span>
            </div>
          </div>

          {photo && (
            <div>
              <img src={photo} className="w-full rounded-xl" />
            </div>
          )}

          {/* ❌ QR CODE DIHAPUS */}
        </div>

        {/* BUTTON */}
        <div className="p-4 bg-gray-50 flex gap-2 print:hidden">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2"
          >
            {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
            {isSharing ? 'Memproses...' : 'Bagikan'}
          </motion.button>

          <button 
            onClick={onClose}
            className="w-12 bg-white border rounded-xl flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default ReceiptPopup;
