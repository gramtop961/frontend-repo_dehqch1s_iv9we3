import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function ClinicDetails() {
  const { id } = useParams()
  const [clinic, setClinic] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // No direct clinic-by-id endpoint, fetch via doctors then infer clinic
        const url = new URL(`${baseUrl}/api/doctors`)
        url.searchParams.set('clinic_id', id)
        const dRes = await fetch(url)
        const dData = dRes.ok ? await dRes.json() : []
        setDoctors(dData)
        // try to fetch clinic list by hospital if doctor exists
        if (dData.length > 0) {
          // We don't have hospital_id here, so just set a placeholder clinic name from doctor field if exists
          const inferred = { id, name: dData[0].clinic_name || 'العيادة', specialties: [] }
          setClinic(inferred)
        } else {
          setClinic({ id, name: 'العيادة', specialties: [] })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 rtl:text-right">
        <div className="mb-6 text-sm text-slate-600">
          <Link to="/" className="text-blue-600 hover:text-blue-700">الرئيسية</Link>
          <span className="mx-2">/</span>
          <span>{clinic?.name || 'العيادة'}</span>
        </div>

        <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-5">
          <h2 className="text-2xl font-bold text-slate-800">{clinic?.name || 'العيادة'}</h2>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">الأطباء</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(d => (
              <div key={d.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-xl transition-all p-5">
                <div className="rtl:text-right">
                  <h4 className="text-lg font-bold text-slate-800 mb-1">{d.name}</h4>
                  <p className="text-slate-600 text-sm">{d.specialty || 'غير محدد'}</p>
                  <div className="mt-3 text-xs text-slate-600">
                    <p className="font-semibold mb-1">أيام العمل:</p>
                    <p className="line-clamp-1">{Array.isArray(d.days_available) ? d.days_available.join('، ') : 'غير محدد'}</p>
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    <p className="font-semibold mb-1">المواعيد المتاحة:</p>
                    <p className="line-clamp-1">{Array.isArray(d.time_slots) ? d.time_slots.join('، ') : '—'}</p>
                  </div>
                </div>
              </div>
            ))}
            {doctors.length === 0 && (
              <div className="col-span-full text-slate-500">لا توجد بيانات للأطباء.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
