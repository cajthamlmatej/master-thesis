interface InAuthEmailDTO {
    type: 'EMAIL';
    /**
     * The email address of the user.
     */
    email: string;
    /**
     * The code used to authenticate the user.
     */
    code?: string;
    /**
     * The password of the user.
     */
    password?: string
}

interface InAuthEmailPasswordDTO {
    type: 'EMAIL_PASSWORD';
    /**
     * The email address of the user.
     */
    email: string;
    /**
     * The password of the user.
     */
    password: string;
    /**
     * The code used to authenticate the user.
     */
    code?: string;
}

type InAuthDTO = InAuthEmailDTO | InAuthEmailPasswordDTO;

export default InAuthDTO;