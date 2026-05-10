import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import AboutPage from './pages/AboutPage';
import DatasetDetailPage from './pages/DatasetDetailPage';
import DatasetsPage from './pages/DatasetsPage';
import HomePage from './pages/HomePage';
import ModelDetailPage from './pages/ModelDetailPage';
import ModelsPage from './pages/ModelsPage';
import { navigation } from './data';

function SiteLayout() {
  return (
    <>
      <header className="topbar app-shell">
        <NavLink className="brand" to="/">
          <span className="brand-mark">BM</span>
          <span>
            Building ML
            <small>Construction intelligence hub</small>
          </span>
        </NavLink>

        <nav className="navbar" aria-label="Primary">
          {navigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) => (isActive ? 'active-nav' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <NavLink className="navbar-cta" to="/models">
          Explore models
        </NavLink>
      </header>

      <Outlet />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="models/:modelId" element={<ModelDetailPage />} />
        <Route path="datasets" element={<DatasetsPage />} />
        <Route path="datasets/:datasetId" element={<DatasetDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
