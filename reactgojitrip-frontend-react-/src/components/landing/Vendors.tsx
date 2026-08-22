const vendors = [
  { badge: "Stay", title: "Hotels & Homestays", text: "Verified rooms with KYC-checked owners, live availability, and instant booking." },
  { badge: "Eat", title: "Restaurants & Dhabas", text: "Local food, cafes, and highway dhabas listed with pricing, ratings, and reviews." },
  { badge: "Ride", title: "Vehicle Operators", text: "Taxi, jeep, tempo traveller and bus operators bookable by route and passenger count." },
  { badge: "Guide", title: "Tour Guides", text: "Certified local, language, and trekking guides with transparent pricing." },
  { badge: "Adventure", title: "Activity Operators", text: "Zip-lining, camping, rafting and other experiences bookable along your route." },
  { badge: "Coming Soon", title: "Local Shops", text: "Souvenir and local craft sellers, discoverable at your trip stops." },
];

export default function Vendors() {
  return (
    <section id="vendors" className="py-12 md:py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>Marketplace
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Real vendors, verified and bookable</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Every hotel, driver, and guide on GojiTrip runs their own
            dashboard — bookings, pricing, and availability, kept current by
            the people actually offering the service.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((v) => (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all" key={v.title}>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-4">{v.badge}</span>
              <h4 className="font-bold text-slate-900 mb-2">{v.title}</h4>
              <p className="text-sm text-slate-600">{v.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 p-8 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Run a hotel, cab, or guide service?</h3>
            <p className="text-slate-400">List your business, manage bookings, and get paid — all from one dashboard.</p>
          </div>
          <a className="inline-block px-8 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition">Become a Vendor →</a>
        </div>
      </div>
    </section>
  );
}
