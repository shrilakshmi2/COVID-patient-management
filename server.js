const ex=require('express')
const fs=require('fs')
const pup=require('puppeteer')
const date=new Date()
const app=ex()
const http=require('http')
const sever=http.createServer(app)
const cors=require('cors')
const multer=require('multer')
const disk=multer.diskStorage({
  destination:(req,file,cb)=>{
    return cb(null,'./images')
  },
  filename:(req,file,cb)=>{
    return cb(null,file.originalname)
  }
})
const {Server}=require('socket.io')
const io=new Server(sever,{cors:{origin: '*',
methods: ['GET', 'POST'],}})
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };

  const obj_timeslot={1:"8:00-9:00",2:"10:00-11:00",3:"12:00-13:00",4:"15:00-16:00",5:"17:00-18:00",6:"19:00-20:00"}
const body_parser=require('body-parser')
const sql=require("mysql2/promise")
const pool=sql.createPool({
  host:'localhost',
  port:'3306',
  user:'root',
  password:'shri1234',
  database:'covid_management',
})

const imgupload=multer({storage:disk})
const mailer=require('nodemailer')
const util=require('util')
let transport=mailer.createTransport({
  service:'gmail',
  auth:{
    user:'wyldemoon11@gmail.com',
    pass:'fojm pjtn oecv tllp'
  }
})
let mailpromise=util.promisify(transport.sendMail).bind(transport);
app.use(cors(corsOptions))
app.use(ex.urlencoded({extended:true}))
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended:true}))

app.post('/login_req',async(req,res)=>{
  if(req.body.id=='admin'){
    if(req.body.pass!='admin@123'){
      res.json({status:'err'})
      return
    }
    res.json({status:'done',data:1000})
    return
  }
  let result=await querydatabase('select * from crd where id=?',[req.body.id])
  if(result.status=='err'){
    res.json({status:'err'})
      return
  }
  if(result.result.length==0){
    res.json({status:'err'})
      return
  }
  if(result.result[0].pass!=req.body.pass){
    res.json({status:'err'})
    return
  }
  res.json({status:'done',data:1001})
})
app.post("/sign_up",async(req,res)=>{
  console.log(req.body);
  let master=JSON.parse(fs.readFileSync('./ids.txt','utf-8'))
  let id=`id_${master['id']++}`
  fs.writeFileSync('./ids.txt',JSON.stringify(master))
  let pass=`pass_${Date.now()}`
  let result=await querydatabase('insert into patient values(?,?,?,?,?,?,?,?,?)',[
    id,
    JSON.stringify({fname:req.body.first_name,lname:req.body.last_name}),
    req.body.add,
    req.body.date,
    req.body.ph,
    req.body.email,
    req.body.gen,
    JSON.stringify({}),
    JSON.stringify({id:id,pass:pass})
  ])
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  res.json({status:'done',data:{id:id,pass:pass}})
})
app.post('/application_req',async(req,res)=>{
  // let check=await check_availibility(req.body.date,req.body.timeslot)
  // if(!check){
  //   res.json({status:'avail'})
  //   return
  // }
  let master=JSON.parse(fs.readFileSync('./ids.txt','utf-8'))
  let id=++master['id']
  fs.writeFileSync('./ids.txt',JSON.stringify(master))
  let date=new Date(req.body.date)
  let date2=new Date()
  let dob=new Date(req.body.dob)
  let result=await querydatabase('insert into applications values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[
    `application_${id}`,
    req.body.name,
    req.body.adhar,
    req.body.mobile,
    req.body.email,
    req.body.address,
    date.toISOString(),
    obj_timeslot[`${req.body.timeslot}`],
    req.body.test_type,
    date2.toISOString(),
    JSON.stringify({}),
    'applied',
    req.body.gender,
    dob.toISOString()
  ])
  if(result.code==1062){
    res.json({status:'adhar_dup'})
    return
  }
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  // await update_alloc_on(req.body.date,req.body.timeslot)
  let html=`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>
  <body>
      <h3>Application succesfull</h3>
      <p>id:> application_${id}</p>
  </body>
  </html>`
   sendmail(req.body.email,html)
  res.json({status:'done'})
})

