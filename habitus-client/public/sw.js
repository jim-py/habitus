self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Habitus", {
      body: data.body || "",
      icon: "/icon-192.png",
      data: data.url || "/",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "DevTools Push",
      body: event.data?.text() || "No body",
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Habitus", {
      body: data.body || "",
      icon: "/icon-192.png",
      data: data.url || "/",
    })
  );
});