import React from 'react';
import {
  Typography
} from '@mui/material';
import './LoginRegister.css';
import {
  Redirect
 } from 'react-router';
import axios from 'axios';



/**
 * Define LoginRegister, a React componment of CS142 project #7
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      regUsername: "",
      regFirstName: "",
      regLastName: "",
      regDescription: "",
      regLocation:"",
      regOccupation:"",
      regPassword:"",
      regPassword2:"",
      loginErrorMessage:"",
      loggedUserId:"",

      usernameError:"",
      passwordError:"",
      regUsernameError: "",
      regFirstNameError: "",
      regLastNameError: "",
      // regDescriptionError: "",
      // regLocationError:"",
      // regOccupationError:"",
      regPasswordError:"",
      regPassword2Error:"",

      regStatus:"",

    };
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeRegUsername = this.handleChangeRegUsername.bind(this);
    this.handleChangeRegFirstName = this.handleChangeRegFirstName.bind(this);
    this.handleChangeRegLastName = this.handleChangeRegLastName.bind(this);
    this.handleChangeRegLocation = this.handleChangeRegLocation.bind(this);
    this.handleChangeRegDescription = this.handleChangeRegDescription.bind(this);
    this.handleChangeRegOccupation = this.handleChangeRegOccupation.bind(this);
    this.handleChangeRegPassword = this.handleChangeRegPassword.bind(this);
    this.handleChangeRegPassword2 = this.handleChangeRegPassword2.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
  }

  handleChangeUsername(event) {
    this.setState({username: event.target.value,usernameError:"", loginErrorMessage:""}); 
  }

  handleChangePassword(event) {
    this.setState({password: event.target.value,passwordError:"", loginErrorMessage:""}); 
  }

  handleChangeRegUsername(event) {
    this.setState({regUsername: event.target.value,regUsernameError:""}); 
  }

  handleChangeRegFirstName(event) {
    this.setState({regFirstName: event.target.value,regFirstNameError:""}); 
  }

  handleChangeRegLastName(event) {
    this.setState({regLastName: event.target.value,regLastNameError:""}); 
  }

  handleChangeRegLocation(event) {
    this.setState({regLocation: event.target.value}); 
  }

  handleChangeRegDescription(event) {
    this.setState({regDescription: event.target.value}); 
  }

  handleChangeRegOccupation(event) {
    this.setState({regOccupation: event.target.value}); 
  }

  handleChangeRegPassword(event) {
    this.setState({regPassword: event.target.value,regPasswordError:""}); 
  }

  handleChangeRegPassword2(event) {
    this.setState({regPassword2: event.target.value,regPassword2Error:""}); 
  }


  handleLogin(event) {
  // Process submit from this.state
    event.preventDefault(); // Need to stop DOM from generating a POST
    if (this.state.username.length===0){
        this.setState({usernameError:"Username can't be empty. Please enter your username."});
        return;
    }
    if (this.state.password.length===0){
      this.setState({passwordError:"Password can't be empty. Please enter your password."});
      return;
  }
    axios.post('/admin/login', {
      login_name: this.state.username,
      password:this.state.password,
    })
    .then((response) => {
      console.log("Response: ", response);
      this.props.onLogin({loggedIn: true, loggedUser:response.data});
      this.setState({loggedUserId:response.data._id});
    })
    .catch( (error) => {
      console.log(error.response);
      if (error.response.status===400){
        this.setState({loginErrorMessage:"Username and/or password is wrong."});
      }
    });
  }

  handleRegister(event) {
    // Process submit from this.state
      event.preventDefault(); // Need to stop DOM from generating a POST
      if(this.state.regUsername.length===0){
        this.setState({regUsernameError:"Username can't be empty. Please enter the username you want to register with."});
        return;
      }
      if(this.state.regFirstName.length===0){
        this.setState({regFirstNameError:"First name can't be empty. Please enter the first name you want to register with."});
        return;
      }
      if(this.state.regLastName.length===0){
        this.setState({regLastNameError:"Last name can't be empty. Please enter the last name you want to register with."});
        return;
      }
      if(this.state.regPassword.length===0){
        this.setState({regPasswordError:"Password can't be empty. Please enter the password you want to register with."});
        return;
      }
      if(this.state.regPassword2!==this.state.regPassword){
        this.setState({regPassword2Error:"The repeat password is not the same as the first password. Please make sure they are the same."});
        return;
      }
      axios.post('/user', {
        login_name:this.state.regUsername, 
        password:this.state.regPassword, 
        first_name:this.state.regFirstName, 
        last_name:this.state.regLastName, 
        location:this.state.regLocation, 
        description:this.state.regDescription, 
        occupation:this.state.regOccupation,
      })
      .then((response) => {
        console.log(response);
        this.setState({regStatus:"Registering succeeded. Please login."});
      })
      .catch( (error) => {
        console.log(error.response);
        if(error.response.data==='An account with this username already exists.'){
          this.setState({regUsernameError:"An account with this username already exists. Login or use a different username to register."});
        }
      });
    }

  render() {
    if(this.state.loggedUserId) return (<Redirect path="/admin/login" to={"/users/"+this.state.loggedUserId}/>);
    else{
    return (
      <div>
        <Typography variant='h6'>Login</Typography>
        <form onSubmit={this.handleLogin}>
          <Typography variant='body1'>
          <label>
          Username: <input type="text" value={this.state.username} onChange={this.handleChangeUsername} />
          </label>
          </Typography>
          <Typography variant='body1' color='error'>
            {this.state.usernameError}
          </Typography>
          <br />
          <Typography variant='body1'>
          <label>
          Password: <input type="password" value={this.state.password} onChange={this.handleChangePassword} />
          </label>
          </Typography>
          <Typography variant='body1' color='error'>
            {this.state.passwordError}
          </Typography>
          <br />
          <input type="submit" value="Submit" />
        </form>

        <Typography variant='body1' color='error'>
          {this.state.loginErrorMessage}
        </Typography>
        <br />
        <Typography variant='h6'>Do not have an account yet? Register.</Typography>
        <form onSubmit={this.handleRegister}>
          <Typography variant='body1'>
          <label>
          Username: <input type="text" value={this.state.regUsername} onChange={this.handleChangeRegUsername} />
          </label>
          </Typography>
          <Typography variant='body1' color='error'>
            {this.state.regUsernameError}
          </Typography>
            
          <br />
          <Typography variant='body1'>
          <label>
          First Name: <input type="text" value={this.state.regFirstName} onChange={this.handleChangeRegFirstName} />
          </label>
          </Typography>
          <Typography variant='body1' color='error'>
          {this.state.regFirstNameError}
          </Typography>
          <br />
          <Typography variant='body1'>
          <label>
          Last Name: <input type="text" value={this.state.regLastName} onChange={this.handleChangeRegLastName} />
          </label>
          </Typography>
          <Typography variant='body1' color='error'> 
          {this.state.regLastNameError}
          </Typography>
          <br />
          <Typography variant='body1'>
          <label>
          Location: <input type="text" value={this.state.regLocation} onChange={this.handleChangeRegLocation} />
          </label>
          </Typography>
          <br />
          <Typography variant='body1'>
          <label>
          Description: <input type="text" value={this.state.regDescription} onChange={this.handleChangeRegDescription} />
          </label>
          </Typography>
          <br />
          <Typography variant='body1'>
          <label>
          Occupation: <input type="text" value={this.state.regOccupation} onChange={this.handleChangeRegOccupation} />
          </label>
          </Typography>
          <br />
          <Typography variant='body1'>
          <label>
          Password: <input type="password" value={this.state.regPassword} onChange={this.handleChangeRegPassword} />
          </label>
          </Typography>
          <Typography variant='body1' color='error'>
          {this.state.regPasswordError}
          </Typography>
          <br />
          <Typography variant='body1'>
          <label>
          Repeat Password: <input type="password" value={this.state.regPassword2} onChange={this.handleChangeRegPassword2} />
          </label>
          </Typography>
          <Typography variant='body1' color='error'>
          {this.state.regPassword2Error}
          </Typography>
          <br />
          <input type="submit" value="Register Me" />
        </form>
        <Typography variant='body1' color='success.main'>
          {this.state.regStatus}
        </Typography>
      </div>
      
    );
    }
  }
}

export default LoginRegister;
