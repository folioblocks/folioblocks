/** Sort the review locally; saved image order and client feedback stay unchanged. */
( function () {
    const init = () => {
        document.querySelectorAll( '.fbks-proofing-review-table' ).forEach( table => {
            const body = table.tBodies[ 0 ];
            if ( ! body ) return;
            const rows = Array.from( body.rows );
            const originalOrder = new Map( rows.map( ( row, index ) => [ row, index ] ) );
            const buttons = Array.from( table.querySelectorAll( '[data-proofing-sort]' ) );
            buttons.forEach( button => button.addEventListener( 'click', () => {
                const heading = button.closest( 'th' );
                const direction = heading.getAttribute( 'aria-sort' ) === 'descending' ? 'ascending' : 'descending';
                const key = `data-sort-${ button.dataset.proofingSort }`;
                const multiplier = direction === 'descending' ? -1 : 1;
                rows.sort( ( a, b ) => multiplier * ( Number( a.getAttribute( key ) ) - Number( b.getAttribute( key ) ) ) || originalOrder.get( a ) - originalOrder.get( b ) );
                rows.forEach( row => body.appendChild( row ) );
                buttons.forEach( other => {
                    const active = other === button;
                    other.closest( 'th' ).setAttribute( 'aria-sort', active ? direction : 'none' );
                    other.querySelector( '.fbks-proofing-sort__indicator' ).textContent = active ? ( direction === 'descending' ? '↓' : '↑' ) : '↕';
                } );
            } ) );
        } );
    };
    if ( document.readyState === 'loading' ) document.addEventListener( 'DOMContentLoaded', init, { once: true } );
    else init();
} )();
