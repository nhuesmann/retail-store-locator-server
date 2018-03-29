const parse = require('csv-parse/lib/sync');

const validateHeaders = headers =>
  headers.map(header =>
    header
      .replace(/\W/g, ' ')
      .replace(/\s+/g, '_')
      .replace(/_$/g, '')
      .toLowerCase()
  ); // eslint-disable-line function-paren-newline

exports.parseCsv = buffer =>
  parse(buffer, {
    columns: validateHeaders,
    ltrim: true,
    rtrim: true,
  });
