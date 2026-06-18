import { createContext, useContext, useState, useEffect } from 'react';
import { getLiveCategories, getVodCategories, getSeriesCategories } from '../services/api';

const CategoryContext = createContext(null);

export const useCategory = () => useContext(CategoryContext) || {
  liveCategories: [], selectedLiveCategory: null, setSelectedLiveCategory: () => {},
  vodCategories: [], selectedVodCategory: null, setSelectedVodCategory: () => {},
  seriesCategories: [], selectedSeriesCategory: null, setSelectedSeriesCategory: () => {},
  loading: true,
};

export const CategoryProvider = ({ children }) => {
  const [liveCategories, setLiveCategories] = useState([]);
  const [vodCategories, setVodCategories] = useState([]);
  const [seriesCategories, setSeriesCategories] = useState([]);

  const [selectedLiveCategory, setSelectedLiveCategory] = useState(null);
  const [selectedVodCategory, setSelectedVodCategory] = useState(null);
  const [selectedSeriesCategory, setSelectedSeriesCategory] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLiveCategories(), getVodCategories(), getSeriesCategories()])
      .then(([live, vod, series]) => {
        setLiveCategories(live);
        setVodCategories(vod);
        setSeriesCategories(series);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        liveCategories, selectedLiveCategory, setSelectedLiveCategory,
        vodCategories, selectedVodCategory, setSelectedVodCategory,
        seriesCategories, selectedSeriesCategory, setSelectedSeriesCategory,
        loading,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;
