define([
	'registries/adaptors',
	'Ractive/prototype/get/arrayAdaptor',
	'Ractive/prototype/get/magicAdaptor'
], function (
	adaptorRegistry,
	arrayAdaptor,
	magicAdaptor
) {

	'use strict';

	var prefixers = {};

	return function ( ractive, keypath, value, isExpressionResult ) {
		var len, i, adaptor, wrapped;

		// Do we have an adaptor for this value?
		len = ractive.adaptors.length;
		for ( i = 0; i < len; i += 1 ) {
			adaptor = ractive.adaptors[i];

			// Adaptors can be specified as e.g. [ 'Backbone.Model', 'Backbone.Collection' ] -
			// we need to get the actual adaptor if that's the case
			if ( typeof adaptor === 'string' ) {
				if ( !adaptorRegistry[ adaptor ] ) {
					throw new Error( 'Missing adaptor "' + adaptor + '"' );
				}
				adaptor = ractive.adaptors[i] = adaptorRegistry[ adaptor ];
			}

			if ( adaptor.filter( value, keypath, ractive ) ) {
				wrapped = ractive._wrapped[ keypath ] = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
				wrapped.value = value;
				return;
			}
		}

		if ( !isExpressionResult ) {
			if ( ractive.magic && magicAdaptor.filter( value, keypath, ractive ) ) {
				ractive._wrapped[ keypath ] = magicAdaptor.wrap( ractive, value, keypath );
			}

			else if ( ractive.modifyArrays && arrayAdaptor.filter( value, keypath, ractive ) ) {
				ractive._wrapped[ keypath ] = arrayAdaptor.wrap( ractive, value, keypath );
			}
		}
	};

	function prefixKeypath ( obj, prefix ) {
		var prefixed = {}, key;

		if ( !prefix ) {
			return obj;
		}

		prefix += '.';

		for ( key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				prefixed[ prefix + key ] = obj[ key ];
			}
		}

		return prefixed;
	}

	function getPrefixer ( rootKeypath ) {
		var rootDot;

		if ( !prefixers[ rootKeypath ] ) {
			rootDot = rootKeypath ? rootKeypath + '.' : '';

			prefixers[ rootKeypath ] = function ( relativeKeypath, value ) {
				var obj;

				if ( typeof relativeKeypath === 'string' ) {
					obj = {};
					obj[ rootDot + relativeKeypath ] = value;
					return obj;
				}

				if ( typeof relativeKeypath === 'object' ) {
					// 'relativeKeypath' is in fact a hash, not a keypath
					return rootDot ? prefixKeypath( relativeKeypath, rootKeypath ) : relativeKeypath;
				}
			};
		}

		return prefixers[ rootKeypath ];
	}

});