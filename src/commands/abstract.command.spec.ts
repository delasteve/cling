import { expect } from 'chai';
import { AbstractCommand } from './abstract.command';
import { IMock, Mock, MockBehavior, It, Times } from 'typemoq';

describe('AbstractCommand', () => {
  let mockCommand: IMock<AbstractCommand>;
  let command: AbstractCommand;

  beforeEach(() => {
    mockCommand = Mock
      .ofType<AbstractCommand>(
      AbstractCommandTestSpecificSubclass, MockBehavior.Loose, /this is a complicated regex/ig);
    mockCommand.callBase = true;

    command = mockCommand.object;
  });

  describe('#canExecute', () => {
    it('should return true when regex is a match', async () => {
      const payload = { text: 'this is a complicated regex' };

      const result = await command.canExecute(payload);

      expect(result).to.be.true;
    });

    it('should return false when regex match fails', async () => {
      const payload = { text: 'this is not a complicated regex' };

      const result = await command.canExecute(payload);

      expect(result).to.be.false;
    });

    it('should return true for all regex matches even if regex has global flag', async () => {
      const payload = { text: 'this is a complicated regex' };

      command.canExecute(payload);
      const result = await command.canExecute(payload);

      expect(result).to.be.true;
    });
  });

  describe('#callback', () => {
    it('should call canExecute', async () => {
      const payload: any = { text: 'foo' };

      await command.callback(payload);

      mockCommand.verify(x => x.canExecute(payload), Times.once());
    });

    it('should call execute if it is able to execute the command', async () => {
      const payload: any = { text: 'foo' };
      mockCommand
        .setup(x => x.canExecute(It.isAny()))
        .returns(() => Promise.resolve(true));

      await command.callback(payload);

      mockCommand.verify(x => x.execute(payload), Times.once());
    });

    it('should not call execute if it is not able execute the command', async () => {
      const payload: any = { text: 'foo' };
      mockCommand
        .setup(x => x.canExecute(It.isAny()))
        .returns(() => Promise.resolve(true));

      await command.callback(payload);

      mockCommand.verify(x => x.execute(payload), Times.once());
    });
  });
});

class AbstractCommandTestSpecificSubclass extends AbstractCommand {
  constructor(commandPattern: RegExp) {
    super(commandPattern);
  }

  async execute(): Promise<void> { }
}
