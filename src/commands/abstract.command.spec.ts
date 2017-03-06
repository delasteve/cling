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
    it('should return true when regex is a match', () => {
      const payload = { text: 'this is a complicated regex' };

      const result = command.canExecute(payload);

      expect(result).to.be.true;
    });

    it('should return false when regex match fails', () => {
      const payload = { text: 'this is not a complicated regex' };

      const result = command.canExecute(payload);

      expect(result).to.be.false;
    });

    it('should return true for all regex matches even if regex has global flag', () => {
      const payload = { text: 'this is a complicated regex' };

      command.canExecute(payload);
      const result = command.canExecute(payload);

      expect(result).to.be.true;
    });
  });

  // currently disabled due to
  // https://github.com/florinn/typemoq/issues/51
  describe.skip('#callback', () => {
    it('should call canExecute', () => {
      const payload: any = { text: 'foo' };
      mockCommand
        .setup(x => x.canExecute(It.isAny()))
        .returns(() => false);

      command.callback(payload);

      mockCommand.verify(x => x.canExecute(It.isAny()), Times.once());
    });

    it.skip('should call execute if it is able to execute the command');
    it.skip('should not call execute if it is not able execute the command');
  });
});

class AbstractCommandTestSpecificSubclass extends AbstractCommand {
  constructor(commandPattern: RegExp) {
    super(commandPattern);
  }

  execute(): void { }
}
