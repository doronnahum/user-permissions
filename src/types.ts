
export type Actions = 'create' | 'read' | 'update' | 'delete' | '*';

type UserContextFunction = (context: any) => boolean
export type UserContext = UserContextFunction | boolean | object | string;
