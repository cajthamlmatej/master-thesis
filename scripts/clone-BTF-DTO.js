const fs = require('fs');

const frontend = '../client/lib/dto';
const backend = '../server/dto';

// Clear DTO frontend folder
{
    const files = fs.readdirSync(frontend);
    for (const file of files) {
        if (fs.statSync(`${frontend}/${file}`).isDirectory()) {
            fs.rmdirSync(`${frontend}/${file}`, { recursive: true });
            continue;
        }
        fs.unlinkSync(`${frontend}/${file}`);
    }
}

// Clone DTO backend folder to frontend folder
{
    const files = fs.readdirSync(backend);
    for (const file of files) {
        if (fs.statSync(`${backend}/${file}`).isDirectory()) {
            fs.cpSync(`${backend}/${file}`, `${frontend}/${file}`, { recursive: true });
            continue;
        }
        fs.copyFileSync(`${backend}/${file}`, `${frontend}/${file}`);
    }
}

console.log('DTO cloned successfully!');