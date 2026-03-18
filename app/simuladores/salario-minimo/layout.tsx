import Watermark from './components/Watermark';
import SectionNav from './components/SectionNav';

export default function SalarioMinimoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#FAF8F4',
      minHeight: '100vh',
      fontFamily: "'Inter',system-ui,sans-serif",
      position: 'relative',
    }}>
      <Watermark />
      {children}
      <SectionNav />
    </div>
  );
}
