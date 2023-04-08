import React from 'react';
import {
  Typography,
  Divider,
  Button,
  Modal,
  Box,
} from '@mui/material';
import './userFavorites.css';

import axios from 'axios';



/**
 * Define UserFavorites, a React componment of CS142 project #8
 */
class UserFavorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      open:false,
      empty:true,
    };
  }

  handleUnfavorite = (pid) => () => {
    // console.log("unfav clicked");
    axios.post('/removefav/'+pid,{})
    .then(()=>{
      // console.log("handleUnfavorite response: ", response);
      this.setState({photos:this.state.photos.filter(picture=>picture._id!==pid)});
    }).catch((e)=>{
      console.log(e);
    });
  };

  handleOpen=(file_name,date_time)=>()=>{
    this.setState({open:true, file_name:file_name, date_time:date_time});
  };

  handleClose=()=>{
    this.setState({open:false});
  };

  componentDidMount(){
    axios.get("/favorites").then((response) => {
        // console.log("response000", response);
        if(response.data==="no favorite photo"){
            this.setState({empty:true});
        }
        else{
            this.setState({photos:response.data.photo_list,empty:false});
        }
    //   this.props.onNewInfo(this.props);
    }).catch((e)=> {
        console.log(e.response);
    });
  }

  componentDidUpdate(prevProps){
    if (prevProps!== this.props){
      axios.get("/favorites").then((response) => {
        if(response.data==="no favorite photo"){
            this.setState({empty:true});
        }
        else{
            this.setState({photos:response.data.photo_list,empty:false});
        }
      }).catch((e)=> {
        console.log(e.response);
      });
    }
  }


displayPhoto(photo){
    return(
        <div key={photo._id}>
        <br/>
        <img src={"images/" + photo.file_name} height="100" onClick={this.handleOpen(photo.file_name,photo.date_time)}/>
        <br />
        <Button onClick={this.handleUnfavorite(photo._id)} variant='contained' size='small'>
          Remove Favorite
        </Button>

        <Divider />
        </div>
    );
}

  
  displayAllPhotos(){
      if(this.state.photos.length!==0){
        return(
          this.state.photos.map((photo) => this.displayPhoto(photo))
        );
      }
      return false;
    }


  render() {

    return (
      <div>
        {this.state.empty? 
            <Typography>No favorite photo</Typography>
            :
            this.displayAllPhotos()} 
        <Modal
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            id='modal_container'
        >
            <div id='box'>
                <Box>
                    <img src={"images/" + this.state.file_name} height="500"/>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Photo creation time: {
                        new Date(this.state.date_time).toLocaleString()
                        }
                    </Typography>
                </Box>
            </div>
            
        </Modal>
      </div>

    );
  }
}

export default UserFavorites;
