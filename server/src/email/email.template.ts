/**
 * Interface for email templates with data.
 */
export interface EmailTemplate<T> {
    /**
     * The subject of the email.
     */
    subject: string;
    /**
     * The filename of the template.
     */
    filename: string;

    preprocessor: 'NONE' | 'MJML';
}

export class EmailTemplates {
    /**
     * The authentication request template.
     */
    public static AUTHENTICATION_REQUEST = {
        subject: 'Authentication request',
        filename: 'authentication-request.html',
        preprocessor: 'MJML'
    } as EmailTemplate<{
        code: string;
        name: string;
        link: string;
    }>;

    static VERIFY_EMAIL = {
        subject: 'Verify email',
        filename: 'verify-email.html',
        preprocessor: 'MJML'
    } as EmailTemplate<{
        name: string;
        link: string;
    }>;
    
    static PASSWORD_CHANGED = {
        subject: 'Password changed',
        filename: 'password-changed.html',
        preprocessor: 'MJML'
    } as EmailTemplate<{
        name: string;
    }>;

    static DATA_EXPORT_FINISHED = {
        subject: 'Data export finished',
        filename: 'data-export-finished.html',
        preprocessor: 'MJML'
    } as EmailTemplate<{
        name: string;
        date: string;
        link: string;
    }>;
}
