define([
	'utils/warn',
	'utils/matches',
	'utils/defineProperties',
	'Ractive/prototype/shared/makeQuery/_makeQuery'
], function (
	warn,
	matches,
	defineProperties,
	makeQuery
) {

	'use strict';

	return function ( selector, options ) {
		var liveQueries, query;

		if ( !this.el ) {
			return [];
		}

		options = options || {};
		liveQueries = this._liveQueries;

		// Shortcut: if we're maintaining a live query with this
		// selector, we don't need to traverse the parallel DOM
		if ( query = liveQueries[ selector ] ) {

			// Either return the exact same query, or (if not live) a snapshot
			return ( options && options.live ) ? query : query.slice();
		}

		query = makeQuery( this, selector, !!options.live, false );

		// Add this to the list of live queries Ractive needs to maintain,
		// if applicable
		if ( query.live ) {
			liveQueries.push( selector );
			liveQueries[ selector ] = query;
		}

		this.fragment.findAll( selector, query );
		return query;
	};

});