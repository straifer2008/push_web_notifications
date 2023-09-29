const express = require('express')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
const serviceAccount = require('../hermes-81cd6-firebase-adminsdk-cvecj-31a238d593.json')

const PORT = 49000
const app = express()

// PARSE JSON BODY DATA
app.use(bodyParser.json())
// Initialize admin firebase
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

// INITIAL ROUTE
app.get('/', (_, { send }) => send('Server started!!!'))

// CREATE NOTIFICATION AND SEND
app.post('/send-web', ({ body: { pushToken, title, body, webPushTokens, userId } }, res) => admin.firestore()
  .collection('notifications')
  .doc()
  .set({
    title,
    subtitle: body,
    accontId: userId || `${Date.now()}`,
    read: false,
    createdAt: new Date()
  })
  .then(async () => {
    if (webPushTokens && webPushTokens.length) {
      return Promise.all(webPushTokens.map(token => sendWebNotification({ token, body, title })))
    }

    return 'Notification created but have no \'pushToken\''
  })
  .then((result) => res.status(200).send(result))
  .catch((error) => res.status(400).send(error)))

// UPDATE NOTIFICATION IN FIRESTORE
app.post('/update/:id', ({ params, body }, res) => admin.firestore()
  .collection('notifications')
  .doc(params.id)
  .update(body)
  .then(() => res.status(200).send({ id: params.id, ...body }))
  .catch((e) => res.status(400).send(e)))

// SEND WEB NOTIFICATION
const sendWebNotification = ({ token, title, body }) => {
  const message = {
    notification: {
      title: title || 'Server title',
      body: body || 'Message from the server'
    },
    webpush: {
      fcmOptions: {
        link: 'http://localhost:5173/#/notifications'
      }
    },
    token
  }

  return admin.messaging().send(message)
}

// LISTEN THE PORT
app.listen(PORT, () => console.log(`Example app listening on - http://localhost:${PORT}`))