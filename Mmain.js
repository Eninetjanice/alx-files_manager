import dbClient from './utils/db';

process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '27017';
process.env.DB_DATABASE = 'files_manager';


const waitConnection = async () => {
  while (!dbClient.isAlive()) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

(async () => {
  console.log(dbClient.isAlive());
  await waitConnection();
  console.log(dbClient.isAlive());
  console.log(await dbClient.nbUsers());
  console.log(await dbClient.nbFiles());
})();
