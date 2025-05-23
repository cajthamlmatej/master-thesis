import {BadRequestException, forwardRef, Inject, Injectable, Logger} from '@nestjs/common';
import {Material} from "./material.schema";
import {HydratedDocument} from "mongoose";
import puppeteer, {Browser} from "puppeteer";
import PDFMerger from "../utils/pdfMerger";
import * as fs from "fs";
import generateToken from "../utils/generateToken";
import {MaterialsService} from "./materials.service";
import {EventsGateway} from "../events/events.gateway";
import {ConfigService} from "@nestjs/config";

/**
 * Service responsible for exporting materials in various formats (PDF, JSON) 
 * and generating slide thumbnails. Utilizes Puppeteer for rendering and 
 * PDFMerger for combining PDF files.
 */
@Injectable()
export class MaterialsExportService {
    private TOKEN: string = generateToken(64);

    private browser: Browser;
    private browserPromiseResolve: (value: Browser) => void;
    private browserPromise: Promise<Browser> | null = null;
    private readonly logger = new Logger(MaterialsExportService.name);

    constructor(
        private readonly materialsService: MaterialsService,
        @Inject(forwardRef(() => EventsGateway)) private readonly eventsGateway: EventsGateway,
        private readonly configService: ConfigService
    ) {
        this.getBrowser();
    }

    /**
     * Retrieves the token used for authentication in export operations.
     * @returns {string} The generated token.
     */
    public getToken() {
        return this.TOKEN;
    }

    /**
     * Exports a material in the specified format (PDF or JSON).
     * @param material The material document to export.
     * @param format The format to export the material in ('pdf' or 'json').
     * @returns {Promise<fs.ReadStream>} A readable stream of the exported file.
     * @throws {BadRequestException} If the format is unsupported.
     */
    public async exportMaterial(material: HydratedDocument<Material>, format: string) {
        const outputFolder = `./temp/${material.id}/`;
        fs.mkdirSync(outputFolder, {recursive: true});

        let path: string;
        if (format === 'pdf') {
            path = await this.exportToPDF(material, outputFolder);
        } else if (format === 'json') {
            path = await this.exportToJSON(material, outputFolder);
        } else {
            throw new BadRequestException("Unsupported format");
        }

        return fs.createReadStream(path);
    }

    /**
     * Exports slide thumbnails for a given material. Generates JPEG images
     * for each slide and updates the material's thumbnails.
     * @param material The material document containing slides to export.
     */
    public async exportSlideThumbnails(material: HydratedDocument<Material>) {
        this.logger.log(`Exporting slide thumbnails for material ${material.id}`);

        const url = this.configService.get<string>("FRONTEND_DOMAIN")! + this.configService.get<string>("FRONTEND_DOMAIN_PLAYER")!;

        const outputFolder = `./temp/${material.id}/`;
        fs.mkdirSync(outputFolder, {recursive: true});

        try {
            const sortedSlides = material.slides.sort((a, b) => a.position - b.position);
            for (let slide of sortedSlides) {
                const slideId = slide.id;
                const outputFile = `${outputFolder}/${slideId}.jpg`;
                const width = Number(slide.data.editor.size.width);
                const height = Number(slide.data.editor.size.height);

                const page = await (await this.getBrowser()).newPage();
                await page.setViewport({width: width, height: height});

                await page.goto(
                    `${url}/${material.id}?slide=${slideId}&rendering=true&cookies=true&token=${this.getToken()}`, {waitUntil: 'networkidle2'});

                //await page.waitForSelector(".editor-content", {timeout: 30000});
                await page.waitForFunction(() => {
                    const element = document.querySelector("[data-cy=cookies]");
                    return !element;
                }, {timeout: 30000});

                await page.screenshot({
                    path: outputFile,
                    type: "jpeg",
                    quality: 10,
                });

                const header = "data:image/jpeg;base64,";
                slide.thumbnail = header + fs.readFileSync(outputFile).toString('base64');

                await page.close();
            }

            await this.materialsService.updateThumbnails(material);

            this.eventsGateway.getEditorRoom(material.id)?.announceNewThumbnails(material.slides.map(s => {
                return {
                    id: s.id,
                    thumbnail: s.thumbnail,
                }
            }));

            this.logger.log(`Finished exporting slide thumbnails for material ${material.id}`);
        } catch (e) {
            this.logger.error(`Error exporting slide thumbnails for material ${material.id}: ${e}`);
        }
    }

    /**
     * Retrieves or initializes a Puppeteer browser instance.
     * @returns {Promise<Browser>} The Puppeteer browser instance.
     */
    private async getBrowser(): Promise<Browser> {
        if (this.browser) {
            return this.browser;
        }

        let hasToRegenerate = false;

        if (!this.browserPromise) {
            hasToRegenerate = true;
        }

        let awaited = await this.browserPromise;

        if (!(awaited)) {
            hasToRegenerate = true;
        }

        if (!hasToRegenerate && awaited) {
            return awaited;
        }

        this.browserPromise = new Promise(async (resolve) => {
            this.browserPromiseResolve = resolve;
        });

        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        this.browserPromiseResolve(this.browser);

        return this.browser;
    }

    /**
     * Exports a material's slides to a single PDF file.
     * @param material The material document containing slides to export.
     * @param outputFolder The folder to save the generated PDF files.
     * @returns {Promise<string>} The path to the final merged PDF file.
     */
    private async exportToPDF(material: HydratedDocument<Material>, outputFolder: string) {
        const url = this.configService.get<string>("FRONTEND_DOMAIN")! + this.configService.get<string>("FRONTEND_DOMAIN_PLAYER")!;

        let output = `${outputFolder}/output-pdf.pdf`;

        const sortedSlides = material.slides.sort((a, b) => a.position - b.position);
        for (let slide of sortedSlides) {
            const slideId = slide.id;
            const outputFile = `${outputFolder}/${slideId}.pdf`;
            const width = Number(slide.data.editor.size.width);
            const height = Number(slide.data.editor.size.height);

            const page = await (await this.getBrowser()).newPage();
            await page.setViewport({width: width, height: height});

            await page.goto(
                `${url}/${material.id}?slide=${slideId}&rendering=true&cookies=true&token=${this.getToken()}`, {waitUntil: 'networkidle2'});

            await page.pdf({
                path: outputFile,
                width: width,
                height: height,
                printBackground: true
            });
            await page.close();
        }

        const merger = new PDFMerger();

        for (let slide of sortedSlides) {
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

    /**
     * Exports a material's slides to a JSON file.
     * @param material The material document containing slides to export.
     * @param outputFolder The folder to save the generated JSON file.
     * @returns {Promise<string>} The path to the generated JSON file.
     */
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
