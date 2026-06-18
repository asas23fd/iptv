import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Player from './pages/Player';

const App = () => {
  return (
    <BrowserRouter basename="/iptv">
      <AuthProvider>
        <PlayerProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Home />} />
            </Route>
            <Route path="/player" element={<Player />} />
          </Routes>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
