import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private router:Router){}
  async login_done(name,pass){
    if(name==''|| pass=='')return
    let res=await fetch('http://localhost:2400/login_req',{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({id:name,pass:pass})})
  let result=await res.json()
  if(result.status!='done'){
    appendmsg(2,'Invalid credentials')
    return
  }
  if(result.data==1000){
    this.router.navigate(['adminpage'],{state:{data:true,mode:1000}})
    return
  }
  this.router.navigate(['adminpage'],{state:{data:true,mode:1001,id:name}})
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