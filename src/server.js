const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

start();
