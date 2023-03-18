import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper
} from '@mui/material';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/LoginRegister/LoginRegister';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      currentView:'',
      advFeatState:'',
      userIsLoggedIn:false,
      loggedUser:false,
    };
  }

  setInfo = (newInfo) => {
    this.setState({currentView:newInfo});
  };

  setAdvFeat = (advFeat) => {
    this.setState({advFeatState:advFeat});
  };

  setLogin = (newLogin) => {
    this.setState({
      userIsLoggedIn:newLogin.loggedIn,
      loggedUser:newLogin.loggedUser,
    });
  };

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar newInfo={this.state.currentView} onSetAdvFea={this.setAdvFeat} newLogin={this.state.userIsLoggedIn} newLoggedUser={this.state.loggedUser} onLogin={this.setLogin}/>
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="cs142-main-grid-item">
            {
              this.state.userIsLoggedIn ?
                <UserList advFeat={this.state.advFeatState}/>
              :
                <div />              
            }
            
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
            
              <Route path="/login-register"
                render={props => <LoginRegister onLogin={this.setLogin} {...props} /> } 
              />
              {
                this.state.userIsLoggedIn ?
                  <Route exact path="/" />
                  :
                  <Redirect path="/" to="/login-register" />
              }
              {
                this.state.userIsLoggedIn ? (
                  <Route path="/users/:userId"
                    render={ props => <UserDetail onNewInfo={this.setInfo} {...props} /> }
                  />
                )
                  :
                  <Redirect path="/users/:id" to="/login-register" />
              }
              {
                this.state.userIsLoggedIn ? (
                  <Route path="/photos/:userId"
                    render ={ props => <UserPhotos onNewInfo={this.setInfo} newLoggedUser={this.state.loggedUser} {...props} /> }
                  />
                )
                  :
                  <Redirect path="/photos/:userId" to="/login-register" />
              }
              {
                this.state.userIsLoggedIn ?
                  <Route path="/users" component={UserList}  />
                  :
                  <Redirect path="/users" to="/login-register" />
              }  
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
