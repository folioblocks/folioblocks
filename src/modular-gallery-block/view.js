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

	function getRowAspectRatio( row ) {
		const imageWrappers = row
			? Array.from( row.children ).filter( ( child ) =>
					child.classList.contains(
						'wp-block-folioblocks-pb-image-block'
					)
			  )
			: [];

		return imageWrappers.reduce( ( total, wrapper ) => {
			const ratio = getImageAspectRatio(
				wrapper.querySelector( 'img.pb-image-block-img' )
			);
			return total + ratio;
		}, 0 );
	}

	function getRowImageCount( row ) {
		return row
			? Array.from( row.children ).filter( ( child ) =>
					child.classList.contains(
						'wp-block-folioblocks-pb-image-block'
					)
			  ).length
			: 0;
	}

	function getStackItems( stack ) {
		return Array.from( stack.children )
			.map( ( child ) => {
				if (
					child.classList.contains(
						'wp-block-folioblocks-pb-image-block'
					)
				) {
					const ratio = getImageAspectRatio(
						child.querySelector( 'img.pb-image-block-img' )
					);
					return ratio
						? { wrapper: child, type: 'image', ratio }
						: null;
				}

				if ( child.classList.contains( 'pb-image-row' ) ) {
					const ratio = getRowAspectRatio( child );
					return ratio
						? {
								wrapper: child,
								type: 'row',
								ratio,
								imageCount: getRowImageCount( child ),
						  }
						: null;
				}

				return null;
			} )
			.filter( Boolean );
	}

	function getStackAspectRatio( stack ) {
		const stackItems = getStackItems( stack );
		const totalInverseRatio = stackItems.reduce(
			( total, item ) => total + 1 / item.ratio,
			0
		);

		return totalInverseRatio > 0 ? 1 / totalInverseRatio : 0;
	}

	function getStackNestedRowGapAdjustment( stackItems, gap ) {
		return stackItems.reduce( ( total, item ) => {
			if ( item.type !== 'row' ) {
				return total;
			}

			const rowGaps = Math.max( 0, item.imageCount - 1 ) * gap;
			return total + rowGaps / item.ratio;
		}, 0 );
	}

	function applyImageWrapperLayout( wrapper, width, height, marginRight ) {
		const figure = wrapper.querySelector( '.pb-image-block' );
		wrapper.style.width = `${ width }px`;
		wrapper.style.height = `${ height }px`;
		wrapper.style.marginRight = marginRight;

		if ( figure ) {
			figure.style.width = '100%';
			figure.style.height = '100%';
			figure.style.marginRight = '0';
			figure.style.marginBottom = '0';
		}
	}

	function applyNestedRowLayout( row, width, height, gap ) {
		row.style.width = `${ width }px`;
		row.style.height = `${ height }px`;

		const imageWrappers = Array.from( row.children ).filter( ( child ) =>
			child.classList.contains( 'wp-block-folioblocks-pb-image-block' )
		);
		const ratios = imageWrappers.map( ( wrapper ) =>
			getImageAspectRatio(
				wrapper.querySelector( 'img.pb-image-block-img' )
			)
		);
		const totalRatio = ratios.reduce(
			( total, ratio ) => total + ratio,
			0
		);

		if ( ! totalRatio || ratios.some( ( ratio ) => ! ratio ) ) {
			return;
		}

		const widths = ratios.map( ( ratio ) => ratio * height );

		imageWrappers.forEach( ( wrapper, imageIndex ) => {
			applyImageWrapperLayout(
				wrapper,
				widths[ imageIndex ],
				height,
				imageIndex === imageWrappers.length - 1 ? '0' : `${ gap }px`
			);
		} );
	}

	function applyStackLayout( stack, width, height, marginRight, gap ) {
		stack.style.width = `${ width }px`;
		stack.style.height = `${ height }px`;
		stack.style.marginRight = marginRight;
		stack.style.marginBottom = '0';

		const stackItems = getStackItems( stack );
		if ( ! stackItems.length ) {
			return;
		}

		stackItems.forEach( ( item, index ) => {
			const itemHeight =
				item.type === 'row'
					? Math.max(
							1,
							( width -
								Math.max( 0, item.imageCount - 1 ) * gap ) /
								item.ratio
					  )
					: width / item.ratio;
			item.wrapper.style.marginBottom =
				index === stackItems.length - 1 ? '0' : `${ gap }px`;

			if ( item.type === 'image' ) {
				applyImageWrapperLayout( item.wrapper, width, itemHeight, '0' );
				return;
			}

			applyNestedRowLayout( item.wrapper, width, itemHeight, gap );
		} );
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
				const aspectRatio = getStackAspectRatio( child );
				if ( aspectRatio ) {
					const stackItems = getStackItems( child );
					return {
						aspectRatio,
						isStack: true,
						stackImageCount: stackItems.length,
						nestedRowGapAdjustment: getStackNestedRowGapAdjustment(
							stackItems,
							gap
						),
					};
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
		const nestedRowGapWidthAdjustment = layoutItems.reduce(
			( sum, item ) => {
				if ( ! item.isStack ) {
					return sum;
				}

				return sum + item.nestedRowGapAdjustment * item.aspectRatio;
			},
			0
		);
		const targetHeight =
			( containerWidth -
				gap * ( children.length - 1 ) +
				stackGapWidthAdjustment -
				nestedRowGapWidthAdjustment ) /
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
				const aspectRatio = getStackAspectRatio( child );
				if ( ! aspectRatio ) {
					return;
				}
				const stackGaps =
					Math.max( 0, getStackItems( child ).length - 1 ) * gap;
				const stackItems = getStackItems( child );
				const nestedRowGapAdjustment = getStackNestedRowGapAdjustment(
					stackItems,
					gap
				);
				const width =
					Math.max(
						1,
						targetHeight - stackGaps + nestedRowGapAdjustment
					) * aspectRatio;
				applyStackLayout(
					child,
					width,
					targetHeight,
					`${ gap }px`,
					gap
				);
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

	function scheduleLayout( row, attempt = 0, onComplete = null ) {
		window.requestAnimationFrame( () => {
			const didLayout = recalculateLayout( row );
			if ( didLayout || attempt >= MAX_LAYOUT_ATTEMPTS ) {
				if ( onComplete ) {
					onComplete( didLayout );
				}
				return;
			}
			setTimeout(
				() => scheduleLayout( row, attempt + 1, onComplete ),
				50
			);
		} );
	}

	// Initialize layout on DOMContentLoaded and resize
	document.querySelectorAll( '.pb-modular-gallery' ).forEach( ( gallery ) => {
		const wrapper = gallery.closest(
			'.wp-block-folioblocks-modular-gallery-block'
		);
		const rows = Array.from(
			gallery.querySelectorAll( '.pb-image-row' )
		).filter( ( row ) => ! row.closest( '.pb-image-stack' ) );
		const imageBlocks = gallery.querySelectorAll(
			'.wp-block-folioblocks-pb-image-block'
		);
		let readyRows = 0;
		let hasRevealed = false;

		if ( wrapper ) {
			wrapper.classList.add( 'is-loading' );
		}

		imageBlocks.forEach( ( block ) => {
			block.style.opacity = 0;
			block.style.transform = 'translateY(20px)';
			block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
		} );

		const revealGallery = () => {
			if ( hasRevealed ) {
				return;
			}

			hasRevealed = true;
			if ( wrapper ) {
				wrapper.classList.remove( 'is-loading' );
			}

			imageBlocks.forEach( ( block, index ) => {
				setTimeout( () => {
					block.style.opacity = 1;
					block.style.transform = 'translateY(0)';
				}, index * 150 );
			} );
		};

		const markRowReady = () => {
			readyRows++;
			if ( readyRows >= rows.length ) {
				revealGallery();
			}
		};

		if ( ! rows.length ) {
			revealGallery();
			return;
		}

		rows.forEach( ( row ) => {
			waitForImages( row, () => {
				const stacks = row.querySelectorAll( '.pb-image-stack' );
				if ( stacks.length === 0 ) {
					scheduleLayout( row, 0, markRowReady );
				} else {
					let stacksLoaded = 0;
					stacks.forEach( ( stack ) => {
						waitForImages( stack, () => {
							stacksLoaded++;
							if ( stacksLoaded === stacks.length ) {
								scheduleLayout( row, 0, markRowReady );
							}
						} );
					} );
				}
			} );
			window.addEventListener( 'load', () => scheduleLayout( row ) );
			window.addEventListener( 'resize', () => scheduleLayout( row ) );
		} );
	} );
} );
