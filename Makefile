install:
	cd api; npm install;
	cd public; npm install;

start-front:
	cd public; npm start;

start-api:
	cd api; npm start;

vapid-keys:
	cd api; npx web-push generate-vapid-keys;