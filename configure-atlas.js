#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   MongoDB Atlas Configuration Setup                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

This script will help you configure MongoDB Atlas connection.

Please have the following information ready:
1. MongoDB Atlas Connection String
2. Database Username
3. Database Password

`);

const questions = [
  {
    key: 'uri',
    prompt: 'Enter your MongoDB Atlas connection string\n(e.g., mongodb+srv://user:pass@cluster.mongodb.net/dbname): ',
  }
];

let config = {};

function askQuestion(index) {
  if (index >= questions.length) {
    updateEnvFile();
    return;
  }

  const question = questions[index];
  rl.question(question.prompt, (answer) => {
    config[question.key] = answer.trim();
    askQuestion(index + 1);
  });
}

function updateEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update MONGODB_URI
    envContent = envContent.replace(
      /MONGODB_URI=.*/,
      `MONGODB_URI=${config.uri}`
    );

    fs.writeFileSync(envPath, envContent);

    console.log(`
✅ Configuration updated successfully!

Your .env file has been updated with:
- MONGODB_URI: ${config.uri.replace(/:[^:@]+@/, ':****@')}

Next steps:
1. Start the backend server: npm start
2. Check the connection in the server logs
3. Seed the database: npm run seed

`);

    rl.close();
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Start the questionnaire
askQuestion(0);
