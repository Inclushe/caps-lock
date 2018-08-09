exports.knex = require('knex')(require('./knexfile')[process.env.NODE_ENV === 'production' ? 'production' : 'development'])

exports.getUniqueID = function (table, column) {
  return new Promise((resolve, reject) => {
    var knex = require('./helpers').knex
    var uuid = require('uuid/v4')
    var check = function (id) {
      var where = {}
      where[column] = id
      knex(table)
        .where(where)
        .then((row) => {
          if (row.length === 0) {
            resolve(id)
          } else {
            check(uuid())
          }
        })
        .catch((e) => {
          reject(e)
        })
    }
    check(uuid())
  })
}

// exports.getUserFromId = function (id) {
//   return new Promise((resolve, reject) => {
//     var knex = require('./helpers').knex
//     if (id) {
//       knex('user')
//         .where({id: id})
//         .then((row) => {
//           if (row.length === 1) {
//             resolve(row[0])
//           } else {
//             resolve(null)
//           }
//         })
//         .catch((e) => {
//           reject(e)
//         })
//     } else {
//       resolve(null)
//     }
//   })
// }
