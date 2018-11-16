const dbPromise = idb.open('posts-store', 1, db => {

    // Create a posts store only is it doesn't exist yet
    if (!db.objectStoreNames.contains('posts')) {

        db.createObjectStore('posts', {
            keyPath: 'id'
        })
    }


    // A store to keep track on the bg sync tasks
    if (!db.objectStoreNames.contains('sync-posts')) {

        db.createObjectStore('sync-posts', {
            keyPath: 'id'
        })
    }

});



const writeDataInDb = (storeName, dataToSave) => {

    return dbPromise.then(db => {

        const tx = db.transaction(storeName, 'readwrite');

        const store = tx.objectStore(storeName);

        store.put(dataToSave);

        return tx.complete;
    });

}


const readAllDataFromDb = (storeName) => {

    return dbPromise.then(db => {

        const tx = db.transaction(storeName, 'readonly');

        const store = tx.objectStore(storeName);

        return store.getAll();

    });

}



const clearAllDatafFromDb = (storeName) => {


    return dbPromise.then(db => {

        const tx = db.transaction(storeName, 'readwrite');

        const store = tx.objectStore(storeName);

        store.clear();

        return tx.complete;

    })

}


/**
 * 
 * @param {string} storeName 
 * @param {int} id 
 */
const deleteItemFromData = (storeName, id) => {

    return dbPromise.then(db => {

        const tx = db.transaction(storeName, 'readwrite');

        const store = tx.objectStore(storeName);

        store.delete(id);

        return tx.complete;

    })


}


// todo : should be moved out of this file 

/**
 * urlBase64ToUint8Array
 * 
 * @param {string} base64String a public vapid key
 */
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Transform a base64 string to a file
 * @param {base64 string} dataURI 
 */
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  }