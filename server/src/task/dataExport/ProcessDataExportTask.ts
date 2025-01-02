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

            outputs.push(`user.csv - informace o uživateli
  - vynecháno:
     - hash hesla`);
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

                outputs.push(`authenticationRequest.csv - informace o žádostech o přihlášení`)
            } else {
                globallyIgnored.push('přihlašovací žádosti');
            }
        })();

        jszip.file('README.txt', `EXPORT OSOBNÍCH DAT
Uživatel: ${toProcess.user.name} (e-mail: ${toProcess.user.email}) (id: ${toProcess.user.id})
Datum vytvoření žádosti: ${moment(toProcess.createdAt).format('DD. MM. YYYY HH:mm:ss')}
Datum počátku zpracování: ${moment().format('DD. MM. YYYY HH:mm:ss')}

Poznámky k datům:
   - pokud data obsahují středník (;), je nahrazen za text (semicolon)
   - některé položky mohou používat formátování Markdown, HTML či JSON
   - export neobsahuje data z hostingu (spouštěč kódu, hosting, databáze, ...) protože se jedná o data, která si uživatel může stáhnout sám (např. pomocí FTP, spojení s databází, ...)
        - samotný portál k datům z hostingu neukládá žádná data, pouze je zprostředkovává

Níže se nachází informace o jednotlivých souborech a jejich obsahu.

${outputs.join('\n\n')}

${globallyIgnored.length === 0 ? '' : `
Z tohoto exportu byly vynechány následující položky (neobsahují žádná data):
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