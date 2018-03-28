#!/usr/bin/node

// crypto is expected to be installed globally

const crypto = require(`crypto`);
const http = require(`http`);
const { execSync, spawn } = require(`child_process`);

const pm2config = require(`./ecosystem.config.js`);

const servers = [];
const webhooks = {};

for (const deployment of Object.keys(pm2config.deploy)) {
  if (!pm2config.deploy[deployment]._webhook_port) {
    console.log(`No webhook port configured for '${deployment}' deployment`);
    continue;
  }

  webhooks[deployment] = {
    port: pm2config.deploy[deployment]._webhook_port,
    path: pm2config.deploy[deployment]._webhook_path,
    secret: pm2config.deploy[deployment]._webhook_secret
  };

  startServer(webhooks[deployment].port, deployment);
}

Promise.all(servers).then(
  () => console.log(`Exited`)
);


/**
 * @param {!number} port The port that the server should listen at.
 * @param {!string} deployment The name of the deployment this webhook belongs to.
 */
function startServer(port, deployment) {
  console.log(`Starting webhook listener for ${deployment} on port ${port}`);

  servers.push(new Promise((resolve, reject) => {
    http
      .createServer((request, response) => {
        response.writeHead(200, {'Content-Type': `text/plain`});
        response.write(`Received`);
        response.end();

        if (request.method !== `POST`) {
          return;
        }

        let body = ``;
        request
          .on(`data`, data => {
            body += data;
          })
          .on(`end`, () => {
            processRequest(port, request.url, body, request.headers);
          });

      })
      .on(`close`, resolve)
      .listen(port);
  }));
}

/**
 * Handle a received request from the server and check if it is valid. If so,
 * call @see redeploy to update the corresponding app.
 *
 * @param {!number} port The port number this request was received in.
 * @param {!string} url The absolute path the request was received at.
 * @param {!string} body The JSON string from GitHub.
 * @param {!Object.<string, string>} headers Headers of the request.
 */
function processRequest(port, url, body, headers) { // eslint-disable-line complexity
  console.log(`Received request`, port, url);

  for (const name of Object.keys(webhooks)) {
    const options = webhooks[name];

    if (options.port !== port) {
      continue;
    }

    if (options.path.length && options.path !== url) {
      continue;
    }

    if (options.secret.length) {
      const hmac = crypto.createHmac(`sha1`, options.secret);
      hmac.update(body, `utf-8`);

      const xub = `X-Hub-Signature`;
      const received = headers[xub] || headers[xub.toLowerCase()];
      const expected = `sha1=${hmac.digest(`hex`)}`;

      if (received !== expected) {
        console.error(`Wrong secret. Expected %s, received %s`, expected, received);
        continue;
      }

      console.info(`Secret test passed`);
    }

    const eventName = headers[`X-GitHub-Event`] || headers[`x-github-event`];
    if (eventName !== `status`) {
      console.log(`Wrong event name. Expected 'status', received '${eventName}'`);
      continue;
    }

    const json = JSON.parse(body);

    const affectsMasterBranch = `branches` in json && json.branches.some(branch => branch.name === `master`);
    if (json.state !== `success` || !affectsMasterBranch) {
      console.log(`Only handle successful events on master branch.`);
      continue;
    }

    redeploy(name);
  }
}

/**
 * Calls `pm2 deploy` with the correct ecosystem file and deployment name to
 * fetch the newest git source and redeploy the corresponding app.
 * @param {!string} name Name of the deployment to redeploy.
 */
function redeploy(name) {
  console.log(`redeploy ${name}`);

  const command = `pm2`;
  const args = [`deploy`, `/home/flo/ecosystem.config.js`, name];
  const cwd = `${pm2config.deploy[name].path}/current`;

  console.log(`spawn '${command} ${args.join(` `)}' in directory '${cwd}'`);
  const subprocess = spawn(command, args, {
    cwd: cwd,
    stdio: `inherit`
  });

  subprocess.on(`exit`, (code, signal) => {
    if (code !== 0) {
      console.log(`notify admin via mail about failed deployment`);

      const subject = `OFL Deployment failed`;
      const body = (new Date()).toISOString();

      execSync(`mail -s "${subject}" root`, {
        input: body
      });
    }
  });
}
