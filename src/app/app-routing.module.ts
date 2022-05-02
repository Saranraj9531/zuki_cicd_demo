import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StakeComponent } from './pageComponents/stake/stake.component';
import { NavbarComponent } from './sharedComponents/navbar/navbar.component';

const routes: Routes = [
  {path:'navbar', component:NavbarComponent},
  {path:'', component:StakeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
