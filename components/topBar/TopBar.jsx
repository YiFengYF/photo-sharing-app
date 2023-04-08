import React from 'react';
import {
  AppBar, Toolbar, Typography, Grid, Button
} from '@mui/material';
import './TopBar.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      versionNum:"",
      page:"",
      // checked:false,
      loginMes:"Please login",
      loginStatus:false,
    };
  }


  componentDidUpdate(prevProps){
    // console.log("topbar props",this.props);
    if (this.props!==prevProps && this.props.newInfo){
      axios.get("/user/"+this.props.newInfo.match.params.userId).then((response) => {
        let user = response.data;
        let pathname = this.props.newInfo.location.pathname;
        if(pathname.split("/")[1]==="users"){
          this.setState({page:user.first_name+" "+user.last_name});
        }
        else if (pathname.split("/")[1]==="photos"){
          this.setState({page:"Photos of "+user.first_name+" "+user.last_name});
        }
      }).catch((e)=> {
        console.log(e);
      });
    }
    if (this.props!==prevProps){
        if(this.props.newLogin)
          {this.setState({loginMes:"Hi, "+ this.props.newLoggedUser.first_name,loginStatus:true});
        }
        else{
          this.setState({loginMes:"Please login.",loginStatus:false});
        }
      if(!this.newLogin){
        this.setState({page:""});
      }
      axios.get("/test/info").then((response) => {
        this.setState({versionNum:response.data.version});
      }).catch((e)=> {
        console.log(e);
      });
    }
  }

  render() {
    // console.log("this.state.page",this.state.page)
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
        {/* <Grid item xs={2}>
          <FormControlLabel control={<Switch checked={this.state.checked} onChange={this.handleChange} color="warning"/>} label="Advanced Feature" />
        </Grid> */}
        <Grid item xs={2}>
          <Typography variant="body1" color="inherit">
            {this.state.loginMes}
          </Typography>
        </Grid> 
        <Grid item xs={2}>
          {this.state.loginStatus? (
            <Typography variant="body1" color="inherit" textAlign='center'>
            <Button
              onClick={()=>{
                axios.post('/admin/logout', {})
                .then(() => {
                  // console.log(response);
                  // this.setState({loginStatus:false});
                  this.props.onLogin({loggedIn: false, first_name:""});
                })
                .catch(function (error) {
                  console.log(error);
                });
              }} color = "secondary" variant="contained" size="small"> Log Out 
            </Button>
            </Typography>
          )
          :
          <div></div>}  
        </Grid>        
        <Grid item xs={2}>
        {this.state.loginStatus? (
        <div>
          <Typography variant="body1" color="inherit">
          {/* <Button onClick={this.handleUploadButtonClicked} color = "secondary" variant="contained" size="small">
              Add Photo
          </Button> */}
          <Link to="/addPhoto" className='add-photo'>
            <Button color = "secondary" variant="contained" size="small">
              Add Photo
            </Button>
          </Link>
          </Typography>
        
        </div>
      ) 
        :
        <div></div>}
        </Grid>
        <Grid item xs={2}>
        {this.state.loginStatus? (
        <div>
          <Typography variant="body1" color="inherit">
          {/* <Button onClick={this.handleUploadButtonClicked} color = "secondary" variant="contained" size="small">
              Add Photo
          </Button> */}
          <Link to="/favorites">
            <Button color = "secondary" variant="contained" size="small">
              Favorites
            </Button>
          </Link>
          </Typography>
        
        </div>
      ) 
        :
        <div></div>}
        </Grid>
        <Grid item xs={2}>
        <Typography variant="body2" color="inherit" align='center'>
             Version Number: {this.state.versionNum}
        </Typography>
        </Grid>
        <Grid item xs={2}>
        <Typography variant="body1" color="inherit">
          {this.state.page}
        </Typography>
        </Grid>
          
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
