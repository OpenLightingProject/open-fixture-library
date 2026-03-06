import { fromNodeMiddleware } from 'h3';
import apiApp from '../../ui/api/index.js';

export default fromNodeMiddleware((req, res, next) => {
  if (!req.url?.startsWith('/api/v1')) {
    return next();
  }

  const originalUrl = req.url;
  req.url = req.url.slice('/api/v1'.length) || '/';
  // restore originalUrl on next (in case download middleware needs it)
  const wrappedNext = () => {
    req.url = originalUrl;
    next();
  };

  return apiApp(req, res, wrappedNext);
});
