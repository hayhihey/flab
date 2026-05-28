class ToastManager {
    constructor() {
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "toasts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notify() {
        this.listeners.forEach(listener => listener([...this.toasts]));
    }
    show(message, type = 'info', duration = 3000) {
        const id = Math.random().toString(36).substring(7);
        const toast = { id, message, type, duration };
        this.toasts.push(toast);
        this.notify();
        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }
        return id;
    }
    dismiss(id) {
        this.toasts = this.toasts.filter(t => t.id !== id);
        this.notify();
    }
    success(message, duration) {
        return this.show(message, 'success', duration);
    }
    error(message, duration) {
        return this.show(message, 'error', duration);
    }
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
}
export const toast = new ToastManager();
