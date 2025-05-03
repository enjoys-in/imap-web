
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || "/";
    event.waitUntil(clients.openWindow(targetUrl));
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "show-notification") {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: "/send2-dark.png",
            data: { url: event.data.url },
        });
    }
});
