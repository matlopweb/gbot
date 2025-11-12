import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const clientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
};

function assertGoogleConfig() {
  if (!clientConfig.clientId || !clientConfig.clientSecret || !clientConfig.redirectUri) {
    throw new Error('Google OAuth configuration is incomplete. Check GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI.');
  }
}

export function createOAuthClient(tokens) {
  assertGoogleConfig();
  const client = new google.auth.OAuth2(
    clientConfig.clientId,
    clientConfig.clientSecret,
    clientConfig.redirectUri
  );

  if (tokens) {
    client.setCredentials(tokens);
  }

  return client;
}

let sharedClient = null;

function getSharedClient() {
  if (!sharedClient) {
    sharedClient = createOAuthClient();
  }
  return sharedClient;
}

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

export function getAuthUrl() {
  return getSharedClient().generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

export async function getTokensFromCode(code) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export function setCredentials(tokens) {
  return createOAuthClient(tokens);
}

export async function refreshAccessToken(refreshToken) {
  const client = createOAuthClient({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}

export default getSharedClient();
