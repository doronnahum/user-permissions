import {
  messageTypes,
  renderMessageByTypes,
  setRenderMessageByTypes
} from '../src/messages';
describe('test messages function', () => {
  it('renderMessageByTypes Should by a function', () => {
    expect(typeof renderMessageByTypes).toEqual('function');
  });
  it('Should by return a string', () => {
    expect(
      typeof renderMessageByTypes(
        messageTypes.NOT_ABLE_BY_ACTION,
        'create',
        'posts'
      )
    ).toEqual('string');
    expect(
      typeof renderMessageByTypes(
        messageTypes.NOT_ABLE_BY_DATA,
        'create',
        'posts'
      )
    ).toEqual('string');
    expect(
      typeof renderMessageByTypes(
        messageTypes.NOT_ABLE_BY_ROLE,
        'create',
        'posts'
      )
    ).toEqual('string');
    expect(
      typeof renderMessageByTypes(
        messageTypes.NOT_ABLE_BY_SUBJECT,
        'create',
        'posts'
      )
    ).toEqual('string');
    expect(
      typeof renderMessageByTypes(
        messageTypes.NOT_ABLE_BY_USER_CONTEXT,
        'create',
        'posts'
      )
    ).toEqual('string');
    expect(
      typeof renderMessageByTypes(
        messageTypes.NOT_ABLE_BY_WHEN,
        'create',
        'posts'
      )
    ).toEqual('string');
    expect(
      typeof renderMessageByTypes(messageTypes.VALID, 'create', 'posts')
    ).toEqual('string');
    expect(typeof renderMessageByTypes('', 'create', 'posts')).toEqual(
      'string'
    );
  });
  it('setRenderMessageByTypes Should by a function', () => {
    expect(typeof setRenderMessageByTypes).toEqual('function');
  });
  it('setRenderMessageByTypes Should by a function', () => {
    setRenderMessageByTypes(() => 'TEST');
    expect(
      renderMessageByTypes(messageTypes.NOT_ABLE_BY_ACTION, 'create', 'posts')
    ).toEqual('TEST');
  });
  it('setRenderMessageByTypes Should by a function', () => {
    try {
      setRenderMessageByTypes('' as any); // Throw error
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toBe('handler must be a function');
    }
  });
});
