# Cling

[![Build Status](https://travis-ci.org/delasteve/cling.svg?branch=master)](https://travis-ci.org/delasteve/cling)
[![dependencies Status](https://david-dm.org/delasteve/cling/status.svg)](https://david-dm.org/delasteve/cling)
[![devDependencies Status](https://david-dm.org/delasteve/cling/dev-status.svg)](https://david-dm.org/delasteve/cling?type=dev)

A SlackBot for the Angular CLI team.

## Installation

    $ git clone git@github.com:delasteve/cling.git
    $ cd cling
    $ npm install

## Configuration

In order for this project to run you need a Firebase configuration file and a Slack token.

### Get Firebase configuration details

- Log in to the [Firebase](https://firebase.google.com) console.
- Create New Project or open an existing one.
- Click the cog icon and select Project Settings.
- Click on Service Accounts and click the `Generate new Private Key` button
- Store the file that gets download as `firebase.json` in the project root.

### Get the Slack token

- Login to your Slack admin: https://<team-name>.slack.com/admin
- Click `Configure Apps` in the sidebar
- Search for `Bots` and on the bot page click `Add Configuration`
- Give the bot a name and click `Add bot integration`
- Copy the code that starts with `xox*-************-************************`

### Configure the tokens

- Create a copy of the `.env.example`: `$ cp .env.example .env`
- Set the Slack token in the `SLACK_TOKEN` variable
- Set the Firebase Database URL in the `FIREBASE_DATABASE_URL` variable (look for `project_id` in `firebase.json`)

## License

MIT
