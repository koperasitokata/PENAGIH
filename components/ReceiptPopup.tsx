import React, { useState } from 'react';
import { PinjamanAktif, Nasabah } from '../types';
import html2canvas from 'html2canvas';
import { CheckCircle2, Download, X, QrCode, Loader2 } from 'lucide-react';
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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    const element = document.getElementById('receipt-card');

    if (!element) {
      setIsGenerating(false);
      return;
    }

    try {
      // Tunggu render stabil
      await new Promise(resolve => setTimeout(resolve, 300));

      // Pastikan semua gambar sudah load
      const images = element.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // jangan reject biar tetap lanjut
        });
      }));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('receipt-card');
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.borderRadius = '0';
          }
        }
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `STRUK-${nasabah.nama.replace(/\s+/g, '-')}-${Date.now()}.jpg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Gagal generate struk", err);
      alert("Gagal menyimpan gambar. Silakan coba lagi atau screenshot.");
    }

    setIsGenerating(false);
  };

  const timestampStr = new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm print:p-0 print:bg-white">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        id="receipt-card" 
        className="bg-white w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl flex flex-col print:shadow-none print:rounded-none print:max-w-none relative max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#ffffff', color: '#111827' }}
      >
        <div 
          className="p-4 text-white flex flex-col items-center gap-1 print:bg-white print:text-black print:border-b print:border-black"
          style={{ background: 'linear-gradient(to right, #4f46e5, #2563eb)' }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="font-black text-sm tracking-[0.2em] uppercase">Setoran Berhasil</h2>
          <p className="text-[8px] font-bold opacity-70 tracking-widest">
            {APP_CONFIG.APP_NAME} {APP_CONFIG.APP_TAGLINE}
          </p>
        </div>

        {/* FIX: HAPUS background external */}
        <div className="p-5 flex-1 space-y-4 print:p-4" style={{ backgroundColor: '#ffffff' }}>
          <div className="text-center space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
              Struk Pembayaran Angsuran
            </p>
            <p className="text-xl font-black tracking-tighter" style={{ color: '#111827' }}>
              Rp {amountPaid.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[1px] flex-1" style={{ backgroundColor: '#e5e7eb' }}></span>
              <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: '#d1d5db' }}>
                Detail Transaksi
              </span>
              <span className="h-[1px] flex-1" style={{ backgroundColor: '#e5e7eb' }}></span>
            </div>
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between text-[10px]">
              <span style={{ color: '#6b7280' }}>Nasabah</span>
              <span className="font-bold">{nasabah.nama}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span style={{ color: '#6b7280' }}>ID Pinjam</span>
              <span className="font-bold">{record.id_pinjaman}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span style={{ color: '#6b7280' }}>Waktu Bayar</span>
              <span className="font-bold">{timestampStr}</span>
            </div>

            <div className="border-t border-dashed my-2"></div>

            <div className="flex justify-between text-[10px]">
              <span style={{ color: '#6b7280' }}>Sisa Tagihan</span>
              <span className="font-black text-red-600">
                Rp {record.sisa_hutang.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span style={{ color: '#6b7280' }}>Ref ID</span>
              <span>#{nasabah.nik.slice(-8)}</span>
            </div>
          </div>

          {photo && (
            <div className="pt-2">
              <img
                src={photo}
                alt="Bukti"
                className="w-full h-36 object-cover rounded-xl"
                crossOrigin="anonymous"
              />
            </div>
          )}

          <div className="flex flex-col items-center gap-2 pt-2">
            <QrCode size={32} />
            <p className="text-[8px] text-center">
              Terima Kasih Atas Pembayaran Anda
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex gap-2 print:hidden" data-html2canvas-ignore="true">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isGenerating ? 'Memproses...' : 'Download'}
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-12 bg-white border rounded-xl flex items-center justify-center"
          >
            <X size={18} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReceiptPopup;
