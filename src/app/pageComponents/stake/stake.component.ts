import { Component, OnInit } from '@angular/core';
import { Web3Service } from 'ng-blockchainx';
import { CHAIN_ID_NETWORK } from 'src/app/helpers/app.constant';
import { MetaMaskService } from 'ng-blockchainx';
import * as moment from 'moment';
const contractAbi = require('src/contracts/contract.abi.json');
const tokenContractAbi = require('src/contracts/token-contract.abi.json');
import Web3 from 'web3';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
const web3 = new Web3(window['ethereum'] || 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.css'],
})
/**
 * Stake Class
 */
export class StakeComponent implements OnInit {
  public metaMask: any;
  public publicAddress: string;
  public chainId: string;
  public quantity: any;
  public viewMode = 'tab1';
  public showLive: boolean;
  public stakingData: any;
  public stakingLockupPeriod: any;
  public showPoolInfo = false;
  public isApproveContractShown = false;
  public isConfirmationShown = false;
  public isUploadShown = false;
  public changeNetworkModalShown: boolean = false;
  public isNetworkBSC = false;
  public contract: any;
  public tokenContract: any;
  public balance: any = 0;
  public allowance: any;
  public enteredAmount: any;
  public exceededAmount: any;
  public buttonText: string;
  public buttonType: number; // 1- approve allowance, 2 - buy stake
  public poolLength: number = 0;
  public poolDataLive: Array<any>;
  public poolDataCompleted: Array<any>;
  public chainDetails: Array<any>;
  public contractAddress: string;
  public tokenContractAddress: string;
  public stakeValue: number = 0;
  public currentLPIndex: number = -1;
  public poolName:any;
  public txHash:any;
  public showStakeButton:boolean;
  public showConnectWalletModal:boolean;
  public flag:boolean;

