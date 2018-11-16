importScripts('/src/js/idb.js');

importScripts('/src/js/utilitydB.js');


const STATIC_CACHE_NAME = "static-v39";

const DYNAMIC_CACHE_NAME = "dynamic-v8";


/**
 *  All the static assets which will be in the precache 
 */
const STATIC_ASSETS = [
    // HTML
    '/',
    'index.html',
    'offline.html',
    // CSS
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/css/help.css',
    // JS 
    '/src/js/idb.js',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/material.min.js',
    'src/js/utilitydB.js',
    // IMG
    '/src/images/main-image.jpg'
];




/**
 * Set the preCache
 * @returns {void}
 */
const setPreCache = async () => {

    console.log('[SW] Precaching....');

    const cache = await caches.open(STATIC_CACHE_NAME);

    cache.addAll(STATIC_ASSETS);

}


/**
 *  cleanCaches 
 *  @returns {void}
 */
const cleanCaches = async () => {

    const cacheNames = await caches.keys();

    Promise.all(
        // cacheNames is an array so we can chain filter ( we return all caches expect the current one) 
        // after we map on the filter result and delete the caches. 
        cacheNames
        .filter(cacheName => cacheName !== DYNAMIC_CACHE_NAME && cacheName !== STATIC_CACHE_NAME)
        .map(cacheName => caches.delete(cacheName))
    )


}


/**
 * trimCache
 * Keep the number of items in a cache under a 
 * given threshold 
 * @param {string} cacheName 
 * @param {int} maxItems 
 */
const trimCache = async (cacheName, maxItems) => {

    const cache = await caches.open(cacheName);

    const keys = await cache.keys();

    if (keys.length > maxItems) {

        const removedItem = await cache.delete(keys[0])

        trimCache(cacheName, maxItems);
    }

}


/**
 * In array
 * @param {array} array 
 * @param {string} string 
 * @returns {boolean}
 */
const isInArray = (array, string) => array.some(e => e === string);


/** 
 * Remove the referrer
 * e.g : http://localhost:888/hello.html 
 * will return /hello.html
 * @param {request} request 
 */
