import { validateAbilityArguments } from './utils/utils'
import {
  Actions,
  UserContext,
  When,
  Roles,
  IAbility,
  IAbilityOptions
} from './types'

export default class Ability {
  private readonly actions: Actions
  private readonly subjects: string | string[]

  private readonly roles?: Roles
  private readonly conditions?: object | string
  private readonly fields?: string[]
  private readonly user?: UserContext
  private readonly allowOne?: boolean
  private readonly when?: When
  constructor (
    actions: Actions,
    subjects: string | string[],
    roles?: Roles,
    conditions?: object | string,
    options?: IAbilityOptions
  ) {
    validateAbilityArguments(actions, subjects, roles, conditions, options)
    this.actions = actions
    this.subjects = subjects
    this.roles = roles
    this.conditions = conditions
    this.fields = options && options.fields
    this.user = options && options.user
    this.allowOne = options && options.allowOne
    this.when = options && options.when
  }

  public get (): IAbility {
    return {
      actions: this.actions,
      subjects: this.subjects,
      // tslint:disable-next-line: object-literal-sort-keys
      fields: this.fields,
      conditions: this.conditions,
      roles: this.roles,
      user: this.user,
      when: this.when,
      allowOne: this.allowOne
    }
  }
}
