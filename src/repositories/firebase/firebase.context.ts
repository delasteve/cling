import * as admin from 'firebase-admin';
const firebaseServiceAccount = require('../../../firebase.json');

function createFirebaseContext() {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });

  return admin.database();
}

export { createFirebaseContext };
