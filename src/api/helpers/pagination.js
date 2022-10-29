const { Sanitizer } = require('./sanitizer');
const { Cast } = require('./cast');

module.exports.Pagination = (query) => {
  const result = {
    skip: 0,
    limit: 10,
    order: 1,
  };

  if (query) {
    result.skip = Sanitizer.isInteger(query.skip) ? Cast.number(query.skip) : result.skip;
    // eslint-disable-next-line max-len
    result.limit = (query.limit === null || Sanitizer.isInteger(query.limit)) ? Cast.number(query.limit) : result.limit;
    result.order = (query.order === 'desc') ? -1 : result.order;
  }

  if (result.limit < 1) delete result.limit;

  return result;
};

// eslint-disable-next-line camelcase
module.exports.PaginateArray = (items, count, currentPage, perPageItems) => {
  // eslint-disable-next-line camelcase
  const page = currentPage || 0;
  const perPage = perPageItems || 10;
  const offset = (page) * perPage;

  const paginatedItems = items.slice(offset)
    .slice(0, perPageItems);
  const totalPages = Math.ceil(items.length / perPage);

  return {
    docs: paginatedItems,
    totalDocs: count,
    // eslint-disable-next-line radix
    page: parseInt(page),
    // eslint-disable-next-line radix
    limit: parseInt(perPage),
    // eslint-disable-next-line radix
    prevPage: page ? parseInt(page) : null,
    // eslint-disable-next-line radix
    nextPage: (totalPages > page) ? parseInt(page) + 1 : null,
    totalPages,
    hasPrevPage: !!(page - 1),
    hasNextPage: (count > ((page + 1) * perPage)),
  };
};

module.exports.CustomPaginate = (items, count, currentPage, perPageItems) => {
  const page = currentPage || 0;
  const perPage = perPageItems || 10;
  const totalPages = Math.ceil(count / perPage);

  return {
    docs: items,
    totalDocs: count,
    page: parseInt(page),
    limit: parseInt(perPage),
    prevPage: page > 0 ? page - 1 : null,
    nextPage: (totalPages > (page + 1)) ? parseInt(page) + 1 : null,
    pagingCounter: (parseInt(perPage) * parseInt(page)),
    totalPages,
    hasPrevPage: page > 0,
    hasNextPage: (totalPages > (page + 1)),
  };
};
