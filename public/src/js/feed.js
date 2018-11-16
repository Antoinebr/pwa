  var shareImageButton = document.querySelector('#share-image-button');
  var createPostArea = document.querySelector('#create-post');
  var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
  var sharedMomentsArea = document.querySelector('#shared-moments');
  const $form = document.querySelector('form');
  const $videoPlayer = document.querySelector('#player');
  const $canvas = document.querySelector('#canvas');
  const $captureButton = document.querySelector('#capture-btn');
  const $imagePicker = document.querySelector('#image-picker');
  const $imagePickerArea = document.querySelector('#pick-image');
  let picture = null;

  let defferedPrompt;


  function initializeMedia() {
    if (!('mediaDevices' in navigator)) {
      navigator.mediaDevices = {};
    }

    if (!('getUserMedia' in navigator.mediaDevices)) {
      navigator.mediaDevices.getUserMedia = function (constraints) {
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented!'));
        }

        return new Promise(function (resolve, reject) {
          // inside getUserMedia this will be equal ot navigator
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }



    navigator.mediaDevices.getUserMedia({
        video: true
      })
      .then(stream => {
        $videoPlayer.srcObject = stream;
        $videoPlayer.style.display = 'block';
      })
      .catch(e => {
        // let's show the image picker instead 
        $captureButton.style.display = "none";
        $imagePickerArea.style.display = 'block';
      });


  }


  $captureButton.addEventListener("click", function (e) {

    $canvas.style.display = "block";
    $videoPlayer.style.display = "none";
    $captureButton.style.display = "none";
    const context = $canvas.getContext('2d');
    const height = $videoPlayer.videoHeight / ($videoPlayer.videoWidth / $canvas.width);
    context.drawImage($videoPlayer, 0, 0, $canvas.width, height);
    $videoPlayer.srcObject.getVideoTracks().forEach(t => t.stop());

    picture = dataURItoBlob($canvas.toDataURL());

  });

  $imagePicker.addEventListener('change', function (event) {
    picture = event.target.files[0];
  });



  function openCreatePostModal() {

    createPostArea.style.display = 'block';
    initializeMedia();

    if (defferedPrompt) {

      defferedPrompt.prompt();

      defferedPrompt.userChoice.then(result => {

        if (result.outcome == "dismissed") {
          console.log('User canceled installation')
        } else {
          console.log('user added to Home Screen')
        }

        defferedPrompt = null

      })

    }

  }

  function closeCreatePostModal() {
    createPostArea.style.display = 'none';
    $videoPlayer.style.display = 'none';
    $imagePickerArea.style.display = 'none';
    $canvas.style.display = 'none';
  }

  shareImageButton.addEventListener('click', openCreatePostModal);

  closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);



  window.addEventListener('beforeinstallprompt', event => {

    console.log('Before the install prompt fired');
    event.preventDefault();
    defferedPrompt = event;

    return false;
  });


  shareImageButton.addEventListener('click', openCreatePostModal);

  /**
   * Save something in the cache after a click
   * @returns {void}
   */
  async function onSaveButtonClicked() {
    console.log('clicked')

    if ('caches' in window) {
      const cache = await caches.open('user-requested');
      cache.add('/src/images/sf-boat.jpg');
    }

  }


  /**
   * Save something in the cache after a click
   * @returns {void}
   */
  async function onDeleteButtonClicked() {

    console.log(this.dataset.id)

    console.log(this)
    console.log(JSON.stringify({
      id: this.dataset.id
    }))
    const res = await fetch('http://localhost:4590/posts', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: this.dataset.id
      })
    });

    const json = await res.json();


  }



  /**
   * @returns {void}
   */
  const clearCards = () => {

    while (sharedMomentsArea.hasChildNodes()) {
      sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    }

  }


  /**
   * createCard
   * @param {object} data 
   */
  function createCard(data) {

    // const lol = `

    // <div class="shared-moment-card mdl-card mdl-shadow--2dp">
    //   <div class="mdl-card__title" style="background-image: url('${data.image}'); background-size: cover; height: 180px;">
    //       <h2 class="mdl-card__title-text" style="color: white;">${data.title}')</h2>
    //   </div>
    //     <div class="mdl-card__supporting-text" style="text-align: center;">dfd<button>save</button><button id="${data.id}">delete</button></div>
    // </div>
    // `

    var cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';

    var cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = `url("http://localhost:4590/uploads/${data.image}")`;
    cardTitle.style.backgroundSize = 'cover';
    cardTitle.style.height = '180px';
    cardWrapper.appendChild(cardTitle);

    var cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = data.title;
    cardTitleTextElement.style.color = "white";
    cardTitle.appendChild(cardTitleTextElement);

    var cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = data.location;
    cardSupportingText.style.textAlign = 'center';

    var cardSaveButton = document.createElement('button');
    cardSaveButton.innerText = "save";
    cardSaveButton.addEventListener('click', onSaveButtonClicked);
    cardSupportingText.appendChild(cardSaveButton);

    var cardDeleteButton = document.createElement('button');
    cardDeleteButton.innerText = "delete";
    cardDeleteButton.setAttribute("data-id", data.id);
    cardDeleteButton.addEventListener('click', onDeleteButtonClicked);
    cardSupportingText.appendChild(cardDeleteButton);

    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
  }


  const updateUI = (entries) => {

    for (entrie of entries) {
      //console.log(entrie)
      createCard(entrie)
    }

  }


  /**
   * 
   */
  const raceToGetContent = () => {


    let networkDataReceived = false;

    const endPoint = 'http://localhost:4590/posts';

    (async () => {

      const data = await fetch(endPoint);

      const json = await data.json();

      networkDataReceived = true;

      clearCards();

      const array = []

      for (key in json) {
        array.push(json[key]);
      }

      console.log('Update the UI from network')

      updateUI(array)

    })();


    (async () => {

      if ('indexedDB' in window) {

        const data = await readAllDataFromDb('posts');

        if (networkDataReceived) return;

        console.log('From cache', data)

        updateUI(data);

      }

    })();

  }

  raceToGetContent();


  /**
   * sendData to Firebase
   * 
   * @param {object} param a destructured object 
   */
  const sendData = async ({
    id = new Date().toISOString(),
    title,
    location
  }) => {

    const postData = new FormData();
    postData.append('id', id);
    postData.append('title', title);
    postData.append('location', location);
    postData.append('file', picture, `${dt.id}.png`);

    try {

      const res = await fetch('http://localhost:4590/posts', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: postData
      });

      const json = await res.json();


      console.log("Response from Sent data", json);


    } catch (e) {
      console.log('Error sending the form ', e);
    }
  }


  /**
   *  Form 
   * 
   */
  $form.addEventListener('submit', function (event) {

    event.preventDefault();

    const $title = this.querySelector('#title');
    const $location = this.querySelector('#location');

    if ($title.value.trim() === "" || $location.value.trim() === "") return;

    closeCreatePostModal();

    // all browsers don't have SyncManager so let's check
    if ('serviceWorker' in navigator && 'SyncManager' in window) {

      (async () => {

        // We grab the sw 
        const sw = await navigator.serviceWorker.ready;

        const post = {
          id: new Date().toISOString(),
          title: $title.value,
          location: $location.value,
          picture
        }

        console.log("will send", post);

        try {

          // we write the request in the indexedDB
          await writeDataInDb('sync-posts', post);

          // we register/emit a sync event which will be listened in the Service Worker
          await sw.sync.register('sync-new-post');

          const $snackbarContainer = document.querySelector('#confirmation-toast');

          $snackbarContainer.MaterialSnackbar.showSnackbar({
            message: "Your post was save for syncing !"
          });

        } catch (e) {
          console.log('Error in registration & sync : bgsync ', e);
        }

      })()

    } else {

      // We send the data direcly 
      sendData({
        title: $title.value,
        location: $location.value
      });

    }

  })