app.post('/admin_req',async(req,res)=>{
  let result=await querydatabase('select * from applications where status=?',['applied'])
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  let arr=[]
  let date=new Date()
  for(let i of result.result){
    let date2=new Date(i.time)
    if(date==date2)
      arr.push(i)
  }
  res.json({status:'done',data:result.result})
})

app.post('/admin_req_add_dr',async(req,res)=>{
  let result=await querydatabase('insert into docter values(?,?,?,?)',[
    req.body.name,
    req.body.email,
    req.body.mobile,
    0
  ])
  if(result.status=='err'&&result.code==1062){
    res.json({status:'dup'})
    return
  }
  if(result.status=='err'){
    res.json({status:'err'})
    return
  }
  let pass=`pass${Date.now()}`
  let html=`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>
  <body>
      <h3>Welcome to the hospital</h3>
      <p>id:> ${req.body.email}</p>
      <p>pass:> ${pass}</p>
  </body>
  </html>`

  result=await querydatabase('insert into crd values(?,?,?)',[req.body.email,pass,req.body.name])
  let master=JSON.parse(fs.readFileSync('./docters.txt','utf-8'))
  master['docters'].push(req.body.email)
  fs.writeFileSync('./docters.txt',JSON.stringify(master))
  sendmail
  res.json({status:'done'})
})

app.post('/admin_req_collected',async(req,res)=>{
  let result2=await querydatabase('select status,email,name from applications where app_id=?',[req.body.id])
  if(result2.status=='err'){
    res.json({status:'no'})
    return
  }
  if(result2.result[0].status!='applied'){
    res.json({status:'no'})
    return
  }
  let mail=result2.result[0].email
  let name=result2.result[0].name
  let doc=await allocate_docter(req.body.id)
  let result=await querydatabase('update applications set status=? where app_id=?',['collected',req.body.id])
  let html=`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <h3>Sample collected </h3>
    <p>name: ${name}</p>
    <p>Email: ${mail}</p>
    <p>Application ID: ${req.body.id}</p>
    <h3>Results will be given to you soon :)</h3>
  </body>
  </html>`
  sendmail(mail,html)
  res.json({status:'done'})
})

app.post('/admin_req_search',async(req,res)=>{
  let result=await querydatabase('select * from applications where app_id=?',[req.body.id])
  if(result.status=='err'){
    res.json({status:'err'})
    return
  }
  if(result.result.length==0){
    res.json({status:'no'})
    return
  }
  res.json({status:'done',data:result.result[0]})
})

app.post('/doc_req',async(req,res)=>{
  let result=await querydatabase('select app_id from allloc where doc_id=?',[req.body.id])
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  if(result.result.length==0){
    res.json({status:'done',data:{alloc:[]}})
    return
  }
  res.json({status:'done',data:result.result[0].app_id})
})

app.post('/doc_req_get_patients',async (req,res)=>{
  let result=await querydatabase('select * from applications where app_id=?',[req.body.id])
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  res.json({status:'done',data:result.result[0]})
})

app.post('/doc_req_mark_res',async(req,res)=>{
  let result_test=''
  if(req.body.mode==1)result_test='positive'
  else result_test='negetive'
  let result=await querydatabase('insert into status_test values(?,?,?,?)',[
    req.body.id,
    req.body.mail,
    result_test,
    req.body.doc_id
  ])
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  let html=`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      .positive{
        color: brown;
      }
      .negetive{
        color: green;
      }
    </style>
  </head>
  <body>
    <h3>Results are here!!</h3>
    <p>Application ID: ${req.body.id}</p>
    <p class="${result_test}">Result: ${result_test}</p>
    <a href="http://localhost:4200">more details</a>
  </body>
  </html>`
   sendmail(req.body.mail,html)
  result=await querydatabase('update docter set total=total+1 where email=?',[req.body.doc_id])
  result=await querydatabase('select app_id from allloc where doc_id=?',[req.body.doc_id])
  let new_obj=result.result[0].app_id
  new_obj['alloc'].splice(new_obj['alloc'].indexOf(req.body.id),1)
  result=await querydatabase('update allloc set app_id=? where doc_id=?',[JSON.stringify(new_obj),req.body.doc_id])
  result=await querydatabase('update applications set status=? where app_id=?',['done',req.body.id])
  await genpdf(req.body.id,req.body.doc_id)
  res.json({status:'done'})
})

