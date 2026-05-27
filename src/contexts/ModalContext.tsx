'use client';

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ModalType = 'alert' | 'confirm' | 'quota-exhausted' | 'success' | 'error' | 'delete';

export interface ModalAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void | Promise<void>;
}

export interface ModalConfig {
  type: ModalType;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions: ModalAction[];
  /** auto-close on action click (default true) */
  closeOnAction?: boolean;
}

interface ModalState extends ModalConfig {
  open: boolean;
  resolve?: (value: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface AlertOptions {
  title: string;
  description?: string;
  type?: ModalType;
  variant?: 'default' | 'danger';
}

interface ConfirmOptions {
  title: string;
  description?: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

interface ModalContextValue {
  /** Show an alert-style modal (single button, returns void) */
  showAlert: (titleOrOptions: string | AlertOptions, description?: string, type?: ModalType) => void;
  /** Alias for showAlert */
  alert: (titleOrOptions: string | AlertOptions, description?: string, type?: ModalType) => void;
  /** Show a confirm-style modal (two buttons, returns Promise<boolean>) */
  showConfirm: (titleOrOptions: string | ConfirmOptions, description?: string, type?: ModalType) => Promise<boolean>;
  /** Alias for showConfirm */
  confirm: (titleOrOptions: string | ConfirmOptions, description?: string, type?: ModalType) => Promise<boolean>;
  /** Show a custom modal */
  showCustom: (config: ModalConfig) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({
    open: false,
    type: 'alert',
    title: '',
    description: '',
    actions: [],
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const handleClose = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  const showAlert = useCallback((titleOrOptions: string | AlertOptions, description?: string, type: ModalType = 'alert') => {
    const opts = typeof titleOrOptions === 'string' 
      ? { title: titleOrOptions, description, type } 
      : titleOrOptions;
    setState({
      open: true,
      type: opts.type || type,
      title: opts.title,
      description: opts.description || description,
      actions: [{ label: '我知道了', variant: opts.variant === 'danger' ? 'danger' : 'primary' }],
      closeOnAction: true,
    });
  }, []);

  const showConfirm = useCallback((titleOrOptions: string | ConfirmOptions, description?: string, type: ModalType = 'confirm') => {
    const opts = typeof titleOrOptions === 'string' 
      ? { title: titleOrOptions, description, type } 
      : titleOrOptions;
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({
        open: true,
        type: opts.type || type,
        title: opts.title,
        description: opts.description || description,
        actions: [
          { label: opts.cancelText || '取消', variant: 'secondary' },
          { label: opts.confirmText || '确认', variant: opts.variant === 'danger' ? 'danger' : ((opts.type || type) === 'delete' ? 'danger' : 'primary') },
        ],
        closeOnAction: true,
      });
    });
  }, []);

  const showCustom = useCallback((config: ModalConfig) => {
    setState({ ...config, open: true, closeOnAction: config.closeOnAction ?? true });
  }, []);

  const handleAction = useCallback(async (action: ModalAction) => {
    await action.onClick?.();
    if (state.closeOnAction !== false) {
      const isPrimary = action.variant === 'primary' || action.variant === 'danger';
      resolveRef.current?.(isPrimary);
      resolveRef.current = null;
      setState(prev => ({ ...prev, open: false }));
    }
  }, [state.closeOnAction]);

  return (
    <ModalContext.Provider value={{ showAlert, alert: showAlert, showConfirm, confirm: showConfirm, showCustom }}>
      {children}
      <GlobalModalRenderer state={state} onClose={handleClose} onAction={handleAction} />
    </ModalContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Renderer — the actual Modal UI                                     */
/* ------------------------------------------------------------------ */

function GlobalModalRenderer({
  state,
  onClose,
  onAction,
}: {
  state: ModalState;
  onClose: () => void;
  onAction: (action: ModalAction) => void;
}) {
  if (!state.open) return null;

  const getIcon = () => {
    switch (state.type) {
      case 'quota-exhausted':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
        );
      case 'delete':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[8px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className="relative w-[90vw] max-w-[420px] rounded-3xl bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/[0.06] shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Icon */}
        <div className="flex justify-center">
          {state.icon || getIcon()}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white/90 text-center mt-1">
          {state.title}
        </h3>

        {/* Description */}
        {state.description && (
          <p className="text-sm text-white/40 text-center mt-2 leading-relaxed">
            {state.description}
          </p>
        )}

        {/* Actions */}
        <div className={`mt-6 flex gap-3 ${state.actions.length > 1 ? 'flex-col sm:flex-row' : ''}`}>
          {state.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => onAction(action)}
              className={`h-11 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                action.variant === 'primary'
                  ? 'flex-1 bg-gradient-to-r from-[#7B61FF] to-[#5B8CFF] text-white hover:shadow-lg hover:shadow-[#7B61FF]/25'
                  : action.variant === 'danger'
                  ? 'flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/25'
                  : 'flex-1 bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:border-white/[0.12]'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
