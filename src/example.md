const { Abilities, Ability } = require('../dist')

module.exports = (function () {
  const appAbilities = new Abilities([
    // Everyone can read posts title and body
    new Ability('read', 'posts', undefined, undefined, {
      fields: ['title', 'body']
    }),
    // Logged in user can manage post, when he is the creator
    new Ability('*', 'posts', undefined, '{"creator": "{{ user.id }}" }', {
      user: true
    }) 
  ])

  const canCreate = appAbilities.check('create', 'posts')
  console.log(canCreate.can) // false
  console.log(canCreate.validateData({ notValidField: 'should failed' })) // false
  console.log('--------------')
  const canRead = appAbilities.check('read', 'posts')
  console.log(canRead.can) // true
  console.log(canRead.filterData({ notValidField: 'should failed', title: 'd' })) // { title: 'd'}
}())
