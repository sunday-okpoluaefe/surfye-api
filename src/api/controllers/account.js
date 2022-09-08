const {
  Account
} = require('../providers/models');

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

  await account.save()

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

controller.interest = async (req, res, next) => {

}

module.exports.AccountController = controller;
