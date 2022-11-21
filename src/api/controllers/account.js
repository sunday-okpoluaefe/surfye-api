const {
  Account,
  Category
} = require('../providers/models');
const { SetErrorData } = require('../helpers/set-error-data');
const geoip = require('geoip-lite');
const iplocate = require('node-iplocate');
const { Post } = require('../models/post');

const controller = {};

controller.auth = async (req, res, next) => {
  const {
    email,
    image,
    name
  } = req.body;

  let account = await Account.findOne({
    'email': email
  });

  let country = null;

  let lookup = geoip.lookup(req.ip);
  if (lookup) {
    const regionNames = new Intl.DisplayNames(
      ['en'], { type: 'region' }
    );

    country = {
      name: regionNames.of(lookup.country),
      timezone: lookup.timezone
    };
  }

  if (account) {
    req.respond.ok({
      authorization: account.setAuthToken({ persist: true }),
      createdAt: new Date(Date.now()).toISOString(),
      user: {
        _id: account._id,
        name: name,
        email: email,
        country: country,
        complete: account.complete
      },
    });

    account.loginAt = new Date(Date.now()).toISOString();
    await account.save();
    return;
  }

  account = new Account({
    email: email,
    country: country,
    image: image,
    name: name,
    loginAt: new Date(Date.now()).toISOString(),
  });

  await account.save();

  return req.respond.ok({
    authorization: account.setAuthToken({ persist: true }),
    createdAt: new Date(Date.now()).toISOString(),
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

controller.transform_summary = (data) => {
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let agg = data.map(sum => {
      return {
          year: sum._id.year,
          month: months[sum._id.month - 1],
          visits: sum.total_visits_month
      }
  });

  let agg_data = []
  for (let index = 0; index < 12; index++) {
    let match = agg.find(d => d.month === months[index]);
      if(!match) {
          agg_data.push({
            year: new Date().getFullYear(),
            month: months[index],
            visits: 0
          })
      }
      else agg_data.push(match)
  }

  return agg_data;
}

controller.summary = async(req, res, next) => {
  let sum_data = await Post.summary(req.token._id);
  let summary = await Post.total_type_aggregate(req.token._id);
  return req.respond.ok({
    sum_aggregate: controller.transform_summary(sum_data),
    summary: summary.map(d => { return { 
      type: d._id.type, 
      visits: d.total_visits,  
      count: d.count
    }})
  })
}

module.exports.AccountController = controller;
