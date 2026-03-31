import http from "http";
import https from "https";
import { URL } from "url";
import logger from "../logger.js";

/**
 * Function that generates a piece of proxy middleware
 *
 * Example usage: app.use('/foo', proxy('http://localhost:6900'))
 *
 * @param {*} to - where to proxy the requests to
 */
const proxy = (to) => (req, res) => {
  const url = new URL(to + req.originalUrl);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: req.method,
    headers: req.headers
  };

  // logger.debug("Forwarding request", { path: options.path });

  const proxy = url.protocol === "https:" ? https : http;
  const proxyReq = proxy.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (e) => {
    logger.error(`Unable to forward request to ${url}`, { error: e });
    res.sendStatus(500);
  });

  if (req.method !== "GET" && req.method !== "HEAD") {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
};

export default proxy;
