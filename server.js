
/*  including modules   */


	var express=require('express');
	var Pool=require('pg').Pool;
	var bodyParser = require('body-parser');
	var Crypto=require('crypto');
	var session=require('express-session');
	var multer=require('multer');
	var path = require('path');


/*  end      */


/* Configuration to connect to database */
    
	var config={
	user:'murari',
	database:'cdluser',
	port:'5432',
	password:'ajay15'
    }


/*  end      */



/*  multer configure */ 
    
	var multerConf={
	storage:multer.diskStorage({
		destination:function(req,file,next){
			next(null,'./public/pdf');
		},
		filename:function(req,file,next){
			const ext=file.mimetype.split('/')[1];
			if(ext=='pdf')
			next(null,file.originalname.split('.')[0]+'.'+ext);
		}
	}),
	filefilter:function(req,file,next){
		if(!file){
			next();
		}
		const pdf=file.mimetype.startsWith('application/pdf');
		if(pdf){
			next(null,true);
			
		}
	}};
	
	
/*  multer config end  */ 


//creating express object
    app=express();


//creating pool object
    var pool=new Pool(config);


//seting view engine to ejs
    app.set('view engine','ejs');


// using bodyparser middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false })); 
    app.use(session({secret:'empty',cookie:{maxAge:1000*60*60*24*30},resave:false,saveUninitialized:false}));

	
//function to hash password


	function hash(input,salt)
	{
		var hashed=Crypto.pbkdf2Sync(input,salt,10000,512, 'sha512');
		return["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
	}


/* download  Files */
   
   app.get('/empty/:id',function(req,res){
   res.sendFile(path.join(__dirname, 'public','pdf',req.params.id));
	
   });

   
 /*  download  ends  */

/* Upload File */
	
	
	app.post("/fileupload",multer(multerConf).single('filetoupload'),function(req,res){
		if(req.file){
			console.log(req.file);
			req.body.filetoupload=req.file.filename;
		}
			 if(req.session.auth)
		 {res.redirect("/taddsol");
		 }else{
		res.render("admin");
	
    }});

/* Upload End */

 
/* logout  logic */

    app.get('/logout',function(req,res){
	delete req.session.auth;
     res.redirect("/");
	});
	
/*  logout end    */
	

// help desk function
	 
	 app.get('/help',function(req,res){
     res.render("help");
	 });


	
/*   Handling path /   */
 
    app.get('/',function(req,res){
	 if(req.session.auth){
       res.redirect("/syllabus"); 
	 }else{
    res.render("home");
	 }	});

	 
/*  end      */



	
	app.get('/alogin',function(req,res){
    res.render("alogin");
	});
	 
    
	
/* Path to render page to add Solution */
	
	app.get('/taddsol',function(req,res){
    if(req.session.auth)
	 {

	res.render("addSolution");
	 }
    else{res.redirect("/");}});
    
/*  Path Ends   */ 
    
	
	
/*  Path to handle plain Tutorial     {1} */
	
	app.get('/tplain/:id',function(req,res){
	if(req.session.auth)
	{
    pool.query("select branch,sem from register  where email=$1",[req.session.auth.userMail],function(err,result)
	{  
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{disp1(result.rows[0].branch,result.rows[0].sem,req.params.id,res);
		}
	
       });
	 
	 }
     else{res.redirect("/");}	 
	});

	
/*   END    */
	
	
/*  Path to handle pdf Tutorial */
	
	app.get('/tpdf',function(req,res){
	 if(req.session.auth)
	 {
		   
		   pool.query("select branch,sem from register  where email=$1",[req.session.auth.userMail],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{dispp1(result.rows[0].branch,result.rows[0].sem,res);
		}
	
       });
	 
	 
	 }
       else{res.redirect("/");}	 
	});
	
/*  END    */


/*   Path to handle video tutorial  */

	app.get('/tvideo',function(req,res){
	 if(req.session.auth)
	 {
		   
		   pool.query("select branch,sem from register  where email=$1",[req.session.auth.userMail],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{disppp1(result.rows[0].branch,result.rows[0].sem,res);
		}
	
       });
	 
	 
	 }
      else{res.redirect("/");}	 
	});
	
/*   END    */	
	
	
/*   Path to handle Solution  */

	
	app.get('/tsol',function(req,res){
	 if(req.session.auth)
	 {
		   
		   pool.query("select branch,sem from register  where email=$1",[req.session.auth.userMail],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{dispppp1(result.rows[0].branch,result.rows[0].sem,res);
		}
	
       });
	 
	 
	 }
         else{res.redirect("/");}	 
	});
	
/*   END    */


/*    Path to display syllabus  */


     app.get('/syllabus',function(req,res){
	 if(req.session.auth)
	 {
      pool.query("select branch,sem from register  where email=$1",[req.session.auth.userMail],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{disp(result.rows[0].branch,result.rows[0].sem,res);
		
		}
	
       });
	        
	 }
     else{res.redirect("/");}	 
	 });

/*     End    */

	


/*   Handling path /tutorial   upload content *******************************************************************************************************/


     app.post('/tutorial',multer(multerConf).single('filetoupload'),function(req,res){
     console.log(req.body);
     pool.query("insert into tutorial(subject,topic,branch,sem,pdf,category) values($1,$2,$3,$4,$5,$6);",[req.body.subject,req.body.topic,req.body.branch,req.body.sem,req.body.filetoupload,req.body.Category],function(err,result)
	  {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{res.render("upload",{filename:req.body.filetoupload});}
    });
    });

