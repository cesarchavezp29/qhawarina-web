'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TERRACOTTA, CARD_BG, CARD_BORDER } from './mwData';

const BASE = '/simuladores/salario-minimo';

const LINKS = [
  { href: BASE,                      label: 'Resumen',      exact: true  },
  { href: `${BASE}/distribucion`,    label: 'Distribución', exact: false },
  { href: `${BASE}/evidencia`,       label: 'Evidencia',    exact: false },
  { href: `${BASE}/kaitz`,           label: 'Kaitz',        exact: false },
  { href: `${BASE}/simulador`,       label: 'Simulador',    exact: false },
  { href: `${BASE}/metodologia`,     label: 'Metodología',  exact: false },
];

export default function SectionNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: CARD_BG,
      borderBottom: `1px solid ${CARD_BORDER}`,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
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
