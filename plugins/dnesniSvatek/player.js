export const initPlayer = function () {
    api.player.on("pluginBlockRender", function (block) {
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
    api.player.on("pluginBlockMessage", function (block, message) {
        block.sendMessage("Načítání...");
        
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