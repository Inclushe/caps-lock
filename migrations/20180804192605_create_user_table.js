exports.up = function (knex, Promise) {
  return knex.schema.createTable('user', (table) => {
    table.uuid('id').primary().notNullable()
    table.string('name').notNullable()
    table.string('description')
    table.json('authentication_methods').defaultTo(JSON.stringify([])).notNullable()
    table.boolean('activated').defaultTo(false).notNullable()
    table.boolean('disabled').defaultTo(false).notNullable()
    table.bigInteger('created_at').unsigned().defaultTo(Date.now()).notNullable()
    table.bigInteger('updated_at').unsigned().defaultTo(Date.now()).notNullable()
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('user')
}
