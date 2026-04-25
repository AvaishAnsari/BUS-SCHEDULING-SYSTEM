import { useState, useCallback } from 'react';

let toastId = 0;
let setToastsGlobal = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  setToastsGlobal = setToasts;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function toast(message, type = 'info') {
  if (!setToastsGlobal) return;
  const id = ++toastId;
  setToastsGlobal(prev => [...prev, { id, message, type }]);
  setTimeout(() => setToastsGlobal(prev => prev.filter(t => t.id !== id)), 3500);
}
