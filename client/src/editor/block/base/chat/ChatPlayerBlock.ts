import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {useUserStore} from "@/stores/user";
import {communicator} from "@/api/websockets";
import {$t} from "@/translation/Translation";

export class ChatPlayerBlock extends PlayerBlock {
    constructor(base: BlockConstructorWithoutType) {
        super({
            ...base,
            type: "chat",
        });
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-chat");

        element.innerHTML = `<div class="loading"><span class="mdi mdi-loading mdi-spin"></span> <span>${$t("blocks.chat.loading")}</span></div>`;

        (async ()=> {
            if(!(await this.isInPlayerRoom())) {
                return;
            }

            this.initialize();
        })()

        return element;
    }

    private addMessage(message: string, author: string): void {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");

        const messageText = document.createElement("div");
        messageText.classList.add("message-content");
        messageText.innerText = message;

        const authorElement = document.createElement("div");
        authorElement.classList.add("message-author");
        authorElement.innerText = author;

        messageElement.appendChild(authorElement);
        messageElement.appendChild(messageText);

        const chat = this.element.querySelector(".chat") as HTMLDivElement;
        chat.appendChild(messageElement);
        chat.scrollTop = chat.scrollHeight;
    }

    private enabled: boolean = true;
    private initialize() {
        this.element.innerHTML = `<div class="header"><span>${$t('blocks.chat.title')}</span> <div class="actions"><input data-id="name" placeholder="${$t('blocks.chat.name-placeholder')}" type="text"></div><div data-id="pause" class="button mdi mdi-pause"></div></div><div class="chat"></div><div class="send"><input data-id="content" type="text"><button>${$t('blocks.chat.send')}</button></div>`;

        const input = this.element.querySelector("input[data-id=content]") as HTMLInputElement;
        const name = this.element.querySelector("input[data-id=name]") as HTMLInputElement;
        const button = this.element.querySelector("button") as HTMLButtonElement;
        const pause = this.element.querySelector("div[data-id=pause]") as HTMLDivElement;

        if(this.isPresenter()) {
            name.style.display = "none";
        } else {
            pause.style.display = "none";
        }

        const userStore = useUserStore();

        button.addEventListener("click", () => {
            if(!input.value.trim()) return;

            if(this.isPresenter()) {
                let nameValue = `${userStore.user?.name} (${$t('blocks.chat.presenter')})`;
                this.sendMessage(JSON.stringify({
                    message: input.value,
                    author: nameValue
                }));
                this.addMessage(input.value, nameValue);
            } else {
                let nameValue = communicator.socket.id;

                if(userStore.user) {
                    nameValue = `${userStore.user.name} (${communicator.socket.id})`;
                } else {
                    if (name.value.trim().length > 0) {
                        nameValue = name.value.trim().substring(0, 32);
                    }
                }

                this.sendMessage(JSON.stringify({
                    message: input.value,
                    author: nameValue
                }));
            }
            input.value = "";
        });

        pause.addEventListener("click", () => {
            if(this.enabled) {
                this.enabled = false;
                pause.classList.remove("mdi-pause");
                pause.classList.add("mdi-play");
            } else {
                this.enabled = true;
                pause.classList.remove("mdi-play");
                pause.classList.add("mdi-pause");
            }
        });
    }

    @BlockEventListener(BlockEvent.MESSAGE)
    private onMessage(data: { message: string, clientId?: string }) {
        if(!this.enabled) return;

        try {
            const parsedData = JSON.parse(data.message);
            this.addMessage(parsedData.message, parsedData.author ?? data.clientId);

            if(this.isPresenter()) {
                this.sendMessage(JSON.stringify({
                    author: parsedData.author,
                    message: parsedData.message,
                }));
            }
        } catch (e) {
            console.error("Error parsing message data", e);
            return;
        }
    }
}
