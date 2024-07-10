import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomepageComponent } from './homepage/homepage.component';
import { AdminpageComponent } from './adminpage/adminpage.component';
import { DownloadComponent } from './download/download.component';

export const routes: Routes = [
    {path:'',component:HomepageComponent},
    {path:'adminpage',component:AdminpageComponent},
    {path:'downloads/:id',component:DownloadComponent}
];
