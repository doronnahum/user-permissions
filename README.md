# User permissions

### user permissions is a small powerful authorization library that manage what resources a user allowed to access

## Features:

✔ Small & Fast - The fastest and smallest compared to: [casbin](https://github.com/casbin/casbin), [casl](https://github.com/stalniy/casl), [role-acl](https://github.com/tensult/role-acl), [rbac](https://github.com/seeden/rbac)

✔ Write in typescript

✔ Supports node.js & web

✔ Supports MongoDB like conditions $in, $nin, $exists, $gte, $gt, $lte, \$lt...

✔ Chainable, friendly API  
 e.g `new Permission().actions('read').resources('posts').fields(['title', 'body'])`

✔ Supports Template - you can specify dynamic context values in the conditions  
 e.g `new Permission().resources('posts').conditions('{"creator": "" }')`

✔ Utils to Filter/Validate data by permission  
 e.g `appAbilities.check('read', 'posts').validateData(data)`

### Install

`npm i user-permissions`

## Getting started:

### 1. Define permissions

```javascript
import { Permissions, Permission } from 'user-permissions';

const appPersmissions = new Permissions([
  // Everyone has permission to read the title and body of the posts
  new Permission()
    .actions('read')
    .resources('posts')
    .fields(['title', 'body']),
  // Only logged in users have permission to manage their posts
  new Permission()
    .resources('posts')
    .conditions('{"creator": "{{ user.id }}" }')
    .user(true),
  // Only paying users are allowed to read private posts
  new Permission()
    .actions('read')
    .resources('posts')
    .fields(['info'])
    .user({ isPay: true }),
]);
```

### 2. Check permissions

There are two ways to check permissions

1. **isPermissioned**
   - **Return:** boolean value
   - **When to use**: When you need only to check permissions
   - **Example**: `await appPersmissions.isPermissioned('read', 'posts', context)`
2. **check**
   - **Return:** A full details of the fields and conditions. see PermissionsResponse
   - **When to use**: When you want to build a fetch query from the rules, to expose only fields that user need to read
   - **Example**: `await appPersmissions.check('read', 'posts', context)`

```javascript
/*
|-----------------------------------------------------------------------------
| Example 1: anonymouse user try to read posts
|-----------------------------------------------------------------------------
|
*/

// Before the request
const res = await appPersmissions.check('read', 'posts', { user: null });
if (!res.allowed) {
  throw new Error('You are not allowed to read posts');
}
/* 
   When fields.allowAll are false then we can
   get the fields that user can read with res.fields.getFieldsToSelect
   and select these fields when fetching the data from the DB.
*/
const query = res.fields.allowAll
  ? { $select: res.fields.getFieldsToSelect() }
  : {};

// Now we can fetch the data without exposing any private fields

/*
|-----------------------------------------------------------------------------
| Example 2: Logged in user try to create a new post
|-----------------------------------------------------------------------------
|
*/
const user = { id: 'a1ad' };
const data = { creator: 'bdjd', title: 'lorem' };

// Before the request
const res = await appPersmissions.check('create', 'posts', { user }); // res.allowed = true
if (!res.allowed) {
  throw new Error('You are not allowed to create posts');
} else if (res.validateDate(data)) {
  // false - creator is not equal to user id
  throw new Error('You are not allowed to create post in this structure');
}

/*
|-----------------------------------------------------------------------------
| Example 3: Logged in user try to read posts - example of using filter data
|-----------------------------------------------------------------------------
|
*/

// Before the request
const res = await appPersmissions.check('create', 'posts', { user: null }); // res.allowed = true
if (!res.allowed) {
  throw new Error('You are not allowed to read posts');
}
const data = await fetchDataFromDb();

const response = res.filterData(data); // This will filter all fields except title and body

return response;
```
