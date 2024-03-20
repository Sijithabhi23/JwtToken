var express = require('express');
var app = express();
var cors=require('cors');
var mysql= require('mysql');
var bodyParser= require('body-parser');
const {sign}=require('jsonwebtoken');
const {verify}=require("jsonwebtoken");
const PORT=process.env.PORT||3000;
app.use(cors());
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'smec_labs'
  });
  
  
  connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected...')
  })



  app.use( bodyParser.json() );       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


var server = app.listen(8000, "127.0.0.1", function () {

    var host = server.address().address
    var port = server.address().port
  
    console.log("Example app listening at http://%s:%s", host, port)
  
  });


  app.get('/login', function (req, res) {
  
    connection.query('select username,password from jwt where username=? and password=?', [req.body.username,req.body.password],function (error, results, fields) {
       if (error) throw error;
       if(results.length>0){
        const token=sign({result:results},"abc1234",{
          expiresIn:"2h"
        });
        return res.json({
          success:0,
          message:"login successfully",
          token:token
        });
       }
       else{
        res.end(JSON.stringify({success:"failed",message:"invalid credentials"}));
       }
     });
 });

 const verifyToken=(req,res,next)=>{
  let token=req.get("authorization")
  if(token){
      token=token.slice(7);
      verify(token,"abc1234",(err,decoded)=>{
          if(err){
              res.json({
                  success:0,
                  message:"invalid token"
              })

          }else{
              next();
          }
      })
  }
  else{
      res.json({
          success:1,
          message:"access denied"
      })
  }
}




 app.get('/user',verifyToken, function (req, res) {
    
  connection.query('select * from jwt', function (error, results, fields) {
     if (error) throw error;
     res.json(results);
   });
});


 
 app.listen(PORT,()=>{
    console.log('server running');
 })