import checkPermissions from './utils/checkPermissions';
import { asyncForEach, mergeConfigWithDefaults } from './utils/utils';
import { Context, Config, ConfigFull } from './types';
import Allow from './Allow';

export default class Permissions {
  private readonly permissions: Allow[];
  private readonly config: ConfigFull;
  constructor(permissions: Allow[], config?: Config) {
    // Convert permissions class to object
    this.permissions = permissions;
    this.config = mergeConfigWithDefaults(config);
  }

  public get() {
    return {
      permissions: this.permissions,
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
  public async check(action: string, resource: string, context?: Context) {
    const response = await checkPermissions(
      this.permissions,
      action,
      resource,
      context,
      this.config
    );
    if (!response.allow && this.config.throwErr) {
      throw new Error(response.message as string);
    }
    return response;
  }

  /**
   * @method isAllowed
   * @description Return true when user can [action] a [resource]
   * @param {string} action
   * @param {string} resource
   * @param {object} context
   * @returns {Promise}
   */
  public async isAllowed(
    action: string,
    resource: string,
    context?: Context
  ): Promise<boolean> {
    let result = false;
    await asyncForEach(this.permissions, async (ability: Allow) => {
      result = result || (await ability.isAllowed(action, resource, context));
    });
    return result;
  }
}
