import { CalendarDays } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">حجوزات طبية</h1>
            <p className="text-xs text-slate-500">سهولة وسرعة لحجز المواعيد</p>
          </div>
        </div>
      </div>
    </header>
  )
}
