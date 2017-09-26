var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
    '/',
    '/styles/main.css',
    '/scripts/main.js',
    '/posts'
];

self.addEventListener('install', function (event) {
    console.log('install');
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function (cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        }, function (err) {
            console.log(err);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            // Cache hit - return response
            if (response) {
                return response;
            }

            var fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
                function (response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(function (cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});


self.addEventListener('activate', function (event) {
    let cacheWhitelist = ['pages-cache-v1', 'block-posts-cache-v1'];
    console.log('cache-activate');
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('push', function (event) {
    console.log('Received a push message', event);

    let title = 'Yay a message 2';
    let body = 'We have received a push message.';
    let icon = '/images/apple-icon.png';
    let tag = 'simple-push-demo-notiifacation-tag' + Math.floor(Math.random() * 1000);

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon,
            tag
        })
    );
});