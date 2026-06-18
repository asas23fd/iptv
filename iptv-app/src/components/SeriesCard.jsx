import { useNavigate } from 'react-router-dom';
import { PlayIcon, SeriesIcon, StarIcon } from './Icons';

const SeriesCard = ({ series }) => {
  const navigate = useNavigate();
  const rating = series.rating || series.rating_5based;

  return (
    <div onClick={() => navigate(`/series/${series.series_id}`)} className="group rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04] hover:border-pink-500/20 card-hover cursor-pointer">
      <div className="aspect-[2/3] bg-[#0a0f1e] relative overflow-hidden">
        {series.cover ? (
          <img src={series.cover} alt={series.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        ) : series.series_icon ? (
          <img src={series.series_icon} alt={series.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><SeriesIcon className="w-10 h-10 text-gray-700" /></div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60">
            <StarIcon className="w-3 h-3 text-yellow-400" filled />
            <span className="text-[10px] font-bold text-yellow-400">{parseFloat(rating).toFixed(1)}</span>
          </div>
        )}

        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-pink-500/80">
          <span className="text-[10px] font-bold text-white">SÉRIE</span>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
            <PlayIcon className="w-7 h-7 text-white ml-0.5" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <h3 className="text-[13px] font-semibold text-white line-clamp-2 drop-shadow-lg">{series.name}</h3>
        </div>
      </div>
    </div>
  );
};

export default SeriesCard;
