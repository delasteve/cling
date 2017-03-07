export interface IGitHubRepository {
  addLabels(issueNumber: string | number, labels: string[]): Promise<void>;
}
