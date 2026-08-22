

export default function Footer() {
  return (
    <footer className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <a
            className="flex items-center"
            href="#top"
            aria-label="GojiTrip home"
          >
            <div className="relative w-20 h-20 md:w-24 md:h-24">
              <img
                src="/logo/gojitriplogo.jpg"
                alt="GojiTrip"
                className="w-full h-full object-contain"
              />
            </div>
          </a>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <h5 className="font-bold text-slate-900">Company</h5>
              <a
                href="#about"
                className="text-sm text-slate-600 hover:text-blue-600"
              >
                About
              </a>
              <a
                href="#features"
                className="text-sm text-slate-600 hover:text-blue-600"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-slate-600 hover:text-blue-600"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="text-sm text-slate-600 hover:text-blue-600"
              >
                Contact
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="font-bold text-slate-900">Legal</h5>
              <a
                href="/privacy-policy"
                className="text-sm text-slate-600 hover:text-blue-600"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-sm text-slate-600 hover:text-blue-600"
              >
                Terms
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="font-bold text-slate-900">Follow</h5>
              <div className="flex gap-4">
                <a
                  href="https://x.com/gojitrip"
                  className="text-sm text-slate-600 hover:text-blue-600"
                >
                  𝕏
                </a>
                <a
                  href="https://www.linkedin.com/company/gojitrip"
                  className="text-sm text-slate-600 hover:text-blue-600"
                >
                  in
                </a>
                <a
                  href="https://www.instagram.com/gojitrip"
                  className="text-sm text-slate-600 hover:text-blue-600"
                >
                  ig
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-200">
          <span className="text-sm text-slate-500">
            © 2026 GojiTrip. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">
              Your AI-Powered Pocket Travel Companion
            </span>
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md"
            >
              Admin Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
