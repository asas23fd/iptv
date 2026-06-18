import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSeriesInfo, getSeriesUrl } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { PlayIcon, SeriesIcon, StarIcon, ChevronLeftIcon, ClockIcon, SpinnerIcon } from '../components/Icons';

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { play } = usePlayer();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState(null);

  useEffect(() => {
    getSeriesInfo(id)
      .then((data) => {
        setInfo(data);
        if (data?.episodes) {
          const seasons = Object.keys(data.episodes);
          if (seasons.length > 0) setActiveSeason(seasons[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayEpisode = (episode) => {
    play({
      name: `${info.name} - S${activeSeason}E${episode.episode_num} - ${episode.title || ''}`,
      url: getSeriesUrl(episode.id),
      icon: info.cover || info.series_icon,
      isLive: false,
      category: 'Série',
      streamId: episode.id,
      type: 'series',
    });
    navigate('/player');
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
  }

  if (!info) {
    return <div className="text-center py-32"><SeriesIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 text-sm">Série não encontrada</p></div>;
  }

  const seasons = info.episodes ? Object.keys(info.episodes) : [];
  const episodes = activeSeason && info.episodes ? info.episodes[activeSeason] : [];
  const rating = info.rating || info.rating_5based;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
        <ChevronLeftIcon className="w-4 h-4" /> Voltar
      </button>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-[#0a0f1e] border border-white/[0.06] flex flex-col lg:flex-row">
        <div className="lg:w-64 shrink-0">
          <div className="aspect-[2/3] lg:h-full bg-[#080c16] overflow-hidden">
            {info.cover ? <img src={info.cover} alt={info.name} className="w-full h-full object-cover" />
              : info.series_icon ? <img src={info.series_icon} alt={info.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><SeriesIcon className="w-12 h-12 text-gray-700" /></div>}
          </div>
        </div>

        <div className="flex-1 p-5 lg:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-1 rounded bg-pink-500/20 text-pink-400 text-[11px] font-semibold">Série</span>
            {rating && <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 text-[11px] font-semibold"><StarIcon className="w-3 h-3" filled />{parseFloat(rating).toFixed(1)}</span>}
            {info.releaseDate && <span className="px-2.5 py-1 rounded bg-white/[0.04] text-gray-500 text-[11px]">{new Date(info.releaseDate).getFullYear()}</span>}
          </div>
          <h1 className="text-xl lg:text-3xl font-black text-white mb-2">{info.name}</h1>
          {info.plot && <p className="text-gray-500 text-sm leading-relaxed mb-3 max-w-2xl line-clamp-2">{info.plot}</p>}
          <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-600">
            {info.genre && <span className="px-2 py-0.5 rounded bg-white/[0.04]">{info.genre}</span>}
            {info.episode_run_time && <span className="px-2 py-0.5 rounded bg-white/[0.04]">{info.episode_run_time}min/ep</span>}
          </div>
        </div>
      </div>

      {/* Seasons & Episodes */}
      {seasons.length > 0 && (
        <div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-4">
            {seasons.map((s) => (
              <button key={s} onClick={() => setActiveSeason(s)}
                className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeSeason === s ? 'bg-indigo-500 text-white' : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]'}`}>
                Temporada {s}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            {episodes.map((ep, i) => (
              <button key={ep.id || i} onClick={() => handlePlayEpisode(ep)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-indigo-500/20 transition-all group text-left">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-indigo-400">{ep.episode_num || i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-medium text-gray-200 group-hover:text-white truncate transition-colors">{ep.title || `Episódio ${ep.episode_num || i + 1}`}</h3>
                  {ep.info?.duration && <span className="text-[11px] text-gray-600">{ep.info.duration}</span>}
                </div>
                <div className="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-indigo-500 flex items-center justify-center shrink-0 transition-colors">
                  <PlayIcon className="w-4 h-4 text-gray-500 group-hover:text-white ml-0.5 transition-colors" />
                </div>
              </button>
            ))}
            {episodes.length === 0 && <p className="text-center py-8 text-gray-600 text-sm">Nenhum episódio disponível</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesDetail;
