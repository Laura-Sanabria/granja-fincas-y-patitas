import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SupabaseProfileRepository } from '@/repositories/supabase/ProfileRepository';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener perfil para role y full_name usando el repositorio de dominio
  const profileRepo = new SupabaseProfileRepository();
  let profile = null;
  
  try {
    profile = await profileRepo.getById(user.id, supabase);
  } catch (error) {
    console.error("Error fetching profile in layout:", error);
  }

  const userData = {
    email: user.email!,
    full_name: profile?.full_name || undefined,
    role: profile?.role || 'EMPLEADO',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        <Header user={userData} />
        <main className="flex-1 overflow-y-auto bg-[var(--brand-50)]/30">
          <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
