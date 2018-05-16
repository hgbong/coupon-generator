
import React from 'react';
import axios from 'axios';

class ValidateCoupon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coupon: ''
    };
    this.handleCouponChange = this.handleCouponChange.bind(this);
    this.confirmValidate = this.confirmValidate.bind(this);
  }

  handleCouponChange (e) {
    this.setState({
      coupon: e.target.value
    });
  }

  confirmValidate (e) {
    const coupon = this.state.coupon;
    if (coupon === '') {
      alert('Please enter your coupon number.');
      return;
    } else if (coupon.length !== 19 || coupon[4] !== '-' || coupon[9] !== '-' || coupon[14] !== '-') {
      alert('Please check the length and "-" position of your coupon number.');
      return;
    }
    const url = 'http://172.21.111.203:11113/CouponValidation/' + coupon;
    axios.get(url)
      .then((response) => {
        alert(response.data.message);
        this.setState({
          coupon: ''
        });
      })
      .catch((error) => {
        alert(error.message);
      });
    e.preventDefault();
  }
  render() {
    return (
      <div className='validation'>
        <input
          placeholder='aaaa-1111-aaaa-1111'
          type='text'
          value={this.state.coupon}
          onChange={this.handleCouponChange}
        />
        <button onClick={this.confirmValidate}>Check</button>
      </div>
    );
  }
}

export default ValidateCoupon;