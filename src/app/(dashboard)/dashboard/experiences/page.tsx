'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Exp {
  id: string
  name_en: string
  name_fr: string
  description_en: string | null
  description_fr: string | null
  price_per_person: number
  duration_minutes: number
  max_guests: number
  is_active: boolean
}

const EMPTY: FormState = { name_en: '', name_fr: '', description_en: '', description_fr: '', price_per_person: '', duration_minutes: '90', max_guests: '12' }

interface FormState {
  name_en: string; name_fr: string
  description_en: string; description_fr: string
  price_per_person: string; duration_minutes: string; max_guests: string
}

async function apiFetch(url: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}`, ...((options?.headers ?? {}) as Record<string, string>) },
  })
}

export default function ExperiencesPage() {
  const router = useRouter()
  const [chateau,     setChateau]    = useState<{ name: string } | null>(null)
  const [experiences, setExperiences] = useState<Exp[]>([])
  const [loading,     setLoading]    = useState(true)
  const [showForm,    setShowForm]   = useState(false)
  const [editId,      setEditId]     = useState<string | null>(null)
  const [form,        setForm]       = useState<FormState>(EMPTY)
  const [saving,      setSaving]     = useState(false)
  const [err,         setErr]        = useState('')

  const load = useCallback(async () => {
    const res = await apiFetch('/api/owner/experiences')
    if (res.status === 401 || res.status === 403) { router.push('/login'); return }
    setExperiences(await res.json())
  }, [router])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: ch } = await supabase.from('chateaux').select('name').eq('owner_id', data.user.id).single()
      setChateau(ch)
      await load()
      setLoading(false)
    })
  }, [router, load])

  function openNew() { setEditId(null); setForm(EMPTY); setErr(''); setShowForm(true) }
  function openEdit(e: Exp) {
    setEditId(e.id)
    setForm({
      name_en: e.name_en, name_fr: e.name_fr,
      description_en: e.description_en ?? '', description_fr: e.description_fr ?? '',
      price_per_person: String(e.price_per_person),
      duration_minutes: String(e.duration_minutes),
      max_guests: String(e.max_guests),
    })
    setErr('')
    setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditId(null); setForm(EMPTY) }

  async function handleSave() {
    if (!form.name_en.trim() || !form.name_fr.trim() || !form.price_per_person) { setErr('Name (EN/FR) and price are required'); return }
    setSaving(true); setErr('')
    const body = {
      name_en:          form.name_en.trim(),
      name_fr:          form.name_fr.trim(),
      description_en:   form.description_en.trim() || null,
      description_fr:   form.description_fr.trim() || null,
      price_per_person: Number(form.price_per_person),
      duration_minutes: Number(form.duration_minutes) || 90,
      max_guests:       Number(form.max_guests) || 12,
    }
    const res = editId
      ? await apiFetch(`/api/owner/experiences/${editId}`, { method: 'PUT', body: JSON.stringify(body) })
      : await apiFetch('/api/owner/experiences', { method: 'POST', body: JSON.stringify(body) })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); setErr(d.error ?? 'Save failed'); return }
    closeForm(); await load()
  }

  async function handleToggle(e: Exp) {
    setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, is_active: !e.is_active } : x))
    const res = await apiFetch(`/api/owner/experiences/${e.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !e.is_active }) })
    if (!res.ok) setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, is_active: e.is_active } : x))
  }

  async function handleDelete(e: Exp) {
    if (!confirm(`Delete "${e.name_en}"? This cannot be undone.`)) return
    await apiFetch(`/api/owner/experiences/${e.id}`, { method: 'DELETE' })
    setExperiences(prev => prev.filter(x => x.id !== e.id))
  }

  const f = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }))

  if (loading) return <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center"><div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-white/60 hover:text-white text-[16px]">←</Link>
        <div>
          <p className="font-serif text-[15px] font-bold text-white">Experiences</p>
          {chateau && <p className="text-[9px] text-[#C4963A]">{chateau.name}</p>}
        </div>
        <button onClick={openNew}
          className="ml-auto text-[10px] bg-[#C4963A] text-[#3D0F0F] px-3 py-1.5 rounded-lg font-medium">
          + New
        </button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        {showForm && (
          <div className="bg-white border border-[#C4963A] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-medium text-[#1C0A0A]">{editId ? 'Edit Experience' : 'New Experience'}</p>
              <button onClick={closeForm} className="text-[#8B6B6B] text-[16px] leading-none">×</button>
            </div>

            {err && <p className="text-[10px] text-[#A32D2D] bg-[#FCEBEB] rounded px-3 py-2 mb-3">{err}</p>}

            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Name (EN) *</p>
                <input value={form.name_en} onChange={e => f('name_en', e.target.value)} placeholder="Classic Wine Tour"
                  className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]" />
              </div>
              <div className="flex-1">
                <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Name (FR) *</p>
                <input value={form.name_fr} onChange={e => f('name_fr', e.target.value)} placeholder="Visite Classique"
                  className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]" />
              </div>
            </div>

            <div className="mb-2">
              <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Description (EN)</p>
              <textarea value={form.description_en} onChange={e => f('description_en', e.target.value)} rows={2}
                placeholder="A guided tour of the cellar with a 3-wine tasting..."
                className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A] resize-none" />
            </div>
            <div className="mb-3">
              <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Description (FR)</p>
              <textarea value={form.description_fr} onChange={e => f('description_fr', e.target.value)} rows={2}
                placeholder="Une visite guidee du chai avec une degustation de 3 vins..."
                className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A] resize-none" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Price/person (€) *</p>
                <input type="number" min={1} value={form.price_per_person} onChange={e => f('price_per_person', e.target.value)}
                  className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]" />
              </div>
              <div>
                <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Duration (min)</p>
                <input type="number" min={30} step={15} value={form.duration_minutes} onChange={e => f('duration_minutes', e.target.value)}
                  className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]" />
              </div>
              <div>
                <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Max guests</p>
                <input type="number" min={1} max={100} value={form.max_guests} onChange={e => f('max_guests', e.target.value)}
                  className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={closeForm} className="flex-1 border border-[#DDD0B3] rounded-lg py-2.5 text-[11px] text-[#8B6B6B]">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className={`flex-1 py-2.5 rounded-lg text-[11px] font-serif font-medium transition ${saving ? 'bg-[#5C1A1A]/30 text-white/50' : 'bg-[#5C1A1A] text-white'}`}>
                {saving ? 'Saving…' : (editId ? 'Update' : 'Create Experience')}
              </button>
            </div>
          </div>
        )}

        {experiences.length === 0 && !showForm && (
          <div className="bg-white border border-[#DDD0B3] rounded-xl p-8 text-center">
            <p className="text-[13px] text-[#8B6B6B] mb-2">No experiences yet</p>
            <p className="text-[10px] text-[#DDD0B3] mb-4">Create your first experience to start accepting bookings.</p>
            <button onClick={openNew} className="bg-[#5C1A1A] text-white px-4 py-2 rounded-lg text-[11px] font-serif">Create Experience</button>
          </div>
        )}

        {experiences.map(exp => (
          <div key={exp.id} className="bg-white border border-[#DDD0B3] rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-medium text-[#1C0A0A] truncate">{exp.name_en}</p>
                  {!exp.is_active && <span className="text-[8px] bg-[#F5F0E8] text-[#8B6B6B] px-1.5 py-0.5 rounded-full flex-shrink-0">inactive</span>}
                </div>
                <p className="text-[9px] text-[#8B6B6B]">{exp.name_fr}</p>
                <p className="text-[10px] text-[#5C1A1A] mt-1 font-medium">
                  €{exp.price_per_person}/person · {exp.duration_minutes} min · {exp.max_guests} guests max
                </p>
              </div>
              <button
                onClick={() => handleToggle(exp)}
                className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ml-3 ${exp.is_active ? 'bg-[#2E6B3E]' : 'bg-[#DDD0B3]'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${exp.is_active ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            {(exp.description_en) && (
              <p className="text-[10px] text-[#8B6B6B] leading-relaxed mb-2 line-clamp-2">{exp.description_en}</p>
            )}
            <div className="flex gap-2 pt-2 border-t border-[#F5F0E8]">
              <button onClick={() => openEdit(exp)}
                className="flex-1 text-[10px] text-[#5C1A1A] border border-[#DDD0B3] rounded-lg py-1.5 hover:bg-[#FAF6EE] transition">
                Edit
              </button>
              <button onClick={() => handleDelete(exp)}
                className="text-[10px] text-[#A32D2D] border border-[#A32D2D]/30 rounded-lg px-3 py-1.5 hover:bg-[#FCEBEB] transition">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
