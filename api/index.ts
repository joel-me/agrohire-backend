const { bootstrap, server } = require('../dist/main');

let app: any;

module.exports = async (req: any, res: any) => {
  if (!app) {
    app = await bootstrap();
  }
  server(req, res);
};
