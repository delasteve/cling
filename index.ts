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

const slackToken = process.env.SLACK_TOKEN;
const githubProject = process.env.GITHUB_PROJECT;
const githubToken = process.env.GITHUB_TOKEN;

const slackbot = new SlackBot(slackToken);

const slackMessenger = new SlackMessenger(slackToken);
const githubRepository = new GotGitHubRepository(githubToken, githubProject);

const firebaseContext = createFirebaseContext();
const userRepository = new FirebaseUserRepository(firebaseContext);

slackbot.register(new CloseIssueCommand(githubProject, githubRepository, slackMessenger));
slackbot.register(new GetIssueInfoCommand(githubRepository, slackMessenger));
slackbot.register(new GrantPermissionsCommand(userRepository, slackMessenger));
slackbot.register(new ListPermissionsCommand(userRepository, slackMessenger));

slackbot.start();
