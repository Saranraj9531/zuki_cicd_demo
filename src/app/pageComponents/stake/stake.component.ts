import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.css']
})
export class StakeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  viewMode = 'tab1';
  showPoolInfo = false;

  togglePoolInfo(){
    this.showPoolInfo = !this.showPoolInfo;
  }
}
