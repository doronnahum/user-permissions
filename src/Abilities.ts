import { checkAbilities, validateData } from './utils/utils';
import { filterData } from './utils/filterData';
import { IAbility, Context, IAbilitiesCanResponse } from './types';
import Ability from 'Ability';

export default class Abilities {
  private readonly abilities: IAbility[];
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
    // When checkAbilities is pass then add helpers to handle data
    if (response.can) {
      /**
       * validateData
       * -------------------
       * Validate data check the data with the abilities conditions
       * can handle this check(...).validateData(data) : boolean
       */
      response.validateData = validateData({
        allowOne: response.allowOne,
        parseConditions: response.where || undefined,
      });
      /**
       * filterData
       * -------------------
       * When one or more of the rules includes a fields then filterData
       * can handle this check(...).filterData(data) : filteredData
       */
      const hasFieldsToSelect =
        (response.fields && response.fields.length) ||
        (response.fieldsWithConditions && response.fieldsWithConditions.length);
      if (hasFieldsToSelect) {
        response.filterData = filterData(
          response.fields, // ['user', '-user.password']
          response.fieldsWithConditions //
        );
      }
    }
    return response;
  }
}
