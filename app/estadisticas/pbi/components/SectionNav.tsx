'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BASE = '/estadisticas/pbi';
const TERRA = '#C65D3E';

const LINKS = [
  { href: BASE,                    label: 'Resumen',     exact: true  },
  { href: `${BASE}/graficos`,      label: 'Evolución',   exact: false },
  { href: `${BASE}/sectores`,      label: 'Sectores',    exact: false },
  { href: `${BASE}/mapas`,         label: 'Regional',    exact: false },
  { href: `${BASE}/metodologia`,   label: 'Metodología', exact: false },
];

export default function PBISectionNav() {
  const pathname = usePathname();
  return (
    <nav style={{
      position: 'sticky', bottom: 0, zIndex: 50,
      background: 'rgba(250,248,244,0.96)',
      borderTop: '1px solid #E8E4DF',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
    }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 overflow-x-auto">
        <div className="flex gap-1.5 py-2.5 min-w-max">
          {LINKS.map(l => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
                style={{
                  background: active ? TERRA : 'transparent',
                  color: active ? 'white' : '#6b7280',
                  border: `2px solid ${active ? TERRA : '#d6d3d1'}`,
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
