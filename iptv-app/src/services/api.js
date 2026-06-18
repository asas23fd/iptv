import axios from 'axios';

const BASE_URL = 'https://tv5play.xyz';
const USERNAME = 'Gabriel2840';
const PASSWORD = '253ADMqwn';

// Force HTTPS on any URL
const forceHttps = (url) => {
  if (!url) return url;
  return url.replace(/^http:\/\//i, 'https://');
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export const auth = async () => {
  try {
    const { data } = await api.get('/player_api.php', {
      params: { username: USERNAME, password: PASSWORD },
    });
    return data;
  } catch (err) {
    return { user_info: { auth: 0 } };
  }
};

export const getLiveCategories = async () => {
  const { data } = await api.get('/player_api.php', {
    params: { username: USERNAME, password: PASSWORD, action: 'get_live_categories' },
  });
  return data || [];
};

export const getLiveStreams = async (categoryId) => {
  const params = { username: USERNAME, password: PASSWORD, action: 'get_live_streams' };
  if (categoryId) params.category_id = categoryId;
  const { data } = await api.get('/player_api.php', { params });
  return data || [];
};

export const getVodCategories = async () => {
  const { data } = await api.get('/player_api.php', {
    params: { username: USERNAME, password: PASSWORD, action: 'get_vod_categories' },
  });
  return data || [];
};

export const getVodStreams = async (categoryId) => {
  const params = { username: USERNAME, password: PASSWORD, action: 'get_vod_streams' };
  if (categoryId) params.category_id = categoryId;
  const { data } = await api.get('/player_api.php', { params });
  return data || [];
};

export const getVodInfo = async (vodId) => {
  const { data } = await api.get('/player_api.php', {
    params: { username: USERNAME, password: PASSWORD, action: 'get_vod_info', vod_id: vodId },
  });
  return data;
};

export const getSeriesCategories = async () => {
  const { data } = await api.get('/player_api.php', {
    params: { username: USERNAME, password: PASSWORD, action: 'get_series_categories' },
  });
  return data || [];
};

export const getSeries = async (categoryId) => {
  const params = { username: USERNAME, password: PASSWORD, action: 'get_series' };
  if (categoryId) params.category_id = categoryId;
  const { data } = await api.get('/player_api.php', { params });
  return data || [];
};

export const getSeriesInfo = async (seriesId) => {
  const { data } = await api.get('/player_api.php', {
    params: { username: USERNAME, password: PASSWORD, action: 'get_series_info', series_id: seriesId },
  });
  return data;
};

export const getStreamUrl = (streamId, extension = 'm3u8') => {
  return forceHttps(`${BASE_URL}/live/${USERNAME}/${PASSWORD}/${streamId}.${extension}`);
};

export const getMovieUrl = (streamId, extension = 'mp4') => {
  return forceHttps(`${BASE_URL}/movie/${USERNAME}/${PASSWORD}/${streamId}.${extension}`);
};

export const getSeriesUrl = (streamId, extension = 'mp4') => {
  return forceHttps(`${BASE_URL}/series/${USERNAME}/${PASSWORD}/${streamId}.${extension}`);
};

export const getEpg = async (streamId) => {
  const { data } = await api.get('/player_api.php', {
    params: { username: USERNAME, password: PASSWORD, action: 'get_short_epg', stream_id: streamId },
  });
  return data;
};

export default api;
