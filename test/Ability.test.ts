import Ability from '../src/Ability';

describe('Test Ability class', () => {
  const readPost = new Ability({ actions: 'read', subject: 'posts' });
  const createPost = new Ability({
    actions: 'create',
    subject: 'posts',
    conditions: { publish: true },
  });
  const createOnePost = new Ability({
    actions: 'create',
    subject: 'posts',
    allowOne: true,
  });
  const allowAll = new Ability({ actions: '*', subject: '*' });

  it('Create new Ability', () => {
    expect(readPost).toBeInstanceOf(Ability);
  });

  it('Validate read action check', () => {
    expect(readPost.can('read', 'posts')).toEqual(true);
  });

  it('Validate read action check [should failed]', () => {
    expect(readPost.can('create', 'posts')).toEqual(false);
  });

  it('Validate read action + conditions', () => {
    expect(
      createPost.can('create', 'posts', undefined, {
        title: 'lorem',
        publish: true,
      })
    ).toEqual(true);
  });

  it('Validate read action + conditions - many', () => {
    expect(
      createPost.can('create', 'posts', undefined, [
        { title: 'lorem', publish: true },
      ])
    ).toEqual(true);
  });

  it('Validate read action + conditions - many when allowOne is true [should failed]', () => {
    expect(
      createOnePost.can('create', 'posts', undefined, [
        { title: 'lorem', publish: true },
      ])
    ).toEqual(false);
  });

  it('Validate read action + conditions [should failed]', () => {
    expect(
      createPost.can('create', 'posts', undefined, {
        title: 'lorem',
        publish: false,
      })
    ).toEqual(false);
  });

  it('Validate read action +  conditions  - many [should failed]', () => {
    expect(
      createPost.can('create', 'posts', undefined, [
        { title: 'lorem', publish: false },
      ])
    ).toEqual(false);
  });

  it('Validate when actions & subject is *', () => {
    expect(
      allowAll.can('read', 'posts') &&
        allowAll.can('create', 'comments') &&
        allowAll.can('delete', 'atrial') &&
        allowAll.can('update', 'posts')
    ).toEqual(true);
  });
});
