import React, { Component } from 'react';
import CouponGenerate from './subComponents/CouponGenerate';
import ValidateCoupon from './subComponents/ValidateCoupon';
import SearchBox from './subComponents/SearchBox';
import DeleteCoupon from './subComponents/DeleteCoupon';

class Contents extends Component {
  render() {
    return (
      <div>
        <CouponGenerate
          handleInputChange={this.props.handleInputChange}
          createCoupon={this.props.createCoupon}
          email={this.props.email}
        />
        <ValidateCoupon />
        <SearchBox
          handleEmailChange={this.props.handleEmailChange}
          search={this.props.search}
          searchString={this.props.searchString}
        />
        <DeleteCoupon
          deleteData={this.props.deleteData}
        />
      </div>
    );
  }
}
export default Contents;
