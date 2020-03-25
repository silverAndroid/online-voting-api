require('dotenv').load();
const XLSX = require('xlsx');
const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

const workbook = XLSX.readFile(process.env.VOTER_LIST);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

writeFile(
  'data/voters.json',
  JSON.stringify(
    XLSX.utils.sheet_to_json(sheet)
      .map(({ 'E-mail': email }) => email.toLowerCase())
  )
)
  .catch(console.error);

