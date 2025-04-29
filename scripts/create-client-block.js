const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Usage: node create-client-block.js <block-name>');
    process.exit(1);
    return;
}

const name = args[0];
const fs = require('fs');

const frontend = '../client/src/editor/block';

const blockName = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
const folder = `${frontend}/base/${name}`;

if (fs.existsSync(folder)) {
    console.error(`Block ${blockName} already exists.`);
    process.exit(1);
    return;
}

fs.mkdirSync(folder);

{
    const className = `${blockName}EditorBlock`;
    const content = `import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {Property} from "@/editor/property/Property";

export class ${className} extends EditorBlock {
    constructor(base: BlockConstructorWithoutType) {
        super({
            ...base,
            type: "${name}",
        });
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-${name}");

        return element;
    }

    override editorSupport() {
        return {
            group: true,
            selection: true,
            movement: true,
            proportionalResizing: true,
            nonProportionalResizingX: true,
            nonProportionalResizingY: true,
            rotation: true,
            zIndex: true,
            lock: true,
        }
    }

    override clone(): EditorBlock {
        return new ${className}(this.getCloneBase());
    }
}`;

    fs.writeFileSync(`${folder}/${className}.ts`, content);
}

{
    const className = `${blockName}PlayerBlock`;
    const content = `import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";

export class ${className} extends PlayerBlock {
    constructor(base: BlockConstructorWithoutType) {
        super({
            ...base,
            type: "${name}",
        });
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-${name}");

        return element;
    }
}`;

    fs.writeFileSync(`${folder}/${className}.ts`, content);
}

{
    const className = `${blockName}BlockDeserializer`;
    const editorClassName = `${blockName}EditorBlock`;
    const playerClassName = `${blockName}PlayerBlock`;
    const content = `import {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {${playerClassName}} from "@/editor/block/base/${name}/${playerClassName}";
import {${editorClassName}} from "@/editor/block/base/${name}/${editorClassName}";

export class ${className} extends BlockDeserializer {
    deserializeEditor(data: any): EditorBlock {
        const base = this.getBaseBlockData(data);
        return new ${editorClassName}(base);
    }

    deserializePlayer(data: any): PlayerBlock {
        const base = this.getBaseBlockData(data);
        return new ${playerClassName}(base);
    }
}`;

    fs.writeFileSync(`${folder}/${className}.ts`, content);
}

{
    const file = `${frontend}/BlockRegistry.ts`;
    const content = fs.readFileSync(file, 'utf8');

    const lines = content.split('\n');

    const entryIndex = lines.findIndex(line => line.includes('// $ADD_BLOCK_REGISTRY_ENTRY'));
    const importIndex = lines.findIndex(line => line.includes('// $ADD_BLOCK_REGISTRY_IMPORT'));

    
    if (entryIndex === -1 || importIndex === -1) {
        console.error('BlockRegistry.ts is malformed.');
        process.exit(1);
        return;
    }

    const deserializerClassName = `${blockName}BlockDeserializer`;
    const editorClassName = `${blockName}EditorBlock`;
    const playerClassName = `${blockName}PlayerBlock`;

    lines.splice(entryIndex, 0, `        this.register("${name}", ${editorClassName}, ${playerClassName}, ${deserializerClassName});`);

    lines.splice(importIndex, 0, `import {${editorClassName}} from "@/editor/block/base/${name}/${editorClassName}";
import {${playerClassName}} from "@/editor/block/base/${name}/${playerClassName}";
import {${deserializerClassName}} from "@/editor/block/base/${name}/${deserializerClassName}";`);

    fs.writeFileSync(file, lines.join('\n'));
}


console.log(`Block ${blockName} created successfully!`);