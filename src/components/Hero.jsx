export default function Hero({ onSearch }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
      <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 rtl:text-right">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              احجز موعدك الطبي بسهولة
            </h2>
            <p className="text-slate-600 text-lg">
              واجهة أنيقة وسهلة الاستخدام للعثور على المستشفى أو العيادة المناسبة وحجز موعدك خلال ثوانٍ.
            </p>
            <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-3 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="ابحث عن مستشفى، عيادة، أو تخصص"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => onSearch?.(e.target.value)}
                />
                <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
                  بحث
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />مواعيد مؤكدة</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />تذكير بالموعد</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" />دعم سريع</div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-3xl blur-2xl opacity-60" />
              <img src="https://images.unsplash.com/photo-1649433391719-2e784576d044?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxib29raW5nfGVufDB8MHx8fDE3NjM0NzYxMTZ8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="booking" className="relative rounded-3xl shadow-2xl ring-1 ring-black/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
