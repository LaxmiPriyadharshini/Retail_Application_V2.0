const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const passport = require('passport');
var session  = require('express-session');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var validate = require('validator');
var port = 3000;

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

require('./passport')(passport);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Session
app.use(session({
	secret: 'Thisisthesecretsessioncode',
	resave: true,
	cookie: { maxAge: 900000 },
	rolling: true,
	saveUninitialized: true
 } ));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Login
app.post('/login', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {

	  res.setHeader('Content-Type', 'application/json');
      return res.send({ message: info.message })
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
	  console.log(req.user);
	  res.setHeader('Content-Type', 'application/json');
      return res.send({ "message":"Welcome"+ " "+ req.user.firstname});
    });
  })(req, res, next);
});

//Logout
app.post('/logout', function (req, res){
	console.log(req.user);
	if(req.user){
	req.session.destroy(function (err) {
	  console.log(req.user);
	res.setHeader('Content-Type', 'application/json');
    res.send({"message":"You have been successfully logged out"});
  });
	}
	else{
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"You are not currently logged in"});
	}

});

//RegisterUser
app.post('/registerUser', function (req, res, callback) {

    var fname = req.body.fname;
	var lname = req.body.lname;
	var address = req.body.address;
	var city = req.body.city;
	var state = req.body.state;
	var zip = req.body.zip;
	var email = req.body.email;
	var username = req.body.username;
    var pwd = req.body.password;
	var params =[fname,lname,address,city,state,zip,email,username,pwd];

	if (!fname || !lname || !address || !city || !state || !zip || !email || !username || !pwd) {
        return res.send({"message": "The input you provided is not valid" });
    }
	else{
	   connection.query("INSERT INTO customerdata.userdata set firstname=? , lastname=? , address=? ,  city =?, state=? , zip= ?, email=? , username= ?, password= ? ", params, function (error, results, fields) {
			var obj= '{"message":"'+req.body.fname+ ' was registered successfully"}';
			if (error){
				if (error.code === "ER_DUP_ENTRY") {

			console.log("Duplicate entry detected");

			return res.send({ error:true, "message": "The input you provided is not valid" });

			}
				throw error;
			}
			return res.send(obj);
	 });

	}

	(req, res, callback);

});



//AddProducts
// app.post('/addProducts', ensureAuthenticated, function (req, res) {
//   //console.log(req.user.Username);
// 	var currentlyLoggedInUser = req.user.Username;
//   console.log(currentlyLoggedInUser);
//     if( currentlyLoggedInUser != "jadmin")
// 	{
//     var obj= '{"message":"You must be an admin to perform this action"}';
//     return res.send(obj);
// 	}
// 	else{
// 	var asin = req.body.asin;
// 	var productName = req.body.productName;
// 	var productDescription = req.body.productDescription;
// 	var pgroup = req.body.group;
//
// 	var params =[asin,productName,productDescription,group];
//
// 	if (!asin || !productName || !productDescription || !pgroup) {
//         return res.send({"message": "The input you provided is not valid" });
//     }
// 	else{
//     console.log(productName);
// 	connection.query("INSERT INTO retail.productdata set asin=? , productName=? , productDescription=? , `productgroup` =? ", params, function (error, results, fields) {
// 			var obj= '{"message":"'+req.body.productName+ ' was successfully added to the system"}';
// 			if (error){
// 				if (error.code === "ER_DUP_ENTRY") {
//
// 			console.log("Duplicate entry detected");
//
// 			return res.send({ error:true, "message": "The input you provided is not valid" });
//
// 			}
// 				throw error;
// 			}
// 			return res.send(obj);
// 	 });
// console.log("add product is done");
// 	 }
// 	}
// });

//AddProducts
app.post('/addProducts', ensureAuthenticated, function (req, res) {
	var currentlyLoggedInUser = req.user.username;
  console.log(currentlyLoggedInUser);

    if( currentlyLoggedInUser != "jadmin")
	{
    var obj= '{"message":"You must be an admin to perform this action"}';
    return res.send(obj);
	}
	else{
	var asin = req.body.asin;
	var productName = req.body.productName;
	var productDescription = req.body.productDescription;
	var group = req.body.group;

	var params =[asin,productName,productDescription,group];

	if (!asin || !productName || !productDescription || !group) {
        return res.send({"message": "The input you provided is not valid" });
    }
	else{
	connection.query("INSERT INTO retail.productdata set asin=? , productName=? , productDescription=? , `productgroup` =? ", params, function (error, results, fields) {
			var obj= '{"message":"'+req.body.productName+ ' was successfully added to the system"}';

			if (error){
				if (error.code === "ER_DUP_ENTRY") {

			console.log("Duplicate entry detected");

			return res.send({"message": "The input you provided is not valid" });

			}
				throw error;
			}
			return res.send(obj);
	 });




	 }
	}


});

