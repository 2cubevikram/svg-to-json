import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/generate-json', async (req, res) => {
    const iconsPath = 'C:/Users/Admin/Desktop/Line icons'; // Adjust this path
    try {
        const categories = fs.readdirSync(iconsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const icons = {};
        for (let category of categories) {
            const categoryPath = path.join(iconsPath, category);
            const files = fs.readdirSync(categoryPath)
                .filter(file => file.endsWith('.svg'));

            icons[category] = {};
            for (let file of files) {
                const filePath = path.join(categoryPath, file);
                const content = fs.readFileSync(filePath, 'utf8')
                    .replace(/\r?\n|\r/g, ' '); // Remove newlines

                const iconName = path.basename(file, '.svg');
                icons[category][iconName] = `'${content}'`;
            }
        }

        // Custom stringification to match your exact format
        let jsonString = '{\n';
        for (let category in icons) {
            jsonString += `  '${category}': {\n`;
            for (let icon in icons[category]) {
                jsonString += `    '${icon}': ${icons[category][icon]},\n`;
            }
            jsonString = jsonString.trimEnd().slice(0, -1); // Remove last comma
            jsonString += '\n  },\n';
        }
        jsonString = jsonString.trimEnd().slice(0, -1); // Remove last comma
        jsonString += '\n}';

        const jsonPath = path.join('public', 'icons.json');
        fs.writeFileSync(jsonPath, jsonString, 'utf8');

        res.send('Icons JSON has been created and is available at /icons.json');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while generating the JSON.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});