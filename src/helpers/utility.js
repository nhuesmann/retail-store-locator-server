exports.capitalize = string => {
  if (!string) return string;

  return string
    .replace('.', '')
    .toLowerCase()
    .split(' ')
    .map(word => word.replace(word[0], word[0].toUpperCase()))
    .join(' ');
};

exports.truncateCoordinates = ([lng, lat]) => [
  +lng.toFixed(7),
  +lat.toFixed(7),
];
