import React, { Component } from 'react';

class DeleteCoupon extends Component {
  render() {
    return (
      <div>
        <button type='button' id='del_btn' onClick={this.props.DeleteData}>Delete</button>
      </div>
    );
  }
}

export default DeleteCoupon;