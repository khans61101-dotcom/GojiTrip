const points = [
  { b: "Live route rendering", t: " — your full journey plotted turn by turn, not just start and end." },
  { b: "Real-time traffic", t: " — ETAs adjust automatically around congestion." },
  { b: "Nearby search", t: " — hotels, restaurants, and fuel stations found near every stop." },
  { b: "One-tap navigation", t: " — jump straight into turn-by-turn directions from any stop card." },
];

export default function MapsIntegration() {
  return (
    <section id="maps" className="py-12 md:py-20">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>Powered by Google Maps
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Every route, mapped and navigable
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            GojiTrip routes are built directly on Google Maps Platform, so
            distances, traffic, and stop locations are always accurate — and
            navigation is one tap away.
          </p>
          <ul className="space-y-4">
            {points.map((p) => (
              <li key={p.b} className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-sm text-slate-700">
                  <b className="font-semibold text-slate-900">{p.b}</b>
                  {p.t}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-blue-50 rounded-2xl p-6">
          <svg viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="320" height="300" rx="16" fill="#EAF4FC" />
            <path
              d="M20 250 C 80 220, 60 160, 140 150 S 260 90, 300 40"
              stroke="#0EA5E9"
              strokeWidth="5"
              fill="none"
              strokeDasharray="2 12"
              strokeLinecap="round"
            />
            <circle cx="20" cy="250" r="8" fill="#22C55E" />
            <circle cx="140" cy="150" r="8" fill="#F59E0B" />
            <circle cx="300" cy="40" r="8" fill="#0EA5E9" />
            <text x="20" y="272" fontSize="11" fill="#3a4a5e" fontFamily="Inter">Start</text>
            <text x="118" y="140" fontSize="11" fill="#3a4a5e" fontFamily="Inter">Stop</text>
            <text x="256" y="34" fontSize="11" fill="#3a4a5e" fontFamily="Inter">Destination</text>
          </svg>
        </div>
      </div>
    </section>
  );
}
