const { PostController } = require('./post');
const { Favourite } = require('../models/favourite');
const { search } = require('../services/algolia');
const {
  Reaction,
} = require('../models/reaction');
const controller = {};

controller.search = async (req, res, next) => {
  let result = await search({
    query: req.query.query,
    filters: req.query.filters,
    page: req.query.skip || 0,
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
        return PostController.create_post_object(d, isSaved, acct === req.token._id.toString(), reaction);
      } else {
        return PostController.create_note_object(d, isSaved, acct === req.token._id.toString(), reaction);
      }
    });
  } else {
    hits = result.hits.map(d => {
      if (d.type === 'post') {
        return PostController.create_post_object(d, false, false, undefined);
      } else {
        return PostController.create_note_object(d, false, false, undefined);
      }
    });
  }

  hits = hits.filter(function (result) {
    return result !== null && result !== undefined;
  });

  return req.respond.ok({
    docs: hits,
    page: result.page,
    limit: result.hitsPerPage,
    totalPages: result.nbPages,
    totalDocs: result.nbHits,
    prevPage: (result.page > 0) ? result.page - 1 : null,
    nextPage: result.nbPages > (result.page + 1) ? result.page + 1 : null,
    hasNextPage: result.nbPages > (result.page + 1),
    hasPrevPage: result.page > 0
  });

};

module.exports.SearchController = controller;
