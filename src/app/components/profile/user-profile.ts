export interface IUser {
  name: string;
  image: string;
}

export class UserProfile {
  name: string;
  image: string;

  constructor({display_name, images}) {
    this.name = display_name;
    this.image = images[0].url;
  }
}
