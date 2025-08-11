import { Routes, Route, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { BookAudio, Clock, Settings, Upload, Layers } from "lucide-react";

// Pages (je t’enverrai leurs fichiers ensuite)
import Convert from "./pages/Convert.jsx";
import History from "./pages/History.jsx";
import SettingsPage from "./pages/Settings.jsx";

export default function App() {
  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col gap-4 p-4 border-r border-slate-200 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2 p-3">
          <div className="h-9 w-9 rounded-xl bg-brand-600 text-white grid place-items-center">
            <BookAudio size={20} />
          </div>
          <div>
            <div className="font-semibold leading-5">Readcast</div>
            <div className="text-xs text-slate-500">PDF → Audiobook</div>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isActive ? "bg-brand-50 text-brand-700" : "hover:bg-slate-100"
                  }`
                }
              >
                <Upload size={18} /> Convertir
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isActive ? "bg-brand-50 text-brand-700" : "hover:bg-slate-100"
                  }`
                }
              >
                <Clock size={18} /> Historique
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isActive ? "bg-brand-50 text-brand-700" : "hover:bg-slate-100"
                  }`
                }
              >
                <Settings size={18} /> Paramètres
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="p-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Layers size={14} /> MVP
          </div>
          <div>v0.2.0</div>
        </div>
      </aside>

      {/* Main */}
      <main className="p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<Convert />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </motion.div>
      </main>
    </div>
  );
}
