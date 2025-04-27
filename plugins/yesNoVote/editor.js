

export const initEditor = function () {
    api.editor.registerCustomBlock({
        icon: "vote",
        id: "yesNoVote",
        name: "Yes/No Vote",
    });
    api.editor.on("createCustomBlock", () => {
        const editor = api.editor;

        let centerX = editor.getSize().width / 2;
        let centerY = editor.getSize().height / 2;

        centerX -= 100;
        centerY -= 100;

        return editor.addBlock({
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