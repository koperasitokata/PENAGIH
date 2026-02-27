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

    if (!element || typeof html2canvas === 'undefined') {
      window.print();
      setIsGenerating(false);
      return;
    }

    try {
      // 🔥 tunggu render stabil
      await new Promise(resolve => setTimeout(resolve, 300));

      // 🔥 pastikan semua gambar load
      const images = element.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true, // 🔥 ini penting dari kode yang WORK
        backgroundColor: '#ffffff',
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('receipt-card');
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.borderRadius = '0';
          }
        }
      });

      const fileName = `STRUK-${nasabah.nama.replace(/\s+/g, '_')}-${Date.now()}.png`;

      // 🔥 SUPPORT SHARE (HP)
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], fileName, { type: 'image/png' });

            if (navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  files: [file],
                  title: 'Struk Pembayaran',
                  text: `Struk pembayaran ${nasabah.nama}`
                });
                setIsGenerating(false);
                return;
              } catch (err) {
                console.log("Share dibatalkan / gagal", err);
              }
            }
          }

          triggerDownload(canvas, fileName);
        }, 'image/png');
      } else {
        triggerDownload(canvas, fileName);
      }

    } catch (err) {
      console.error("Gagal generate struk", err);
      alert("Gagal menyimpan gambar. Akan dialihkan ke print.");
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerDownload = (canvas: HTMLCanvasElement, fileName: string) => {
    const image = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement('a');
    link.href = image;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
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

        <div className="p-5 flex-1 space-y-4 print:p-4" style={{ backgroundColor: '#ffffff' }}>
          <div className="text-center space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Struk Pembayaran Angsuran
            </p>
            <p className="text-xl font-black tracking-tighter">
              Rp {amountPaid.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Nasabah</span>
              <span className="font-bold">{nasabah.nama}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">ID Pinjam</span>
              <span className="font-bold">{record.id_pinjaman}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Waktu Bayar</span>
              <span className="font-bold">{timestampStr}</span>
            </div>

            <div className="border-t border-dashed my-2"></div>

            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Sisa Tagihan</span>
              <span className="font-black text-red-600">
                Rp {record.sisa_hutang.toLocaleString()}
              </span>
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
