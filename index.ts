import * as dotenv from 'dotenv';
import { SlackBot } from './src/slackbot';
import { CloseIssueCommand } from './src/commands/issues/close.command';
import { GotGitHubRepository } from './src/repositories/got/github.repository';
import { SlackMessenger } from './src/messengers/slack.messenger';

dotenv.config();

const slackToken = process.env.SLACK_TOKEN;
const githubProject = process.env.GITHUB_PROJECT;
const githubToken = process.env.GITHUB_TOKEN;

const slackbot = new SlackBot(slackToken);

const slackMessenger = new SlackMessenger(slackToken);
const githubRepository = new GotGitHubRepository(githubToken, githubProject);

slackbot.register(new CloseIssueCommand(githubProject, githubRepository, slackMessenger));

slackbot.start();
