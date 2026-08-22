const features = [
  { bg: "#E7F1FB", icon: "🧭", title: "AI Route Intelligence", text: "Automatically analyzes the safest and fastest routes across your entire journey." },
  { bg: "#FEF3E2", icon: "🏨", title: "Smart Hotel Discovery", list: ["Budget & ratings", "Family / couple friendly", "Luxury & hostels"] },
  { bg: "#E7F8EE", icon: "🍜", title: "Restaurant Discovery", list: ["Local, veg & non-veg", "Cafes & highway dhabas", "Fine dining, top rated"] },
  { bg: "#F1EAFB", icon: "🚙", title: "Commercial Vehicle Booking", list: ["Jeep, taxi, SUV", "Tempo traveller, mini/luxury bus", "Private cab by route & pax"] },
  { bg: "#FBEAF0", icon: "🧑‍🏫", title: "Local Tour Guides", list: ["Certified & language experts", "Trekking & adventure guides", "Ratings & pricing"] },
  { bg: "#E7F1FB", icon: "🚌", title: "Public Transport", list: ["Bus & train availability", "Government transport, metro", "Schedules & fare estimates"] },
  { bg: "#FEF3E2", icon: "💰", title: "Budget Planner", list: ["Fuel, toll & hotel cost", "Food, activities, vehicle cost", "Predicted total trip expense"] },
  { bg: "#E7F8EE", icon: "🌦️", title: "Weather Forecast", list: ["Temperature & rain chances", "Snow alerts", "Wind speed per stop"] },
];
export default function Features() {
  return (
    <section id="features" className="py-12 md:py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>Under the Hood
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Your personal AI travel expert</h2>
          <p className="text-slate-600">Eight specialised engines work together on every route you plan.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all" key={f.title}>
              <div className="w-12 h-12 flex items-center justify-center text-2xl rounded-xl mb-4" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{f.title}</h4>
              {f.text && <p className="text-sm text-slate-600">{f.text}</p>}
              {f.list && (
                <ul className="text-sm text-slate-600 space-y-1">
                  {f.list.map((li) => (
                    <li key={li}>• {li}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
