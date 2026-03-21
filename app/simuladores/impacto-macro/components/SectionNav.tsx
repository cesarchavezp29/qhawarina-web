'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TERRACOTTA, CARD_BG, CARD_BORDER } from './macroData';

const BASE = '/simuladores/impacto-macro';

const LINKS = [
  { href: BASE,                          label: 'Resumen',        exact: true  },
  { href: `${BASE}/crecimiento-pobreza`, label: 'Pobreza',        exact: false },
  { href: `${BASE}/politica-monetaria`,  label: 'Tasa BCRP',      exact: false },
  { href: `${BASE}/tipo-cambio`,         label: 'Tipo de Cambio', exact: false },
  { href: `${BASE}/escenarios`,          label: 'Escenarios',     exact: false },
  { href: `${BASE}/metodologia`,         label: 'Metodología',    exact: false },
];

export default function SectionNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav style={{
      position: 'sticky', bottom: 0, zIndex: 50,
      background: CARD_BG,
      borderTop: `1px solid ${CARD_BORDER}`,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
    }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 overflow-x-auto">
        <div className="flex gap-1.5 py-2.5 min-w-max">
          {LINKS.map(l => {
            const active = isActive(l.href, l.exact);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
                style={{
                  background: active ? TERRACOTTA : 'transparent',
                  color: active ? 'white' : '#6b7280',
                  border: `2px solid ${active ? TERRACOTTA : '#d6d3d1'}`,
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
