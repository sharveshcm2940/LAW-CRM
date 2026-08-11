/**
 * Document Storage & File Metadata Service
 */
const path = require('path');

function getUploadPath(filename) {
  const sanitized = filename.toLowerCase().replace(/\s+/g, '_');
  return path.join(__dirname, '../../uploads', `${Date.now()}_${sanitized}`);
}

module.exports = {
  getUploadPath,
};
