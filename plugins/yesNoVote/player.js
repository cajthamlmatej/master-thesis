export const initPlayer = function () {
    api.player.on("pluginBlockRender", function (block) {
        if(api.player.isPresenter()) {
            const votes = (api.cache.get("votes-" + block.id) || "").split(",").filter(word => word.trim() !== "");

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

    <script>
        const yesCount = document.querySelector("#yes .count");
        const noCount = document.querySelector("#no .count");

        let votes = {};

        const updateCount = function() {
            let yes = 0;
            let no = 0;

            for (const id in votes) {
                if (votes[id] === 1) {
                    yes++;
                } else if (votes[id] === -1) {
                    no++;
                }
            }

            yesCount.innerText = yes;
            noCount.innerText = no;
        };

        const process = function(message) {
            const [id, type] = message.split(":");

            if(!id || !type) {
                return;
            }

            // If already voted, remove the vote
            votes[id] = type === "yes" ? 1 : -1;
            updateCount();
        };
        
        window.addEventListener("message", function(event) {
            process(event.data.message);
        });

        [${votes.map(vote => `"${vote}"`).join(",")}].forEach(vote => {
            process(vote);
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

            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .button span {
            font-size: 4em;
            font-weight: bold;
            color: #ecf0f1;
            text-align: center;
        }

        #yes {
            background-color: #2ecc71;
        }
        #no {
            background-color: #e74c3c;
        }
        #yes:hover {
            background-color: #27ae60;
        }
        #no:hover {
            background-color: #c0392b;
        }
    </style>
</head>

<body>
    <div id="yes" class="button">
        <span>${block.data.positive}</span>

    </div>
    <div id="no" class="button">
        <span>${block.data.negative}</span>
    </div>

    <script>
        const yesButton = document.getElementById('yes');
        const noButton = document.getElementById('no');

        yesButton.addEventListener('click', () => {    
            window.parent.postMessage({target: "script", message: "yes"}, "*");
        });
        noButton.addEventListener('click', () => {    
            window.parent.postMessage({target: "script", message: "no"}, "*");
        });
    </script>
</body>

</html>`;
        }
    });
    api.player.on("pluginRemoteMessage", function (block, message, clientId) {
        let key = `${clientId}:${message}`;
        if(api.player.isPresenter()) {
            api.cache.set("votes" + block.id, (api.cache.get("votes" + block.id) || "") + "," + key);
            block.sendMessage(key);
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