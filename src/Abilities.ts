import {
  checkInArray,
  matchRoles,
  checkUserContext,
  getParseConditions,
  getResponse,
  validateData,
  filterAbilities
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
import Ability from 'Ability';

const {
  NOT_ABLE_BY_SUBJECT,
  NOT_ABLE_BY_ACTION,
  NOT_ABLE_BY_WHEN,
  NOT_ABLE_BY_USER_CONTEXT,
  NOT_ABLE_BY_ROLE,
  VALID,
} = messageTypes;
export default class Abilities {
  private abilities: IAbility[];
  constructor(abilities: Ability[]) {
    this.abilities = abilities.map(ability => ability.get());
  }
  public get() {
    return {
      abilities: this.abilities
    };
  }

  public check(
    action: Actions,
    subject: string,
    context?: Context
  ): IAbilityCanResponse {
    const abilities = filterAbilities(this.abilities, subject, action, context)
    if(abilities.length === 0){
      getResponse(
        false,
        getMessage(NOT_ABLE_BY_ACTION, subjects, action)
      )
    }
    let parseConditions =
      this.conditions && getParseConditions(this.conditions, context);
    return getResponse(
      true,
      getMessage(VALID, subjects, action),
      parseConditions || undefined,
      validateData({
        allowOne: this.allowOne,
        context,
    subjectsseConditions: parseConditions || undefined,
      })
    );
  }
}
