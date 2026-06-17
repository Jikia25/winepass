'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Addon {
  id: string
  name_en: string
  name_fr: string
  price: number
  price_type: 'per_person' | 'per_booking'
  is_active: boolean
}

interface FormState {
  name_en: string; name_fr: string
  price: string; price_type: 'per_person' | 'per_booking'
}
const EMPTY: FormState = { name_en: '', name_fr: '', price: '', price_type: 'per_person' }

async function apiFetch(url: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}`, ...((options?.headers ?? {}) as Record<string, string>) },
  })
}

export default function AddonsPage() {
  const router  = useRouter()
  const [chateau, setChateau] = useState<{ name: string } | null>(null)
  const [addons,  setAddons]  = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId,  setEditId]  = useState<string | null>(null)
  const [form,    setForm]    = useState<FormState>(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')

  const load = useCallback(async () => {
    const res = await apiFetch('/api/owner/addons')
    if (res.status === 401 || res.status === 403) { router.push('/login'); return }
    setAddons(await res.json())
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
  function openEdit(a: Addon) {
    setEditId(a.id)
    setForm({ name_en: a.name_en, name_fr: a.name_fr, price: String(a.price), price_type: a.price_type })
    setErr(''); setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditId(null); setForm(EMPTY) }

  async function handleSave() {
    if (!form.name_en.trim() || !form.name_fr.trim() || !form.price) { setErr('Name (EN/FR) and price are required'); return }
    setSaving(true); setErr('')
    const body = { name_en: form.name_en.trim(), name_fr: form.name_fr.trim(), price: Number(form.price), price_type: form.price_type }
    const res = editId
      ? await apiFetch(`/api/owner/addons/${editId}`, { method: 'PUT', body: JSON.stringify(body) })
      : await apiFetch('/api/owner/addons', { method: 'POST', body: JSON.stringify(body) })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); setErr(d.error ?? 'Save failed'); return }
    closeForm(); await load()
  }

  async function handleToggle(a: Addon) {
    setAddons(prev => prev.map(x => x.id === a.id ? { ...x, is_active: !a.is_active } : x))
    const res = await apiFetch(`/api/owner/addons/${a.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !a.is_active }) })
    if (!res.ok) setAddons(prev => prev.map(x => x.id === a.id ? { ...x, is_active: a.is_active } : x))
  }

  async function handleDelete(a: Addon) {
    if (!confirm(`Delete "${a.name_en}"?`)) return
    await apiFetch(`/api/owner/addons/${a.id}`, { method: 'DELETE' })
    setAddons(prev => prev.filter(x => x.id !== a.id))
  }

  const f = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }))

  if (loading) return <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center"><div className="w-8 h-8 border-2 border-t-[#5C1A1A] rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#FAF6EE]">
      <div className="bg-[#3D0F0F] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-white/60 hover:text-white text-[16px]">←</Link>
        <div>
          <p className="font-serif text-[15px] font-bold text-white">Add-ons</p>
          {chateau && <p className="text-[9px] text-[#C4963A]">{chateau.name}</p>}
        </div>
        <button onClick={openNew}
          className="ml-auto text-[10px] bg-[#C4963A] text-[#3D0F0F] px-3 py-1.5 rounded-lg font-medium">
          + New
        </button>
      </div>

      <div className="px-4 pt-3 pb-1">
        <p className="text-[9px] text-[#8B6B6B] leading-relaxed">
          Add-ons are optional extras shown to tourists during booking. The Transport add-on was created automatically — update its price here.
        </p>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">
        {showForm && (
          <div className="bg-white border border-[#C4963A] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-medium text-[#1C0A0A]">{editId ? 'Edit Add-on' : 'New Add-on'}</p>
              <button onClick={closeForm} className="text-[#8B6B6B] text-[16px] leading-none">×</button>
            </div>
            {err && <p className="text-[10px] text-[#A32D2D] bg-[#FCEBEB] rounded px-3 py-2 mb-3">{err}</p>}

            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Name (EN) *</p>
                <input value={form.name_en} onChange={e => f('name_en', e.target.value)} placeholder="Transport from Bordeaux"
                  className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]" />
              </div>
              <div className="flex-1">
                <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Name (FR) *</p>
                <input value={form.name_fr} onChange={e => f('name_fr', e.target.value)} placeholder="Transport depuis Bordeaux"
                  className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]" />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Price (€) *</p>
                <input type="number" min={0} step={1} value={form.price} onChange={e => f('price', e.target.value)}
                  className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A]" />
              </div>
              <div className="flex-1">
                <p className="text-[8px] text-[#8B6B6B] uppercase tracking-wider mb-1">Pricing type</p>
                <select value={form.price_type} onChange={e => f('price_type', e.target.value)}
                  className="w-full border border-[#DDD0B3] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#5C1A1A] bg-white">
                  <option value="per_person">Per person</option>
                  <option value="per_booking">Per booking</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={closeForm} className="flex-1 border border-[#DDD0B3] rounded-lg py-2.5 text-[11px] text-[#8B6B6B]">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className={`flex-1 py-2.5 rounded-lg text-[11px] font-serif font-medium transition ${saving ? 'bg-[#5C1A1A]/30 text-white/50' : 'bg-[#5C1A1A] text-white'}`}>
                {saving ? 'Saving…' : (editId ? 'Update' : 'Create Add-on')}
              </button>
            </div>
          </div>
        )}

        {addons.length === 0 && !showForm && (
          <div className="bg-white border border-[#DDD0B3] rounded-xl p-8 text-center">
            <p className="text-[13px] text-[#8B6B6B] mb-2">No add-ons yet</p>
            <button onClick={openNew} className="bg-[#5C1A1A] text-white px-4 py-2 rounded-lg text-[11px] font-serif">Create Add-on</button>
          </div>
        )}

        {addons.map(a => (
          <div key={a.id} className="bg-white border border-[#DDD0B3] rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-medium text-[#1C0A0A] truncate">{a.name_en}</p>
                  {!a.is_active && <span className="text-[8px] bg-[#F5F0E8] text-[#8B6B6B] px-1.5 py-0.5 rounded-full flex-shrink-0">inactive</span>}
                  {a.price === 0 && a.is_active && <span className="text-[8px] bg-[#FAEEDA] text-[#854F0B] px-1.5 py-0.5 rounded-full flex-shrink-0">set price</span>}
                </div>
                <p className="text-[9px] text-[#8B6B6B]">{a.name_fr}</p>
                <p className="text-[10px] text-[#5C1A1A] mt-1 font-medium">
                  €{a.price} {a.price_type === 'per_person' ? 'per person' : 'per booking'}
                </p>
              </div>
              <button onClick={() => handleToggle(a)}
                className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ml-3 ${a.is_active ? 'bg-[#2E6B3E]' : 'bg-[#DDD0B3]'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${a.is_active ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#F5F0E8]">
              <button onClick={() => openEdit(a)}
                className="flex-1 text-[10px] text-[#5C1A1A] border border-[#DDD0B3] rounded-lg py-1.5 hover:bg-[#FAF6EE] transition">
                Edit
              </button>
              <button onClick={() => handleDelete(a)}
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
