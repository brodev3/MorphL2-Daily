const fs = require('fs');
const crypto = require('crypto');
const csv = require('csv-parser');
require('dotenv').config();  
const path = require("path")

const secretKey = crypto.createHash('sha256').update(process.env.MESSAGE).digest();
const inputFilePath = path.resolve(path.resolve(__dirname, '..'), '..') + '/input/w.csv';

function decrypt(text, secretKey) {
  const [iv, encrypted] = text.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

async function readDecryptCSVToArray() {
  return new Promise((resolve, reject) => {
    const decryptedRows = [];

    fs.createReadStream(inputFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const decryptedRow = {};

        for (let key in row) 
          decryptedRow[key] = decrypt(row[key], secretKey);
        
        decryptedRows.push(decryptedRow);
      })
      .on('end', () => {
        console.log('Файл успешно расшифрован.');
        const result = decryptedRows.map(row => {
          return Object.values(row).join(','); 
        });
        resolve(result);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.78 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.128 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.87 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6151.58 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.58 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.1253.31 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6144.49 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.3575.24 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.7453.4 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.8422.34 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.2349.75 Safari/537.36",
];

let get_UA = function () {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const timeToNextDay = () => {
    const nowUTC = new Date(Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate(),
        new Date().getUTCHours(),
        new Date().getUTCMinutes(),
        new Date().getUTCSeconds()
    ));
    
    const nextDayStartUTC = new Date(Date.UTC(
        nowUTC.getUTCFullYear(),
        nowUTC.getUTCMonth(),
        nowUTC.getUTCDate() + 1 
    ));
    
    const randomMinutes = Math.floor(Math.random() * 23 * 60); 
    const randomDateUTC = new Date(nextDayStartUTC.getTime() + randomMinutes * 60 * 1000);
    
    return randomDateUTC - nowUTC;
};

module.exports.get_UA = get_UA;
module.exports.timeToNextDay = timeToNextDay;
module.exports.readDecryptCSVToArray = readDecryptCSVToArray;
