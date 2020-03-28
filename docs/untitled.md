# Define permissions

**Define permissions to your app by created a a new instance of the Permissions class.**  
e.g  `const appPersmissions = new Permissions([new Permission(),...])`

Permissions accept a collection of Permission class.

**Permission can be implement in two ways:**

1. using the Chainable api  e.g  `new Permission().actions('read').resources('posts')`
2. using the constractors  
   \* using the constructor is useful when you saving the Permissions in your DB

   e.g  `new Permission({actions: 'read', ...})`



