import React from 'react';

export default function FinalCta() {
  return (
    <section className="py-16 md:py-24 bg-blue-600">
      <div className="container mx-auto px-6 text-center text-white">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready for Your Next Adventure?</h2>
        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg mx-auto">Start planning your dream trip today with AI-powered insights.</p>
        <a href="#top" className="inline-block px-8 py-3 md:px-10 md:py-4 bg-white text-blue-600 rounded-full font-bold text-base md:text-lg hover:bg-blue-50 transition transform hover:scale-105">
          Start Planning Now
        </a>
      </div>
    </section>
  );
}
