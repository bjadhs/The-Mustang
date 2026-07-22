import { Route, Routes } from "react-router-dom";
import Experience from "./pages/Experience";
import PromptArchive from "./pages/PromptArchive";
import { ToastProvider } from "./components/Toast";
import { ReservationDialogProvider } from "./components/ReservationDialog";

export default function App() {
  return (
    <ToastProvider>
      <ReservationDialogProvider>
        <Routes>
          <Route path="/" element={<Experience />} />
          <Route path="/prompt" element={<PromptArchive />} />
        </Routes>
      </ReservationDialogProvider>
    </ToastProvider>
  );
}
