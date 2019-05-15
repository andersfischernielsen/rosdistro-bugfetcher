const request = require('request');
const yaml = require('js-yaml');
const fs = require('fs');
require('dotenv').config();

const makeRequest = (issueURL) => {
  const headers = {
    Authorization: 'Basic ' +
      Buffer.from(
        'andersfischernielsen' + ':' + process.env.PASS,
        'utf8',
      ).toString('base64'),
    'User-Agent': 'andersfischernielsen',
  };

  request(
    issueURL, {
      json: true,
      headers: headers,
    },
    (err, res, issues) => {
      if (err) console.error(err);
      if (issues && res.statusCode === 403)
        console.error('Rate limit exceeded!');
      if (issues && res.statusCode === 200) {
        if (issues.length > 0) {
          const possibleDependencyIssues = issues.filter(
            (i) =>
            (i.title && i.title.match('/dependency|undeclared/')) ||
            (i.body && i.body.match('/dependency|undeclared/')),
          );
          const mapped = possibleDependencyIssues.map((i) => {
            return {
              url: i.html_url,
              title: i.title,
              body: i.body,
              repo: i.repository_url,
            };
          });
          if (mapped && mapped.length > 0) {
            try {
              const name = mapped[0].repo
                .replace('https://api.github.com/repos/', '')
                .replace(/.*\//, '');
              const dumped = yaml.safeDump(mapped);
              writeFileSync(`fetched_issues/${name}.yaml`, dumped);
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    },
  );
};

const checked = fs.readdir('fetched_issues', (err, files) => {
  const checkedRepositories = files.map((x) => x.replace('.yaml', ''));

  request(
    'https://raw.githubusercontent.com/ros/rosdistro/master/melodic/distribution.yaml',
    (err, res, body) => {
      const loaded = yaml.safeLoad(body);
      const repositories = loaded.repositories;

      for (let i = 0; i < checkedRepositories.length; i++) {
        const checked = checkedRepositories[i];
        delete repositories[checked];
      }

      for (const name in repositories) {
        const repo = repositories[name];
        if (!repo.source) continue;
        let url = repo.source.url;
        if (url.match('bitbucket')) continue;
        const split = url.split(/\.|github.com/);
        split.splice(1, 0, 'api.github.com/repos');
        split[3] = '/issues?state=all&per_page=100';
        const issueURL = split.join('');
        makeRequest(issueURL);
      }
    },
  );
});