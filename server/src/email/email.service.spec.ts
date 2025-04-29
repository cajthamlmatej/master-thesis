import {ConfigService} from '@nestjs/config';
import {EmailService} from './email.service';
import {EmailTemplate, EmailTemplates} from './email.template';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import mjml2html = require('mjml');

jest.mock('fs');
jest.mock('mjml');
jest.mock('nodemailer');

describe('EmailService', () => {
    let service: EmailService;
    let configService: Partial<ConfigService>;
    let mockTransporter: { sendMail: jest.Mock };

    beforeEach(() => {
        configService = {
            get: jest.fn((key: string) => {
                switch (key) {
                    case 'SMTP_HOST':
                        return 'smtp.example.com';
                    case 'SMTP_PORT':
                        return 465;
                    case 'SMTP_USER':
                        return 'user@example.com';
                    case 'SMTP_PASSWORD':
                        return 'password';
                    case 'SMTP_FROM':
                        return 'Example Sender';
                    case 'FRONTEND_DOMAIN':
                        return 'https://app.example.com';
                    default:
                        return null;
                }
            }),
        };

        mockTransporter = {sendMail: jest.fn().mockResolvedValue(true)};
        (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

        service = new EmailService(configService as ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should throw if required env vars are missing', () => {
            const incompleteConfig = {get: jest.fn().mockReturnValue(null)} as unknown as ConfigService;
            expect(() => new EmailService(incompleteConfig)).toThrow('SMTP_HOST environment variable is not set.');
        });
    });

    describe('sendEmail', () => {
        const dummyContent = '<div>{{name}} - {{code}} - {{link}} - {{FRONTEND_DOMAIN}}</div>';

        it('should send an email with plain HTML when preprocessor is NONE', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(dummyContent);

            const template: EmailTemplate<{ name: string; code: string; link: string }> = {
                subject: 'Test Email',
                filename: 'test.html',
                preprocessor: 'NONE',
            };
            const data = {name: 'Alice', code: '1234', link: 'https://example.com'};

            await service.sendEmail('to@example.com', template, data);

            expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('test.html'));
            expect(fs.readFileSync).toHaveBeenCalled();
            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: '"Example Sender" <user@example.com>',
                to: 'to@example.com',
                subject: 'Test Email',
                html: '<div>Alice - 1234 - https://example.com - https://app.example.com</div>',
            });
        });

        it('should process MJML and send HTML output when preprocessor is MJML', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(dummyContent);
            (mjml2html as jest.Mock).mockReturnValue({html: '<mjml-processed/>'});

            const template = EmailTemplates.AUTHENTICATION_REQUEST;
            const data = {code: '5678', name: 'Bob', link: 'https://verify.example.com'};

            await service.sendEmail('bob@example.com', template, data);

            expect(mjml2html).toHaveBeenCalledWith('<div>Bob - 5678 - https://verify.example.com - https://app.example.com</div>');
            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: '"Example Sender" <user@example.com>',
                to: 'bob@example.com',
                subject: 'Authentication request',
                html: '<mjml-processed/>',
            });
        });

        it('should throw if template file does not exist', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const template: EmailTemplate<{}> = {
                subject: 'Missing',
                filename: 'missing.html',
                preprocessor: 'NONE',
            };

            await expect(
                service.sendEmail('x@example.com', template, {})
            ).rejects.toThrow('Template missing.html not found.');
        });
    });

    describe('replace', () => {
        it('should replace all occurrences of keys in content', () => {
            const content = '{{a}} and {{a}} and {{b}}';
            const result = (service as any).replace(content, {a: 'ONE', b: 'TWO'});
            expect(result).toBe('ONE and ONE and TWO');
        });
    });
});
