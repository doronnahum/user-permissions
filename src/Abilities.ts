import checkAbilities from './utils/checkAbilities';
import can from './utils/can';
import { IAbility, Context, IAbilitiesCanResponse } from './types';
import Ability from 'Ability';
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

  public check (
    action: string,
    subject: string,
    context?: Context
  ): IAbilitiesCanResponse {
    return checkAbilities(this.abilities, action, subject, context);
  }

  public can (
    action: string,
    subject: string,
    context?: Context
  ): boolean {
    return this.abilities.some(ability => can(ability, action, subject, context));
  }
}
