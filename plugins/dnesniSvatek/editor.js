export const onPanelMessage = (message) => {
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
        editor.sendPanelMessage(name);
        // @ts-ignore
        block.sendMessage(name);
    })
};


export const initEditor = function () {
    api.editor.on("panelMessage", onPanelMessage);
    api.editor.on("panelRegister", () => {
        const getName = async () => {
            if (api.cache.get("svatek") !== undefined) {
                return api.cache.get("svatek");
            }

            await api.fetch('https://svatkyapi.cz/api/day').then((data) => {
                let name = JSON.parse(data).name;
                api.cache.set("svatek", name);
            }).catch((error) => {
                api.log("Could not load svatek: " + error.toString());
                let name = "Nepodařilo se načíst svátek";
                api.cache.set("svatek", name);
            });

            return api.cache.get("svatek");
        }

        getName().then((name) => {
            api.editor.sendPanelMessage(name);
        });

        return `
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
            text-align: center;
        }
    
        section button:hover {
            background-color: #e0e0e0;
        }

        #value {
            font-weight: bold;
            font-size: 20px;
            text-align: center;
        }
    </style>
    
    <section>
        <button>
            Přidat pole dnešního svátku
        </button>
    
        <p>Dnešní svátek má:</p>
        <span id="value"></span>
    </section>
    
    
    <script>
    document.querySelector("button").addEventListener("click", () => {
        window.parent.postMessage({target: "script", message: "add"}, "*");
    });
    window.addEventListener("message", function(event) {
        document.querySelector("#value").innerText = event.data.message;
    });
    </script>
    `;
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