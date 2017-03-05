import { IIssuesRepository } from '../issue.repository';

export class FirebaseIssueRepository implements IIssuesRepository {
  constructor(
    private readonly database: admin.database.Database
  ) { }

  async addIssue(issue: any): Promise<any> {
    await this.database
      .ref('issues/' + issue.number)
      .set({
        action: issue.action
      })
      .then((data: any) => data);
  }
}
