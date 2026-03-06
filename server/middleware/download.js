import { fromNodeMiddleware } from 'h3';
import downloadRouter from '../../ui/api/download.js';

export default fromNodeMiddleware((req, res, next) => {
  // Only handle requests that look like file downloads (have a format extension)
  if (!req.url?.match(/\.[a-z0-9_-]+$/)) {
    return next();
  }

  return downloadRouter(req, res, next);
});
