import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DoctorsExplorer from '../components/DoctorsExplorer'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function HospitalDetails() {
  const { id } = useParams()
  const [hospital, setHospital] = useState(null)
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [hRes, cRes] = await Promise.all([
          fetch(`${baseUrl}/api/hospitals`),
          fetch(`${baseUrl}/api/clinics?hospital_id=${id}`)
        ])
        const hospitals = await hRes.json()
        const hospitalItem = hospitals.find(h => String(h.id) === String(id)) || null
        setHospital(hospitalItem)
        const clinicsData = cRes.ok ? await cRes.json() : []
        setClinics(clinicsData)
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
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 rtl:text-right">
        <p className="text-slate-600">المستشفى غير موجود.</p>
        <Link to="/" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold">عودة للرئيسية</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 rtl:text-right">
        <div className="mb-6 text-sm text-slate-600">
          <Link to="/" className="text-blue-600 hover:text-blue-700">الرئيسية</Link>
          <span className="mx-2">/</span>
          <span>{hospital.name}</span>
        </div>

        <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-5">
          <h2 className="text-2xl font-bold text-slate-800">{hospital.name}</h2>
          <p className="text-slate-600 mt-1">{hospital.city} • {hospital.phone || 'بدون هاتف'}</p>
          <p className="text-slate-600 mt-2">{hospital.address}</p>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">العيادات</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map(c => (
              <Link to={`/clinic/${c.id}`} key={c.id} className="block rounded-2xl border border-slate-200 p-5 hover:shadow-xl transition bg-white">
                <div className="font-semibold text-slate-800">{c.name}</div>
                <div className="text-sm text-slate-600 mt-1">التخصصات: {Array.isArray(c.specialties) ? c.specialties.join('، ') : '—'}</div>
              </Link>
            ))}
            {clinics.length === 0 && (
              <div className="col-span-full text-slate-500">لا توجد عيادات مرتبطة.</div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">استكشف الأطباء</h3>
          <DoctorsExplorer initialHospitalId={id} />
        </div>
      </div>
    </div>
  )
}
