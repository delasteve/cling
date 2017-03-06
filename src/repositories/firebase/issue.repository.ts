import { IIssueRepository } from '../issue.repository';

export class FirebaseIssueRepository implements IIssueRepository {
  constructor(
    private readonly database: admin.database.Database
  ) { }

  async addIssue(issue: any): Promise<any> {
    await this.database
      .ref('issues/' + issue.id)
      .set({
        action: issue.action
      })
      .then((data: any) => data);
  }
}
