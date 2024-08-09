const admin = require('firebase-admin');
const serviceAccount = require('./resultsphere-c958c-firebase-adminsdk-3j1u2-139e17a412.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'resultsphere-c958c.appspot.com', // Use the correct bucket name
});

// Get a reference to the storage bucket
const bucket = admin.storage().bucket();

module.exports = { bucket };
