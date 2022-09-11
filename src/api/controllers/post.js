const { PaginateArray } = require('../helpers/pagination');
const { search } = require('../services/algolia');
const { push_post } = require('../services/algolia');
const {
  Post,
  Category,
  Reaction,
  Favourite
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
    await controller.publish(post, {
      name: req.token.name,
      image: req.token.image
    });
  }
};

controller.publish = async (post, account) => {
  let category = await Category.findById(post.category);
  await push_post({
    _id: post._id,
    account: account,
    title: post.title,
    dislikes: post.dislikes,
    likes: post.likes,
    favorites: post.favorites,
    description: post.description,
    url: post.url,
    category: category.category
  });
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

  let reactions = null;
  let hits = null;

  if (req.token && req.token._id) {
    reactions = await Reaction.find({
      account: req.token._id
    });

    let saved = await Favourite.find({
      account: req.token._id
    });

    hits = result.hits.map(d => {
      let reaction = reactions.find(r => r.account.toString() === req.token._id.toString() && r.post.toString() === d.objectID.toString());
      let isSaved = saved.find(s => s.post.toString() === d.objectID.toString());
      return {
        account: d.account,
        title: d.title,
        favorites: d.favorites,
        description: d.description,
        url: d.url,
        dislikes: d.dislikes | 0,
        likes: d.likes | 0,
        saved: !!isSaved,
        _id: d.objectID,
        reaction: reaction ? {
          liked: reaction.liked,
          createdAt: reaction.createdAt
        } : undefined
      };
    });
  } else {
    hits = result.hits.map(d => {
      return {
        account: d.account,
        title: d.title,
        favorites: d.favorites,
        description: d.description,
        url: d.url,
        dislikes: d.dislikes | 0,
        likes: d.likes | 0,
        saved: false,
        _id: d.objectID
      };
    });
  }

  return req.respond.ok({
    docs: hits,
    page: result.page,
    limit: result.hitsPerPage,
    totalDocs: result.hits.length,
    prevPage: (result.page - 1) < 0 ? null : true,
    nextPage: (result.hits.length > (result.hitsPerPage * result.page)) ? result.page + 1 : null,
    hasNextPage: result.hits.length > (result.hitsPerPage * result.page),
    hasPrevPage: result.page > 1
  });

};

controller.like = async (req, res, next) => {
  let post = await Post.findById(req.params.post);
  if (!post) {
    return req.respond.notFound();
  }

  let reaction = await Reaction.findOne({
    post: req.params.post,
    account: req.token._id
  });

  if (reaction) {
    if (reaction.liked === true) {
      return req.respond.ok();
    } else {
      post.dislikes -= 1;
    }
    reaction.liked = true;
  } else {
    reaction = new Reaction({
      account: req.token._id,
      post: req.params.post,
      liked: true
    });
  }

  await reaction.save();

  post.likes += 1;
  req.respond.ok();

  await post.save();

  await controller.publish(post, {
    name: req.token.name,
    image: req.token.image
  });

};

controller.dislike = async (req, res, next) => {
  let post = await Post.findById(req.params.post);
  if (!post) {
    return req.respond.notFound();
  }

  let reaction = await Reaction.findOne({
    post: req.params.post,
    account: req.token._id
  });

  if (reaction) {
    if (reaction.liked === false) {
      return req.respond.ok();
    } else {
      post.likes -= 1;
    }

    reaction.liked = false;
  } else {
    reaction = new Reaction({
      account: req.token._id,
      post: req.params.post,
      liked: false
    });
  }

  await reaction.save();

  post.dislikes += 1;
  req.respond.ok();

  await post.save();

  await controller.publish(post, {
    name: req.token.name,
    image: req.token.image
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
