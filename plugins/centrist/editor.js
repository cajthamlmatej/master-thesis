export const onPanelMessage = function(message) {
    const editor = api.editor;
    const blocks = editor.getBlocks();

    const selectedBlocks = blocks.filter((block) => editor.isBlockSelected(block.id));

    if(selectedBlocks.length <= 0) {
        return;
    }

    const size = editor.getSize();

    if(message === "horizontal-distribute") {
        const totalWidth = selectedBlocks.reduce((acc, block) => acc + block.size.width, 0);
        const space = size.width - totalWidth;
        const spaceBetween = space / (selectedBlocks.length - 1);

        const sortedBlocks = selectedBlocks.sort((a, b) => a.position.x - b.position.x);

        let x = 0;
        for(const block of sortedBlocks) {
            block.move(x, block.position.y);
            x += block.size.width + spaceBetween;
        }
    } else if(message === "vertical-distribute") {
        const totalHeight = selectedBlocks.reduce((acc, block) => acc + block.size.height, 0);
        const space = size.height - totalHeight;
        const spaceBetween = space / (selectedBlocks.length - 1);

        const sortedBlocks = selectedBlocks.sort((a, b) => a.position.y - b.position.y);

        let y = 0;
        for(const block of sortedBlocks) {
            block.move(block.position.x, y);
            y += block.size.height + spaceBetween;
        }
    } else if(message === "horizontal-align-center") {
        const totalWidth = selectedBlocks.reduce((acc, block) => acc + block.size.width, 0);
        const space = size.width - totalWidth;

        const sortedBlocks = selectedBlocks.sort((a, b) => a.position.x - b.position.x);

        let x = space / 2;
        for(const block of sortedBlocks) {
            block.move(x, block.position.y);
            x += block.size.width;
        }
    } else if(message === "format-align-middle") {
        const totalHeight = selectedBlocks.reduce((acc, block) => acc + block.size.height, 0);
        const space = size.height - totalHeight;

        const sortedBlocks = selectedBlocks.sort((a, b) => a.position.y - b.position.y);

        let y = space / 2;
        for(const block of sortedBlocks) {
            block.move(block.position.x, y);
            y += block.size.height;
        }
    } else if(message === "align-vertical-center") {
        const largestBlock = selectedBlocks.reduce((acc, block) => block.size.height > acc.size.height ? block : acc, selectedBlocks[0]);

        for(const block of selectedBlocks) {
            block.move(block.position.x, largestBlock.position.y + (largestBlock.size.height - block.size.height) / 2);
        }
    } else if(message === "align-horizontal-center") {
        const largestBlock = selectedBlocks.reduce((acc, block) => block.size.width > acc.size.width ? block : acc, selectedBlocks[0]);

        for(const block of selectedBlocks) {
            block.move(largestBlock.position.x + (largestBlock.size.width - block.size.width) / 2, block.position.y);
        }
    }
};

export const onPanelRegister = function() {
    return `
<link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" rel="stylesheet" crossorigin="anonymous">

<style>
    section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
    }

    section button {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 10px;
        border: none;
        background-color: #f0f0f0;
        cursor: pointer;
        color: #333;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        font-size: 20px;
        transition: background-color 0.3s ease;
    }

    section button:hover {
        background-color: #e0e0e0;
    }
</style>

<section>
    <button id="horizontal-distribute">
        <span class="mdi mdi-align-horizontal-distribute"></span>
    </button>
    <button id="vertical-distribute">
        <span class="mdi mdi-align-vertical-distribute"></span>
    </button>
    <button id="horizontal-align-center">
        <span class="mdi mdi-format-horizontal-align-center"></span>
    </button>
    <button id="format-align-middle">
        <span class="mdi mdi-format-align-middle"></span>
    </button>
    <button id="align-horizontal-center">
        <span class="mdi mdi-align-horizontal-center"></span>
    </button>
    <button id="align-vertical-center">
        <span class="mdi mdi-align-vertical-center"></span>
    </button>
</section>


<script>
const buttons = document.querySelectorAll("[id]");

for(let button of buttons) {
    const id = button.id;
    button.addEventListener("click", () => {
        window.parent.postMessage({target: "script", message: id}, "*");
    });
}
</script>
`;
};

export const initEditor = function() {
    api.editor.on("panelMessage", onPanelMessage);
    api.editor.on("panelRegister", onPanelRegister);
};