import "@/styles/global.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-page min-h-screen bg-white text-slate-900">
      {children}
    </div>
  );
}
