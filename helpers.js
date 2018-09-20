exports.knex = require('knex')(require('./knexfile')[process.env.NODE_ENV === 'production' ? 'production' : 'development'])

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
