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
          Search={this.props.Search}
          searchString={this.props.searchString}
        />
        <DeleteCoupon
          DeleteData={this.props.DeleteData}
        />
      </div>
    );
  }
}
export default Contents;
