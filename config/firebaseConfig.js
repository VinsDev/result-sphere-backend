const admin = require('firebase-admin');
const serviceAccount = require('./resultsphere-c958c-firebase-adminsdk-pz5jv-1c7613a76a.json'); // Path to your service account JSON file

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'resultsphere-c958c.appspot.com', // Use the correct bucket name
});

// Get a reference to the storage bucket
const bucket = admin.storage().bucket();

module.exports = { bucket };