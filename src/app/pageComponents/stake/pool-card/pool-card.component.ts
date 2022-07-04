import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { Web3Service, MetaMaskService } from 'ng-blockchainx';
import { environment } from 'src/environments/environment';
const contractAbi = require('src/contracts/contract.abi.json');
import Web3 from 'web3';

const web3 = new Web3(window['ethereum']);

@Component({
  selector: 'app-pool-card',
  templateUrl: './pool-card.component.html',
  styleUrls: ['./pool-card.component.css'],
})
/**
 * Pool Card Class
 */
export class PoolCardComponent implements OnInit, OnChanges {
  @Input() viewMode = 'tab1';
  @Input() showPoolInfo = false;
  @Input() poolItemLive:any;
  @Input() poolItemCompleted:any;
  @Input() index:number;
  @Input() showLiveData:boolean;
  @Input() userPublicAddress:string;
  @Input() contract:any;
  @Input()showStakeButton:boolean;
  @Output() openModal=new EventEmitter<boolean>();
  @Output() sendModalData=new EventEmitter<any>();
  @Output() sendLockPeriod=new EventEmitter<any>();
  public startDate:any;
  public endDate:any;
  public lockUpPeriod:any;
  public userInfo:any;
  public stakingEndTime:any;
  public isStaking:boolean;
  public isCompleted:boolean;
  public modalData:any;
  public contractAddress: string;
  public isConfirmationShown = false;
  public endOfStakeTime: boolean = false;
  public APR = [6, 8, 10, 12, 14, 16];
  public PR = [2, 3, 3, 4, 4, 5];

  /**
 * constructor
 */
  constructor(private web3Service: Web3Service, public metaMaskService:MetaMaskService) {
    // this.metaMaskService.connectionListener.subscribe((response: any) => {
    //   this.contractAddress=environment.contractAddress;
    //   console.log(this.contractAddress);
    //   this.web3Service.connect();
    //   this.contract = this.web3Service.getContract(
    //       contractAbi,
    //       this.contractAddress,
    //   );
    //   this.userPublicAddress = response?.data?.account[0];
    // });
  }

  /**
   * get to fixed
   */
  getToFixed(value: any) {
    return value.toFixed(2);
  }

  /**
   * onChanges
   * @param{SimpleChanges}changes
   */
  public ngOnChanges(changes: SimpleChanges): void {
    console.log(changes, 'changes');
    this.showLiveData=changes.showLiveData.currentValue;
    if (this.showLiveData) {
      this.modalData = changes['poolItemLive']?.currentValue;
      const time = changes['poolItemLive']?.currentValue.poolInfo.startTime;
      console.log('gg', time);
      const date = new Date(0);
      date.setUTCSeconds(time);
      this.startDate=moment(date).format('DD-MM-YYYY  HH:mm:ss');
      const endTime = changes['poolItemLive']?.currentValue.poolInfo.endTime;
      const enddate = new Date(0);
      enddate.setUTCSeconds(endTime);
      this.endDate=moment(enddate).format('DD-MM-YYYY HH:mm:ss');
      this.lockUpPeriod= moment(enddate).diff(moment(date), 'days');
      this.getUserStakeInfo(this.index);
    } else {
      const time = changes['poolItemCompleted']?.currentValue.poolInfo.startTime;
      const date = new Date(0);
      date.setUTCSeconds(time);
      this.startDate=moment(date).format('DD-MM-YYYY  HH:mm:ss');
      const endTime = changes['poolItemCompleted']?.currentValue.poolInfo.endTime;
      const enddate = new Date(0);
      enddate.setUTCSeconds(endTime);
      this.endDate=moment(enddate).format('DD-MM-YYYY HH:mm:ss');
      this.lockUpPeriod= moment(enddate).diff(moment(date), 'days');
      this.getUserStakeInfo(this.index);
    }
  }

  /**
 * loaded initially
 */
  ngOnInit(): void {
  }

  /**
   * toggle pool info
   */
  public togglePoolInfo() {
    this.showPoolInfo = !this.showPoolInfo;
  }

  /**
   * get user's staking info
   * @param{number}index
   */
  public async getUserStakeInfo(index:number) {
    try {
      console.log(this.userPublicAddress);
      if (this.userPublicAddress) {
        const userInfo = await this.contract.methods.userInfo(index, this.userPublicAddress).call().catch((err: any) => {
          console.log('error on userInfo', err);
        });
        console.log(index, 'userInfo', userInfo);
        this.userInfo=userInfo;
        console.log('user info', this.userInfo);
      }

      const endStakingTime = this.userInfo.stakingEndTime;
      const endStakingDate = new Date(0);
      endStakingDate.setUTCSeconds(endStakingTime);
      this.stakingEndTime =moment(endStakingDate).format('DD-MM-YYYY HH:mm:ss');
      this.isStaking=this.userInfo.isStaking;
      this.endOfStakeTime = this.userInfo.stakingEndTime;
      console.log('stake end time', this.endOfStakeTime);

      console.log('is staking from pool component', this.isStaking);
    } catch (error) {
      console.log('Exception caught', error);
    }
  }

  /**
   * emit value to open stake modal
   */
  public openStakeModal() {
    this.openModal.emit(true);
    this.sendModalData.emit(this.modalData);
    this.sendLockPeriod.emit(this.lockUpPeriod);
    console.log(this.modalData);
  }

  /**
   * claim token
   */
  public async claimToken() {
    this.isConfirmationShown = true;
    if (this.userPublicAddress) {
      web3.eth.defaultAccount = this.userPublicAddress;
    }
    const tkContract = new web3.eth.Contract(
        contractAbi,
        this.contractAddress,
    );
    if (this.userPublicAddress) {
      const receipt = await tkContract.methods.withdrawAll(this.index).send({ from: this.userPublicAddress });
      console.log(receipt);
    }
    this.isConfirmationShown = false;
  }
}
