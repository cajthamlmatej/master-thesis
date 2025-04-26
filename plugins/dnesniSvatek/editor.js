export const initEditor = function () {
    api.editor.registerCustomBlock({
        icon: "calendar-heart-outline",
        id: "dnesniSvatek",
        name: "Dnešní svátek",
    });
    api.editor.on("createCustomBlock", () => {
        const editor = api.editor;

        let centerX = editor.getSize().width / 2;
        let centerY = editor.getSize().height / 2;

        centerX -= 100;
        centerY -= 100;

        const id = editor.addBlock({
            type: 'plugin',
            position: {
                x: centerX,
                y: centerY
            },
            size: {
                width: 200,
                height: 200
            },
            rotation: 0,
            zIndex: 1000,
            opacity: 1,
            data: {
            },
            properties: []
        });

        let block = editor.getBlocks().find((block) => block.id === id);

        const getName = (fnc) => {
            if (api.cache.get("svatek") !== undefined) {
                fnc(api.cache.get("svatek"));

                return;
            }

            api.fetch('https://svatkyapi.cz/api/day').then((data) => {
                let name = JSON.parse(data).name;
                api.cache.set("svatek", name);

                fnc(name);
            }).catch((error) => {
                api.log("Could not load svatek: " + error.toString());
                let name = "Nepodařilo se načíst svátek";
                api.cache.set("svatek", name);
                fnc(name);
            });
        }

        getName((name) => {
            // @ts-ignore
            block.sendMessage(name);
        })

        return block.id;
    });
    api.editor.on("pluginBlockRender", function (block) {
        return `
<style>
* { padding: 0; margin: 0; }
body {
    height: 100vh;
    width: 100%;
}

div {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

#dnesni {
    font-size: 2em;
    color: black;
}
</style>

<div><p id="dnesni"></p></div>

<script>
window.addEventListener("message", function(event) {
console.log("message from parent", event.data);
    document.querySelector("#dnesni").innerText = event.data.message;
});

window.parent.postMessage({target: "script", message: "sendmessage"}, "*");
</script>`;
    });
    api.editor.on("pluginBlockMessage", function (block, message) {
        const getName = (fnc) => {
            if (api.cache.get("svatek") !== undefined) {
                fnc(api.cache.get("svatek"));

                return;
            }

            api.fetch('https://svatkyapi.cz/api/day').then((data) => {
                let name = JSON.parse(data).name;
                api.cache.set("svatek", name);

                fnc(name);
            }).catch((error) => {
                api.log("Could not load svatek: " + error.toString());
                let name = "Nepodařilo se načíst svátek";
                api.cache.set("svatek", name);
                fnc(name);
            });
        }

        getName((name) => {
            block.sendMessage(name);
        });
    });
};