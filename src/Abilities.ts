import { checkAbilities } from './utils/utils';
import { filterData } from './utils/filterData';
import { Actions, IAbility, Context, IAbilitiesCanResponse } from './types';
import Ability from 'Ability';

export default class Abilities {
  private abilities: IAbility[];
  constructor(abilities: Ability[]) {
    this.abilities = abilities.map(ability => ability.get());
  }
  public get() {
    return {
      abilities: this.abilities,
    };
  }

  public check(
    action: Actions,
    subject: string,
    context?: Context
  ): IAbilitiesCanResponse {
    const checkAbilitiesResponse = checkAbilities(
      this.abilities,
      subject,
      action,
      context
    );
    const {
      fields,
      fieldsWithConditions,
      where,
      allowOne,
    } = checkAbilitiesResponse;
    checkAbilitiesResponse.validateData({
      allowOne,
      parseConditions: where || undefined,
    });
    if (fields || fieldsWithConditions) {
      checkAbilitiesResponse.filterData = filterData({
        fields,
        fieldsWithConditions,
      });
    }
    return checkAbilitiesResponse;
  }
}
