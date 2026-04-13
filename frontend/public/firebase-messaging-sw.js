/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAkeEJoy_HPb6kWdVzeYgAsddlJFVnHn2A",
  authDomain: "easeon-380.firebaseapp.com",
  projectId: "easeon-380",
  storageBucket: "easeon-380.firebasestorage.app",
  messagingSenderId: "1030514505302",
  appId: "1:1030514505302:web:d55bb57b7baa2154eaedf7",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "Ease-On", {
    body: body || "You have a new notification",
    icon: icon || "/icon-192.png",
    badge: "/icon-192.png",
    data: payload.data,
  });
});
