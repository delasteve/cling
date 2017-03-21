// import { expect } from 'chai';
// import { HelpCommand } from './help.command';
import { Mock, IMock, } from 'typemoq';
import { IMessenger } from '../../messengers/messenger.interface';

describe('HelpCommand', () => {
  let mockMessenger: IMock<IMessenger>;

  beforeEach(() => {
    mockMessenger = Mock.ofType<IMessenger>();
  });

  describe('#canExecute', () => {});

  describe('#execute', () => {});
});
