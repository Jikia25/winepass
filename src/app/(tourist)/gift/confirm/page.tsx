'use client'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function GiftConfirmPage() {
  const { tr, lang } = useLanguage()
  const g = tr.gift

  const code = typeof window !== 'undefined' ? sessionStorage.getItem('gc_code') ?? 'WPG-2026-BRDX-7841' : 'WPG-2026-BRDX-7841'
  const amount = typeof window !== 'undefined' ? sessionStorage.getItem('gc_amount') ?? '80' : '80'
  const recipient = typeof window !== 'undefined' ? sessionStorage.getItem('gc_recipient') ?? 'Sophie' : 'Sophie'

  async function downloadPDF() {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })

    // Background
    doc.setFillColor(61, 15, 15)
    doc.rect(0, 0, 148, 210, 'F')

    // Gold border
    doc.setDrawColor(196, 150, 58)
    doc.setLineWidth(1)
    doc.rect(8, 8, 132, 194)

    // Header
    doc.setTextColor(196, 150, 58)
    doc.setFontSize(10)
    doc.text('WINEPASS · BORDEAUX · GIFT', 74, 28, { align: 'center' })

    // Amount
    doc.setFontSize(48)
    doc.setTextColor(255, 255, 255)
    doc.text(`€${amount}`, 74, 72, { align: 'center' })

    // Code box
    doc.setFillColor(196, 150, 58, 0.15)
    doc.setDrawColor(196, 150, 58)
    doc.roundedRect(24, 82, 100, 16, 3, 3, 'FD')
    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.text(code, 74, 93, { align: 'center' })

    // Details
    doc.setFontSize(9)
    doc.setTextColor(237, 228, 207)
    doc.text(lang === 'fr' ? `Pour: ${recipient}` : `For: ${recipient}`, 74, 115, { align: 'center' })
    doc.text(lang === 'fr' ? 'Tasting · Transport · Bordeaux' : 'Tasting · Transport · Bordeaux', 74, 124, { align: 'center' })
    doc.text(lang === 'fr' ? 'Valable 2 ans · Sans frais d\'expiration' : 'Valid 2 years · No expiry fees', 74, 133, { align: 'center' })

    // Footer
    doc.setTextColor(196, 150, 58)
    doc.setFontSize(8)
    doc.text('winepass.fr · hello@winepass.fr', 74, 190, { align: 'center' })

    doc.save(`WinePass-Gift-${code}.pdf`)
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#5C1A1A] px-4 py-6 text-center">
        <div className="w-12 h-12 bg-[#2E6B3E] rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl">✓</div>
        <h1 className="font-serif text-[16px] font-bold text-white mb-1">{g.confirmTitle}</h1>
        <p className="text-[10px] text-[#EDE4CF]">{g.confirmSub}</p>
      </div>
      <div className="mx-3 mt-4 bg-[#3D0F0F] border border-[#C4963A]/40 rounded-xl p-4 text-center mb-3">
        <p className="text-[9px] text-[#C4963A] tracking-[0.12em] font-medium mb-2">WINEPASS · BORDEAUX · GIFT</p>
        <p className="font-serif text-[40px] font-bold text-[#C4963A] leading-none mb-2">€{amount}</p>
        <div className="inline-block bg-[#C4963A]/15 border border-[#C4963A]/30 rounded-lg px-4 py-2 mb-1">
          <p className="font-mono text-[13px] font-medium text-white tracking-[0.08em]">{code}</p>
        </div>
        <p className="text-[8px] text-white/30">{g.validity}</p>
      </div>
      <div className="mx-3 mb-3 bg-[#EEEDFE] rounded-lg px-3 py-3">
        <p className="text-[9px] text-[#534AB7] leading-relaxed mb-2">
          {lang === 'fr' ? 'Vous aussi vous voulez vivre WinePass ? ✨' : 'Also want to experience WinePass? ✨'}
        </p>
        <Link href="/build" className="text-[10px] text-[#534AB7] font-medium underline">
          {lang === 'fr' ? 'Créer Ma Journée Vin →' : 'Build My Wine Day →'}
        </Link>
      </div>
      <div className="px-3 pb-6 flex flex-col gap-2">
        <button className="w-full bg-[#5C1A1A] text-white py-2.5 rounded-[7px] text-[11px] font-serif">
          {g.sendEmail(recipient)}
        </button>
        <button onClick={downloadPDF}
          className="w-full bg-white border border-[#DDD0B3] py-2.5 rounded-[7px] text-[11px] text-[#5C1A1A] hover:bg-[#FAF6EE] transition">
          {g.pdfDownload}
        </button>
        <Link href="/" className="text-center text-[10px] text-[#8B6B6B] underline py-2">← Home</Link>
      </div>
    </div>
  )
}
