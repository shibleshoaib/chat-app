const sqlDb = require('mssql'); 
const dbConfig = {
    user: 'shibli',
    password: 'Rasel@123',
    server: '172.31.1.70', 
    database: 'chat' 
};

exports.executeSql = function(sql, callback) {
    let conn = new sqlDb.ConnectionPool(dbConfig);
    conn.connect()
    .then(function() {
      let req = new sqlDb.Request(conn);
      req.query(sql)
      .then(function(recordset) {
        callback(recordset);
      })
      .catch(function(err) {
        console.log(err);
        callback(null, err);
      });
    })
    .catch(function(err) {
      console.log(err);
      callback(null, err);
    });
  };