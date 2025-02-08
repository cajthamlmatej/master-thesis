import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {shapes} from "@/editor/block/shape/Shapes";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockInteractiveProperty, BlockInteractivityEasings} from "@/editor/interactivity/BlockInteractivity";

export class ShapePlayerBlock extends PlayerBlock {
    private color: string;
    private shape: string;

    private readonly blockBaseValues: {
        color: string;
        shape: string;
    }

    constructor(base: BlockConstructorWithoutType, color: string, shape: string) {
        super({
            ...base,
            type: "shape"
        });
        this.color = color;
        this.shape = shape;
        this.blockBaseValues = {
            color,
            shape
        }
    }

    render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-shape");

        const content = document.createElement("div");
        content.classList.add("block-content");

        element.appendChild(content);

        return element;
    }

    override synchronize() {
        super.synchronize();

        const content = this.element.querySelector(".block-content")! as HTMLElement;
        content.style.setProperty("--color", this.color);

        const shape = shapes.find(s => s.name === this.shape);

        if(!shape) {
            console.error("[ShapeEditorBlock] Shape not found: " + this.shape);
            // Render red error box with red text
            content.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <rect x="0" y="0" width="100" height="100" fill="red" />
  <text x="50" y="50" fill="white" font-size="10" text-anchor="middle" dominant-baseline="middle" id="error-text">${this.shape}</text>
</svg>`;
            return;
        }

        content.innerHTML = shape.html;
        content.className = "block-content";
        for(const c of shape.class || [])
            content.classList.add(c);
    }

    private stepsEasing = (steps: number, jumpType = "end") => (t: number) => {
        const stepSize = 1 / steps;
        if (jumpType === "start") {
            return Math.ceil(t / stepSize) * stepSize;
        } else {
            return Math.floor(t / stepSize) * stepSize;
        }
    };

    private animations = {
        LINEAR: (t) => t,
        EASE_IN: (t) => t * t,
        EASE_OUT: (t) => t * (2 - t),
        EASE_IN_OUT: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        EASE: (t) => 3 * t * t - 2 * t * t * t,
        STEPS_4: this.stepsEasing(4, "end"),
        STEPS_6: this.stepsEasing(6, "end"),
        STEPS_8: this.stepsEasing(8, "end"),
        STEPS_10: this.stepsEasing(10, "end"),
    } as Record<keyof typeof BlockInteractivityEasings, (t: number) => number>;

    override getInteractivityProperties(): BlockInteractiveProperty[] {
        return [
            ...super.getInteractivityProperties(),
            {
                label: "Color",
                change: (value: string, relative: boolean, {animate, duration, easing}) => {
                    let target = value;

                    // TODO: validate if is color

                    if (animate) {
                        const content = this.element.querySelector(".block-content")! as HTMLElement;
                        const fnc = this.animations[easing as keyof typeof BlockInteractivityEasings];
                        let start: number | null = null;
                        const step = (timestamp: number)=> {
                            if (!start) start = timestamp;
                            let progress = (timestamp - start) / duration;
                            if (progress > 1) progress = 1;

                            const easedProgress = fnc(progress);

                            const interpolatedColor = this.interpolateColor(this.color, target, easedProgress);
                            content.style.setProperty("--color", interpolatedColor);

                            if (progress < 1) {
                                requestAnimationFrame(step);
                            } else {
                                this.color = target;
                                this.synchronize();
                            }
                        }
                        requestAnimationFrame(step);
                    } else {
                        this.color = target;
                        this.synchronize();
                    }
                },
                getBaseValue: () => this.blockBaseValues.color
            },
            {
                label: "Shape",
                change: (value: string, relative: boolean, {animate, duration, easing}) => {
                    let shape = shapes.find(s =>
                        s.name.toLowerCase() === value.toLowerCase() ||
                        s.name.toLowerCase().replace(" ", "") === value.toLowerCase());

                    this.shape = shape ? shape.name : value;
                    this.synchronize();
                },
                getBaseValue: () => this.blockBaseValues.shape
            }
        ]
    }


    private interpolateColor(color1: string, color2: string, factor: number) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        const result = {
            r: Math.round(c1.r + (c2.r - c1.r) * factor),
            g: Math.round(c1.g + (c2.g - c1.g) * factor),
            b: Math.round(c1.b + (c2.b - c1.b) * factor),
        };
        return `rgb(${result.r}, ${result.g}, ${result.b})`;
    }

    private hexToRgb(hex: string) {
        const bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    }
}
