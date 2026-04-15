'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function GiftConfirmPage() {
  const { tr, lang } = useLanguage()
  const g = tr.gift
  const qrRef = useRef<HTMLCanvasElement>(null)

  const code      = typeof window !== 'undefined' ? sessionStorage.getItem('gc_code')      ?? 'WPG-2026-BRDX-7841' : 'WPG-2026-BRDX-7841'
  const amount    = typeof window !== 'undefined' ? sessionStorage.getItem('gc_amount')    ?? '80' : '80'
  const recipient = typeof window !== 'undefined' ? sessionStorage.getItem('gc_recipient') ?? 'Sophie' : 'Sophie'
  const occasion  = typeof window !== 'undefined' ? sessionStorage.getItem('gc_occasion')  ?? '' : ''

  const redeemUrl = `https://winepass-gbyp.vercel.app/redeem/${code}`

  useEffect(() => {
    if (!qrRef.current) return
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(qrRef.current, redeemUrl, {
        width: 120,
        margin: 1,
        color: { dark: '#3D0F0F', light: '#FFF8EC' }
      })
    })
  }, [])

  async function downloadPDF() {
    const { jsPDF } = await import('jspdf')
    const QRCode = await import('qrcode')

    const qrDataUrl = await QRCode.toDataURL(redeemUrl, {
      width: 200, margin: 1,
      color: { dark: '#3D0F0F', light: '#FFF8EC' }
    })

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })

    doc.setFillColor(61, 15, 15)
    doc.rect(0, 0, 148, 210, 'F')
    doc.setDrawColor(196, 150, 58)
    doc.setLineWidth(1)
    doc.rect(8, 8, 132, 194)

    doc.setTextColor(196, 150, 58)
    doc.setFontSize(9)
    doc.text('WINEPASS · BORDEAUX · GIFT', 74, 22, { align: 'center' })

    doc.setFontSize(36)
    doc.setTextColor(255, 255, 255)
    doc.text(`€${amount}`, 74, 50, { align: 'center' })

    doc.setFontSize(9)
    doc.setTextColor(237, 228, 207)
    doc.text(lang === 'fr' ? `Pour: ${recipient}` : `For: ${recipient}`, 74, 60, { align: 'center' })
    if (occasion) doc.text(occasion, 74, 67, { align: 'center' })

    // QR code
    doc.addImage(qrDataUrl, 'PNG', 49, 72, 50, 50)

    // Code box
    doc.setFillColor(196, 150, 58, 0.1)
    doc.setDrawColor(196, 150, 58)
    doc.roundedRect(20, 126, 108, 12, 2, 2, 'FD')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text(code, 74, 134, { align: 'center' })

    doc.setFontSize(8)
    doc.setTextColor(196, 150, 58)
    doc.text(lang === 'fr' ? 'Scannez pour réserver votre visite' : 'Scan to book your château visit', 74, 146, { align: 'center' })

    doc.setFontSize(8)
    doc.setTextColor(237, 228, 207)
    doc.text('Tasting · Transport · Bordeaux', 74, 158, { align: 'center' })
    doc.text(lang === 'fr' ? 'Valable 2 ans · Sans frais' : 'Valid 2 years · No expiry fees', 74, 165, { align: 'center' })

    doc.setTextColor(196, 150, 58)
    doc.setFontSize(7)
    doc.text('winepass-gbyp.vercel.app', 74, 195, { align: 'center' })

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
        {occasion && <p className="text-[9px] text-[#EDE4CF] mb-2">{occasion} · {recipient}</p>}

        {/* QR Code */}
        <div className="flex justify-center mb-3">
          <div className="bg-[#FFF8EC] rounded-lg p-2">
            <canvas ref={qrRef} className="w-[100px] h-[100px]" />
          </div>
        </div>

        <div className="inline-block bg-[#C4963A]/15 border border-[#C4963A]/30 rounded-lg px-4 py-2 mb-1">
          <p className="font-mono text-[13px] font-medium text-white tracking-[0.08em]">{code}</p>
        </div>
        <p className="text-[8px] text-white/30 mt-1">{g.validity}</p>
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
          ↓ {g.pdfDownload}
        </button>
        <Link href="/" className="text-center text-[10px] text-[#8B6B6B] underline py-2">← Home</Link>
      </div>
    </div>
  )
}
