import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Easing,
  Dimensions,
  type ViewStyle,
  type TextStyle,
  PanResponder,
  Platform,
  Vibration,
} from 'react-native';
import { setToastRef, type ToastOptions } from './toastService';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_DURATION = 3000;
const SWIPE_THRESHOLD = 100;
const MAX_TOAST_WIDTH = 400;

export type ToastPosition = 'top' | 'bottom' | 'center';
export type ToastAnimation =
  | 'slide'
  | 'scale'
  | 'fade'
  | 'slideFromLeft'
  | 'slideFromRight'
  | 'bounce'
  | 'flip'
  | 'zoom'
  | 'rotate'
  | 'swing'
  | 'slideFromTop'
  | 'slideFromBottom'
  | 'slideFromCenter'
  | 'slideFromCorner';

export type SwipeDirection =
  | 'horizontal'
  | 'vertical'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | ('left' | 'right' | 'up' | 'down')[];

interface ToasterProps {
  position?: ToastPosition;
  offset?: number;
  maxToasts?: number;
  animationType?: ToastAnimation;
  animationDuration?: number;
  swipeEnabled?: boolean;
  swipeDirection?: SwipeDirection;
  swipeThreshold?: number;
  hideCloseButton?: boolean;
  customStyles?: {
    container?: ViewStyle;
    toast?: ViewStyle;
    text?: TextStyle;
    title?: TextStyle;
    progress?: ViewStyle;
    icon?: ViewStyle;
    closeButton?: ViewStyle;
  };
  richColors?: boolean;
}

export const Toaster = ({
  position = 'top',
  offset = 50,
  maxToasts = 3,
  animationType = 'slide',
  animationDuration = 300,
  swipeEnabled = true,
  swipeDirection = 'horizontal',
  swipeThreshold = SWIPE_THRESHOLD,
  hideCloseButton = false,
  customStyles = {},
  richColors = false,
}: ToasterProps = {}) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);
  const toastIdCounter = useRef(0);

  const show = useCallback(
    (options: ToastOptions) => {
      const id = ++toastIdCounter.current;
      const _position = options.position || position;
      const animation = options.animationType || animationType;

      setToasts((prev) => {
        const newToast = {
          ...options,
          id,
          _position,
          animationType: animation,
          hideCloseButton: options.hideCloseButton ?? hideCloseButton,
        };

        const updatedToasts = [...prev, newToast];
        return updatedToasts.length > maxToasts
          ? updatedToasts.slice(updatedToasts.length - maxToasts)
          : updatedToasts;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maxToasts, animationType, position, hideCloseButton]
  );

  useEffect(() => {
    setToastRef(show);
    return () => setToastRef(null);
  }, [show]);

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.globalContainer} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          animationType={toast.animationType as ToastAnimation}
          animationDuration={animationDuration}
          position={toast.position as ToastPosition}
          offset={offset}
          customStyles={customStyles}
          onClose={() => hideToast(toast.id!)}
          swipeEnabled={swipeEnabled && !toast.disableSwipe}
          swipeDirection={toast.swipeDirection || swipeDirection}
          swipeThreshold={toast.swipeThreshold || swipeThreshold}
          richColors={toast.richColors ?? richColors}
        />
      ))}
    </View>
  );
};

interface ToastItemProps {
  toast: ToastOptions;
  animationType: ToastAnimation;
  animationDuration: number;
  position: ToastPosition;
  offset: number;
  customStyles: ToasterProps['customStyles'];
  onClose: () => void;
  swipeEnabled: boolean;
  swipeDirection: SwipeDirection;
  swipeThreshold: number;
  richColors: boolean;
}

