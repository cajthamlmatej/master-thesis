export default interface UserDTO {
    /**
     * User ID
     */
    id: string;
    /**
     * User name
     */
    name: string;
    /**
     * User email
     */
    email: string;
    /**
     * Is user account activated
     */
    active: boolean;
}