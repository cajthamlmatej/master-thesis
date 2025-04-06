import {Injectable} from '@nestjs/common';
import * as path from "path";
import * as fs from "fs";
import mjml2html = require('mjml');
import * as nodemailer from "nodemailer";
import {ConfigService} from "@nestjs/config";
import {EmailTemplate} from "./email.template";

@Injectable()
export class EmailService {
    /**
     * The transporter used to send emails.
     */
    private readonly transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        // Validate environment variables.
        this.validateEnvironmentVariables();

        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>("SMTP_HOST"),
            port: this.configService.get<number>("SMTP_PORT"),
            secure: true,
            auth: {
                user: this.configService.get<string>("SMTP_USER"),
                pass: this.configService.get<string>("SMTP_PASSWORD"),
            },
        });
    }

    /**
     * Sends an email.
     * @param to The email address to send the email to.
     * @param template The template to use.
     * @param data The data to use in the template.
     */
    public async sendEmail<T extends Object>(to: string, template: EmailTemplate<T>, data: T) {
        const content = await this.getTemplateContent(template);
        const replacedContent = this.replace(content, data);

        let afterPreprocess = replacedContent;

        if (template.preprocessor === 'MJML') {
            afterPreprocess = mjml2html(replacedContent).html;
        }

        await this.transporter.sendMail({
            from: `"${this.configService.get<string>("SMTP_FROM")}" <${this.configService.get<string>("SMTP_USER")}>`,
            to: to,
            subject: template.subject,
            html: afterPreprocess,
        });
    }

    /**
     * Validates the environment variables for sending emails.
     */
    private validateEnvironmentVariables() {
        if (!this.configService.get<string>("SMTP_HOST")) {
            throw new Error('SMTP_HOST environment variable is not set.');
        }

        if (!this.configService.get<string>("SMTP_PORT")) {
            throw new Error('SMTP_PORT environment variable is not set.');
        }

        if (!this.configService.get<string>("SMTP_PORT")) {
            throw new Error('SMTP_PORT environment variable is not a number.');
        }

        if (!this.configService.get<string>("SMTP_USER")) {
            throw new Error('SMTP_USER environment variable is not set.');
        }

        if (!this.configService.get<string>("SMTP_PASSWORD")) {
            throw new Error('SMTP_PASSWORD environment variable is not set.');
        }
    }

    /**
     * Gets the content of a template.
     * @param template The template to get the content of.
     */
    private async getTemplateContent<T>(template: EmailTemplate<T>) {
        // Get run folder
        const templatePath = path.join('.', 'templates', template.filename);

        return new Promise<string>((resolve, reject) => {
            if (!fs.existsSync(templatePath)) {
                reject(new Error(`Template ${template.filename} not found.`));
            }

            const content = fs.readFileSync(templatePath, 'utf-8');

            resolve(content);
        })
    }

    /**
     * Replaces the placeholders in a template with the data.
     * @param content The content of the template.
     * @param data The data to use in the template.
     */
    private replace<T extends Object>(content: string, data: T) {
        let replaced = content;

        for (const key in data) {
            const value: string = data[key] as string;

            replaced = replaced.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        return replaced;
    }
}
