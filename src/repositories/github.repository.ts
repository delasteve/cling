export interface IGitHubRepository {
  getIssue(issueNumber: string | number): Promise<any>;
  getRepositoryLabels(): Promise<string[]>;
  getIssueLabels(issueNumber: string | number): Promise<string[]>
  addLabels(issueNumber: string | number, labels: string[]): Promise<void>;
  removeLabels(issueNumber: string | number, labels: string[]): Promise<any>;
}
