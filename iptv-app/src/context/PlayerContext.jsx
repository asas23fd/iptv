import { createContext, useContext, useState, useCallback } from 'react';

const PlayerContext = createContext(null);

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentStream, setCurrentStream] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState([]);

  const play = useCallback((stream) => {
    setCurrentStream(stream);
    setIsPlaying(true);
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.url !== stream.url);
      return [{ ...stream, timestamp: Date.now() }, ...filtered].slice(0, 50);
    });
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStream(null);
    setProgress(0);
    setDuration(0);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentStream, setCurrentStream,
        isPlaying, setIsPlaying,
        progress, setProgress,
        duration, setDuration,
        volume, setVolume,
        isMuted, setIsMuted,
        isFullscreen, setIsFullscreen,
        history,
        play, stop, togglePlay, toggleMute, toggleFullscreen,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
