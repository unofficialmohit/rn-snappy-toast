# rn-snappy-toast 🚀

`rn-snappy-toast` is a lightweight, customizable, and smooth toast notification library for React Native (Expo or React Native CLI). It provides multiple toast types, rich colors, gesture-based dismissal, and animation styles out of the box.

## Features ✨

- 🚀 **Fast & Smooth** — minimal re-renders and fluid animations
- 🎨 **Customizable** — position, duration, colors, animations, and more
- 📱 **Multiple Types** — success, error, info, warning, and custom
- 🎭 **Various Animations** — slide, fade, bounce, flip, etc.
- 👆 **Gesture Support** — swipe to dismiss
- ⏱ **Auto-dismiss** — with optional progress bar
- 📍 **Position Anywhere** — top, bottom, or center
- 📦 **Works with Expo & React Native CLI**

---

## Installation 📦

```sh
npm install rn-snappy-toast
# or
yarn add rn-snappy-toast
```

## Screenshots
<img width="1080" height="2400" alt="Screenshot_1754738179" src="https://github.com/user-attachments/assets/91c66ba6-5335-46fe-9bec-94d566cc1e88" />
<img width="1080" height="2400" alt="Screenshot_1754738177" src="https://github.com/user-attachments/assets/62c1604b-53bb-48fd-9b38-897f09b3ea20" />
<img width="1080" height="2400" alt="Screenshot_1754738170" src="https://github.com/user-attachments/assets/538efe99-f6eb-4427-8f9d-5f5bd2646d24" />
<img width="1080" height="2400" alt="Screenshot_1754738155" src="https://github.com/user-attachments/assets/2ce4c58e-044c-4642-bc31-811bc1aece81" />


---

## Basic Usage 🏁

First, render the `<Toaster />` provider at the root of your app (outside navigation):

```jsx
import { Toaster } from 'rn-snappy-toast';

export default function App() {
  return (
    <>
      <YourAppContent />
      <Toaster />
    </>
  );
}
```

Then call `showToast()` anywhere:

```jsx
import { showToast } from 'rn-snappy-toast';

showToast({
  message: 'Hello World!',
  type: 'success',
});
```

---

## Full Example 📋

```jsx
import { Text, View, StyleSheet, Button } from 'react-native';
import { Toaster, showToast } from 'rn-snappy-toast';

export default function App() {
  return (
    <>
      <Toaster />
      <View style={styles.container}>
        <Button
          title="Click to show Error toast"
          onPress={() =>
            showToast({
              message: `User data is not updated, please try again later`,
              duration: 5000,
              type: 'error',
              position: 'top',
              title: 'Error',
              animationType: 'slideFromTop',
              vibration: true,
              hideCloseButton: true,
              closeOnTap: true,
              swipeDirection: 'up',
              richColors: true,
            })
          }
        />
        <Button
          title="Click to show info toast"
          onPress={() =>
            showToast({
              message: `User Details are updated successfully`,
              duration: 5000,
              type: 'info',
              position: 'bottom',
              title: 'Information',
              animationType: 'slide',
              progressBar: true,
              richColors: true,
            })
          }
        />
        <Button
          title="Click to show success toast"
          onPress={() =>
            showToast({
              message: `User Details are updated successfully`,
              duration: 5000,
              type: 'success',
              position: 'top',
              title: 'Success',
              animationType: 'slideFromLeft',
              progressBar: true,
              richColors: true,
            })
          }
        />
        <Button
          title="Click to show warning toast"
          onPress={() =>
            showToast({
              message: `Please add all details in the form`,
              duration: 5000,
              type: 'warning',
              position: 'top',
              title: 'Warning',
              animationType: 'slideFromLeft',
              progressBar: true,
              richColors: true,
            })
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

---

## API Reference 📚

### `<Toaster />` Props

| Prop              | Type                                        | Default        | Description                        |
| ----------------- | ------------------------------------------- | -------------- | ---------------------------------- |
| position          | `'top'` \| `'bottom'` \| `'center'`         | `'top'`        | Default toast position             |
| offset            | number                                      | 50             | Distance from screen edge          |
| maxToasts         | number                                      | 3              | Max simultaneous toasts            |
| animationType     | `ToastAnimation`                            | `'slide'`      | Default animation type             |
| animationDuration | number                                      | 300            | Duration of animations (ms)        |
| swipeEnabled      | boolean                                     | true           | Enable swipe to dismiss            |
| swipeDirection    | `'up'` \| `'down'` \| `'left'` \| `'right'` | `'horizontal'` | Swipe direction(s)                 |
| swipeThreshold    | number                                      | 100            | Swipe distance required to dismiss |
| hideCloseButton   | boolean                                     | false          | Hide close button                  |
| richColors        | boolean                                     | false          | Use rich color palette             |
| customStyles      | object                                      | {}             | Override styles                    |

---

### `showToast(options: ToastOptions)`

**ToastOptions:**

| Option          | Type                                                              | Description                       |
| --------------- | ----------------------------------------------------------------- | --------------------------------- |
| id              | number                                                            | Unique ID for toast (optional)    |
| richColors      | boolean                                                           | Use pre-defined rich color themes |
| message         | string                                                            | Toast message text                |
| type            | `'success'` \| `'error'` \| `'info'` \| `'warning'` \| `'custom'` | Toast type                        |
| duration        | number                                                            | Display time (ms)                 |
| title           | string                                                            | Optional title text               |
| icon            | `React.ReactNode`                                                 | Custom icon                       |
| position        | ToastPosition                                                     | Override default position         |
| animationType   | ToastAnimation                                                    | Override default animation        |
| onPress         | `() => void`                                                      | Tap callback                      |
| renderContent   | `() => React.ReactNode`                                           | Fully custom toast rendering      |
| disableSwipe    | boolean                                                           | Disable swipe dismiss             |
| swipeDirection  | SwipeDirection                                                    | Allowed swipe direction(s)        |
| swipeThreshold  | number                                                            | Distance before swipe dismiss     |
| progressBar     | boolean                                                           | Show progress bar                 |
| hideCloseButton | boolean                                                           | Hide close button                 |
| opacity         | number                                                            | Opacity (0–1)                     |
| closeOnTap      | boolean                                                           | Dismiss toast on tap              |
| vibration       | boolean                                                           | Vibrate on show (Android)         |
| customAnimation | `(animValue: Animated.Value) => any`                              | Provide a custom animation        |
| backgroundColor | string                                                            | Custom background color           |
| textColor       | string                                                            | Custom text color                 |

---

## License 📄

MIT © unofficialmohit

Made with ❤️ by Mohit and contributors
