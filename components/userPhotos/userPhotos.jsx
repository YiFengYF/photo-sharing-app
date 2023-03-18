import React from 'react';
import {
  List,
  ListItem,
  Typography,
  Divider
} from '@mui/material';
import './userPhotos.css';
import {
  Link
} from 'react-router-dom';
import axios from 'axios';



/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      // newComment:"",
      submitCommentErrorMessage:"",
      currentComment:"",
    };
  }

  handleNewComment = (event)=> {
    this.setState({[event.target.name]: event.target.value}); 
  };

  handleAddComment = (pid) => (event)=> {
    event.preventDefault(); // Need to stop DOM from generating a POST
    if (!this.state[pid]){
        this.setState({submitCommentErrorMessage:"Comment can't be empty. Please enter your comment.",currentComment:pid});
        return;
    }
    axios.post('/commentsOfPhoto/'+pid, {
      comment: this.state[pid],
    })
    .then((response) => {
      console.log("Response: ", response);
      this.setState({[pid]:""});
      axios.get("/photosofuser/"+this.props.match.params.userId).then((res) => {
        this.setState({photos:res.data});
        this.props.onNewInfo(this.props);
      }).catch((e)=> {
        console.log(e.response);
      });
    })
    .catch( (error) => {
      console.log(error);
    });
  };

  componentDidMount(){
    axios.get("/photosofuser/"+this.props.match.params.userId).then((response) => {
      this.setState({photos:response.data});
      this.props.onNewInfo(this.props);
    }).catch((e)=> {
      console.log(e.response);
    });
  }

  componentDidUpdate(prevProps){
    if (prevProps.match.params.userId !== this.props.match.params.userId){
      axios.get("/photosofuser/"+this.props.match.params.userId).then((response) => {
        this.setState({photos:response.data});
        this.props.onNewInfo(this.props);
      }).catch((e)=> {
        console.log(e.response);
      });
    }
  }


static displayComments(comments){
  if (comments.length !==0){
    return(
        comments.map((commentObj) => (
          // <div key={commentObj._id}>
          <ListItem key = {commentObj._id}> 
            <Typography variant='body1' >
              <Link to={"/users/"+commentObj.user._id}>
                {commentObj.user.first_name+" "+commentObj.user.last_name}
              </Link>: {commentObj.comment}
            </Typography>
            <Typography variant='body2' sx={{pl:2}} >
              {commentObj.date_time}
            </Typography>
          </ListItem>
          // </div>
        )
      )
    );
  }
  return <Typography variant='body1' color='grey' sx={{pl:2}}>There is no comment so far.</Typography>;
}

displayPhoto(photo){
    return(
        <div key={photo._id}>
        <br/>
        <img src={"images/" + photo.file_name} height="300"/>
        <Typography variant='body1'>
        Creation time: {photo.date_time}
        </Typography>
        <Typography variant="h5" sx={{p:1}}>
          Comments
        </Typography>
        <List>
          {UserPhotos.displayComments(photo.comments)}
        </List>
        <form onSubmit={this.handleAddComment(photo._id)}>
          <label>
            Add a comment:<textarea name={photo._id} value={this.state[photo._id]} onChange={this.handleNewComment} />
          </label>
          <input type="submit" value="Add comment" />
        </form>
        {
          (this.state.currentComment===photo._id)?
          <Typography variant='body1' color ='error'>
          {this.state.submitCommentErrorMessage}
          </Typography>
          :
          <div></div>
        }
        
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
        {this.displayAllPhotos()} 
      </div>

    );
  }
}

export default UserPhotos;
