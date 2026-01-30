import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/context/store';
export const ProtectedRoute = ({ children, requiredRole, }) => {
    const navigate = useNavigate();
    const { isAuthenticated, role, loadFromStorage } = useAuthStore();
    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        if (requiredRole && role !== requiredRole) {
            navigate('/auth');
        }
    }, [isAuthenticated, role, requiredRole, navigate]);
    if (!isAuthenticated) {
        return null;
    }
    if (requiredRole && role !== requiredRole) {
        return null;
    }
    return _jsx(_Fragment, { children: children });
};
