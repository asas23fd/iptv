import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLiveCategories } from '../services/api';
import { LogoIcon, TvIcon, ChevronRightIcon } from './Icons';

const s = {
  aside: (open) => ({
    position: 'fixed', top: 0, left: 0, height: '100%', width: 260,
    background: '#08080d', borderRight: '1px solid rgba(255,255,255,0.06)',
    zIndex: 50, display: 'flex', flexDirection: 'column',
    transform: open ? 'translateX(0)' : undefined,
    transition: 'transform 0.3s ease',
  }),
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 },
  logo: { height: 60, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 },
  label: { padding: '16px 16px 8px', fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.15em' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', margin: '2px 8px',
    borderRadius: 10, cursor: 'pointer', border: 'none', width: 'calc(100% - 16px)',
    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
    color: active ? '#fff' : '#666', fontSize: 13, fontWeight: active ? 600 : 400,
    transition: 'all 0.15s ease', textAlign: 'left',
  }),
  iconBox: (active) => ({
    width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', flexShrink: 0,
  }),
  catWrap: { marginLeft: 20, paddingLeft: 14, borderLeft: '2px solid rgba(255,255,255,0.06)', maxHeight: 320, overflowY: 'auto' },
  catItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
    border: 'none', width: '100%', background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
    color: active ? '#a5b4fc' : '#555', fontSize: 12, fontWeight: active ? 600 : 400,
    transition: 'all 0.15s ease', textAlign: 'left',
  }),
  dot: (active) => ({ width: 5, height: 5, borderRadius: '50%', background: active ? '#6366f1' : '#333', flexShrink: 0 }),
  badge: { padding: '2px 7px', borderRadius: 5, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, marginLeft: 'auto' },
  footer: { padding: '12px 16px 16px', marginTop: 'auto' },
  footerCard: { background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 16px' },
};

const Sidebar = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getLiveCategories().then(setCategories).catch(console.error).finally(() => setLoading(false));
  }, []);

  const select = (id) => { setSelected(id); navigate('/'); onClose(); };

  return (
    <>
      {isOpen && <div style={s.overlay} onClick={onClose} />}
      <aside style={s.aside(isOpen)} className="sidebar-aside">
        <div style={s.logo}>
          <LogoIcon style={{ width: 36, height: 36, flexShrink: 0 }} />
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, lineHeight: 1.2 }} className="text-gradient">StreamTV</h1>
            <p style={{ fontSize: 8, color: '#444', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>Premium IPTV</p>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="no-scrollbar">
          <div style={s.label}>Canais</div>

          <button style={s.navItem(false)} onClick={() => { setExpanded(!expanded); }}
            onMouseEnter={e => { if (!false) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { if (!false) e.currentTarget.style.background = 'transparent'; }}>
            <div style={s.iconBox(false)}><TvIcon style={{ width: 18, height: 18, color: '#6366f1' }} /></div>
            <span style={{ flex: 1 }}>TV Ao Vivo</span>
            <span style={s.badge}>Live</span>
            <ChevronRightIcon style={{ width: 14, height: 14, color: '#444', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }} />
          </button>

          {expanded && (
            <div style={s.catWrap} className="no-scrollbar animate-slide-down">
              <button style={s.catItem(selected === null)} onClick={() => select(null)}
                onMouseEnter={e => { if (selected !== null) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { if (selected !== null) e.currentTarget.style.background = 'transparent'; }}>
                <span style={s.dot(selected === null)} />
                Todos os Canais
              </button>
              {loading ? (
                <div style={{ padding: '8px 10px' }}>
                  {[1,2,3,4].map(i => <div key={i} className="animate-shimmer" style={{ height: 12, borderRadius: 4, marginBottom: 8, width: `${50 + i * 10}%` }} />)}
                </div>
              ) : categories.map(cat => (
                <button key={cat.category_id} style={s.catItem(selected === cat.category_id)} onClick={() => select(cat.category_id)}
                  onMouseEnter={e => { if (selected !== cat.category_id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (selected !== cat.category_id) e.currentTarget.style.background = 'transparent'; }}>
                  <span style={s.dot(selected === cat.category_id)} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.category_name}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        <div style={s.footer}>
          <div style={s.footerCard}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(129,140,248,0.7)', marginBottom: 2 }}>IPTV Premium</p>
            <p style={{ fontSize: 10, color: '#444', lineHeight: 1.4 }}>TV ao vivo em alta definicao</p>
          </div>
        </div>
      </aside>

      <style>{`
        @media (min-width: 1024px) {
          .sidebar-aside { position: relative !important; z-index: auto !important; transform: none !important; }
        }
        @media (max-width: 1023px) {
          .sidebar-aside { transform: translateX(-100%) !important; }
          .sidebar-aside.open { transform: translateX(0) !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
