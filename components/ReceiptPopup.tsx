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
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      const element = document.getElementById('receipt-card');
      if (!element) throw new Error('Element tidak ditemukan');

      // 🔥 FIX 1: clone element supaya tidak kena scroll / animasi
      const cloned = element.cloneNode(true) as HTMLElement;
      cloned.style.position = 'fixed';
      cloned.style.top = '0';
      cloned.style.left = '0';
      cloned.style.width = '320px';
      cloned.style.zIndex = '99999';
      cloned.style.transform = 'none';
      cloned.style.maxHeight = 'none';
      cloned.style.overflow = 'visible';
      cloned.style.background = '#ffffff';

      document.body.appendChild(cloned);

      // 🔥 FIX 2: tunggu render stabil
      await new Promise((r) => setTimeout(r, 500));

      // 🔥 FIX 3: tunggu semua gambar
      const images = cloned.getElementsByTagName('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // 🔥 FIX 4: render canvas aman
      const canvas = await html2canvas(cloned, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 400,
      });

      // 🔥 FIX 5: convert lebih stabil
      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      } catch {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.95)
        );

        if (!blob) throw new Error('Gagal convert blob');

        dataUrl = URL.createObjectURL(blob);
      }

      // 🔥 FIX 6: download aman
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `STRUK-${nasabah.nama.replace(/\s+/g, '-')}-${Date.now()}.jpg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // cleanup blob url
      if (dataUrl.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
      }

      // hapus clone
      document.body.removeChild(cloned);

    } catch (err) {
      console.error('ERROR DOWNLOAD:', err);
      alert('Gagal menyimpan gambar. Coba ulang atau screenshot.');
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
        className="bg-white w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
      >
        <div className="p-4 text-white flex flex-col items-center gap-1 bg-gradient-to-r from-indigo-600 to-blue-600">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="font-black text-sm uppercase tracking-widest">
            Setoran Berhasil
          </h2>
          <p className="text-[8px] opacity-70">
            {APP_CONFIG.APP_NAME} {APP_CONFIG.APP_TAGLINE}
          </p>
        </div>

        <div className="p-5 space-y-4 bg-white">
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Struk Pembayaran Angsuran
            </p>
            <p className="text-xl font-bold">
              Rp {amountPaid.toLocaleString()}
            </p>
          </div>

          <div className="text-xs space-y-1">
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
            <div className="flex justify-between text-red-600 font-bold">
              <span>Sisa</span>
              <span>Rp {record.sisa_hutang.toLocaleString()}</span>
            </div>
          </div>

          {photo && (
            <img
              src={photo}
              className="w-full h-36 object-cover rounded"
              crossOrigin="anonymous"
            />
          )}

          <div className="flex flex-col items-center gap-2">
            <QrCode size={32} />
            <p className="text-xs text-center">
              Terima kasih atas pembayaran Anda
            </p>
          </div>
        </div>

        <div className="p-4 flex gap-2 bg-gray-50">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-indigo-600 text-white py-2 rounded flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Download size={14} />
            )}
            {isGenerating ? 'Memproses...' : 'Download'}
          </button>

          <button
            onClick={onClose}
            className="w-12 border rounded flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReceiptPopup;
