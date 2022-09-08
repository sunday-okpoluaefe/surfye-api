// For the default version
const algoliasearch = require('algoliasearch');
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_APP_KEY);
const search_index = client.initIndex(process.env.ALGOLIA_SEARCH_INDEX);

module.exports.push_post = async (post) => {

  let data = {
    objectID: post._id.toString(),
    account: post.account.toString(),
    likes: post.likes,
    title: post.title,
    favorites: post.favorites,
    description: post.description,
    url: post.url,
    category: post.category
  };

  try {
    await search_index.saveObject(data);
  } catch (error) {
    console.log(error)
    throw(error);
  }
};

module.exports.deleteObject = async (objectId) => {
  try {
    await search_index.deleteObject(objectId);
  } catch (error) {
    throw(error);
  }
};

module.exports.search = async (data) => {
  try {
    return await search_index.search(data.query, {
      page: data.page,
      removeStopWords: true,
      hitsPerPage: data.limit,
      removeWordsIfNoResults: 'allOptional'
    });
  } catch (error) {
    return null;
  }
};

module.exports.advanceSearch = async (data) => {
  try {
    let res = await search_index.search(data.query, {
      filters: data.filters,
      removeStopWords: true,
      page: data.page,
      hitsPerPage: data.limit
    });

    return {
      status: true,
      data: res
    };
  } catch (error) {
    return {
      status: false,
      message: error.message
    };
  }
};

