export const onPanelMessage = (message) => {
    const editor = api.editor;

    let centerX = editor.getSize().width / 2;
    let centerY = editor.getSize().height / 2;

    centerX -= 100;
    centerY -= 100;

    editor.addBlock({
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
            positive: "Yes",
            negative: "No"
        },
        properties: [
            {
                key: 'positive',
                label: 'Positive',
                type: 'text',
            },
            {
                key: 'negative',
                label: 'Negative',
                type: 'text',
            }
        ]
    });
};


export const initEditor = function () {
    api.editor.on("panelMessage", onPanelMessage);
    api.editor.on("panelRegister", () => {
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
            background-color:rgba(236, 236, 239, 0.86);
            backdrop-filter: blur(18px);
            cursor: pointer;
            color: #333;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
            font-size: 20px;
            transition: background-color 0.3s ease;
            text-align: center;
            border-radius: 1em;
        }
    
        section button:hover {
            background-color: rgba(227, 227, 240, 0.86);
        }

        #value {
            font-weight: bold;
            font-size: 20px;
            text-align: center;
        }
    </style>
    
    <section>
        <button>
            Add yes/no vote
        </button>
    </section>
    
    
    <script>
        document.querySelector("button").addEventListener("click", () => {
            window.parent.postMessage({target: "script", message: "add"}, "*");
        });
    </script>
    `;
    });
    api.editor.on("pluginBlockPropertyChange", (block) => {
        block.render();
    });
    api.editor.on("pluginBlockRender", function (block) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vote</title>
    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            width: 100%;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #fff;
        
            display: flex;
            justify-content: center;
            align-items: stretch;
            gap: 20px;
        }

        .button {
            display: flex;
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
            gap: 40px;

            background-color: #2c3e50;
            border-radius: 10px;
        }

        .button span {
            font-size: 4em;
            font-weight: bold;
            color: #ecf0f1;
            text-align: center;
        }
        .button span.count {
            font-size: 3em;
            color: #ffffffc3;
            margin-top: 10px;
        }

        #yes {
            background-color: #2ecc71;
        }
        #no {
            background-color: #e74c3c;
        }
    </style>
</head>

<body>
    <div id="yes" class="button">
        <span>${block.data.positive}</span>

        <span class="count">0</span>
    </div>
    <div id="no" class="button">
        <span>${block.data.negative}</span>

        <span class="count">0</span>
    </div>
</body>

</html>`;
    });
};