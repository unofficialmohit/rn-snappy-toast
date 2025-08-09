import type { Animated } from 'react-native';
import type { ToastPosition, ToastAnimation, SwipeDirection } from './Toaster';
export type ToastOptions = {
  id?: number;
  richColors?: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'custom';
  duration?: number;
  title?: string;
  icon?: React.ReactNode;
  position?: ToastPosition;
  animationType?: ToastAnimation;
  onPress?: () => void;
  renderContent?: () => React.ReactNode;
  disableSwipe?: boolean;
  swipeDirection?: SwipeDirection;
  swipeThreshold?: number;
  progressBar?: boolean;
  hideCloseButton?: boolean;
  opacity?: number;
  closeOnTap?: boolean;
  vibration?: boolean;
  customAnimation?: (animValue: Animated.Value) => any;
  backgroundColor?: string;
  textColor?: string;
};

let toastRef: ((options: ToastOptions) => void) | null = null;

export const setToastRef = (ref: ((options: ToastOptions) => void) | null) => {
  toastRef = ref;
};

export const showToast = (options: ToastOptions) => {
  if (toastRef) {
    toastRef(options);
  } else {
    console.warn('🚨 Toaster is not mounted!');
  }
};
