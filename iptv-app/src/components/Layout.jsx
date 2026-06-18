import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e5e5e5',
      overflow: 'hidden',
    }}>
      <Outlet />
    </div>
  );
};

export default Layout;
