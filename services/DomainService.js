const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class DomainService {
  constructor({ datafile, domain, user }) {
    this.datafile = datafile;
    this.domain = domain;
    this.user = user;
  }

  isDomainRegistered(p_domain, domains) {

    const domain = domains.find(domain => { return domain == p_domain });

    return domain;
  }

  async getList() {
    return this.getData();
  }

  async tryDomain(domainName, userName) {
    const data = await this.getIndexedDomainsData() || [];
    if (!this.isDomainRegistered(domainName, data)) {
      data.unshift(domainName);
      await writeFile(this.datafile, JSON.stringify(data));
      // we still need to add it to the Domain list
      return {
        success: 'The domain: ' + domainName + ' was successfully added!'
      };

    }
    return getDomainData(domainName);
  }
  async getDomainData(domainName) {
    const data = await readFile(this.datafile, 'utf8');
    if (!data.domains) return [];
    const domain = data.domains.find(domain => { return domain.name == domainName });
    return JSON.parse(domain);
  }
  async getIndexedDomainsData() {
    const data = await readFile(this.datafile, 'utf8');
    if (!data.indexed_domains) return [];
    return JSON.parse(data.indexed_domains);
  }
}

module.exports = DomainService;
