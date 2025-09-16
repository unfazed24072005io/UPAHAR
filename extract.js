const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');

yauzl.open('app.zip', { lazyEntries: true }, (err, zipfile) => {
  if (err) throw err;
  
  zipfile.readEntry();
  zipfile.on('entry', (entry) => {
    if (/\/$/.test(entry.fileName)) {
      // Directory entry
      const dirPath = entry.fileName;
      fs.mkdirSync(dirPath, { recursive: true });
      zipfile.readEntry();
    } else {
      // File entry
      zipfile.openReadStream(entry, (err, readStream) => {
        if (err) throw err;
        
        const filePath = entry.fileName;
        const dirPath = path.dirname(filePath);
        
        // Ensure directory exists
        fs.mkdirSync(dirPath, { recursive: true });
        
        const writeStream = fs.createWriteStream(filePath);
        readStream.pipe(writeStream);
        
        writeStream.on('close', () => {
          zipfile.readEntry();
        });
      });
    }
  });
  
  zipfile.on('end', () => {
    console.log('Extraction complete');
    fs.unlinkSync('extract.js'); // Clean up the extraction script
  });
});