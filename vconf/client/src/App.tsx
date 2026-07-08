import { Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import Memory from './pages/Memory';
import Settings from './pages/Settings';
import Agents from './pages/Agents';
import Skills from './pages/Skills';
import Hooks from './pages/Hooks';
import Mcp from './pages/Mcp';
import Rules from './pages/Rules';
import Plugins from './pages/Plugins';
import Keybindings from './pages/Keybindings';
import Statusline from './pages/Statusline';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/hooks" element={<Hooks />} />
        <Route path="/mcp" element={<Mcp />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/keybindings" element={<Keybindings />} />
        <Route path="/statusline" element={<Statusline />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
