const express = require('express')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
const serviceAccount = require('../hermes-81cd6-firebase-adminsdk-cvecj-31a238d593.json')
const { uid } = require('uid')

const PORT = 49000
const app = express()

// PARSE JSON BODY DATA
app.use(bodyParser.json())
// Initialize admin firebase
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const firestore = admin.firestore()

// INITIAL ROUTE
app.get('/', (_, { send }) => send(`Server started!!! http://localhost:${PORT}`))

// CREATE USER
app.post('/create', async ({ body }, res) => {
  try {
    const notificationRef = firestore.collection('notifications').doc();
    await notificationRef.set({
      pushNotifications: [],
      createTime: admin.firestore.Timestamp.now(),
      receiveTime: null,
      clickTime: null,
      readTime: null,
      ...body
    });
    const notification = await notificationRef.get();
    res.status(201).send({ status: 'success', created: { id: notification.id, ...notification.data() } });
  } catch (e) {
    res.status(500).send(e.message)
  }
})

app.post('/send', async ({body: { notificationId, ...params}}, res) => {
  try {
    const notificationRef = firestore.collection('notifications').doc(notificationId);
    const notification = await notificationRef.get();

    if (!notification.exists) return res.status(500).send(`Notification ID: "${notificationId}" - not found.`);
    if (!params || !params.tokens || !params.tokens.length) return res.status(500).send('Have no any Push Tokens');

    const batch = firestore.batch();
    const pushRef = firestore.collection('push-notifications').doc();
    const { title, body, data, inbestmeAccountId } = notification.data();
    const sendData = await sendPush(params.tokens, {
      title,
      body,
      data: {
        ...data,
        inbestmeAccountId,
        pushNotificationId: pushRef.id,
        notificationId: notification.id,
      }
    });

    await batch.set(pushRef, {
      createdTime: admin.firestore.Timestamp.now(),
      clickTime: null,
      receiveTime: null,
      inbestmeAccountId,
      notificationId,
      sendData,
      ...params,
    });
    await batch.update(notificationRef, { pushNotifications: admin.firestore.FieldValue.arrayUnion(pushRef) });

    await batch.commit();
    const push = await pushRef.get();

    return res.status(201).send({ status: 'success', created: { id: push.id, ...push.data() } });
  } catch (e) {
    res.status(500).send(e.message || e);
  }
})

app.post('/read', async ({ body }, res) => {
  if (!body.inbestmeAccountId) return res.status(501).send('Have no "inbestmeAccountId"');

  try {
    const notificationsRef = firestore.collection('notifications').where('inbestmeAccountId', '==', body.inbestmeAccountId);
    const notifications = await notificationsRef.get();

    console.log(notifications.empty)
    if (notifications.empty()) return res.status(501).send(`Have no "inbestmeAccountId: ${body.inbestmeAccountId}"`);
  } catch (e) {
    res.status(500).send(e.message || e);
  }
})

app.post('/create-base', async ({ body }, res) => {
  try {
    const notificationRef = firestore.collection('base-notifications').doc();

    await notificationRef.set({
      createTime: admin.firestore.Timestamp.now(),
      receiveTime: null,
      readTime: null,
      clickTime: null,

      mobileClickTime: null,
      mobileSendTime: null,
      mobileTokens:  body?.mobileTokens || null,

      webTokens: body?.webTokens || null,
      webSendTime: null,
      sendData: null,
      ...body
    });
    const notification = await notificationRef.get();
    res.status(201).send({ status: 'success', created: { id: notification.id, ...notification.data() } });
  } catch (e) {
    res.status(500).send(e.message)
  }
})

app.get('/send-base/:id', async ({ params: { id } }, res) => {
  try {
    const notificationRef = firestore.collection('base-notifications').doc(id);
    const notification = await notificationRef.get();

    if (!notification.exists) return res.status(500).send(`Have not Notification ID: ${id}`);

    const {
      webTokens,
      mobileTokens,
      title,
      body,
      data,
      inbestmeAccountId,
      investorAccountId,
      investorAccountRequestId,
    } = notification.data();

    if (!webTokens?.length && !mobileTokens?.length) {
      return res.status(500).send(`Notification ID: ${id}, Have no push tokens`);
    }

    const nowTime = admin.firestore.Timestamp.now();
    const sendData = await sendPush([...(webTokens || []), ...(mobileTokens || [])], {
      title,
      body,
      data: {
        ...data,
        inbestmeAccountId,
        investorAccountId: investorAccountId ? `${investorAccountId}` : null,
        investorAccountRequestId: investorAccountRequestId ? `${investorAccountRequestId}` : null,
        notificationId: notification.id,
      }
    });

    await notificationRef.update({
      mobileSendTime: mobileTokens?.length ? nowTime : null,
      webSendTime: webTokens?.length ? nowTime : null,
      sendData,
    });

    res.status(200).send({
      id: notification.id,
      ...notification.data(),
    })
  } catch (e) {
    res.status(500).send(e.message || e);
  }
})

const sendPush = async (tokens, { title, body, data}) => {
  if (!tokens || !tokens.length || !title || !body) return null;

  const pushNotificationData = {
    notification: { title, body },
    data: data || {}
  };

  if (data.uri) pushNotificationData.webpush = { fcmOptions: { link: data.uri } };

  if (tokens.length === 1) {
    const messageId = await admin.messaging().send({
      ...pushNotificationData,
      token: tokens[0]
    });

    return [{ success: true, messageId }];
  }

  const res = await admin.messaging().sendEachForMulticast({ ...pushNotificationData, tokens })
  return res?.responses;
};

// LISTEN THE PORT
app.listen(PORT, () => console.log(`Example app listening on - http://localhost:${PORT}`))
