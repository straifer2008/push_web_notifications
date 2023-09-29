// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
console.log('-----SERVICE WORKER START----')

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    "apiKey": "AIzaSyDFqaH0wLYOs8y2D_sNyPkkUwthkSJhE6M",
    "authDomain": "hermes-81cd6.firebaseapp.com",
    "projectId": "hermes-81cd6",
    "storageBucket": "hermes-81cd6.appspot.com",
    "messagingSenderId": "1008536307940",
    "appId": "1:1008536307940:web:3f1accb245a3ea0dbb44f1"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/inbestme_logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log('On notification click: ', event.notification.tag);

    event.notification.close();
    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then((clientList) => {
        for (const client of clientList) {
            if (client.url === '/' && 'focus' in client)
                return client.focus();
        }

        if (clients.openWindow)
            return clients.openWindow(link);
    }));
});
