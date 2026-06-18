import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { PlayIcon, TvIcon } from './Icons';

const ChannelCard = ({ channel, compact = false }) => {
  const { play } = usePlayer();
  const navigate = useNavigate();

  const handleClick = () => {
    play({
      name: channel.name,
      url: channel.streamUrl,
      icon: channel.stream_icon,
      isLive: true,
      category: channel.category,
      streamId: channel.stream_id,
    });
    navigate('/player');
  };

  if (compact) {
    return (
      <button onClick={handleClick} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-indigo-500/20 transition-all group">
        <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0">
          {channel.stream_icon ? <img src={channel.stream_icon} alt="" className="w-full h-full object-cover" loading="lazy" /> : <TvIcon className="w-4 h-4 text-indigo-400" />}
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white truncate transition-colors">{channel.name}</span>
        <PlayIcon className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
      </button>
    );
  }

  return (
    <button onClick={handleClick} className="group rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/20 card-hover text-left w-full">
      <div className="aspect-video bg-[#0a0f1e] flex items-center justify-center relative overflow-hidden">
        {channel.stream_icon ? (
          <img src={channel.stream_icon} alt={channel.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" loading="lazy" />
        ) : (
          <TvIcon className="w-8 h-8 text-gray-700" />
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-red-500">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase">Live</span>
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
            <PlayIcon className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="text-[13px] font-medium text-gray-200 group-hover:text-white truncate transition-colors">{channel.name}</h3>
      </div>
    </button>
  );
};

export default ChannelCard;
