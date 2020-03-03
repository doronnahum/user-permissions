import { allow, Abilities } from '../src';

let appAbilities: any;

describe('Test Abilities class', () => {
  beforeAll(() => {
    appAbilities = new Abilities([
      // Everyone can read the posts title and body
      allow().actions('read').resources('posts').fields(['title', 'body']),
    
      // Logged in user can manage his posts
      allow().actions('*').resources('posts').conditions('{"creator": "{{ user.id }}" }').user(true),
    
      // Admin user can manage all posts
      allow().actions('*').resources('posts').roles('admin').meta({ populate: true }).when(context => {
        // tslint:disable-next-line: prefer-type-cast
        if (context?.user && (context.user as {[key: string]: any}).isActive) return true;
        return false;
      }),
    
      // A paying user can read the message information field
      allow().actions('read').resources('posts').fields(['info']).user({ isPay: true }),
    
      // Everyone can read the comments title
      allow().actions('read').resources('comments').fields(['title']),
    
      // Logged in User can read the comments body fields
      allow().actions('read').resources('comments').fields(['body']).user(true),
    
      // Logged in user can read his comments rating
      allow().actions('read').resources('comments').conditions('{"creator": "{{ user.id }}" }').fields(['rating']).user(true)
    ]);
    
  })
  it('Validate allow is function', () => {
    expect(typeof allow).toEqual('function');
  });

  it('Validate allow return Ability class with the expected method', () => {
    const newAllow = allow();
    expect(typeof newAllow.actions).toEqual('function');
    expect(typeof newAllow.resources).toEqual('function');
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
  it('Everyone can read the posts title and body- test can method', async () => {
    expect(await appAbilities.can('read', 'posts')).toBe(true);
    expect(await appAbilities.can('delete', 'posts')).toBe(false);
  });

  it('Everyone can read the posts title and body', async () => {
    const res = await appAbilities.check('read', 'posts');
    expect(res.can).toBe(true);
    expect(res.fields).toEqual(['title', 'body']);
    expect(res.filterData({ title: 'lorem', info: 'ipsum' })).toEqual({
      title: 'lorem'
    });
    expect(res.validateData({ title: 'lorem', info: 'ipsum' }).valid).toEqual(false);
    expect(res.validateData({ title: 'lorem', body: 'ipsum' }).valid).toEqual(true);
    expect(res.validateData([{ title: 'lorem', body: 'ipsum' }]).valid).toEqual(true);
  });

  it("anonymous user can't create post", async () => {
    const res = await appAbilities.check('create', 'posts');
    expect(res.can).toBe(false);
  });

  it('Logged in user can manage his posts - try create method', async () => {
    const userId = 'd3a1';
    const res = await appAbilities.check('create', 'posts', { user: { id: userId } });
    expect(res.can).toBe(true);
    expect(res.validateData({ creator: userId }).valid).toBe(true);
    expect(res.validateData({ creator: 'ppp' }).valid).toBe(false);
  });

  it('Try filterData function and validate that filterDataIsRequired is true as expected', async () => {
    const userId = 'd3a1';
    const res = await appAbilities.check('read', 'posts', { user: { id: userId } });
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

  it('A paying user can read the message information field', async () => {
    const res = await appAbilities.check('read', 'posts', { user: { isPay: true } });
    expect(res.fields).toEqual(['title', 'body', 'info']);
    const res1 = await appAbilities.check('read', 'posts', { user: { isPay: false } });
    expect(
      res1.fields
    ).toEqual(['title', 'body']);
  });

  it('Admin user can manage all posts', async () => {
    const res = await appAbilities.check('read', 'posts', { roles: ['admin'], user: { id: 1, isActive: true } });
    expect(
      res.fields
    ).toBe(null);
    const res1 = await appAbilities.check('read', 'posts', { roles: ['admin'], user: { id: 1, isActive: false } });
    expect(
      res1.fields
    ).not.toBe(null);
  });
  it('Test meta is exists', async () => {
    const res = await appAbilities.check('read', 'posts', { roles: ['admin'], user: { id: 1, isActive: true } });
    expect(
      res.meta[0].populate
    ).toBe(true);
  });

  it('Logged in user can read his comments rating', async () => {
    const userId = 'd3a1';
    const comments = [
      { creator: userId, title: 'nice', body: 'lorem', rating: 5 },
      { creator: 'bla', title: 'like', body: 'ipsum', rating: 3 }
    ];
    const res = await appAbilities.check('read', 'comments');
    expect(
      res.filterData(comments)
    ).toEqual([{ title: 'nice' }, { title: 'like' }]);
    const res1 = await appAbilities.check('read', 'comments', { user: { id: userId } });
    expect(res1.filterData(comments)).toEqual([
      { title: 'nice', body: 'lorem', rating: 5 },
      { title: 'like', body: 'ipsum' }
    ]);
  });
});
