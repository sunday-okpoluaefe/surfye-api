const { PaginateArray } = require('../helpers/pagination');
const { search } = require('../services/algolia');
const { push_post } = require('../services/algolia');
const {
  Post,
  Category,
  Account
} = require('../providers/models');
const { SetErrorData } = require('../helpers/set-error-data');

const controller = {};

controller.save = async (req, res, next) => {
  const {
    title,
    url,
    description,
    type,
    status,
    category
  } = req.body;

  let category_ = await Category.findById(category);

  if (!category_) {
    return req.respond.badRequest(SetErrorData(
      {
        message: 'Invalid category provided',
        key: 'category',
      },
    ));
  }

  let post = await Post.findOne({
    title: title,
    url: url
  });

  if (post) {
    return req.respond.ok(post);
  }

  post = new Post({
    title: title,
    url: url,
    status: status,
    description: description,
    type: type,
    account: req.token._id,
    category
  });

  await post.save();
  req.respond.ok(post);

  if (post.status === 'publish') {
    await push_post({
      _id: post._id,
      account: {
        name: req.token.name,
        image: req.token.image
      },
      title: post.title,
      favorites: post.favorites,
      description: post.description,
      url: post.url,
      category: category_.category
    });
  }
};

controller.one = async (req, res, next) => {
  let id = req.params.id;
  let post = await Post.retrieveById(id);

  if (post) {
    return req.respond.ok(post);
  } else {
    return req.respond.notFound();
  }
};

controller.search = async (req, res, next) => {

  let skip = req.query.skip ? req.query.skip - 1 : 0;
  let result = await search({
    query: req.query.query,
    filters: req.query.filters,
    page: skip,
    limit: req.query.limit || 10
  });

  return req.respond.ok({
    docs: result.hits.map(d => {
      return {
        account: d.account,
        title: d.title,
        favorites: d.favorites,
        description: d.description,
        url: d.url,
        _id: d.objectID
      };
    }),
    page: result.page,
    limit: result.hitsPerPage,
    totalDocs: result.hits.length,
    prevPage: (result.page - 1) < 0 ? null : true,
    nextPage: (result.hits.length > (result.hitsPerPage * result.page)) ? result.page + 1 : null,
    hasNextPage: result.hits.length > (result.hitsPerPage * result.page),
    hasPrevPage: result.page > 1
  });

};

controller.me = async (req, res, next) => {
  const count = await Post.countDocuments({ account: req.token._id });

  const posts = await Post.retrieve({
    match: {
      account: req.token._id
    },
    limit: req.query.limit,
    skip: req.query.skip
  });

  return req.respond.ok(PaginateArray(posts, count, req.query.skip, req.query.limit));
};

controller.all = async (req, res, next) => {

};

module.exports.PostController = controller;
