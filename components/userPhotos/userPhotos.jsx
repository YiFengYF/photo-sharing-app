import React from 'react';
import {
  List,
  ListItem,
  Typography,
  Divider,
  Button
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
      fav_photos:[],
      fav_photo_count:0,
      liked_list:[],
      liked_num_list:[],
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
    .then(() => {
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

  handleFavorite = (pid) => () => {
    axios.post('/addfav/'+pid,{})
    .then(()=>{
      this.setState({fav_photos:[...this.state.fav_photos,pid]});
    }).catch((e)=>{
      console.log(e);
    });
  };

  handleLike = (pid,index) => ()=>{
    if(this.state.liked_list[index]===true){
      axios.post('/removelike/'+pid,{})
      .then(()=>{
        let updatedArray = [...this.state.liked_list];
        updatedArray[index] = (!this.state.liked_list[index]);
        this.setState({liked_list:updatedArray});
        let updatedArray2 = [...this.state.liked_num_list];
        updatedArray2[index] = this.state.liked_num_list[index]-1;
        this.setState({liked_num_list:updatedArray2});
      }).catch((e)=>{
        console.log(e);
      });
    }
    else{
      axios.post('/addlike/'+pid,{})
      .then(()=>{
        let updatedArray = [...this.state.liked_list];
        updatedArray[index] = (!this.state.liked_list[index]);
        this.setState({liked_list:updatedArray});
        let updatedArray2 = [...this.state.liked_num_list];
        updatedArray2[index] = this.state.liked_num_list[index]+1;
        this.setState({liked_num_list:updatedArray2});
      }).catch((e)=>{
        console.log(e);
      });
    }
  };

  componentDidMount(){
    axios.get("/photosofuser/"+this.props.match.params.userId).then((response) => {
      this.setState({photos:response.data});
      if  (this.state.photos.length>0){
        this.setState({liked_list: new Array(this.state.photos.length).fill(false)});
        this.setState({liked_num_list: new Array(this.state.photos.length).fill(0)});
        this.state.photos.forEach((photo,index) => {
          if (photo.liked_list.includes(this.props.newLoggedUser._id)){
            let updatedArray = [...this.state.liked_list];
            updatedArray[index] = true;
            this.setState({liked_list:updatedArray});
          }
          let updatedArray2 = [...this.state.liked_num_list];
          updatedArray2[index] = photo.liked_list.length;
          this.setState({liked_num_list:updatedArray2});
        });
      }
      this.props.onNewInfo(this.props);
    }).catch((e)=> {
      console.log(e.response);
    });

    axios.get("/favorites").then((response) => {
      if(response.data.photo_id_list) this.setState({fav_photos:response.data.photo_id_list});
    }).catch((e)=> {
      console.log(e);
    });
  }

  componentDidUpdate(prevProps){
    if (prevProps.match.params.userId !== this.props.match.params.userId){
      axios.get("/photosofuser/"+this.props.match.params.userId).then((response) => {
        this.setState({photos:response.data});
        this.props.onNewInfo(this.props);
      }).catch((e)=> {
        console.log(e);
      });    
    }
    if(this.props!==prevProps){
      axios.get("/favorites").then((response) => {
        if(response.data.photo_id_list) this.setState({fav_photos:response.data.photo_id_list});
      }).catch((e)=> {
        console.log(e);
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
              {new Date(commentObj.date_time).toLocaleString()}
            </Typography>
          </ListItem>
          // </div>
        )
      )
    );
  }
  return <Typography variant='body1' color='grey' sx={{pl:2}}>There is no comment so far.</Typography>;
}

displayPhoto(photo,index){
    return(
        <div key={photo._id}>
        <br/>
        <img src={"images/" + photo.file_name} height="300"/>
        <Typography variant='body1'>
        Creation time: {new Date(photo.date_time).toLocaleString()}
        </Typography>
        <Button onClick={this.handleFavorite(photo._id)} variant='contained' disabled={this.state.fav_photos.includes(photo._id)} sx={{m:1}}>
          Favorite
        </Button>
        {
          this.state.fav_photos.includes(photo._id)&& (
          <Typography variant='body2'>
            This photo has been favorited by you.
          </Typography>
          )
        }   
        <br />
        <Button onClick={this.handleLike(photo._id, index)} variant='contained' sx={{m:1}}>
          {this.state.liked_list[index] ? 'Unlike' : 'Like'}
        </Button>
        <Typography variant='body2'>
            This photo has been liked by {this.state.liked_num_list[index]} user(s) in total.
        </Typography>         
        {
          this.state.liked_list[index]&& (
          <Typography variant='body2'>
            This photo has been liked by you.
          </Typography>
          )
        }
         
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
          (this.state.currentComment===photo._id)? (
          <Typography variant='body1' color ='error'>
          {this.state.submitCommentErrorMessage}
          </Typography>
        )
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
          this.state.photos.map((photo,index) => this.displayPhoto(photo,index))
        );
      }else{
        return <Typography variant='body1' color='grey' sx={{pl:2}}>There is no photo so far.</Typography>;
      }
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
