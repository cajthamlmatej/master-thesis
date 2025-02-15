import Player from "@/editor/player/Player";
import {PlayerMode} from "@/editor/player/PlayerMode";

enum DrawMode {
    DRAW = "draw",
    ERASE = "erase"
}

export class PlayerDraw {
    private player: Player;
    private element: HTMLElement;

    constructor(player: Player) {
        this.player = player;

        this.init();
        this.setupUsage();

        this.player.events.MODE_CHANGED.on((mode) => {
            this.active = mode === PlayerMode.DRAW;
            this.synchronize();
        });
        this.player.events.CANVAS_REPOSITION.on(() => {
            this.synchronize();
        });
    }

    private active: boolean = false;
    private visible: boolean = true;

    private init() {
        this.element = document.createElement('div');
        this.element.classList.add('player-draw');

        this.element.innerHTML = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                class="player-draw-canvas"
                x="0px" y="0px"
                width="${this.player.getSize().width}px" height="${this.player.getSize().height}px"
                viewBox="0 0 ${this.player.getSize().width} ${this.player.getSize().height}"
                enable-background="new 0 0 ${this.player.getSize().width} ${this.player.getSize().height}"
                xml:space="preserve"></svg>

            <div class="player-draw-navigation">
                <div class="player-draw-navigation-settings" data-type="pen">
                    <div class="player-draw-navigation-settings-content">
                        <input type="range" min="1" max="100" value="20" data-value="penSize">
                    </div>
                </div>
                <div class="player-draw-navigation-settings" data-type="color">
                    <div class="player-draw-navigation-settings-content player-draw-navigation-settings-content--color">
                        <button data-color="#eeeeee" style="--color: #eeeeee"></button>
                        <button data-color="#212121" style="--color: #212121"></button>
                        <button data-color="#ee605a" style="--color: #ee605a"></button>
                        <button data-color="#95ee5a" style="--color: #95ee5a"></button>
                        <button data-color="#42abe3" style="--color: #42abe3"></button>
                        <button data-color="#e730b9" style="--color: #e730b9"></button>

                        <div class="divider"></div>

                        <input type="color" value="#000000" data-value="color">
                    </div>
                </div>
                <div class="player-draw-navigation-settings" data-type="opacity">
                    <div class="player-draw-navigation-settings-content">
                        <input type="range" min="1" max="100" value="100" data-value="opacity">
                    </div>
                </div>
                <div class="player-draw-navigation-settings" data-type="smoothing">
                    <div class="player-draw-navigation-settings-content">
                        <input type="range" min="1" max="100" value="8" data-value="smoothing">
                    </div>
                </div>
                <div class="player-draw-navigation-options">
                    <button data-open="pen"><span class="mdi mdi-pen"></span></button>
                    <button data-open="color"><span class="mdi mdi-palette"></span></button>
                    <button data-open="opacity"><span class="mdi mdi-circle-opacity"></span></button>
                    <button data-open="smoothing"><span class="mdi mdi-gesture"></span></button>
                    <button data-eraser><span class="mdi mdi-eraser"></span></button>
                    <button data-delete><span class="mdi mdi-delete-outline"></span></button>
                    <button data-visible><span class="mdi mdi-eye-circle-outline"></span></button>
                </div>
            </div>`;

        this.player.getElement().appendChild(this.element);
    }

    private synchronize() {
        this.element.classList.toggle("player-draw--active", this.active);
        this.element.classList.toggle("player-draw--visible", this.visible);

        if(this.visible) {
            const btn = this.element.querySelector("button[data-visible]") as HTMLElement;
            btn.classList.add("player-draw-navigation-options-option--active");
        }

        const navigation = this.element.querySelector(".player-draw-navigation") as HTMLElement;
        const height = document.body.clientHeight;
        const coords = this.player.screenToEditorCoordinates(0, height);

        let newY = (this.player.getSize().height - coords.y) + 10;

        if (newY < 10) {
            newY = 10;
        }

        // note(Matej): 200 is arbitrary number, it should be "somewhat" the height of the navigation
        if(newY > height - 200) {
            newY = height - 200;
        }

        navigation.style.bottom = `${newY}px`;
    }

    private resetSettings() {
        this.element.querySelector(".player-draw-navigation-options-option--active")
            ?.classList.remove("player-draw-navigation-options-option--active");

        this.element.querySelector(".player-draw-navigation-settings--active")
            ?.classList.remove("player-draw-navigation-settings--active");

        if (this.mode === DrawMode.ERASE) {
            this.element.querySelector(`button[data-eraser]`)
                ?.classList.add("player-draw-navigation-options-option--active");
        }
        if (this.visible) {
            this.element.querySelector(`button[data-visible]`)
                ?.classList.add("player-draw-navigation-options-option--active");
        }

        this.activeSettings = null;
    }

    private activeSettings: string | null = null;

    private setupUsage() {
        window.addEventListener("mousedown", this.mouseDownEvent.bind(this));

        const buttons = this.element.querySelectorAll(".player-draw-navigation-options button");

        for (const button of buttons) {
            button.addEventListener("click", () => {
                if (button.hasAttribute("data-eraser")) {
                    this.mode = this.mode === DrawMode.ERASE ? DrawMode.DRAW : DrawMode.ERASE;

                    if (this.mode === DrawMode.ERASE) {
                        button.classList.add("player-draw-navigation-options-option--active");
                    } else {
                        button.classList.remove("player-draw-navigation-options-option--active");
                    }

                    this.resetSettings();
                    return;
                } else if (button.hasAttribute("data-delete")) {
                    const canvas = this.element.querySelector(".player-draw-canvas") as HTMLElement;
                    canvas.innerHTML = "";
                    return;
                } else if (button.hasAttribute("data-visible")) {
                    this.visible = !this.visible;
                    this.synchronize();

                    if (this.visible) {
                        button.classList.add("player-draw-navigation-options-option--active");
                    } else {
                        button.classList.remove("player-draw-navigation-options-option--active");
                    }
                    return;
                }

                this.mode = DrawMode.DRAW;

                let active = this.activeSettings;
                this.resetSettings();
                if (active === button.getAttribute("data-open")) {
                    return;
                }

                this.activeSettings = button.getAttribute("data-open");

                this.element
                    .querySelector(`.player-draw-navigation-settings[data-type="${this.activeSettings}"]`)
                    ?.classList.add("player-draw-navigation-settings--active");
                this.element
                    .querySelector(`button[data-open="${this.activeSettings}"]`)
                    ?.classList.add("player-draw-navigation-options-option--active");
            });
        }

        const penSize = this.element.querySelector('input[data-value="penSize"]') as HTMLInputElement;
        penSize.addEventListener("input", () => {
            this.penSize = parseInt(penSize.value);
        });
        const color = this.element.querySelector('input[data-value="color"]') as HTMLInputElement;
        color.addEventListener("input", () => {
            this.penColor = color.value;
        });
        const colorButtons = this.element.querySelectorAll('button[data-color]');
        for (const button of colorButtons) {
            button.addEventListener("click", () => {
                this.penColor = button.getAttribute("data-color")!;
                color.value = this.penColor;
            });
        }
        const opacity = this.element.querySelector('input[data-value="opacity"]') as HTMLInputElement;
        opacity.addEventListener("input", () => {
            this.opacity = parseInt(opacity.value);
        });
        const smoothing = this.element.querySelector('input[data-value="smoothing"]') as HTMLInputElement;
        smoothing.addEventListener("input", () => {
            this.smoothing = parseInt(smoothing.value);
        });
    }

    private mode = DrawMode.DRAW;
    private penSize: number = 20;
    private penColor: string = "#000000";
    private opacity: number = 100;
    private smoothing: number = 8;

    private mouseDownEvent(event: MouseEvent) {
        if (this.player.getMode() !== PlayerMode.DRAW) return;

        if (event.button !== 0) return;

        const target = event.target as HTMLElement;

        if (["INPUT", "BUTTON", "SPAN"].includes(target.tagName)) return;
        if (target.classList.contains("player-draw-navigation-settings-content")) return;

        this.resetSettings();
        if (this.mode === DrawMode.ERASE) {
            this.erase(event);
        } else {
            this.draw(event);
        }
    }

    private draw(event: MouseEvent) {
        const canvas = this.element.querySelector(".player-draw-canvas") as HTMLElement;
        const bufferSize = this.smoothing;
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", this.penColor);
        path.setAttribute("stroke-width", (this.penSize).toString());
        path.setAttribute("stroke-opacity", (this.opacity / 100).toString());
        path.setAttribute("stroke-linecap", "round");

        let buffer = [] as { x: number, y: number }[];
        let point = this.player.screenToEditorCoordinates(event.clientX, event.clientY);

        const appendToBuffer = (pt: { x: number, y: number }) => {
            buffer.push(pt);
            while (buffer.length > bufferSize) {
                buffer.shift();
            }
        }

        const getAveragePoint = function (offset: number) {
            const length = buffer.length;
            if (length % 2 === 1 || length >= bufferSize) {
                let totalX = 0;
                let totalY = 0;
                let point, i;
                let count = 0;

                for (i = offset; i < length; i++) {
                    count++;
                    point = buffer[i];
                    totalX += point.x;
                    totalY += point.y;
                }

                return {
                    x: totalX / count,
                    y: totalY / count
                }
            }
            return null;
        };

        const updateSvgPath = function () {
            let point = getAveragePoint(0);

            if (point) {
                strPath += " L" + point.x + " " + point.y;

                let temporaryPath = "";
                for (let offset = 2; offset < buffer.length; offset += 2) {
                    point = getAveragePoint(offset);

                    if (!point) continue;

                    temporaryPath += " L" + point.x + " " + point.y;
                }

                path.setAttribute("d", strPath + temporaryPath);
            }
        };

        appendToBuffer(point);
        let strPath = "M" + point.x + " " + point.y;
        path.setAttribute("d", strPath);

        canvas.appendChild(path);

        const handleMove = (event: MouseEvent) => {
            if (this.player.getMode() !== PlayerMode.DRAW) return;

            point = this.player.screenToEditorCoordinates(event.clientX, event.clientY);
            appendToBuffer(point);

            updateSvgPath();
        }

        const handleUp = (event: MouseEvent) => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);

            const pathLength = path.getTotalLength();

            // note(Matej): create a point if user didnt move the mouse enough
            if (pathLength < 10) {
                const point = path.getPointAtLength(pathLength - 1);
                strPath += " L" + (point.x + 1) + " " + (point.y);
                path.setAttribute("d", strPath);
            }
        }

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
    }

    private erase(event: MouseEvent) {
        const canvas = this.element.querySelector(".player-draw-canvas") as SVGSVGElement;
        if (!canvas) return;

        const erase = (event: MouseEvent) => {
            const paths = canvas.querySelectorAll("path");
            const cursorPoint = this.player.screenToEditorCoordinates(event.clientX, event.clientY);

            paths.forEach(path => {
                const pathLength = path.getTotalLength();
                for (let i = 0; i < pathLength; i += 5) { // Check every few points along the path
                    const point = path.getPointAtLength(i);
                    const distance = Math.sqrt(
                        Math.pow(point.x - cursorPoint.x, 2) + Math.pow(point.y - cursorPoint.y, 2)
                    );

                    if (distance < 10) {
                        path.remove();
                        break;
                    }
                }
            });
        };
        erase(event);

        const handleMove = (event: MouseEvent) => {
            erase(event);
        };

        const handleUp = () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
    }

    public getData() {
        const canvas = this.element.querySelector(".player-draw-canvas") as HTMLElement;
        return canvas.innerHTML;
    }

    public applyData(data: string) {
        const canvas = this.element.querySelector(".player-draw-canvas") as HTMLElement;
        canvas.innerHTML = data;
    }
}
