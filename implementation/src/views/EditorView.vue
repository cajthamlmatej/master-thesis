<template>
    <article class="editor-view">
        <nav class="main">
            <div class="logo"></div>

            <button @click="addText">Add text</button>
        </nav>

        <nav class="text">
            <button @click="() => toggle('b')">bold</button>
        </nav>

        <div class="editor-container">
            <div class="editor" ref="editor">
                <div class="editor-content">
                    <div class="block block--text"

                         data-moveable

                         style="left: 100px; top: 100px; width: 300px; height: 48px;">
                        <div class="content" style="width: 300px;" contenteditable="true">
                            <div class="line">
                                <span>Ukázka</span>
                            </div>
                            <div class="line">
                                <span>textu</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="selector" ref="selector">
                    <div class="move move--top"></div>
                    <div class="move move--right"></div>
                    <div class="move move--bottom"></div>
                    <div class="move move--left"></div>

                    <div class="resize resize--top-left"></div>
                    <div class="resize resize--top-right"></div>
                    <div class="resize resize--bottom-right"></div>
                    <div class="resize resize--bottom-left"></div>
                    <div class="resize resize--middle-right"></div>
                    <div class="resize resize--middle-left"></div>

                    <div class="rotate"></div>
                    <div class="actions"></div>
                </div>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from 'vue';

const editor = ref<HTMLElement | null>(null);
const selector = ref<HTMLElement | null>(null);
const selecting = ref<HTMLElement | null>(null);

const size = ref({width: 1200, height: 675});

const selectElement = (element: HTMLElement) => {
    if (!element) return;

    const selectorElement = selector.value;

    if (!selectorElement) return;

    selectorElement.style.left = element.style.left;
    selectorElement.style.top = element.style.top;
    selectorElement.style.width = element.style.width;
    selectorElement.style.height = element.style.height;

    selectorElement.classList.add('selector--active');
    element.classList.add('block--selected');

    element.addEventListener("input", selectedInput);

    selecting.value = element;
};

const selectedInput = (e: Event) => {
    const closestBlock = (e.target as HTMLElement).closest('.block') as HTMLElement;

    if(!closestBlock) return;

    if(!closestBlock.classList.contains('block--text')) return;

    const contentElement = closestBlock.querySelector('.content') as HTMLElement;

    closestBlock.style.height = `${contentElement.clientHeight}px`;

    updateSelector();
};

const deselect = () => {
    const selectorElement = selector.value;

    if (!selectorElement) return;

    selectorElement.classList.remove('selector--active');

    if (selecting.value) {
        selecting.value.blur();
        selecting.value.classList.remove('block--selected');
        selecting.value.removeEventListener("input", selectedInput);
    }

    selecting.value = null;
};

const updateSelector = () => {
    const selectorElement = selector.value;
    const element = selecting.value;

    if (!selectorElement) return;

    if (!element) return;

    selectorElement.style.left = element.style.left;
    selectorElement.style.top = element.style.top;
    selectorElement.style.width = element.style.width;
    selectorElement.style.height = element.style.height;
    selectorElement.style.transform = element.style.transform;

    selectorElement.classList.add('selector--active');
    element.classList.add('block--selected');
};

onMounted(() => {
    setupEditor();
    setupBlocks();
    setupSelector();
});

const setupEditor = () => {
    const e = editor.value;
    if (!e) return;

    setEditorScale();

    window.addEventListener('resize', () => {
        setEditorScale();
    });
}

const setEditorScale = () => {
    const editorElement = editor?.value;

    if (!editorElement) return;

    const parent = editorElement.parentElement;
    if (!parent) return;

    // Set the editor scale to arbitrary value
    editorElement.style.width = `100px`;
    editorElement.style.height = `100px`;

    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    // Determine scale to fully fit the parent (using only the transform scale)
    const scaleX = parentWidth / size.value.width;
    const scaleY = parentHeight / size.value.height;

    let scale = Math.min(scaleX, scaleY);
    scale = Math.floor(scale * 1000) / 1000;

    // Restore the original size
    editorElement.style.width = `${size.value.width}px`;
    editorElement.style.height = `${size.value.height}px`;

    editorElement.style.setProperty('--editor-scale', scale.toString());
}

