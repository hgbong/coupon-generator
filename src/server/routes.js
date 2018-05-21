
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

function makeError(status, code) {
  const error = {
    code: '',
    message: ''
  };
  error.code = code;
  switch (status) {
    case 400:
      error.message = 'This is an invalid coupon.';
      break;
    case 404:
      error.message = 'No results were found for your search.';
      break;
    case 409:
      error.message = 'Coupon issued by duplicate emails exist.';
      break;
    case 500:
      error.message = 'The current server state is not smooth. Please try again later.';
      break;
    default:
      error.message = 'Unidentified error. Please contact your system administrator.';
      break;
  }
  return error;
}

router.post('/coupons', (request, response) => {
  const { email } = request.body;
  const createdDate = new Date();
  const couponNumber = generateCoupon(email, createdDate.getMilliseconds());
  pool.connect((err, client, release) => {
    release();
    if (err) {
      response.status(500).send(makeError(500, 'serverError'));
      return;
    }
    const q = 'select email from coupon where email=$1';
    client.query(q, [
      email
    ], (err1, result) => {
      if (err1) {
        response.status(500).send(makeError(500, 'serverError'));
      } else if (result.rowCount === 0) {
        client.query("insert into coupon values (nextval('seq'),$1,$2,current_timestamp)", [
          email, couponNumber
        ], (err2) => {
          if (err2) {
            response.status(500).send(makeError(500, 'serverError'));
          } else {
            response.send({
              code: 'success',
              message: 'Coupon generated'
            });
          }
        });
      } else {
        response.status(409).send(makeError(409, 'conflictEmail'));
      }
    });
  });
});
router.put('/coupons', (request, response) => {
  const { email } = request.body;
  const createdDate = new Date();
  const couponNumber = generateCoupon(email, createdDate.getMilliseconds());
  pool.connect((err1, client, release) => {
    release();
    if (err1) {
      response.status(500).send(makeError(500, 'serverError'));
      return;
    }
    const q = 'update coupon set coupon=$1, create_at=$2 where email=$3';
    client.query(q, [
      couponNumber, createdDate, email
    ], (err2, result) => {
      if (err2) {
        response.status(500).send(makeError(500, 'serverError'));
      } else {
        response.send({
          code: 'success',
          message: 'Your coupon number update was successful.'
        });
      }
    });
  });
});

router.get('/coupons/', (request, response) => {
  pool.connect((err1, client1, release1) => {
    release1();
    if (err1) {
      response.status(500).send(makeError(500, 'serverError'));
      return;
    }
    const { searchString } = request.query;
    const { page } = request.query;
    let data;
    let q = "select * from coupon where email like '%" + searchString + "%' order by id desc limit 10 offset $1";
    client1.query(q, [
      (page - 1) * 10
    ], (err2, result1) => {
      if (err2) {
        response.status(500).send(makeError(500, 'serverError'));
      } else {
        if (result1.rowCount === 0) {
          response.status(404).send(makeError(404, 'notFoundData'));
          return;
        }
        data = result1.rows;

        pool.connect((err3, client2, release2) => {
          release2();
          if (err3) {
            response.status(500).send(makeError(500, 'serverError'));
            return;
          }
          const searchString2 = request.query.searchString;
          if (searchString2 === '') {
            q = 'select count(*) from coupon';
          } else {
            q = "select count(*) from coupon where email like '%" + searchString + "%'";
          }
          client2.query(
            q,
            (err4, result2) => {
              if (err4) {
                response.status(500).send(makeError(500, 'serverError'));
              } else {
                response.send({
                  data,
                  number: result2.rows[0].count
                });
              }
            }
          );
        });
      }
    });
  });
});

router.get('/coupons/validation/:coupon', (request, response) => {
  pool.connect((err1, client, release) => {
    release();
    if (err1) {
      response.status(500).send(makeError(500, 'serverError'));
      return;
    }
    const { coupon } = request.params;
    const q = 'select id from coupon where coupon=$1';
    client.query(q, [
      coupon
    ], (err2, result) => {
      if (err2) {
        response.status(500).send(makeError(500, 'serverError'));
      } else if (result.rowCount !== 0) {
        response.send({
          code: 'success',
          message: 'Valid coupon.'
        });
      } else {
        response.status(400).send(makeError(400, 'notValidCoupon'));
      }
    });
  });
});
router.delete('/coupons', (request, response) => {
  pool.connect((err1, client, release) => {
    release();
    if (err1) {
      response.status(500).send(makeError(500, 'serverError'));
      return;
    }
    const idList = request.body.list;
    for (let i = 0; i < idList.length; i++) {
      idList[i] = parseInt(idList[i], 10);
    }
    let q = 'delete from coupon where id in ( ';
    for (let i = 0; i < idList.length; i++) {
      if (i !== idList.length - 1) {
        q += idList[i] + ',';
      } else {
        q += idList[i] + ')';
      }
    }
    client.query(q, (err2, result) => {
      if (err2) {
        response.status(500).send(makeError(500, 'serverError'));
      } else {
        response.send({
          code: 'success',
          message: 'Data has been deleted.'
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
  const strArray = [Array1[0], Array2[0], Array2[1]]; // str1 @ str2 . str3

  let entireStr = '';
  let entireLength = 0;
  for (let i = 0; i < strArray.length; i++) {
    entireStr += strArray[i];
    entireLength += strArray[i].length;
  }
  const intArray = [];
  if (entireLength < 16) {
    for (let i = 0; i < entireLength; i++) {
      let temp = 0;
      for (let j = 0; j < entireLength; j++) {
        temp += (value['set' + i][j]) * parseInt(entireStr.charCodeAt(j), 10);
      }
      intArray.push(temp % 62);
    }

    const remainder = 16 - entireLength;
    for (let i = 0; i < remainder; i++) {
      const x = Math.random() * 61;
      intArray.push(Math.floor(x + 1));
    }
  } else {
    for (let i = 0; i < entireLength; i++) {
      let temp = 0;
      for (let j = 0; j < entireLength; j++) {
        temp += (value['set' + i][j]) * parseInt(entireStr.charCodeAt(j), 10);
      }
      intArray.push(temp % 62);
    }
  }

  const enc = [];
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
