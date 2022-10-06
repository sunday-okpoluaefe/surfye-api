const { Sanitizer } = require('../helpers/sanitizer');
const { Account } = require('../models/account');
const { deleteObject } = require('../services/algolia');
const { push_likes } = require('../services/algolia');
const { get_graph } = require('../services/url_grapher');
const { push_visit } = require('../services/algolia');
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

controller.update = async (req, res, next) => {
  let id = req.params.id;
  let account = await Account.findById(req.token._id);

  if (!account) {
    return req.respond.unauthorized();
  }

  const {
    title,
    url,
    description,
    type,
    status,
    category
  } = req.body;

  let post = await Post.findById(id);

  if (!post) {
    return req.respond.notFound();
  }

  post.title = title;
  post.url = url;
  post.status = status;
  post.description = description;
  post.type = type;
  post.category = category;

  let graph = await get_graph(post.url);
  if (graph !== null) {
    post.graph = graph;
  }

  await post.save();
  req.respond.ok();

  if (post.status === 'publish') {
    await controller.publish(post, {
      name: req.token.name,
      image: req.token.image,
      _id: req.token._id
    });
  }
};

controller.save = async (req, res, next) => {
  const {
    title,
    url,
    description,
    type,
    status,
    category
  } = req.body;

  let account = await Account.findById(req.token._id);

  if (!account) {
    return req.respond.unauthorized();
  }

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

  let graph = await get_graph(post.url);
  if (graph !== null) {
    post.graph = graph;
    await post.save();
  }

  if (post.status === 'publish') {
    await controller.publish(post, {
      name: req.token.name,
      image: req.token.image,
      _id: req.token._id
    });
  }
};

controller.publishPost = async (req, res, next) => {

  let account = await Account.findById(req.token._id);

  if (!account) {
    return req.respond.unauthorized();
  }

  let id = req.params.post;
  let post = await Post.findById(id);

  if (!post) {
    return req.respond.notFound();
  }

  req.respond.ok();

  if (post.status === 'draft') {
    post.status = 'publish';
    await post.save();
    await controller.publish(post, {
      name: req.token.name,
      image: req.token.image,
      _id: req.token._id
    });
  }
};

controller.unPublishPost = async (req, res, next) => {
  let id = req.params.post;

  let account = await Account.findById(req.token._id);

  if (!account) {
    return req.respond.unauthorized();
  }

  let post = await Post.findById(id);

  if (!post) {
    return req.respond.notFound();
  }

  req.respond.ok();

  if (post.status === 'publish') {
    post.status = 'draft';
    await post.save();
    await deleteObject(post._id);
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
    flagged: post.flagged,
    favorites: post.favorites,
    description: post.description,
    url: post.url,
    graph: post.graph !== null ? {
      image: post.graph.ogImage,
      title: post.graph.ogTitle,
      description: post.graph.ogDescription
    } : undefined,
    createdAt: post.createdAt,
    category: category.category
  });
};

