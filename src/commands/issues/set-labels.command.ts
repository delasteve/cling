import { AbstractCommand } from '../abstract.command';
import { IGitHubRepository } from '../../repositories/github.repository';
import { IMessenger } from '../../messengers/messenger.interface';
import { IUserRepository } from '../../repositories/user.respository';

export class SetLabelsCommand extends AbstractCommand {
  private readonly githubRepository: IGitHubRepository;
  private readonly userRepository: IUserRepository;
  private readonly messenger: IMessenger;

  constructor(githubRepository: IGitHubRepository, userRepository: IUserRepository, messenger: IMessenger) {
    const commandPattern = /^\!l(?:abel)?\s+\#?(\d+)\s+(.+)/i;
    super(commandPattern);

    this.githubRepository = githubRepository;
    this.userRepository = userRepository;
    this.messenger = messenger;
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

    const hasPermission = await this.userRepository.hasPermissions(payload.user, permissions);

    if (!hasPermission) {
      await this.messenger.sendMessage('You do not have permission to use this command.', payload);
    }

    return hasPermission;
  }

  public async execute(payload: any): Promise<void> {
    const issueNumber = await this.getIssueNumber(payload.text);
    const labelChanges = await this.getLabelChanges(payload.text);

    await this.githubRepository.addLabels(issueNumber, labelChanges.add);
    await this.githubRepository.removeLabels(issueNumber, labelChanges.remove);

    const issueLabels = await this.githubRepository.getIssueLabels(issueNumber);

    if (issueLabels.length === 0) {
      return await this.messenger.sendMessage(`Issue #${issueNumber} has been updated. It now has 0 labels.`, payload);
    }

    return await this.messenger.sendMessage(
      `Issue #${issueNumber} has been updated. It now has the following label(s): \`${issueLabels.join('`, `')}\`.`,
      payload);
  }

  private getIssueNumber(text: string): string {
    return this.commandPattern.exec(text)[1];
  }

  private async isPullRequest(issueNumber: string): Promise<boolean> {
    const issue = await this.githubRepository.getIssue(issueNumber);
    return !!issue.pull_request;
  }

  private async getLabelChanges(text: string) {
    const repoLabels = await this.githubRepository.getRepositoryLabels();

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
