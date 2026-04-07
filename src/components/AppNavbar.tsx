interface NavItem {
  label: string;
  href: string;
}

interface AppNavbarProps {
  ctaLabel?: string;
  ctaHref?: string;
  items?: NavItem[];
}

const defaultItems: NavItem[] = [
  { label: 'Register Student', href: '/volunteer/register' },
  { label: 'ID Collection', href: '/admin.html#/id-cards' },
  { label: 'Volunteer Login', href: '/volunteer' },
  { label: 'Admin Portal', href: '/admin.html' },
];

export default function AppNavbar({
  ctaLabel = 'Get started',
  ctaHref = '/attendance-portal',
  items = defaultItems,
}: AppNavbarProps) {
  const goTo = (href: string) => window.location.assign(href);

  return (
    <header className="mx-auto rounded-2xl border border-white/40 bg-white/80 px-6 py-3 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 shadow-inner">
          <span className="text-lg font-bold tracking-tighter text-white">SP</span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-1 text-gray-600 md:flex">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => goTo(item.href)}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-gray-100 hover:text-black lg:text-[15px]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo(ctaHref)}
            className="shrink-0 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 active:scale-95"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
