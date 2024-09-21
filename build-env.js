/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const keys = ['DATABSE_PASSWORD', 'MONGODB_URI'];

function generateEnvJson(filePath) {
  let configsFolderPath = path.dirname(filePath);
  if (!fs.existsSync(configsFolderPath)) {
    fs.mkdirSync(configsFolderPath, { recursive: true });
  }

  let envVars = {};

  keys.forEach((key) => {
    envVars[key] = process.env[key];
  });

  let envVarsJson = JSON.stringify(envVars);
  fs.writeFile(filePath, envVarsJson, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
    console.log('Successfully wrote to file:', filePath);
  });
}

generateEnvJson((filePath = './configs/config.dev.json'));

generateEnvJson((filePath = './configs/config.prod.json'));
