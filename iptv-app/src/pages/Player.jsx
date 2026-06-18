import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { usePlayer } from '../context/PlayerContext';

/* ── Inline SVG Icons ── */
const PlaySvg = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
);
const PauseSvg = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
);
const BackSvg = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
);
const VolumeSvg = ({ size = 20, muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white"/>
    {!muted && <><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></>}
    {muted && <><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>}
  </svg>
);
const FullscreenSvg = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const RetrySvg = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const Player = () => {
  const { currentStream, isPlaying, setIsPlaying, progress, setProgress, duration, setDuration, volume, setVolume, isMuted, setIsMuted, togglePlay } = usePlayer();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const progressRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [buffering, setBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(null);
  const controlsTimer = useRef(null);

  // Setup HLS
  useEffect(() => {
    if (!currentStream) { navigate('/'); return; }
    setBuffering(true);
    setError(null);

    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    const url = currentStream.url;
    const isHls = url?.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      // Proxy ALL requests to avoid mixed content (server redirects HTTP->HTTPS)
      const CORS_PROXY = 'https://corsproxy.io/?';
      const proxyUrl = (u) => {
        if (!u) return u;
        return CORS_PROXY + encodeURIComponent(u);
      };

      class ProxyLoader extends Hls.DefaultConfig.loader {
        constructor(config) {
          super(config);
          const origLoad = this.load.bind(this);
          this.load = function(context, config, callbacks) {
            context.url = proxyUrl(context.url);
            origLoad(context, config, callbacks);
          };
        }
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        loader: ProxyLoader,
      });
      hlsRef.current = hls;
      hls.loadSource(proxyUrl(url));
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else {
            setError('Erro ao carregar stream. Reconectando...');
            setTimeout(() => { hls.destroy(); hls.loadSource(url); hls.attachMedia(video); }, 3000);
          }
        }
      });
    } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => video.play().catch(() => {}), { once: true });
    } else {
      video.src = url;
      video.load();
    }

    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [currentStream, navigate]);

  // Video events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const h = {
      play: () => { setIsPlaying(true); setBuffering(false); },
      pause: () => setIsPlaying(false),
      waiting: () => setBuffering(true),
      playing: () => { setBuffering(false); setError(null); },
      timeupdate: () => { if (v.duration && isFinite(v.duration)) setProgress((v.currentTime / v.duration) * 100); },
      loadedmetadata: () => { if (v.duration && isFinite(v.duration)) setDuration(v.duration); setBuffering(false); },
      error: () => { setError('Erro ao reproduzir.'); setBuffering(false); },
    };
    Object.entries(h).forEach(([e, fn]) => v.addEventListener(e, fn));
    return () => Object.entries(h).forEach(([e, fn]) => v.removeEventListener(e, fn));
  }, [currentStream]);

  // Auto-fullscreen on landscape (mobile)
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    const goFullscreen = () => {
      if (containerRef.current && !document.fullscreenElement) {
        containerRef.current.requestFullscreen?.().then(() => {
          screen.orientation?.lock?.('landscape').catch(() => {});
        }).catch(() => {});
      }
    };

    const handleOrientation = () => {
      const isLandscape = screen.orientation?.type?.includes('landscape') || window.innerWidth > window.innerHeight;
      if (isLandscape) goFullscreen();
    };

    // Auto fullscreen on mount for mobile
    goFullscreen();

    screen.orientation?.addEventListener?.('change', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', handleOrientation);
    return () => {
      screen.orientation?.removeEventListener?.('change', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
      window.removeEventListener('resize', handleOrientation);
      screen.orientation?.unlock?.();
    };
  }, []);

  // Volume
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const seek = useCallback((e) => {
    const v = videoRef.current, bar = progressRef.current;
    if (!v || !bar || !v.duration || !isFinite(v.duration)) return;
    const rect = bar.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  }, []);

  const onMouseMove = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null); setBuffering(true);
    const video = videoRef.current, streamUrl = currentStream?.url;
    if (!video || !streamUrl) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (streamUrl.includes('.m3u8') && Hls.isSupported()) {
      const CORS_PROXY = 'https://corsproxy.io/?';
      const proxied = CORS_PROXY + encodeURIComponent(streamUrl);
      const hls = new Hls({
        enableWorker: true, lowLatencyMode: true,
        loader: class extends Hls.DefaultConfig.loader {
          constructor(cfg) { super(cfg); const o = this.load.bind(this); this.load = (c, cfg2, cb) => { c.url = CORS_PROXY + encodeURIComponent(c.url); o(c, cfg2, cb); }; }
        },
      });
      hlsRef.current = hls;
      hls.loadSource(proxied); hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    } else { video.src = streamUrl; video.load(); }
  }, [currentStream]);

  const toggleFs = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen();
  }, []);

  const fmt = (s) => {
    if (!s || isNaN(s) || !isFinite(s)) return '0:00';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
  };

  if (!currentStream) return null;

  const controlsOpacity = showControls ? 1 : 0;
  const pointerEvents = showControls ? 'auto' : 'none';

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onClick={(e) => { if (e.target === videoRef.current) togglePlay(); }}
      style={{
        position: 'fixed', inset: 0, background: '#000', zIndex: 9999,
        display: 'flex', flexDirection: 'column', userSelect: 'none',
      }}
    >
      {/* Video */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* Buffering */}
        {buffering && !error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', zIndex: 10,
          }}>
            <div style={{
              width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#6366f1', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 13, color: '#888', marginTop: 12 }}>Carregando...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.92)', zIndex: 10,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>!</span>
            </div>
            <p style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{error}</p>
            <p style={{ color: '#555', fontSize: 12, marginBottom: 20 }}>{currentStream.name}</p>
            <button onClick={handleRetry} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 12,
              background: '#6366f1', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <RetrySvg size={16} /> Tentar novamente
            </button>
          </div>
        )}

        {/* Center play button when paused */}
        {!isPlaying && !buffering && !error && (
          <button onClick={togglePlay} style={{
            position: 'absolute', width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer', zIndex: 5,
          }}>
            <PlaySvg size={32} />
          </button>
        )}

        {/* ═══ Controls Overlay ═══ */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          opacity: controlsOpacity, pointerEvents,
          transition: 'opacity 0.4s ease', zIndex: 20,
        }}>
          {/* Top bar */}
          <div className="player-top" style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <button onClick={() => navigate(-1)} className="player-back" style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BackSvg size={20} />
            </button>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 className="player-title" style={{
                fontSize: 16, fontWeight: 700, color: '#fff', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {currentStream.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                {currentStream.isLive && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 4,
                    background: '#ef4444', fontSize: 9, fontWeight: 800, color: '#fff',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                    AO VIVO
                  </span>
                )}
                {currentStream.category && (
                  <span style={{ fontSize: 11, color: '#888' }}>{currentStream.category}</span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="player-bottom" style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
            padding: '16px 20px',
          }}>
            {/* Progress bar */}
            {!currentStream.isLive && duration > 0 ? (
              <div
                ref={progressRef}
                onClick={seek}
                style={{
                  position: 'relative', height: 6, borderRadius: 3,
                  background: 'rgba(255,255,255,0.15)', cursor: 'pointer',
                  marginBottom: 14,
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  borderRadius: 3, width: `${progress}%`, transition: 'width 0.1s',
                }} />
              </div>
            ) : (
              <div style={{
                height: 3, borderRadius: 2, overflow: 'hidden',
                background: 'rgba(255,255,255,0.08)', marginBottom: 14,
              }}>
                <div style={{
                  height: '100%', width: '100%',
                  background: 'linear-gradient(90deg, #ef4444, #f87171, #ef4444)',
                  animation: 'pulse 2s infinite',
                }} />
              </div>
            )}

            {/* Control buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={togglePlay} className="player-play" style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isPlaying ? <PauseSvg size={20} /> : <PlaySvg size={20} />}
                </button>
                {!currentStream.isLive && duration > 0 && (
                  <span style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace' }}>
                    {fmt(videoRef.current?.currentTime)} / {fmt(duration)}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setIsMuted(!isMuted)} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <VolumeSvg size={18} muted={isMuted} />
                </button>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(+e.target.value); setIsMuted(false); }}
                  style={{ width: 80, accentColor: '#6366f1', cursor: 'pointer' }}
                />
                <button onClick={toggleFs} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FullscreenSvg size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 640px) {
          .player-top { padding: 10px 12px !important; }
          .player-bottom { padding: 10px 12px !important; }
          .player-back { width: 34px !important; height: 34px !important; }
          .player-title { font-size: 14px !important; }
          .player-play { width: 38px !important; height: 38px !important; }
          .player-vol { width: 60px !important; }
        }
      `}</style>
    </div>
  );
};

export default Player;
