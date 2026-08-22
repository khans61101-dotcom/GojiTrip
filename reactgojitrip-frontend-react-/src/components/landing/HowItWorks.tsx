const steps = [
  {
    n: "01",
    title: "Enter Your Trip",
    items: ["Starting city", "Destination", "Budget", "Number of days", "Group size"],
  },
  {
    n: "02",
    title: "AI Route Analysis",
    items: ["Entire route", "Road conditions", "Best stops", "Scenic locations", "Fuel & travel time"],
  },
  {
    n: "03",
    title: "Smart Recommendations",
    items: ["Hotels & homestays", "Restaurants & cafes", "Attractions & guides", "Vehicle & bike rentals"],
  },
  {
    n: "04",
    title: "Book Everything",
    items: ["Hotels", "Vehicle rentals", "Guides & activities", "Transport tickets"],
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-12 md:py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>The Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">From idea to itinerary in four steps</h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            Every trip follows the same route through GojiTrip&rsquo;s
            engine — enter, analyze, recommend, book.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all" key={s.n}>
              <div className="w-12 h-12 flex items-center justify-center font-bold text-blue-600 bg-blue-50 rounded-xl mb-4">{s.n}</div>
              <h4 className="font-bold text-slate-900 mb-3">{s.title}</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {s.items.map((it) => (
                  <li key={it}>• {it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
