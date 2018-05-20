import React, { Component } from 'react';

class Page extends Component {
  makePage() {
    const pages = this.props.pages.length;
    const { curPage } = this.props;
    let startPage = (parseInt((curPage - 1) / 5, 10)) * 5;
    startPage += 1;
    const endPage = startPage + 4;
    const pageList = [];
    for (let i = startPage; i <= endPage; i++) {
      pageList.push(i);
      if (i === pages) {
        break;
      }
    }
    const rightArrow = <button type="button" data-value="right" className="cursor" onClick={this.props.moveArrow}> ▶ </button>;
    const leftArrow = <button type="button" data-value="left" className="cursor" onClick={this.props.moveArrow}> ◀ </button>;
    const pageTag = pageList.map((page, index) => {
      if (page === curPage) {
        return <button key={page} type="button" id={index} data-value={page} name="page_btn" className="cursor" style={{ fontWeight: '800', color: 'gray' }} onClick={this.props.movePage}> {page}p </button>;
      }
      return <button key={page} type="button" id={index} data-value={page} name="page_btn" className="cursor" style={{ color: 'black' }} onClick={this.props.movePage}> {page}p </button>;
    });
    if (startPage === 1) {
      if (pages <= 5) {
        return (
          <div>
            {pageTag}
          </div>
        );
      }
      return (
        <div>
          {pageTag}
          {rightArrow}
        </div>
      );
    } else if (endPage >= pages) {
      return (
        <div>
          {leftArrow}
          {pageTag}
        </div>
      );
    }
    return (
      <div>
        {leftArrow}
        {pageTag}
        {rightArrow}
      </div>
    );
  }
  render() {
    return (
      <div>
        {this.makePage()}
      </div>
    );
  }
}
export default Page;
