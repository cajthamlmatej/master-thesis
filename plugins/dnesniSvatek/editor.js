export const onPanelMessage = function (message) {
    const editor = api.editor;

    let centerX = editor.getSize().width / 2;
    let centerY = editor.getSize().height / 2;

    centerX -= 100;
    centerY -= 100;

    editor.addBlock({
        type: 'iframe',
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
        content: `
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
    fetch('https://svatkyapi.cz/api/day').then((response) => {
        return response.json();
    }).then((data) => {
        document.querySelector("#dnesni").innerText = data.name;
    }).catch((error) => {
        document.querySelector("#dnesni").innerText = "Nepodařilo se načíst svátek";
    });
</script>
`,
    });
};

export const onPanelRegister = function () {
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
</style>

<section>
    <button>
        Přidat pole dnešního svátku
    </button>
</section>


<script>
document.querySelector("button").addEventListener("click", () => {
    window.parent.postMessage({target: "script", message: "add"}, "*");
});
</script>
`;
};