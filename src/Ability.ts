import { validateAbilityArguments } from './utils/utils';
import {
  Actions,
  UserContext,
  When,
  Roles,
  IAbility,
  IAbilityOptions,
} from './types';

export default class Ability {
  private actions: Actions;
  private subjects: string | string[];

  private roles?: Roles;
  private conditions?: object | string;
  private fields?: string[];
  private user?: UserContext;
  private allowOne?: boolean;
  private when?: When;
  constructor(
    actions: Actions,
    subjects: string | string[],
    roles?: Roles,
    conditions?: object | string,
    options?: IAbilityOptions
  ) {
    validateAbilityArguments(actions, subjects, roles, conditions, options);
    this.actions = actions;
    this.subjects = subjects;
    this.roles = roles;
    this.conditions = conditions;
    this.fields = options && options.fields;
    this.user = options && options.user;
    this.allowOne = options && options.allowOne;
    this.when = options && options.when;
  }
  public get(): IAbility {
    return {
      actions: this.actions,
      subjects: this.subjects,
      // tslint:disable-next-line: object-literal-sort-keys
      fields: this.fields,
      conditions: this.conditions,
      roles: this.roles,
      user: this.user,
      when: this.when,
      allowOne: this.allowOne,
    };
  }
}