/*    end      **************************************************************************************************************************************/


     app.post('/addque',function(req,res){

	pool.query("insert into question(subject,branch,sem,description,question,answer,img,email)values($1,$2,$3,$4,$5,$6,$7,$8);",[req.body.subject,req.body.branch,req.body.sem,req.body.description,req.body.question,req.body.solution,req.body.img,req.session.auth.userMail],function(err,result)
	{
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{res.redirect("/tsol");}
   });

   });


    app.post('/alogin',function(req,res){
	var salt=Crypto.randomBytes(128).toString('hex');
	var dbstring=hash(req.body.password,salt);
	

	pool.query("insert into adminuser(name,email,password)values($1,$2,$3);",[req.body.name,req.body.email,dbstring],function(err,result)
	{
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			res.render("admin");}
    });

    });



    function disp(branch,sem,res)
    {
		pool.query("select paper,syllabus from subjects  where sem=$1 and branch=$2",[sem,branch],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{res.render("syllabus",{result:result.rows});
		}
	
       });
}

/*       handling Tutorial    path      {2}  **********************************************************************************************/
        function disp1(branch,sem,category,res)
          { 
		pool.query("select paper from subjects  where sem=$1 and branch=$2",[sem,branch],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			disp2(result.rows,branch,sem,category,res);
			
				}
	
       });
        }
/*   END    ******************************************************************************************************************************/

         function dispp1(branch,sem,res)
       { 
		pool.query("select paper from subjects  where sem=$1 and branch=$2",[sem,branch],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			dispp2(result.rows,branch,sem,res);
			
				}
	
       });
           }
         function disppp1(branch,sem,res)
        { 
		pool.query("select paper from subjects  where sem=$1 and branch=$2",[sem,branch],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			disppp2(result.rows,branch,sem,res);
				}
	
       });
        }



           function dispppp1(branch,sem,res)
        { 
		pool.query("select paper from subjects  where sem=$1 and branch=$2",[sem,branch],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			dispppp2(result.rows,branch,sem,res);
				}
	
       });
       }



       function dispp2(p,branch,sem,res)
       { 
		pool.query("select  link,description,subject from pdf  where sem=$1 and branch=$2 ",[sem,"CSE"],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			res.render("tpdf",{bk:p,pk:result.rows});
		}
	
       });

       }

       function disppp2(p,branch,sem,res)
       { 
		pool.query("select  link,description,subject from video  where sem=$1 and branch=$2",[sem,"CSE"],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			res.render("tvideo",{bk:p,pk:result.rows});
		}
	
       });

      }


        function dispppp2(p,branch,sem,res)
       { 
		pool.query("select  question,description,subject,answer,img from question  where sem=$1 and branch=$2",[sem,"CSE"],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			console.log(result.rows);
			
			for(i in result.rows){
			result.rows[i].answer=result.rows[i].answer.split('$');}
			res.render("tsol",{bk:p,pk:result.rows});
		}
	
       });

      }


/********************************************************************************************************************************************************/
        function disp2(p,branch,sem,category,res)
       { 
		pool.query("select  subject,topic,pdf from tutorial  where sem=$1 and branch=$2 and category=$3",[sem,"CSE",category],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
               console.log(p);
                console.log(result.rows);			   
			res.render("tplain",{bk:p,pk:result.rows,topic:category});
		}
	
       });

     }

/***********************************************************************************************************************************************************/

/*   Handling path /pdf   */
    app.post('/pdf',function(req,res){
	pool.query("insert into pdf(subject,branch,sem,link,description)values($1,$2,$3,$4,$5);",[req.body.subject,req.body.branch,req.body.sem,req.body.link,req.body.description],function(err,result)
	{
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			res.render("admin");}
    });

    });
/*  end      */

/*   Handling path /video   */
app.post('/video',function(req,res){

	
	pool.query("insert into video(subject,branch,sem,link,description)values($1,$2,$3,$4,$5);",[req.body.subject,req.body.branch,req.body.sem,req.body.link,req.body.description],function(err,result)
	{
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{res.render("admin");}
});
});
/*  end      */


/*     Handling request to register at register end point   */
app.post('/register',function(req,res){
	
	var salt=Crypto.randomBytes(128).toString('hex');
	var dbstring=hash(req.body.password,salt);
	
     pool.query("insert into register(name,email,password,universityroll,address,mobileno,branch,sem)values($1,$2,$3,$4,$5,$6,$7,$8);",[req.body.name,req.body.email,dbstring,req.body.universityroll,req.body.address,req.body.mobileno,req.body.branch,req.body.sem],function(err,result)
	{
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			res.render("/");}
});
});



/*    LOG IN TEST(handling request to login at login end point)    */

app.post('/login',function(req,res){
	
	/*   if request is by for USER Login  */
	if(!req.body.login||req.body.login==0)
	{
	pool.query("select *from register  where email=$1",[req.body.email],function(err,result)
	{
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{
			if(result.rows[0]){
			var salt=result.rows[0].password.split('$')[2];
			var hashed=hash(req.body.password,salt);
			
			if(result.rows[0].password==hashed)
			{
				req.session.auth={userMail:result.rows[0].email};
					res.redirect('/syllabus');		             	   
		     }else{
				 res.render("uns");
			}}else{
				 res.render("uns");
			}
		}
	
     });
	}
	
	/*  if request is for Admin Login   */
	else
	{   pool.query("select *from adminuser  where email=$1",[req.body.email],function(err,result)
	   {
		if(err)
		{
			res.status(500).send(err.toString());
		}
		else{ 
			if(result.rows[0]){
		    var salt=result.rows[0].password.split('$')[2];
			var hashed=hash(req.body.password,salt);
			
			if(result.rows[0].password==hashed)
			{
             res.render("admin");
					             	   
		}else{
			res.render("uns");
		}
			}
			else{
				 res.render("uns");
			}
		}
	
       });
		
	}
	
});

/*    LOG IN TEST ENDS      */



app.listen(80); //our app is running on port no 8080
console.log('Server started at port 8080');
