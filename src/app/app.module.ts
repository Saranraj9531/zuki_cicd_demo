import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './sharedComponents/navbar/navbar.component';
import { StakeComponent } from './pageComponents/stake/stake.component';
import { PoolCardComponent } from './pageComponents/stake/pool-card/pool-card.component';
import { UnitConversionPipe } from './pipes/unit-conversion.pipe';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    StakeComponent,
    PoolCardComponent,
    UnitConversionPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
/**
 * App Module
 */
export class AppModule { }
