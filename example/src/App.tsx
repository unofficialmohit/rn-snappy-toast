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
