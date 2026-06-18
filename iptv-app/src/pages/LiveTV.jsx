import { useState, useEffect, useMemo } from 'react';
import { getLiveStreams, getStreamUrl } from '../services/api';
import ChannelCard from '../components/ChannelCard';
import LoadingGrid from '../components/LoadingGrid';
import { TvIcon } from '../components/Icons';
import { useCategory } from '../context/CategoryContext';

const LiveTV = () => {
  const { selectedLiveCategory } = useCategory();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [search] = useState('');

  useEffect(() => {
    setChannelsLoading(true);
    getLiveStreams(selectedLiveCategory)
      .then((data) => setChannels(data.map((ch) => ({ ...ch, streamUrl: getStreamUrl(ch.stream_id) }))))
      .catch(console.error)
      .finally(() => { setLoading(false); setChannelsLoading(false); });
  }, [selectedLiveCategory]);

  const filtered = useMemo(() => {
    if (!search.trim()) return channels;
    const q = search.toLowerCase();
    return channels.filter((ch) => ch.name?.toLowerCase().includes(q));
  }, [channels, search]);

  if (loading || channelsLoading) return <LoadingGrid />;

  if (filtered.length === 0) {
    return <div className="text-center py-16"><TvIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 text-sm">Nenhum canal encontrado</p></div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {filtered.map((ch) => <ChannelCard key={ch.stream_id} channel={ch} />)}
    </div>
  );
};

export default LiveTV;
