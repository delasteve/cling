import * as got from 'got';
import { IGitHubRepository } from '../github.repository';

export class GotGitHubRepository implements IGitHubRepository {
  constructor(
    private readonly githubToken: string,
    private readonly githubProject: string
  ) { }

  async addLabels(issueNumber: string | number, labels: string[]): Promise<any> {
    const issueLabels = await got(`https://api.github.com/repos/${this.githubProject}/issues/${issueNumber}/labels`,
      {
        json: true,
        headers: {
          'Content-type': 'application/json',
          accept: 'application/vnd.github.v3+json',
          authorization: `token ${this.githubToken}`
        },
        body: JSON.stringify(labels)
      });

    return issueLabels;
  }
}
