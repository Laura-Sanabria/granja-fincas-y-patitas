export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Background with Farm theme */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80')" }}
      ></div>
      {/* Overlay to darken background */}
      <div className="absolute inset-0 bg-[var(--brand-900)] opacity-60 z-0"></div>
      
      {/* Auth Content */}
      <div className="z-10 w-full max-w-md p-4 animate-fade-in">
        <div className="glass-panel rounded-2xl p-8 text-[var(--foreground)] w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
