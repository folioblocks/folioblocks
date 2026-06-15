/**
 * Modular Gallery Block
 * View JS
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const MAX_LAYOUT_ATTEMPTS = 20;

	function getImageAspectRatio( img ) {
		if ( ! img ) {
			return 0;
		}

		const width =
			img.naturalWidth ||
			parseFloat( img.getAttribute( 'width' ) ) ||
			img.width ||
			0;
		const height =
			img.naturalHeight ||
			parseFloat( img.getAttribute( 'height' ) ) ||
			img.height ||
			0;

		return width > 0 && height > 0 ? width / height : 0;
	}

	// Helper function to wait for all images to load
	function waitForImages( container, callback ) {
		const images = container.querySelectorAll( 'img.pb-image-block-img' );
		let loadedCount = 0;

		if ( images.length === 0 ) {
			callback();
			return;
		}

		images.forEach( ( img ) => {
			if ( img.complete ) {
				loadedCount++;
				if ( loadedCount === images.length ) {
					callback();
				}
			} else {
				img.addEventListener( 'load', () => {
					loadedCount++;
					if ( loadedCount === images.length ) {
						callback();
					}
				} );
				img.addEventListener( 'error', () => {
					loadedCount++;
					if ( loadedCount === images.length ) {
						callback();
					}
				} );
			}
		} );
	}

	// Function to recalculate layout
	function recalculateLayout( container ) {
		if ( ! container ) {
			return false;
		}

		// Skip layout on mobile if collapse-on-mobile is active
		const gallery = container.closest( '.pb-modular-gallery' );
		if (
			gallery?.classList.contains( 'collapse-on-mobile' ) &&
			window.innerWidth < 768
		) {
			Array.from( container.children ).forEach( ( child ) => {
				// Clear layout styles
				child.style.width = '';
				child.style.height = '';
				child.style.marginRight = '';
				child.style.marginBottom = '';

				const figures = child.querySelectorAll( '.pb-image-block' );
				figures.forEach( ( figure ) => {
					figure.style.width = '';
					figure.style.height = '';
					figure.style.marginRight = '';
					figure.style.marginBottom = '';
				} );
			} );
			return true;
		}
		const children = Array.from( container.children );
		const containerWidth = container.clientWidth;
		const modularGallery = container.closest( '.pb-modular-gallery' );
		const wrapper = container.closest(
			'.wp-block-folioblocks-modular-gallery-block'
		);
		const styles = window.getComputedStyle( wrapper || modularGallery );
		let gapProperty = '--pb-gallery-gap-desktop';
		if ( containerWidth <= 600 ) {
			gapProperty = '--pb-gallery-gap-mobile';
		} else if ( containerWidth <= 1024 ) {
			gapProperty = '--pb-gallery-gap-tablet';
		}
		const responsiveGap = parseFloat(
			styles.getPropertyValue( gapProperty )
		);
		let gap = Number.isFinite( responsiveGap ) ? responsiveGap : 10;
		if ( modularGallery?.classList.contains( 'no-gap' ) ) {
			gap = 0;
		}

		if ( ! children.length || ! containerWidth ) {
			return false;
		}

		const layoutItems = children.map( ( child ) => {
			if (
				child.classList.contains(
					'wp-block-folioblocks-pb-image-block'
				)
			) {
				const img = child.querySelector( 'img.pb-image-block-img' );
				if ( img ) {
					const aspectRatio = getImageAspectRatio( img );
					if ( aspectRatio ) {
						return {
							aspectRatio,
							isStack: false,
							stackImageCount: 0,
						};
					}
				}
			} else if ( child.classList.contains( 'pb-image-stack' ) ) {
				const imgs = child.querySelectorAll( 'img.pb-image-block-img' );
				if ( imgs.length > 0 ) {
					let totalInverseRatio = 0;
					imgs.forEach( ( img ) => {
						const aspectRatio = getImageAspectRatio( img );
						if ( aspectRatio ) {
							totalInverseRatio += 1 / aspectRatio;
						}
					} );
					if ( totalInverseRatio > 0 ) {
						return {
							aspectRatio: 1 / totalInverseRatio,
							isStack: true,
							stackImageCount: imgs.length,
						};
					}
				}
			}
			return null;
		} );
		const totalAspectRatio = layoutItems.reduce(
			( sum, item ) => sum + ( item?.aspectRatio || 0 ),
			0
		);

		if (
			layoutItems.some( ( item ) => ! item ) ||
			! totalAspectRatio ||
			! Number.isFinite( totalAspectRatio )
		) {
			return false;
		}

		const stackGapWidthAdjustment = layoutItems.reduce( ( sum, item ) => {
			if ( ! item.isStack ) {
				return sum;
			}
			const stackGaps = Math.max( 0, item.stackImageCount - 1 );
			return sum + stackGaps * gap * item.aspectRatio;
		}, 0 );
		const targetHeight =
			( containerWidth -
				gap * ( children.length - 1 ) +
				stackGapWidthAdjustment ) /
			totalAspectRatio;

		if ( ! targetHeight || ! Number.isFinite( targetHeight ) ) {
			return false;
		}

		children.forEach( ( child ) => {
			if (
				child.classList.contains(
					'wp-block-folioblocks-pb-image-block'
				)
			) {
				const img = child.querySelector(
					'figure img.pb-image-block-img'
				);
				if ( img ) {
					const aspectRatio = getImageAspectRatio( img );
					if ( ! aspectRatio ) {
						return;
					}
					const width = targetHeight * aspectRatio;
					const figure = child.querySelector( '.pb-image-block' );
					child.style.width = `${ width }px`;
					child.style.height = `${ targetHeight }px`;
					child.style.marginRight = `${ gap }px`;
					child.style.marginBottom = `${ gap }px`;
					if ( figure ) {
						figure.style.width = '100%';
						figure.style.height = '100%';
						figure.style.marginRight = '0';
						figure.style.marginBottom = '0';
					}
				}
			} else if ( child.classList.contains( 'pb-image-stack' ) ) {
				const imgs = child.querySelectorAll( 'img.pb-image-block-img' );
				const stackAspectRatios = Array.from( imgs )
					.map( ( img ) => {
						return getImageAspectRatio( img );
					} )
					.filter( Boolean );
				if ( stackAspectRatios.length !== imgs.length ) {
					return;
				}
				const totalInverseRatio = stackAspectRatios.reduce(
					( sum, aspectRatio ) => sum + 1 / aspectRatio,
					0
				);
				const stackAspectRatio =
					totalInverseRatio > 0 ? 1 / totalInverseRatio : 1;
				const stackGaps = Math.max( 0, imgs.length - 1 ) * gap;
				const width =
					Math.max( 1, targetHeight - stackGaps ) * stackAspectRatio;
				child.style.width = `${ width }px`;
				child.style.height = `${ targetHeight }px`;
				child.style.marginRight = `${ gap }px`;
				child.style.marginBottom = `${ gap }px`;

				const figures = child.querySelectorAll( '.pb-image-block' );
				let totalFigureInverseRatio = 0;
				imgs.forEach( ( img ) => {
					const aspectRatio = getImageAspectRatio( img );
					if ( aspectRatio ) {
						totalFigureInverseRatio += 1 / aspectRatio;
					}
				} );

				figures.forEach( ( figure, index ) => {
					const img = figure.querySelector(
						'img.pb-image-block-img'
					);
					const aspectRatio = getImageAspectRatio( img );
					const effectiveStackHeight =
						totalFigureInverseRatio > 0
							? Math.max(
									1,
									targetHeight - gap * ( figures.length - 1 )
							  )
							: targetHeight;

					const figureHeight =
						totalFigureInverseRatio > 0 && aspectRatio
							? ( effectiveStackHeight * ( 1 / aspectRatio ) ) /
							  totalFigureInverseRatio
							: effectiveStackHeight / figures.length;

					figure.style.width = '100%';
					figure.style.height = `${ figureHeight }px`;
					figure.style.marginRight = `0`;
					figure.style.marginBottom =
						index < figures.length - 1 ? `${ gap }px` : `0`;
				} );
			}
		} );

		// Remove right margin from last child
		if ( children.length > 0 ) {
			const lastChild = children[ children.length - 1 ];
			if (
				lastChild.classList.contains(
					'wp-block-folioblocks-pb-image-block'
				)
			) {
				const figure = lastChild.querySelector( '.pb-image-block' );
				if ( figure ) {
					lastChild.style.marginRight = '0';
				}
			} else {
				lastChild.style.marginRight = '0';
			}
		}

		return true;
	}

	function scheduleLayout( row, attempt = 0 ) {
		window.requestAnimationFrame( () => {
			const didLayout = recalculateLayout( row );
			if ( didLayout || attempt >= MAX_LAYOUT_ATTEMPTS ) {
				return;
			}
			setTimeout( () => scheduleLayout( row, attempt + 1 ), 50 );
		} );
	}

	// Initialize layout on DOMContentLoaded and resize
	const rows = document.querySelectorAll( '.pb-image-row' );
	rows.forEach( ( row ) => {
		waitForImages( row, () => {
			const stacks = row.querySelectorAll( '.pb-image-stack' );
			if ( stacks.length === 0 ) {
				scheduleLayout( row );
			} else {
				let stacksLoaded = 0;
				stacks.forEach( ( stack ) => {
					waitForImages( stack, () => {
						stacksLoaded++;
						if ( stacksLoaded === stacks.length ) {
							scheduleLayout( row );
						}
					} );
				} );
			}
		} );
		window.addEventListener( 'load', () => scheduleLayout( row ) );
		window.addEventListener( 'resize', () => scheduleLayout( row ) );
	} );

	// Sequential fade-in for Modular gallery images
	const gridBlocks = document.querySelectorAll(
		'.wp-block-folioblocks-pb-image-block'
	);
	gridBlocks.forEach( ( block, index ) => {
		block.style.opacity = 0;
		block.style.transform = 'translateY(20px)';
		block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
		setTimeout( () => {
			block.style.opacity = 1;
			block.style.transform = 'translateY(0)';
		}, index * 150 );
	} );
} );
