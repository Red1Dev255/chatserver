import { Router } from 'express';
import IndexController from '../controllers/index';

const router = Router();
const indexController = new IndexController();

export function setRoutes(app:any) {
  router.get('/', (req, res) => {
    res.send('Le serveur est en marche');
  });

  // Add more routes as needed, for example:
  // router.post('/some-endpoint', indexController.someMethod);

  app.use('/', router);
}