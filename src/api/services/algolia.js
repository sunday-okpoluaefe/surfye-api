// For the default version
const algoliasearch = require('algoliasearch');
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_APP_KEY);
const search_index = client.initIndex(process.env.ALGOLIA_SEARCH_INDEX);

module.exports.push_post = async (post) => {

  let data = {
    objectID: post._id.toString(),
    account: post.account,
    title: post.title,
    flagged: post.flagged,
    type: post.type,
    likes: post.likes || 0,
    dislikes: post.dislikes || 0,
    visits: post.visits || 0,
    description: post.description,
    url: post.url,
    graph: post.graph,
    createdAt: post.createdAt,
    category: post.category
  };

  try {
    await search_index.saveObject(data);
  } catch (error) {
    throw(error);
  }
};

module.exports.push_note = async (note) => {
  let data = {
    objectID: note._id.toString(),
    account: note.account,
    title: note.title,
    flagged: note.flagged,
    type: note.type,
    color: note.color,
    likes: note.likes || 0,
    dislikes: note.dislikes || 0,
    visits: note.visits || 0,
    body: note.body
  }

  try {
    await search_index.saveObject(data);
  } catch (error) {
    throw(error);
  }
}

module.exports.push_visit = async (post) => {
  let data = {
    objectID: post._id.toString(),
    visits: post.visits || 0
  };

  try {
    await search_index.partialUpdateObject(data);
  } catch (error) {
    throw(error);
  }
};

module.exports.push_likes = async (post) => {
  let data = {
    objectID: post._id.toString(),
    likes: post.likes || 0,
    dislikes: post.dislikes || 0
  };

  try {
    await search_index.partialUpdateObject(data);
  } catch (error) {
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

