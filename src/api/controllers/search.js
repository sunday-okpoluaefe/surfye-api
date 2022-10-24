const { PostController } = require('./post');
const { Favourite } = require('../models/favourite');
const { search } = require('../services/algolia');
const {
  Reaction,
} = require('../models/reaction');
const controller = {};

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
    totalDocs: result.nbHits,
    prevPage: (result.page - 1) < 0 ? null : true,
    nextPage: (result.nbHits > (result.hitsPerPage * result.page)) ? result.page + 1 : null,
    hasNextPage: result.nbHits > (result.hitsPerPage * result.page),
    hasPrevPage: result.page > 1
  });

};

module.exports.SearchController = controller;
