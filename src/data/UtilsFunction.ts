export interface MessageUser {
    username: string;
    encryptedMessage: string;
  }
  
export interface UserKey{
    username: string;
    publicKey: string;
}


export interface RoomStatut{
  room: string;
  status: boolean;
}
