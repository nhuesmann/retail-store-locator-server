/* eslint object-curly-newline: 0 */
/* eslint camelcase: 0 */

const parse = require('csv-parse/lib/sync');

const validateHeaders = headers =>
  headers.map(header => {
    if (!header) return false;

    return header
      .replace(/\W/g, ' ')
      .replace(/\s+/g, '_')
      .replace(/_$/g, '')
      .toLowerCase();
  });

const extractAddressTwo = ({ address, ...rest }) => {
  // Regex for removing whitespace
  const whiteSpace = /^[ \t]+|[ \t]+$/g;

  // Remove commas and periods
  let address_1 = address.replace(/[,.]/g, '');
  let address_2 = '';

  // Search for address 2 components in address
  const addressTwoComponents = /\s((apartment|apt|suite|ste|unit|lot)\s|#).*/gi;
  const textToRemove = address_1.match(addressTwoComponents);

  // Set address_1 and address_2 if address 2 components found
  if (textToRemove) {
    address_1 = address_1.replace(textToRemove, '').replace(whiteSpace, '');
    address_2 = textToRemove[0].replace(/[,.#]/g, '').replace(whiteSpace, '');
  }

  return {
    address_1,
    address_2,
    ...rest,
  };
};

const cleanseZip = zip => (zip.length === 4 ? `0${zip}` : zip.slice(0, 5));

const pluckDesiredProps = retailer => ({
  name: retailer.name,
  address_1: retailer.address_1,
  address_2: retailer.address_2,
  city: retailer.city,
  state: retailer.state,
  zip: retailer.zip,
  launch_date: retailer.launch_date,
});

exports.parseCsv = buffer =>
  parse(buffer, {
    columns: validateHeaders,
    ltrim: true,
    rtrim: true,
    skip_empty_lines: true,
    skip_lines_with_empty_values: true,
  });

exports.cleanseAddresses = retailers =>
  retailers
    .filter(
      ({ retailer, address, city, state }) =>
        retailer && address && city && state
    )
    .map(location => extractAddressTwo(location))
    .map(({ retailer, zip, ...rest }) => ({
      name: retailer,
      ...rest,
      zip: cleanseZip(zip),
    }))
    .map(location => pluckDesiredProps(location));
