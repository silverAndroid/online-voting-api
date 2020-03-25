require('dotenv').load();
const XLSX = require('xlsx');
const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

const args = process.argv.slice(2);
if (!args[0]) throw new Error('You need to pass in the path for the Excel file');

const workbook = XLSX.readFile(args[0]);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

writeFile(
  'data/voters.json',
  JSON.stringify(
    XLSX.utils.sheet_to_json(sheet)
      .map(({ 'E-mail': email }) => email.toLowerCase())
  )
)
  .catch(console.error);

