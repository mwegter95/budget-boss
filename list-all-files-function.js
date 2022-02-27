//requiring path and fs modules
const path = require('path');
const fs = require('fs').promises;

async function walk(dir) {
    let files = await fs.readdir(dir);
    files = await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) return walk(filePath);
        else if(stats.isFile()) return filePath;
    }));

    return files.reduce((all, folderContents) => all.concat(folderContents), []);
}

async function main() {
    console.log(await walk('public'))
}

main()

//// getAllFiles returns absolute paths
// const getAllFiles = function(dirPath, arrayOfFiles) {
//     files = fs.readdirSync(dirPath)
  
//     arrayOfFiles = arrayOfFiles || []
  
//     files.forEach(function(file) {
//       if (fs.statSync(dirPath + "/" + file).isDirectory()) {
//         arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
//       } else {
//         arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
//       }
//     })
  
//     return arrayOfFiles
//   }

//   console.log(getAllFiles("./public"));