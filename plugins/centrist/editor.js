
export const onPanelMessage = function(message) {
    const editor = api.editor;
    if(message === "horizontal-distribute") {
        const blocks = editor.getBlocks();

        const selectedBlocks = blocks.filter((block) => editor.isBlockSelected(block.id));

        if(selectedBlocks.length <= 0) {
            return;
        }

        const size = editor.getSize();

        const totalWidth = selectedBlocks.reduce((acc, block) => acc + block.size.width, 0);
        const space = size.width - totalWidth;
        const spaceBetween = space / (selectedBlocks.length - 1);

        const sortedBlocks = selectedBlocks.sort((a, b) => a.position.x - b.position.x);

        let x = 0;
        for(const block of sortedBlocks) {
            block.move(x, block.position.y);
            x += block.size.width + spaceBetween;
        }
    }
};

export const onPanelRegister = function() {
    return `
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" rel="stylesheet" crossorigin="anonymous">

<section>
    <button id="horizontal-distribute">
        <span class="mdi mdi-align-horizontal-distribute"></span>
    </button>
</section>


<script>
document.querySelector("#horizontal-distribute").addEventListener("click", () => {
    window.parent.postMessage({target: "script", message: "horizontal-distribute"}, "*");
});
</script>
`;
    };