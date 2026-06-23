import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const envPath = path.join(process.cwd(), '.env');

async function main() {
  console.log(chalk.bold.cyan('\n🚀 Welcome to Maker Mode Onboarding! 🚀\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'dbType',
      message: 'Which database engine do you want to use for the MVP?',
      choices: [
        { name: 'PostgreSQL', value: 'postgres' },
        { name: 'MongoDB (Not implemented in schema yet)', value: 'mongodb', disabled: true }
      ]
    },
    {
      type: 'input',
      name: 'dbUrl',
      message: 'Enter your database connection string (URI):',
      default: 'postgresql://postgres:postgres@localhost:5432/mydb?schema=public',
      validate: (input) => input.trim().length > 0 ? true : 'Connection string is required.'
    }
  ]);

  console.log();
  const spinner = ora('Saving configuration...').start();

  try {
    // 1. Write or update .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const newEnvVars = {
      DATABASE_TYPE: answers.dbType,
      DATABASE_URL: answers.dbUrl
    };

    for (const [key, value] of Object.entries(newEnvVars)) {
      const regex = new RegExp(`^${key}=.*`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}="${value}"`);
      } else {
        envContent += `\n${key}="${value}"`;
      }
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    spinner.succeed('Configuration saved to .env file.');

    // 2. Run Prisma DB Push
    spinner.start('Pushing database schema with Prisma...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    
    spinner.succeed('Database schema pushed successfully!');
    console.log(chalk.bold.green('\n🎉 Database initialized! Your Maker environment is ready. 🎉\n'));

  } catch (error: any) {
    spinner.fail('Initialization failed.');
    console.error(chalk.red(error.message || error));
    process.exit(1);
  }
}

main().catch(error => {
  console.error(chalk.red('An unexpected error occurred:'), error);
  process.exit(1);
});
