const ogs = require('open-graph-scraper');

module.exports.get_graph = async (url) => {
  const options = { url: url };
  try {
    let result = await ogs(options);
    if (result.error === false) {
      let graph = result.result;
      return {
        image: Array.isArray(graph.ogImage) ? graph.ogImage[0] : graph.ogImage,
        title: graph.ogTitle,
        description: graph.ogDescription
      };
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
};
