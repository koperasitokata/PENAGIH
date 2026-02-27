import React, { useState } from 'react';
import { PinjamanAktif, Nasabah } from '../types';
import html2canvas from 'html2canvas';
import { CheckCircle2, X, Loader2 } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScreenshot = async () => {
    setIsProcessing(true);

    const element = document.getElementById('receipt-card');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const image = canvas.toDataURL('image/jpeg', 0.95);

      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`
          <html>
            <head><title>Struk</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
              <img src="${image}" style="max-width:100%;height:auto;" />
            </body>
          </html>
        `);
      }

    } catch (err) {
      alert('Gagal screenshot');
      console.error(err);
    }

    setIsProcessing(false);
  };

  const timestampStr = new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        id="receipt-card"
        className="bg-white w-full max-w-[300px] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >

        {/* HEADER */}
        <div className="p-4 text-center">
          <div className="flex justify-center mb-1">
            <CheckCircle2 size={20} />
          </div>
          <h2 className="text-xs font-bold">SETORAN BERHASIL</h2>
          <p className="text-[8px]">{APP_CONFIG.APP_NAME}</p>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-2 text-[10px]">

          <div className="text-center space-y-0.5">
            <p className="text-[8px]">Pembayaran</p>
            <p className="text-lg font-bold">
              Rp {amountPaid.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1 font-mono">

            <div className="flex justify-between leading-tight">
              <span>Nasabah</span>
              <span>{nasabah.nama}</span>
            </div>

            <div className="flex justify-between leading-tight">
              <span>ID</span>
              <span>{record.id_pinjaman}</span>
            </div>

            <div className="flex justify-between leading-tight">
              <span>Waktu</span>
              <span>{timestampStr}</span>
            </div>

            <div className="flex justify-between leading-tight">
              <span>Sisa</span>
              <span className="font-bold">
                Rp {record.sisa_hutang.toLocaleString()}
              </span>
            </div>

          </div>

          {photo && (
            <div className="pt-1">
              <img 
                src={photo} 
                className="w-full h-28 object-cover rounded-lg"  // ✅ DIPERKECIL DI SINI
              />
            </div>
          )}

          <p className="text-center text-[8px] leading-tight">
            Terima kasih atas pembayaran Anda
          </p>
        </div>

        {/* BUTTON */}
        <div className="p-3 flex gap-2 border-t">

          <button 
            onClick={handleScreenshot}
            disabled={isProcessing}
            className="flex-1 bg-black text-white py-2 rounded-lg text-[10px] flex items-center justify-center gap-1"
          >
            {isProcessing ? <Loader2 size={12} className="animate-spin" /> : 'Screenshot'}
          </button>

          <button 
            onClick={onClose}
            className="w-10 border rounded-lg flex items-center justify-center"
          >
            <X size={14} />
          </button>

        </div>

      </motion.div>
    </div>
  );
};

export default ReceiptPopup;
