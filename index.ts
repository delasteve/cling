import * as dotenv from 'dotenv';
dotenv.config();

import { SlackBot } from './src/slackbot';
import { CloseIssueCommand } from './src/commands/issues/close.command';

const slackToken = process.env.SLACK_TOKEN;
const slackbot = new SlackBot(slackToken);

slackbot.registerCommand(new CloseIssueCommand(slackToken));

slackbot.start();
