const express = require('express')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
const serviceAccount = require('../hermes-81cd6-firebase-adminsdk-cvecj-31a238d593.json')
const { uid } = require('uid');

const PORT = 49000
const app = express()

// PARSE JSON BODY DATA
app.use(bodyParser.json())
// Initialize admin firebase
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const firestore = admin.firestore();

// INITIAL ROUTE
app.get('/', (_, { send }) => send('Server started!!!'))

// CREATE NOTIFICATION AND SEND
app.post('/send-web', async ({ body: { pushToken, title, body, webPushTokens, userId, data } }, res) => {
  // try {
  //   const userRef = firestore.collection('users').doc(userId);
  //   const user = await userRef.get()
  //
  //   await userRef.update({
  //
  //   })
  //
  //   if (!user.exists) {
  //     return res.status(401).send({message: `User ${userId} have no found`});
  //   }
  //
  //   const notificationId = uid(32);
  //   const notificationRef = firestore.collection('notifications').doc(notificationId);
  //   const notification = await notificationRef.set({
  //     UserId: userId,
  //     Title: title,
  //     Body: body,
  //     Data: {
  //       Content: null,
  //       url: 'https://expo.dev',
  //       UserId: userId,
  //     }
  //   });
  //
  //   res.status(200).send('Done');
  // } catch (e) {
  //   res.status(500).send(e);
  // }


  firestore.collection('notifications')
    .doc()
    .set({
      title,
      subtitle: body,
      accontId: userId || `${Date.now()}`,
      read: false,
      createdAt: new Date()
    })
    .then(async () => {
      if (!webPushTokens || !webPushTokens.length) return 'Notification created but have no \'pushToken\'';

      const pushNotificationData = {
        notification: {
          title: title || 'Server title',
          body: body || 'Message from the server',
        },
        data: data || {},
        webpush: {
          fcmOptions: {
            link: 'https://lutsk.inbestme.com/notifications'
          }
        }
      };

      if (webPushTokens.length === 1) {
        return admin.messaging().send({
          ...pushNotificationData,
          token: webPushTokens[0]
        });
      }

      return admin.messaging().sendEachForMulticast({
        ...pushNotificationData,
        tokens: webPushTokens
      })
    })
    .then((result) => res.status(200).send(result))
    .catch((error) => res.status(400).send(error))
})

// CREATE USER
app.post('/user', async ({ body }, res) => {
  const userId = uid(16);
  const notificationId = uid(32);
  const usersRef = firestore.collection('users').doc(userId);
  const notificationRef = firestore.collection('notifications').doc(notificationId);
  try {
    const notification = await notificationRef.set({
      UserId: userId,
      Title: 'Test notification title 1',
      Body: 'Test notification body 1',
      Data: {
        Content: null,
        url: 'https://expo.dev',
        UserId: userId,
      }
    });
    const user = await usersRef.create({
      UserId: userId,
      NAV: 123,
      Pnl: 311,
      TWR: 3009,
      Notifications: [notificationRef],
      Accounts: [],
      Messages: []
    });
    res.status(201).send(user);
  } catch (e) {
    console.log(e)
    res.status(401).send(e);
  }
});

app.put('/user/:id', async ({ body, params: { id } }, res) => {
  const userRef = firestore.collection('users').doc(id);

  try {
    await userRef.update(body)

    res.status(201).send('Ok')
  } catch (e) {
    res.status(500).send(e)
  }
})

// UPDATE NOTIFICATION IN FIRESTORE
app.post('/update/:id', ({ params, body }, res) => firestore
  .collection('notifications')
  .doc(params.id)
  .update(body)
  .then(() => res.status(200).send({ id: params.id, ...body }))
  .catch((e) => res.status(400).send(e)))

// LISTEN THE PORT
app.listen(PORT, () => console.log(`Example app listening on - http://localhost:${PORT}`))
