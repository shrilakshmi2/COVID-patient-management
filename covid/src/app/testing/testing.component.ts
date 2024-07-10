import { Component } from '@angular/core';

@Component({
  selector: 'app-testing',
  standalone: true,
  imports: [],
  templateUrl: './testing.component.html',
  styleUrl: './testing.component.css'
})
export class TestingComponent {
  reqobj={name:'',email:'',mobile:'',gender:'',adhar:'',address:'',dob:'',test_type:'',date:'',timeslot:''}
  address=''
  ngOnInit(){

  }
  async submit_req(e){
    let btn=e.currentTarget
    btn.disabled =true;
    let inp=document.getElementById('testing_main').getElementsByTagName('input')
    for(let i=0;i<inp.length;i++){
      if(inp[i].type=='text'||inp[i].type=='date'){
        if(inp[i].value==''){
          appendmsg(2,'Missing field')
          inp[i].focus()
          btn.disabled=false
          return
        }
        this.reqobj[inp[i].id]=inp[i].value
      }
      if(inp[i].name=='gender'&&inp[i].checked){
        this.reqobj.gender=inp[i].value
      }
      if(inp[i].name=='test_type'&&inp[i].checked){
        this.reqobj.test_type=inp[i].value
      }
      if(inp[i].name=='time_slot'&&inp[i].checked){
        this.reqobj.timeslot=inp[i].value
      }
    }
    if(!(/^\d{10}$/).test(this.reqobj.mobile)){
      appendmsg(2,'Invalid mobile number')
      btn.disabled=false
      return
    }
    if(!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(this.reqobj.email)){
      appendmsg(2,'Invalid Email address')
      btn.disabled=false
      return
    }
    if(!(/^\d{12}$/).test(this.reqobj.adhar)){
      appendmsg(2,'Invalid adhar number')
      btn.disabled=false
      return
    }
    let date=new Date()
    if(new Date(this.reqobj.date)<date){
      appendmsg(2,'Invalid date')
      return
    }
    if(new Date(this.reqobj.dob)>date){
      appendmsg(2,'Invalid date of birth')
      return
    }
    if(this.reqobj.gender==''){
      appendmsg(2,'Select gender')
      btn.disabled=false
      return
    }
    if(this.reqobj.test_type==''){
      appendmsg(2,'Select test type')
      btn.disabled=false
      return
    }
    if(this.reqobj.timeslot==''){
      appendmsg(2,' Select Time slot')
      btn.disabled=false
      return
    }
    this.reqobj.address=this.address
    let res=await fetch('http://localhost:2400/application_req',{method:'POST',headers:{'Content-Type':'application/json'}
  ,body:JSON.stringify(this.reqobj)})
  let result=await res.json()
  btn.disabled=false
  if(result.status=='adhar_dup'){
    appendmsg(2,'Duplicate adhar number')
    return
  }
  if(result.status!='done'){
    appendmsg(2,'Somthing went wrong')
    return
  }
  appendmsg(1,'application was succesfull')
  this.reset_app()
  }
  reset_app(){
    let inp=document.getElementById('testing_main').getElementsByTagName('input')
    for(let i=0;i<inp.length;i++){
      if(inp[i].type=='text'||inp[i].type=='date')
        inp[i].value=''
      if(inp[i].name=='gender'||inp[i].name=='test_type' ||inp[i].name=='time_slot')
        inp[i].checked=false
    }
  }
}



function appendmsg(mode,msg){
  let master=document.createElement("div") as any;
  master.className='showfloatingmsg'
  master.innerHTML=`<p>${msg}</p>`
  if(mode==1)master.getElementsByTagName('p')[0].style=`    color: rgb(17, 124, 17); background-color: rgb(96, 124, 96);`
  else master.getElementsByTagName('p')[0].style=`background-color:rgb(181, 127, 127);  color: rgb(182, 29, 29);`
  document.body.append(master)
  setTimeout(() => {
    master.remove()
  }, 5000);
}