import { useNavigate } from 'react-router';
import AppNavbar from '../../components/AppNavbar';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f2f2f5]">
      {/* Centered container with a more reasonable max-width for better focus */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <AppNavbar ctaHref="/attendance-portal" />

        {/* Increased top margin (mt-32) to let the header breathe */}
        <section className="mt-32 mb-24 text-center">
          <div className="mx-auto w-fit px-3 py-1 bg-gray-50 border border-gray-200 rounded text-gray-500 text-[10px] font-bold tracking-widest uppercase">
            Welcome to
          </div>

          <h1 className="mt-8 text-black mx-auto max-w-3xl font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-tight">
            Student Services <br />
            Management Portal
          </h1>

          {/* Slightly more margin-top (mt-8) and smaller max-width (max-w-md) for better line length */}
          <p className="mt-8 mx-auto max-w-md text-gray-600 text-base leading-relaxed px-4">
            The central hub for coordinating student services and managing campus impact. 
            Register students, manage ID collections, and find your next place to serve.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/attendance-portal')}
              className="w-full sm:w-auto px-10 py-3.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-all active:scale-95"
            >
              Get started
            </button>
            
            <button
              onClick={() => window.location.assign('/admin.html')}
              className="w-full sm:w-auto px-10 py-3.5 rounded-md border border-gray-300 bg-white text-gray-700 font-bold text-base hover:bg-gray-50 transition-all active:scale-95"
            >
              Admin Portal
            </button>
          </div>
        </section>

        {/* Scripture Section: Increased top padding (py-24) to create a clear visual end to the page */}
        <section className="py-24 border-t border-gray-200/50 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <p className="italic text-gray-500 text-lg sm:text-xl leading-relaxed font-serif">
              "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."
            </p>
            <p className="mt-6 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Colossians 3:23
            </p>
          </div>
        </section>
        
      </div>
    </div>
  );
}