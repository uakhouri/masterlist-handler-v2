import { useCallback, useState } from 'react';

export function useConfirm() {
  const [state, setState] = useState({ open: false, options: null, resolve: null });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ open: false, options: null, resolve: null });
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState({ open: false, options: null, resolve: null });
  }, [state]);

  return {
    confirm,
    dialogProps: {
      open: state.open,
      ...state.options,
      onConfirm: handleConfirm,
      onCancel: handleCancel
    }
  };
}
