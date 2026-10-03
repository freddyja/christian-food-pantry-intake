self.addEventListener("install", function (event) { self.skipWaiting(); });
self.addEventListener("activate", function (event) {
  event.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.map(function (key) { return caches.delete(key); }));
    var clients = await self.clients.matchAll({ type: "window" });
    await Promise.all(clients.map(function (client) { return client.navigate("https://computingmadeeasy.org/christian-food-pantry-intake/"); }));
    await self.registration.unregister();
  })());
});
