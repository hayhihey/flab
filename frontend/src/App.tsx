import React from 'react';
import { Router } from '@/Router';
import { ToastProvider } from '@/components/ui/Toast';
import '@/index.css';

function App() {
    // Force reload after router changes
  return (
    <ToastProvider>
      <Router />
    </ToastProvider>
  );
}

export default App;
