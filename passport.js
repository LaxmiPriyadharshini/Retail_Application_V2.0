
// Local strategy is initilaised
var LocalStrategy   = require('passport-local').Strategy;
// importing MySQL
var mysql = require('mysql');

//Establish a connection
    var connection = mysql.createConnection({
      host: 'localhost',
      user: 'edisadmin',
      password: 'edis',
      database : 'authuser',
       // host: 'mynewdatabase.cdrcve0wuuhv.us-east-1.rds.amazonaws.com',
       // user: 'edisadmin',
       // password: 'priya007',
       // database : 'edisassignment',
    });

    // Try to connect to the database
    connection.connect((err) => {
     if (err) console.log("Oops... Error While connecting database");

    console.log('Connected!');
    });

//Exporting the passport functionality
module.exports = function(passport) {

   //Serialize the user
    passport.serializeUser(function(user, done) {
   done(null, user);
});

//Deserialize the user
passport.deserializeUser(function(user, done) {
  done(null, user);
});

//Use login Local Strategy for authentication
 passport.use('local-login', new LocalStrategy({

        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },

    function(req, username, password, done) {

      var databasetable;
      if(username=="jadmin")
      {
        databasetable ="authuser.defuser3";
      }
      else{
        databasetable= "customerdata.userdata";
      }
      // Check if the user name exisists
         connection.query("SELECT * FROM "+databasetable+" WHERE username = '" + username + "'",function(err,rows){
			 console.log("USERNAME  "+ username);
			 console.log("PASSWORD  "+ password);
			if (err)
                return done(err);
			 if (!rows.length) {
				 console.log("Username doesnot exist");

                return done(null, false, {message:'There seems to be an issue with the username/password combination that you entered'});
            }
            // console.log(rows);
            // console.log(rows[0].Username);
            // console.log(rows[0].password);
            // console.log(password);

            if (!( rows[0].password == password))
			{
        // console.log(rows[0].Password);
        // console.log(password);
			console.log("Password is wrong");
			 return done(null, false, {message:'There seems to be an issue with the username/password combination that you entered'});
			}

            return done(null, rows[0]);

		});



    }));


};
