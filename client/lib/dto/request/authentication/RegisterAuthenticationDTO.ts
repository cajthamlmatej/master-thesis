export default interface RegisterAuthenticationDTO {
    /**
     * The name of the user.
     */
    name: string;
    /**
     * The email address of the user.
     */
    email: string;
    /**
     * The password of the user.
     */
    password: string;
}