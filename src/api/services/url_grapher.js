const ogs = require('open-graph-scraper');

module.exports.get_graph = async (url) => {
  const options = { url: url };
  try {
    let result = await ogs(options);
    return result.error === false ? result.result : null;
  } catch (e) {
    return null;
  }
};
