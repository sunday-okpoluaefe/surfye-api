const { Favourite } = require('../models/favourite');
const { search } = require('../services/algolia');
const {
  Reaction,
} = require('../models/reaction');
const controller = {};

controller.create_post = (data, saved, isOwner, reaction) => {
  return {
    account: data.account,
    title: data.title,
    category: data.category,
    description: data.description,
    url: data.url,
    flagged: data.flagged ? data.flagged : false,
    dislikes: data.dislikes | 0,
    likes: data.likes | 0,
    saved: saved,
    graph: data.graph,
    type: data.type,
    isOwner: isOwner,
    createdAt: data.createdAt,
    _id: data.objectID,
    reaction: reaction ? {
      liked: reaction.liked,
      createdAt: reaction.createdAt
    } : undefined
  };
};

controller.create_note = (data, saved, isOwner, reaction) => {
  return {
    account: data.account,
    title: data.title,
    flagged: data.flagged ? d.flagged : false,
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

      if (d.type === 'post') {
        return controller.create_post(d, isSaved, acct === req.token._id.toString(), reaction);
      } else {
        return controller.create_note(d, isSaved, acct === req.token._id.toString(), reaction);
      }
    });
  } else {
    hits = result.hits.map(d => {
      if (d.type === 'post') {
        return controller.create_post(d, false, false, undefined);
      } else {
        return controller.create_note(d, false, false, undefined);
      }
    });
  }

  hits = hits.filter(function (result) {
    return result !== null && result !== undefined;
  });

  console.log(result)

  return req.respond.ok({
    docs: hits,
    page: result.page,
    limit: result.hitsPerPage,
    totalDocs: result.hits.length,
    prevPage: (result.page - 1) < 0 ? null : true,
    nextPage: (result.hits.length > (result.hitsPerPage * result.page)) ? result.page + 1 : null,
    hasNextPage: result.hits.length > (result.hitsPerPage * result.ngPages),
    hasPrevPage: result.page > 1
  });

};

module.exports.SearchController = controller;
