import { __ } from '@wordpress/i18n';
import { useRef, useState } from '@wordpress/element';
import { getPointerRating, getKeyboardRating } from './proofingRatings';

export default function ProofingRatingFilter( { filter, onChange, divider } ) {
	const [ preview, setPreview ] = useState( null );
	const dragging = useRef( false );
	const value = filter.startsWith( 'rating-' )
		? Number( filter.slice( 7 ) )
		: 0;
	const choose = ( rating ) => {
		setPreview( null );
		onChange( rating ? `rating-${ rating }` : 'all' );
	};
	return (
		<div
			className={ `fbks-proofing-rating-filter${
				divider ? ' has-group-divider' : ''
			}` }
		>
			<div
				className="fbks-proofing-rating-slider"
				role="slider"
				tabIndex={ 0 }
				aria-label={ __( 'Filter by star rating', 'folioblocks' ) }
				aria-valuemin={ 0 }
				aria-valuemax={ 5 }
				aria-valuenow={ preview ?? value }
				onPointerDown={ ( event ) => {
					event.preventDefault();
					event.stopPropagation();
					dragging.current = true;
					event.currentTarget.setPointerCapture( event.pointerId );
					setPreview(
						getPointerRating(
							event.clientX,
							event.currentTarget.getBoundingClientRect()
						)
					);
				} }
				onPointerMove={ ( event ) =>
					setPreview(
						getPointerRating(
							event.clientX,
							event.currentTarget.getBoundingClientRect()
						)
					)
				}
				onPointerUp={ ( event ) => {
					if ( ! dragging.current ) return;
					dragging.current = false;
					choose(
						getPointerRating(
							event.clientX,
							event.currentTarget.getBoundingClientRect()
						)
					);
				} }
				onPointerCancel={ () => {
					dragging.current = false;
					setPreview( null );
				} }
				onPointerLeave={ () => {
					if ( ! dragging.current ) setPreview( null );
				} }
				onKeyDown={ ( event ) => {
					const next = getKeyboardRating( event.key, value );
					if ( next !== undefined ) {
						event.preventDefault();
						event.stopPropagation();
						choose( next );
					}
				} }
			>
				{ [ 1, 2, 3, 4, 5 ].map( ( rating ) => (
					<span
						key={ rating }
						className={ `fbks-proofing-rating-star${
							( preview ?? value ) >= rating ? ' is-filled' : ''
						}` }
						aria-hidden="true"
					>
						<svg viewBox="0 0 24 24">
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
						</svg>
					</span>
				) ) }
			</div>
		</div>
	);
}
