import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserApp from './UserApp';
import AdminAppRoot from './AdminApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes — AdminAppRoot handles its own login/auth internally */}
        <Route path="/admin/*" element={<AdminAppRoot />} />
        {/* User routes — catch-all */}
        <Route path="/*" element={<UserApp />} />
      </Routes>
    </BrowserRouter>
  );
}
