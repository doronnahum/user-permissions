import { checkAbilities, validateData } from './utils/utils';
import { filterData } from './utils/filterData';
import { IAbility, Context, IAbilitiesCanResponse } from './types';
import Ability from 'Ability';

export default class Abilities {
  private abilities: IAbility[];
  constructor(abilities: Ability[]) {
    // Convert abilities class to object
    this.abilities = abilities.map(ability => ability.get());
  }
  public get() {
    return {
      abilities: this.abilities,
    };
  }

  public check(
    action: string,
    subject: string,
    context?: Context
  ): IAbilitiesCanResponse {
    const checkAbilitiesResponse = checkAbilities(
      this.abilities,
      action,
      subject,
      context
    );
    const {
      can,
      fields,
      fieldsWithConditions,
      where,
      allowOne,
    } = checkAbilitiesResponse;
    if (can) {
      checkAbilitiesResponse.validateData = validateData({
        allowOne,
        parseConditions: where || undefined,
      });
      if (fields || fieldsWithConditions) {
        checkAbilitiesResponse.filterData = filterData(
          fields,
          fieldsWithConditions
        );
      }
    }
    return checkAbilitiesResponse;
  }
}
