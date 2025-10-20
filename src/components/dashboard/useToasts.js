import { useContext } from 'react';
import { ToastContext } from './toastContext.js';

export function useToasts(){
  return useContext(ToastContext);
}

export default useToasts;
