import React from 'react';
import {
  List,
  ListItem,
  Typography,
  Chip,
}
from '@mui/material';
import './userList.css';
import {
  Link
} from 'react-router-dom';
import axios from 'axios';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users:[]
    };
  }


  componentDidMount(){
    axios.get("/user/list").then((response) => {
      this.setState({users:response.data});
    }).catch((e)=> {
      console.log(e.response);
    });
  }

  componentDidUpdate(prevProps){
    if (this.props.match!==prevProps.match){
      axios.get("/user/list").then((response) => {
        this.setState({users:response.data});
      }).catch((e)=> {
        console.log(e.response);
      });
    }
  }


  populateUserList(){
    return(
      this.state.users.map((user) => (
          <ListItem key={user._id} divider = {true} onClick={this.handleNewInfo}>  
            <Typography variant='h6'>
              <Link to={"/users/"+user._id}>
                  {user.first_name+" "+user.last_name}
              </Link>
            </Typography>  
            {(this.props.advFeat && <Chip label={user.photo_count} color='success' sx={{ml:2 }}/>)}
          </ListItem>
        )   
      )  
    );
  }

  render() {
    return (
        <List component="nav">
          {this.populateUserList()}
        </List>
    );
  }
}

export default UserList;
