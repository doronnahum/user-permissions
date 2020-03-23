import {
  getAsArray,
  checkInArray,
  checkUserContext,
  matchRoles,
  isFieldsEmpty,
  isConditionEmpty,
} from './utils/utils';

import {
  validateWhen,
  validateUser,
  validateFields,
  validateConditions,
  validateRoles,
  validateResource,
  validateActions,
} from './utils/validators';

import {
  Actions,
  Resources,
  Conditions,
  Fields,
  UserContext,
  When,
  Roles,
  Context,
} from './types';

const ALL_ACTIONS = ['*'];
const ALL_RESOURCES = ['*'];
class Allow {
  private _actions?: Actions;
  private _resources?: Resources;

  private _roles?: Roles;
  private _conditions?: Conditions;
  private _fields?: Fields;
  private _user?: UserContext;
  private _when?: When;
  private _meta?: any;
  private _hasFields: boolean = false;
  private _hasConditions: boolean = false;

  public actions(res: Actions) {
    validateActions(res);
    this._actions = res;
    return this;
  }

  public resources(res: Resources) {
    validateResource(res);
    this._resources = res;
    return this;
  }

  public roles(roles: string | Roles) {
    validateRoles(roles);
    this._roles = getAsArray(roles);
    return this;
  }

  public conditions(res: Conditions) {
    validateConditions(res);
    this._conditions = res;
    this._hasConditions = !isConditionEmpty(this._conditions);
    return this;
  }

  public hasConditions() {
    return this._hasConditions;
  }

  public fields(res: string | Fields) {
    validateFields(res);
    this._fields = getAsArray(res);
    this._hasFields = !isFieldsEmpty(this._fields);
    return this;
  }

  public hasFields() {
    return this._hasFields;
  }

  public user(res: UserContext) {
    validateUser(res);
    this._user = res;
    return this;
  }

  public when(res: When) {
    validateWhen(res);
    this._when = res;
    return this;
  }

  public meta(res: any) {
    this._meta = res;
    return this;
  }

  public isAllowed = async (
    action: string,
    resource: string,
    context?: Context
  ) => {
    const userData = context ? context.user : undefined;
    const roles = context ? context.roles : undefined;
    return (
      checkInArray(action, this._actions || ALL_ACTIONS) &&
      checkInArray(resource, this._resources || ALL_RESOURCES) &&
      (!this._when || (await this._when(context))) &&
      checkUserContext(this._user, userData) &&
      matchRoles(this._roles, roles)
    );
  };

  public getConditions() {
    return this._conditions;
  }
  public getMeta() {
    return this._meta;
  }
  public getFields() {
    return this._fields;
  }
}

export default Allow;
