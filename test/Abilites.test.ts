import { Allow, Abilities } from '../src';

let appAbilities: any;
let appAbilitiesThrow: any;

describe('Test Abilities class', () => {
  beforeAll(() => {
    const abilities = [
      // Everyone allow read the posts title and body
      new Allow()
        .actions('read')
        .resources('posts')
        .fields(['title', 'body']),

      // Logged in user allow manage his posts
      new Allow()
        .actions('*')
        .resources('posts')
        .conditions('{"creator": "{{ user.id }}" }')
        .user(true),

      // Admin user allow manage all posts
      new Allow()
        .actions('*')
        .resources('posts')
        .roles('admin')
        .meta({ populate: true })
        .when(context => {
          // tslint:disable-next-line: prefer-type-cast
          if (
            context?.user &&
            (context.user as { [key: string]: any }).isActive
          )
            return true;
          return false;
        }),

      // A paying user allow read the message information field
      new Allow()
        .actions('read')
        .resources('posts')
        .fields(['info'])
        .user({ isPay: true }),

      // Everyone allow read the comments title
      new Allow()
        .actions('read')
        .resources('comments')
        .fields(['title']),

      // Logged in User allow read the comments body fields
      new Allow()
        .actions('read')
        .resources('comments')
        .fields(['body'])
        .user(true),

      // Logged in user allow read his comments rating
      new Allow()
        .actions('read')
        .resources('comments')
        .conditions('{"creator": "{{ user.id }}" }')
        .fields(['rating'])
        .user(true),
    ];
    appAbilities = new Abilities(abilities);
    appAbilitiesThrow = new Abilities(abilities, { throwErr: true });
  });
  it('Validate allow is function', () => {
    expect(typeof Allow).toEqual('function');
  });

  it('Validate allow return Ability class with the expected method', () => {
    const newAllow = new Allow();
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

describe('Test Allow class', () => {
  let withoutActions: any;
  let withoutResource: any;
  let withoutAll: any;
  beforeAll(() => {
    withoutActions = new Allow().resources('posts');
    withoutResource = new Allow().actions('read');
    withoutAll = new Allow();
  });
  it('Support empty action and resource', async () => {
    expect(await withoutActions.isAllowed('read', 'posts')).toBe(true);
    expect(await withoutResource.isAllowed('read', 'posts')).toBe(true);
    expect(await withoutAll.isAllowed('delete', 'posts')).toBe(true);
  });
});
describe('Test Abilities permissions handlers', () => {
  it('Everyone allow read the posts title and body- test allow method', async () => {
    expect(await appAbilities.isAllowed('read', 'posts')).toBe(true);
    expect(await appAbilities.isAllowed('delete', 'posts')).toBe(false);
  });

  it('Everyone allow read the posts title and body', async () => {
    const res = await appAbilities.check('read', 'posts');
    expect(res.allow).toBe(true);
    expect(res.fields.allowed).toEqual(['title', 'body']);
    expect(res.filterData({ title: 'lorem', info: 'ipsum' })).toEqual({
      title: 'lorem',
    });
    expect(res.validateData({ title: 'lorem', info: 'ipsum' }).valid).toEqual(
      false
    );
    expect(res.validateData({ title: 'lorem', body: 'ipsum' }).valid).toEqual(
      true
    );
    expect(res.validateData([{ title: 'lorem', body: 'ipsum' }]).valid).toEqual(
      true
    );
  });

  it("anonymous user allow't create post", async () => {
    const res = await appAbilities.check('create', 'posts');
    expect(res.allow).toBe(false);
  });

  it('should throw error when throwErr is true in the config', async () => {
    let error;
    try {
      await appAbilitiesThrow.check('create', 'posts');
    } catch (e) {
      error = e;
    }
    expect(error instanceof Error).toEqual(true);
  });

  it('Logged in user allow manage his posts - try create method', async () => {
    const userId = 'd3a1';
    const res = await appAbilities.check('create', 'posts', {
      user: { id: userId },
    });
    expect(res.allow).toBe(true);
    expect(res.validateData({ creator: userId }).valid).toBe(true);
    expect(res.validateData({ creator: 'ppp' }).valid).toBe(false);
  });

  it('Try filterData function and validate that filterDataIsRequired is true as expected', async () => {
    const userId = 'd3a1';
    const res = await appAbilities.check('read', 'posts', {
      user: { id: userId },
    });
    expect(res.filterDataIsRequired).toBe(true);
    const data = [
      {
        title: '1',
        secret: 2,
        creator: 'otherUser',
      },
      {
        title: '1',
        secret: 2,
        rating: 4,
        creator: userId,
      },
    ];
    expect(res.filterData(data)).toEqual([
      {
        title: '1',
      },
      {
        title: '1',
        secret: 2,
        rating: 4,
        creator: userId,
      },
    ]);
  });

  it('A paying user allow read the message information field', async () => {
    const res = await appAbilities.check('read', 'posts', {
      user: { isPay: true },
    });
    expect(res.fields.allowed).toEqual(['title', 'body', 'info']);
    const res1 = await appAbilities.check('read', 'posts', {
      user: { isPay: false },
    });
    expect(res1.fields.allowed).toEqual(['title', 'body']);
  });

  it('Admin user allow manage all posts', async () => {
    const res = await appAbilities.check('read', 'posts', {
      roles: ['admin'],
      user: { id: 1, isActive: true },
    });
    expect(res.fields.allowed).toBe(null);
    const res1 = await appAbilities.check('read', 'posts', {
      roles: ['admin'],
      user: { id: 1, isActive: false },
    });
    expect(res1.fields.allowed).not.toBe(null);
  });
  it('Test meta is exists', async () => {
    const res = await appAbilities.check('read', 'posts', {
      roles: ['admin'],
      user: { id: 1, isActive: true },
    });
    expect(res.meta[0].populate).toBe(true);
  });

  it('Logged in user allow read his comments rating', async () => {
    const userId = 'd3a1';
    const comments = [
      { creator: userId, title: 'nice', body: 'lorem', rating: 5 },
      { creator: 'bla', title: 'like', body: 'ipsum', rating: 3 },
    ];
    const res = await appAbilities.check('read', 'comments');
    expect(res.filterData(comments)).toEqual([
      { title: 'nice' },
      { title: 'like' },
    ]);
    const res1 = await appAbilities.check('read', 'comments', {
      user: { id: userId },
    });
    expect(res1.filterData(comments)).toEqual([
      { title: 'nice', body: 'lorem', rating: 5 },
      { title: 'like', body: 'ipsum' },
    ]);
  });
});
