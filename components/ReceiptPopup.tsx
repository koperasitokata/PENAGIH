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

const ReceiptPopup: React.FC<ReceiptPopupProps> = ({
  record,
  nasabah,
  amountPaid,
  photo,
  date,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    const element = document.getElementById('receipt-card');

    if (!element) {
      alert("Elemen struk tidak ditemukan");
      setIsGenerating(false);
      return;
    }

    try {
      // tunggu render stabil
      await new Promise(resolve => setTimeout(resolve, 300));

      // tunggu semua gambar load
      const images = element.getElementsByTagName('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        logging: false,
        onclone: (clonedDoc) => {
          const cloned = clonedDoc.getElementById('receipt-card');
          if (cloned) {
            cloned.style.transform = 'none';
            cloned.style.borderRadius = '0';
          }
        }
      });

      // 🔥 paksa JPG
      const image = canvas.toDataURL('image/jpeg', 0.8);

      const fileName = `STRUK-${nasabah.nama.replace(/\s+/g, '_')}-${Date.now()}.jpg`;

      const link = document.createElement('a');
      link.href = image;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

    } catch (err) {
      console.error("Gagal generate struk", err);

      // fallback tetap JPG (bukan print)
      try {
        const canvas = await html2canvas(element, {
          scale: 1,
          backgroundColor: '#ffffff'
        });

        const image = canvas.toDataURL('image/jpeg', 0.6);

        const link = document.createElement('a');
        link.href = image;
        link.download = `STRUK-${Date.now()}.jpg`;
        link.click();

      } catch (e) {
        alert("Gagal total, silakan screenshot manual");
      }
    }

    setIsGenerating(false);
  };

  const timestampStr = new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        id="receipt-card"
        className="bg-white w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative max-h-[90vh] overflow-y-auto"
      >
        {/* HEADER */}
        <div
          className="p-4 text-white flex flex-col items-center gap-1"
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
        <div className="p-5 flex-1 space-y-4 bg-white">
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
              <span className="text-gray-500">Nasabah</span>
              <span className="font-bold">{nasabah.nama}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">ID Pinjam</span>
              <span className="font-bold">{record.id_pinjaman}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Waktu</span>
              <span className="font-bold">{timestampStr}</span>
            </div>

            <div className="border-t border-dashed my-2"></div>

            <div className="flex justify-between">
              <span className="text-gray-500">Sisa</span>
              <span className="text-red-600 font-bold">
                Rp {record.sisa_hutang.toLocaleString()}
              </span>
            </div>
          </div>

          {photo && (
            <img
              src={photo}
              alt="Bukti"
              className="w-full h-36 object-cover rounded-xl"
              crossOrigin="anonymous"
            />
          )}

          <div className="flex flex-col items-center gap-2 pt-2">
            <QrCode size={32} />
            <p className="text-[8px] text-center">
              Terima kasih atas pembayaran Anda
            </p>
          </div>
        </div>

        {/* BUTTON */}
        <div
          className="p-4 bg-gray-50 flex gap-2"
          data-html2canvas-ignore="true"
        >
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {isGenerating ? 'Memproses...' : 'Download'}
          </button>

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
