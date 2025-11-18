import { useEffect, useState, useMemo } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function HospitalGrid({ query }) {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)

  const filtered = useMemo(() => {
    if (!query) return hospitals
    const q = query.toLowerCase()
    return hospitals.filter(h => (
      h.name?.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q) ||
      h.address?.toLowerCase().includes(q)
    ))
  }, [query, hospitals])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/hospitals`)
        const data = await res.json()
        setHospitals(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
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
            <a href={`/#hospital-${h.id}`} className="inline-flex mt-4 text-blue-600 hover:text-blue-700 font-semibold">تفاصيل العيادات</a>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="col-span-full text-center text-slate-500">لا توجد نتائج مطابقة</div>
      )}
    </div>
  )
}