app.post('/check_res',async(req,res)=>{
  let result=await querydatabase('select applied_time,app_id,name,mobile,email,adhar,gender,status from applications where app_id=?',[req.body.id])
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  if(result.result.length==0){
    res.json({status:'id'})
    return
  }
  if(result.result[0].status!='done'){
    res.json({status:'under'})
    return
  }
  let obj=result.result[0]
  result=await querydatabase('select doc_id,result from status_test where app_id=?',[req.body.id])
  obj['doc_id']=result.result[0].doc_id
  obj['result']=result.result[0].result
  res.json({status:'done',data:obj})
})

app.post('/check_res_doc_req',async (req,res)=>{
  let result=await querydatabase('select * from docter where email=?',[req.body.id])
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  res.json({status:'done',data:result.result[0]})
})

app.post('/downloads/verify',(req,res)=>{
  let master=JSON.parse(fs.readFileSync('./pdfs/links.txt','utf-8'))
  if(!master.hasOwnProperty(req.body.id)){
    res.json({status:'none'})
    return
  }
  res.json({status:'done',name:master[req.body.id]['name']})

})
app.post('/downloads/done',(req,res)=>{
  let master=JSON.parse(fs.readFileSync('./pdfs/links.txt','utf-8'))
  if(!master.hasOwnProperty(req.body.id)){
    res.json({status:'none'})
    return
  }
  res.sendFile(__dirname+master[req.body.id]['path'])
})

app.post('/check_res_download',(req,res)=>{
  let master=JSON.parse(fs.readFileSync('./pdfs/links.txt','utf-8'))
  for(let i of Object.keys(master)){
    if(master[i].name.includes(req.body.id)){
      res.json({status:'done',data:i})
      return
    }
  }
  res.json({status:'unable'})
})

app.post('/remove_doc',async(req,res)=>{
  let result=await querydatabase('select id from crd where id=?',[req.body.id])
  if(result.result.length==0){
    res.json({status:'unable'})
    return
  }
  result=await querydatabase('select * from allloc where doc_id=?',[req.body.id])
  console.log(result.result)
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  let master=JSON.parse(fs.readFileSync('./docters.txt','utf-8'))
  master['cur']=0
  master['docters'].splice(master['docters'].indexOf(req.body.id),1)
  fs.writeFileSync('./docters.txt',JSON.stringify(master))
  if(result.result.length!=0){
    let alloc=result.result[0].app_id['alloc']
    for(let i of alloc){
      allocate_docter(i)
    }
    result=await querydatabase('delete from allloc where doc_id=?',[req.body.id])
  }
  result=await querydatabase('delete from crd where id=?',[req.body.id])
  result=await querydatabase('delete from docter where email=?',[req.body.id])
  res.json({status:'done'})
})

app.post('/update_req_doc',async(req,res)=>{
  let result=await querydatabase('select * from applications where app_id=?',[req.body.id])
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  if(result.result.length==0){
    res.json({status:'unable'})
    return
  }
  res.json({status:'done',data:result.result[0]})
})

app.post('/update_req_doc_update',async(req,res)=>{
  console.log(req.body)
  let result_test=''
  if(req.body.mode==1)result_test='positive'
  else result_test='negetive'
  let result=await querydatabase('update status_test set result=? where app_id=?',[result_test,req.body.id])
  if(result.status=='err'){
    res.json({status:'unable'})
    return
  }
  await genpdf(req.body.id,req.body.doc_id)
  res.json({status:'done'})
})

app.listen(2400,()=>{})

