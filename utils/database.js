const config = require('config');
const knex_conf = config.get('Knex');

var knex = require('knex')(knex_conf);
var bookshelf = require('bookshelf')(knex);

var Subscribe = bookshelf.Model.extend({
    tableName: 'subscribe'
});

module.exports = function () {

};