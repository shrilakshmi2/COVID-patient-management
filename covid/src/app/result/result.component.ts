import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {
  constructor( private router:Router){}
  doc={status:false,data:{}}
  view={status:false,data:{},class:'green'}
  async check_result(val){
    let res=await fetch('http://localhost:2400/check_res',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:val})})
    let result=await res.json()
    console.log(result)
    if(result.status=='id'){
      appendmsg(2,'wrong application ID')
      return
    }
    if(result.status=='under'){
      appendmsg(2,'The results yet to come please wait')
      return
    }
    if(result.status!='done'){
      appendmsg(2,'something went wrong')
      return
    }
    if(result.data.result=='positive')
      this.view.class='red'
    this.view.status=true
    this.view.data=result.data
    
  }
  done(){
    this.view.data={}
    this.view.status=false
  }
  async view_docter(id){
    let res=await fetch('http://localhost:2400/check_res_doc_req',{method:"POST",headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:id})})
    let result=await res.json()
    console.log(result)
    if(result.status!='done'){
      appendmsg(2,'something went wrong')
      return
    }
    this.doc.data=result.data
    this.doc.status=true
  }
  async download(){
    let res=await fetch('http://localhost:2400/check_res_download',{method:"POST",headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:this.view.data['app_id']})})
    let result=await res.json()
    console.log(result)
    if(result.status!='done'){
      appendmsg(2,'the file does not exist')
      return
    }
    this.router.navigate(['downloads',result.data])
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
