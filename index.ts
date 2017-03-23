import * as dotenv from 'dotenv';
dotenv.config();

import { SlackBot } from './src/slackbot';
import { CloseIssueCommand } from './src/commands/issues/close.command';
import { GetIssueInfoCommand } from './src/commands/issues/get-info.command';
import { GrantPermissionsCommand } from './src/commands/admin/grant-permissions.command';
import { ListPermissionsCommand } from './src/commands/admin/list-permissions.command';
import { GotGitHubRepository } from './src/repositories/got/github.repository';
import { createFirebaseContext } from './src/repositories/firebase/firebase.context';
import { FirebaseUserRepository } from './src/repositories/firebase/user.repository';
import { SlackMessenger } from './src/messengers/slack.messenger';
import { SetLabelsCommand } from './src/commands/issues/set-labels.command';

const slackToken = process.env.SLACK_TOKEN;
const githubProject = process.env.GITHUB_PROJECT;
const githubToken = process.env.GITHUB_TOKEN;
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || '';
const firebasePrivateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID || '';
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') || '';
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
const firebaseClientId = process.env.FIREBASE_CLIENT_ID || '';
const firebaseClientCertUrl = process.env.FIREBASE_CLIENT_X509_CERT_URL || '';
const firebaseDatabaseUrl = process.env.FIREBASE_DATABASE_URL;

const slackbot = new SlackBot(slackToken);

const slackMessenger = new SlackMessenger(slackToken);
const githubRepository = new GotGitHubRepository(githubToken, githubProject);

const firebaseContext = createFirebaseContext(
  firebaseDatabaseUrl, firebaseProjectId, firebasePrivateKeyId,
  firebasePrivateKey, firebaseClientEmail, firebaseClientId,
  firebaseClientCertUrl);
const userRepository = new FirebaseUserRepository(firebaseContext);

slackbot.register(new CloseIssueCommand(githubProject, githubRepository, slackMessenger));
slackbot.register(new GetIssueInfoCommand(githubRepository, slackMessenger));
slackbot.register(new GrantPermissionsCommand(userRepository, slackMessenger));
slackbot.register(new ListPermissionsCommand(userRepository, slackMessenger));
slackbot.register(new SetLabelsCommand(githubRepository, userRepository, slackMessenger));

slackbot.start();
