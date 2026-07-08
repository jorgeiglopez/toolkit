import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useWebSocket } from '../../hooks/useWebSocket';

export function Shell() {
  const { connected } = useWebSocket();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-(--color-canvas)">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header connected={connected} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
