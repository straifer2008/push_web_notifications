import { initializeApp } from 'firebase/app'
import {
  collection,
  getFirestore,
  query,
  orderBy,
  where,
  updateDoc,
  writeBatch,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  setDoc,
  limit,
  arrayUnion,
  Timestamp
} from 'firebase/firestore'
import { useCollection } from 'vuefire'
import { getMessaging, getToken, onMessage } from "firebase/messaging"
// @ts-ignore
import firebaseConfig from '../../../firebaseConfig.json'
// @ts-ignore
import tokenOpt from '../../../webNotificationVapId.json'
import { useToast } from 'vue-toast-notification'

export const firebaseApp = initializeApp(firebaseConfig)

export const TEST_USER_ID = localStorage.getItem('TEST_USER_ID') || 'testId1';

const $toast = useToast()
const db = getFirestore(firebaseApp)
const notificationsRef = query(
  collection(db, 'notifications'),
  where('inbestmeAccountId', '==', TEST_USER_ID),
  orderBy('createTime', 'desc'),
  limit(50),
)
const baseNotificationsRef = query(
  collection(db, 'base-notifications'),
  where('inbestmeAccountId', '==', TEST_USER_ID),
  orderBy('createTime', 'desc'),
  limit(50),
)


export const useNotifications = () => useCollection(notificationsRef)
export const useBaseNotifications = () => useCollection(baseNotificationsRef);
export const useUnreadBaseNotifications = () => useCollection(query(
  baseNotificationsRef,
  where('readTime', '==', null)
))
export const useUnreadNotifications = () => useCollection(query(
  notificationsRef,
  where('readTime', '==', null)
))
export const updateNotification = async (id: string, updated: any) => {
  if (!id) return console.log('Have no notification ID')

  try {
    const ref = doc(db, 'notifications', id)
    if (!ref) return console.log(`Can't find Notification by this ID [${id}]`)

    await updateDoc(ref, updated)
  } catch (e) {
    console.log('ERROR: updateNotification', e)
  }
}
export const updateBaseNotification = async (id: string, updated: any) => {
  if (!id) return console.log('Have no notification ID')

  try {
    const ref = doc(db, 'base-notifications', id)
    if (!ref) return console.log(`Can't find Notification by this ID [${id}]`)

    await updateDoc(ref, updated)
  } catch (e) {
    console.log('ERROR: updateNotification', e)
  }
}
export const updatePushNotification = async (id: string, updated: any) => {
  try {
    const ref = doc(db, 'push-notifications', id)
    if (!ref) return console.log(`Can't find Push Notification by this ID [${id}]`)

    await updateDoc(ref, updated)
  } catch (e) {
    console.log('ERROR: updatePushNotification', e)
  }
}
export const deleteNotification = async (id: string) => {
  if (!id) return console.log('Have no notification ID')

  try {
    const notificationRef = doc(db, 'notifications', id)
    if (!notificationRef) return console.log(`Can't find Notification by this ID [${id}]`)

    const batch = writeBatch(db)
    const pushNotificationsQuery = query(
      collection(db, 'push-notifications'),
      where('inbestmeAccountId', '==', TEST_USER_ID),
      where('notificationId', '==', id),
    )
    const pushNotificationSnapshot = await getDocs(pushNotificationsQuery);
    pushNotificationSnapshot.forEach((v) => batch.delete(v.ref))

    batch.delete(notificationRef)

    await batch.commit();
  } catch (e) {
    console.log('ERROR: deleteNotification', e)
  }
}
export const deleteBaseNotification = async (id: string) =>  {
  try {
    await deleteDoc(doc(db, 'base-notifications', id))
  } catch (e) {
    console.log('ERROR: deleteNotification', e)
  }
}

const addUserToken = async (token: any) => {
  try {
    const id = TEST_USER_ID;
    const ref = doc(db, 'users', id);
    const user = await getDoc(ref);

    if (!user.exists()) {
      console.log('---CREATE TOKEN ----', token);
      return await setDoc(ref, {
        inbestmeAccountId: id,
        investorAccountRequestId: `request_${id}`,
        language: "EN",
        webTokens: [token]
      })
    }

    console.log('---UPDATE TOKEN ----', token);
    await updateDoc(ref, { webTokens: arrayUnion(token) })
  } catch (e) {
    console.log('Error - createUser:', e);
  }
};


// Web notifications
const messaging = getMessaging()

getToken(messaging, tokenOpt)
  .then(async token => {
    if (token) {
      await addUserToken(token);
    } else {
      console.log('No registration token available. Request permission to generate one.')
      $toast.open({
        message: 'No registration token available. Request permission to generate one',
        type: 'warning',
        duration: 3000
      })
    }
  })
  .catch(e => {
    console.log('An error occurred while retrieving token. ', e)
    $toast.open({
      message: 'Access to send Push messages is not granted',
      type: 'error',
      duration: 5000
    });
  })

onMessage(messaging, async (payload) => {
  console.log('Message received. ', payload)
  const { data } = payload;

  if (data?.pushNotificationId) {
    await updatePushNotification(data?.pushNotificationId, { receiveTime: Timestamp.now() });
  }

  if (data?.notificationId) {
    await updateBaseNotification(data?.notificationId, { receiveTime: Timestamp.now() })
  }

  $toast.open({
    message: `<h2>${payload?.notification?.title}</h2> <p>${payload?.notification?.body}</p>`,
    position: 'top-right',
    type: 'success',
    duration: 4000
  })
})
