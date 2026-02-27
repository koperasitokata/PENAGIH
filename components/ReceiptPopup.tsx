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
      setIsGenerating(false);
      return;
    }

    try {
      // tunggu render stabil
      await new Promise(res => setTimeout(res, 300));

      // tunggu gambar load
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
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        logging: false,
        onclone: (doc) => {
          const el = doc.getElementById('receipt-card');
          if (el) el.style.borderRadius = '0';
        }
      });

      const fileName = `STRUK-${nasabah.nama.replace(/\s+/g, '_')}-${Date.now()}.jpg`;

      // 🔥 CONVERT KE FILE
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Gagal membuat gambar");
          setIsGenerating(false);
          return;
        }

        const file = new File([blob], fileName, { type: 'image/jpeg' });

        // 🔥 PRIORITAS: SHARE (WhatsApp, dll)
        if (navigator.share && navigator.canShare) {
          try {
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'Struk Pembayaran',
                text: `Struk pembayaran: ${nasabah.nama}`
              });

              setIsGenerating(false);
              return;
            }
          } catch (err) {
            console.log("Share dibatalkan / gagal", err);
          }
        }

        // 🔥 FALLBACK: DOWNLOAD JPG
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);

      }, 'image/jpeg', 0.9);

    } catch (err) {
      console.error("Gagal generate struk", err);
      alert("Gagal membuat gambar, coba screenshot saja.");
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
        className="bg-white w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-4 text-white flex flex-col items-center gap-1 bg-indigo-600">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="font-black text-sm uppercase">Setoran Berhasil</h2>
          <p className="text-[8px] opacity-70">
            {APP_CONFIG.APP_NAME} {APP_CONFIG.APP_TAGLINE}
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Struk Pembayaran</p>
            <p className="text-xl font-bold">
              Rp {amountPaid.toLocaleString()}
            </p>
          </div>

          <div className="text-sm space-y-2">
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
              <span>Rp {record.sisa_hutang.toLocaleString()}</span>
            </div>
          </div>

          {photo && (
            <img
              src={photo}
              crossOrigin="anonymous"
              className="w-full h-32 object-cover rounded-xl"
            />
          )}

          <div className="flex flex-col items-center gap-2">
            <QrCode size={32} />
            <p className="text-xs text-center">
              Terima kasih atas pembayaran Anda
            </p>
          </div>
        </div>

        <div className="p-4 flex gap-2 bg-gray-50" data-html2canvas-ignore="true">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isGenerating ? 'Memproses...' : 'Simpan / Share'}
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
