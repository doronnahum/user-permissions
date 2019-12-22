import {
  checkInArray,
  matchRoles,
  checkUserContext,
  checkConditions,
  getRolesFromUser,
} from './utils/utils';
import { Actions, UserContext } from './types';

export default class Ability {
  private actions: Actions | Actions[];
  private subject: string | string[];
  private fields?: string[];
  private conditions?: object | string;
  private roles?: string[];
  private userContext?: UserContext;
  private allowOne?: boolean;
  constructor(payload: {
    actions: Actions | Actions[];
    subject: string | string[];
    fields?: string[];
    conditions?: object | string;
    roles?: string[];
    userContext?: UserContext;
    allowOne?: boolean;
  }) {
    this.actions = payload.actions;
    this.subject = payload.subject;
    this.fields = payload.fields;
    this.conditions = payload.conditions;
    this.roles = payload.roles;
    this.userContext = payload.userContext;
    this.allowOne = payload.allowOne;
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

  public checkRole(userRoles?: string[]) {
    return matchRoles(userRoles, this.roles);
  }
  public checkConditions(data: object | object[], user?: object) {
    return checkConditions(data, this.conditions, user);
  }
  public checkContext(user?: {}) {
    return checkUserContext(this.userContext, user);
  }

  public can(
    action: Actions,
    subject: string,
    user?: object,
    data?: object | object[]
  ) {
    if (!this.checkAction(action)) return false;
    if (!this.checkSubject(subject)) return false;
    if (!this.checkRole(getRolesFromUser(user))) return false;
    if (!this.checkContext(user)) return false;
    if (data) {
      const isArray = Array.isArray(data);
      if (isArray && this.allowOne) return false;
      if (!this.checkConditions(data, user)) return false;
    }
    return true;
  }
}
