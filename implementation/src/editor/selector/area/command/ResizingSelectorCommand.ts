import {SelectorCommand} from "@/editor/selector/area/SelectorCommand";
import type EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {createElementFromHTML} from "@/utils/CreateElementFromHTML";

export class ResizingSelectorCommand extends SelectorCommand {

    public getElements(): HTMLElement | HTMLElement[] {
        return [
            createElementFromHTML(`<div class="resize resize--top-left"></div>`),
            createElementFromHTML(`<div class="resize resize--top-right"></div>`),
            createElementFromHTML(`<div class="resize resize--bottom-left"></div>`),
            createElementFromHTML(`<div class="resize resize--bottom-right"></div>`),
            createElementFromHTML(`<div class="resize resize--middle-left"></div>`),
            createElementFromHTML(`<div class="resize resize--middle-right"></div>`),

            createElementFromHTML(`<div class="resize resize--top-middle"></div>`),
            createElementFromHTML(`<div class="resize resize--bottom-middle"></div>`),
        ]
    }

    public execute(event: MouseEvent, element: HTMLElement, selectorArea: EditorSelectorArea): void {
        let {x: initialX, y: initialY} = selectorArea.getEditor().screenToEditorCoordinates(event.clientX, event.clientY);

        const type = [...element.classList].find(c => c.startsWith('resize--'))?.replace('resize--', '') ?? 'top-left';

        const isLeft = type.includes('left');
        const isBottom = type.includes('bottom');
        const isNotProportional = type.includes('middle');
        const isProportional = !isNotProportional;
        const isProportionalX = type.includes('middle-left') || type.includes('middle-right');
        const isProportionalY = type.includes('top-middle') || type.includes('bottom-middle');

        const blockInitialData = selectorArea.getEditor().getSelector().getSelectedBlocks().map(block => {
            block.processEvent(BlockEvent.RESIZING_STARTED);

            const c0_x = block.position.x + block.size.width / 2.0;
            const c0_y = block.position.y + block.size.height / 2.0;

            const a: 0 | 1 = isLeft ? 1 : 0;
            const b: 0 | 1 = isBottom ? 1 : 0;
            const c: 0 | 1 = a === 1 ? 0 : 1;
            const d: 0 | 1 = b === 1 ? 0 : 1;

            const matrix = {
                a: c,
                b: b,
                c: a,
                d: d,
            };

            const l = block.position.x;
            const t = block.position.y;
            const w = block.size.width;
            const h = block.size.height;

            const q0_x: number = l + matrix.a * w;
            const q0_y: number = t + matrix.b * h;

            const p0_x: number = l + matrix.c * w;
            const p0_y: number = t + matrix.d * h;

            const theta: number = (Math.PI * 2 * block.rotation) / 360;
            const cos_t: number = Math.cos(theta);
            const sin_t: number = Math.sin(theta);

            const qp0_x = q0_x * cos_t - q0_y * sin_t - c0_x * cos_t + c0_y * sin_t + c0_x;
            const qp0_y = q0_x * sin_t + q0_y * cos_t - c0_x * sin_t - c0_y * cos_t + c0_y;

            const pp_x = p0_x * cos_t - p0_y * sin_t - c0_x * cos_t + c0_y * sin_t + c0_x;
            const pp_y = p0_x * sin_t + p0_y * cos_t - c0_x * sin_t - c0_y * cos_t + c0_y;

            return {
                block,
                qp0_x,
                qp0_y,
                pp_x,
                pp_y,
                aspectRatio: block.size.width / block.size.height,
                width: block.size.width,
                height: block.size.height
            }
        });


        const mouseMoveHandler = (event: MouseEvent) => {
            let {x: deltaX, y: deltaY} = selectorArea.getEditor().screenToEditorCoordinates(event.clientX, event.clientY);

            deltaX -= initialX;
            deltaY -= initialY;

            for (const {block, qp0_x, qp0_y, pp_x, pp_y, aspectRatio, width} of blockInitialData) {
                const qp_x: number = qp0_x + deltaX;
                const qp_y: number = qp0_y + deltaY;

                const cp_x: number = (qp_x + pp_x) / 2.0;
                const cp_y: number = (qp_y + pp_y) / 2.0;

                const mtheta: number = (-1 * Math.PI * 2 * block.rotation) / 360;
                const cos_mt: number = Math.cos(mtheta);
                const sin_mt: number = Math.sin(mtheta);

                let q_x: number = qp_x * cos_mt - qp_y * sin_mt - cos_mt * cp_x + sin_mt * cp_y + cp_x;
                let q_y: number = qp_x * sin_mt + qp_y * cos_mt - sin_mt * cp_x - cos_mt * cp_y + cp_y;

                let p_x: number = pp_x * cos_mt - pp_y * sin_mt - cos_mt * cp_x + sin_mt * cp_y + cp_x;
                let p_y: number = pp_x * sin_mt + pp_y * cos_mt - sin_mt * cp_x - cos_mt * cp_y + cp_y;

                const a: 0 | 1 = isLeft ? 1 : 0;
                const b: 0 | 1 = isBottom ? 1 : 0;
                const c: 0 | 1 = a === 1 ? 0 : 1;
                const d: 0 | 1 = b === 1 ? 0 : 1;

                const matrix = {
                    a: c,
                    b: b,
                    c: a,
                    d: d,
                };

                let wtmp: number = matrix.a * (q_x - p_x) + matrix.c * (p_x - q_x);
                let htmp: number = matrix.b * (q_y - p_y) + matrix.d * (p_y - q_y);


                if (isNotProportional) {
                    if (isProportionalX) {
                        wtmp = Math.max(wtmp, 10);
                        htmp = block.size.height;
                    } else if (isProportionalY) {
                        htmp = Math.max(htmp, 10);
                        wtmp = block.size.width;
                    }
                } else {
                    wtmp = Math.max(wtmp, 10);
                    htmp = wtmp / aspectRatio;
                }


                const theta: number = -1 * mtheta;
                const cos_t: number = Math.cos(theta);
                const sin_t: number = Math.sin(theta);

                const dh_x: number = -sin_t * htmp;
                const dh_y: number = cos_t * htmp;

                const dw_x: number = cos_t * wtmp;
                const dw_y: number = sin_t * wtmp;

                const qp_x_min: number = pp_x + (matrix.a - matrix.c) * dw_x + (matrix.b - matrix.d) * dh_x;
                const qp_y_min: number = pp_y + (matrix.a - matrix.c) * dw_y + (matrix.b - matrix.d) * dh_y;

                const cp_x_min: number = (qp_x_min + pp_x) / 2.0;
                const cp_y_min: number = (qp_y_min + pp_y) / 2.0;

                q_x = qp_x_min * cos_mt - qp_y_min * sin_mt - cos_mt * cp_x_min + sin_mt * cp_y_min + cp_x_min;
                q_y = qp_x_min * sin_mt + qp_y_min * cos_mt - sin_mt * cp_x_min - cos_mt * cp_y_min + cp_y_min;

                p_x = pp_x * cos_mt - pp_y * sin_mt - cos_mt * cp_x_min + sin_mt * cp_y_min + cp_x_min;
                p_y = pp_x * sin_mt + pp_y * cos_mt - sin_mt * cp_x_min - cos_mt * cp_y_min + cp_y_min;


                const newL: number = matrix.c * q_x + matrix.a * p_x;
                const newT: number = matrix.d * q_y + matrix.b * p_y;

                block.move(newL, newT, true);
                block.resize(wtmp, htmp, true);
                block.synchronize();

                const content = block.getContent();
                if (content) {
                    if (isProportional) {
                        content.style.transform = `scale(${wtmp / width})`;
                    } else {
                        block.matchRenderedHeight();
                    }
                }

                block.element.blur();
            }

            selectorArea.recalculateSelectionArea();
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);

            const type = [...element.classList].find(c => c.startsWith('resize--'))?.replace('resize--', '') ?? 'top-left';

            for (const {block, width, height} of blockInitialData) {

                block.processEvent(BlockEvent.RESIZING_ENDED,
                    ['bottom-right', 'top-left', 'top-right', 'bottom-left'].includes(type) ? "PROPORTIONAL" : "NON_PROPORTIONAL",
                    {width: width, height: height});
            }
            selectorArea.recalculateSelectionArea();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
    }

}
