import AppNavbar from './AppNavbar';

interface NavItem {
  label: string;
  href: string;
}

interface PageShellProps {
  children: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
  navbarItems?: NavItem[];
  /** Extra classes applied to the inner max-width container */
  className?: string;
}

export default function PageShell({
  children,
  ctaHref,
  ctaLabel,
  navbarItems,
  className = '',
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-[#f9f8f7] text-slate-900 antialiased">
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        <AppNavbar ctaHref={ctaHref} ctaLabel={ctaLabel} items={navbarItems} />
        {children}
      </div>
    </div>
  );
}
