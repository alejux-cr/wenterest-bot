const express = require('express');
const moment = require('moment');

const router = express.Router();

module.exports = (params) => {
  const { domainService } = params;

  router.get('/', async (req, res) => {
    const domains = await domainService.getIndexedDomainsData();
    res.render('index', {
      domainResult: {},
      formdata: {},
      domains,
    });
  });

  router.post('/domain', async (req, res, next) => {
    try {
      const {
        domainName,
        userName,
      } = req.body;
      // This provides just a minimal sanity check.
      // In real projects make sure to add more input validation.
      if (!domain || !userName) return next(new Error('Insufficient data'));

      const domainResult = await domainService.tryDomain(domainName, userName);

      const domains = await domainService.getIndexedDomainsData();
      let formdata = {};
      if (domainResult.error) {
        formdata = { ...req.body };
      }
      return res.render('index', {
        domainResult,
        domains,
        formdata,
      });
    } catch (err) {
      return next(err);
    }
  });
  return router;
};
