import "@/styles/global.css";

// Auth route group layout — no Sidebar/Header, no AuthGuard.
// The html/body tags are inherited from the root layout,
// so we just render children directly.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
