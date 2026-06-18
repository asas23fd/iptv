import { usePlayer } from '../context/PlayerContext';
import { HistoryIcon, PlayIcon, ClockIcon } from '../components/Icons';

const History = () => {
  const { history, play } = usePlayer();

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return new Date(ts).toLocaleDateString('pt-BR');
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <HistoryIcon className="w-16 h-16 text-gray-700 mb-4" />
        <h2 className="text-lg font-bold text-white mb-1">Nenhum histórico</h2>
        <p className="text-gray-600 text-sm">Comece a assistir para ver seu histórico aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <HistoryIcon className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Histórico</h1>
          <p className="text-[11px] text-gray-600">{history.length} itens</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {history.map((item, i) => (
          <button key={i} onClick={() => play(item)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-indigo-500/20 transition-all group text-left">
            <div className="w-10 h-10 rounded-lg bg-[#0a0f1e] flex items-center justify-center overflow-hidden shrink-0">
              {item.icon ? <img src={item.icon} alt="" className="w-full h-full object-cover" /> : <PlayIcon className="w-4 h-4 text-gray-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-medium text-gray-200 group-hover:text-white truncate transition-colors">{item.name}</h3>
              <div className="flex items-center gap-2">
                {item.isLive && <span className="text-[10px] font-bold text-red-400">AO VIVO</span>}
                {item.category && <span className="text-[11px] text-gray-600">{item.category}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 shrink-0">
              <ClockIcon className="w-3 h-3" />
              <span>{formatTime(item.timestamp)}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-indigo-500 flex items-center justify-center shrink-0 transition-colors">
              <PlayIcon className="w-4 h-4 text-gray-500 group-hover:text-white ml-0.5 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default History;
