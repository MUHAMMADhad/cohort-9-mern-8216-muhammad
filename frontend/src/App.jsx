import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import NoteEditor from "./components/NoteEditor.jsx";
import { AuthCard } from "./components/AuthCard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthCard />} />
        <Route path="/signup" element={<AuthCard />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notes" element={<Dashboard />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/notes/:id/edit" element={<NoteEditor />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/notes" replace />} />

        {/* Unknown Route */}
        <Route path="*" element={<Navigate to="/notes" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
