const path = require('path');

require('dotenv').config();

module.exports = {
  interest: {
    datafile: path.join(__dirname, '../data/domains.json'),
    id: '',
    name: '',
  },
  slack: {
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_TOKEN,
  },
  wit: {
    token: process.env.WIT_TOKEN,
  },
};
