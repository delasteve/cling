import * as dotenv from 'dotenv';
import { SlackBot } from './src/slackbot';
import { CloseIssueCommand } from './src/commands/issues/close.command';
import { createFirebaseContext } from './src/repositories/firebase/firebase.context';
import { FirebaseIssueRepository } from './src/repositories/firebase/issue.repository';

dotenv.config();

const slackToken = process.env.SLACK_TOKEN;
const slackbot = new SlackBot(slackToken);

const firebaseContext = createFirebaseContext();
const issuesRepository = new FirebaseIssueRepository(firebaseContext);

slackbot.registerCommand(new CloseIssueCommand(slackToken, issuesRepository));

slackbot.start();
