# Permission

## Permission class **properties**

### actions

* **info**:  The actions that you want to allow
  * to allow all pass '\*'
* **type**: string \| string\[\]
* **examples**: 
  * `new Permission().actions(['create','update'])`  
  * `new Permission().actions('*')` 
  * `new Permission(`{actions: \['create'\],...}`)` 

### resources

* **info**:  The resources that you want to allow
  * to allow all pass '\*'
* **type: string \| string\[\]**
* **examples**:
  * `new Permission().resources(['posts','products'])`  
  * `new Permission().resources('posts')` 
  * `new Permission(`{resources: 'posts',...}`)` 

### roles

* **info**:  Define for what group of users this permission is applied by roles
* **type:** string \| string\[\]
* **examples**:
  * `new Permission().roles(['admin'])`  
  * `new Permission().roles('subscribers')` 
  * `new Permission(`{roles: 'admin',...}`)` 

### conditions

* **info**:  An object  of conditions to restrict which records this permission applies to
* **type:** string \| object
  * when it a string, it must be a valid [stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) in this way we can use a template
* **examples**:
  * `new Permission().conditions({active: true})`  
  * `new Permission().conditions('{"user":"{{user.id}}"}')` 
  * `new Permission(`{conditions: '{"organization":"{{user.organization}}"}',...}`)`

🌟 **This is a powerful way to protect your records**  
         When we check permissions we find all the permissions that allowed the request and collect  
         all the conditions into the check response.  
         we used this conditions in the filterData&validateData utils and also you can convert the conditions     
         to a fetch query.  
         this library used [sift ](https://github.com/crcn/sift.js#readme)that is a "tiny library for using MongoDB queries to filter data in Javascript"  
         you can use any MongoDB operator in the conditions like  $in, $nin, $exists, $gte..

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
import { Permissions, Permission} from 'user-permissions';

const appPersmissions = new Permissions([
  new Permission()
    .resources('users')
    .conditions('{"organizationId": "{{ user.organizationId}}" }')
    .roles('organization_admin')
]);

// some where in your app
router.find('/users', async (req, res) => {
  // req.user = {id:'a1', roles: ['organization_admin'], organizationId: 'akdi1' }
  const permissionCheck = await appPersmissions.check('read','users',{ user: req.user, roles: req.user.roles });
  if(!permissionCheck.isAllow){
   throw new Error(permissionCheck.message)
  }
  // Build query
  const query = {};
  if(permissionCheck.conditions){
   query['$or'] = permissionCheck.conditions
  }
  // query['$or'] = [{organizationId: 'akdi1'}]
  const users= await User.find(query);
  res.json(users);
});
                  
```

### fields

* **info**:  The fields to allowed/denied 
  * You can use Glob notation to define allowed or denied attributes
    * allowed : \['firstName', 'lastName'\]
    * denied: \['-password'\]
    * mixed: \['title', 'body', 'creator', '-creator.password'\]
* **type**: string \| string\[\]
* **examples**:
  * `new Permission().fields(['firstName', 'lastName'])`  
  * `new Permission().fields('title')` 
  * `new Permission(`{fields: \['-password'\],...}`)` 

### user

* **info**: Define for what group of users this permission is applied by conditions on the user record
  * you can user MongoDb operators, we used [sift](https://github.com/crcn/sift.js#readme) to implement this
* **type**: boolean \| object
* **examples**:
  * `new Permission().user(true) // all logged in users`  
  * `new Permission().user({ vip: true })` // only vip users
  * `new Permission().user({ creditCard: { $exists: false } })` // only user with a credit card
  * `new Permission(`{start: { $gt: 5 },...}`) // only user with more then 5 stars`

### when

* **info**:Define an async function that returns a boolean value to apply or not the permission
* **type**: function
* **examples**:
  * `new Permission().when(context => context.user && context.user.age > 40)` // apply only when the we find user in the context the older then 40
  * `new Permission().when(someAsyncFunction)` 

### meta

* **info**: You can add any data that you want to meta          When we check permissions we find all the meta from the permissions that allow the request           and collect them into the check response.
* **type**: any
* **examples**:
  * `new Permission().meta({populate: 'comments'})` // now you can allow the user to populate the comments fields  



