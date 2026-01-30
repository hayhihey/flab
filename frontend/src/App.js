import { jsx as _jsx } from "react/jsx-runtime";
import { Router } from '@/Router';
import { ToastProvider } from '@/components/ui/Toast';
import '@/index.css';
function App() {
    return (_jsx(ToastProvider, { children: _jsx(Router, {}) }));
}
export default App;
