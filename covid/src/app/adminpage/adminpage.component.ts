import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-adminpage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adminpage.component.html',
  styleUrl: './adminpage.component.css'
})
export class AdminpageComponent {
  main_mode=0
  collector={items:[],view:false,view_item:{},main_items:[],mode:'1',class:{'1':'selected',2:'x',3:'x',4:'x'}}
  fetched=false
  theid=''
  docter={items:[],view:false,view_item:{},main_items:[],mode:'1',class:{'1':'selected',2:'x',3:'x',4:'x'},unable:[]}
  update={status:false,item:{}}
  constructor(private route:ActivatedRoute,private router:Router){}
  ngOnInit(){
    if(window.history.state.data){
      if(window.history.state.mode==1000){this.main_mode=1000;this.loadresources1()}
      else {this.main_mode=1001;this.theid=window.history.state.id;this.loadresources2()}
      return
    }
    this.router.navigate(['admin'])
  }

  back_to_home(){
    this.router.navigate([''])
  }
  async loadresources1(){
    //loadingscreen
    let res=await fetch('http://localhost:2400/admin_req',{method:"POST"})
    let result=await res.json()
    console.log(result.data)
    if(result.status!='done'){
      return
    }
    this.fetched=true
    this.collector.items=result.data
    this.collector.main_items=result.data
  }

