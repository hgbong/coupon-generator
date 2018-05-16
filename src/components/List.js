import React, { Component } from 'react';

class List extends Component {
  changeDate (create_at) {
    let dateStr = create_at.substring(0, create_at.length - 5);
    dateStr = dateStr.replace('T', ' ');
    let date = new Date(dateStr);
    date.setHours(date.getHours() + 9);
    return date.toLocaleString();
  }
  
  allCheckboxClick () {
    const fullCheckbox = document.getElementsByName('fullCheckbox')[0];
    let boxes = document.getElementsByClassName('checkbox');
    if (fullCheckbox.checked === true) {
      for (let i = 0; i < boxes.length; i++) {
        boxes[i].checked = true;
      }
      this.props.setAllCheck();
    } else {
      for (let i = 0; i < boxes.length; i++) {
        boxes[i].checked = false;
      }
      this.props.setAllUnCheck();
    }
  }
  render() {
    if (this.props.isReset === true) {
      let boxes = document.getElementsByClassName('checkbox');

      for (let i = 0; i < boxes.length; i++) {
        boxes[i].checked = false;
      }
      this.props.reverseResetAllBtn();
    }

    if (this.props.isAllCheckBtnReset === true) {
      document.getElementsByName('fullCheckbox')[0].checked=false;
      this.props.reverseAllCheckboxReset();
    }

    const table = (
      <table id='info'>
        <thead>
          <tr className='tr'>
            <th id='id'>id</th>
            <th id='email'>email</th>
            <th id='coupon'>coupon</th>
            <th id='date'>date</th>
            <th id='check'><input type="checkbox" name="fullCheckbox" onClick={this.allCheckboxClick} /></th>
          </tr>
        </thead>
        <tbody>
          {
            this.props.datas.map((item, index) => {
              return (
                <tr key={index} className='tr'>
                  <td>{item.id}</td>
                  <td>{item.email}</td>
                  <td>{item.coupon}</td>
                  <td>{this.changeDate(item.create_at)}</td>
                  <td><input type="checkbox" className="checkbox" value={item.id} name="deleteId" onClick={this.props.handleCheckboxChange} /></td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
    return (
      table
    );
  }
}

export default List;