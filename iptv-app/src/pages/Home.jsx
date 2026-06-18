import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLiveStreams, getLiveCategories, getStreamUrl } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

/* ── Inline SVG Icons ── */
const PlaySvg = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
);
const SearchSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const CloseSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const TvSvg = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
);

/* ── Constants ── */
const COLORS = ['#6366f1','#a855f7','#ec4899','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#f43f5e','#14b8a6'];

/* ── Channel Card ── */
const ChannelCard = ({ ch, onPlay, delay = 0 }) => {
  const handleClick = useCallback(() => onPlay(ch), [ch, onPlay]);

  return (
    <button onClick={handleClick} className="ch-card card-anim" style={{
      flexShrink: 0, borderRadius: 10, overflow: 'hidden',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      cursor: 'pointer', textAlign: 'left', padding: 0,
      width: 'calc((100% - 60px) / 6)',
      minWidth: 140,
      animationDelay: `${Math.min(delay * 0.03, 0.6)}s`,
    }}>
      <div style={{ aspectRatio: '16/9', background: '#0d0d15', position: 'relative', overflow: 'hidden' }}>
        {ch.stream_icon ? (
          <img src={ch.stream_icon} alt={ch.name} loading="lazy"
            onError={e => { e.target.style.display = 'none'; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}>
            <TvSvg size={28} />
          </div>
        )}
        <div style={{
          position: 'absolute', top: 6, left: 6,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '2px 7px', borderRadius: 4, background: '#ef4444',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>AO VIVO</span>
        </div>
        <div className="ch-play" style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.15s',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PlaySvg size={20} />
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 10px' }}>
        <p style={{
          fontSize: 12, fontWeight: 500, color: '#aaa',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0,
        }}>{ch.name}</p>
      </div>
    </button>
  );
};

/* ── Main Home ── */
const Home = () => {
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { play } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    Promise.all([getLiveStreams(), getLiveCategories()])
      .then(([live, cats]) => {
        setChannels(live.map(ch => ({ ...ch, streamUrl: getStreamUrl(ch.stream_id) })));
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0].category_id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handlePlay = useCallback((ch) => {
    play({ name: ch.name, url: ch.streamUrl, icon: ch.stream_icon, isLive: true, category: ch.category, streamId: ch.stream_id });
    navigate('/player');
  }, [play, navigate]);

  const grouped = useMemo(() => {
    const g = {};
    channels.forEach(ch => {
      const id = ch.category_id || 'other';
      if (!g[id]) g[id] = [];
      g[id].push(ch);
    });
    return g;
  }, [channels]);

  const filteredChannels = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    const q = debouncedQuery.toLowerCase();
    return channels.filter(ch => ch.name.toLowerCase().includes(q));
  }, [channels, debouncedQuery]);

  const displayCategories = useMemo(() => {
    return activeCategory ? categories.filter(c => c.category_id === activeCategory) : categories;
  }, [categories, activeCategory]);

  const totalChannels = channels.length;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ═══ Top Nav ═══ */}
      <header className="top-nav" style={{
        height: 48, display: 'flex', alignItems: 'center',
        padding: '0 20px', background: '#0a0a0f',
        borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0, zIndex: 100,
        gap: 16,
      }}>

        {/* Category Pills */}
        <nav onWheel={e => { e.currentTarget.scrollLeft += e.deltaY; }}
          style={{ display: 'flex', alignItems: 'center', gap: 2, overflowX: 'auto', flex: 1, minWidth: 0 }}
          className="hide-scrollbar cat-nav"
        >
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat.category_id;
            const color = COLORS[i % COLORS.length];
            return (
              <button key={cat.category_id}
                onClick={() => { setActiveCategory(cat.category_id); setSearchQuery(''); setSearchOpen(false); }}
                className="cat-pill"
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 600 : 400, flexShrink: 0,
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isActive ? '#fff' : '#666',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {cat.category_name}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div className={`search-wrap ${searchOpen ? 'search-open' : ''}`} style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.04)', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden', transition: 'all 0.25s ease',
            width: searchOpen ? 200 : 32, height: 32,
          }}>
            <button onClick={() => {
              if (searchOpen && searchQuery) { setSearchQuery(''); }
              else if (searchOpen) { setSearchOpen(false); setSearchQuery(''); }
              else { setSearchOpen(true); }
            }} style={{
              width: 32, height: 32, flexShrink: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              color: searchOpen ? '#6366f1' : '#888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {searchOpen ? <CloseSvg size={14} /> : <SearchSvg size={14} />}
            </button>
            {searchOpen && (
              <input ref={searchRef} type="text" placeholder="Buscar canal..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="search-field"
                style={{
                  flex: 1, background: 'none', border: 'none',
                  padding: '0 10px 0 0', fontSize: 12, color: '#fff', outline: 'none',
                  minWidth: 0,
                }}
              />
            )}
          </div>

          <div className="hide-on-mobile" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{totalChannels}</span>
          </div>
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 24px 40px' }}
        className="hide-scrollbar main-content"
      >

        {debouncedQuery.trim() ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <SearchSvg size={18} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ddd', margin: 0 }}>Resultados para "{searchQuery}"</h2>
              <span style={{ fontSize: 12, color: '#555' }}>({filteredChannels?.length || 0})</span>
            </div>
            {filteredChannels && filteredChannels.length > 0 ? (
              <div className="ch-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {filteredChannels.map(ch => <ChannelCard key={ch.stream_id} ch={ch} onPlay={handlePlay} />)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555', fontSize: 13 }}>Nenhum canal encontrado</div>
            )}
          </div>
        ) : (
          displayCategories.map((cat) => {
            const catChannels = grouped[cat.category_id];
            if (!catChannels || catChannels.length === 0) return null;
            const color = COLORS[categories.indexOf(cat) % COLORS.length];
            return (
              <section key={cat.category_id} className="fade-in" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 3, height: 18, borderRadius: 2, background: color }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ddd', margin: 0 }}>{cat.category_name}</h3>
                  <span style={{ fontSize: 11, color: '#555', padding: '2px 7px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>{catChannels.length}</span>
                </div>
                <div className="ch-grid" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {catChannels.map((ch, idx) => (
                    <ChannelCard key={ch.stream_id} ch={ch} onPlay={handlePlay} delay={idx} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* ═══ CSS ═══ */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hide-scrollbar::-webkit-scrollbar{display:none}
        .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        *{box-sizing:border-box}
        body{margin:0;padding:0;background:#0a0a0f}

        .ch-card{transition:border-color 0.15s,background 0.15s}
        .ch-card:hover{border-color:rgba(99,102,241,0.3);background:rgba(255,255,255,0.04)}
        .ch-card:hover .ch-play{opacity:1!important}
        .ch-card:hover img{opacity:1!important}

        .fade-in{animation:fadeIn 0.3s ease both}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        .card-anim{animation:cardIn 0.35s ease both}
        @keyframes cardIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}

        /* ── Tablet ── */
        @media (max-width: 1024px) {
          .ch-card { width: calc((100% - 48px) / 4) !important; min-width: 130px !important; }
          .main-content { padding: 16px 18px 32px !important; }
          .ch-grid { gap: 10px !important; }
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .top-nav { height: 56px !important; padding: 0 12px !important; gap: 8px !important; }
          .cat-nav { padding: 0 8px !important; }
          .cat-pill { padding: 5px 10px !important; font-size: 11px !important; }
          .main-content { padding: 12px 10px 24px !important; }
          .ch-grid { gap: 8px !important; }
          .ch-card { width: calc((100% - 16px) / 2) !important; min-width: 0 !important; }
          .hide-on-mobile { display: none !important; }
          .search-input-wrap input { width: 120px !important; }
        }

        /* ── Small phones ── */
        @media (max-width: 380px) {
          .ch-card { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
