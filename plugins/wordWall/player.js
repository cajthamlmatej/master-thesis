export const initPlayer = function () {
    api.player.on("pluginBlockRender", function (block) {
        if(api.player.isPresenter()) {
            const words = (api.cache.get("words"+block.id) || "").split(",").filter(word => word.trim() !== "");

            return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Word Wall</title>
    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            width: 100%;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #fff;
        }

        #word-wall {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-content: center;
            width: 100%;
            min-height: 100vh;
            gap: 1em;
            box-sizing: border-box;
        }

        .word {
            align-self: center;
            height: fit-content;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
            border-radius: 8px;
            font-weight: bold;
            white-space: nowrap;
            transition: transform 0.3s, background 0.3s, font-size 0.3s ease;
        }

        .word:hover {
            transform: scale(1.1) rotate(-2deg);
        }
        #waiting {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2em;
            opacity: 1;
            transition: opacity 0.5s ease;
        }
        #waiting.hidden {
            opacity: 0;
            pointer-events: none;
        }
    </style>
</head>

<body>
    <div id="waiting">
        Waiting for first word...<br>
    </div>

    <div id="word-wall"></div>

    <script>
        const wordCounts = {};

        const MAX_FONT_SIZE = 64;
        const MIN_FONT_SIZE = 14;

        function getRandomColor() {
            const colors = [
                '#e74c3c', '#8e44ad', '#3498db', '#1abc9c', '#f1c40f', '#e67e22', '#2ecc71', '#9b59b6'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        function calculateFontSize(count, maxCount) {
            const scale = (count / maxCount);
            return MIN_FONT_SIZE + scale * (MAX_FONT_SIZE - MIN_FONT_SIZE);
        }

        const waitingScreen = document.getElementById('waiting');
        function addWordToWall(word) {
            if (waitingScreen) {
                waitingScreen.classList.add('hidden');
            }

            const container = document.getElementById('word-wall');
            wordCounts[word] = (wordCounts[word] || 0) + 1;

            const maxCount = Math.max(...Object.values(wordCounts));

            Object.entries(wordCounts).forEach(([w, count]) => {
                let span = document.getElementById(\`word-\${w}\`);
                if (!span) {
                    span = document.createElement('span');
                    span.className = 'word';
                    span.id = \`word-\${w}\`;
                    span.textContent = w;
                    span.style.backgroundColor = getRandomColor();
                    container.appendChild(span);
                }
                const fontSize = calculateFontSize(count, maxCount);
                span.style.fontSize = fontSize + 'px';
            });
        }

        
        window.addEventListener("message", function(event) {
            addWordToWall(event.data.message);
        });
    </script>
</body>

</html>`;
        } else {
            return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Word Wall</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html,
        body {
            min-height: 100%;
            width: 100%;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #fff;
            
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;

            gap: 1em;
        }

        input {
            --shadow-accent: 0 0 0.5em 0.005em rgb(93 64 139 / 27%);
            border: 0;
            border-radius: 1em;
            padding: 0.5em;
            background-color: #fff;
            box-shadow: var(--shadow-accent);
            font-size: 1em;
            width: 70%;
        }

        button {
            --color-primary-dark: #7b57c4;
            --color-primary: #907eb3;
            --shadow-accent: 0 0 0.5em 0.005em rgb(93 64 139 / 27%);
            border: 0;
            border-radius: 1em;
            padding: 0.5em 1em;
            background-color: var(--color-primary);
            color: white;
            box-shadow: var(--shadow-accent);
            font-size: 1em;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: var(--color-primary-dark);
            cursor: pointer;
        }
    </style>
</head>

<body>
    <input type="text">
    <button>Submit</button>

    <script>
        const input = document.querySelector('input[type="text"]');
        const button = document.querySelector('button');

        const send = () => {
            const word = input.value.trim();
            if (word) {
                window.parent.postMessage({target: "script", message: input.value.substring(0, 64)}, "*");
                input.value = '';
            }
        };

        button.addEventListener('click', send);

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                send();
            }
        });
    </script>
</body>

</html>`;
        }
    });
    api.player.on("pluginRemoteMessage", function (block, message) {
        if(api.player.isPresenter()) {
            api.cache.set("words"+block.id, (api.cache.get("words"+block.id) || "") + "," + message);
            block.sendMessage(message);
        } else {
            api.log(`Player received message: ${message} but not presenter`);
        }
    });
    api.player.on("pluginBlockMessage", function (block, message) {
        if(!api.player.isPresenter()) {
            block.sendRemoteMessage(message);
        } else {
            api.log(`Player received message: ${message} but is presenter`);
        }
    });
};