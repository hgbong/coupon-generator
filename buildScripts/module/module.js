
const express = require('express');

const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  database: 'hg',
  host: 'localhost',
  user: 'postgres',
  password: '1234',
  max: 20,
  connectionTimeoutMillis: 10000,
});

router.post('/coupons', (request, response) => {
  const email = request.body.email;
  const createdDate = new Date();

  const couponNumber = generateCoupon(email, createdDate.getMilliseconds());

  pool.connect((err, client, release) => {
    release();
    if (err) {
      response.send({
        code: 'server error',
        message: 'Server error occurred'
      });
      return;
    }
    const q = 'select email from coupon where email=$1';
    client.query(q, [
      email
    ], (err1, result) => {
      if (err1) {
        response.send({
          code: 'query error',
          message: 'There was an error fetching your data.'
        });
      } else {
        if (result.rowCount == 0) {
          client.query("insert into coupon values (nextval('seq'),$1,$2,current_timestamp)", [
            email, couponNumber
          ], (err, result) => {
            if (err) {
              response.send({
                code: 'query error',
                message: 'There was an error getting a new coupon.'
              });
            } else {
              response.send({
                code: 'success',
                message: 'Coupon generated'
              });
            }
          });
        } else {
          response.send({
            code: 'duplicate error',
            message: 'Coupons have been issued with duplicate emails.'
          });
        }
      }
    });
  });
});
router.put('/coupons', (request, response) => {
  // let error = {
  //   "code":"server error",
  //   "message":"eorrrrrrrr"
  // };
  // response.status(500).send({
  //   error
  // });
  const email = request.body.email;
  const createdDate = new Date();
  const couponNumber = generateCoupon(email, createdDate.getMilliseconds());
  pool.connect((err, client, release) => {
    release();
    if (err) {
      response.send({
        code: 'server error',
        message: 'Server error occurred'
      });
      return;
    }
    const q = 'update coupon set coupon=$1, create_at=$2 where email=$3';
    client.query(q, [
      couponNumber, createdDate, email
    ], (err1, result) => {
      if (err1) {
        response.send({
          "code": "query error",
          "message": "There was an error getting duplicate coupons."
        });
      } else {
        response.send({
          "code": "success",
          "message": "Your coupon number update was successful."
        });
      }
    });
  });
});

router.get('/coupons/', (request, response) => {
  pool.connect((err, client, release) => {
    release();
    if (err) {
      response.send({
        "code": "server error",
        "message": "Server error occurred"
      });
    }
    const searchString = request.query.searchString;
    const page = request.query.page;
    let data;
    let q = "select * from coupon where email like '%" + searchString + "%' order by id desc limit 10 offset $1";
    client.query(q, [
      (page - 1) * 10
    ], (err2, result) => {
      if (err2) {
        response.send({
          "code": "query error",
          "message": "Failed to look up data."
        });
      } else {
        if (result.rowCount === 0) {
          response.send({
            "code": "no data error",
            "message": "No data"
          });
          return;
        } else {
          data = result.rows;

          pool.connect((err, client, release) => {
            release();
            if (err) {
              response.send({
                "code": "server error",
                "message": "Server error occurred"
              });
              return;
            }
            const searchString = request.query.searchString;
            if (searchString === '') {
              q = "select count(*) from coupon";
            } else {
              q = "select count(*) from coupon where email like '%" + searchString + "%'";
            }
            client.query(q,
              (err, result) => {
                if (err) {
                  response.send({
                    "code": "query error",
                    "message": "There was an error fetching your data."
                  });
                  return;
                } else {
                  response.send({
                    data: data,
                    number: result.rows[0].count
                  });
                }
              });
          });
        }
      }
    });
  });
});

