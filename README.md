# Cling

[![Build Status](https://travis-ci.org/delasteve/cling.svg?branch=master)](https://travis-ci.org/delasteve/cling)
[![dependencies Status](https://david-dm.org/delasteve/cling/status.svg)](https://david-dm.org/delasteve/cling)
[![devDependencies Status](https://david-dm.org/delasteve/cling/dev-status.svg)](https://david-dm.org/delasteve/cling?type=dev)

A SlackBot for the Angular CLI team.

## Installation

```
git clone git@github.com:delasteve/cling.git
cd cling
npm install
```

## Configuration

In order for this project to run you need a Firebase service account file, a GitHub token, and a Slack token.

### Firebase

- Log in to the [Firebase](https://firebase.google.com) console.
- Create New Project or open an existing one.
- Click the cog icon and select Project Settings.
- Click on Service Accounts and click the `Generate new Private Key` button

### Slack

- Login to your Slack admin: https://your-team-name.slack.com/admin
- Click `Configure Apps` in the sidebar
- Search for `Bots` and on the bot page click `Add Configuration`
- Give the bot a name and click `Add bot integration`
- Copy the token that starts with `xox*-************-************************`

### GitHub
- Login to your GitHub account: https://github.com/login
- Navigate to https://github.com/settings/tokens/new
- Fill in the token description
- Select the `repo` checkbox
- Click `Generate Token` at the bottom of the page
- Copy the token presented

### Configure the tokens

- Copy the example files so you can edit their environment variables
  ```sh
  # development
  cp .env.example .env

  # production
  cp docker-compose.example.yml docker-compose.yml
  ```
- Set the `FIREBASE_*` environment variables from the appropriate Firebase `json` file values
- Set the `SLACK_TOKEN` variable with the Slack token generated above
- Set the `GITHUB_TOKEN` variable with the GitHub token generated above
- Set the `GITHUB_PROJECT` variable with the project you would like to have the bot work with

  example `angular/angular-cli`

## License

MIT
