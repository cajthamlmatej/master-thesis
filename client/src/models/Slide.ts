export default class User {
    /**
     * The ID of the user.
     */
    id: string;
    /**
     * The name of the user.
     */
    name: string;
    /**
     * The email of the user.
     */
    email: string;
    /**
     * Is the user active?
     */
    active: boolean = true;

    constructor(id: string, name: string, email: string, active: boolean = true) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.active = active;
    }

}
