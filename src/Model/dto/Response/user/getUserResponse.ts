import { User } from '../../../user.model'

export class GetUserResponse {
    id: string;
    name: string;
    email: string;
    age: number;
    profile: {
        id: number;
        code: string;
        name: string;
    };

    constructor(user: User) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.age = user.age;
        this.profile = user.profile;
    }
}