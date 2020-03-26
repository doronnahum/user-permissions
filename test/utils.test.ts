import {
  matchRoles,
  parseConditions,
  isConditionEmpty,
  onNotPermissioned,
} from '../src/utils/utils';

describe('test onNotPermissioned utils', () => {
  it('Should by a function', () => {
    expect(typeof onNotPermissioned).toEqual('function');
  });

  it('Should return string', () => {
    expect(typeof onNotPermissioned('create', 'post')).toEqual('string');
  });
});

describe('test matchRoles utils', () => {
  it('Should by a function', () => {
    expect(typeof matchRoles).toEqual('function');
  });
  const roles = ['admin', 'sys_admin'];

  it('Should pass', () => {
    expect(matchRoles(roles, ['admin'])).toEqual(true);
  });
  it('Should Failed', () => {
    expect(matchRoles(roles, ['user'])).toEqual(false);
    expect(matchRoles(roles, undefined)).toEqual(false);
  });
});

describe('test parseConditions utils', () => {
  it('Should by a function', () => {
    expect(typeof parseConditions).toEqual('function');
  });
  const template = '{"creator": "{{ user.id }}" }';
  const user = { id: 'a1' };
  const parsing = { creator: user.id };

  it('Should pass', () => {
    expect(parseConditions(template, { user })).toEqual(parsing);
    expect(parseConditions(parsing, { user })).toEqual(parsing);
  });
  it('Should failed', () => {
    expect(parseConditions(template, { user: { id: 'a2' } })).not.toEqual(
      parsing
    );
  });
});

describe('test isConditionEmpty utils', () => {
  it('Should by a function', () => {
    expect(typeof isConditionEmpty).toEqual('function');
  });

  it('Should pass', () => {
    expect(isConditionEmpty(undefined)).toEqual(true);
    expect(isConditionEmpty({})).toEqual(true);
    expect(isConditionEmpty({ active: true })).toEqual(false);
    expect(isConditionEmpty('')).toEqual(true);
    expect(isConditionEmpty('{"active":true}')).toEqual(false);
  });
});
