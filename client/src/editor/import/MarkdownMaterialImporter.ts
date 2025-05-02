import {MaterialImporter} from "@/editor/import/MaterialImporter";
import Material, {Slide, SlideData as MaterialSlideData} from "@/models/Material";
import {marked} from "marked";
import {generateUUID} from "@/utils/Generators";
interface SlideData {
    title: string;
    blocks: {
        type: string;
        html: string;
        items?: number;
    }[]
};

/**
 * Class for importing materials from Markdown content.
 * Converts Markdown into a presentation format with slides and blocks.
 */
export class MarkdownMaterialImporter extends MaterialImporter {
    /**
     * Processes the given Markdown content and updates the provided material object.
     * @param content - The Markdown content to be processed.
     * @param material - The material object to be updated with the processed data.
     * @returns A promise that resolves when the processing is complete.
     */
    async process(content: string, material: Material) {
        const data = marked.lexer(content);

        let presentationTitle = '';
        let slides = [] as SlideData[];
        let currentSlide = null as SlideData | null;

        for (let i = 0; i < data.length; i++) {
            const token = data[i];

            if (token.type === 'heading' && token.depth === 1 && !presentationTitle) {
                presentationTitle = token.text;
                continue;
            }

            if (token.type === 'heading' && token.depth > 1) {
                if (currentSlide) {
                    // Save the current read slide
                    slides.push(currentSlide);
                }

                currentSlide = {
                    title: token.text,
                    blocks: []
                };
                continue;
            }

            if (currentSlide) {
                if (token.type === 'paragraph') {
                    // Render the paragraph content as HTML
                    const html = marked.parser([token]);

                    currentSlide.blocks.push({
                        type: 'paragraph',
                        html: html,
                    });
                }

                // Handle list blocks
                else if (token.type === 'list') {
                    // Render the entire list as HTML
                    const html = marked.parser([token]);

                    const items = token.items.length;

                    currentSlide.blocks.push({
                        type: 'list',
                        html: html,
                        items: items
                    });
                }

                // TODO: Handle other block types
            }
        }

        if (currentSlide) {
            slides.push(currentSlide);
        }

        material.name = presentationTitle;

        const correctSlides = [] as Slide[];

        let width = 1200;
        let height = 800;

        // Title slide
        (() => {
            let blocks = [] as any[];

            let fontSize = 128;
            let titleHeight = fontSize * 1.5;
            let titleCenter = height / 2 - titleHeight / 2;
            blocks.push({
                type: "text",
                content: `<p style="text-align: center">${presentationTitle}</p>`,
                fontSize: fontSize,
                id: generateUUID(),
                position: {
                    x: 0,
                    y: titleCenter
                },
                size: {
                    width: width,
                    height: titleHeight
                },
                rotation: 0,
                zIndex: 0,
                opacity: 1,
                locked: false,
                interactivity: []
            });

            let data: MaterialSlideData = {
                blocks: blocks,
                editor: {
                    size: {
                        width: width,
                        height: height
                    },
                    color: "#ffffff"
                }
            };

            correctSlides.push(new Slide(generateUUID(), data, undefined, 0));
        })();

        for (let slide of slides) {
            let blocks = [] as any[];

            let padding = 20;
            let gaps = 20;

            let lastSpace = padding;

            // TITLE
            (() => {
                let fontSize = 64;
                let titleHeight = fontSize * 1.5;
                blocks.push({
                    type: "text",
                    content: `<p style="text-align: center">${slide.title}</p>`,
                    fontSize: fontSize,
                    id: generateUUID(),
                    position: {
                        x: padding,
                        y: lastSpace
                    },
                    size: {
                        width: width - padding * 2,
                        height: titleHeight
                    },
                    rotation: 0,
                    zIndex: 0,
                    opacity: 1,
                    locked: false,
                    interactivity: []
                });

                lastSpace += titleHeight;
            })();

            lastSpace += gaps;

            for (let block of slide.blocks) {
                switch (block.type) {
                    case "paragraph": {
                        let fontSize = 48;
                        let height = fontSize * 1.5;
                        blocks.push({
                            type: "text",
                            content: block.html,
                            fontSize: fontSize,
                            id: generateUUID(),
                            position: {
                                x: padding,
                                y: lastSpace
                            },
                            size: {
                                width: width - padding * 2,
                                height: height
                            },
                            rotation: 0,
                            zIndex: 0,
                            opacity: 1,
                            locked: false,
                            interactivity: []
                        });

                        lastSpace += height + gaps;

                        break;
                    }
                    case "list": {
                        let fontSize = 48;
                        let height = fontSize * 1.5 * (block.items ?? 0);

                        blocks.push({
                            type: "text",
                            content: block.html,
                            fontSize: fontSize,
                            id: generateUUID(),
                            position: {
                                x: padding,
                                y: lastSpace
                            },
                            size: {
                                width: width - padding * 2,
                                height: height
                            },
                            rotation: 0,
                            zIndex: 0,
                            opacity: 1,
                            locked: false,
                            interactivity: []
                        });

                        lastSpace += height + gaps;

                        break;
                    }
                }
            }

            let data: MaterialSlideData = {
                blocks: blocks,
                editor: {
                    size: {
                        width: width,
                        height: height
                    },
                    color: "#ffffff"
                }
            };

            correctSlides.push(new Slide(generateUUID(), data, undefined, correctSlides.length));
        }

        material.slides = correctSlides;
    }

}
