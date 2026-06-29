const bcrypt = require('bcryptjs');
const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
Promise.all([
  bcrypt.compare('admin123', hash).then(ok => console.log('admin123 ->', ok)),
  bcrypt.compare('admin', hash).then(ok => console.log('admin ->', ok)),
  bcrypt.hash('admin123', 10).then(h => console.log('New hash for admin123:', h)),
]);
