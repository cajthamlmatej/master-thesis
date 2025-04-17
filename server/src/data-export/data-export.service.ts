import {Injectable} from '@nestjs/common';
import {HydratedDocument, Model} from "mongoose";
import {User} from "../users/user.schema";
import {InjectModel} from "@nestjs/mongoose";
import {DataExport} from "./data-export.schema";
import * as fs from "fs";
import * as JSZip from "jszip";
import {MediaService} from "../media/media.service";
import {AuthService} from "../auth/auth.service";
import {PluginService} from "../plugin/plugin.service";
import {PreferencesService} from "../preferences/preferences.service";
import {MaterialsService} from "../materials/materials.service";
import {EmailService} from "../email/email.service";
import {EmailTemplates} from "../email/email.template";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class DataExportService {
    constructor(@InjectModel(DataExport.name) private dataExportModel: Model<DataExport>,
                private mediaService: MediaService,
                private authService: AuthService,
                private pluginService: PluginService,
                private preferencesService: PreferencesService,
                private materialService: MaterialsService,
                private emailService: EmailService,
                private configService: ConfigService) {
        setInterval(() => {
            this.process();
        }, 1000 * 60 * 5);
        setInterval(() => {
            this.removeExpired();
        }, 1000 * 60 * 60);
    }

    async removeExpired() {
        const dataExports = await this.dataExportModel.find({
            expiresAt: {
                $lt: new Date()
            }
        });

        for(const dataExport of dataExports) {
            try {
                fs.rmSync(this.getPath(dataExport), {recursive: true});
            } catch (e) {
                console.error("Error removing data export", e);
            }

            await dataExport.deleteOne();
        }
    }

    async process() {
        const dataExport = await this.dataExportModel.findOne({
            completedAt: {$exists: false},
            expiresAt: {$exists: false}
        }).populate("user");

        if(!dataExport) {
            return;
        }

        console.log("Processing data export for user", ((dataExport.user) as HydratedDocument<User>).id);

        {
            const folder = `./temp/data-export/${((dataExport.user) as HydratedDocument<User>).id}`;
            fs.mkdirSync(folder, {recursive: true});

            const zip = new JSZip();

            {
                const media = await this.mediaService.findAllForUser(dataExport.user as HydratedDocument<User>);
                const folder = zip.folder("media");

                if(!folder) return;

                for(const file of media) {
                    const data = fs.readFileSync(file.path);

                    folder.file(file.path, data);
                }
            }

            {
                const authenticationRequest = await this.authService.getAllRequests(dataExport.user as HydratedDocument<User>);

                zip.file("authentication.json", JSON.stringify(authenticationRequest));
            }

            {
                const plugins = await this.pluginService.getAllForUser(dataExport.user as HydratedDocument<User>);

                zip.file("plugins.json", JSON.stringify(plugins));
            }

            {
                const preferences = await this.preferencesService.findForUser(dataExport.user as HydratedDocument<User>);

                zip.file("preferences.json", JSON.stringify(preferences));
            }

            {
                const materials = await this.materialService.findAllForUser(dataExport.user as HydratedDocument<User>);

                zip.file("materials.json", JSON.stringify(materials));
            }

            zip.file("user.json", JSON.stringify({
                name: dataExport.user.name,
                email: dataExport.user.email,
                active: dataExport.user.active,
                lastPasswordChange: dataExport.user.lastPasswordChange,
                token: dataExport.user.token,
            }));

            const content = await zip.generateAsync({type: "nodebuffer"});

            fs.writeFileSync(`${folder}/data-export.zip`, content);
        }


        dataExport.completedAt = new Date();
        dataExport.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
        await dataExport.save();

        console.log("Data export completed for user", ((dataExport.user) as HydratedDocument<User>).id);

        await this.emailService.sendEmail(dataExport.user.email, EmailTemplates.DATA_EXPORT_FINISHED, {
            date: new Date().toLocaleDateString(),
            name: dataExport.user.name,
            link: this.configService.get<string>("FRONTEND_DOMAIN")!
        });
    }

    getPath(dataExport: HydratedDocument<DataExport>) {
        const folder = `./temp/data-export/${dataExport.user}`;
        const path = `${folder}/data-export.zip`;

        return path;
    }

    async get(user: HydratedDocument<User>) {
        const lastValid = await this.dataExportModel.findOne({
            $or: [
                {
                    expiresAt: {
                        $gt: new Date()
                    }
                },
                {
                    completedAt: {$exists: false},
                    expiresAt: {$exists: false}
                }
            ]
        });

        return lastValid;
    }

    async create(user: HydratedDocument<User>) {
        const dataExport = new this.dataExportModel({
            user: user,
            requestedAt: new Date(),
        });

        await dataExport.save();

        return dataExport;
    }
}
