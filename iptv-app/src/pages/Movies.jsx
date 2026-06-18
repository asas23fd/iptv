import { useState, useEffect, useMemo } from 'react';
import { getVodStreams } from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingGrid from '../components/LoadingGrid';
import { FilmIcon } from '../components/Icons';
import { useCategory } from '../context/CategoryContext';

const Movies = () => {
  const { selectedVodCategory } = useCategory();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [search] = useState('');

  useEffect(() => {
    setMoviesLoading(true);
    getVodStreams(selectedVodCategory)
      .then(setMovies)
      .catch(console.error)
      .finally(() => { setLoading(false); setMoviesLoading(false); });
  }, [selectedVodCategory]);

  const filtered = useMemo(() => {
    if (!search.trim()) return movies;
    const q = search.toLowerCase();
    return movies.filter((m) => m.name?.toLowerCase().includes(q));
  }, [movies, search]);

  if (loading || moviesLoading) return <LoadingGrid type="movie" />;

  if (filtered.length === 0) {
    return <div className="text-center py-16"><FilmIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 text-sm">Nenhum filme encontrado</p></div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {filtered.map((m) => <MovieCard key={m.stream_id} movie={m} />)}
    </div>
  );
};

export default Movies;
