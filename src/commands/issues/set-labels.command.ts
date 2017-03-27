import { AbstractCommand } from '../abstract.command';
import { githubRepository, slackMessenger, userRepository } from '../../../index'

export class SetLabelsCommand extends AbstractCommand {
  constructor() {
    const commandPattern = /^\!l(?:abel)?\s+\#?(\d+)\s+(.+)/i;
    super(commandPattern);
  }

  public async canExecute(payload: any): Promise<boolean> {
    if (!(await super.canExecute(payload))) { return false; }

    const issueNumber = this.getIssueNumber(payload.text);
    const permissions = ['admin', 'label'];
    if (await this.isPullRequest(issueNumber)) {
      permissions.push('pr', 'pr:label');
    } else {
      permissions.push('issue', 'issue:label');
    }

    const hasPermission = await userRepository.hasPermissions(payload.user, permissions);

    if (!hasPermission) {
      await slackMessenger.sendMessage('You do not have permission to use this command.', payload);
    }

    return hasPermission;
  }

  public async execute(payload: any): Promise<void> {
    const issueNumber = await this.getIssueNumber(payload.text);
    const labelChanges = await this.getLabelChanges(payload.text);

    await githubRepository.addLabels(issueNumber, labelChanges.add);
    await githubRepository.removeLabels(issueNumber, labelChanges.remove);

    const issueLabels = await githubRepository.getIssueLabels(issueNumber);

    if (issueLabels.length === 0) {
      return await slackMessenger.sendMessage(`Issue #${issueNumber} has been updated. It now has 0 labels.`, payload);
    }

    return await slackMessenger.sendMessage(
      `Issue #${issueNumber} has been updated. It now has the following label(s): \`${issueLabels.join('`, `')}\`.`,
      payload);
  }

  private getIssueNumber(text: string): string {
    return this.commandPattern.exec(text)[1];
  }

  private async isPullRequest(issueNumber: string): Promise<boolean> {
    const issue = await githubRepository.getIssue(issueNumber);

    return !!issue.pull_request;
  }

  private async getLabelChanges(text: string) {
    const repoLabels = await githubRepository.getRepositoryLabels();

    const matches = this.commandPattern.exec(text)[2];
    const allLabels: string[] = matches
      .split(',')
      .map(label => label.trim());

    const labelsToAdd = allLabels
      .filter(label => !label.startsWith('-') && repoLabels.includes(label));
    const labelsToRemove = allLabels
      .filter(label => label.startsWith('-'))
      .map(label => label.substring(1).trim())
      .filter(label => repoLabels.includes(label));

    return {
      add: labelsToAdd,
      remove: labelsToRemove
    };
  }
}
