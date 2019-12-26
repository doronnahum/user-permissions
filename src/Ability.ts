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
  private subjects: string | string[];
  private fields?: string[];
  private conditions?: object | string;
  private roles?: Roles;
  private userContext?: UserContext;
  private allowOne?: boolean;

  private when?: When;
  constructor(payload: IAbility) {
    this.actions = payload.actions;
    this.subjects = payload.subjects;
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
      subjects: this.subjects,
      // tslint:disable-next-line: object-literal-sort-keys
      fields: this.fields,
      conditions: this.conditions,
      roles: this.roles,
      userContext: this.userContext,
    };
  }

  public check(
    action: Actions,
    subject: string,
    context?: Context
  ): IAbilityCanResponse {
    if (!checkInArray(subject, this.subjects)) {
      return getResponse(
        false,
        getMessage(NOT_ABLE_BY_SUBJECT, subject, action)
      );
    }
    if (!checkInArray(action, this.actions)) {
      return getResponse(
        false,
        getMessage(NOT_ABLE_BY_ACTION, subject, action)
      );
    }
    if (this.when && !this.when(context)) {
      return getResponse(false, getMessage(NOT_ABLE_BY_WHEN, subject, action));
    }
    if (!checkUserContext(this.userContext, context && context.user)) {
      return getResponse(
        false,
        getMessage(NOT_ABLE_BY_USER_CONTEXT, subject, action)
      );
    }
    if (!matchRoles(this.roles, context && context.roles)) {
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
        parseConditions: parseConditions || undefined,
      })
    );
  }
}
