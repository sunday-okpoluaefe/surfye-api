const {
  Favourite,
  Post
} = require('../providers/models');

const controller = {};

controller.add = async (req, res, next) => {
  let account = req.token._id;
  let id = req.params.id;

  let post = await Post.findById(id);
  if (!post) {
    return req.respond.notFound();
  }

  let fav = await Favourite.findOne({
    post: post,
    account: account
  });

  if (fav) {
    if (fav.deleted === true) {
      fav.deleted = false;
      await fav.save();
    }
    return req.respond.ok();
  }

  fav = new Favourite({
    account,
    post,
    type: post.type
  });

  await fav.save();
  return req.respond.ok();

};

controller.delete = async (req, res, next) => {
  let account = req.token._id;
  let id = req.params.id;

  let fav = await Favourite.findOne({
    post: id,
    account: account
  });

  if (!fav) {
    return req.respond.notFound();
  }

  fav.deleted = true;
  await fav.save();

  return req.respond.ok();
};

module.exports.FavouriteController = controller;
