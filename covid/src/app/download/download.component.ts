import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './download.component.html',
  styleUrl: './download.component.css'
})
export class DownloadComponent {
  constructor(private router:Router,private route:ActivatedRoute){}
  fetched=true
  name=''
  back_to_home(){
    this.router.navigate([''])
  }
  async ngOnInit(){
    console.log(this.route.snapshot.params['id'])
    try{
      let res=await fetch('http://localhost:2400/downloads/verify',{method:'POST',headers:{"Content-Type":'application/json'},
      body:JSON.stringify({id:this.route.snapshot.params['id']})})
      let result=await res.json()
      if(result.status!=='done'){
        this.fetched=false
        return
      }
      this.name=result.name
      res=await fetch('http://localhost:2400/downloads/done',{method:'POST',headers:{"Content-Type":'application/json'},
      body:JSON.stringify({id:this.route.snapshot.params['id']})})
      result=await res.blob()
      if(!result){
        this.fetched=false
        return
      }
      let url=URL.createObjectURL(result)
      let a=document.createElement('a')
      a.href=url
      a.download=this.name;
      (a as any).style=`position:absolute;top:-100em`;
      document.body.append(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      this.router.navigate([''])

    }catch(e){this.fetched=false}
  }
}
