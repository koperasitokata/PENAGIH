import React from 'react';
import { PinjamanAktif, Nasabah } from '../types';
import html2canvas from 'html2canvas';
import { CheckCircle2, X } from 'lucide-react';
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

  const handlePrintImage = async () => {
    const element = document.getElementById('receipt-card');

    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // 👉 ubah ke JPG
      const image = canvas.toDataURL('image/jpeg', 0.95);

      // 👉 buka di tab baru (biar bisa save ke galeri)
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`
          <html>
            <head>
              <title>Struk</title>
            </head>
            <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center;">
              <img src="${image}" style="max-width:100%; height:auto;" />
            </body>
          </html>
        `);
      }

    } catch (err) {
      alert('Gagal membuat gambar, coba screenshot manual.');
      console.error(err);
    }
  };

  const timestampStr = new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80">

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        id="receipt-card"
        className="bg-white w-full max-w-[260px] rounded-2xl shadow-xl overflow-hidden text-black"
      >

        {/* HEADER */}
        <div className="p-3 text-center border-b">
          <div className="flex justify-center mb-1">
            <CheckCircle2 size={20} />
          </div>
          <h2 className="text-xs font-bold">SETORAN BERHASIL</h2>
          <p className="text-[8px]">
            {APP_CONFIG.APP_NAME}
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-3 space-y-3 text-[10px]">

          <div className="text-center">
            <p className="text-[8px]">Pembayaran</p>
            <p className="text-lg font-bold">
              Rp {amountPaid.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1 font-mono">

            <div className="flex justify-between">
              <span>Nasabah</span>
              <span>{nasabah.nama}</span>
            </div>

            <div className="flex justify-between">
              <span>ID</span>
              <span>{record.id_pinjaman}</span>
            </div>

            <div className="flex justify-between">
              <span>Waktu</span>
              <span>{timestampStr}</span>
            </div>

            <div className="flex justify-between">
              <span>Sisa</span>
              <span className="font-bold">
                Rp {record.sisa_hutang.toLocaleString()}
              </span>
            </div>

          </div>

          {photo && (
            <img src={photo} className="w-full rounded-lg" />
          )}

          <p className="text-center text-[8px]">
            Terima kasih
          </p>
        </div>

        {/* BUTTON */}
        <div className="p-2 flex gap-2 border-t">

          <button 
            onClick={handlePrintImage}
            className="flex-1 bg-black text-white py-2 rounded-lg text-[10px]"
          >
            Simpan Gambar
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