async function querydatabase(query,params){
    let connection
    try{
       connection=await pool.getConnection()
    }
    catch(err){
      console.log(err)
    }
    if(!connection){
      console.log(connection)
      return {status:'err',code:'connection'}
    }
    try{
      let [results,fields]=await connection.query(query,params)
      connection.release()
      return {status:'ok',result:results}
    }
    catch(err){
      console.log(err)
      return {status:'err',code:err.errno||'unknown'}
    }
  }

  async function sendmail(id,msg){
    try{
      let mail= await mailpromise({
        from:'wyldemoon11@gmail.com',
        to:id,
        subject:'covid_test management',
        html:msg
      })
      return 'okayy'
    }
    catch(err){
      return 'err'
    }
  }

async function check_availibility(date,timeslot){
  let date1=new Date(date)
  let result=await querydatabase('select * from applications_on where date=? and timeslot=?',[date1.toISOString(),timeslot])
  if(result.result.length==0)return true
  if(result.result[0].alloc>10)return false
  return true
}

async function update_alloc_on(date,timeslot){
  let date1=new Date(date)
  let result=await querydatabase('select * from applications_on where date=? and timeslot=?',[date1.toISOString(),timeslot])
  if(result.result.length==0){
    let res=await querydatabase('insert into applications_on values(?,?,?)',[date1.toISOString(),1,timeslot])
    return
  }
  let res=await querydatabase('update applications_on set alloc=alloc+1 where date=? and timeslot=?',[date1.toISOString(),timeslot])

}

async function allocate_docter(id){
  let master=JSON.parse(fs.readFileSync('./docters.txt','utf-8'))
  let mail=master['docters'][master['cur']]
  if(master['cur']==master['docters'].length-1)
    master['cur']=0
  else
    master['cur']++
  fs.writeFileSync('./docters.txt',JSON.stringify(master))
  let result=await querydatabase('select * from allloc where doc_id=?',[mail])
  if(result.result.length==0){
    let res=await querydatabase('insert into allloc values(?,?)',[mail,JSON.stringify({alloc:[id]})])
    return mail
  }
  let res=await querydatabase('update allloc set app_id=JSON_ARRAY_APPEND(app_id,"$.alloc",?) where doc_id=?',[id,mail])
  return mail
}

