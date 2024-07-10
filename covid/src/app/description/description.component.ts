import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-description',
  standalone: true,
  imports: [],
  templateUrl: './description.component.html',
  styleUrl: './description.component.css'
})
export class DescriptionComponent {
  live={lastOringinup:'',refresh:'',summary:{},karnataka:{}}
  constructor(private router:Router){}
  ngOnInit(){
    this.collect_live_updates()
  }
  scrollto(ele){
    let container=document.getElementById('content_des')
    container.scrollTo({
      top:ele.offsetTop-50,
      behavior:'smooth'
    })
  }
  async collect_live_updates(){
    let res=await fetch('https://api.rootnet.in/covid19-in/stats/latest',{method:'GET'})
    let result=await res.json()
    this.live.lastOringinup=result.lastOriginUpdate
    this.live.refresh=result.lastRefreshed
    this.live.summary=result.data.summary
    for(let i of result.data.regional){
      if(i.loc="Karnataka")
        this.live.karnataka=i
    }
  }

}