  async search_fetch(val){
    if(val=='')return
    let res=await fetch('http://localhost:2400/admin_req_search',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:val})})
    let result=await res.json()
    if(result.status=='err'){
      appendmsg(2,'Somthing went wrong')
      return
    }
    if(result.status=='no'){
      appendmsg(2,'Invalid application ID')
      return
    }
    this.collector.view_item=result.data
    this.collector.view=true
  }


  async loadresources2(){
    let res=await fetch('http://localhost:2400/doc_req',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:this.theid})})
    let result=await res.json()
    console.log(result.data)
    if(result.status!='done'){
      return
    }
    this.fetched=true
    for(let i of result.data.alloc){
      await this.getpatiensts(i)
    }
    console.log(this.docter.items)
  }
  async getpatiensts(id){
    let res=await fetch('http://localhost:2400/doc_req_get_patients',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:id})})
    let result=await res.json()
    if(result.status!='done'){
      this.docter.unable.push(id)
      return
    }
    this.docter.main_items.push(result.data)
    this.docter.items.push(result.data)
  }

  chage_docter_mode(m){
    for(let i of Object.keys(this.docter.class))
      this.docter.class[i]='x'
    this.docter.class[m]='selected'
    this.docter.mode=m
  }
  view(i){
    this.collector.view_item=i
    this.collector.view=true
  }
  doc_view(i){
    this.docter.view_item=i
    this.docter.view=true
  }
  doc_view_reset(){
    this.docter.view_item={}
    this.docter.view=false
  }
  view_reset(){
    this.collector.view=false
    this.collector.view_item={}
  }
  chage_collecter_mode(m){
    for(let i of Object.keys(this.collector.class))
      this.collector.class[i]='x'
    this.collector.class[m]='selected'
    this.collector.mode=m
  }
  collecter_search(val:string){
    if(val=='')return
    let arr=[]
    for(let i of this.collector.items){
      if(this.collector.mode=='1'){
        if(i.app_id.toLowerCase().includes(val.toLowerCase()))
          arr.push(i)
      }
      if(this.collector.mode=='2'){
        if(i.name.toLowerCase().includes(val.toLowerCase()))
          arr.push(i)
      }
      if(this.collector.mode=='3'){
        if(i.mobile.toLowerCase().includes(val.toLowerCase()))
          arr.push(i)
      }
      if(this.collector.mode=='4'){
        if(i.email.toLowerCase().includes(val.toLowerCase()))
          arr.push(i)
      }
    }
    if(arr.length==0){
      appendmsg(2,'no such entries')
      return
    }
    this.collector.items=arr
  }
  doc_search(val){
    if(val=='')return
    let arr=[]
    for(let i of this.docter.items){
      if(this.docter.mode=='1'){
        if(i.app_id.toLowerCase().includes(val.toLowerCase()))
          arr.push(i)
      }
      if(this.docter.mode=='2'){
        if(i.name.toLowerCase().includes(val.toLowerCase()))
          arr.push(i)
      }
      if(this.docter.mode=='3'){
        if(i.mobile.toLowerCase().includes(val.toLowerCase()))
          arr.push(i)
      }
      if(this.docter.mode=='4'){
        if(i.email.toLowerCase().includes(val.toLowerCase()))
          arr.push(i)
      }
    }
    if(arr.length==0){
      appendmsg(2,'no such entries')
      return
    }
    this.docter.items=arr
  }
  doc_reset(){
    this.docter.items=this.docter.main_items
  }
  collecter_reset(){
    this.collector.items=this.collector.main_items
  }


  async mark_collected(id){
    let res=await fetch('http://localhost:2400/admin_req_collected',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:id})})
    let result=await res.json()
    if(result.status!='done'){
      appendmsg(2,'something went wrong')
      return
    }
    appendmsg(1,'collected ')
    for(let i=0;i<this.collector.main_items.length;i++)
      if(this.collector.main_items[i].app_id==id){
        this.collector.main_items.splice(i,1)
      }
    this.collecter_reset()
    this.view_reset()
  }


  async add_docter(name,mobile,email){
    if(name==''||mobile==''||email=="")return
    let res=await fetch('http://localhost:2400/admin_req_add_dr',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:email,mobile:mobile,name:name})})
    let result=await res.json()
    if(result.status=='dup'){
      appendmsg(2,'Email already exists')
      return
    }
    if(result.status=='err'){
      appendmsg(2,'Somthing went wrong')
      return
    }
    appendmsg(1,'Docter added succesfully')
  }

  async mark_result(id,m,mail){
    let res=await fetch('http://localhost:2400/doc_req_mark_res',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:id,mode:m,mail:mail,doc_id:this.theid})})
    let result=await res.json()
    console.log(result)
    if(result.status!='done'){
      appendmsg(2,'something went wrong')
      return
    }
    appendmsg(1,'Updated successfully')
    for(let i=0;i<this.docter.main_items.length;i++)
      if(this.docter.main_items[i].app_id==id){
        this.docter.main_items.splice(i,1)
      }
    this.doc_view_reset()
    this.doc_reset()
  }
  async removedoc(id){
    if(id=='')return
    let res=await fetch('http://localhost:2400/remove_doc',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:id})})
    let result=await res.json()
    console.log(result)
    if(result.status!='done'){
      appendmsg(2,"Failed to remove the docter")
      return
    }
    appendmsg(1,"Removed Successfully")
  }
  gettimeslot(slot){
    if(slot.length>1)return slot
    let obj={1:"8:00-9:00",2:"10:00-11:00",3:"12:00-13:00",4:"15:00-16:00",5:"17:00-18:00",6:"19:00-20:00"}
    return obj[slot]
  }
  async update_req(id){
    if(id=='')return
    let res=await fetch('http://localhost:2400/update_req_doc',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:id})})
    let result=await res.json()
    if(result.status!='done'){
      appendmsg(2,'invalid ID')
      return
    }
    this.update.item=result.data
    this.update.status=true
  }
  async update_result(id,mode,email){
    let res=await fetch('http://localhost:2400/update_req_doc_update',{method:"POST",headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:id,mode:mode,mail:email,doc_id:this.theid})})
    let result=await res.json()
    console.log(result)
    if(result.status!='done'){
      appendmsg(2,"Failed to update")
      return
    }
    appendmsg(1,"Updated Successfully")
    this.update_view_reset()
  }
  update_view_reset(){
    this.update.status=false
    this.update.item={}
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