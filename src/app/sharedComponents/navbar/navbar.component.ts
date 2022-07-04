import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MetaMaskService } from 'ng-blockchainx';
import { Router } from '@angular/router';
interface Data {
}
 interface Response {
  status: boolean;
  code: number;
  message: string;
  data: Data | undefined | any;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
/**
 * Navbar component
 */
export class NavbarComponent implements OnInit {
  public showMobileMenu = false;
  public buttonDisabled:boolean;
  public metaMask: any;
  public publicAddress: any;
  ethereum: any;
  public chainId: any;
  public network:any;
  @Input()balance:number;
  @Output() connectedChainId = new EventEmitter<string>();
  @Output() connectedNetworkId = new EventEmitter<string>();
  /**
   * constructor
   */
  constructor(private metaMaskService:MetaMaskService, private router:Router) { }
  /**
 * loaded initially
 */
  ngOnInit(): void {
    this.metaMaskService.connectionListener.subscribe((response: any) => {
      console.log('response from navbar', response);
      this.network = response.data.account;
    });
  }

  /**
 * toggle navbar
 */
  public toggleNavbar() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  /**
   * on connect
   * @param {any}provider
   */
  public onConnectWallet() {
    this.ethereum = window['ethereum'];
    if (typeof this.ethereum !== 'undefined') {
      console.log('metamask installed');
    }
    this.metaMaskService.connectMetaMask()
        .then((response:any) => {
          // DO your success logic here
          console.log(response);
          this.publicAddress = response?.data[0];
          if (this.publicAddress) {
            console.log('connected');
            this.connectedNetworkId.emit(this.publicAddress);
            window.location.reload();
          }
        })
        .catch((error:any) => {
          console.log(error);
          this.buttonDisabled = false;
          // DO your failure logic here
        });
    this.metaMaskService.getChainId()
        .then((response:Response)=> {
          console.log(response);
          this.chainId = response;
          this.connectedChainId.emit(this.chainId);
          console.log('getchain id');
        })
        .catch((error: any) => {
          console.log(error);
        });
  }
/**
 * Disconnect Wallet
 */
  // public disConnectWallet() {
  //   // this.storage.set('auth', '');
  //   window.location.reload();
  // }
}
