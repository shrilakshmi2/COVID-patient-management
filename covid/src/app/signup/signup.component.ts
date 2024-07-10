import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  pass_done={st:false,id:'',pass:''}
  constructor(private router:Router){}
  login(){
    this.router.navigate([''])
    }
    async sign_up_submit(msg){
      let inp=document.getElementById('main').getElementsByTagName('input')
      let detail={first_name:'',add:'',date:'',email:'',ph:'',last_name:'',gen:''}
      for(let i=0;i<inp.length;i++){
        if((inp[i].type=='text' ||inp[i].type=='number')&& inp[i].value==''){
          msg.inneHTML='Missing Field'
          inp[i].focus()
        }
        else{
          detail[inp[i].id]=inp[i].value
        }
        if(inp[i].type=='radio'&&inp[i].checked){
          detail.gen=inp[i].value
        }
      }
      if(detail.gen==''){
        msg.inneHTML="select gender"
      }
      let res=await fetch('http://localhost:2400/sign_up',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(detail)})
    let result=await res.json()
    console.log(result)
    if(result.status!='done'){
      msg.inneHTML='Something went wrong'
      return
    }
    this.pass_done.id=result.data.id
    this.pass_done.pass=result.data.pass
    this.pass_done.st=true
    }
}