const ToastItem = ({
  toast,
  animationType,
  animationDuration,
  position,
  offset,
  customStyles,
  onClose,
  swipeEnabled,
  swipeDirection,
  swipeThreshold,
  richColors,
}: ToastItemProps) => {
  const {
    message,
    type = 'info',
    title,
    icon,
    duration = DEFAULT_DURATION,
    onPress,
    renderContent,
    progressBar = false,
    hideCloseButton = false,
    opacity = 1,
    closeOnTap = true,
    vibration,
    customAnimation,
    backgroundColor,
    textColor,
  } = toast;

  const animatedValue = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const isClosing = useRef(false);
  const hasPressed = useRef(false);

  const getAllowedDirections = (): ('left' | 'right' | 'up' | 'down')[] => {
    if (Array.isArray(swipeDirection)) return swipeDirection;

    switch (swipeDirection) {
      case 'horizontal':
        return ['left', 'right'];
      case 'vertical':
        return ['up', 'down'];
      case 'left':
        return ['left'];
      case 'right':
        return ['right'];
      case 'up':
        return ['up'];
      case 'down':
        return ['down'];
      default:
        return ['left', 'right'];
    }
  };

  const allowedDirections = getAllowedDirections();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => swipeEnabled,
      onMoveShouldSetPanResponder: () => swipeEnabled,
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;

        if (
          allowedDirections.includes('left') ||
          allowedDirections.includes('right')
        ) {
          pan.x.setValue(dx);
        }

        if (
          allowedDirections.includes('up') ||
          allowedDirections.includes('down')
        ) {
          pan.y.setValue(dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const { dx, dy, vx, vy } = gesture;
        let shouldDismiss = false;
        let dismissDirection: 'left' | 'right' | 'up' | 'down' | null = null;

        // Fixed swipe direction detection with proper thresholds
        const isLeft =
          allowedDirections.includes('left') &&
          (dx < -swipeThreshold || (dx < -50 && vx < -0.5));
        const isRight =
          allowedDirections.includes('right') &&
          (dx > swipeThreshold || (dx > 50 && vx > 0.5));
        const isUp =
          allowedDirections.includes('up') &&
          (dy < -swipeThreshold || (dy < -50 && vy < -0.5));
        const isDown =
          allowedDirections.includes('down') &&
          (dy > swipeThreshold || (dy > 50 && vy > 0.5));

        if (isLeft) {
          shouldDismiss = true;
          dismissDirection = 'left';
        } else if (isRight) {
          shouldDismiss = true;
          dismissDirection = 'right';
        } else if (isUp) {
          shouldDismiss = true;
          dismissDirection = 'up';
        } else if (isDown) {
          shouldDismiss = true;
          dismissDirection = 'down';
        }

        if (shouldDismiss && dismissDirection) {
          const targetPosition = {
            left: -SCREEN_WIDTH,
            right: SCREEN_WIDTH,
            up: -SCREEN_HEIGHT,
            down: SCREEN_HEIGHT,
          }[dismissDirection];

          Animated.timing(pan, {
            toValue:
              dismissDirection === 'left' || dismissDirection === 'right'
                ? { x: targetPosition, y: 0 }
                : { x: 0, y: targetPosition },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            // Clean up pan listeners before closing
            pan.x.removeAllListeners();
            pan.y.removeAllListeners();
            onClose();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 10,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    if (vibration && Platform.OS === 'android') {
      Vibration.vibrate(50);
    }

    if (progressBar) {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: animationDuration,
      easing: getEasingFunction(animationType, true),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      if (!hasPressed.current) closeWithAnimation();
    }, duration);

    return () => {
      clearTimeout(timer);
      progressAnim.stopAnimation();
      // Clean up pan listeners on unmount
      pan.x.removeAllListeners?.();
      pan.y.removeAllListeners?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeWithAnimation = () => {
    if (isClosing.current) return;
    isClosing.current = true;

    Animated.timing(animatedValue, {
      toValue: 0,
      duration: animationDuration,
      easing: getEasingFunction(animationType, false),
      useNativeDriver: true,
    }).start(() => {
      // Clean up pan listeners before closing
      pan.x.removeAllListeners?.();
      pan.y.removeAllListeners?.();
      onClose();
    });
  };

  const handlePress = () => {
    if (onPress) {
      hasPressed.current = true;
      onPress();
    }

    if (closeOnTap && !isClosing.current) {
      closeWithAnimation();
    }
  };

  const getAnimationStyle = () => {
    if (customAnimation) {
      return customAnimation(animatedValue);
    }

    const animationStyle = getBaseAnimation(
      animatedValue,
      animationType,
      position
    );
    return {
      ...animationStyle,
      opacity: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, opacity],
      }),
      transform: [
        ...(animationStyle.transform || []),
        ...pan.getTranslateTransform(),
      ],
    };
  };

  const getPositionStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
    };

    switch (position) {
      case 'top':
        return { ...baseStyle, top: offset };
      case 'bottom':
        return { ...baseStyle, bottom: offset };
      case 'center':
        return {
          ...baseStyle,
          top: SCREEN_HEIGHT / 2 - 50,
          justifyContent: 'center',
        };
      default:
        return { ...baseStyle, top: offset };
    }
  };

  const getIcon = () => {
    if (icon) return icon;

    const iconColor = getIconColor();

    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color={iconColor} />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color={iconColor} />;
      case 'info':
        return (
          <Ionicons name="information-circle" size={24} color={iconColor} />
        );
      case 'warning':
        return <Ionicons name="warning" size={24} color={iconColor} />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;

    if (richColors) {
      switch (type) {
        case 'success':
          return '#D1FAE5';
        case 'error':
          return '#FEE2E2';
        case 'info':
          return '#DBEAFE';
        case 'warning':
          return '#FEF3C7';
        default:
          return '#E0F2FE';
      }
    }

    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'info':
        return '#3B82F6';
      case 'warning':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  const getTextColor = () => {
    if (textColor) return textColor;

    if (richColors) {
      switch (type) {
        case 'success':
          return '#065F46';
        case 'error':
          return '#B91C1C';
        case 'info':
          return '#1E40AF';
        case 'warning':
          return '#92400E';
        default:
          return '#1E3A8A';
      }
    }

    return '#fff';
  };

  const getIconColor = () => {
    return richColors ? getTextColor() : '#fff';
  };

  return (
    <Animated.View
      style={[
        getPositionStyle(),
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
      pointerEvents="box-none"
      {...panResponder.panHandlers} // Moved pan handlers to outer container
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.touchableContainer}
      >
        <Animated.View
          style={[
            styles.toast,
            { backgroundColor: getBackgroundColor() },
            getAnimationStyle(),
            customStyles?.toast,
          ]}
        >
          {progressBar && (
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: `rgba(255,255,255,${opacity > 0.7 ? 0.5 : 0.3})`,
                },
                customStyles?.progress,
              ]}
            />
          )}

          {renderContent ? (
            renderContent()
          ) : (
            <View style={styles.contentContainer}>
              {getIcon() && (
                <View style={[styles.icon, customStyles?.icon]}>
                  {getIcon()}
                </View>
              )}
              <View style={styles.textContainer}>
                {title && (
                  <Text
                    style={[
                      styles.title,
                      { color: getTextColor() },
                      customStyles?.title,
                    ]}
                  >
                    {title}
                  </Text>
                )}
                <Text
                  style={[
                    styles.toastText,
                    { color: getTextColor() },
                    customStyles?.text,
                  ]}
                >
                  {message}
                </Text>
              </View>
              {!hideCloseButton && (
                <TouchableOpacity
                  onPress={closeWithAnimation}
                  style={[styles.closeButton, customStyles?.closeButton]}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={richColors ? '#64748B' : 'rgba(255,255,255,0.7)'}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getEasingFunction = (type: ToastAnimation, isEntering: boolean) => {
  switch (type) {
    case 'bounce':
      return Easing.elastic(isEntering ? 1 : 0.5);
    case 'swing':
      return Easing.bezier(0.25, 0.1, 0.25, 1);
    case 'flip':
      return Easing.out(Easing.cubic);
    case 'zoom':
    case 'rotate':
      return Easing.out(Easing.exp);
    default:
      return Easing.out(Easing.cubic);
  }
};

const getBaseAnimation = (
  animValue: Animated.Value,
  type: ToastAnimation,
  position: ToastPosition
) => {
  const inputRange = [0, 1];

  switch (type) {
    case 'slide':
      const translateY = animValue.interpolate({
        inputRange,
        outputRange: position === 'top' ? [-100, 0] : [100, 0],
      });
      return { transform: [{ translateY }] };

    case 'scale':
      const scale = animValue.interpolate({
        inputRange,
        outputRange: [0.7, 1],
      });
      return { transform: [{ scale }] };

    case 'fade':
      return { opacity: animValue };

    case 'slideFromLeft':
      const translateXLeft = animValue.interpolate({
        inputRange,
        outputRange: [-SCREEN_WIDTH, 0],
      });
      return { transform: [{ translateX: translateXLeft }] };

    case 'slideFromRight':
      const translateXRight = animValue.interpolate({
        inputRange,
        outputRange: [SCREEN_WIDTH, 0],
      });
      return { transform: [{ translateX: translateXRight }] };

    case 'bounce':
      const bounceY = animValue.interpolate({
        inputRange: [0, 0.6, 0.75, 0.9, 1],
        outputRange:
          position === 'top' ? [-300, 25, -10, 5, 0] : [300, -25, 10, -5, 0],
      });
      return { transform: [{ translateY: bounceY }] };

    case 'flip':
      const rotateY = animValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['90deg', '0deg', '0deg'],
      });
      return {
        transform: [{ perspective: 1000 }, { rotateY }],
      };

    case 'zoom':
      const zoomScale = animValue.interpolate({
        inputRange,
        outputRange: [0.3, 1],
      });
      return { transform: [{ scale: zoomScale }] };

    case 'rotate':
      const rotate = animValue.interpolate({
        inputRange,
        outputRange: ['-180deg', '0deg'],
      });
      return { transform: [{ rotate }] };

    case 'swing':
      const swingRotate = animValue.interpolate({
        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
        outputRange: ['-30deg', '15deg', '-10deg', '5deg', '-2deg', '0deg'],
      });
      return { transform: [{ rotate: swingRotate }] };

    case 'slideFromTop':
      const translateYTop = animValue.interpolate({
        inputRange,
        outputRange: position === 'top' ? [-100, 0] : [-SCREEN_HEIGHT, 0],
      });
      return { transform: [{ translateY: translateYTop }] };

    case 'slideFromBottom':
      const translateYBottom = animValue.interpolate({
        inputRange,
        outputRange: position === 'bottom' ? [100, 0] : [SCREEN_HEIGHT, 0],
      });
      return { transform: [{ translateY: translateYBottom }] };

    case 'slideFromCenter':
      return {
        opacity: animValue,
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1],
            }),
          },
        ],
      };

    case 'slideFromCorner':
      return {
        opacity: animValue,
        transform: [
          {
            translateX: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-SCREEN_WIDTH, 0],
            }),
          },
          {
            translateY: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-SCREEN_HEIGHT, 0],
            }),
          },
        ],
      };

    default:
      return { opacity: animValue };
  }
};

const styles = StyleSheet.create({
  globalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
    pointerEvents: 'box-none',
  },
  touchableContainer: {
    marginVertical: 6,
    width: SCREEN_WIDTH * 0.9,
    maxWidth: MAX_TOAST_WIDTH,
  },
  toast: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  toastText: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
  },
});
