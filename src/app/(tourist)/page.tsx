import Link from 'next/link'
import { getPopularChateaux, getAppellations } from '@/lib/db'
import { ChateauCard } from '@/components/chateau/ChateauCard'
import { AppellationCard } from '@/components/chateau/AppellationCard'

export default async function LandingPage() {
  const [popular, appellations] = await Promise.all([
    getPopularChateaux(3),
    getAppellations(),
  ])

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-[#5C1A1A] px-5 py-10 text-center">
        <p className="text-[10px] tracking-widest text-[#C4963A] uppercase mb-2">
          Bordeaux · 7,375 Châteaux
        </p>
        <h1 className="font-serif text-3xl font-bold text-white leading-tight mb-2">
          Your Perfect Wine Day<br />in Bordeaux
        </h1>
        <p className="text-sm text-[#EDE4CF] mb-6 leading-relaxed">
          Book any château in 3 minutes.<br />Transport included. AI recommends the perfect route.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center flex-wrap">
          {/* Flow A — AI Builder */}
          <Link
            href="/build"
            className="bg-[#C4963A] text-[#3D0F0F] font-semibold font-serif
                       px-6 py-3 rounded-lg text-sm hover:bg-[#D4A840] transition"
          >
            Build My Wine Day →
          </Link>
          {/* Flow C — Browse */}
          <Link
            href="/search"
            className="border border-white/40 text-white px-5 py-3 rounded-lg text-sm
                       hover:bg-white/10 transition"
          >
            Browse Châteaux
          </Link>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <div className="bg-[#3D0F0F] flex">
        {[
          { v: '4.3M', l: 'visitors/year' },
          { v: '€214', l: 'avg. spend' },
          { v: '7,375', l: 'châteaux' },
          { v: '★4.8', l: 'avg. rating' },
        ].map(s => (
          <div key={s.l} className="flex-1 text-center py-3 border-r border-white/10 last:border-r-0">
            <p className="font-serif font-bold text-[#C4963A] text-base">{s.v}</p>
            <p className="text-[9px] text-[#EDE4CF] mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* ── TRUST STRIP ──────────────────────────────────── */}
      <div className="bg-[#FAF6EE] flex border-b border-[#EDE4CF]">
        {[
          { b: 'No booking fee', s: 'Always on-site price' },
          { b: 'Free cancellation', s: 'Up to 48h before' },
          { b: 'Transport included', s: 'In every Bundle Pass' },
          { b: '7 languages', s: 'EN FR DE ES IT ZH JA' },
        ].map(t => (
          <div key={t.b} className="flex-1 text-center py-2 px-1 border-r border-[#EDE4CF] last:border-r-0">
            <p className="font-semibold text-[9px] text-[#5C1A1A]">{t.b}</p>
            <p className="text-[8px] text-[#8B6B6B] mt-0.5">{t.s}</p>
          </div>
        ))}
      </div>

      {/* ── POPULAR CHÂTEAUX (Flow B entry) ──────────────── */}
      <section className="bg-[#FAF6EE] px-4 py-4">
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-3">
          Popular châteaux
        </p>
        <div className="grid grid-cols-3 gap-2">
          {popular.map(ch => (
            <ChateauCard key={ch.id} chateau={ch} compact />
          ))}
        </div>
      </section>

      {/* ── APPELLATIONS (Flow D entry) ──────────────────── */}
      <section className="bg-[#FAF6EE] px-4 pb-6 pt-2">
        <p className="text-[9px] font-medium text-[#8B6B6B] uppercase tracking-wider mb-3">
          Explore by Appellation
        </p>
        <div className="grid grid-cols-2 gap-3">
          {appellations.slice(0, 4).map(a => (
            <AppellationCard key={a.id} appellation={a} />
          ))}
        </div>
        <Link
          href="/regions"
          className="block text-center text-[11px] text-[#5C1A1A] mt-3
                     py-2 border border-[#DDD0B3] rounded-lg bg-white"
        >
          All 6 Appellations →
        </Link>
      </section>
    </main>
  )
}
