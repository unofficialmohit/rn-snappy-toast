import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Easing,
  Dimensions,
  type ViewStyle,
  type TextStyle,
  PanResponder,
  Platform,
  Vibration,
  Image,
} from 'react-native';
import { setToastRef, type ToastOptions } from './toastService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_DURATION = 3000;
const SWIPE_THRESHOLD = 100;
const MAX_TOAST_WIDTH = 400;

const checkMarkImage = require('./assets/check-circle.png');
const crossImage = require('./assets/close.png');
const errorImage = require('./assets/close-circle.png');
const infoImage = require('./assets/info-circle.png');
const warningImage = require('./assets/warning.png');

export type ToastPosition = 'top' | 'bottom' | 'center';
export type ToastAnimation =
  | 'slide'
  | 'scale'
  | 'fade'
  | 'slideFromLeft'
  | 'slideFromRight'
  | 'bounce'
  | 'rotate'
  | 'slideFromTop'
  | 'slideFromBottom'
  | 'slideFromCorner';

export type IconAnimationType = 'pulse' | 'rotate' | 'bounce' | 'none';

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
  showCloseButton?: boolean;
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
  iconAnimationType?: IconAnimationType;
  progressBarColor?: string;
}

export const Toaster = ({
  position = 'top',
  offset = Platform.OS === 'android' ? 40 : 50,
  maxToasts = 3,
  animationType = 'slide',
  animationDuration = 300,
  swipeEnabled = true,
  swipeDirection = 'horizontal',
  swipeThreshold = SWIPE_THRESHOLD,
  showCloseButton = false,
  customStyles = {},
  richColors = false,
  iconAnimationType = 'none',
  progressBarColor,
}: ToasterProps = {}) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);
  const toastIdCounter = useRef(0);

  const show = useCallback(
    (options: ToastOptions) => {
      const id = ++toastIdCounter.current;
      const _position = options.position || position;

      setToasts((prev) => {
        const newToast = {
          ...options,
          id,
          _position,
          animationType: options.animationType || animationType,
          showCloseButton: options.showCloseButton ?? showCloseButton,
          iconAnimationType: options.iconAnimationType || iconAnimationType,
          progressBarColor: options.progressBarColor || progressBarColor,
        };

        const updatedToasts = [...prev, newToast];
        return updatedToasts.length > maxToasts
          ? updatedToasts.slice(updatedToasts.length - maxToasts)
          : updatedToasts;
      });
    },
    [
      maxToasts,
      position,
      showCloseButton,
      animationType,
      iconAnimationType,
      progressBarColor,
    ]
  );

  useEffect(() => {
    setToastRef(show);
    return () => setToastRef(null);
  }, [show]);

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

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
          iconAnimationType={toast.iconAnimationType as IconAnimationType}
          progressBarColor={toast.progressBarColor || progressBarColor}
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
  iconAnimationType: IconAnimationType;
  progressBarColor?: string;
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
  iconAnimationType,
  progressBarColor,
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
    showCloseButton = true,
    opacity = 1,
    closeOnTap = true,
    vibration,
    customAnimation,
    backgroundColor,
    textColor,
  } = toast;

  const animatedValue = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const iconAnim = useRef(
    new Animated.Value(iconAnimationType === 'pulse' ? 1 : 0)
  ).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const isClosing = useRef(false);
  const hasPressed = useRef(false);
  const iconAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const velocityThreshold = 0.5; // Minimum velocity to trigger swipe dismiss

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

        // Only move in allowed directions
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

        // Check swipe with velocity and distance thresholds
        if (
          allowedDirections.includes('left') &&
          (dx < -swipeThreshold ||
            (vx < -velocityThreshold && dx < -swipeThreshold / 2))
        ) {
          shouldDismiss = true;
          dismissDirection = 'left';
        } else if (
          allowedDirections.includes('right') &&
          (dx > swipeThreshold ||
            (vx > velocityThreshold && dx > swipeThreshold / 2))
        ) {
          shouldDismiss = true;
          dismissDirection = 'right';
        } else if (
          allowedDirections.includes('up') &&
          (dy < -swipeThreshold ||
            (vy < -velocityThreshold && dy < -swipeThreshold / 2))
        ) {
          shouldDismiss = true;
          dismissDirection = 'up';
        } else if (
          allowedDirections.includes('down') &&
          (dy > swipeThreshold ||
            (vy > velocityThreshold && dy > swipeThreshold / 2))
        ) {
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

    // Start icon animation if enabled
    if (iconAnimationType !== 'none') {
      startIconAnimation();
    }

    const timer = setTimeout(() => {
      if (!hasPressed.current) closeWithAnimation();
    }, duration);

    return () => {
      clearTimeout(timer);
      progressAnim.stopAnimation();
      pan.x.removeAllListeners?.();
      pan.y.removeAllListeners?.();

      // Stop icon animation
      if (iconAnimationRef.current) {
        iconAnimationRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startIconAnimation = () => {
    if (iconAnimationRef.current) {
      iconAnimationRef.current.stop();
    }

    const animationConfig = {
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    };

    switch (iconAnimationType) {
      case 'pulse':
        iconAnimationRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(iconAnim, {
              ...animationConfig,
              toValue: 1.2,
            }),
            Animated.timing(iconAnim, {
              ...animationConfig,
              toValue: 1,
            }),
          ])
        );
        break;

      case 'rotate':
        iconAnimationRef.current = Animated.loop(
          Animated.timing(iconAnim, {
            ...animationConfig,
            toValue: 1,
          })
        );
        break;

      case 'bounce':
        iconAnimationRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(iconAnim, {
              ...animationConfig,
              toValue: -10,
            }),
            Animated.timing(iconAnim, {
              ...animationConfig,
              toValue: 0,
            }),
          ])
        );
        break;

      default:
        return;
    }

    if (iconAnimationRef.current) {
      iconAnimationRef.current.start();
    }
  };

  const getIconAnimationStyle = () => {
    if (iconAnimationType === 'none') return {};

    switch (iconAnimationType) {
      case 'pulse':
        return {
          transform: [{ scale: iconAnim }],
        };

      case 'rotate':
        return {
          transform: [
            {
              rotate: iconAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        };

      case 'bounce':
        return {
          transform: [{ translateY: iconAnim }],
        };

      default:
        return {};
    }
  };

  const closeWithAnimation = () => {
    if (isClosing.current) return;
    isClosing.current = true;

    // Stop icon animation when closing
    if (iconAnimationRef.current) {
      iconAnimationRef.current.stop();
    }

    Animated.timing(animatedValue, {
      toValue: 0,
      duration: animationDuration,
      easing: getEasingFunction(animationType, false),
      useNativeDriver: true,
    }).start(() => {
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
        return (
          <Image
            source={checkMarkImage}
            style={{ height: 25, width: 25 }}
            tintColor={iconColor}
          />
        );
      case 'error':
        return (
          <Image
            source={errorImage}
            style={{ height: 25, width: 25 }}
            tintColor={iconColor}
          />
        );
      case 'info':
        return (
          <Image
            source={infoImage}
            style={{ height: 25, width: 25 }}
            tintColor={iconColor}
          />
        );
      case 'warning':
        return (
          <Image
            source={warningImage}
            style={{ height: 25, width: 25 }}
            tintColor={iconColor}
          />
        );
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
      style={[getPositionStyle(), { transform: pan.getTranslateTransform() }]}
      pointerEvents="box-none"
      {...panResponder.panHandlers}
    >
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.touchableContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.toast,
              { backgroundColor: getBackgroundColor() },
              getAnimationStyle(),
              customStyles?.toast,
            ]}
            pointerEvents="auto"
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
                    backgroundColor:
                      progressBarColor || richColors
                        ? getTextColor()
                        : `rgba(255,255,255,${opacity > 0.7 ? 0.5 : 0.3})`,
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
                  <Animated.View
                    style={[
                      styles.icon,
                      customStyles?.icon,
                      getIconAnimationStyle(),
                    ]}
                  >
                    {getIcon()}
                  </Animated.View>
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
                {showCloseButton && (
                  <TouchableWithoutFeedback
                    onPress={closeWithAnimation}
                    style={[styles.closeButton, customStyles?.closeButton]}
                  >
                    <Image
                      source={crossImage}
                      style={{ height: 12, width: 12 }}
                      tintColor={
                        richColors ? '#64748B' : 'rgba(255,255,255,0.7)'
                      }
                    />
                  </TouchableWithoutFeedback>
                )}
              </View>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const getEasingFunction = (type: ToastAnimation, isEntering: boolean) => {
  switch (type) {
    case 'bounce':
      return isEntering ? Easing.out(Easing.quad) : Easing.in(Easing.quad);
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
        outputRange: [0.85, 1],
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
        inputRange: [0, 0.4, 0.6, 0.8, 1],
        outputRange:
          position === 'top' ? [-300, 10, -5, 2, 0] : [300, -10, 5, -2, 0],
      });
      return { transform: [{ translateY: bounceY }] };

    case 'rotate':
      const rotate = animValue.interpolate({
        inputRange,
        outputRange: ['0deg', '360deg'],
      });
      return { transform: [{ rotate }] };

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
    zIndex: 999999,
    elevation: 999999,
    pointerEvents: 'box-none',
  },
  touchableContainer: {
    marginVertical: 6,
    width: SCREEN_WIDTH * 0.9,
    maxWidth: MAX_TOAST_WIDTH,
  },
  toast: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
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
    marginLeft: 3,
  },
  toastText: {
    fontSize: 12,
    lineHeight: 15,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
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
