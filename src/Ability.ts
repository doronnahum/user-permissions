import {
  checkInArray,
  matchRoles,
  checkUserContext,
  checkConditions,
  getParseConditions,
  notAllowed,
  validateData,
} from './utils/utils';
import {
  Actions,
  UserContext,
  When,
  IAbility,
  Roles,
  Context,
  IAbilityCanResponse,
} from './types';

export default class Ability {
  private actions: Actions | Actions[];
  private subject: string | string[];
  private fields?: string[];
  private conditions?: object | string;
  private roles?: Roles;
  private userContext?: UserContext;
  private allowOne?: boolean;

  private when?: When;
  constructor(payload: IAbility) {
    this.actions = payload.actions;
    this.subject = payload.subject;
    this.fields = payload.fields;
    this.conditions = payload.conditions;
    this.roles = payload.roles;
    this.userContext = payload.user;
    this.allowOne = payload.allowOne;
    this.when = payload.when;
  }
  public get() {
    return {
      actions: this.actions,
      subject: this.subject,
      // tslint:disable-next-line: object-literal-sort-keys
      fields: this.fields,
      conditions: this.conditions,
      roles: this.roles,
      userContext: this.userContext,
    };
  }
  public checkAction(name: Actions) {
    return checkInArray(name, this.actions);
  }

  public checkSubject(name: string) {
    return checkInArray(name, this.subject);
  }

  public checkRole(roles?: Roles) {
    return matchRoles(this.roles, roles);
  }

  public checkUserContext(user?: {}) {
    return checkUserContext(this.userContext, user);
  }
  public checkWhen(context?: Context) {
    return this.when ? this.when(context) : true;
  }

  public check(
    action: Actions,
    subject: string,
    context?: Context
  ): IAbilityCanResponse {
    if (!this.checkAction(action)) return notAllowed;
    if (!this.checkSubject(subject)) return notAllowed;
    if (!this.checkWhen(context)) return notAllowed;
    const user = context && context.user;
    const data = context && context.data;
    const roles = context && context.roles;
    if (!this.checkUserContext(user)) return notAllowed;
    if (!this.checkRole(roles)) return notAllowed;
    let parseConditions =
      this.conditions && getParseConditions(this.conditions, context);
    if (data) {
      const isArray = Array.isArray(data);
      if (isArray && this.allowOne) return notAllowed;
      if (parseConditions && !checkConditions(parseConditions, context))
        return notAllowed;
    }
    const response: IAbilityCanResponse = {
      can: true,
    };
    if (parseConditions) {
      response.where = parseConditions;
    }
    if (!data) {
      response.validateData = validateData({
        allowOne: this.allowOne,
        context,
        parseConditions: parseConditions || undefined,
      });
    }
    return response;
  }
}
