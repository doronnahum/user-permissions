# User Permissions

user permissions is a small powerful authorization library that manage what resources a user allow to access

<table>
  <thead>
    <tr>
      <th><a href="#features">Features</a></th>
      <th><a href="#install">Install</a></th>
      <th><a href="#getting-started">Getting started</a></th>
      <th><a href="#api-reference">API Reference</a></th>
    </tr>
  </thead>
</table>

##### [DEMO](https://scrimba.com/c/cdVN9vCW)

## Features

✔ Small & Fast - The fastest and smallest compared to: [casbin](https://github.com/casbin/casbin), [casl](https://github.com/stalniy/casl), [role-acl](https://github.com/tensult/role-acl), [rbac](https://github.com/seeden/rbac)

✔ Write in typescript

✔ Supports node.js & web

✔ Supports MongoDB like conditions $in, $nin, $exists, $gte, $gt, $lte, \$lt...

✔ Friendly API  
e.g `new Allow().actions('read').resources('posts').fields(['title', 'body'])`

✔ Supports Template - you can specify dynamic context values in the conditions  
e.g `new Allow().resources('posts').conditions('{"creator": "" }')`

✔ Utils to Filter/Validate data by permission  
e.g `appAbilities.check('read', 'posts').validateData(data)`

## Install

```bash
npm i user-permissions
```

## Getting started

1. **Define permissions**

   ```javascript
   import { Permissions, Permission } from 'user-permissions';

   const appPermissions = new Permissions([
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
     // Only paying users are allow to read private posts
     new Permission()
       .actions('read')
       .resources('posts')
       .fields(['info'])
       .user({ isPay: true }),
   ]);
   ```

2. **Check permissions**

   ```javascript
   let res;

   /*
   |-----------------------------------------------------------------------------
   | Example 1: anonymous user try to read posts
   |-----------------------------------------------------------------------------
   |
   */

   res = await appPermissions.check('read', 'posts', { user: null });

   if (!res.allow) {
     console.error('You are not allow to read posts');
   } else {
     /*
      When fields.allowAll are false then we can
      get the fields that user can read with res.fields.getFieldsToSelect
      and select these fields when fetching the data from the DB.
   */
     const query = res.fields.allowAll
       ? { $select: res.fields.getFieldsToSelect() }
       : {};

     console.log('User allowe to read posts', { query });
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

   res = await appPermissions.check('create', 'posts', { user }); // res.allow = true

   if (!res.allow) {
     console.error('You are not allow to create posts');
   } else {
     const validateData = res.validateData(values);
     if (!validateData.valid) {
       console.error(validateData.message);
     } else {
       console.log('You can create posts');
     }
   }

   /*
   |-----------------------------------------------------------------------------
   | Example 3: Logged in user try to read posts - example of using filter data
   |-----------------------------------------------------------------------------
   |
   */

   console.log('----------- Example 3 -----------');

   res = await appPermissions.check('read', 'posts', { user: null }); // res.allow = true

   if (!res.allow) {
     console.error('You are not allow to read posts');
   } else {
     //const data = await fetchDataFromDb();
     const data = [
       { title: 'lor', body: 'pos', privateFields: '1' },
       { title: 'lor1', body: 'pos1', privateFields: '1' },
       { title: 'lor2', body: 'pos2', privateFields: '1' },
       { title: 'lor3', body: 'pos3', privateFields: '1' },
     ];

     const response = res.filterData(data); // This will filter all fields except title and body

     console.log('Posts response', response);
   }
   ```

# API Reference

## Define permissions

**Define permissions to your app by created a a new instance of the Permissions class.**

```javascript
const appPermissions = new Permissions([new Permission(),...])
```

Permissions accept a collection of Permission class.

**Permission can be implement in two ways:**

1. using the Chainable api e.g `new Permission().actions('read').resources('posts')`
2. using the constructors  
   \* using the constructor is useful when you saving the Permissions in your DB

   e.g `new Permission({actions: 'read', ...})`

## Permission

### actions

- **info**: The actions that you want to allow
  - to allow all pass '\*'
- **type**: string \| string\[\]
- **examples**:
  - `new Permission().actions(['create','update'])`
  - `new Permission().actions('*')`
  - `new Permission(`{actions: \['create'\],...}`)`

### resources

- **info**: The resources that you want to allow
  - to allow all pass '\*'
- **type: string \| string\[\]**
- **examples**:
  - `new Permission().resources(['posts','products'])`
  - `new Permission().resources('posts')`
  - `new Permission(`{resources: 'posts',...}`)`

### roles

- **info**: Define for what group of users this permission is applied by roles
- **type:** string \| string\[\]
- **examples**:
  - `new Permission().roles(['admin'])`
  - `new Permission().roles('subscribers')`
  - `new Permission(`{roles: 'admin',...}`)`

### conditions

- **info**: An object of conditions to restrict which records this permission applies to
- **type:** string \| object
  - when it a string, it must be a valid [stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) in this way we can use a template
- **examples**:

  - `new Permission().conditions({active: true})`
  - `new Permission().conditions('{"user":"{{user.id}}"}')`
  - `new Permission(`{conditions: '{"organization":"{{user.organization}}"}',...}`)`

  🌟 **This is a powerful way to protect your records**  
   When we check permissions we find all the permissions that allow the request and collect  
   all the conditions into the check response.  
   we used this conditions in the filterData&validateData utils and also you can convert the conditions  
   to a fetch query.  
   this library used [sift](https://github.com/crcn/sift.js#readme)that is a "tiny library for using MongoDB queries to filter data in Javascript"  
   you can use any MongoDB operator in the conditions like $in, $nin, $exists, $gte..

  ```javascript
  /*
  |-----------------------------------------------------------------------------
  | For example
  |-----------------------------------------------------------------------------
  | an organization_admin try to find all his users
  | your app includes a number of organization
  | and you want to serve only users in his organization
  */

  // App Permissions
  import { Permissions, Permission } from 'user-permissions';

  const appPermissions = new Permissions([
    new Permission()
      .resources('users')
      .conditions('{"organizationId": "{{ user.organizationId}}" }')
      .roles('organization_admin'),
  ]);

  // some where in your app
  router.find('/users', async (req, res) => {
    // req.user = {id:'a1', roles: ['organization_admin'], organizationId: 'akdi1' }
    const permissionCheck = await appPermissions.check('read', 'users', {
      user: req.user,
      roles: req.user.roles,
    });
    if (!permissionCheck.isAllow) {
      throw new Error(permissionCheck.message);
    }
    // Build query
    const query = {};
    if (permissionCheck.conditions) {
      query['$or'] = permissionCheck.conditions;
    }
    // query['$or'] = [{organizationId: 'akdi1'}]
    const users = await User.find(query);
    res.json(users);
  });
  ```

### fields

- **info**: The fields to allow/denied
  - You can use Glob notation to define allow or denied attributes
    - allow : \['firstName', 'lastName'\]
    - denied: \['-password'\]
    - mixed: \['title', 'body', 'creator', '-creator.password'\]
- **type**: string \| string\[\]
- **examples**:
  - `new Permission().fields(['firstName', 'lastName'])`
  - `new Permission().fields('title')`
  - `new Permission(`{fields: \['-password'\],...}`)`

### user

- **info**: Define for what group of users this permission is applied by conditions on the user record
  - you can user MongoDb operators, we used [sift](https://github.com/crcn/sift.js#readme) to implement this
- **type**: boolean \| object
- **examples**:
  - `new Permission().user(true) // all logged in users`
  - `new Permission().user({ vip: true })` // only vip users
  - `new Permission().user({ creditCard: { $exists: false } })` // only user with a credit card
  - `new Permission(`{start: { \$gt: 5 },...}`) // only user with more then 5 stars`

### when

- **info**:Define an async function that returns a Boolean value to apply or not the permission
- **type**: function
- **examples**:
  - `new Permission().when(context => context.user && context.user.age > 40)` // apply only when the we find user in the context the older then 40
  - `new Permission().when(someAsyncFunction)`

### meta

- **info**: You can add any data that you want to meta When we check permissions we find all the meta from the permissions that allow the request and collect them into the check response.
- **type**: any
- **examples**:
  - `new Permission().meta({populate: 'comments'})` // now you can allow the user to populate the comments fields

## check permissions

There are two ways to check permissions

- **hasPermission**
  - **When to use**: When you need only to check permissions
  - **Example**: `await appPermissions.hasPermission('read', 'posts', context)`
  - **Response:** Boolean value
- **check**

  - **When to use**: When you want to build a fetch query from the rules, to expose only fields that user need to read
  - **Example**: `await appPermissions.check('read', 'posts', context)`
  - **Response:** object with this properties:

    - **action**
      - type: string
      - The action we checked for permission.
      - e.g create
    - **resource**
      - type: string
      - The resource we checked for permission.
      - e.g posts
    - **allow**
      - type: Boolean
      - user allow or not allow to make this request
    - **message**
      - type: null \| string
      - when allow is false then the default message is : `You are not authorized to ${action} ${resources}`
    - **conditions**
      - type: null \| object\[
    - **fields**
      - type: object
        - fields properties
          - **allowAll** - Boolean - true when at least one permission is allow all fields with out ant condition
          - **allow** - string\[\] - collection of all the fields from the permission with empty conditions
          - **allowedByCondition** - object\[\] - collection of all the fields from the permission with conditions, each item in the array will by {fields: string\[\], condition: object}
          - **getFieldsToSelect** - function - this is all the fields that user allow by one of the permissions
    - **meta**:
      - type: null \| any\[\],
    - **filterData**
      - type: \(data: object \| object\[\]\) =&gt; object \| object\[\] \| null
      - pass object or object\[\] and the function return you data without the fields that user not allow
      - return null when allow is false
    - **validateData**
      - type: \(data: object \| object\[\]\) =&gt; { valid: Boolean; message?: string }
    - **filterDataIsRequired**

      - type: Boolean
      - true when not all the fields are allow and some of the fields are allow with conditions for example: you define app with this permissions

        1. new Permission\(\).fields\('privateNotes'\).conditions\('{"user":"{{user.id}}"}'\)
        2. new Permission\(\).fields\(\['title','body\]\)

        in this case any user can read title and body but user can read only his privateNotes  
        after you fetch all posts and select 'title,body,privateNotes' you need to remove privateNotes  
        from all the records that not belong to user  
        in this case filterDataIsRequired will be true  
        user filterData to remove fields by permissions
