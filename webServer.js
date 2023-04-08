/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */


var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var express = require('express');
var app = express();

// fetch Express middleware modules
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

const fs = require("fs");


// Load the Mongoose schema for User, Photo, and SchemaInfo

var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });




app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    // Fetch the User. There should only one of them. The query of {} will match it.
    User.find({}, "_id first_name last_name", function (err, users) {
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users.length === 0) {
            // Query didn't return an error but didn't find the User object - This
            // is also an internal error return.
            response.status(500).send('Missing User');
            return;
        }
        response.status(200).send(JSON.parse(JSON.stringify(users)));
    });
        
});
/*
 * URL /user/newlist - Return a list of user with the number of photos of each user
 */
app.get('/user/newlist', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    User.find({}, "_id first_name last_name", function (err, users) {
        if (err) {
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users.length === 0) {
            response.status(500).send('Missing User');
            return;
        }
        
        users = JSON.parse(JSON.stringify(users));
        async.each(users,function(user,callback1){
            Photo.find({user_id:user._id}, "_id user_id comments file_name date_time", function (err1, photos) {
                if (err1) {
                    console.error('Doing /photosOfUser/:id error:', err);
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                if (photos === null ) {
                    response.status(500).send('Missing Photo');
                    return;
                }
                photos = JSON.parse(JSON.stringify(photos));
                user.photo_count = photos.length;
                callback1();
            });
        }, function(err2){
            if(err2){
                console.log('A user failed to process');
            } else {
                console.log('All users have been processed successfully.');
                response.status(200).send(JSON.parse(JSON.stringify(users)));

            }
        });

    });
    
});


/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    var id = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)){
        response.status(400).send('User with _id: ' + id + ' not found.');
        return;
    }

    User.findOne({_id:id}, "_id first_name last_name location description occupation", function (err, users) {
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users === null || users.length === 0) {
            response.status(500).send('Missing User');
            return;
        }
        // console.log(users)
        response.status(200).send(JSON.parse(JSON.stringify(users)));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    var id = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)){
        response.status(400).send('User with _id: ' + id + ' not found.');
        return;
    }
    Photo.find({user_id:id,  $or: [{ share_list: [] }, { share_list: { $exists: false } }, { share_list: { $in: [request.session.user_id]} }]  }, "_id user_id comments file_name date_time share_list liked_list like_count").sort({like_count:-1,date_time:-1}).exec(function (err, photos) {
        if (err) {
            console.error('Doing /photosOfUser/:id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (photos === null) {
            response.status(500).send('Missing Photo');
            return;
        }


        photos = JSON.parse(JSON.stringify(photos));
        // console.log("photos early, ",photos);
        // let photo_list = [];
        async.each(photos, function(photo, callback){
            //console.log("photo.share_list",photo.share_list);
            //console.log("photo.share_list.includes(request.session.user_id)",photo.share_list.includes(request.session.user_id))
            // if(photo.share_list.length===0||photo.share_list.includes(request.session.user_id)){
                //console.log("1");
                // if(photo.share_list.includes(request.session.user_id)){
                    let comments = photo.comments;
                    async.each(comments, function(comment, c_callback){
                        if (!mongoose.Types.ObjectId.isValid(comment.user_id)){
                            response.status(400).send('In comment, user with _id:' + comment.user_id + ' not found.');
                            return;
                        }
                        User.findOne({_id:comment.user_id},function(u_err,user){
                            if (u_err) {
                                console.error('Doing /user/:id in photos. error:', u_err);
                                response.status(500).send(JSON.stringify(u_err));
                                return;
                            }
                            if (user === null || user.length === 0) {
                                response.status(400).send('Missing User');
                                return;
                            }
                            let user_info = {_id: user._id, first_name: user.first_name,last_name:user.last_name};
                            comment.user = user_info;
                            delete comment.user_id;
                            c_callback();
                        });
                     
                    }, function(c_err){
                        if(c_err){
                            console.log('A comment failed to process');
                        } else {
                            console.log('All comments have been processed successfully.');
                            // photo_list.push(photo);
                            callback();
                        }
                    });  
                // }
            // }else{
            //     callback();
            // }
            
        }, function(p_err){
            if (p_err){
                console.log('A photo failed to process');
            }
            else {
                console.log('All photos have been processed successfully.');
                console.log("photos, ",photos);
                response.status(200).send(JSON.parse(JSON.stringify(photos)));       
            }
        });
    });
});

