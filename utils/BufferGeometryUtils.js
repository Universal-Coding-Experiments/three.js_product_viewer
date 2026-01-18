import { BufferGeometry, TrianglesDrawMode } from '../libs/three.module.js';

/**
 * Converts a geometry with triangle strips or triangle fans to indexed triangles.
 */
function toTrianglesDrawMode( geometry, drawMode ) {

	if ( drawMode === TrianglesDrawMode ) {

		return geometry;

	}

	const index = geometry.getIndex();

	// Generate index and convert to TRIANGLES if the mode is TRIANGLE_STRIP or TRIANGLE_FAN

	let newIndices = [];

	if ( drawMode === 5 ) { // TRIANGLE_STRIP

		for ( let i = 2; i < index.count; i ++ ) {

			if ( i % 2 === 0 ) {

				newIndices.push(
					index.getX( i - 2 ),
					index.getX( i - 1 ),
					index.getX( i )
				);

			} else {

				newIndices.push(
					index.getX( i - 1 ),
					index.getX( i - 2 ),
					index.getX( i )
				);

			}

		}

	} else if ( drawMode === 6 ) { // TRIANGLE_FAN

		for ( let i = 1; i < index.count - 1; i ++ ) {

			newIndices.push(
				index.getX( 0 ),
				index.getX( i ),
				index.getX( i + 1 )
			);

		}

	}

	if ( newIndices.length > 0 ) {

		geometry.setIndex( newIndices );

	}

	geometry.clearDrawMode();

	return geometry;

}

export { toTrianglesDrawMode };
