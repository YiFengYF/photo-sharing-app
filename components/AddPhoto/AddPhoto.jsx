import React from 'react';
import {
  Typography,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import './AddPhoto.css';
import axios from 'axios';



/**
 * Define UserFavorites, a React componment of CS142 project #8
 */
class AddPhoto extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users:[],
      selectedOptions:[],
      shareWithEveryone:false,    
      fileChooseMessage:"",
      uploadStatus:"",
    };
  }
  /**
   * Called when user presses the upload button.
   */
  handleUploadButtonClicked = (e) => {
      e.preventDefault();
      if (this.uploadInput.files.length > 0) {
        this.setState({fileChooseMessage:""});
        // Create a DOM form and add the file to it under the name uploadedphoto
        const domForm = new FormData();
        domForm.append('uploadedphoto', this.uploadInput.files[0]);
        let shareList=[];
        if(!this.state.shareWithEveryone&&this.state.selectedOptions.length===0){
          shareList = [this.props.newLoggedUser._id];
        }
        else if(this.state.shareWithEveryone){
          shareList = this.state.users;
        }
        else{
          shareList = [...this.state.selectedOptions,this.props.newLoggedUser._id];
        }

        domForm.append('share_list',JSON.stringify(shareList));
        axios.post('/photos/new', domForm,{
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
            .then(() => {
            this.setState({uploadStatus:"Upload succeeded.", shareWithEveryone:false,selectedOptions:[]});
            })
            .catch((err)=> {
            console.log(`POST ERR: ${err}`);
            this.setState({uploadStatus:"Upload failed."});
            });
    
      }
      else{
        this.setState({fileChooseMessage:"Please choose a message to upload."});
      }

  };

  handleOptionChange = (e) => {
    const value = e.target.value;
    if(this.state.selectedOptions.includes(value)){
      this.setState({selectedOptions:this.state.selectedOptions.filter(option => option !== value)});

    }else{
      this.setState({selectedOptions:[...this.state.selectedOptions, value]});
    }
  };

  handleShareChange = (e) => {
    this.setState({shareWithEveryone:e.target.checked});
  };

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


  render() {

    return (
        <div>
            <form onSubmit={this.handleUploadButtonClicked}>
            <FormGroup>
                <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
            <Typography variant='body2'>
                Please select the users that you want to share the photo with. If you do not select any user or &ldquo;Share with everyone&rdquo;, your photo will be only visible to you.
            </Typography>
            
              <FormControlLabel
                control={<Checkbox checked={this.state.shareWithEveryone} onChange={this.handleShareChange} disabled={this.state.selectedOptions.length > 0} />}
                label="Share with everyone"
              />
              {this.state.users.map(user => (
                (user._id!==this.props.newLoggedUser._id)&& (
                <FormControlLabel
                  key={user._id}
                  control={(
<Checkbox checked={this.state.selectedOptions.includes(user._id)} 
                  onChange={this.handleOptionChange} 
                  value={user._id} 
                  disabled={this.state.shareWithEveryone}/>
)}
                  label={user.first_name+" "+user.last_name}
                />
              )
              ))}
              
            </FormGroup>
            <Button type="submit" variant="contained" color="primary">Share Photo</Button>
            </form>
            <Typography variant='body2' color='error'>
                {this.state.fileChooseMessage}
            </Typography>
            <Typography variant='body2'>
                {this.state.uploadStatus}
            </Typography>
          
        </div>
        

    );
  }
}

export default AddPhoto;
