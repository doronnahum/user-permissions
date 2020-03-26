# User Permissions

### user permissions is a small powerful authorization library that manage what resources a user allowed to access

## Features:

✔ Small & Fast - The fastest and smallest compared to: [casbin](https://github.com/casbin/casbin), [casl](https://github.com/stalniy/casl), [role-acl](https://github.com/tensult/role-acl), [rbac](https://github.com/seeden/rbac)

✔ Write in typescript

✔ Supports node.js & web

✔ Supports MongoDB like conditions $in, $nin, $exists, $gte, $gt, $lte, $lt...

✔ Chainable, friendly API  
e.g `new Allow().actions('read').resources('posts').fields(['title', 'body'])`

✔ Supports Template - you can specify dynamic context values in the conditions  
e.g `new Allow().resources('posts').conditions('{"creator": "" }')`

✔ Utils to Filter/Validate data by permission  
e.g `appAbilities.check('read', 'posts').validateData(data)`

### [DEMO](https://scrimba.com/c/cdVN9vCW)

## Install

`npm i user-permissions`

## Getting started:

### 1. Define permissions

```javascript
import { Permissions, Allow } from 'user-permissions';

const appPersmissions = new Permissions([
  // Everyone has permission to read the title and body of the posts
  new Allow()
    .actions('read')
    .resources('posts')
    .fields(['title', 'body']),
  // Only logged in users have permission to manage their posts
  new Allow()
    .resources('posts')
    .conditions('{"creator": "{{ user.id }}" }')
    .user(true),
  // Only paying users are allowed to read private posts
  new Allow()
    .actions('read')
    .resources('posts')
    .fields(['info'])
    .user({ isPay: true }),
]);
```

### 2. Check permissions

There are two ways to check permissions

1. **isAllowed**
   * **Return:** boolean value
   * **When to use**: When you need only to check permissions
   * **Example**: `await appPersmissions.isAllowed('read', 'posts', context)`
2. **check**
   * **Return:** A full details of the fields and conditions. see PermissionsResponse
   * **When to use**: When you want to build a fetch query from the rules, to expose only fields that user need to read
   * **Example**: `await appPersmissions.check('read', 'posts', context)`

```javascript
let res;

/*
|-----------------------------------------------------------------------------
| Example 1: anonymouse user try to read posts
|-----------------------------------------------------------------------------
|
*/

console.log('----------- Example 1 -----------');


res = await appPersmissions.check('read', 'posts', { user: null });

if (!res.allow) {
  console.error('You are not allowed to read posts');
} else {
/* 
   When fields.allowAll are false then we can
   get the fields that user can read with res.fields.getFieldsToSelect
   and select these fields when fetching the data from the DB.
*/
const query = res.fields.allowAll
  ? { $select: res.fields.getFieldsToSelect() }
  : {};

console.log('User allowe to read posts', {query})
}

/*
|-----------------------------------------------------------------------------
| Example 2: Logged in user try to create a new post
|-----------------------------------------------------------------------------
|
*/
console.log('----------- Example 2 -----------');

const user = { id: 'a1ad' };
const values = { creator: 'bdjd', title: 'lorem' };

res = await appPersmissions.check('create', 'posts', { user }); // res.allow = true

if (!res.allow) {
  console.error('You are not allowed to create posts');
}else{
    const validateData = res.validateData(values);
    if(!validateData.valid){
       console.error(validateData.message);   
    }else{
       console.log('You can create posts')
    }
    
};

/*
|-----------------------------------------------------------------------------
| Example 3: Logged in user try to read posts - example of using filter data
|-----------------------------------------------------------------------------
|
*/

console.log('----------- Example 3 -----------');

res = await appPersmissions.check('read', 'posts', { user: null }); // res.allow = true

if (!res.allow) {
  console.error('You are not allowed to read posts');
} else {
//const data = await fetchDataFromDb();
const data = [
    {title: 'lor', body: 'pos', privateFields: '1'},
    {title: 'lor1', body: 'pos1', privateFields: '1'},
    {title: 'lor2', body: 'pos2', privateFields: '1'},
    {title: 'lor3', body: 'pos3', privateFields: '1'},
];

const response = res.filterData(data); // This will filter all fields except title and body

console.log('Posts response', response)
}

```

### 

