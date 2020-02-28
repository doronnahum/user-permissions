import { Ability, Abilities } from '../src';

const appAbilities = new Abilities([
  // Everyone can read posts title and body
  new Ability('read', 'posts', undefined, undefined, {
    fields: ['title', 'body']
  }),
  // Logged in user can manage post, when he is the creator
  new Ability('*', 'posts', undefined, '{"creator": "{{ user.id }}" }', {
    user: true
  }),
  // Admin user can manage any post
  new Ability('*', 'posts', ['admin'], undefined),
  // Payment user can read the extra info field
  new Ability('*', 'posts', undefined, undefined, {
    fields: ['info'],
    user: { isPay: true }
  }),
  // Everyone can read comments title fields
  new Ability('read', 'comments', undefined, undefined, { fields: ['title'] }),
  // User can read comments body fields
  new Ability('read', 'comments', undefined, undefined, {
    fields: ['body'],
    user: true
  }),
  // User can read comments rating only when he is the creator
  new Ability('read', 'comments', undefined, '{"creator": "{{ user.id }}" }', {
    fields: ['rating'],
    user: true
  })
]);

describe('Test Abilities class', () => {
  it('Create new Abilities', () => {
    expect(appAbilities).toBeInstanceOf(Abilities);
  });
  it('test Abilities.get', () => {
    expect(typeof appAbilities.get).toEqual('function');
    expect(typeof appAbilities.get()).toEqual('object');
  });
  it('anonymous user can read post', () => {
    expect(appAbilities.check('read', 'posts').can).toBe(true);
  });
  it('anonymous user can read only title and body of the posts', () => {
    const res = appAbilities.check('read', 'posts');
    expect(res.fields).toEqual(['title', 'body']);
    expect(res.filterData({ title: 'lorem', info: 'ipsum' })).toEqual({
      title: 'lorem'
    });
  });
  it("anonymous user can't create post", () => {
    expect(appAbilities.check('create', 'posts').can).toBe(false);
  });
  it('user can create posts only if he is the creator', () => {
    const userId = 'd3a1';
    const res = appAbilities.check('create', 'posts', { user: { id: userId } });
    expect(res.can).toBe(true);
    console.log(res.validateData({ creator: userId }));
    expect(res.validateData({ creator: userId }).valid).toBe(true);
    expect(res.validateData({ creator: 'ppp' }).valid).toBe(false);
  });
  it('validate that filterDataIsRequired:true when rules are oppose each other', () => {
    const userId = 'd3a1';
    const res = appAbilities.check('read', 'posts', { user: { id: userId } });
    expect(res.filterDataIsRequired).toBe(true);
    const data = [
      {
        title: '1',
        secret: 2,
        creator: 'otherUser'
      },
      {
        title: '1',
        secret: 2,
        creator: userId
      }
    ];
    expect(res.filterData(data)).toEqual([
      {
        title: '1'
      },
      {
        title: '1',
        secret: 2,
        creator: userId
      }
    ]);
  });
  it('user can read info field only when he pay', () => {
    expect(
      appAbilities.check('read', 'posts', { user: { isPay: true } }).fields
    ).toEqual(['title', 'body', 'info']);
    expect(
      appAbilities.check('read', 'posts', { user: { isPay: false } }).fields
    ).toEqual(['title', 'body']);
  });
  it('admin can read all fields', () => {
    expect(
      appAbilities.check('read', 'posts', { roles: ['admin'] }).fields
    ).toBe(null);
  });
  it('user can read rating fields only when he is the creator', () => {
    const userId = 'd3a1';
    const comments = [
      { creator: userId, title: 'nice', body: 'lorem', rating: 5 },
      { creator: 'bla', title: 'like', body: 'ipsum', rating: 3 }
    ];
    expect(
      appAbilities.check('read', 'comments').filterData(comments)
    ).toEqual([{ title: 'nice' }, { title: 'like' }]);
    expect(
      appAbilities
        .check('read', 'comments', { user: { id: userId } })
        .filterData(comments)
    ).toEqual([
      { title: 'nice', body: 'lorem', rating: 5 },
      { title: 'like', body: 'ipsum' }
    ]);
  });
});
