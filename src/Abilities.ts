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
    const response = checkAbilities(this.abilities, action, subject, context);
    if (response.can) {
      // Add ValidateData method to the response
      response.validateData = validateData({
        allowOne: response.allowOne,
        parseConditions: response.where || undefined,
      });
      // Add FilterField method to the response
      if (response.fields || response.fieldsWithConditions) {
        response.filterData = filterData(
          response.fields,
          response.fieldsWithConditions
        );
      }
    }
    return response;
  }
}
