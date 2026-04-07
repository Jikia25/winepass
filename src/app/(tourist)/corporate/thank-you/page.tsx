import Link from 'next/link'

export default function CorporateThankYouPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="px-4 py-10 text-center">
        <div className="w-12 h-12 bg-[#EAF3DE] rounded-full flex items-center justify-center
                        mx-auto mb-4 text-[#2E6B3E] text-2xl">✓</div>
        <h1 className="font-serif text-[16px] font-medium text-[#1C0A0A] mb-2">
          შ-ი მ-ი-ა!
        </h1>
        <p className="text-[11px] text-[#8B6B6B] mb-6 leading-relaxed">
          გ. 24 სთ-ში sales@winepass.fr-დ. ი-ა.
        </p>

        <div className="bg-white border border-[#DDD0B3] rounded-xl px-4 py-4 text-left mb-4">
          <p className="text-[10px] font-medium text-[#5C1A1A] mb-3">შემ. ნ-ბ-ები</p>
          {[
            { n: 1, t: '24h-ში WinePass-ის გ-ა', s: 'შ-ი + ბ-ი-ს ე-ა' },
            { n: 2, t: 'ვ-ი call / ვ-ი ბ-ბ-ა',  s: '30 წ. ← details' },
            { n: 3, t: 'Custom proposal',           s: '48h-ში PDF quote' },
            { n: 4, t: 'Booking + payment',          s: 'Invoice or card' },
          ].map(step => (
            <div key={step.n}
              className="flex gap-3 items-start py-2.5 border-b border-[#EDE4CF] last:border-b-0">
              <div className="w-5 h-5 rounded-full bg-[#5C1A1A] text-white flex items-center
                              justify-center text-[9px] flex-shrink-0 mt-0.5">
                {step.n}
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#1C0A0A]">{step.t}</p>
                <p className="text-[9px] text-[#8B6B6B] mt-0.5">{step.s}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="/" className="text-[11px] text-[#8B6B6B] underline">
          ← მ-ი გ-ე
        </Link>
      </div>
    </div>
  )
}
