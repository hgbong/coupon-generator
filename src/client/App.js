import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import Contents from './components/Contents';
import List from './components/List';
import Page from './components/Page';

const Promise = require('es6-promise').Promise;

Promise.polyfill();
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curPage: 1, // current page
      datas: [], // data array sent to the List component
      searchString: '', // current searchword state
      pages: [], // all page array [1,2,3, ...n]
      email: '', // current email state
      checkList: [], // checkbox state
      AllClickState: 0, // all click state
      isReset: false, // initialize all checkboxes
      isAllCheckBtnReset: false // initialize entire checkbox
    };

    this.createCoupon = this.createCoupon.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.checkEmail = this.checkEmail.bind(this);
    this.Search = this.Search.bind(this);
    this.DeleteData = this.DeleteData.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.getTableList = this.getTableList.bind(this);
    this.checkListReset = this.checkListReset.bind(this);
    this.movePage = this.movePage.bind(this);
    this.moveArrow = this.moveArrow.bind(this);
    this.resetAllBtn = this.resetAllBtn.bind(this);
    this.reverseResetAllBtn = this.reverseResetAllBtn.bind(this);
    this.setAllCheck = this.setAllCheck.bind(this);
    this.setAllUnCheck = this.setAllUnCheck.bind(this);
    this.allCheckboxReset = this.allCheckboxReset.bind(this);
    this.reverseAllCheckboxReset = this.reverseAllCheckboxReset.bind(this);
  }

  componentDidMount() {
    this.getTableList();
  }

  handleInputChange(e) {
    this.setState({
      email: e.target.value
    });
  }

  checkEmail(email) {
    const emailRegEx = /^\w+@[a-zA-Z]+\.[a-zA-Z]{2,3}$/;
    if (email.length > 18) {
      alert('The maximum number of characters is 18 characters.');
      return true;
    }
    if (email.length === 0) {
      alert('Please enter your email.');
      return true;
    }
    if (!emailRegEx.test(email)) {
      alert('The email form is not valid');
      return true;
    }
    return false;
  }

  createCoupon(e) {
    const { email } = this.state;
    if (this.checkEmail(email)) {
      return;
    }
    const url = '/coupons';
    const data = {
      email
    };
    axios.post(url, data)
      .then((response) => {
        alert(response.data.message);
        this.getTableList();
      })
      .catch((error) => {
        if (error.response.data.code === 'conflictEmail') {
          alert(error.response.data.message);
          if (window.confirm('Would you like to reissue the coupon?')) {
            this.reCreateCoupon(data);
          } else {
            alert('Canceled.');
          }
        } else {
          alert(error.response.data.message);
        }
      }); // catch
    e.preventDefault();
  }
  reCreateCoupon(data) {
    const url = '/coupons';
    axios.put(url, data)
      .then((response) => {
        this.getTableList();
        if (response === undefined) {
          return;
        }
        alert(response.data.message);
      });
  }
  handleEmailChange(e) {
    this.setState({
      searchString: e.target.value
    });
  }

  Search(e) {
    this.setState({
      searchString: e.target.dataset.value,
      curPage: 1
    }, () => {
      this.getTableList();
    });
  }

  DeleteData() {
    const { checkList } = this.state;
    const list = [];
    for (let i = 0; i < checkList.length; i++) {
      if (checkList[i].ischecked) {
        list.push(checkList[i].id);
      }
    }
    if (list.length === 0) {
      alert('Check the data to be deleted.');
      return;
    }
    const listObj = {};
    listObj.list = list;
    const url = '/coupons';

    axios.delete(url, {
      data: listObj
    })
      .then((response) => {
        alert(response.data.message);
        this.setState({
          curPage: 1
        }, () => {
          this.getTableList();
        });
      })
      .catch((error) => {
        alert(error);
      });
  }

  handleCheckboxChange(e) {
    const id = e.target.value;
    const { checkList } = this.state;

    for (let i = 0; i < checkList.length; i++) {
      if (checkList[i].id === parseInt(id, 10)) {
        checkList[i].ischecked = !checkList[i].ischecked;
        break;
      }
    }
    this.setState({
      checkList: checkList
    });
  }

  getTableList() {
    const { searchString } = this.state;
    const { curPage } = this.state;
    const url = '/coupons/?searchString=' + searchString + '&page=' + curPage;
    axios.get(url)
      .then((response) => {
        const dataNumber = response.data.number;
        const p = parseInt((dataNumber - 1) / 10, 10) + 1;
        const arr = [];
        for (let i = 1; i <= p; i++) {
          arr.push(i);
        }
        this.setState({
          pages: arr,
          datas: response.data.data
        }, () => {
          this.checkListReset();
          this.resetAllBtn();
          this.allCheckboxReset();
        });
      })
      .catch((error) => {
        if (error.response.data.code === 'notFoundData') {
          alert(error.response.data.message);
          this.setState({
            searchString: ''
          });
        }
      });
  }

  checkListReset() {
    const { datas } = this.state;
    const list = [];
    for (let i = 0; i < datas.length; i++) {
      list.push({
        id: datas[i].id,
        ischecked: false
      });
    }
    this.setState({
      checkList: list
    });
  }

  movePage(e) {
    this.setState({
      curPage: parseInt(e.target.dataset.value, 10),
      AllClickState: -1
    }, () => {
      this.getTableList();
    });
  }

  moveArrow(e) {
    const arrow = e.target.dataset.value; // value = "left" , "right"
    let startPage = (parseInt((this.state.curPage - 1) / 5, 10)) * 5; // 1, 6, 11,
    startPage += 1;
    if (arrow === 'right') {
      this.setState({
        curPage: startPage + 5,
        AllClickState: -1
      }, () => {
        this.getTableList();
      });
    } else {
      this.setState({
        curPage: startPage - 5,
        AllClickState: -1
      }, () => {
        this.getTableList();
      });
    }
  }

  // the page needs to be initialized when the click box is moved, such as when moving or searching.
  resetAllBtn() {
    this.setState({
      isReset: true
    });
  }
  // After initializing all the check boxes, change the isReset value.
  reverseResetAllBtn() {
    this.setState({
      isReset: false
    });
  }

  // when the entire button is pressed
  setAllCheck() {
    const { checkList } = this.state;
    for (let i = 0; i < checkList.length; i++) {
      checkList[i].ischecked = true;
    }
    this.setState({
      checkList: checkList
    });
  }

  // when the entire button is pressed again
  setAllUnCheck() {
    const { checkList } = this.state;
    for (let i = 0; i < checkList.length; i++) {
      checkList[i].ischecked = false;
    }
    this.setState({
      checkList: checkList
    });
  }

  // like above, initialize the entire button unchecked state
  allCheckboxReset() {
    this.setState({
      isAllCheckBtnReset: true
    });
  }
  // initialize the entire button false
  reverseAllCheckboxReset() {
    this.setState({
      isAllCheckBtnReset: false
    });
  }

  render() {
    return (
      <div className="App">
        <Header />
        <Contents
          handleInputChange={this.handleInputChange}
          createCoupon={this.createCoupon}
          email={this.state.email}

          handleEmailChange={this.handleEmailChange}
          Search={this.Search}
          searchString={this.state.searchString}

          DeleteData={this.DeleteData}
        />

        <List
          datas={this.state.datas}
          handleCheckboxChange={this.handleCheckboxChange}
          AllClickState={this.state.AllClickState}

          reverseResetAllBtn={this.reverseResetAllBtn}
          isReset={this.state.isReset}

          setAllCheck={this.setAllCheck}
          setAllUnCheck={this.setAllUnCheck}

          isAllCheckBtnReset={this.state.isAllCheckBtnReset}
          reverseAllCheckboxReset={this.reverseAllCheckboxReset}
        />

        <Page
          pages={this.state.pages}
          curPage={this.state.curPage}
          movePage={this.movePage}
          moveArrow={this.moveArrow}
        />
      </div>
    );
  }
}

export default App;
