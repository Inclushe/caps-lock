exports.up = function (knex, Promise) {
  return knex.schema.createTable('verification_code', (table) => {
    table.uuid('code').primary().notNullable()
    table.uuid('user_id').notNullable()
    table.string('action').notNullable()
    table.bigInteger('created_at').unsigned().notNullable()
    table.bigInteger('updated_at').unsigned().notNullable()
    table.unique('code')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('verification_code')
}