app.post('/admin/login', function (request, response) {
    var input_login_name = request.body.login_name;
    // if (!mongoose.Types.ObjectId.isValid(id)){
    //     response.status(400).send('User with _id: ' + id + ' not found.');
    //     return;
    // }

    User.findOne({login_name:input_login_name}, "_id first_name last_name login_name password", function (err, user) {
        if (err) {
            console.error('Doing /admin/login error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (user === null){
            response.status(400).send('User with login_name: ' + input_login_name + ' not found.');
            return;
        }
        if (user.length === 0) {
            response.status(500).send('Missing User');
            return;
        }
        if(user.password !==request.body.password){
            response.status(400).send('Username and password do not match.');
            return;
        }
        request.session.login_name = input_login_name;
        request.session.user_id = user._id;
        user = JSON.parse(JSON.stringify(user));
        delete user.password;
        //console.log(user);
        response.status(200).send(user);
    });
});

app.post('/admin/logout', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("No user is logged in.");
        return;
    }
    request.session.login_name = false;
    response.status(200).send("logged out");
});

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    // var input_photo_id = request.body.photo_id;
    var photo_id = request.params.photo_id;

    Photo.findOne({_id:photo_id}, "_id user_id comments file_name date_time", function (err, photo) {
        if (err) {
            console.log('/commentsOfPhoto/:photo_id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (photo === null){
            response.status(400).send('Photo with id: ' + photo_id + ' not found.');
            return;
        }
        if (photo.length === 0) {
            response.status(500).send('Missing Photo');
            return;
        }

        photo.comments.push({
            comment:request.body.comment,
            date_time:new Date().toISOString(),
            user_id:request.session.user_id,
        });
        photo.save();
        response.status(200).send(photo);
    });
});

app.post('/user', function (request, response) {
    var input_login_name = request.body.login_name;
    User.findOne({login_name:input_login_name}, function (err, user) {
        if (err) {
            console.error('Doing /admin/login error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (user===null){
            var newUser = new User(request.body);
            newUser.save();
            response.status(200).send("Register Success.");
            return;
        }
        request.session.login_name = input_login_name;
        response.status(400).send("An account with this username already exists.");
    });

    
});

app.post('/photos/new', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("No user is logged in.");
        return;
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("There is no file in the POST request.");
            return;
        }
      
        // request.file has the following properties of interest:
        //   fieldname    - Should be 'uploadedphoto' since that is what we sent
        //   originalname - The name of the file the user uploaded
        //   mimetype     - The mimetype of the image (e.g., 'image/jpeg',
        //                  'image/png')
        //   buffer       - A node Buffer containing the contents of the file
        //   size         - The size of the file in bytes
      
        // XXX - Do some validation here.
      
        // We need to create the file in the directory "images" under an unique name.
        // We make the original file name unique by adding a unique prefix with a
        // timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
        

        fs.writeFile("./images/" + filename, request.file.buffer, function (error) {
          // XXX - Once you have the file written into your images directory under the
          // name filename you can create the Photo object in the database
          if(error){
            response.status(400).send("write file failed");
          }
          const photo = {
            file_name:filename,
            date_time:new Date().toISOString(),
            user_id:request.session.user_id,
            comments:[],
            share_list:JSON.parse(request.body.share_list),
          };
          const newPhoto = new Photo(photo);
          newPhoto.save();
          //console.log("newPhoto", newPhoto);  
          response.status(200).send("Photo uploaded successfully.");
          
        });
      });

    
});