//View Users
app.post( '/viewUsers', ensureAuthenticated,  function(req, res) {
 var params =[req.body.fname,req.body.lname];
 var userparam=[req.body.username];
 var currentlyLoggedInUser = req.user.Username;
 var queryString_withfname = "SELECT firstname,lastname,username from customerdata.userdata where firstname like '%"+req.body.fname+"%'";
 var queryString_withlname = "SELECT firstname,lastname,username from customerdata.userdata where lastname like '%"+req.body.lname+"%'";
 var queryString_withboth = "SELECT firstname,lastname,username from customerdata.userdata where firstname like '%"+req.body.fname+"%' and lastname like '%"+req.body.lname+"%'";
 var queryString_withnone = "SELECT firstname,lastname,username from customerdata.userdata";
 var finalQuery;
 if( currentlyLoggedInUser != "jadmin")
 {
    var obj= '{"message":"You must be an admin to perform this action"}';
    return res.send(obj);
 }
 else{
	 if(req.body.fname && !req.body.lname){
		 finalQuery =  queryString_withfname ;
		 }
	 else if(req.body.lname && !req.body.fname)
	 {
		 finalQuery =  queryString_withlname ;
	 }
	 else if(req.body.lname && req.body.fname)
	 {
		 finalQuery =  queryString_withboth ;
	 }
	 else{
		 finalQuery =  queryString_withnone ;
	 }
	 console.log("The final query is" + finalQuery);

	var queries = connection.query(finalQuery,  function(error, rows, fields) {
   if (!error && rows.length > 0 )
    {
          var obj= '{"message":"The action was successful","user":[';
          var resultSet = [];
          for(var i =0; i< rows.length; i++)
          {
              var usr= '{"fname":"'+rows[i].firstname+'","lname":"'+rows[i].lastname+'","userId":"'+rows[i].username+'"}';
              resultSet.push(usr);
          }
          obj=obj+resultSet+']}';
          return res.send(obj);
    }
   else if(error)
    {
      throw error;
    }
   else if(!error && rows.length == 0)
    {

      var obj= '{"message":"There are no users that match that criteria"}';
      return res.send(obj);
    }
 });
}
 //(req,res,next);
});

