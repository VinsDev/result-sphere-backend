const admin = require('firebase-admin');
const serviceAccount = require('./serviceKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'resultsphere-c958c.appspot.com', // Use the correct bucket name
});

// Get a reference to the storage bucket
const bucket = admin.storage().bucket();

module.exports = { bucket };
