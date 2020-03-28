# Check response

When you check permissions

```javascript
const res = await appPersmissions.check('read', 'posts', { user: null });
```

You get object with this properties:

* **action** 
  * type: string
  * The action we checked for permission.
  * e.g create
* **resource**
  * type: string
  * The resource we checked for permission.
  * e.g posts
* **allow**
  * type: boolean
  * user allow or not allowed to make this request
* **message**
  * type: null \| string
  * when allow is false then the default message is :  ```You are not authorized to ${action} ${resources}```
* **conditions**
  * type: null \| object\[
* **fields**
  * type: object
    * fields properties
      * **allowAll** - boolean - true when at least one permission is allowed all fields with out ant condition
      * **allowed** - string\[\] - collection of all the fields from the permission with empty conditions
      * **allowedByCondition** - object\[\] - collection of all the fields from the permission with conditions, each item in the array will by {fields: string\[\], condition: object}
      * **getFieldsToSelect** - function - this is all the fields that user allowed by one of the permissions
* **meta**:
  * type: null \| any\[\],
* **filterData**
  * type: \(data: object \| object\[\]\) =&gt; object \| object\[\] \| null
  * pass object or object\[\] and the function return you data without the fields that user not allowed
  * return null when allow is false
* **validateData**
  * type: \(data: object \| object\[\]\) =&gt; { valid: boolean; message?: string }
* **filterDataIsRequired**

  * type: boolean
  * true when not all the fields are allowed and some of the fields are allowed with conditions for example: you define app with this permissions
    1. new Permission\(\).fields\('privateNotes'\).conditions\('{"user":"{{user.id}}"}'\)

    * new Permission\(\).fields\(\['title','body\]\)

          in this case any user can read title and body but user can read only his privateNotes  
          after you fetch all posts and select 'title,body,privateNotes' you need to remove privateNotes  
          from all the records that not belong to user  
          in this case filterDataIsRequired will be true  
          user filterData to remove fields by permissions



