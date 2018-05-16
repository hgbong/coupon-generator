import React, { Component } from 'react';
class Page extends Component {

  makePage () {
    const pages = this.props.pages.length;
    const {curPage} = this.props;
    const startPage = (parseInt((curPage - 1) / 5, 10)) * 5 + 1;   // 예 : 6
    const endPage = startPage + 4;                           // 예 : 10
    let pageList = [];
    for (let i = startPage; i <= endPage; i++) {
      pageList.push(i);
      if (i === pages) {    // 다음 페이지 출력x
        break;
      }
    }
    const rightArrow = <button type="button" data-value="right" className='cursor' onClick={this.props.moveArrow}> ▶ </button>;
    const leftArrow = <button type="button" data-value="left" className='cursor' onClick={this.props.moveArrow}> ◀ </button>;
    const pageTag = pageList.map((page, index) => {
      if ( page === curPage ) {
        return <button key={index} type="button" id={index} data-value={page} name="page_btn" className='cursor' style={{fontWeight:'800',color:'gray'}} onClick={this.props.movePage}> {page}p </button>;
      } else {
        return <button key={index} type="button" id={index} data-value={page} name="page_btn" className='cursor' style={{color:'black'}} onClick={this.props.movePage}> {page}p </button>;
      }
    });
    if (startPage === 1) {
      if (pages <= 5) {
        return (
          <div>
            {pageTag}
          </div>
        );
      } else {
        return (
          <div>
            {pageTag}
            {rightArrow}
          </div>
        );
      }
    } else if (endPage >= pages) {
      return (
        <div>
          {leftArrow}
          {pageTag}
        </div>
      );
    } else {
      return (
        <div>
          {leftArrow}
          {pageTag}
          {rightArrow}
        </div>
      );
    }
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
