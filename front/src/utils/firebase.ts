import { initializeApp } from 'firebase/app'
import {
  collection,
  getFirestore,
  query,
  orderBy,
  where,
  updateDoc,
  deleteDoc,
  doc,
  limit
} from 'firebase/firestore'
import { useCollection } from 'vuefire'
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import firebaseConfig from '../../../firebaseConfig.json'
import tokenOpt from '../../../webNotificationVapId.json'
import { useToast } from 'vue-toast-notification'

export const firebaseApp = initializeApp(firebaseConfig)

const $toast = useToast()
const db = getFirestore(firebaseApp)
const notificationsCollection = collection(db, 'notifications')
const notificationsRef = query(
  notificationsCollection,
  where('accontId', '==', '11'),
  orderBy('createdAt', 'desc'),
  limit(50),
)

export const useNotifications = () => useCollection(notificationsRef);
export const useUnreadNotifications = () => useCollection(query(
  notificationsRef,
  where('read', '==', false)
));
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
export const deleteNotification = async (id: string) => {
  if (!id) return console.log('Have no notification ID')

  try {
    const ref = doc(db, 'notifications', id)
    if (!ref) return console.log(`Can't find Notification by this ID [${id}]`)
    await deleteDoc(ref);
  } catch (e) {
    console.log('ERROR: deleteNotification', e)
  }
}


// Web notifications
const messaging = getMessaging()

getToken(messaging, tokenOpt)
  .then(token => {
    if (token) {
      console.log(token, '----tokenFromActive')
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

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload)
  $toast.open({
    message: `<h2>${payload?.notification?.title}</h2> <p>${payload?.notification?.body}</p>`,
    position: 'top-right',
    type: 'success',
    duration: 4000
  })
})
