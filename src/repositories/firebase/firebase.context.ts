import * as admin from 'firebase-admin';

function createFirebaseContext(
  databaseUrl: string, projectId: string, privateKeyId: string,
  privateKey: string, clientEmail: string, clientId: string,
  clientCertUrl: string) {
  const firebaseConfig = {
    type: 'service_account',
    project_id: projectId || '',
    private_key_id: privateKeyId || '',
    private_key: privateKey || '',
    client_email: clientEmail || '',
    client_id: clientId || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://accounts.google.com/o/oauth2/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: clientCertUrl || '',
  };

  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: databaseUrl
  });

  return admin.database();
}

export { createFirebaseContext };
