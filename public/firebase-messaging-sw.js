importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
    "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

// Replace these with your own Firebase config keys...
const firebaseConfig = {
    apiKey: "AIzaSyDXHW6GC5CoumpCfTgRFidhd-9YeNnD1rs",
    authDomain: "foodshare-d68ca.firebaseapp.com",
    projectId: "foodshare-d68ca",
    storageBucket: "foodshare-d68ca.firebasestorage.app",
    messagingSenderId: "15820236206",
    appId: "1:15820236206:web:3e824819890571d8a8543f",
    measurementId: "G-40KBTB1VWB"
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("Received background message ", payload);

    // Lấy link từ data gửi về (không hardcode nữa)
    const dynamicLink = payload.data?.link || "https://www.miniapp-foodshare.com/";

    const notificationTitle = '🔥🔥🔥 ' + payload.data?.title + ' 🔔🔔🔔';
    const notificationOptions = {
        body: payload.data?.body,
        icon: "./logo/logo_512x512.png",
        image: payload.data?.image,
        data: { url: dynamicLink }, // Lưu link vào đây để dùng khi click
        actions: [
            {
                action: 'open_url',
                title: 'GIỮ CHỖ NGAY',
            }
        ]
    };

    // Chỉ có 1 dòng này hiển thị thông báo, không lo bị duplicate
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    // Lấy link động từ data đã lưu ở trên
    const urlToOpen = event.notification.data?.url;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
            .then(function (clientList) {
                if (!urlToOpen) return;

                for (const client of clientList) {
                    if (client.url === urlToOpen && "focus" in client) {
                        return client.focus();
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});