const cats = [
  ["🧗", "Adventure"],
  ["👨‍👩‍👧", "Family Trips"],
  ["⛰️", "Hill Stations"],
  ["🛣️", "Road Trips"],
  ["🛕", "Religious Tours"],
  ["🐘", "Wildlife"],
  ["⛺", "Camping"],
  ["🥂", "Luxury Travel"],
  ["🎒", "Budget Travel"],
  ["📅", "Weekend Getaways"],
  ["🏍️", "Bike Trips"],
  ["🧍", "Solo Travel"],
];

export default function Explore() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>Pick Your Style
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Explore by interest</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cats.map(([em, label]) => (
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all" key={label}>
              <span className="text-3xl mb-2">{em}</span>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
