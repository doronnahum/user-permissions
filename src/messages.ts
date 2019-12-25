export const messageTypes = {
  NOT_ABLE_BY_SUBJECT: 'NOT_ABLE_BY_SUBJECT',
  NOT_ABLE_BY_ACTION: 'NOT_ABLE_BY_ACTION',
  NOT_ABLE_BY_ROLE: 'NOT_ABLE_BY_ROLE',
  NOT_ABLE_BY_USER_CONTEXT: 'NOT_ABLE_BY_USER_CONTEXT',
  NOT_ABLE_BY_WHEN: 'NOT_ABLE_BY_WHEN',
  NOT_ABLE_BY_DATA: 'NOT_ABLE_BY_DATA',
  VALID: 'VALID',
};
export let renderMessageByTypes = (
  type: string,
  subject: string,
  action: string
) => {
  switch (type) {
    case messageTypes.VALID:
      return `Valid`;
    case messageTypes.NOT_ABLE_BY_SUBJECT:
      return `You are not able to use ${subject}`;
    case messageTypes.NOT_ABLE_BY_ACTION:
      return `You are not able to ${action} ${subject}`;
    case messageTypes.NOT_ABLE_BY_ROLE:
    case messageTypes.NOT_ABLE_BY_USER_CONTEXT:
    case messageTypes.NOT_ABLE_BY_WHEN:
      return 'You are not able, missing permission';
    case messageTypes.NOT_ABLE_BY_DATA:
      return `You can't to ${action} ${subject} in this data structure`;
    default:
      return 'You are not able';
  }
};

/**
 * @function setRenderMessageByTypes
 * Allow to config a custom function
 * @param handler
 */
export const setRenderMessageByTypes = (
  handler: (type: string, subject: string, action: string) => string
) => {
  if (typeof handler === 'function') {
    renderMessageByTypes = handler;
    return 'done';
  }
  throw new Error('handler must be a function');
};
