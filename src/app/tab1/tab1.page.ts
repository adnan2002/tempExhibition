import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { User } from '../auth.service';
import {Auth, getAuth} from '@angular/fire/auth';
import { AuthService } from '../auth.service';
import { CrudService } from '../crud.service';
import { Event, Hall } from '../crud.service';
import { UtilityService } from '../utility.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})

export class Tab1Page implements OnInit, OnDestroy {
  user: any;
  private auth: Auth | any;
  userType: string = '';

  events : Event[] = [] as Event[]; // this list will be updated and maintained along with the data
  // we will get from the observable. This will help us when filtering search results of the user.
  eventsCopy : Event[] = [] as Event[]; // this list will be used to store the original data from the observable.
  
  halls : Hall[] = {} as Hall[];
  hallsCopy : Hall[] = {} as Hall[];

  

  constructor(
    private authService: AuthService,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    public crudService : CrudService,
    public alertController : AlertController,
    public utilityService : UtilityService,
    public navController : NavController,
  ) {


  }

  async ngOnInit() {
    this.authService.userLoggedIn.subscribe(async ()=>{
      const loading = await this.loadingController.create({
        message: 'Loading user information...',
      });
      await loading.present();
      try{
        const isLoggedIn = await this.authService.isLoggedIn();
        if(isLoggedIn){
          this.user = await this.authService.getUserData();
          loading.dismiss();
          this.userType = this.user.userType;

                 // loading user's home page data
         if(this.userType == 'client')
            await this.getHalls();
         else if (this.userType == 'attendee')
            await this.getEvents();

        }else{
          loading.dismiss();
          this.navCtrl.navigateForward('/login');
        }
      }catch(err){
        loading.dismiss();
        console.log(err);
      }
    });




  }


  ngOnDestroy(): void {
    // Unsubscribe from the userLoggedIn observable to avoid memory leaks
    this.authService.userLoggedIn.unsubscribe();
  }

  async getEvents(){
    const loading = await this.loadingController.create({
      message: 'Loading Events Information...',
    });
    await loading.present();

    try{
      this.crudService.getDocuments('events').subscribe((events)=>{
        this.events = events as Event[];
        this.eventsCopy = events as Event[];
      
        this.events.forEach(element => {
          element.start_date = this.utilityService.convertFirebaseTimestamp(element.start_date);
          element.end_date = this.utilityService.convertFirebaseTimestamp(element.end_date); 
        });

        // same for the eventsCopy
        this.eventsCopy.forEach(element => {
          element.start_date = this.utilityService.convertFirebaseTimestamp(element.start_date);
          element.end_date = this.utilityService.convertFirebaseTimestamp(element.end_date); 
        });

        console.log(this.events);
        console.log(this.eventsCopy);
        loading.dismiss();
      });
    }catch(err){
      let alert = await this.alertController.create({
        header: 'Error',
        message: 'There was an error loading the events. Please try again later.',
        buttons: ['OK']
      });
      loading.dismiss();
      alert.present();
      console.log(err);
    }
  }

  async getHalls(){
    const loading = await this.loadingController.create({
      message: 'Loading Halls Information...',
    });
    await loading.present();

    try{
      this.crudService.getDocuments('halls').subscribe((halls)=>{
        this.halls = halls as Hall[];
        this.hallsCopy = halls as Hall[];
      
        // this.halls.forEach(element => {
        //   element.start_date = this.utilityService.convertFirebaseTimestamp(element.start_date);
        //   element.end_date = this.utilityService.convertFirebaseTimestamp(element.end_date); 
        // });

        // // same for the eventsCopy
        // this.hallsCopy.forEach(element => {
        //   element.start_date = this.utilityService.convertFirebaseTimestamp(element.start_date);
        //   element.end_date = this.utilityService.convertFirebaseTimestamp(element.end_date); 
        // });

        console.log("Halls:")
        console.log(this.halls);
        loading.dismiss();
      });
    }catch(err){
      let alert = await this.alertController.create({
        header: 'Error',
        message: 'There was an error loading the halls. Please try again later.',
        buttons: ['OK']
      });
      loading.dismiss();
      alert.present();
      console.log(err);
    }
  }

  searchEvents(event: any){
    const searchTerm = event.target.value;
    if(searchTerm == ''){
      this.eventsCopy = this.events;
      return;
    }
    
    if(searchTerm && searchTerm.trim() != ''){
      this.eventsCopy = this.eventsCopy.filter((event)=>{
        return (event.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
      });
    }
  }

  searchHalls(hall: any){
    const searchTerm = hall.target.value;
    if(searchTerm == ''){
      this.hallsCopy = this.halls;
      return;
    }
    
    if(searchTerm && searchTerm.trim() != ''){
      this.hallsCopy = this.hallsCopy.filter((hall)=>{
        return (hall.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
      });
    }
  }
}
