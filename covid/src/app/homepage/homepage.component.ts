import { Component } from '@angular/core';
import { CommonModule,NgIf } from '@angular/common';
import { DescriptionComponent } from '../description/description.component';
import { TestingComponent } from '../testing/testing.component';
import { ResultComponent } from '../result/result.component';
import { LoginComponent } from '../login/login.component';
@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [DescriptionComponent,TestingComponent,ResultComponent,CommonModule,LoginComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'

})
export class HomepageComponent {
  mode={mode:'1',mode_class:{1:'selected_mode',2:'x',3:'x',4:'x'}}
  changemode(m){
    for(let i of Object.keys(this.mode.mode_class))
      this.mode.mode_class[i]='x'
    this.mode.mode=m
    this.mode.mode_class[m]='selected_mode'
  }
  
}
