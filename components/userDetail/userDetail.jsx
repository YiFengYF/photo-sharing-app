import React from 'react';
import {
  Typography
} from '@mui/material';
import './userDetail.css';
import {
  Link
 } from 'react-router-dom';
import axios from 'axios';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null
    };
  }

   fetchUserDetails(){
    axios.get("/user/"+this.props.match.params.userId).then((response) => {
      this.setState({user:response.data});
      this.props.onNewInfo(this.props);
    }).catch((e)=> {
      console.log(e.response);
    });
  }

  componentDidMount(){
    this.fetchUserDetails();
  }

  componentDidUpdate(prevProps){
    if (this.props.match.params.userId!==prevProps.match.params.userId){
      this.fetchUserDetails();
    }

  }

  display(){
    if (this.state.user !==null){
        return(
        <div>
          <Typography variant = "h2">
            {this.state.user.first_name} {this.state.user.last_name}
          </Typography>
          <Typography display='block' variant = 'h6'>Location: </Typography>
          <Typography display = 'block' variant = "body1"> {this.state.user.location}</Typography>
          <Typography display='block' variant = 'h6'>Description:</Typography>
            <Typography display='block' variant = "body1"> {this.state.user.description}</Typography>
            <Typography display='block' variant = 'h6'>Occupation:</Typography>
            <Typography display='block' variant = "body1" > {this.state.user.occupation}</Typography>
          <Typography display='block' variant = "h5" sx={{pt:1}}>
              <Link to={"/photos/"+this.state.user._id}>Photos</Link>
          </Typography>
        </div>
        );
    }
    return false;
  }

  render() {
    return (
      <div>
        {this.display()}
      </div>
      
    );
  }
}

export default UserDetail;
