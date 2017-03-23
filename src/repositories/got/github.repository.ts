import * as got from 'got';
import { IGitHubRepository } from '../github.repository';

export class GotGitHubRepository implements IGitHubRepository {
  constructor(
    private readonly githubToken: string,
    private readonly githubProject: string
  ) { }

  public async getIssue(issueNumber: string | number): Promise<any> {
    const issue = await got(`https://api.github.com/repos/${this.githubProject}/issues/${issueNumber}`,
      {
        json: true,
        headers: {
          accept: 'application/vnd.github.v3+json',
          authorization: `token ${this.githubToken}`
        }
      });

    return issue.body;
  }

  public async getRepositoryLabels(): Promise<string[]> {
    const response = await got(`https://api.github.com/repos/${this.githubProject}/labels`, {
      json: true,
      headers: {
        accept: 'application/vnd.github.v3+json',
        authorization: `token ${this.githubToken}`
      }
    });

    return response.body
      .map(label => label.name)
      .filter(label => !['cla: yes', 'cla: no'].includes(label));
  }

  public async getIssueLabels(issueNumber: string | number): Promise<string[]> {
    const response = await got(`https://api.github.com/repos/${this.githubProject}/issues/${issueNumber}/labels`, {
      json: true,
      headers: {
        accept: 'application/vnd.github.v3+json',
        authorization: `token ${this.githubToken}`
      }
    });

    return response.body
      .map(label => label.name);
  }

  public async addLabels(issueNumber: string | number, labels: string[]): Promise<any> {
    await got.post(`https://api.github.com/repos/${this.githubProject}/issues/${issueNumber}/labels`, {
      json: true,
      headers: {
        'Content-type': 'application/json',
        accept: 'application/vnd.github.v3+json',
        authorization: `token ${this.githubToken}`
      },
      body: JSON.stringify(labels)
    });
  }

  public async removeLabels(issueNumber: string | number, labels: string[]): Promise<any> {
    const promises = labels.map(label =>
      got.delete(`https://api.github.com/repos/${this.githubProject}/issues/${issueNumber}/labels/${label}`, {
        headers: {
          'Content-type': 'application/json',
          accept: 'application/vnd.github.v3+json',
          authorization: `token ${this.githubToken}`
        }
      }));

    await Promise.all(promises);
  }
}
