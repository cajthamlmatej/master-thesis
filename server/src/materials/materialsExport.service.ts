import {forwardRef, Inject, Injectable, Logger} from '@nestjs/common';
import {Material} from "./material.schema";
import {HydratedDocument} from "mongoose";
import puppeteer from "puppeteer";
import PDFMerger from "../utils/pdfMerger";
import * as fs from "fs";
import generateToken from "../utils/generateToken";
import {MaterialsService} from "./materials.service";
import {EventsGateway} from "../events/events.gateway";

@Injectable()
export class MaterialsExportService {
    private TOKEN: string = generateToken(64);

    constructor(
        private readonly materialsService: MaterialsService,
        @Inject(forwardRef(() => EventsGateway)) private readonly eventsGateway: EventsGateway,
    ) {

    }

    public getToken() {
        return this.TOKEN;
    }

    public async exportMaterial(material: HydratedDocument<Material>, format: string) {
        const outputFolder = `./temp/${material.id}/`;
        fs.mkdirSync(outputFolder, {recursive: true});

        let path: string;
        if (format === 'pdf') {
            path = await this.exportToPDF(material, outputFolder);
        } else if (format === 'json') {
            path = await this.exportToJSON(material, outputFolder);
        } else {
            throw new Error("Unsupported format");
        }

        return fs.createReadStream(path);
    }

    private readonly logger = new Logger(MaterialsExportService.name);

    public async exportSlideThumbnails(material: HydratedDocument<Material>) {
        this.logger.log(`Exporting slide thumbnails for material ${material.id}`);

        const outputFolder = `./temp/${material.id}/`;
        fs.mkdirSync(outputFolder, {recursive: true});

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        for (let slide of material.slides) {
            const slideId = slide.id;
            const outputFile = `${outputFolder}/${slideId}.jpg`;
            const width = Number(slide.data.editor.size.width);
            const height = Number(slide.data.editor.size.height);

            const page = await browser.newPage();
            await page.setViewport({width: width, height: height});

            // TODO: make this prettier
            await page.goto(
                `http://localhost:5173/en/player/${material.id}?slide=${slideId}&rendering=true&cookies=true&token=${this.getToken()}`, {waitUntil: 'networkidle2'});

            await page.screenshot({
                path: outputFile,
                type: "jpeg",
                quality: 80,
            })

            const header = "data:image/jpeg;base64,";
            slide.thumbnail = header + fs.readFileSync(outputFile).toString('base64');
        }

        await browser.close();

        await this.materialsService.updateThumbnails(material);

        this.eventsGateway.getEditorRoom(material.id)?.announceNewThumbnails(material.slides.map(s => {
            return {
                id: s.id,
                thumbnail: s.thumbnail,
            }
        }));

        this.logger.log(`Finished exporting slide thumbnails for material ${material.id}`);
    }

    private async exportToPDF(material: HydratedDocument<Material>, outputFolder: string) {
        let output = `${outputFolder}/output-pdf.pdf`;
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        })

        for (let slide of material.slides) {
            const slideId = slide.id;
            const outputFile = `${outputFolder}/${slideId}.pdf`;
            const width = Number(slide.data.editor.size.width);
            const height = Number(slide.data.editor.size.height);

            const page = await browser.newPage();
            await page.setViewport({width: width, height: height});

            // TODO: make this prettier
            await page.goto(
                `https://masterthesis.cajthaml.dev/cs/player/${material.id}?slide=${slideId}&rendering=true&cookies=true&token=${this.getToken()}`, {waitUntil: 'networkidle2'});

            await page.pdf({
                path: outputFile,
                width: width,
                height: height,
                printBackground: true
            });
        }

        await browser.close();

        const merger = new PDFMerger();

        for (let slide of material.slides) {
            const slideId = slide.id;
            const outputFile = `${outputFolder}/${slideId}.pdf`;

            await merger.add(outputFile);
        }

        const updated = await material.populate("user");

        await merger.setMetadata({
            title: material.name,
            author: updated.user.name.toString(),
        });

        await merger.save(output);

        return output;
    }

    private async exportToJSON(material: HydratedDocument<Material>, outputFolder: string) {
        let output = `${outputFolder}/output-json.json`;

        fs.writeFileSync(output, JSON.stringify(material.slides.map(s => {
            return {
                ...s,
                thumbnail: undefined,
            }
        })));

        return output;
    }
}
