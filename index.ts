import * as dotenv from 'dotenv';
import { SlackBot } from './src/slackbot';
import { CloseIssueCommand } from './src/commands/issues/close.command';
import { GetIssueInfoCommand } from './src/commands/issues/get-info.command';
import { GrantPermissionCommand } from './src/commands/admin/grant-permission.command';
import { GotGitHubRepository } from './src/repositories/got/github.repository';
import { createFirebaseContext } from './src/repositories/firebase/firebase.context';
import { FirebaseUserRepository } from './src/repositories/firebase/user.repository';
import { SlackMessenger } from './src/messengers/slack.messenger';

dotenv.config();

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
slackbot.register(new GrantPermissionCommand(userRepository, slackMessenger));

slackbot.start();
