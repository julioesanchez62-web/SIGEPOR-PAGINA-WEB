const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`SIGEPOR backend running on port ${port}`);
});
