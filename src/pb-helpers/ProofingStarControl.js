import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';

import {
	getPointerRating,
	getKeyboardRating,
	normalizeClientRating,
} from './proofingRatings';

/** Editor-only preview. Client ratings are saved by the front-end session store. */
export default function ProofingStarControl( {
	value,
	onChange,
	slot,
	open,
	onOpenChange,
	dark,
} ) {
	const [ preview, setPreview ] = useState( null );
	const keyboardOpen = useRef( false );
	const dragging = useRef( false );
	const trigger = useRef( null );
	const panel = useRef( null );
	useEffect( () => {
		setPreview( null );
		dragging.current = false;
		if ( open && keyboardOpen.current ) {
			panel.current?.querySelector( '[role=slider]' )?.focus();
		}
	}, [ open ] );
	const close = () => {
		onOpenChange( false );
		trigger.current?.focus();
	};
	return (
		<>
			<button
				ref={ trigger }
				type="button"
				className={ `fbks-proofing-thumbnail-control fbks-proofing-thumbnail-control--rating fbks-proofing-thumbnail-control--slot-${ slot }${
					value ? ' is-active' : ''
				}` }
				aria-label={
					value
						? sprintf(
								__( 'Client rating: %d/5', 'folioblocks' ),
								value
						  )
						: __( 'Rate image', 'folioblocks' )
				}
				aria-expanded={ open }
				onClick={ ( event ) => {
					event.preventDefault();
					event.stopPropagation();
					keyboardOpen.current = event.detail === 0;
					onOpenChange( ! open );
				} }
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
				</svg>
				<span className="fbks-proofing-rating-value">
					{ value || '' }
				</span>
			</button>
			{ open && (
				<div
					ref={ panel }
					className={ `fbks-proofing-rating-popover is-open fbks-proofing-popover--slot-${ slot }${
						dark ? ' fbks-proofing-popover--dark' : ''
					}` }
					role="group"
					aria-label={ __( 'Client star rating', 'folioblocks' ) }
					onMouseDown={ ( event ) => event.stopPropagation() }
					onKeyDown={ ( event ) => {
						if ( event.key === 'Escape' ) {
							event.preventDefault();
							event.stopPropagation();
							close();
						}
					} }
				>
					<div
						className="fbks-proofing-rating-slider"
						role="slider"
						tabIndex={ 0 }
						aria-label={ __( 'Client star rating', 'folioblocks' ) }
						aria-valuemin={ 0 }
						aria-valuemax={ 5 }
						aria-valuenow={ preview ?? value ?? 0 }
						onPointerDown={ ( event ) => {
							event.preventDefault();
							event.stopPropagation();
							dragging.current = true;
							event.currentTarget.setPointerCapture(
								event.pointerId
							);
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
							onChange(
								normalizeClientRating(
									getPointerRating(
										event.clientX,
										event.currentTarget.getBoundingClientRect()
									)
								)
							);
							setPreview( null );
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
								setPreview( null );
								onChange( next );
							}
						} }
					>
						{ [ 1, 2, 3, 4, 5 ].map( ( rating ) => (
							<span
								key={ rating }
								className={ `fbks-proofing-rating-star${
									( preview ?? value ?? 0 ) >= rating
										? ' is-filled'
										: ''
								}` }
								aria-hidden="true"
							>
								<svg viewBox="0 0 24 24">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
								</svg>
							</span>
						) ) }
					</div>
					<button
						type="button"
						className="fbks-proofing-rating-done"
						onClick={ close }
					>
						{ __( 'Done', 'folioblocks' ) }
					</button>
				</div>
			) }
		</>
	);
}
