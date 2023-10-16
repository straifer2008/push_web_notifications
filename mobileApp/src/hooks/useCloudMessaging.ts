import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { setDoc, getDoc, doc, arrayUnion, updateDoc, Timestamp } from "firebase/firestore";

const app = initializeApp({
  "apiKey": "AIzaSyDFqaH0wLYOs8y2D_sNyPkkUwthkSJhE6M",
  "authDomain": "hermes-81cd6.firebaseapp.com",
  "projectId": "hermes-81cd6",
  "storageBucket": "hermes-81cd6.appspot.com",
  "messagingSenderId": "1008536307940",
  "appId": "1:1008536307940:web:3f1accb245a3ea0dbb44f1"
});
const db = getFirestore(app);
const TEST_USER_ID = 'testId1';

const addPushToken = async (token: string)=> {
  const ref = doc(db, 'users', TEST_USER_ID);
  const user = await getDoc(ref);

  if (!user.exists()) {
    console.log('---NEW TOKEN ----', token);
    return await setDoc(ref, {
      inbestmeAccountId: TEST_USER_ID,
      investorAccountRequestId: `request_${TEST_USER_ID}`,
      language: "EN",
      mobileTokens: [token]
    });
  }

  console.log('---UPDATED TOKEN ----', token);
  await updateDoc(ref, { mobileTokens: arrayUnion(token) });

};

const updateNotification = async (id: string, data: any) => {
  const ref = doc(db, 'base-notifications', id);
  const notification = await getDoc(ref);

  if (!notification.exists()) return console.log(`Notification: ${id} is not exists`);

  return updateDoc(ref, data)
};

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
      await addPushToken(token)
      setToken(token);
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
      if (remoteMessage?.data?.notificationId) {
        await updateNotification(remoteMessage.data.notificationId as string, {
          receiveTime: Timestamp.now(),
          mobileClickTime: Timestamp.now()
        });
      }
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
    if (remoteMessage?.data?.notificationId) {
      await updateNotification(remoteMessage.data.notificationId as string, { receiveTime: Timestamp.now() });
    }
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
