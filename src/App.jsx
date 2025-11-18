import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HospitalGrid from './components/HospitalGrid'
import DoctorsExplorer from './components/DoctorsExplorer'

function App() {
  const [query, setQuery] = useState('')

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero onSearch={setQuery} />

      <main className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-6 rtl:flex-row-reverse">
          <h2 className="text-xl font-bold">المستشفيات و العيادات</h2>
        </div>
        <HospitalGrid query={query} />

        <div className="flex items-center justify-between mb-4 mt-12 rtl:flex-row-reverse">
          <h2 className="text-xl font-bold">ابحث عن طبيب حسب العيادة أو التخصص</h2>
        </div>
        <DoctorsExplorer />
      </main>

      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500 rtl:text-right">
          © 2025 جميع الحقوق محفوظة — منصة الحجوزات الطبية
        </div>
      </footer>
    </div>
  )
}

export default App
