import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import ResidentDashboard from './pages/Resident/ResidentDashboard.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MyApartment from './pages/Apartment/MyApartment';
import Payments from './pages/Payments/Payments';
import Complaints from './pages/Complaints/Complaints';
import Notices from './pages/Notices/Notices';
import AdminNotices from './pages/AdminNotices/AdminNotices';
import AdminApartments from './pages/AdminApartments/AdminApartments';
import AdminResidents from './pages/AdminResidents/AdminResidents';
import AdminPayments from './pages/AdminPayments/AdminPayments';
import AdminComplaints from './pages/AdminComplaints/AdminComplaints';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/resident" element={<ResidentDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/apartment" element={<MyApartment />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/admin/notices" element={<AdminNotices />} />
        <Route path="/admin/apartments" element={<AdminApartments />} />
        <Route path="/admin/residents" element={<AdminResidents />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
