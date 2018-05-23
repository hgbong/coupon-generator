import React, { Component } from 'react';

class SearchBox extends Component {
  render() {
    return (
      <div id="searchData">
        <input
          placeholder="searching words"
          type="text"
          value={this.props.searchString}
          onChange={this.props.handleEmailChange}
        />
        <button data-value={this.props.searchString} onClick={this.props.search}>Search</button>
      </div>
    );
  }
}
export default SearchBox;
