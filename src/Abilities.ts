import checkAbilities from './utils/checkAbilities';
import { isAllowed } from './utils/isAllowed';
import { asyncForEach } from './utils/utils';
import { IAbility, Context, IAbilitiesCheckResponse, Config } from './types';
import { Ability } from './allow';
export default class Abilities {
  private readonly abilities: IAbility[];
  private readonly config?: Config;
  constructor (abilities: Ability[], config: Config) {
    // Convert abilities class to object
    this.abilities = abilities.map(ability => ability.get());
    this.config = config;
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
  ): Promise<IAbilitiesCheckResponse> {
    return await checkAbilities(this.abilities, action, subject, context, this.config);
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