app.post('/viewProducts',function(req,resp,error)
{
  console.log('inside view product');
var rasin = req.body.asin;
var  rkeyword= req.body.keyword;
var rgroup = req.body.group;
var executequery;
console.log(rasin);
var params= [rasin,rkeyword,rgroup];
console.log(params);

// var rasin_query ="SELECT * from retail.productdata where asin like '%"+rasin+"%'";
// var rkeyword_query1 = "SELECT * from retail.productdata where productName like '%"+rkeyword+"%' or productDescription like '%"+rkeyword+"%'";
// //var rkeyword_query2= "SELECT * from retail.productdata where productDescription like '%"+rkeyword+"%'";
// var rgroup_query ="SELECT * from retail.productdata where productgroup like '%"+rgroup+"%'";
// var all_query= "select * from retail.productdata where asin like '%"+rasin+"%'and productName like '%"+rkeyword+"%' or productDescription like '%"+rkeyword+"%' and productgroup like '%"+rgroup+"%'";
//
// // USer provides all values for  search
//
// if (rasin && rkeyword && rgroup)
// {
//   executequery=all_query;
// }
// // // User provides two values for search
// //   {
// // console.log("inside two string logic");
// // }
// //User provides only one value for search
// else
// {
//   console.log("inside single string logic");
//         // USer provides only asin for search
//         if(rasin && !rkeyword && !rgroup)
//       {
//         executequery = rasin_query;
//       }
//       // USer provides only group for search
//        if(!rasin && !rkeyword && rgroup)
//       {
//           executequery = rgroup_query;
//       }
//       // USer provides only keyword for search
//        if (!rasin && rkeyword && !rgroup)
//       {
//         executequery=rkeyword_query1;
//       }
//
// }
if(rkeyword)
{
    if(rasin && rgroup)
    executequery="SELECT * from (SELECT asin,productName,productDescription,`productgroup` from retail.productdata where productName like '%" + rkeyword + "%' or productDescription like '%" + rkeyword + "%') as t1 where asin='" + rasin + "' and `productgroup` like '%" + rgroup + "%'";
	else if(!rasin && rgroup)
    executequery="SELECT * from (SELECT asin,productName,productDescription,`productgroup` from retail.productdata where productName like '%" + rkeyword + "%' or productDescription like '%" + rkeyword + "%') as t1 where `productgroup` like '%" + rgroup + "%'";
    else if(!rasin && !rgroup)
    executequery="SELECT * from (SELECT asin,productName,productDescription,`productgroup` from retail.productdata where productName like '%" + rkeyword + "%' or productDescription like '%" + rkeyword + "%') as t1";
    else if(rasin && !rgroup)
    executequery="SELECT * from (SELECT asin,productName,productDescription,`productgroup` from retail.productdata where productName like '%" + rkeyword + "%' or productDescription like '%" + rkeyword +  "%') as t1 where asin='"+ rasin +"'";
}
else
{
    if(rasin && !rgroup)
    executequery="SELECT * from test.productdata where asin='"+rasin+"'";
    else if(rgroup && !rasin)
    executequery="SELECT * from test.productdata where `group` like '%"+rgroup+"%'";
    else if(rasin && rgroup)
    executequery="SELECT * from test.productdata where asin='"+rasin+"' and `group` like '%"+rgroup+"%'";
	else{
	executequery = "SELECT * from test.productdata ";
	}
}

console.log(executequery);
var queries= connection.query(executequery,function(err,rows)
{
  if (!err && rows.length > 0 )
   {
         var obj= '{"product":[';
         var result = [];
         for(var i =0; i< rows.length; i++)
         {
             var temp= '{"asin":"'+rows[i].asin+'","productName":"'+rows[i].productName+'"}';
             result.push(temp);
         }
         obj=obj+ result +']}';
         return resp.send(obj);
   }

  else
   {

     var obj= '{"message":"There are no products that match that criteria"}';
     return resp.send(obj);
 }


})

});

app.post('/updateInfo', ensureAuthenticated, function (req, res){
	console.log(req);
var executequery='Update customerdata.userdata SET '

if(req.body.fname)
{
  executequery=executequery+' firstname = '+"'"+req.body.fname+"',";
}

if(req.body.lname)
{
  executequery=executequery+' lastname = '+"'"+req.body.lname+"',";
}
if(req.body.address)
{
  executequery=executequery+' address = '+"'"+req.body.address+"',";
}
if(req.body.city)
{
  executequery=executequery+' city = '+"'"+req.body.city+"',";
}
if(req.body.state)
{
  executequery=executequery+' state = '+"'"+req.body.state+"',";
}
if(req.body.zip)
{
  executequery=executequery+' zip = '+"'"+req.body.zip+"',";
}
if(req.body.email)
{
  executequery=executequery+' email = '+"'"+req.body.email+"',";
}
if(req.body.username)
{
  executequery=executequery+' username = '+"'"+req.body.username+"',";
}
if(req.body.password)
{
  executequery=executequery+' password = '+"'"+req.body.password+"'";
}
executequery=executequery+' WHERE username = '+"'"+req.user.Username+"'";

console.log(executequery);

if (!req.body.fname && !req.body.lname &&  !req.body.address &&  !req.body.city &&  !req.body.state &&  !req.body.zip &&  !req.body.email &&  !req.body.username &&  !req.body.password) {
      return res.send({"message": "The input you provided is not valid" });
  }
else{
   connection.query(executequery, function (error, results, fields) {
    var obj= '{"message":"'+req.body.fname+ ' your information was successfully updated"}';
    if (error){
      if (error.code === "ER_DUP_ENTRY") {

    console.log("Duplicate entry detected");

    return res.send({ error:true, "message": "The input you provided is not valid" });

    }
      throw error;
    }
    else
    {
    return res.send(obj);
  }
 });

}
});


