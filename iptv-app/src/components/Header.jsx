import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuIcon, SearchIcon, CloseIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': 'Início',
  '/live': 'TV Ao Vivo',
  '/movies': 'Filmes',
  '/series': 'Séries',
  '/history': 'Histórico',
};

const Header = ({ onMenuToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const title = pageTitles[location.pathname] || 'StreamTV';

  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onMenuToggle} style={{
          display: 'none',
          padding: 8,
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          borderRadius: 8,
        }} className="menu-btn">
          <MenuIcon style={{ width: 20, height: 20 }} />
        </button>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.02em' }}>
          {title}
        </h1>
      </div>

      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 420, margin: '0 16px' }} className="search-form">
        <div style={{ position: 'relative' }}>
          <SearchIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#555' }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '9px 14px 9px 38px',
              fontSize: 13,
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          borderRadius: 20,
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} className="animate-pulse-dot" />
          <span style={{ fontSize: 11, color: 'rgba(16, 185, 129, 0.8)', fontWeight: 500 }}>Online</span>
        </div>
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }} className="user-info">
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
                {(user.username || 'U')[0].toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: 12, color: '#888' }}>{user.username}</span>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .menu-btn { display: flex !important; }
        }
        @media (max-width: 639px) {
          .search-form { display: none; }
          .user-info { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
