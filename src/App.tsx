import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BillPage from './pages/BillPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="bill/:billId" element={<BillPage />} />
      </Route>
    </Routes>
  );
}

export default App;
