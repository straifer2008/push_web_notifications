import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native'
import { useCloudMessaging } from '@/hooks'

export default function App() {
  // const { expoPushToken: token, notification, schedulePushNotification } = usePushNotifications();
  const { notification, token } = useCloudMessaging();
  const pushNotification = notification?.request?.content || notification;

  return (
    <View style={styles.container}>
      <Text>Your push token: {token}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {pushNotification?.title} </Text>
        <Text>Body: {pushNotification?.body}</Text>
        <Text>Data: {notification?.data && JSON.stringify(notification.data)}</Text>
      </View>
      {/*<Button title="Press to schedule a notification" onPress={schedulePushNotification} />*/}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
