import { useEffect, useMemo, useState } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function DoctorsExplorer() {
  const [hospitals, setHospitals] = useState([])
  const [clinics, setClinics] = useState([])
  const [doctors, setDoctors] = useState([])

  const [selectedHospital, setSelectedHospital] = useState('')
  const [selectedClinic, setSelectedClinic] = useState('')
  const [specialty, setSpecialty] = useState('')

  const [loadingHospitals, setLoadingHospitals] = useState(true)
  const [loadingClinics, setLoadingClinics] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [error, setError] = useState('')

  // Load hospitals on mount
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/hospitals`)
        if (!res.ok) throw new Error('خطأ أثناء جلب المستشفيات')
        const data = await res.json()
        setHospitals(data)
      } catch (e) {
        console.error(e)
        setError('تعذر تحميل قائمة المستشفيات')
      } finally {
        setLoadingHospitals(false)
      }
    }
    loadHospitals()
  }, [])

  // When hospital changes, load clinics
  useEffect(() => {
    if (!selectedHospital) {
      setClinics([])
      setSelectedClinic('')
      return
    }
    const loadClinics = async () => {
      setLoadingClinics(true)
      setError('')
      try {
        const url = new URL(`${baseUrl}/api/clinics`)
        url.searchParams.set('hospital_id', selectedHospital)
        const res = await fetch(url)
        if (!res.ok) throw new Error('خطأ أثناء جلب العيادات')
        const data = await res.json()
        setClinics(data)
        // Reset clinic selection if not in list
        if (!data.find(c => c.id === selectedClinic)) {
          setSelectedClinic('')
        }
      } catch (e) {
        console.error(e)
        setError('تعذر تحميل قائمة العيادات')
      } finally {
        setLoadingClinics(false)
      }
    }
    loadClinics()
  }, [selectedHospital])

  // Load doctors when clinic or specialty changes
  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true)
      setError('')
      try {
        const url = new URL(`${baseUrl}/api/doctors`)
        if (selectedClinic) url.searchParams.set('clinic_id', selectedClinic)
        if (specialty) url.searchParams.set('specialty', specialty)
        const res = await fetch(url)
        if (!res.ok) throw new Error('خطأ أثناء جلب الأطباء')
        const data = await res.json()
        setDoctors(data)
      } catch (e) {
        console.error(e)
        setError('تعذر تحميل قائمة الأطباء')
      } finally {
        setLoadingDoctors(false)
      }
    }
    // Only fetch if at least clinic selected or specialty provided; otherwise try fetch all
    // We'll still fetch all doctors if neither is set, backend may support it
    loadDoctors()
  }, [selectedClinic, specialty])

  const specialtyOptions = useMemo(() => {
    // Build specialties list from current doctors if any, else from clinics meta if exists
    const set = new Set()
    doctors.forEach(d => d.specialty && set.add(d.specialty))
    return Array.from(set)
  }, [doctors])

  return (
    <section className="mt-12">
      <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-4 sm:p-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 rtl:text-right">
            <label className="text-sm text-slate-600">اختر المستشفى</label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 rtl:text-right">
            <label className="text-sm text-slate-600">اختر العيادة</label>
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedHospital || loadingClinics}
            >
              <option value="">{loadingClinics ? 'جارِ التحميل…' : 'الكل'}</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 rtl:text-right">
            <label className="text-sm text-slate-600">التخصص</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="مثل: قلب، أسنان، أطفال"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                list="specialty-list"
              />
              <datalist id="specialty-list">
                {specialtyOptions.map(sp => (
                  <option key={sp} value={sp} />
                ))}
              </datalist>
              <button
                onClick={() => setSpecialty('')}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >مسح</button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}
          {loadingHospitals && (
            <div className="text-slate-500">جارِ تحميل المستشفيات…</div>
          )}
          <DoctorsGrid doctors={doctors} loading={loadingDoctors} />
        </div>
      </div>
    </section>
  )
}

function DoctorsGrid({ doctors, loading }) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }
  if (!doctors || doctors.length === 0) {
    return <div className="text-slate-500 text-center">لا توجد نتائج مطابقة</div>
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map(d => (
        <div key={d.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-xl transition-all">
          <div className="p-5 rtl:text-right">
            <h3 className="text-lg font-bold text-slate-800 mb-1">{d.name}</h3>
            <p className="text-slate-600 text-sm">{d.specialty || 'غير محدد'}</p>
            <div className="mt-3 text-xs text-slate-600">
              <p className="font-semibold mb-1">أيام العمل:</p>
              <p className="line-clamp-1">{Array.isArray(d.days_available) ? d.days_available.join('، ') : 'غير محدد'}</p>
            </div>
            <div className="mt-3 text-xs text-slate-600">
              <p className="font-semibold mb-1">المواعيد المتاحة:</p>
              <p className="line-clamp-1">{Array.isArray(d.time_slots) ? d.time_slots.join('، ') : '—'}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                حجز سريع
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
