import Link from 'next/link';
import { signup } from '@/actions/auth';
import { Sprout } from 'lucide-react';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const message = params?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="h-12 w-12 rounded-full bg-[var(--brand)] flex items-center justify-center text-white mb-2 shadow-lg">
          <Sprout size={28} />
        </div>
        <h1 className="text-2xl font-bold text-center">Fincas & Patitas</h1>
        <p className="text-sm text-center opacity-80">Crear una cuenta nueva</p>
      </div>

      <form action={signup} className="flex flex-col gap-4">
        {message && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg text-center">
            {message}
          </div>
        )}
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="nombre">Nombre completo</label>
          <input 
            type="text" 
            name="nombre" 
            id="nombre" 
            required 
            placeholder="Juan Pérez"
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--glass-border)] bg-white/50 focus:bg-white/80 focus:ring-2 focus:ring-[var(--brand)] outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="email">Correo electrónico</label>
          <input 
            type="email" 
            name="email" 
            id="email" 
            required 
            placeholder="tumail@ejemplo.com"
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--glass-border)] bg-white/50 focus:bg-white/80 focus:ring-2 focus:ring-[var(--brand)] outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
          <input 
            type="password" 
            name="password" 
            id="password" 
            required 
            placeholder="••••••••"
            minLength={6}
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--glass-border)] bg-white/50 focus:bg-white/80 focus:ring-2 focus:ring-[var(--brand)] outline-none transition-all"
          />
          <p className="text-xs opacity-60">Mínimo 6 caracteres</p>
        </div>

        <button 
          type="submit" 
          className="mt-2 w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-medium py-2.5 rounded-lg transition-colors shadow-md"
        >
          Registrarse
        </button>
      </form>

      <div className="mt-4 text-center text-sm opacity-80">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-[var(--brand-hover)] hover:underline">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
