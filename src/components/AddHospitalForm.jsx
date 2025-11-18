import { useState } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function AddHospitalForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const reset = () => {
    setName(''); setCity(''); setAddress(''); setPhone('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErr(''); setMsg('')
    try {
      const res = await fetch(`${baseUrl}/api/hospitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, city, address, phone: phone || undefined })
      })
      if (!res.ok) throw new Error('Failed to create hospital')
      setMsg('تمت إضافة المستشفى بنجاح')
      reset()
      // Notify other components to refresh
      window.dispatchEvent(new Event('refresh-hospitals'))
      setOpen(false)
    } catch (e) {
      console.error(e)
      setErr('تعذّر إضافة المستشفى. تأكد من الحقول وحاول مجددًا')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rtl:text-right">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setOpen(v => !v)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {open ? 'إخفاء النموذج' : 'إضافة مستشفى جديد'}
        </button>
        {msg && <span className="text-emerald-700 text-sm">{msg}</span>}
        {err && <span className="text-red-600 text-sm">{err}</span>}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-700">اسم المستشفى</label>
            <input value={name} onChange={e=>setName(e.target.value)} required className="px-3 py-2 border rounded-lg focus:outline-none focus:ring w-full" placeholder="مثال: مستشفى الشفاء" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-700">المدينة</label>
            <input value={city} onChange={e=>setCity(e.target.value)} required className="px-3 py-2 border rounded-lg focus:outline-none focus:ring w-full" placeholder="الرياض" />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm text-slate-700">العنوان</label>
            <input value={address} onChange={e=>setAddress(e.target.value)} required className="px-3 py-2 border rounded-lg focus:outline-none focus:ring w-full" placeholder="الحي، الشارع، أقرب معلم" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-700">الهاتف (اختياري)</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring w-full" placeholder="مثال: +9665xxxxxxx" />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button disabled={submitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'جاري الحفظ…' : 'حفظ المستشفى'}
            </button>
            <button type="button" onClick={() => { reset(); setOpen(false) }} className="px-4 py-2 rounded-lg border">
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
