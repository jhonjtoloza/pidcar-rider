export let SHOW_VEHICLES_WITHIN = 5; // within 5km
export let POSITION_INTERVAL = 30000; // 20000ms
export let VEHICLE_LAST_ACTIVE_LIMIT = 600000 * 3; // 10 minutos

export let DEAL_STATUS_PENDING = 'PENDING';
export let DEAL_STATUS_ACCEPTED = 'ACCEPTED';
export let TRIP_STATUS_CANCELED = 'CANCELED';
export let TRIP_STATUS_GOING = 'GOING';
export let TRIP_STATUS_FINISHED = 'FINISHED';
export let TRIP_STATUS_WAITING = 'WAITING';
export let DEAL_TIMEOUT = 20000; // 20s

export let EMAIL_VERIFICATION_ENABLED = false; // send verification email after user register
export let ENABLE_SIGNUP = true;
export let SOS = "+919500707757";

// NOTE: Please update your firebase configurations on src/app/app.module.ts

export let GOOGLE_MAP_API_KEY = "AIzaSyCJtM8U5JrQtNpSqL--wz1Ye7GBdSl1--o";
export let GOOGLE_MAP_BASE_URL = "https://maps.googleapis.com/maps/api/";
export let DEFAULT_AVATAR = "http://placehold.it/150x150";