const setupBlocks = () => {
    const blocks = editor.value?.querySelectorAll('[data-moveable]');

    if (!blocks) return;

    for (let block of blocks) {
        setupBlock(block as HTMLElement);
    }
}

const setupBlock = (block: HTMLElement) => {
    const editorElement = editor.value;

    if (!editorElement) return;

    block.addEventListener('mousedown', (e) => {
        if (!(e instanceof MouseEvent)) return;

        const blockElement = e.currentTarget as HTMLElement;

        if(blockElement === selecting.value) {
            return;
        }

        blockElement.classList.add('block--dragged');

        // note(Matej): We could get this scale somewhere else here in the editor rather than parsing it from the CSS
        const editorScale = parseFloat(getComputedStyle(editorElement).getPropertyValue('--editor-scale')) || 1;

        const blockRect = blockElement.getBoundingClientRect();
        const editorRect = editorElement.getBoundingClientRect();

        const offsetX = (e.clientX - blockRect.left) / editorScale;
        const offsetY = (e.clientY - blockRect.top) / editorScale;

        const startX = blockElement.style.left ? parseInt(blockElement.style.left) : 0;
        const startY = blockElement.style.top ? parseInt(blockElement.style.top) : 0;

        let moved = false;

        const onMouseMove = (e: MouseEvent) => {
            const newLeft = (e.clientX - editorRect.left) / editorScale - offsetX;
            const newTop = (e.clientY - editorRect.top) / editorScale - offsetY;

            if (!moved && (Math.abs(newLeft - startX) > 5 || Math.abs(newTop - startY) > 5)) {
                moved = true;
            }

            if(!moved) {
                return;
            }

            deselect();
            blockElement.style.left = `${newLeft}px`;
            blockElement.style.top = `${newTop}px`;

            blockElement.blur();
        };

        const onMouseUp = (e: Event) => {
            if(!(e instanceof MouseEvent)) return;

            blockElement.classList.remove('block--dragged');

            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            if(!moved) {
                // TODO
                selectElement(blockElement);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });
}

const addText = () => {
    const editorElement = editor.value;

    if(!editorElement) return;

    const block = document.createElement('div');
    block.classList.add('block');
    block.classList.add('block--text');
    block.setAttribute('data-moveable', '');
    block.style.left = '100px';
    block.style.top = '100px';
    block.style.width = '300px';
    block.style.height = '24px';

    block.innerHTML = `<div class="content" style="width: 300px;" contenteditable="true">
    <div class="line">
        <span>Vyplnte...</span>
    </div>
</div>`;

    editorElement.querySelector(".editor-content")!.appendChild(block);
    nextTick(() => {
        setupBlock(block);
    });
}

const toggle = (tag: string) => {
    const blockElement = selecting.value;

    if (!blockElement) return;

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    // Check if selection is fully contained in an element with the specified tag
    const container = range.commonAncestorContainer;
    const isWithinTag = container.nodeType === Node.ELEMENT_NODE &&
        (container as Element).tagName.toLowerCase() === tag.toLowerCase();

    if (isWithinTag) {
        // If selected text is already within the specified tag, unwrap it
        const parent = container.parentNode;
        if (parent) {
            while (container.firstChild) {
                parent.insertBefore(container.firstChild, container);
            }
            parent.removeChild(container);
        }
    } else {
        // Otherwise, wrap the selected text in the new tag
        const newNode = document.createElement(tag);
        newNode.appendChild(range.extractContents());
        range.insertNode(newNode);
    }
};

const setupSelector = () => {
    const selectorElement = selector.value;

    const editorElement = editor.value;

    if (!editorElement) return;
    if (!selectorElement) return;

    const moveElements = selectorElement.querySelectorAll('.move');
    let skipNextOutsideClick = false;

    for(let moveElement of moveElements) {
        moveElement.addEventListener('mousedown', (e) => {
            if(!(e instanceof MouseEvent)) return;

            const blockElement = selecting.value;

            if(!blockElement) return;

            deselect();

            blockElement.classList.add('block--dragged');

            // note(Matej): We could get this scale somewhere else here in the editor rather than parsing it from the CSS
            const editorScale = parseFloat(getComputedStyle(editorElement).getPropertyValue('--editor-scale')) || 1;

            const blockRect = blockElement.getBoundingClientRect();
            const editorRect = editorElement.getBoundingClientRect();

            const offsetX = (e.clientX - blockRect.left) / editorScale;
            const offsetY = (e.clientY - blockRect.top) / editorScale;

            const onMouseMove = (e: MouseEvent) => {
                const newLeft = (e.clientX - editorRect.left) / editorScale - offsetX;
                const newTop = (e.clientY - editorRect.top) / editorScale - offsetY;

                blockElement.style.left = `${newLeft}px`;
                blockElement.style.top = `${newTop}px`;
                blockElement.blur();

                e.preventDefault();
            };

            const onMouseUp = (e: Event) => {
                if(!(e instanceof MouseEvent)) return;

                blockElement.classList.remove('block--dragged');

                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);

                // Get back to the element we started moving
                selectElement(blockElement);
                skipNextOutsideClick = true;
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    }
    const resizeElements = selectorElement.querySelectorAll('.resize');

    for (let resizeElement of resizeElements) {
        resizeElement.addEventListener('mousedown', (e) => {
            if (!(e instanceof MouseEvent)) return;

            const blockElement = selecting.value;
            if (!blockElement) return;

            const contentElement = blockElement.querySelector('.content') as HTMLElement;

            const editorScale = parseFloat(getComputedStyle(editorElement).getPropertyValue('--editor-scale')) || 1;
            const editorRect = editorElement.getBoundingClientRect();

            const positionTop = Number(blockElement.style.top.replace('px', ''));
            const positionLeft = Number(blockElement.style.left.replace('px', ''));
            const width = Number(blockElement.style.width.replace('px', ''));
            const height = Number(blockElement.style.height.replace('px', ''));
            const aspectRatio = width / height;
            let scaleType = 'proportional';

            const type = [...resizeElement.classList].find(c => c.startsWith('resize--'))?.replace('resize--', '') ?? 'top-left';

            // Use the current transformation matrix of the block element
            const transformMatrix = new DOMMatrix(getComputedStyle(blockElement).transform);
            const inverseMatrix = transformMatrix.inverse();

            const minSize = 10;

            const onMouseMove = (e: MouseEvent) => {
                // Adjust the mouse position according to the inverse transformation matrix
                const mouseX = (e.clientX - editorRect.left) / editorScale;
                const mouseY = (e.clientY - editorRect.top) / editorScale;

                const transformedMouse = inverseMatrix.transformPoint({ x: mouseX, y: mouseY });

                let newWidth = width;
                let newHeight = height;
                let newTop = positionTop;
                let newLeft = positionLeft;

                if (type === "bottom-right") {
                    newWidth = transformedMouse.x - positionLeft;
                    newHeight = newWidth / aspectRatio;
                    if (newWidth < minSize) newWidth = minSize;
                } else if (type === "top-right") {
                    newWidth = transformedMouse.x - positionLeft;
                    newHeight = newWidth / aspectRatio;
                    newTop = positionTop - (newHeight - height);
                    if (newWidth < minSize) newWidth = minSize;
                } else if (type === "bottom-left") {
                    newWidth = positionLeft + width - transformedMouse.x;
                    newHeight = newWidth / aspectRatio;
                    newLeft = positionLeft - (newWidth - width);
                    if (newWidth < minSize) newWidth = minSize;
                } else if (type === "top-left") {
                    newWidth = positionLeft + width - transformedMouse.x;
                    newHeight = newWidth / aspectRatio;
                    newTop = positionTop - (newHeight - height);
                    newLeft = positionLeft - (newWidth - width);
                    if (newWidth < minSize) newWidth = minSize;
                } else if (type === "middle-right") {
                    newWidth = transformedMouse.x - positionLeft;
                    newHeight = height;
                    scaleType = 'non-proportional';
                    if (newWidth < minSize) newWidth = minSize;
                } else if (type === "middle-left") {
                    newWidth = positionLeft + width - transformedMouse.x;
                    newHeight = height;
                    newLeft = positionLeft - (newWidth - width);
                    scaleType = 'non-proportional';
                    if (newWidth < minSize) newWidth = minSize;
                }

                blockElement.style.left = `${newLeft}px`;
                blockElement.style.top = `${newTop}px`;
                blockElement.style.width = `${newWidth}px`;
                blockElement.style.height = `${newHeight}px`;

                if (["middle-right", "middle-left"].includes(type)) {
                    contentElement.style.width = `${newWidth}px`;
                    blockElement.style.height = `${contentElement.clientHeight}px`;
                } else {
                    const scale = newWidth / width;
                    contentElement.style.transform = `scale(${scale})`;
                }

                e.preventDefault();
                updateSelector();
            };

            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);

                contentElement.style.transform = '';
                contentElement.style.width = blockElement.style.width;

                if (scaleType === 'non-proportional') return;

                const fontSize = parseFloat(getComputedStyle(contentElement).fontSize);
                const newWidth = parseFloat(getComputedStyle(contentElement).width);
                const newFontSize = fontSize * (newWidth / width);
                contentElement.style.fontSize = `${newFontSize}px`;
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    }


    const rotateElement = selectorElement.querySelector('.rotate');

    let currentAngle = 0; // Track accumulated angle
    let lastAngle = 0; // Track the last computed angle during rotation

    rotateElement?.addEventListener('mousedown', (e) => {
        if (!(e instanceof MouseEvent)) return;

        const blockElement = selecting.value;
        if (!blockElement) return;

        const blockRect = blockElement.getBoundingClientRect();
        const blockCenterX = blockRect.left + blockRect.width / 2;
        const blockCenterY = blockRect.top + blockRect.height / 2;

        // Calculate initial angle from the mouse position to center
        lastAngle = Math.atan2(e.clientY - blockCenterY, e.clientX - blockCenterX);

        const onMouseMove = (e: MouseEvent) => {
            const angle = Math.atan2(e.clientY - blockCenterY, e.clientX - blockCenterX);

            let angleDiff = angle - lastAngle;

            if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;

            currentAngle += angleDiff;

            // TODO: shift + drag for 15 degree rotation

            blockElement.style.transform = `rotate(${currentAngle}rad)`;
            blockElement.blur();
            e.preventDefault();
            updateSelector();

            lastAngle = angle;
        };

        const onMouseUp = (e: Event) => {
            if (!(e instanceof MouseEvent)) return;

            // Clean up event listeners on mouse up
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });


    // Deselect when clicking outside of current selected element
    window.addEventListener('click', (e) => {
        if (!(e instanceof MouseEvent)) return;

        const target = e.target as HTMLElement;

        if (selecting.value && !selecting.value.contains(target)) {
            if(skipNextOutsideClick) {
                skipNextOutsideClick = false;
                return;
            }

            deselect();
        }
    });
}
</script>

<style lang="scss" scoped>
article.editor-view {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    width: 100%;
    height: 100vh;
    min-height: 0;
    min-width: 0;

    nav.main {
        position: relative;
        z-index: 100;

        grid-row: 1 / 3;
        grid-column: 1 / 2;

        padding: 1rem;
        background-color: #f5f5f5;
        border-right: 1px solid #e9ecef;

        display: flex;
        flex-direction: column;
        align-items: center;

        button {
            padding: 0.5rem 1rem;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
        }

        .logo {
            width: 50px;
            height: 50px;
            background-color: #6bacec;
            margin-bottom: 90px;
        }
    }

    nav.text {
        position: relative;
        z-index: 100;

        grid-row: 1 / 2;
        grid-column: 2 / 3;

        padding: 1rem;
        background-color: #f5f5f5;
        border-bottom: 1px solid #e9ecef;

        display: flex;
        gap: 1rem;

        button {
            padding: 0.5rem 1rem;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
        }
    }
}

.editor-container {
    grid-row: 2 / 3;
    grid-column: 2 / 3;

    user-select: none;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;

    display: flex;
    justify-content: center;
    align-items: center;

    overflow: hidden;

    .editor {
        // TODO: make this size based on the data from the component
        width: 100px;
        height: 100px;

        position: relative;

        flex-shrink: 0;
        flex-grow: 0;

        background-color: #fff;

        transform: scale(var(--editor-scale));

        &-content {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
    }
}

.block {
    position: absolute;
    display: block;

    > .content {
        transform-origin: top left;
        contain: layout style;
    }

    &--text {
        // Temporary styling
        color: black;

        div {
            display: block;
            width: 100%;
        }
    }

    &--selected {

    }

    &[data-moveable]:not(&--selected), &--dragged {
        &:not(:focus):hover {
            cursor: move;
            background-color: rgba(0, 0, 0, 0.1);

            outline: 2px dashed rgba(0, 0, 0, 0.2);
        }
    }

    &[data-moveable] {
        .content {
            &:focus, &:focus-visible {
                outline: 0;
            }
        }

        &.block--dragged {
            z-index: 5;
        }

        &.block--selected {
            background: rgba(0, 0, 0, 0.1);
        }
    }
}

.selector {
    --selector-size: 4px;

    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    width: 300px;
    height: 200px;
    display: none;
    user-select: none;
    touch-action: none;
    pointer-events: none;

    &--active {
        display: block;
    }

    > .move {
        position: absolute;
        pointer-events: auto;
        cursor: move;

        &::after {
            position: absolute;
            border-style: dashed;
            border-width: var(--selector-size);
            border-color: rgba(0, 0, 0, 0.2);
        }

        &--top {
            height: calc(2 * var(--selector-size));
            width: 100%;
            top: calc(-0.5 * var(--selector-size));
            left: 0;

            &::after {
                content: '';
                top: 0;

                height: 0;
                width: 100%;

                border-left: 0;
                border-right: 0;
                border-bottom: 0;
            }
        }
        &--bottom {
            height: calc(2 * var(--selector-size));
            width: 100%;
            bottom: calc(-0.5 * var(--selector-size));
            left: 0;

            &::after {
                content: '';
                bottom: 0;

                height: 0;
                width: 100%;

                border-left: 0;
                border-right: 0;
                border-top: 0;
            }
        }
        &--left {
            width: calc(2 * var(--selector-size));
            height: 100%;
            top: 0;
            left: calc(-0.5 * var(--selector-size));

            &::after {
                content: '';
                left: 0;

                height: 100%;
                width: 0;

                border-top: 0;
                border-bottom: 0;
                border-right: 0;
            }
        }
        &--right {
            width: calc(2 * var(--selector-size));
            height: 100%;
            top: 0;
            right: calc(-0.5 * var(--selector-size));

            &::after {
                content: '';
                right: 0;

                height: 100%;
                width: 0;

                border-top: 0;
                border-bottom: 0;
                border-left: 0;
            }
        }
    }

    > .resize {
        position: absolute;
        width: calc(4*var(--selector-size));
        height: calc(4*var(--selector-size));
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 1);
        pointer-events: auto;

        &--top-right {
            top: calc(-1 * 2 * var(--selector-size));
            right: calc(-1 * 2 * var(--selector-size));
            cursor: ne-resize;
        }
        &--top-left {
            top: calc(-1 * 2 * var(--selector-size));
            left: calc(-1 * 2 * var(--selector-size));
            cursor: nw-resize;
        }
        &--bottom-right {
            bottom: calc(-1 * 2 * var(--selector-size));
            right: calc(-1 * 2 * var(--selector-size));
            cursor: se-resize;
        }
        &--bottom-left {
            bottom: calc(-1 * 2 * var(--selector-size));
            left: calc(-1 * 2 * var(--selector-size));
            cursor: sw-resize;
        }
        &--middle-right {
            top: 50%;
            right: calc(-1 * 2 * var(--selector-size));
            transform: translateY(-50%);
            cursor: e-resize;
        }
        &--middle-left {
            top: 50%;
            left: calc(-1 * 2 * var(--selector-size));
            transform: translateY(-50%);
            cursor: w-resize;
        }

        &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(2 * var(--selector-size));
            height: calc(2 * var(--selector-size));
            background-color: white;
            border-radius: 50%;
            opacity: 0;
        }

        &:hover {
            &::after {
                opacity: 1;
            }
        }
    }

    > .rotate {
        position: absolute;
        bottom: calc(-1 * 2 * 4 * var(--selector-size));
        right: 50%;
        pointer-events: auto;
        cursor: grab;

        transform: translateX(50%);

        width: calc(4 * var(--selector-size));
        height: calc(4 * var(--selector-size));

        background-color: rgba(0, 0, 0, 1);
        border-radius: 50%;
    }
}
</style>
