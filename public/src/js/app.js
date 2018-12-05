$shareImageButton = document.querySelector('#share-image-button');

if ("serviceWorker" in navigator) {

    navigator.serviceWorker
        .register('/sw.js')
        .then(_ => console.log('Service Worker : registered '));
     
}


/**
 *  Push notifications
 * 
 */
const $enableNotificationsButtons = document.querySelectorAll('.enable-notifications');


/**
 * Key used to send push
 * to generate them : 
 * npm install web-push
 * web-push generate-vapid-keys
 * 
 */
const vapidPubKey = "BDCCmgeSpnHTOLmN65pAXGdAgS5GkTk0M4--RferVUVe4e3YMCmLUvn7jh7YGnWYhw3t7XvDhf2beJyqk6n9aIY";


/**
 * 
 */
const configurePushSub = async () => {
   
    try {

        if (!'serviceWorker' in navigator) return;

        const sw = await navigator.serviceWorker.ready;

        const sub = await sw.pushManager.getSubscription();

        if (sub === null) {

            // create a new sub
            const newSub = await sw.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPubKey)
            });


            const res = await fetch('http://localhost:4590/subscriptions', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSub)
            });

            console.log('[SUB]', newSub);

            if (!res.ok) throw new Error("Couldn't send the subscriptinon", res);

            displayConfirmNotification();

        } else {
            console.log('we should have a sub');
        }

    } catch (e) {
        console.log(e);
    }
}


/**
 * 
 *  display a push from the Service Worker 
 * 
 */
const displayConfirmNotification = async () => {

    if ('serviceWorker' in navigator) {

        const sw = await navigator.serviceWorker.ready;

        sw.showNotification('Thank you for subscribing', {
            body: 'You are the best',
            icon: '/src/images/icons/app-icon-512x512.png',
            image: '/src/images/sf-boat.jpg',
            vibrate: [100, 50, 200],
            badge: '/src/images/icons/app-icon-96x96.png', // the icon in the "top bar"
            dir: 'ltr', // left to right
            lang: 'en-US', // BCP 47
            tag: "confirm-notification", // will replace the previous notif if the same tag is used 
            renotify: true, // false = new notif with the same tag will not vibrate
            // actions might not be displayed 
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
        })
    }

}

/**
 * 
 */
const askForNotificationPermission = async () => {


    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        console.log('No notification');
        return;
    }

    console.log('Notification permission granted');

    displayConfirmNotification();

    configurePushSub();

}

if ('Notification' in window) {

    [...$enableNotificationsButtons].map($button => {

        $button.classList.remove('hidden');

        $button.addEventListener('click', askForNotificationPermission);
    });

}