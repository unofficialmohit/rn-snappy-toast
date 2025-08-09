import { View, StyleSheet, Button, Modal } from 'react-native';
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
              message: `User data is not updated, please try again later and if issue persist contact adming asap`,
              duration: 5000,
              type: 'error',
              position: 'top',
              title: 'Error',
              animationType: 'scale',
              progressBar: true,
              vibration: true,
              closeOnTap: true,
              showCloseButton: false,
              richColors: true,
              iconAnimationType: 'pulse',
              swipeDirection: 'horizontal',
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
              progressBarColor: 'red',
              progressBar: true,
              richColors: true,
              iconAnimationType: 'none',
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
              animationType: 'scale',
              progressBar: true,
              richColors: true,
              progressBarColor: 'green',
              iconAnimationType: 'pulse',
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
              closeOnTap: false,
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
