const { Abilities, Ability } = require('../dist')

module.exports = (function () {
  const appAbilities = new Abilities([
    // Everyone allow read posts title and body
    new Ability('read', 'posts', undefined, undefined, {
      fields: ['title', 'body']
    }),
    // Logged in user allow manage post, when he is the creator
    new Ability('*', 'posts', undefined, '{"creator": "{{ user.id }}" }', {
      user: true
    }) 
  ])

  const canCreate = appAbilities.check('create', 'posts')
  console.log(canCreate.allow) // false
  console.log(canCreate.validateData({ notValidField: 'should failed' })) // false
  console.log('--------------')
  const canRead = appAbilities.check('read', 'posts')
  console.log(canRead.allow) // true
  console.log(canRead.filterData({ notValidField: 'should failed', title: 'd' })) // { title: 'd'}
}())