app.post('/modifyProduct', ensureAuthenticated, function (req, res) {

    	var queryString = "UPDATE retail.productdata SET productDescription=" + "'" + req.body.productDescription +"'" + " , productName=" + "'" + req.body.productName +"'" + ", `productgroup`=" + "'" + req.body.group +"'" + " where asin = " + "'" + req.body.asin +"'" ;
		var currentlyLoggedInUser = req.user.username;
    if( currentlyLoggedInUser != "jadmin")
	{
    var obj= '{"message":"You must be an admin to perform this action"}';
    return res.send(obj);
	}
	else
	{
		if(!req.body.asin || !req.body.productName || !req.body.productDescription  ){
		return res.send({"message": "The input you provided is not valid" });
		}
		var obj;
        console.log(queryString);
		connection.query(queryString, function (error, results, fields) {

			if (error){

				return res.send({"message": "The input you provided is not valid" });
				throw error;
			}
			if(results.affectedRows == 0){
				return res.send({"message": "The input you provided is not valid" });
			}
			else{
				obj= '{"message":"'+req.body.productName+ ' was successfully updated"}';
				return res.send(obj);
			}

			});



	}
	});


//
// app.post('/modifyProduct', ensureAuthenticated, function (req, res){
// 	console.log(req.body.asin);
//   var currentlyLoggedInUser= req.user.Username;
// var executequery='Update retail.productdata SET'
// if( currentlyLoggedInUser != "jadmin")
// {
//    var obj= '{"message":"You must be an admin to perform this action"}';
//    return res.send(obj);
// }
// else{
//
// if(req.body.productName)
// {
//   executequery=executequery+' productName = '+"'"+req.body.productName+"',";
// }
//
// if(req.body.productDescription)
// {
//   executequery=executequery+' productDescription = '+"'"+req.body.productDescription+"'";
// }
//
// executequery=executequery+' WHERE asin = '+"'"+req.body.asin+"'";
//
// console.log(executequery);
// //
// // if (!req.body.asin || req.body.group ) {
// //       return res.send({"message": "The input you provided is not valid" });
// //   }
// // else{
//    connection.query(executequery, function (error, results, fields) {
//     var obj= '{"message":"'+req.body.productName+ ' was successfully updated"}';
//     if (error){
//       if (error.code === "ER_DUP_ENTRY") {
//
//     console.log("Duplicate entry detected");
//
//     return res.send({ error:true, "message": "The input you provided is not valid" });
//
//     }
//       throw error;
//     }
//     else
//     {
//     return res.send(obj);
//   }
//  });
// //}
// }
// });


