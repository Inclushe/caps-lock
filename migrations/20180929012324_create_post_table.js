
exports.up = function (knex, Promise) {
  return knex.schema.createTable('post', (table) => {
    table.uuid('id').primary().notNullable()
    table.uuid('user_id').notNullable()
    table.string('content').notNullable()
    table.bigInteger('created_at').unsigned().notNullable()
    table.bigInteger('updated_at').unsigned().notNullable()
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('post')
}
