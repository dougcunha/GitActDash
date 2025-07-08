const { formatRelativeTime } = require('./dist/client/src/utils/time');
const assert = require('assert');

const now = Date.now();

const twoMinutesAgo = new Date(now - 2 * 60 * 1000).toISOString();
assert.strictEqual(formatRelativeTime(twoMinutesAgo), '2 minutes ago');

const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
assert.strictEqual(formatRelativeTime(oneHourAgo), '1 hour ago');

const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString();
assert.ok(formatRelativeTime(yesterday).startsWith('Yesterday'));

console.log('All tests passed');
