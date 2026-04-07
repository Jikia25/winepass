import Link from 'next/link'

export default function GiftConfirmPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      {/* Success header */}
      <div className="bg-[#5C1A1A] px-4 py-6 text-center">
        <div className="w-12 h-12 bg-[#2E6B3E] rounded-full flex items-center justify-center
                        mx-auto mb-3 text-white text-2xl">✓</div>
        <h1 className="font-serif text-[16px] font-bold text-white mb-1">
          Gift Card გ-ა!
        </h1>
        <p className="text-[10px] text-[#EDE4CF]">
          მ-ის Email-ზე მი-ა — ბ-ის გ-ა ე-ბ.
        </p>
      </div>

      {/* Gift card display */}
      <div className="mx-3 mt-4 bg-[#3D0F0F] border border-[#C4963A]/40 rounded-xl p-4 text-center mb-3">
        <p className="text-[9px] text-[#C4963A] tracking-[0.12em] font-medium mb-2">
          WINEPASS · BORDEAUX · GIFT
        </p>
        <p className="text-[10px] text-[#EDE4CF] mb-1">To</p>
        <p className="font-serif text-[18px] font-bold text-white mb-2">Sophie</p>
        <p className="font-serif text-[40px] font-bold text-[#C4963A] leading-none mb-2">€80</p>
        <p className="text-[10px] text-[#EDE4CF] font-italic mb-3">
          "დ-დ-ის დ-ე გ-ა! ბ-ში ღვ-ის სრ-ი დ-ი გ-ა 🍷"
        </p>
        <div className="inline-block bg-[#C4963A]/15 border border-[#C4963A]/30
                        rounded-lg px-4 py-2 mb-1">
          <p className="font-mono text-[13px] font-medium text-white tracking-[0.08em]">
            WPG-2026-BRDX-7841
          </p>
        </div>
        <p className="text-[8px] text-white/30">Valid until May 2028</p>
      </div>

      {/* Upsell: book for yourself */}
      <div className="mx-3 mb-3 bg-[#EEEDFE] rounded-lg px-3 py-3">
        <p className="text-[10px] font-medium text-[#3C3489] mb-1">
          შ-ც გ-ა WinePass? ✨
        </p>
        <p className="text-[9px] text-[#534AB7] leading-relaxed mb-2">
          Gift card-ი მ-ა — შ-ი ა-ბ. Build My Wine Day-ს ← ი-ა ← ე-ად ი-ე!
        </p>
        <Link href="/build"
          className="text-[10px] text-[#534AB7] font-medium underline">
          Build My Wine Day →
        </Link>
      </div>

      {/* Actions */}
      <div className="px-3 pb-6 flex flex-col gap-2">
        <button className="w-full bg-[#5C1A1A] text-white py-2.5 rounded-[7px] text-[11px] font-serif">
          Email-ი გ-ა Sophie-ს ✓
        </button>
        <button className="w-full bg-white border border-[#DDD0B3] py-2.5 rounded-[7px]
                           text-[11px] text-[#5C1A1A]">
          PDF download (print version)
        </button>
        <Link href="/" className="text-center text-[10px] text-[#8B6B6B] underline py-2">
          ← მ-ი გ-ე
        </Link>
      </div>
    </div>
  )
}
