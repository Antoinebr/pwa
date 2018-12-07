# PWA DEMO 📱

A PWA demo project with :

* Offline ( vanilla SW : with ES7 async await 🔥 )
* Background sync 
* Push Notifications ( vanilla push with web-push modules )

The front-end is pure JavaScript and the backend API is built with express / Sequelize / sqlite3

### Want to give it a try ? 😁

### #1 Install the dependencies 

```bash
make install
```

### #2 Generate vapid keys for push notifications 



```
make vapid-keys
``` 

Grab the keys and put the in in ```variables.env``` file ( see below 👇)

### #3 Set the environement variables 

```bash
NODE_ENV=development
VAPID_EMAIL=yourEmail@domain.com
VAPID_PUBLIC_KEY=BDCCmgiosdsdisdkTk0M4fd4e3YMCmLUvn7jh7YGnWYhw3t7XvDhffddssdsdaIY
VAPID_PRIVATE_KEY=SGadD3ksa4-sdsddsdst_dhDvbdsfdsl84XfFa_tRA
```

### #4 Start the front-end project 

```bash 
make start-front
```

### #5 Start the back-end 


```bash 
make start-api
```

<hr>


## API 


### send a push 

```bash 
curl -X POST \
  http://localhost:4590/sendPush \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
	"title": "Lorem :)",
	"content": " Lorem ipsum dolor sit met, qui at desert mandamus, adduce ullum apeirian mea at. Eu mel vide saltando vituperata, sonet quidam deterruisset te qui. Te cum vivendum explicate abhorrent. Id venom argumentum vel. Ut lorem bocent hendrerit eam"
  }'
```