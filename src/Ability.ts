import {
  checkInArray,
  matchRoles,
  checkUserContext,
  getParseConditions,
  getResponse,
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
import { renderMessageByTypes as getMessage, messageTypes } from './messages';

const {
  NOT_ABLE_BY_SUBJECT,
  NOT_ABLE_BY_ACTION,
  NOT_ABLE_BY_WHEN,
  NOT_ABLE_BY_USER_CONTEXT,
  NOT_ABLE_BY_ROLE,
  VALID,
} = messageTypes;
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
    if (!this.checkSubject(subject)) {
      return getResponse(
        false,
        getMessage(NOT_ABLE_BY_SUBJECT, subject, action)
      );
    }
    if (!this.checkAction(action)) {
      return getResponse(
        false,
        getMessage(NOT_ABLE_BY_ACTION, subject, action)
      );
    }
    if (!this.checkWhen(context)) {
      return getResponse(false, getMessage(NOT_ABLE_BY_WHEN, subject, action));
    }
    if (!this.checkUserContext(context && context.user)) {
      return getResponse(
        false,
        getMessage(NOT_ABLE_BY_USER_CONTEXT, subject, action)
      );
    }
    if (!this.checkRole(context && context.roles)) {
      return getResponse(false, getMessage(NOT_ABLE_BY_ROLE, subject, action));
    }
    let parseConditions =
      this.conditions && getParseConditions(this.conditions, context);
    return getResponse(
      true,
      getMessage(VALID, subject, action),
      parseConditions || undefined,
      validateData({
        allowOne: this.allowOne,
        context,
        parseConditions: parseConditions || undefined,
      })
    );
  }
}
