
import {
  validateFields,
  validateActions,
  validateSubject,
  validateRoles,
  validateWhen,
  validateUser,
  validateConditions
} from '../src/utils/validators';

describe('test validateFields', () => {
  it('Should by a function', () => {
    expect(typeof validateFields).toEqual('function');
  });
  it('Should except only string and string[]', () => {
    expect(validateFields('name')).toEqual(true);
    expect(validateFields(['name'])).toEqual(true);
    try {
      validateFields(({ field: 'name' } as any));
      expect(false).toEqual(true);
    } catch (error) {
      expect(typeof error.message).toEqual('string');
    }
  });
});

describe('test validateActions', () => {
  it('Should by a function', () => {
    expect(typeof validateActions).toEqual('function');
  });
  it('Should except only string and string[]', () => {
    expect(validateActions('create')).toEqual(true);
    expect(validateActions(['create'])).toEqual(true);
    try {
      validateActions(({ action: 'create' } as any));
      expect(false).toEqual(true);
    } catch (error) {
      expect(typeof error.message).toEqual('string');
    }
  });
});

describe('test validateSubject', () => {
  it('Should by a function', () => {
    expect(typeof validateSubject).toEqual('function');
  });
  it('Should except only string and string[]', () => {
    expect(validateSubject('post')).toEqual(true);
    expect(validateSubject(['post'])).toEqual(true);
    try {
      validateSubject(({ subject: 'post' } as any));
      expect(false).toEqual(true);
    } catch (error) {
      expect(typeof error.message).toEqual('string');
    }
  });
});

describe('test validateRoles', () => {
  it('Should by a function', () => {
    expect(typeof validateRoles).toEqual('function');
  });
  it('Should except only string and string[]', () => {
    expect(validateRoles('admin')).toEqual(true);
    expect(validateRoles(['admin'])).toEqual(true);
    try {
      validateRoles(({ role: 'admin' } as any));
      expect(false).toEqual(true);
    } catch (error) {
      expect(typeof error.message).toEqual('string');
    }
  });
});

describe('test validateWhen', () => {
  it('Should by a function', () => {
    expect(typeof validateWhen).toEqual('function');
  });
  it('Should except only function', () => {
    const func = () => true;
    const asyncFunc = async () => true;
    expect(validateWhen(func)).toEqual(true);
    expect(validateWhen(asyncFunc)).toEqual(true);
    try {
      validateWhen((true as any));
      expect(false).toEqual(true);
    } catch (error) {
      expect(typeof error.message).toEqual('string');
    }
  });
});

describe('test validateUser', () => {
  it('Should by a function', () => {
    expect(typeof validateUser).toEqual('function');
  });
  it('Should except only boolean or object', () => {
    expect(validateUser(true)).toEqual(true);
    expect(validateUser(false)).toEqual(true);
    expect(validateUser({ paid: true })).toEqual(true);
    try {
      validateUser(('string' as any));
      expect(false).toEqual(true);
    } catch (error) {
      expect(typeof error.message).toEqual('string');
    }
  });
});

describe('test validateConditions', () => {
  it('Should by a function', () => {
    expect(typeof validateConditions).toEqual('function');
  });
  it('Should except only string or object', () => {
    expect(validateConditions('{{email}}: "test@gmail.com"}')).toEqual(true);
    expect(validateConditions({ paid: true })).toEqual(true);
    try {
      validateConditions((true as any));
      expect(false).toEqual(true);
    } catch (error) {
      expect(typeof error.message).toEqual('string');
    }
  });
});