controller.one = async (req, res, next) => {
  let id = req.params.id;
  let post = await Post.retrieveById(id);

  if (post) {

    let data = await controller.transform([post], {
      _id: req.token._id,
      name: req.token.name,
      image: req.token.image
    });

    return req.respond.ok(data[0]);
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
  let hits;

  if (req.token && req.token._id) {
    reactions = await Reaction.find({
      account: req.token._id
    });

    let saved = await Favourite.find({
      account: req.token._id,
      deleted: false
    });

    hits = result.hits.map(d => {
      let reaction = reactions.find(r => r.account.toString() === req.token._id.toString() && r.post.toString() === d.objectID.toString());
      let isSaved = saved.find(s => s.post.toString() === d.objectID.toString());

      if (reaction && reaction.flagged && reaction.flagged.value === true) return undefined;

      let acct = d.account._id ? d.account._id.toString() : '';

      return {
        account: d.account,
        title: d.title,
        favorites: d.favorites,
        category: d.category,
        description: d.description,
        url: d.url,
        flagged: d.flagged ? d.flagged : false,
        dislikes: d.dislikes | 0,
        likes: d.likes | 0,
        saved: !!isSaved,
        graph: d.graph,
        isOwner: acct === req.token._id.toString(),
        createdAt: d.createdAt,
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
        category: d.category,
        favorites: d.favorites,
        description: d.description,
        url: d.url,
        flagged: d.flagged ? d.flagged : false,
        isOwner: false,
        graph: d.graph,
        dislikes: d.dislikes | 0,
        likes: d.likes | 0,
        createdAt: d.createdAt,
        saved: false,
        _id: d.objectID
      };
    });
  }

  hits = hits.filter(function (result) {
    return result !== null && result !== undefined;
  });

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

controller.random = async (req, res, next) => {
  let count = await Post.countDocuments();
  const random = Math.floor(Math.random() * count);
  let random_posts = await Post.retrieve({
    skip: random,
    limit: 10
  });

  let transformed;

  if (req.token && req.token._id) {
    transformed = await controller.transform(random_posts, {
      _id: req.token._id,
      name: req.token.name,
      image: req.token.image
    }, true);
  } else {
    transformed = random_posts.map(post => {
      return {
        account: undefined,
        title: post.title,
        favorites: post.favorites,
        description: post.description,
        url: post.url,
        dislikes: post.dislikes | 0,
        likes: post.likes | 0,
        saved: false,
        isOwner: false,
        category: post.category ? post.category.category : undefined,
        graph: (post.graph !== undefined && post.graph != null) ? {
          image: post.graph.ogImage || undefined,
          title: post.graph.ogTitle,
          description: post.graph.ogDescription
        } : undefined,
        createdAt: post.createdAt,
        _id: post._id,
        reaction: undefined
      };
    });
  }

  return req.respond.ok(PaginateArray(transformed, random_posts.length, 0, 10));
};

controller.visit = async (req, res, next) => {
  let post = await Post.findById(req.params.post);
  if (!post) {
    return req.respond.notFound();
  }

  post.visits += 1;
  req.respond.ok({
    _id: req.params.post,
    url: post.url
  });
  await post.save();

  await push_visit(post);
};

controller.flag = async (req, res, next) => {
  if (!Sanitizer.isObjectId(req.params.post)) {
    return req.respond.notFound();
  }

  let post = await Post.findById(req.params.post);
  let reason = req.body.reason;

  if (!post) {
    return req.respond.notFound();
  }

  let reaction = await Reaction.findOne({
    post: req.params.post,
    account: req.token._id
  });

  if (!reaction) {
    reaction = new Reaction({
      account: req.token._id,
      post: req.params.post
    });
  }

  reaction.flagged.value = true;
  reaction.flagged.reason = reason;

  post.flagged += 1;

  req.respond.ok();

  await reaction.save();
  await post.save();
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
  await push_likes(post);
};

controller.dislike = async (req, res, next) => {
  let account = await Account.findById(req.token._id);

  if (!account) {
    return req.respond.unauthorized();
  }

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
  await push_likes(post);
};

controller.transformFavourite = async (posts, account) => {
  let reactions = await Reaction.find({
    account: account._id
  });

  let saved = await Favourite.find({
    account: account._id,
    deleted: false
  });

  let data = posts.map(fav => {
    let reaction = reactions.find(r => r.account.toString() === account._id.toString() && r.post.toString() === fav.post._id.toString());
    let isSaved = saved.find(s => s.post.toString() === fav.post._id.toString());

    if (reaction && reaction.flagged && reaction.flagged.value === true) return undefined;

    return {
      account: !fav.post.account ? {
        _id: account._id,
        name: account.name,
        image: account.image
      } : {
        _id: fav.post.account._id,
        name: fav.post.account.name,
        image: fav.post.account.image
      },
      title: fav.post.title,
      flagged: fav.post.flagged,
      favorites: fav.post.favorites,
      description: fav.post.description,
      url: fav.post.url,
      isOwner: !fav.post.account
        ? false
        : fav.post.account._id.toString() === account._id,
      dislikes: fav.post.dislikes | 0,
      likes: fav.post.likes | 0,
      saved: !!isSaved,
      category: fav.post.category.category,
      graph: (fav.post.graph !== undefined && fav.post.graph != null) ? {
        image: fav.post.graph.ogImage || undefined,
        title: fav.post.graph.ogTitle,
        description: fav.post.graph.ogDescription
      } : undefined,
      createdAt: fav.post.createdAt,
      _id: fav.post._id,
      reaction: reaction ? {
        liked: reaction.liked,
        flagged: reaction.flagged ? reaction.flagged.value : undefined,
        createdAt: reaction.createdAt
      } : undefined
    };

  });

  return data.filter(function (result) {
    return result !== null && result !== undefined;
  });
};

controller.transform = async (posts, account, random = false) => {
  let reactions = await Reaction.find({
    account: account._id
  });

  let saved = await Favourite.find({
    account: account._id,
    deleted: false
  });

  let data = posts.map(post => {

    let reaction = reactions.find(r => r.account.toString() === account._id.toString() && r.post.toString() === post._id.toString());
    let isSaved = saved.find(s => s.post.toString() === post._id.toString());

    if (reaction && reaction.flagged && reaction.flagged.value === true) return undefined;

    return {
      account: random === false ? {
        _id: account._id,
        name: account.name,
        image: account.image
      } : post.account ? {
        _id: post.account._id,
        name: post.account.name,
        image: post.account.image
      } : undefined,
      title: post.title,
      favorites: post.favorites,
      flagged: post.flagged,
      description: post.description,
      url: post.url,
      dislikes: post.dislikes | 0,
      likes: post.likes | 0,
      saved: !!isSaved,
      isOwner: post.account ? post.account._id.toString() === account._id.toString() : false,
      category: post.category ? post.category.category : undefined,
      graph: (post.graph !== undefined && post.graph != null) ? {
        image: post.graph.ogImage || undefined,
        title: post.graph.ogTitle,
        description: post.graph.ogDescription
      } : undefined,
      createdAt: post.createdAt,
      _id: post._id,
      reaction: reaction ? {
        liked: reaction.liked,
        flagged: reaction.flagged ? reaction.flagged.value : undefined,
        createdAt: reaction.createdAt
      } : undefined
    };

  });

  return data.filter(function (result) {
    return result !== null && result !== undefined;
  });
};

controller.me = async (req, res, next) => {
  let status = req.query.status;
  let count = 0;
  let posts = null;
  let data = null;

  if (status) {
    if (status === 'draft') {
      count = await Post.countDocuments({
        account: req.token._id,
        status: status
      });

      posts = await Post.retrieve({
        match: {
          account: req.token._id,
          status: status
        },
        limit: req.query.limit,
        skip: req.query.skip
      });

      data = await controller.transform(posts, {
        _id: req.token._id,
        name: req.token.name,
        image: req.token.image
      });

    } else if (status === 'saved') {
      count = await Favourite.countDocuments({
        account: req.token._id,
        deleted: false
      });

      posts = await Favourite.retrieve({
        match: {
          account: req.token._id,
          deleted: false
        },
        limit: req.query.limit,
        skip: req.query.skip
      });

      data = await controller.transformFavourite(posts, {
        _id: req.token._id,
        name: req.token.name,
        image: req.token.image
      });
    }
  } else {
    count = await Post.countDocuments({ account: req.token._id });
    posts = await Post.retrieve({
      match: {
        account: req.token._id,
        status: 'publish'
      },
      limit: req.query.limit,
      skip: req.query.skip
    });

    data = await controller.transform(posts, {
      _id: req.token._id,
      name: req.token.name,
      image: req.token.image
    });
  }

  return req.respond.ok(PaginateArray(data, count, req.query.skip, req.query.limit));
};

controller.all = async (req, res, next) => {

};

module.exports.PostController = controller;
