import { allow, Abilities } from '../src';

const appAbilities = new Abilities([
  // Everyone can read the posts title and body
  allow().actions('read').subjects('posts').fields(['title', 'body']),

  // Logged in user can manage his posts
  allow().actions('*').subjects('posts').conditions('{"creator": "{{ user.id }}" }').user(true),

  // Admin user can manage all posts
  allow().actions('*').subjects('posts').roles('admin'),

  // A paying user can read the message information field
  allow().actions('read').subjects('posts').fields(['info']).user({ isPay: true }),

  // Everyone can read the comments title
  allow().actions('read').subjects('comments').fields(['title']),

  // Logged in User can read the comments body fields
  allow().actions('read').subjects('comments').fields(['body']).user(true),

  // Logged in user can read his comments rating
  allow().actions('read').subjects('comments').conditions('{"creator": "{{ user.id }}" }').fields(['rating']).user(true)
]);

describe('Test Abilities class', () => {

  it('Validate allow is function', () => {
    expect(typeof allow).toEqual('function');
  });

  it('Validate allow return Ability class with the expected method', () => {
    const newAllow = allow();
    expect(typeof newAllow.actions).toEqual('function');
    expect(typeof newAllow.subjects).toEqual('function');
    expect(typeof newAllow.conditions).toEqual('function');
    expect(typeof newAllow.user).toEqual('function');
    expect(typeof newAllow.fields).toEqual('function');
    expect(typeof newAllow.meta).toEqual('function');
    expect(typeof newAllow.when).toEqual('function');
  });

  it('Create new Abilities', () => {
    expect(appAbilities).toBeInstanceOf(Abilities);
  });

  it('test Abilities.get', () => {
    expect(typeof appAbilities.get).toEqual('function');
    expect(typeof appAbilities.get()).toEqual('object');
  });

});

describe('Test Abilities permissions handlers', () => {

  it('Everyone can read the posts title and body', () => {
    const res = appAbilities.check('read', 'posts');
    expect(res.can).toBe(true);
    expect(res.fields).toEqual(['title', 'body']);
    expect(res.filterData({ title: 'lorem', info: 'ipsum' })).toEqual({
      title: 'lorem'
    });
    expect(res.validateData({ title: 'lorem', info: 'ipsum' }).valid).toEqual(false);
    expect(res.validateData({ title: 'lorem', body: 'ipsum' }).valid).toEqual(true);
    expect(res.validateData([{ title: 'lorem', body: 'ipsum' }]).valid).toEqual(true);
  });

  it("anonymous user can't create post", () => {
    expect(appAbilities.check('create', 'posts').can).toBe(false);
  });

  it('Logged in user can manage his posts - try create method', () => {
    const userId = 'd3a1';
    const res = appAbilities.check('create', 'posts', { user: { id: userId } });
    expect(res.can).toBe(true);
    expect(res.validateData({ creator: userId }).valid).toBe(true);
    expect(res.validateData({ creator: 'ppp' }).valid).toBe(false);
  });

  it('Try filterData function and validate that filterDataIsRequired is true as expected', () => {
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
        rating: 4,
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
        rating: 4,
        creator: userId
      }
    ]);
  });

  it('A paying user can read the message information field', () => {
    expect(
      appAbilities.check('read', 'posts', { user: { isPay: true } }).fields
    ).toEqual(['title', 'body', 'info']);
    expect(
      appAbilities.check('read', 'posts', { user: { isPay: false } }).fields
    ).toEqual(['title', 'body']);
  });

  it('Admin user can manage all posts', () => {
    expect(
      appAbilities.check('read', 'posts', { roles: ['admin'] }).fields
    ).toBe(null);
  });

  it('Logged in user can read his comments rating', () => {
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
