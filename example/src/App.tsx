import { useState } from 'react';
import { View, StyleSheet, Button, Modal } from 'react-native';
import { Toaster, showToast } from 'rn-snappy-toast';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);

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
              iconAnimationType: 'shake',
              swipeDirection: 'vertical',
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

        {/* New Button to open modal */}
        <Button title="Open Modal" onPress={() => setModalVisible(true)} />
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Button
              title="Close Modal"
              onPress={() => setModalVisible(false)}
            />

            <Button
              title="Toast in Modal"
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
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 20,
    width: 300,
  },
});
