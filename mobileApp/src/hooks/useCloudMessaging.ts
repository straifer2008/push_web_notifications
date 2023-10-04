import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

export const useCloudMessaging = () => {
  const [notification, setNotification] = useState<any>();
  const [token, setToken] = useState<string>();

  const alertFn = (title: string = 'Notification', data?: any) => Alert.alert(title, JSON.stringify(data));

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }

    return enabled;
  };

  const getMessagingToken = async () => {
    try {
      const token = await messaging().getToken();
      setToken(token);
      console.log('MESSAGING TOKEN: ', token);
    } catch (e) {
      console.log('ERROR: getMessagingToken()', e);
    }
  };

  // Assume a message-notification contains a "type" property in the data payload of the screen to open
  const onNotificationOpenedApp = () => {
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      )
    });
  };

  // Check whether an initial notification is available
  const getInitialNotification = async () => {
    try {
      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage);
        setNotification(remoteMessage);
      }
    } catch (e) {
      console.log('ERROR: getInitialNotification()', e);
    }
  };

  // Register background handler (WHEN RECEIVE)
  const setBackgroundMessageHandler = () => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log(
        'Message handled in the background!',
        remoteMessage
      )
      setNotification(remoteMessage);
    });
  };

  // Subscribe foreground messages (Foreground)
  const onMessage = () => messaging().onMessage(async (remoteMessage) => {
    console.log('A new FCM message arrived!', remoteMessage);
    setNotification(remoteMessage);
  });

  useEffect(() => {
    requestUserPermission()
      .then(getMessagingToken)
      .then(onNotificationOpenedApp)
      .then(getInitialNotification)
      .then(setBackgroundMessageHandler)
      .catch(e => console.log('ERROR: useCloudMessaging() => useEffect()', e));

    const unsubscribe = onMessage();

    return unsubscribe;
  }, []);

  return {
    notification: {
      ...(notification?.notification || {}),
      data: notification?.data,
    },
    token
  };
};
