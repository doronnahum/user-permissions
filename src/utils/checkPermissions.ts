import { Context, ConfigFull } from '../types';
import Permission from '../Permission';
import { asyncForEach } from './utils';
import { PermissionsResponse } from '../PermissionsResponse';

const checkPermissions = async (
  permissions: Permission[],
  action: string,
  resource: string,
  context: Context | undefined,
  config: ConfigFull
) => {
  const response = new PermissionsResponse(action, resource, config, context);

  let allowFullAccess = false; // When at least one ability is allow all fields without any condition
  let allowAllFields = false; // When at least one ability is allow all fields

  /*
  |-----------------------------------------------------------------
  | Check permissions
  |-----------------------------------------------------------------
  | Pass over all permissions and collect fields, condition, meta
  |
  */
  await asyncForEach(permissions, async (ability: Permission) => {
    // When allowFullAccess os true and abortEarly is apply we can skip
    const skip = allowFullAccess && config.abortEarly;
    if (skip) return;

    // Skip when not Permissioned by current ability
    if (!(await ability.hasPermission(action, resource, context))) return;

    // User Permissioned by current ability
    response.setPermission(true);

    const meta = ability.getMeta();
    // Collect meta
    if (meta) response.pushMeta(meta);

    // Handle fields
    const hasFields = ability.hasFields();
    const hasConditions = ability.hasConditions();
    allowFullAccess = allowFullAccess || (!hasConditions && !hasFields);
    allowAllFields = allowAllFields || !hasFields;
    if (!allowFullAccess) response.updateFieldsAndConditions(ability);
  });

  /**
   * Summary
   */
  const isUserPermissioned = response.isPermission();
  if (isUserPermissioned) {
    if (allowFullAccess) response.onUserNotPermission();
  } else {
    response.onUserNotPermission();
  }

  return response.get();
};

export default checkPermissions;
