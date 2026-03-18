'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NTL_NAV, TERRACOTTA, CARD_BG, CARD_BORDER } from './ntlData';

export default function SectionNav() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === '/observatorio/luces-nocturnas') return pathname === href;
    return pathname.startsWith(href);
  };
  return (
    <nav
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 50,
        background: CARD_BG,
        borderTop: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto">
        {NTL_NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap"
              style={{
                color: active ? TERRACOTTA : '#78716c',
                borderBottom: active ? `2px solid ${TERRACOTTA}` : '2px solid transparent',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
