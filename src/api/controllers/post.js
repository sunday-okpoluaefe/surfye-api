const { Sanitizer } = require('../helpers/sanitizer');
const { Account } = require('../models/account');
const { deleteObject } = require('../services/algolia');
const { push_likes } = require('../services/algolia');
const { get_graph } = require('../services/url_grapher');
const { push_visit } = require('../services/algolia');
const { PaginateArray } = require('../helpers/pagination');
const { push_post } = require('../services/algolia');

const {
  Post,
  Category,
  Reaction,
  Favourite
} = require('../providers/models');

const { SetErrorData } = require('../helpers/set-error-data');

const controller = {};

controller.crawl = async (req, res, next) => {
  const {
    title,
    description,
    url
  } = req.body;

  let post = await Post.findOne({
    url: url,
    title: title,
    description: description
  });

  if (post) {
    return req.respond.ok();
  }

  let category = await Category.findOne({
    category: 'General'
  });

  if (!category) {
    return req.respond.internalError();
  }

  post = new Post({
    title: title,
    category: category._id,
    description: description,
    url: url,
    status: 'public',
  });

};

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
  post.category = category;

  let graph = await get_graph(post.url);
  if (graph !== null) {
    post.graph = graph;
  }

  await post.save();
  req.respond.ok();

  if (post.status === 'public') {
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
    type: 'post',
    description: description,
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

  if (post.status === 'public') {
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

  if (post.status === 'private') {
    post.status = 'public';
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

  if (post.status === 'public') {
    post.status = 'private';
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
    type: post.type,
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

controller.random = async (req, res, next) => {
  let count = await Post.countDocuments();
  const random = Math.floor(Math.random() * count);
  let random_posts = await Post.retrieve({
    skip: random,
    limit: 10,
    sort: {
      likes: -1,
      visits: -1
    }
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
      return controller.create_post_object(post, false, false, undefined);
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

controller.save_note = async (req, res, next) => {
  const {
    title,
    status,
    body
  } = req.body;

  let note = new Post({
    account: req.token._id,
    title: title,
    body: body,
    type: 'note',
    status: status
  });

  await note.save();

  return req.respond.ok();
};

controller.update_note = async (req, res, next) => {
  let id = req.params.id;
  let account = await Account.findById(req.token._id);
  if (!account) {
    return req.respond.unauthorized();
  }

  const {
    title,
    status,
    body
  } = req.body;

  let note = await Post.findById(id);

  if (!note) {
    return req.respond.notFound();
  }

  note.title = title;
  note.status = status;
  note.body = body;

  await note.save();

  return req.respond.ok();
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

controller.create_note_object = (data, saved, isOwner, reaction, account = null) => {
  return {
    account: account ? account : data.account,
    title: data.title,
    flagged: data.flagged ? data.flagged : false,
    dislikes: data.dislikes | 0,
    likes: data.likes | 0,
    saved: saved,
    type: data.type,
    body: data.body,
    isOwner: isOwner,
    createdAt: data.createdAt,
    reaction: reaction ? {
      liked: reaction.liked,
      createdAt: reaction.createdAt
    } : undefined
  };
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

    if (fav.post.type === 'post') {
      return controller.create_post_object(fav.post, !!isSaved, !fav.post.account
        ? false
        : fav.post.account._id.toString() === account._id, reaction, {
        _id: fav.post.account._id,
        name: fav.post.account.name,
        image: fav.post.account.image
      });
    } else {
      return controller.create_note_object(fav.post, !!isSaved, !fav.post.account
        ? false
        : fav.post.account._id.toString() === account._id, reaction, {
        _id: fav.post.account._id,
        name: fav.post.account.name,
        image: fav.post.account.image
      });
    }

  });

  return data.filter(function (result) {
    return result !== null && result !== undefined;
  });
};

controller.create_post_object = (data, saved, isOwner, reaction, account = null) => {
  return {
    account: account ? account : data.account,
    title: data.title,
    category: data.category,
    description: data.description,
    url: data.url,
    flagged: data.flagged ? data.flagged : false,
    dislikes: data.dislikes | 0,
    likes: data.likes | 0,
    saved: saved,
    graph: {
      image: data.graph.ogImage ? data.graph.ogImage : data.graph.image,
      title: data.graph.ogTitle ? data.graph.ogTitle : data.graph.title,
      description: data.graph.ogDescription ? data.graph.ogDescription : data.graph.description
    },
    type: data.type,
    isOwner: isOwner,
    createdAt: data.createdAt,
    _id: data.objectID ? data.objectID : data._id,
    reaction: reaction ? {
      liked: reaction.liked,
      createdAt: reaction.createdAt
    } : undefined
  };
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

    if (post.type === 'post') {
      return controller.create_post_object(post, !!isSaved,
        post.account
          ? post.account._id.toString() === account._id.toString()
          : false, reaction, {
          _id: post.account._id,
          name: post.account.name,
          image: post.account.image
        });
    } else {
      return controller.create_note_object(post, !!isSaved,
        post.account
          ? post.account._id.toString() === account._id.toString()
          : false, reaction, {
          _id: post.account._id,
          name: post.account.name,
          image: post.account.image
        });
    }
  });

  return data.filter(function (result) {
    return result !== null && result !== undefined;
  });
};

controller.me = async (req, res, next) => {
  const {
    status,
    type
  } = req.query;

  let count = 0;
  let posts = null;
  let data = null;

  if (status) {
    if (status === 'private') {
      count = await Post.countDocuments({
        account: req.token._id,
        status: status,
        type: type ? type : 'post'
      });

      posts = await Post.retrieve({
        match: {
          account: req.token._id,
          status: status,
          type: type ? type : 'post'
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
          deleted: false,
          type: type ? type : 'post'
        },
        limit: req.query.limit,
        skip: req.query.skip
      });

      data = await controller.transformFavourite(posts, {
        _id: req.token._id,
        name: req.token.name,
        image: req.token.image
      });
    } else if (status === 'public') {

      count = await Post.countDocuments({
        account: req.token._id,
        status: 'public',
        type: type ? type : 'post'
      });

      posts = await Post.retrieve({
        match: {
          account: req.token._id,
          status: 'public',
          type: type ? type : 'post'
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
  }

  return req.respond.ok(PaginateArray(data ? data : [], count | 0, req.query.skip, req.query.limit));
};

controller.all = async (req, res, next) => {

};

module.exports.PostController = controller;
