import React, { Component } from 'react';

class CouponGenerate extends Component {
  render() {
    return (
      <div>
        <input
          placeholder='abc123@example.com'
          type='text'
          value={this.props.email}
          onChange={this.props.handleInputChange}
        />
        <button onClick={this.props.createCoupon}>Generate</button>
      </div>
    );
  }
}
export default CouponGenerate;