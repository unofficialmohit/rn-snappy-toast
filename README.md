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

| Screenshot 1 | Screenshot 2 |
|--------------|--------------|
| <img src="https://github.com/user-attachments/assets/2da6f279-2a7e-4e3f-a565-2dda8546bd6d" width="300" /> | <img src="https://github.com/user-attachments/assets/9f8b9e05-fd6a-4d52-8b71-f7cfcb91d97f" width="300" /> |

| Screenshot 3 | Screenshot 4 |
|--------------|--------------|
| <img src="https://github.com/user-attachments/assets/db10b3a1-8e5b-487a-99df-6fb90c1afbad" width="300" /> | <img src="https://github.com/user-attachments/assets/58e9a156-0b6e-4054-bbce-a7b6011199d5" width="300" /> |



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
