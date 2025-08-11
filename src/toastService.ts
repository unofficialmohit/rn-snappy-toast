import type { Animated } from 'react-native';
import type {
  ToastPosition,
  ToastAnimation,
  IconAnimationType,
} from './Toaster';

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
  showCloseButton?: boolean;
  opacity?: number;
  closeOnTap?: boolean;
  vibration?: boolean;
  customAnimation?: (animValue: Animated.Value) => any;
  backgroundColor?: string;
  textColor?: string;
  iconAnimationType?: IconAnimationType;
  progressBarColor?: string;
};

export type SwipeDirection =
  | 'horizontal'
  | 'vertical'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | ('left' | 'right' | 'up' | 'down')[];

type ShowFunction = (options: ToastOptions) => number | void;
type HideFunction = (id: number) => void; // Changed to required number

let toastShowRef: ShowFunction | null = null;
let toastHideRef: HideFunction | null = null;
let toastHideAllRef: (() => void) | null = null;

export const setToastRef = (
  show: ShowFunction | null,
  hide: HideFunction | null,
  hideAll: (() => void) | null
) => {
  toastShowRef = show;
  toastHideRef = hide;
  toastHideAllRef = hideAll;
};

export const showToast = (options: ToastOptions) => {
  if (toastShowRef) {
    return toastShowRef(options);
  } else {
    console.warn('🚨 Toaster is not mounted!');
  }
};

export const dismissToast = (id: number) => {
  // Now requires number
  if (toastHideRef) {
    toastHideRef(id);
  } else {
    console.warn('🚨 Toaster is not mounted!');
  }
};

export const dismissAllToasts = () => {
  if (toastHideAllRef) {
    toastHideAllRef();
  } else {
    console.warn('🚨 Toaster is not mounted!');
  }
};
