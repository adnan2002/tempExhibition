import { Injectable } from '@angular/core';
import {Auth, getAuth, signInWithEmailAndPassword,
createUserWithEmailAndPassword,signOut,sendSignInLinkToEmail,
UserCredential
} from '@angular/fire/auth'
import {collection, addDoc, getDocs, where, query} from '@angular/fire/firestore'
import { AlertController } from '@ionic/angular';
import {Firestore} from '@angular/fire/firestore'
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private alert:AlertController,private auth: Auth, private firestore: Firestore) {}

  async signUp(user:User): Promise<void>{
    try{
      const existingUsers = await this.getExistingUsersByEmail(user.email);
      if(existingUsers.length > 0){
        const alertBox = await this.alert.create({
          header: "Email Already Taken",
          message: "Email has been taken by another user. Use another email",
          buttons: ['Cancel']
        });
         alertBox.present();
         throw new Error('Email already in use');

      }

      const credential = await createUserWithEmailAndPassword(this.auth, user.email,user.password);

      // Add user data to users collection
      await this.addUserToFirestore(credential.user, user);
    }catch(error){
      console.log("Error signing up: ",error);
      throw error;
    }
  }
  // User login
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      // Check if email exists
      const existingUsers = await this.getExistingUsersByEmail(email);
      if (!existingUsers.length) {
        const alertBox = await this.alert.create({
          header: "Email Not Found",
          message: "This email address is not registered",
          buttons: ['Cancel']
        });
        alertBox.present();
        throw new Error('Email not found');
      }
  
      // Check password
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential;
    } catch (error:any) {
      console.error('Error logging in:', error);
      if (error.code === 'auth/invalid-credential') {
        const alertBox = await this.alert.create({
          header: "Incorrect credentials.",
          message: "Email or Password might be incorrect.",
          buttons: ['Cancel']
        });
        alertBox.present();
      }
      throw error;
    }
  }
  
  // User sign out
  async signout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
    // Add user data to users collection
    private async addUserToFirestore(user: any, data: User): Promise<void> {
      const usersRef = collection(this.firestore, 'users');
      await addDoc(usersRef, {
        ...data,
        uid: user.uid,
      });
    }



  // Check if email exists in users collection
  private async getExistingUsersByEmail(email: string): Promise<User[]>{
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc)=> doc.data() as User)
  }
}




export interface User {
  firstName:string,
  lastName:string,
  email:string,
  password:string,
  phone:string,
  userType:string

}
