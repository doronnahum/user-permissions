import checkAbilities from './utils/checkAbilities';
import { isAllowed } from './utils/isAllowed';
import { asyncForEach } from './utils/utils';
import { IAbility, Context, IAbilitiesCanResponse } from './types';
import { Ability } from './allow';
export default class Abilities {
  private readonly abilities: IAbility[];
  constructor (abilities: Ability[]) {
    // Convert abilities class to object
    this.abilities = abilities.map(ability => ability.get());
  }

  public get () {
    return {
      abilities: this.abilities
    };
  }

  /**
   * @method check
   * @description return an object with check result and tools to filter&validate data
   * @param action
   * @param subject
   * @param context
   * @return { allow: boolean, message: string, conditions: object[]...  }
   */
  public async check (
    action: string,
    subject: string,
    context?: Context
  ): Promise<IAbilitiesCanResponse> {
    return await checkAbilities({ abilities: this.abilities, action, subject, context });
  }

  public async isAllowed (
    action: string,
    subject: string,
    context?: Context
  ): Promise<boolean> {
    let result = false;
    await asyncForEach(this.abilities, async (ability) => {
      result = result || await isAllowed(ability, action, subject, context);
    });
    return result;
  }
}
