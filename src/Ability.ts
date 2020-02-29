import {
  validateWhen,
  validateUser,
  validateFields,
  validateConditions,
  validateRoles,
  validateSubject,
  validateActions,
  getAsArray
 } from './utils/utils';

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

// class _Ability {
//   private readonly actions: Actions;
//   private readonly subjects: string | string[];

//   private readonly roles?: Roles;
//   private readonly conditions?: object | string;
//   private readonly fields?: string[];
//   private readonly user?: UserContext;
//   private readonly when?: When;
//   constructor (
//     actions: Actions,
//     subjects: string | string[],
//     roles?: Roles,
//     conditions?: object | string,
//     options?: IAbilityOptions
//   ) {
//     validateAbilityArguments(actions, subjects, roles, conditions, options);
//     this.actions = actions;
//     this.subjects = subjects;
//     this.roles = roles;
//     this.conditions = conditions;
//     this.fields = options && options.fields;
//     this.user = options && options.user;
//     this.when = options && options.when;
//   }

//   public get (): IAbility {
//     return {
//       actions: this.actions,
//       subjects: this.subjects,
//       fields: this.fields,
//       conditions: this.conditions,
//       roles: this.roles,
//       user: this.user,
//       when: this.when
//     };
//   }
// }
class AbilityClass {
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
  public roles (res: Roles) {
    const roles = getAsArray(res);
    validateRoles(roles);
    this._roles = roles;
    return this;
  }
  public conditions (res: Conditions) {
    validateConditions(res);
    this._conditions = res;
    return this;
  }
  public fields (res: Fields) {
    validateFields(res);
    this._fields = res;
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

const Ability = () => new AbilityClass();
export default Ability;
