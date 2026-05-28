import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import BookingFlow from "./BookingFlow";
import AdminDashboard from "./AdminDashboard";

/**
 * App.jsx — top-level routing.
 *   /         -> LandingPage
 *   /booking  -> BookingFlow      (POSTs to the API)
 *   /admin    -> AdminDashboard   (reads from the API, key-gated)
 *   *         -> LandingPage      (catch-all)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingFlow />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
