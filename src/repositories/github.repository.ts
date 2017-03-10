export interface IGitHubRepository {
  getIssue(issueNumber: string | number): Promise<any>;
  addLabels(issueNumber: string | number, labels: string[]): Promise<void>;
}