router.get('/coupons/validation/:coupon', (request, response) => {
  pool.connect((err, client, release) => {
    release();
    if (err) {
      response.send({
        "code": "server error",
        "message": "Server error occurred"
      });
      return;
    }
    const coupon = request.params.coupon;
    const q = "select id from coupon where coupon=$1";
    client.query(q, [
      coupon
    ], (err, result) => {
      if (err) {
        response.send({
          "code": "server error",
          "message": "Server error occurred"
        });
      } else {
        if (result.rowCount != 0) {
          response.send({
            "code": "success",
            "message": 'Valid coupon.'
          });
        } else {
          response.send({
            "code": "no data error",
            "message": 'Invalid coupon.'
          });
        }
      }
    });
  });
});
router.delete('/coupons', (request, response) => {
  pool.connect((err, client, release) => {
    release();
    if (err) {
      response.send({
        "code": "server error",
        "message": "Server error occurred"
      });
      return;
    }
    let idList = request.body.list;
    for (let i = 0; i < idList.length; i++) {
      idList[i] = parseInt(idList[i]);
    }
    let q = "delete from coupon where id in ( ";
    for (let i = 0; i < idList.length; i++) {
      if (i != idList.length - 1) {
        q += idList[i] + ',';
      } else {
        q += idList[i] + ')';
      }
    }
    client.query(q, (err, result) => {
      if (err) {
        response.send({
          "code": "query error",
          "message": "Failed to delete data."
        });
      } else {
        response.send({
          "code": "success",
          "message": "Data has been deleted."
        });
      }
    });

  });
});
const randomSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const value = {
  set0: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  set1: [1, 3, 2, 3, 2, 5, 2, 2, 3, 1, 4, 1, 1, 1, 1, 1],
  set2: [2, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 2],
  set3: [3, 3, 2, 4, 5, 6, 8, 7, 9, 1, 2, 3, 4, 5, 6, 7],
  set4: [4, 3, 2, 4, 5, 6, 8, 7, 9, 1, 3, 3, 5, 5, 6, 5],
  set5: [5, 3, 2, 4, 5, 6, 8, 7, 9, 1, 3, 3, 5, 5, 6, 7],
  set6: [6, 3, 2, 4, 4, 4, 8, 4, 9, 1, 3, 3, 5, 5, 6, 3],
  set7: [7, 3, 2, 4, 5, 6, 8, 7, 9, 1, 3, 3, 5, 5, 6, 7],
  set8: [6, 2, 5, 4, 5, 6, 8, 2, 3, 2, 3, 5, 5, 5, 6, 2],
  set9: [5, 3, 2, 4, 5, 6, 8, 7, 4, 1, 3, 3, 5, 2, 3, 1],
  set10: [4, 3, 2, 2, 3, 1, 8, 3, 5, 1, 3, 3, 4, 3, 6, 3],
  set11: [3, 3, 2, 4, 5, 6, 8, 2, 9, 1, 3, 3, 5, 5, 6, 3],
  set12: [2, 3, 2, 4, 5, 6, 8, 7, 9, 1, 3, 3, 5, 5, 6, 7],
  set13: [1, 3, 2, 4, 5, 1, 8, 2, 9, 1, 3, 3, 5, 5, 6, 5],
  set14: [4, 3, 2, 4, 5, 6, 8, 7, 9, 1, 3, 3, 5, 5, 6, 5],
  set15: [5, 3, 5, 4, 4, 6, 1, 2, 9, 1, 4, 3, 6, 5, 6, 4],
};


const generateCoupon = (email, ms) => {
  const Array1 = email.split('@');
  const Array2 = Array1[1].split('.');
  const strArray = [Array1[0], Array2[0], Array2[1]];   // str1 @ str2 . str3

  let entireStr = '';
  let entireLength = 0;
  for (let i = 0; i < strArray.length; i++) {
    entireStr += strArray[i];
    entireLength += strArray[i].length;
  }
  let intArray = [];
  if (entireLength < 16) {

    for (let i = 0; i < entireLength; i++) {
      let temp = 0;
      for (let j = 0; j < entireLength; j++) {

        temp += (value['set' + i][j]) * parseInt(entireStr.charCodeAt(j));
      }
      intArray.push(temp % 62);
    }

    const remainder = 16 - entireLength;
    for (let i = 0; i < remainder; i++) {
      intArray.push(Math.floor(Math.random() * 61 + 1));
    }

  } else {
    for (let i = 0; i < entireLength; i++) {
      let temp = 0;
      for (let j = 0; j < entireLength; j++) {

        temp += (value['set' + i][j]) * parseInt(entireStr.charCodeAt(j));
      }
      intArray.push(temp % 62);
    }
  }

  let enc = [];
  for (let i = 0; i < 16; i++) {
    enc.push(randomSet[intArray[i]]);
  }
  enc.splice(12, 0, '-');
  enc.splice(8, 0, '-');
  enc.splice(4, 0, '-');

  let couponString = '';
  for (let i = 0; i < enc.length; i++) {
    couponString += enc[i];
  }
  return couponString;
};

module.exports = router;
