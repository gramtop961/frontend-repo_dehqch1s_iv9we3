import { useEffect, useState, useMemo, useCallback } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function HospitalGrid({ query }) {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    if (!query) return hospitals
    const q = query.toLowerCase()
    return hospitals.filter(h => (
      h.name?.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q) ||
      h.address?.toLowerCase().includes(q)
    ))
  }, [query, hospitals])

  const fetchHospitals = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${baseUrl}/api/hospitals`)
      const data = await res.json()
      setHospitals(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setError('تعذّر جلب قائمة المستشفيات. حاول مجددًا.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHospitals()
  }, [fetchHospitals])

  const handleSeed = async () => {
    setSeeding(true)
    setError('')
    try {
      await fetch(`${baseUrl}/api/seed`, { method: 'POST' })
      await fetchHospitals()
    } catch (e) {
      console.error(e)
      setError('تعذّر تحميل البيانات التجريبية.')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!loading && hospitals.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-slate-600">لا توجد مستشفيات بعد. يبدو أن قاعدة البيانات فارغة.</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {seeding ? 'جاري تحميل البيانات…' : 'تحميل بيانات تجريبية'}
        </button>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map(h => (
        <div key={h.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-xl transition-all">
          <div className="p-5 rtl:text-right">
            <h3 className="text-lg font-bold text-slate-800 mb-1">{h.name}</h3>
            <p className="text-slate-600 text-sm">{h.city} • {h.phone || 'بدون هاتف'}</p>
            <p className="text-slate-500 text-sm mt-2 line-clamp-2">{h.address}</p>
            <a href={`/hospital/${h.id}`} className="inline-flex mt-4 text-blue-600 hover:text-blue-700 font-semibold">تفاصيل العيادات</a>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="col-span-full text-center text-slate-500">لا توجد نتائج مطابقة</div>
      )}
    </div>
  )
}
