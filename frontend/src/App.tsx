import React from 'react';
import { Router } from '@/Router';
import { ToastProvider } from '@/components/ui/Toast';
import { ToastContainer } from '@/components/ui/ToastContainer';
import '@/index.css';

function App() {
  return (
    <ToastProvider>
      <Router />
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
