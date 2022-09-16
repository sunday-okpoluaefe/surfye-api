const {
  Account,
  Category
} = require('../providers/models');
const { SetErrorData } = require('../helpers/set-error-data');

const controller = {};

controller.auth = async (req, res, next) => {
  const {
    email,
    image,
    name,
    country
  } = req.body;

  let account = await Account.findOne({
    'email': email
  });

  if (account) {
    return req.respond.ok({
      authorization: account.setAuthToken({ persist: true }),
      user: {
        _id: account._id,
        name: name,
        email: email,
        country: country,
        complete: account.complete
      },
    });
  }

  account = new Account({
    email: email,
    country: country,
    image: image,
    name: name
  });

  await account.save();

  return req.respond.ok({
    authorization: account.setAuthToken({ persist: true }),
    user: {
      _id: account._id,
      name: name,
      email: email,
      country: country,
      complete: account.complete
    },
  });

};

controller.interests = async (req, res, next) => {
  const { interests } = req.body;

  let user_interests = [];
  // Loop through interests
  for (let i = 0; i < interests.length; i++) {
    let cat = await Category.findById(interests[i]);
    if (!cat) {
      return req.respond.badRequest(SetErrorData(
        {
          message: 'Invalid category provided',
          key: 'category',
        },
      ));
    }

    user_interests.push({
      interest: interests[i]
    });
  }

  let account = await Account.findById(req.token._id);

  if (!account) return req.respond.forbidden();

  account.interests = user_interests;
  account.complete = true;

  await account.save();

  return req.respond.ok();

};

module.exports.AccountController = controller;