// //AddProducts
// app.post('/modifyProduct', ensureAuthenticated, function (req, res) {
//   //console.log(req.user.Username);
// 	var currentlyLoggedInUser = req.user.Username;
//   console.log(currentlyLoggedInUser);
//     if( currentlyLoggedInUser != "jadmin")
// 	{
//     var obj= '{"message":"You must be an admin to perform this action"}';
//     return res.send(obj);
// 	}
// 	else{
// 	var asin = req.body.asin;
// 	var productName = req.body.productName;
// 	var productDescription = req.body.productDescription;
// 	var pgroup = req.body.group;
//
// 	var params =[asin,productName,productDescription,group];
//
// 	if (!asin || !productName || !productDescription || !pgroup) {
//         return res.send({"message": "The input you provided is not valid" });
//     }
// 	else{
//     if(req.body.group)
//     {
//       console.log("Cannot change the group of the product");
//
//     var obj= '"message": "The input you provided is not valid" ';
//     //  return res.send({ error:true, "message": "The input you provided is not valid" });
//
//     }
//     else{
//     console.log("inside else");
//     if(req.body.productName)
//     {
//       executequery= executequery +"productName = '"+req.body.productName+"',";
//     }
//     if(req.body.productDescription)
//     {
//         executequery= executequery +"productDescription = '"+req.body.productDescription+"'";
//     }
//
//     executequery= executequery +" where asin ='"+req.body.asin+"'";
//
//     console.log(executequery);
//   }
//
// 	// connection.query("INSERT INTO retail.productdata set asin=? , productName=? , productDescription=? , `productgroup` =? ", params, function (error, results, fields) {
// 	// 		var obj= '{"message":"'+req.body.productName+ ' was successfully added to the system"}';
// 	// 		if (error){
// 	// 			if (error.code === "ER_DUP_ENTRY") {
//   //
// 	// 		console.log("Duplicate entry detected");
//   //
// 	// 		return res.send({ error:true, "message": "The input you provided is not valid" });
//   //
// 	// 		}
// 	// 			throw error;
// 	// 		}
// 	// 		return res.send(obj);
// 	//  });
//
// 	 }
// 	}
// });
// //
// app.post('/modifyProduct', ensureAuthenticated, function (req, res) {
//   //console.log(req.user.Username);
// 	// var currentlyLoggedInUser = req.user.Username;
//   //
//   // console.log(currentlyLoggedInUser);
//   // var executequery="Update retail.productdata SET "
//   //   if( currentlyLoggedInUser != "jadmin")
// 	// {
//   //   var obj= '{"message":"You must be an admin to perform this action"}';
//   //   return res.send(obj);
// 	// }
// 	else{
// //var obj= '{"message":"You are an admin"}';
// if(req.body.group)
// {
//   console.log("Cannot change the group of the product");
//
// var obj= '"message": "The input you provided is not valid" ';
// //  return res.send({ error:true, "message": "The input you provided is not valid" });
//
// }
// else{
// console.log("inside else");
// if(req.body.productName)
// {
//   executequery= executequery +"productName = '"+req.body.productName+"',";
// }
// if(req.body.productDescription)
// {
//     executequery= executequery +"productDescription = '"+req.body.productDescription+"'";
// }
//
// executequery= executequery +" where asin ='"+req.body.asin+"'";
//
// console.log(executequery);
//
//
//    connection.query(executequery, function (error, results, fields) {
//     var obj= '{"message":"'+req.body.productName+ ' was successfully updated"}';
//     if (error){
//       if (error.code === "ER_DUP_ENTRY") {
//
//     console.log("Duplicate entry detected");
//
//     return res.send({ error:true, "message": "The input you provided is not valid" });
//
//     }
//       throw error;
//     }
//     else
//     {
//     return res.send(obj);
//   }
//  });
//
//
//
// // connection.query(executequery, function (error, results, fields) {
// //
// //  if (error){
// //    if (error.code === "ER_DUP_ENTRY") {
// //
// //  console.log("Duplicate entry detected");
// //
// //  return res.send({ error:true, "message": "The input you provided is not valid" });
// //
// //  }
// //    throw error;
// //  }
// //  else
// //  {
// //     var obj= '{"message":"'+req.body.productName+ ' was successfully updated"}';
// //  return res.send(obj);
// // }
// // })
//
// }
//
//     return res.send(obj);
//   }
// });
//Ensure user is logged in
function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}else
	{
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"You are not currently logged in"});
	}
}

//Add
app.post('/add', ensureAuthenticated, function (req, res){
	console.log(req.body.num1 + " " + req.body.num2);

	if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2)){
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"The numbers you entered are not valid"});
	}
	else{
	var result= Number(req.body.num1) + Number(req.body.num2);
	res.setHeader('Content-Type', 'application/json');
	res.send({"message":"The action was successful", "result": result});
	}
});

//Multiply
app.post('/multiply', ensureAuthenticated, function (req, res){
	console.log(req.body.num1 + " " + req.body.num2);
	if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2)){
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"The numbers you entered are not valid"});
	}
	else{
	var result= Number(req.body.num1) * Number(req.body.num2);
	res.setHeader('Content-Type', 'application/json');
	res.send({"message":"The action was successful", "result": result});
	}
});

//Divide
app.post('/divide', ensureAuthenticated, function (req, res){
	console.log(req.body.num1 + " " + req.body.num2);
	if(isNaN(Number(req.body.num1)) || isNaN(Number(req.body.num2)) || !(req.body.num1) || !(req.body.num2) ||  (req.body.num2 == 0)){
		res.setHeader('Content-Type', 'application/json');
		res.send({"message":"The numbers you entered are not valid"});
	}
	else{
	var result= Number(req.body.num1) / Number(req.body.num2);
	res.setHeader('Content-Type', 'application/json');
	res.send({"message":"The action was successful", "result": result});
	}
});


// port must be set to 3000 because incoming http requests are routed from port 80 to port 3000
app.listen(port, function () {
    console.log('Node app is running on port '+port);
});
