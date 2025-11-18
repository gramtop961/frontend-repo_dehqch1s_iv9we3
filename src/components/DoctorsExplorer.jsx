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

  // Booking modal state
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [selectedDate, setSelectedDate] = useState('') // yyyy-mm-dd
  const [selectedSlot, setSelectedSlot] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])
  const [bookingStatus, setBookingStatus] = useState('idle') // idle | loading | success | error
  const [bookingMessage, setBookingMessage] = useState('')

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
    loadDoctors()
  }, [selectedClinic, specialty])

  const specialtyOptions = useMemo(() => {
    const set = new Set()
    doctors.forEach(d => d.specialty && set.add(d.specialty))
    return Array.from(set)
  }, [doctors])

  // Booking helpers
  const openBooking = (doctor) => {
    setBookingDoctor(doctor)
    setPatientName('')
    setPatientPhone('')
    setSelectedDate('')
    setSelectedSlot('')
    setBookedSlots([])
    setBookingStatus('idle')
    setBookingMessage('')
    setBookingOpen(true)
  }

  // fetch taken slots when date changes
  useEffect(() => {
    const fetchTaken = async () => {
      if (!bookingDoctor || !selectedDate) return
      try {
        const url = new URL(`${baseUrl}/api/appointments`)
        url.searchParams.set('doctor_id', bookingDoctor.id)
        url.searchParams.set('date', selectedDate)
        const res = await fetch(url)
        if (!res.ok) throw new Error('تعذر جلب المواعيد المحجوزة')
        const data = await res.json()
        setBookedSlots(data.map(a => a.time_slot))
      } catch (e) {
        console.error(e)
        setBookedSlots([])
      }
    }
    fetchTaken()
  }, [bookingDoctor, selectedDate])

  const handleConfirmBooking = async () => {
    if (!bookingDoctor || !patientName || !patientPhone || !selectedDate || !selectedSlot) {
      setBookingStatus('error')
      setBookingMessage('يرجى إدخال جميع البيانات المطلوبة')
      return
    }
    setBookingStatus('loading')
    setBookingMessage('')
    try {
      const res = await fetch(`${baseUrl}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName,
          patient_phone: patientPhone,
          doctor_id: bookingDoctor.id,
          date: selectedDate,
          time_slot: selectedSlot,
        })
      })
      if (res.status === 409) {
        setBookingStatus('error')
        setBookingMessage('عذرًا، هذا الموعد تم حجزه للتو. الرجاء اختيار وقت آخر.')
        // refresh taken slots
        const url = new URL(`${baseUrl}/api/appointments`)
        url.searchParams.set('doctor_id', bookingDoctor.id)
        url.searchParams.set('date', selectedDate)
        const again = await fetch(url)
        if (again.ok) {
          const data = await again.json()
          setBookedSlots(data.map(a => a.time_slot))
        }
        return
      }
      if (!res.ok) throw new Error('فشل إنشاء الحجز')
      const data = await res.json()
      setBookingStatus('success')
      setBookingMessage('تم إنشاء الحجز بنجاح! رقم المرجع: ' + (data.id || ''))
      // mark the slot as booked locally
      setBookedSlots(prev => Array.from(new Set([...prev, selectedSlot])))
    } catch (e) {
      console.error(e)
      setBookingStatus('error')
      setBookingMessage('حدث خطأ غير متوقع. حاول مرة أخرى.')
    }
  }

  const disablePastDate = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const isSlotTaken = (slot) => bookedSlots.includes(slot)

  const dayNameFromDate = (dateStr) => {
    try {
      const d = new Date(dateStr)
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days[d.getDay()]
    } catch {
      return ''
    }
  }

  const isDayAllowed = (dateStr, doctor) => {
    if (!dateStr || !doctor || !Array.isArray(doctor.days_available)) return true
    const dayName = dayNameFromDate(dateStr)
    // accept Arabic or English matches (simple contains)
    const normalized = doctor.days_available.map(x => String(x).toLowerCase())
    return normalized.some(x => x.includes(dayName.toLowerCase()) ||
      (dayName === 'Sunday' && x.includes('الأحد')) ||
      (dayName === 'Monday' && x.includes('الاثنين')) ||
      (dayName === 'Tuesday' && (x.includes('الثلاثاء') || x.includes('الثلاثا'))) ||
      (dayName === 'Wednesday' && x.includes('الأربع')) ||
      (dayName === 'Thursday' && x.includes('الخميس')) ||
      (dayName === 'Friday' && x.includes('الجمعة')) ||
      (dayName === 'Saturday' && x.includes('السبت'))
    )
  }

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
          <DoctorsGrid doctors={doctors} loading={loadingDoctors} onQuickBook={openBooking} />
        </div>
      </div>

      {bookingOpen && bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setBookingOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-5 sm:p-6 rtl:text-right">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">حجز سريع — {bookingDoctor.name}</h3>
                <p className="text-sm text-slate-600">التخصص: {bookingDoctor.specialty || 'غير محدد'}</p>
              </div>
              <button className="text-slate-500 hover:text-slate-700" onClick={() => setBookingOpen(false)}>إغلاق</button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-600">اسم المريض</label>
                <input value={patientName} onChange={e => setPatientName(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="أدخل الاسم الكامل" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-600">رقم الجوال</label>
                <input value={patientPhone} onChange={e => setPatientPhone(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="05xxxxxxxx" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-600">التاريخ</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={disablePastDate()} className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {selectedDate && !isDayAllowed(selectedDate, bookingDoctor) && (
                  <p className="text-xs text-amber-600">تنبيه: يبدو أن هذا اليوم خارج أيام عمل الطبيب.</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-600">الوقت</label>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(bookingDoctor.time_slots) ? bookingDoctor.time_slots : []).map(slot => {
                    const taken = isSlotTaken(slot)
                    const selected = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={taken || !selectedDate}
                        className={`px-3 py-2 rounded-xl border text-sm transition ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'} ${taken ? 'opacity-40 cursor-not-allowed' : ''}`}
                        title={taken ? 'محجوز' : ''}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
                {!selectedDate && (
                  <p className="text-xs text-slate-500">اختر التاريخ أولاً لعرض المواعيد المتاحة.</p>
                )}
              </div>
            </div>

            {bookingMessage && (
              <div className={`mt-4 text-sm ${bookingStatus === 'success' ? 'text-green-700' : bookingStatus === 'error' ? 'text-red-700' : 'text-slate-600'}`}>
                {bookingMessage}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-slate-500">سيتم تأكيد الحجز وإرساله للخادم.</p>
              <div className="flex gap-2">
                <button onClick={() => setBookingOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50">إلغاء</button>
                <button onClick={handleConfirmBooking} disabled={bookingStatus === 'loading'} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {bookingStatus === 'loading' ? 'جارِ الحجز…' : 'تأكيد الحجز'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function DoctorsGrid({ doctors, loading, onQuickBook }) {
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
              <button onClick={() => onQuickBook(d)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                حجز سريع
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