app.get('/favorites', function(request, response){
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    let id = request.session.user_id;
    User.findOne({_id:id}, "_id first_name last_name favorites", function (err, user) {
        if (err) {
            console.error('Doing /favorites error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (user === null || user.length === 0) {
            response.status(500).send('Missing User');
            return;
        }
        // console.log(users)
        if(user.favorites.length===0){
            response.status(200).send("no favorite photo");
            return;
        }
        let photo_list = [];
        let photo_id_list = [];
        async.each(user.favorites,function(photo_id,callback1){
            Photo.findOne({_id:photo_id}, "_id user_id file_name date_time", function (err1, photo) {
                if (err1) {
                    console.error('Doing /photosOfUser/:id error:', err);
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                if (photo === null) {
                    response.status(500).send('Missing Photo');
                    return;
                }
                photo = JSON.parse(JSON.stringify(photo));
                photo_list.push(photo);
                photo_id_list.push(photo._id);
                callback1();
            });
        }, function(err2){
            if(err2){
                console.log('A fav photo failed to process');
            } else {
                console.log('All fav photos have been processed successfully.');
                //console.log(photo_list);
                response.status(200).send({photo_list:photo_list,photo_id_list:photo_id_list});

            }
        });
    });
});

app.post('/addfav/:photo_id', function(request, response){
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    let user_id = request.session.user_id;
    User.findOne({_id:user_id}, "_id first_name last_name favorites", function (err, user) {
        if (err) {
            console.error('Doing /favorites error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (user === null || user.length === 0) {
            response.status(500).send('Missing User');
            return;
        }
        // console.log(users)
        let photo_id = request.params.photo_id;
        if (user.favorites.includes(photo_id)){
            response.status(400).send('This photo has been favorited.');
            return;
        }
        user.favorites.push(request.params.photo_id);
        user.save();
        // console.log(user);
        response.status(200).send("Success");
    });
});

app.post('/removefav/:photo_id', function(request, response){
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    let user_id = request.session.user_id;
    
    User.findOne({_id:user_id}, "_id first_name last_name favorites", function (err, user) {
        if (err) {
            console.error('Doing /favorites error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (user === null || user.length === 0) {
            response.status(500).send('Missing User');
            return;
        }
        // console.log(users)
        let photo_id = request.params.photo_id;
        if (!user.favorites.includes(photo_id)){
            response.status(400).send('This photo has not been favorited.');
            return;
        }
        // user=JSON.parse(JSON.stringify(user));
        user.favorites.splice(user.favorites.indexOf(photo_id),1);
        user.save();
        // console.log(user);
        response.status(200).send("Success");
    });
});

app.post('/addlike/:photo_id', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    // var input_photo_id = request.body.photo_id;
    var photo_id = request.params.photo_id;

    Photo.findOne({_id:photo_id}, "_id user_id comments file_name date_time liked_list like_count", function (err, photo) {
        if (err) {
            console.log('/commentsOfPhoto/:photo_id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (photo === null){
            response.status(400).send('Photo with id: ' + photo_id + ' not found.');
            return;
        }
        if (photo.liked_list.includes(request.session.user_id)){
            response.status(400).send('This photo has been liked.');
            return;
        }
        photo.liked_list.push(
            request.session.user_id
        );
        photo.like_count+=1;
        photo.save();
        console.log("addlike photo", photo);
        response.status(200).send(photo);
    });
});

app.post('/removelike/:photo_id', function (request, response) {
    if (!request.session.login_name){
        response.status(401).send("Unauthorized user. Please log in.");
        return;
    }
    // var input_photo_id = request.body.photo_id;
    var photo_id = request.params.photo_id;

    Photo.findOne({_id:photo_id}, "_id user_id comments file_name date_time liked_list like_count", function (err, photo) {
        if (err) {
            console.log('/commentsOfPhoto/:photo_id error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (photo === null){
            response.status(400).send('Photo with id: ' + photo_id + ' not found.');
            return;
        }
        if (!photo.liked_list.includes(request.session.user_id)){
            response.status(400).send('This photo has not been liked.');
            return;
        }
        console.log("photo.liked_list.indexOf(request.session.user_id), ", photo.liked_list.indexOf(request.session.user_id));
        photo.liked_list.splice(photo.liked_list.indexOf(request.session.user_id),1);
        photo.like_count-=1;
        photo.save();
        console.log("removelike photo", photo);
        response.status(200).send(photo);
    });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


