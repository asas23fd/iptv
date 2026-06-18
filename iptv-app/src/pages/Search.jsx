import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getLiveStreams, getVodStreams, getSeries, getStreamUrl } from '../services/api';
import ChannelCard from '../components/ChannelCard';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import { SearchIcon, TvIcon, FilmIcon, SeriesIcon, SpinnerIcon } from '../components/Icons';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ channels: [], movies: [], series: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    Promise.all([getLiveStreams(), getVodStreams(), getSeries()])
      .then(([live, vod, ser]) => {
        const q = query.toLowerCase();
        setResults({
          channels: live.filter((ch) => ch.name?.toLowerCase().includes(q)).slice(0, 30).map((ch) => ({ ...ch, streamUrl: getStreamUrl(ch.stream_id) })),
          movies: vod.filter((m) => m.name?.toLowerCase().includes(q)).slice(0, 30),
          series: ser.filter((s) => s.name?.toLowerCase().includes(q)).slice(0, 30),
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  const total = results.channels.length + results.movies.length + results.series.length;

  if (loading) return <div className="flex items-center justify-center py-24"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <SearchIcon className="w-16 h-16 text-gray-700 mb-4" />
        <h2 className="text-lg font-bold text-white mb-1">Pesquisar</h2>
        <p className="text-gray-600 text-sm">Use a barra de pesquisa para encontrar conteúdo</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <SearchIcon className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Resultados para "{query}"</h1>
          <p className="text-[11px] text-gray-600">{total} resultados</p>
        </div>
      </div>

      {results.channels.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3"><TvIcon className="w-4 h-4 text-indigo-400" /><h2 className="text-sm font-bold text-white">Canais ({results.channels.length})</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {results.channels.map((ch) => <ChannelCard key={ch.stream_id} channel={ch} />)}
          </div>
        </section>
      )}

      {results.movies.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3"><FilmIcon className="w-4 h-4 text-purple-400" /><h2 className="text-sm font-bold text-white">Filmes ({results.movies.length})</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {results.movies.map((m) => <MovieCard key={m.stream_id} movie={m} />)}
          </div>
        </section>
      )}

      {results.series.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3"><SeriesIcon className="w-4 h-4 text-pink-400" /><h2 className="text-sm font-bold text-white">Séries ({results.series.length})</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {results.series.map((s) => <SeriesCard key={s.series_id} series={s} />)}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="text-center py-16"><SearchIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 text-sm">Nenhum resultado para "{query}"</p></div>
      )}
    </div>
  );
};

export default Search;
