exports.up = function (knex, Promise) {
  return knex.schema.createTable('user', (table) => {
    table.uuid('id').primary().notNullable()
    table.string('name').notNullable()
    table.string('description')
    table.string('email').notNullable()
    // table.json('authentication_methods').defaultTo(JSON.stringify([])).notNullable()
    table.boolean('activated').defaultTo(false).notNullable()
    table.boolean('disabled').defaultTo(false).notNullable()
    table.bigInteger('created_at').unsigned().notNullable()
    table.bigInteger('updated_at').unsigned().notNullable()
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('user')
}
