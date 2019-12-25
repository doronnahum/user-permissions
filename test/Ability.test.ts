import Ability from '../src/Ability';

describe('Test Ability class', () => {
  const abilityToReadPost = new Ability({ actions: 'read', subject: 'posts' });
  const abilityToCreatePost = new Ability({
    actions: 'create',
    subject: 'posts',
    conditions: { publish: true },
  });
  const abilityToCreatePostWithTemplateConditions = new Ability({
    actions: 'create',
    subject: 'posts',
    conditions: '{ "organization": "{{ user.organization }}" }',
  });
  const abilityToCreateOnePost = new Ability({
    actions: 'create',
    subject: 'posts',
    allowOne: true,
  });
  const abilityToAll = new Ability({ actions: '*', subject: '*' });
  const abilityWithWhen = new Ability({
    actions: '*',
    subject: '*',
    when: () => false,
  });
  const abilityToAdmin = new Ability({
    actions: '*',
    subject: '*',
    roles: 'admin',
  });

  const abilityToUser = new Ability({
    actions: '*',
    subject: '*',
    user: true,
  });
  const abilityToUserWithPayment = new Ability({
    actions: '*',
    subject: '*',
    user: { payment: { $exists: true } },
  });

  it('Create new Ability', () => {
    expect(abilityToReadPost).toBeInstanceOf(Ability);
  });

  it('Validate read action check', () => {
    expect(abilityToReadPost.check('read', 'posts').can).toEqual(true);
  });

  it('Validate read action check [should failed]', () => {
    expect(abilityToReadPost.check('create', 'posts').can).toEqual(false);
  });

  it('Validate read action + conditions', () => {
    const data = {
      title: 'lorem',
      publish: true,
    };
    const checkResult = abilityToCreatePost.check('create', 'posts');
    expect(checkResult.can).toEqual(true);
    expect(checkResult.validateData(data)).toEqual(true);
    expect(checkResult.where).toEqual(abilityToCreatePost.get().conditions);
  });

  it('Validate create action + template conditions', () => {
    const checkResult = abilityToCreatePostWithTemplateConditions.check(
      'create',
      'posts',
      {
        user: {
          organization: 'Yellow',
        },
      }
    );
    expect(checkResult.can).toEqual(true);
    expect(checkResult.where).toEqual({ organization: 'Yellow' });
    expect(typeof checkResult.validateData).toEqual('function');
    expect(
      checkResult.validateData &&
        checkResult.validateData({ organization: 'T' })
    ).toEqual(false);
    expect(
      checkResult.validateData &&
        checkResult.validateData({ organization: 'Yellow' })
    ).toEqual(true);
  });

  it('Validate create action + data + template conditions', () => {
    const user = { organization: 'Yellow' };
    const validData = { organization: 'Yellow' };
    const unValidData = { organization: 'Facebook' };
    expect(
      abilityToCreatePostWithTemplateConditions
        .check('create', 'posts', {
          user,
        })
        .validateData(validData)
    ).toEqual(true);
    expect(
      abilityToCreatePostWithTemplateConditions
        .check('create', 'posts', {
          user,
        })
        .validateData(unValidData)
    ).toEqual(false);
  });

  it('Validate read action + conditions - many', () => {
    expect(
      abilityToCreatePost
        .check('create', 'posts')
        .validateData([{ title: 'lorem', publish: true }])
    ).toEqual(true);
  });

  it('Validate read action + conditions - many when allowOne is true [should failed]', () => {
    expect(
      abilityToCreateOnePost
        .check('create', 'posts')
        .validateData([{ title: 'lorem', publish: true }])
    ).toEqual(false);
  });

  it('Validate read action + conditions [should failed]', () => {
    expect(
      abilityToCreatePost.check('create', 'posts').validateData({
        title: 'lorem',
        publish: false,
      })
    ).toEqual(false);
  });

  it('Validate read action +  conditions  - many [should failed]', () => {
    expect(
      abilityToCreatePost
        .check('create', 'posts')
        .validateData([{ title: 'lorem', publish: false }])
    ).toEqual(false);
  });

  it('Validate when actions & subject is *', () => {
    expect(
      abilityToAll.check('read', 'posts').can &&
        abilityToAll.check('create', 'comments').can &&
        abilityToAll.check('delete', 'atrial').can &&
        abilityToAll.check('update', 'posts').can
    ).toEqual(true);
  });

  it('Validate using when', () => {
    expect(abilityWithWhen.check('read', 'posts').can).toEqual(false);
  });

  it('Validate using roles', () => {
    expect(abilityToAdmin.check('read', 'posts').can).toEqual(false);
    expect(
      abilityToAdmin.check('read', 'posts', { roles: 'admin' }).can
    ).toEqual(true);
    expect(
      abilityToAdmin.check('read', 'posts', { roles: 'guest' }).can
    ).toEqual(false);
  });

  it('Validate using user true', () => {
    expect(abilityToUser.check('read', 'posts').can).toEqual(false);
    expect(
      abilityToUser.check('read', 'posts', { user: { id: 'a1' } }).can
    ).toEqual(true);
  });

  it('Validate using user context', () => {
    expect(abilityToUserWithPayment.check('read', 'posts').can).toEqual(false);
    expect(
      abilityToUserWithPayment.check('read', 'posts', {
        user: { id: 'a1', payment: { visa: '**' } },
      }).can
    ).toEqual(true);
  });
});