  /**
   * constructor
   */
  constructor(
    private web3Service: Web3Service,
    private metamaskService: MetaMaskService,
    private toastr: ToastrService,
  ) {}
  /**
   * loaded initially
   */
  public ngOnInit() {
    this.showLive = true;
    this.showConnectWalletModal=false;
    this.contractAddress=environment.contractAddress;
    this.tokenContractAddress=environment.tokenContractAddress;
    this.web3Service.setProvider(window['ethereum'] || 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
    this.web3Service.connect();
    this.poolDataLive = [];
    this.poolDataCompleted = [];
    this.chainDetails = CHAIN_ID_NETWORK;
    console.log('tokenContractAbi', tokenContractAbi);
    console.log('this.tokenContractAddress', this.tokenContractAddress);
    this.tokenContract = this.web3Service.getContract(
        tokenContractAbi,
        this.tokenContractAddress,
    );
    this.contract = this.web3Service.getContract(
        contractAbi,
        this.contractAddress,
    );
    console.log(this.contract);
    // this.publicAddress = response.data.account[0];
    // console.log(this.publicAddress);
    this.flag=true;
    // if (this.flag) {
    // debugger;
    // this.flag=!this.flag;
    this.setPoolLength();
    // }
    this.getBalance();
    this.getAllowance();
    this.metamaskService.connectionListener.subscribe(async (response: any) => {
      // debugger;
      console.log(response);
      if (response.code === 250610) {
        window.location.reload();
      }
      this.chainId = await this.metamaskService.getChainId();
      if (this.chainId != '0x1') {
        this.changeNetworkModalShown = true;
        console.log(this.changeNetworkModalShown);
      } else {
        this.changeNetworkModalShown = false;
      }
      if (response.data.chainId != undefined) {
        if (response.data.chainId == '0x1') {
          this.changeNetworkModalShown = false;
        } else {
          // alert(response.data.chainId);
          this.changeNetworkModalShown = true;
        }
      }

      if (response.code == 250601) {
        this.publicAddress = response.data.account[0];
        this.getBalance();
        this.getAllowance();
        this.showStakeButton=true;
        // this.web3Service.setProvider(window['ethereum']);
        // this.web3Service.connect();
        // this.poolDataLive = [];
        // this.poolDataCompleted = [];
        // this.chainDetails = CHAIN_ID_NETWORK;
        // console.log('tokenContractAbi', tokenContractAbi);
        // console.log('this.tokenContractAddress', this.tokenContractAddress);
        // this.tokenContract = this.web3Service.getContract(
        //     tokenContractAbi,
        //     this.tokenContractAddress,
        // );
        // this.contract = this.web3Service.getContract(
        //     contractAbi,
        //     this.contractAddress,
        // );
        // console.log(this.contract);
        // if (this.publicAddress) {
        //   this.publicAddress = response.data.account[0];
        // }
        // this.setPoolLength();
        // this.getBalance();
        // this.getAllowance();
      }
    });
    console.log(this.publicAddress);
    console.log(this.chainId);
    // if (!this.publicAddress) {
    //   this.showConnectWalletModal=true;
    // }
  }


  /**
   * set pool length
   */
  public async setPoolLength() {
    try {
      console.log(this.contract.methods);
      this.poolLength = await this.contract?.methods?.poolLength()?.call();
      console.log(this.poolLength, 'length');

      if (this.poolLength > 0) {
        this.syncPool();
      } else {
        this.isConfirmationShown = false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * get balance
   */
  public async getBalance() {
    this.web3Service.contract = this.tokenContract;
    console.log(this.publicAddress, 'this.publicaddress');
    if (this.publicAddress && this.chainId == '0x1') {
      this.balance = await this.tokenContract.methods
          .balanceOf(this.publicAddress)
          .call();
      console.log(this.balance, 'token balance');
    }
  }

  /**
   * get allowance
   */
  public async getAllowance() {
    if (this.publicAddress && this.chainId == '0x1') {
      this.allowance = await this.tokenContract.methods
          .allowance(this.publicAddress, this.contractAddress)
          .call();
      console.log(this.allowance, 'allowance balance');
    }
  }


  /**
   * calculate excessive allowance
   * @param{HTMLInputElement}f
   */
  public calculateAllowance(f: HTMLInputElement) {
    this.getAllowance();
    console.log(f.value);
    this.stakeValue = Number(f.value);
    this.exceededAmount = ( Number(f.value) ) - ( this.allowance / 1000000000000000000 );
    if (this.exceededAmount > 0) {
      this.buttonText = `Approve ${this.exceededAmount} ZUKI to stake`;
      this.buttonType = 1;
    } else {
      this.buttonText = 'Buy Stake';
      this.buttonType = 2;
    }
  }


  /**
   * sync pool
   */
  public async syncPool() {
    this.isConfirmationShown = true;
    for (let i = 0; i < this.poolLength; i++) {
      console.log(i, 'efnefj');

      const poolInfo = await this.contract.methods.poolInfo(i).call();
      console.log('poolInfoKesav', poolInfo);

      const endTime = poolInfo.endTime;
      const enddate = new Date(0);
      enddate.setUTCSeconds(endTime);
      const endDate = moment(enddate);
      const cur = moment();
      console.log(endDate);
      console.log(cur);
      console.log('hh', this.poolDataLive);

      if (endDate < cur) {
        console.log('yes');
        this.poolDataCompleted?.push({ poolInfo, index: i });
        // this.poolDataCompleted = [...new Set(this.poolDataCompleted)];
      } else {
        console.log('no');
        this.poolDataLive?.push({ poolInfo, index: i });
        // this.poolDataLive = [...new Set(this.poolDataLive)];
      }
      // this.poolDataCompleted = [...new Set(this.poolDataCompleted)];
      // this.poolDataLive = [...new Set(this.poolDataLive)];

      console.log('completed', this.poolDataCompleted);
      console.log(this.poolDataLive);
      this.isConfirmationShown = false;
    }
  }

  /**
   * toggle poool info
   */
  public togglePoolInfo() {
    this.showPoolInfo = !this.showPoolInfo;
  }

  /**
   * open contract modal
   * @param {number} i
   */
  public openContractModal(i: number) {
    this.currentLPIndex = i;
    console.log(this.currentLPIndex);

    this.isApproveContractShown = true;
  }

  /**
   * close contract modal
   */
  public closeContractModal() {
    this.isApproveContractShown = false;
  }

  /**
   * set max function
   */
  public setMax() {
    this.quantity = ( this.balance / 1000000000000000000 );
    this.stakeValue = Number(this.balance);
    this.exceededAmount = ( Number(this.balance) ) - ( this.allowance / 1000000000000000000 );
    if (this.exceededAmount > 0) {
      this.buttonText = `Approve ${this.exceededAmount} ZUKI to stake`;
      this.buttonType = 1;
    } else {
      this.buttonText = 'Buy Stake';
      this.buttonType = 2;
    }
  }
  /**
   * open confirmation
   */
  public async openConfirmation() {
    this.isConfirmationShown = true;
    if (this.buttonType === 1) {
      // alert(this.exceededAmount);
      // const amountInBigNumber = new BigNumber((Number(this.exceededAmount)) * (1000000000000000000));
      const tokens: any = web3.utils.toWei(this.exceededAmount.toString(), 'ether');
      const approve = {
        approveContract: this.contractAddress,
        amount: web3.utils.toBN(tokens),
        toAddress: this.tokenContractAddress,
        address: this.publicAddress,
        chainId: this.chainId,
      };
      console.log(approve, 'approve params');
      this.approve(approve);
    } else {
      const tokens: any = web3.utils.toWei(this.stakeValue.toString(), 'ether');

      const params = {
        chainId: this.chainId,
        address: this.publicAddress,
        amount: web3.utils.toBN(tokens),
      };
      console.log(params, 'params');

      this.stakeToken(params);
    }

    setTimeout(() => {
      // this.isConfirmationShown = false;
      // this.isUploadShown = true;
    }, 1000);
  }

  /**
   *
   * @param {any} params
   */
  public async stakeToken(params: any) {
    // debugger;
    const contract = new web3.eth.Contract(
        contractAbi,
        this.contractAddress,
    );
    console.log(contract);
    const stakeTokensAbi = await contract.methods
        .stakeTokens(this.currentLPIndex, params.amount)
        .encodeABI();
    console.log('stakeTokensAbi', stakeTokensAbi);
    const parameter = {
      method: 'eth_sendTransaction',
      from: web3.utils.toChecksumAddress(params.address),
      to: this.contractAddress,
      data: stakeTokensAbi,
      chainId: params.chainId,
    };
    console.log('parameter', parameter);
    web3.eth
        .sendTransaction(parameter)
        .then((resp: any) => {
          console.log('resp', resp);
          this.txHash = resp.transactionHash;
          this.isConfirmationShown = false;
          this.isUploadShown = true;
        })
        .catch((error: any) => {
          console.log('error', error);
          this.isConfirmationShown = false;
          this.isUploadShown = false;
          this.toastr.error('Transaction Failed');
        });
  }
  /**
 * close connect wallet modal
 */
  public closeConnectModal() {
    this.showConnectWalletModal=false;
  }
  /**
   *
   * @param {any} approve
   */
  public async approve(approve: any) {
    console.dir(web3);
    const tkContract = new web3.eth.Contract(
        tokenContractAbi,
        this.tokenContractAddress,
    );
    const approveAbi = await tkContract.methods
        .increaseAllowance(approve.approveContract, approve.amount)
        .encodeABI();
    const parameter = {
      method: 'eth_sendTransaction',
      from: web3.utils.toChecksumAddress(approve.address),
      to: this.tokenContractAddress,
      data: approveAbi,
      chainId: approve.chainId,
    };
    console.log('parameter', parameter);
    web3.eth
        .sendTransaction(parameter)
        .then((resp: any) => {
          console.log('resp', resp);
          this.isConfirmationShown = false;
          this.isUploadShown = false;
          this.buttonText = 'Buy Stake';
          this.buttonType = 2;
        })
        .catch((error: any) => {
          console.log('error', error);
          this.isConfirmationShown = false;
          this.toastr.error('Transaction Failed');
          // this.isUploadShown = true;
        });
  }

  /**
   * close confirmation
   */
  public closeConfirmation() {
    this.isUploadShown = false;
    window.location.reload();
  }

  /**
   * get network public address
   * @param{string}event
   */
  public getNetworkAddress(event: string) {
    console.log(event);
    this.publicAddress = event;
  }

  /**
   * get connected network chain id
   * @param{string}event
   */
  public getChainId(event: string) {
    console.log('getChainId', event);
    this.chainId = event;
    this.metamaskService.connectionListener.subscribe((response: any) => {
      console.log('response from getchainid', response);
      if (response.code === 250610 && response.data.chainId != '0x1') {
        window.location.reload();
      }
      if (response.code === 250611) {
        window.location.reload();
      }
    });
    if (this.chainId != '0x1') {
      this.changeNetworkModalShown = true;
      console.log(this.changeNetworkModalShown);
    } else {
      this.changeNetworkModalShown = false;
    }
  }

  /**
   * change network
   */
  public changeNetwork() {
    this.metamaskService
        .changeNetwork('0x1')
        .then((response: any) => {
        // DO your success logic here
          console.log('response from changeNetwork', response);
          this.chainId = response;
          this.changeNetworkModalShown = false;
          window.location.reload();
        })
        .catch((error: any) => {
        // DO your failure logic here
          console.log(error);
        });
  }

  /**
   * on toggle between live/completed
   * @param{string}sectionName
   */
  public onToggle(sectionName: string) {
    this.viewMode = sectionName;
    this.viewMode === 'tab1' ? (this.showLive = true) : (this.showLive = false);
    console.log(this.showLive);
  }

  /**
   * incoming modal data
   * @param{any}data
   */
  public incomingModalData(data: any) {
    this.stakingData = data;
    console.log('incoming', this.stakingData);
  }

  /**
   * incoming lockup period data
   * @param{any}data
   */
  public incomingLockupPeriod(data: any) {
    this.stakingLockupPeriod = data;
    console.log('stake lockup period', this.stakingLockupPeriod);
  }
}
