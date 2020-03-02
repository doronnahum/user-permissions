import checkAbilities from './utils/checkAbilities';
import can from './utils/can';
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
   * @return { can: boolean, message: string, conditions: object[]...  }
   */
  public async check (
    action: string,
    subject: string,
    context?: Context
  ): Promise<IAbilitiesCanResponse> {
    const res = await checkAbilities({ abilities: this.abilities, action, subject, context });
    return res;
  }

  public async can (
    action: string,
    subject: string,
    context?: Context
  ): Promise<boolean> {
    let result = false;
    await asyncForEach(this.abilities, async (ability) => {
      result = result || await can(ability, action, subject, context);
    });
    return result;
  }
}