const removeReferrer = (request) => {

    const url = request.url.replace(request.referrer, '');

    if (!/^(f|ht)tps?:\/\//i.test(url)) return `/${url}`;

    return url
}


/**
 * isHtmlRequest 
 * @param {request} request 
 */
const isHtmlRequest = (request) => request.headers.get('accept').includes('text/html');


self.addEventListener('install', event => {

    console.log('[SW] installing SW', event)

    setPreCache();

});



self.addEventListener('activate', event => {

    console.log('[SW] Activating SW', event)

    cleanCaches()

    return self.clients.claim(); // to be sure we avoid insconsistent 

});



/**
 * staleAndRevalidate
 * Fetch the request on the network and put a copy in the cache
 * @param {event} event 
 * @param {string} cacheName 
 */
const staleAndRevalidate = async (event, cacheName) => {

    try {

        const networkResponse = await fetch(event.request);

        if (networkResponse.ok) {

            const cache = await caches.open(cacheName);

            cache.put(event.request, networkResponse.clone());

        }

        return networkResponse;


    } catch (e) {

        throw new Error(e);
    }

}


/**
 * staleAndRevalidate
 * Fetch the request on the network and put a copy in the cache
 * @param {event} event 
 * @param {string} cacheName 
 */
const staleAndRevalidateIndb = async (event) => {

    try {

        const networkResponse = await fetch(event.request);

        // we don't want to cache POST / DELETE... requests
        if (event.request.method !== "GET" ) return networkResponse;

        if (networkResponse.ok || networkResponse.type === "opaque") {

            const clonedNnetworkResponse = networkResponse.clone();
            const json = await clonedNnetworkResponse.json();

            // We delete the whole store 
            await clearAllDatafFromDb("posts");

            // From firebase we get an object and not an array
            // then we have to transform it : for (key in json)
            
            for (let i = 0; i < json.length; i++) { 

                await writeDataInDb('posts', json[i]);
            }

        
        }

        return networkResponse;


    } catch (e) {

        throw new Error(e);
    }

}


/**
 * 
 * @param {@event} event 
 */
const tryInAllCache = async (event) => {

    const response = await caches.match(event.request);

    return response

}


/**
 * cacheOnly
 * 
 * Look for and returns 
 * a an event request in the cache
 * @param {eventRequest} event 
 * @param {string} cacheName 
 */
const cacheOnly = async (event, cacheName) => {

    const cache = await caches.open(cacheName);

    return cache.match(event.request);
}


/**
 * cacheThenNetwork
 *
 * @param {event} event 
 * @param {string} cacheName 
 * @returns {request} 
 */
const cacheThenNetwork = async (event, cacheName) => {

    try {

        const response = await caches.match(event.request);

        if (response) return response

        const networkResponse = await fetch(event.request);

        // we don't want to cache POST requests
        if (event.request.method === "POST") return networkResponse;

        // It's important to accept opaque responses in case of CORS on images
        // As the service worker has the potential of altering network responses, 
        // you need to guarantee you are not interested by the content of the response, 
        // not by the headers, or even by the result. You're only interested 
        // on the response as a black box to possibly cache it and serve it faster.
        if (networkResponse.ok || networkResponse.type === "opaque") {

            const cache = await caches.open(cacheName);

            await cache.put(event.request, networkResponse.clone());

        }

        return networkResponse;


    } catch (e) {

        throw new Error(e);
    }

}




/**
 *  Open the static cache and returns the offline page 
 */
const throwOfflinePage = async () => {

    const cache = await caches.open(STATIC_CACHE_NAME);

    return cache.match('/offline.html');
}



self.addEventListener('fetch', event => {

    // @todo : Bug to fix when deployed the all assets start 
    // with https://antoinepwa.firebaseio.com/ 
    const url = "http://localhost:4590/posts";

    trimCache(DYNAMIC_CACHE_NAME, 30);

    if (event.request.url.includes(url)) {

        event.respondWith(
            staleAndRevalidateIndb(event).catch(e => tryInAllCache(event))
        );

        console.info(`Responding from ${event.request.url} staleAndRevalidate with fallback to cache 👠`);

    } else if (isInArray(STATIC_ASSETS, removeReferrer(event.request))) {

        event.respondWith(
            cacheOnly(event, STATIC_CACHE_NAME)
        )

        console.info(`Responding from ${event.request.url} with cache Only 👻`);

    } else {

        event.respondWith(
            cacheThenNetwork(event, DYNAMIC_CACHE_NAME)
            .catch(e => {

                if (isHtmlRequest(event.request)) return throwOfflinePage();

            })
        );

        console.info(`Responding from ${event.request.url} with Dynamic caching 🤖`);

    }


});



/** 
 *  Sync event listener
 * 
 *  Here we are listening events from e.g : sw.sync.register('sync-new-post');
 *  The parameter 'sync-new-post' can be retrieved with event.tag . 
 */
self.addEventListener('sync', function (event) {

    console.log('[SW] Background syncing ', event);

    if (event.tag === "sync-new-post") {

        console.log('[SW] syncing new post');

        (async () => {

            // we retrieve all the posts which are waiting to be sync 
            // we get back an array of objects
            const data = await readAllDataFromDb("sync-posts");

            for (let dt of data) {

                try {   

                    const postData = new FormData();
                    postData.append('id', dt.id);
                    postData.append('title', dt.title);
                    postData.append('location', dt.location);
                    postData.append('file', dt.picture,`${dt.id}.png`);

                    const res = await fetch('http://localhost:4590/posts', {
                        method: 'post',
                        // headers: {
                        //     'Content-Type': 'application/json'
                        // },
                        body: postData
                    });

                    if (!res.ok) throw new Error('[SW] error sending data with bg sync ; inside the fetch', res);

                    const json = await res.json();

                    console.log("[SW] Sent data with bg sync", json);

                    await deleteItemFromData("sync-posts", dt.id);

                } catch (e) {
                    console.log('[SW] error sending data with bg sync ; inside the fetch', e);
                }

            }


        })();

    }

});





/**
 * @todo should returns a promise with the available window
 */
const takeActionAfterClick = () => {

    return new Promise((resolve, reject) => {

        (async () => {

            try {

                const clients = await clients.matchAll({
                    includeUncontrolled: true,
                    type: 'window'
                });
                console.log('Client is ', clients);
                clients.matchAll()
                    .then(r => console.log(r))
                    .catch(e => console.log(e))

                console.log("clients", clients);

                const client = clients.find(c => c.visibilityState === "visible");

                if (typeof client !== undefined) {

                    return resolve(client);

                }

                return reject("No client found");

            } catch (e) {

                return reject('Something wrong happened ', e);

            }

        })();

    });

}




/** 
 *  notificationclose
 * 
 *  We can listen the clicks on notifications close
 *  Can be insteresting to analyze this data ( close rate...)
 */
self.addEventListener('notificationclose', function (event) {

    console.log('Notification was closed', event)

});



/** 
 *  push
 *  
 * We listen push from the Service Worker 
 */
self.addEventListener('push', function (event) {

    console.log('[SW] push notification received', event);

    let data = {
        title: "New!",
        content: "Something new happened!"
    }

    data = (event.data) ? JSON.parse(event.data.text()) : data;

    const options = {
        body: 'lool ' + data.content,
        icon: '/src/images/icons/app-icon-512x512.png',
        vibrate: [100, 50, 200],
        badge: '/src/images/icons/app-icon-96x96.png', // the icon in the "top bar"
        dir: 'ltr', // left to right
        lang: 'en-US', // BCP 47
        tag: "confirm-notification", // will replace the previous notif if the same tag is used 
        renotify: true, // false = new notif with the same tag will not vibrate
        actions: [{
                action: 'confirm',
                title: "Okay",
                icon: '/src/images/icons/app-icon-512x512.png'
            },
            {
                action: 'cancel',
                title: "Cancel",
                icon: '/src/images/icons/app-icon-512x512.png'
            }
        ]
    };


    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )



});


/** 
 *  notificationclick
 * 
 *  We can listen the clicks on notifications
 *  and also on notification's options ( see action key on showNotification method )
 */
self.addEventListener('notificationclick', function (event) {

    console.log(event);

    const {
        notification,
        action
    } = event;

    console.log(notification);

    if (action === "confirm") {
        console.log('Confirm was chosen');
        notification.close();

    } else {

        console.log(action);

        takeActionAfterClick()
            .then(client => {
                client.navigate('http://localhost:8080');
                client.focus();
                clients.openWindow('http://localhost:8080');
                notification.close();
            })
            .catch(e => console.log(e))

    }

});