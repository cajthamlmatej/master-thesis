import {Inject, Service} from "typedi";
import {Task} from "../Task";
import DataExportRepository from "../../database/repository/DataExportRepository";
import JSZip from "jszip";
import moment from "moment";
import fs from "fs";
import {arrayToCsv, objectToCsv} from "../../utils/Csv";
import AuthenticationRequestRepository from "../../database/repository/AuthenticationRequestRepository";
import EmailService from "../../email/EmailService";
import EmailTemplates from "../../email/EmailTemplates";

@Service()
export class ProcessDataExportTask implements Task {
    readonly id = "ProcessDataExportTask";
    readonly caller = "AUTOMATIC";
    readonly interval = 1000 * 60 * 15 * 1;

    constructor(
        @Inject(() => DataExportRepository) private readonly dataExportRepository: DataExportRepository,
        @Inject(() => AuthenticationRequestRepository) private readonly authenticationRequestRepository: AuthenticationRequestRepository,
        @Inject(() => EmailService) private readonly emailService: EmailService,
    ) {
    }

    async run() {
        // Are there any data exports that are not processed yet?
        const dataExports = await this.dataExportRepository.toBeProcessed();

        if (dataExports.length === 0) return;

        const toProcess = dataExports[0];

        // TODO
        // Was created in less than 1 hour ago, wait for it to be processed
        // if (toProcess.createdAt.getTime() > (new Date().getTime() - 1000 * 60 * 60 * 1)) return;

        console.log(`Processing data export ${toProcess.id}... for user ${toProcess.user.name}`);

        const outputs: string[] = [];
        const globallyIgnored: string[] = [];

        const jszip = new JSZip();

        await (async () => {
            jszip.file('user.csv', objectToCsv({
                id: toProcess.user.id,
                name: toProcess.user.name,
                email: toProcess.user.email,
                active: toProcess.user.active,
                lastPasswordChange: moment(toProcess.user.lastPasswordChange).toISOString(),
            }, true));

            outputs.push(`user.csv - information about the user
  - excluded:
     - password hash`);
        })();

        await (async () => {
            const authenticationRequests = await this.authenticationRequestRepository.getForUser(toProcess.user.id);

            if (authenticationRequests.length > 0) {
                jszip.file('authenticationRequest.csv', arrayToCsv(authenticationRequests.map((ar) => ({
                    id: ar.id,
                    code: ar.code,
                    expiresAt: moment(ar.expiresAt).toISOString(),
                    used: ar.used,
                }) as any), true));

                outputs.push(`authenticationRequest.csv - information about authentication requests`);
            } else {
                globallyIgnored.push('authentication requests');
            }
        })();

        jszip.file('README.txt', `EXPORT OF PERSONAL DATA
User: ${toProcess.user.name} (e-mail: ${toProcess.user.email}) (id: ${toProcess.user.id})
Created at: ${moment(toProcess.createdAt).format('DD. MM. YYYY HH:mm:ss')}
Processed at: ${moment().format('DD. MM. YYYY HH:mm:ss')}

Facts about this export:
   - if data contains semicolon (;), it is replaced by text (semicolon)
   - some items may use Markdown, HTML or JSON formatting

See below for information about each file and its contents.

${outputs.join('\n\n')}

${globallyIgnored.length === 0 ? '' : `
The following items have been omitted from this export (they do not contain any data):
   - ${globallyIgnored.join('\n   - ')} `}
`);

            const saveFile = async () => {
                const zip = await jszip.generateAsync({type: 'nodebuffer'});
                const zipPath = `storage/data-exports/${toProcess.user.id}-${toProcess.id}.zip`;

                fs.mkdirSync('storage/data-exports/', {recursive: true});
                fs.writeFileSync(zipPath, zip);

                // TODO: somehow save the file to the database
            };

            const createdFile = await saveFile();

            await this.dataExportRepository.update(toProcess.id, {
                status: 'FINISHED',
                finishedAt: new Date()
            });


            await this.emailService.sendEmail(toProcess.user.email, EmailTemplates.DATA_EXPORT_FINISHED, {
                name: toProcess.user.name,
                link: `${process.env.FRONTEND_DOMAIN}/user/settings`,
                date: moment(toProcess.createdAt).format('DD. MM. YYYY HH:mm:ss'),
            });

            console.log(`Data export ${toProcess.id} processed.`);
        }
    }