async function genpdf(app_id,doc_id){
  let result=await querydatabase('select * from applications a,status_test s where a.app_id=s.app_id and a.app_id=?;',[app_id])
  if(result.result.length==0)return false
  let person=result.result[0]
  result=await querydatabase('select * from docter where email=?',[doc_id])
  let doc=result.result[0]
  const brow=await pup.launch()
    const page=await brow.newPage()
    await page.setViewport({width:800,height:850})
    let img=fs.readFileSync('./assets/covid.jpg').toString('base64')
    let img_src=`data:image/png;base64,${img}`
    let sign=fs.readFileSync('./assets/PngItem_5183368.png').toString('base64')
    let sign_src=`data:image/png;base64,${sign}`
    let date=new Date()
    await page.setContent(`
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            body{
                display: grid;
                place-items: center;
            }
            #main{
                height: 850px;
                width: 800px;
                box-shadow: 0px 0px 20px 10px rgba(0, 0, 0, 0.2);
            }
            #message{
              height: 30px;
              margin-top: 10px;
              margin-left: 10px;
              display: grid;
              place-items: center;
              font-weight: bold;
              font-size: 20px;
            }
            .header{
                background-color: cadetblue;
                height: 140px;
                width: 100%;
                display: grid;
                place-items: center;
            }
            .header img{
                height: 70px;
                margin-top: 10px;
            }
            #table{
                border: 2px solid rgba(0, 0, 0, 0.577);
                border-radius: 5px;
                margin: 10px;
            }
            #Content h3{
                height: 30px;
                margin-top: 20px;
                display: grid;
                place-items: center;
            }
            #table div{
                display: flex;
            }
            .main_div{
                border-bottom: 1px solid black;
            }
            .main_div p{
                margin-left: 10px;
            }
            .attr{
                font-weight: bold;
            }
            .value{
              
            }
            .sub_div{
                width: 50%;
                border-left: 1px solid black;
            }
            #positive{
                color: brown;
                font-size: 18px;
            }
            #negetive{
              color:green;
              font-size: 18px;
            }
            #signature{
                display: grid;
                width: 100%;
                grid-template-columns: 1fr 200px;
            }
            #signature div{
                grid-column-start: 2;
                display: grid;
                place-items: center;
            }
            #signature img{
                height: 50px;
            }
        </style>
    </head>
    <body>
        <div id="main">
            <div class="header">
               <div>
                <img src="${img_src}" alt="">
               </div>
               <h2>Covid-19 Hospital Management</h2>
            </div>
            <div id="Content">
                <h3>Test Results</h3>
                <div id="table">
                    <div class="main_div">
                        <div class="sub_div">
                            <p class="attr">Name::</p>
                            <p class="value">${person.name}</p>
                        </div>
                        <div class="sub_div">
                            <p class="attr">Gender::</p>
                            <p class="value">${person.gender}</p>
                        </div>
                    </div>
                    <div class="main_div">
                        <div class="sub_div">
                            <p class="attr">Mobile::</p>
                            <p class="value">${person.mobile}</p>
                        </div>
                        <div class="sub_div">
                            <p class="attr">E-mail::</p>
                            <p class="value">${person.email}</p>
                        </div>
                    </div>
                    <div class="main_div">
                        <p class="attr">Adhaar::</p>
                        <p class="value">${person.adhar}</p>
                    </div>
                    <div class="main_div">
                        <p class="attr">Address::</p>
                        <p class="value">${person.address}</p>
                    </div>
                    <div class="main_div">
                        <div class="sub_div">
                            <p class="attr">Application ID::</p>
                            <p class="value">${person.app_id}</p>
                        </div>
                        <div class="sub_div">
                            <p class="attr">D.O.B::</p>
                            <p class="value">${person.dob}</p>
                        </div>
                    </div>
                    <div class="main_div">
                        <div class="sub_div">
                            <p class="attr">Applied on::</p>
                            <p class="value">${person.applied_time}</p>
                        </div>
                        <div class="sub_div">
                            <p class="attr">Sample on::</p>
                            <p class="value">${person.time}</p>
                        </div>
                    </div>
                    <div class="main_div">
                        <div class="sub_div">
                            <p class="attr">Test-Type::</p>
                            <p class="value">${person.test_type}</p>
                        </div>
                        <div class="sub_div">
                            <p class="attr">Tested date::</p>
                            <p class="value">${date.toISOString()}</p>
                        </div>
                    </div>
                    <div class="main_div">
                        <div class="sub_div">
                            <p class="attr">Tested By::</p>
                            <p class="value">${doc.name}</p>
                        </div>
                        <div class="sub_div">
                            <p class="attr">Doctor-email::</p>
                            <p class="value">${doc.email}</p>
                        </div>
                    </div>
                    <div class="main_div">
                        <p class="attr">Result::</p>
                        <p class="value" id="${person.result}">${person.result}</p>
                    </div>
                </div>
                <p id="message">This is a computer generated report no need verify.</p>
                <div id="signature">
                    <div>
                        <img src="${sign_src}" alt="">
                        <p>Head</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>`)
    await page.setJavaScriptEnabled(false)
    await page.emulateMediaFeatures([])
    await page.pdf({
        path:`./pdfs/${app_id}.pdf`,
        printBackground:true
    })
    await brow.close()
    let x=Date.now()
    let master=JSON.parse(fs.readFileSync('./pdfs/links.txt','utf-8'))
    master[x]={path:`/pdfs/${app_id}.pdf`,name:`${app_id}.pdf`}
    let link=`http://localhost:4200/downloads/${x}`
    fs.writeFileSync('./pdfs/links.txt',JSON.stringify(master))
    let html=`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      .positive{
        color: brown;
      }
      .negetive{
        color: green;
      }
    </style>
  </head>
  <body>
    <h3>Results are here!!</h3>
    <p>Application ID: ${person.app_id}</p>
    <p class="${person.result}">Result: ${person.result}</p>
    <a href="${link}">Download here</a>
  </body>
  </html>`
   sendmail(person.email,html)
}
// genpdf('application_8','jhguy@gmail.com')
