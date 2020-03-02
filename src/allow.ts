import {
  getAsArray
} from './utils/utils';

import {
  validateWhen,
  validateUser,
  validateFields,
  validateConditions,
  validateRoles,
  validateSubject,
  validateActions
} from './utils/validators';

import {
  Actions,
  Subjects,
  Conditions,
  Fields,
  UserContext,
  When,
  Roles,
  IAbility
} from './types';

export class Ability {
  private _actions?: Actions;
  private _subjects?: Subjects;

  private _roles?: Roles;
  private _conditions?: Conditions;
  private _fields?: Fields;
  private _user?: UserContext;
  private _when?: When;
  private _meta?: any;

  public actions (res: Actions) {
    validateActions(res);
    this._actions = res;
    return this;
  }

  public subjects (res: Subjects) {
    validateSubject(res);
    this._subjects = res;
    return this;
  }

  public roles (roles: string | Roles) {
    validateRoles(roles);
    this._roles = getAsArray(roles);
    return this;
  }

  public conditions (res: Conditions) {
    validateConditions(res);
    this._conditions = res;
    return this;
  }

  public fields (res: string | Fields) {
    validateFields(res);
    this._fields = getAsArray(res);
    return this;
  }

  public user (res: UserContext) {
    validateUser(res);
    this._user = res;
    return this;
  }

  public when (res: When) {
    validateWhen(res);
    this._when = res;
    return this;
  }

  public meta (res: any) {
    this._meta = res;
    return this;
  }

  public get () {
    return {
      actions: this._actions,
      subjects: this._subjects,
      fields: this._fields,
      conditions: this._conditions,
      roles: this._roles,
      user: this._user,
      when: this._when,
      meta: this._meta
    } as IAbility;
  }
}

const allow = () => new Ability();
export default allow;
