import checkAbilities from './utils/checkAbilities';
import { isAllowed } from './utils/isAllowed';
import { asyncForEach } from './utils/utils';
import { IAbility, Context, IAbilitiesCheckResponse, Config } from './types';
import { Allow } from './Allow';
export default class Abilities {
  private readonly abilities: IAbility[];
  private readonly config?: Config;
  constructor (abilities: Allow[], config?: Config) {
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
   * @description Return an object with check result and tools to filter & validate data
   * @param action
   * @param resource
   * @param context
   * @return {Promise} { allow: boolean, message: string, conditions: object[]...  }
   */
  public async check (
    action: string,
    resource: string,
    context?: Context
  ): Promise<IAbilitiesCheckResponse> {
    return await checkAbilities(this.abilities, action, resource, context, this.config);
  }

  /**
   * @method isAllowed
   * @description Return true when user can [action] a [resource]
   * @param {string} action 
   * @param {string} resource 
   * @param {object} context
   * @returns {Promise}
   */
  public async isAllowed (
    action: string,
    resource: string,
    context?: Context
  ): Promise<boolean> {
    let result = false;
    await asyncForEach(this.abilities, async (ability) => {
      result = result || await isAllowed(ability, action, resource, context);
    });
    return result;
  }
}
