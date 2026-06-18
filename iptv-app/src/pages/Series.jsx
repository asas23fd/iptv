import { useState, useEffect, useMemo } from 'react';
import { getSeries } from '../services/api';
import SeriesCard from '../components/SeriesCard';
import LoadingGrid from '../components/LoadingGrid';
import { SeriesIcon } from '../components/Icons';
import { useCategory } from '../context/CategoryContext';

const Series = () => {
  const { selectedSeriesCategory } = useCategory();
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [search] = useState('');

  useEffect(() => {
    setSeriesLoading(true);
    getSeries(selectedSeriesCategory)
      .then(setSeriesList)
      .catch(console.error)
      .finally(() => { setLoading(false); setSeriesLoading(false); });
  }, [selectedSeriesCategory]);

  const filtered = useMemo(() => {
    if (!search.trim()) return seriesList;
    const q = search.toLowerCase();
    return seriesList.filter((s) => s.name?.toLowerCase().includes(q));
  }, [seriesList, search]);

  if (loading || seriesLoading) return <LoadingGrid type="movie" />;

  if (filtered.length === 0) {
    return <div className="text-center py-16"><SeriesIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 text-sm">Nenhuma série encontrada</p></div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {filtered.map((s) => <SeriesCard key={s.series_id} series={s} />)}
    </div>
  );
};

export default Series;
