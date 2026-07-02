( function ( wp ) {
	const { __ } = wp.i18n;
	const { TextControl, ToggleControl } = wp.components;
	const { createElement, Fragment, useEffect, useState } = wp.element;
	const { addFilter } = wp.hooks;
	const { registerPlugin } = wp.plugins;
	const { useEntityProp } = wp.coreData;
	const { useSelect } = wp.data;
	const { PluginDocumentSettingPanel } = wp.editor;

	const lazyLoadBlocks = new Set( [
		'folioblocks/before-after-block',
		'folioblocks/carousel-gallery-block',
		'folioblocks/filmstrip-gallery-block',
		'folioblocks/grid-gallery-block',
		'folioblocks/justified-gallery-block',
		'folioblocks/masonry-gallery-block',
		'folioblocks/modular-gallery-block',
		'folioblocks/pb-image-block',
		'folioblocks/pb-video-block',
		'folioblocks/video-gallery-block',
	] );
	const rightClickBlocks = new Set( [
		'folioblocks/background-video-block',
		...lazyLoadBlocks,
		'folioblocks/pb-loupe-block',
	] );
	const dragToSaveBlocks = new Set( [
		...lazyLoadBlocks,
		'folioblocks/pb-loupe-block',
	] );
	const legacyControlHooks = [
		'folioBlocks.backgroundVideoBlock.disableRightClickToggle',
		'folioBlocks.beforeAfter.disableRightClickToggle',
		'folioBlocks.beforeAfter.lazyLoadToggle',
		'folioBlocks.carouselGallery.disableRightClickToggle',
		'folioBlocks.carouselGallery.lazyLoadToggle',
		'folioBlocks.filmstripGallery.disableRightClickToggle',
		'folioBlocks.filmstripGallery.lazyLoadToggle',
		'folioBlocks.gridGallery.disableRightClickToggle',
		'folioBlocks.gridGallery.lazyLoadToggle',
		'folioBlocks.imageBlock.disableRightClickToggle',
		'folioBlocks.imageBlock.lazyLoadToggle',
		'folioBlocks.justifiedGallery.disableRightClickToggle',
		'folioBlocks.justifiedGallery.lazyLoadToggle',
		'folioBlocks.loupeBlock.disableRightClickToggle',
		'folioBlocks.masonryGallery.disableRightClickToggle',
		'folioBlocks.masonryGallery.lazyLoadToggle',
		'folioBlocks.modularGallery.disableRightClickToggle',
		'folioBlocks.modularGallery.lazyLoadToggle',
		'folioBlocks.videoBlock.disableRightClickToggle',
		'folioBlocks.videoBlock.lazyLoadToggle',
		'folioBlocks.videoGallery.disableRightClickToggle',
		'folioBlocks.videoGallery.lazyLoadToggle',
	];

	const getCapabilities = ( blocks ) =>
		( blocks || [] ).reduce(
			( capabilities, block ) => {
				const inner = getCapabilities( block.innerBlocks );
				return {
					hasLazyLoad:
						capabilities.hasLazyLoad ||
						lazyLoadBlocks.has( block.name ) ||
						inner.hasLazyLoad,
					hasRightClick:
						capabilities.hasRightClick ||
						rightClickBlocks.has( block.name ) ||
						inner.hasRightClick,
					hasDragToSave:
						capabilities.hasDragToSave ||
						dragToSaveBlocks.has( block.name ) ||
						inner.hasDragToSave,
				};
			},
			{ hasLazyLoad: false, hasRightClick: false, hasDragToSave: false }
		);

	const getContentCapabilities = ( content ) => {
		const value = typeof content === 'string' ? content : '';
		return {
			hasLazyLoad: [ ...lazyLoadBlocks ].some( ( blockName ) =>
				value.includes( `wp:${ blockName }` )
			),
			hasRightClick: [ ...rightClickBlocks ].some( ( blockName ) =>
				value.includes( `wp:${ blockName }` )
			),
			hasDragToSave: [ ...dragToSaveBlocks ].some( ( blockName ) =>
				value.includes( `wp:${ blockName }` )
			),
		};
	};

	const PageMediaSettings = () => {
		const { hasLazyLoad, hasRightClick, hasDragToSave, postId, postType } =
			useSelect( ( select ) => {
				const blockCapabilities = getCapabilities(
					select( 'core/block-editor' ).getBlocks()
				);
				const contentCapabilities = getContentCapabilities(
					select( 'core/editor' ).getEditedPostContent()
				);

				return {
					hasLazyLoad:
						blockCapabilities.hasLazyLoad ||
						contentCapabilities.hasLazyLoad,
					hasRightClick:
						blockCapabilities.hasRightClick ||
						contentCapabilities.hasRightClick,
					hasDragToSave:
						blockCapabilities.hasDragToSave ||
						contentCapabilities.hasDragToSave,
					postId: select( 'core/editor' ).getCurrentPostId(),
					postType: select( 'core/editor' ).getCurrentPostType(),
				};
			}, [] );
		const [ meta, setMeta ] = useEntityProp(
			'postType',
			postType || 'post',
			'meta',
			postId
		);
		const [ password, setPassword ] = useEntityProp(
			'postType',
			postType || 'post',
			'password',
			postId
		);
		const [ isPasswordControlOpen, setIsPasswordControlOpen ] = useState(
			!! password
		);

		useEffect( () => {
			if ( password ) {
				setIsPasswordControlOpen( true );
			}
		}, [ password ] );

		if (
			! PluginDocumentSettingPanel ||
			! postId ||
			! postType ||
			( ! hasLazyLoad && ! hasRightClick && ! hasDragToSave )
		) {
			return null;
		}

		const updateMeta = ( key, value ) => {
			setMeta( { ...meta, [ key ]: !! value } );
		};
		const controls = [];

		if ( postType === 'post' || postType === 'page' ) {
			let passwordHelp = __(
				'Require a password before visitors can view the page.',
				'folioblocks'
			);
			if ( isPasswordControlOpen && ! password ) {
				passwordHelp = __(
					'Enter a password to protect this page.',
					'folioblocks'
				);
			} else if ( password ) {
				passwordHelp = __(
					'Visitors must enter this password to view the page.',
					'folioblocks'
				);
			}

			controls.push(
				createElement( ToggleControl, {
					key: 'password-protection',
					label: __( 'Password Protect Page', 'folioblocks' ),
					checked: isPasswordControlOpen,
					onChange: ( value ) => {
						setIsPasswordControlOpen( value );
						if ( ! value ) {
							setPassword( '' );
						}
					},
					help: passwordHelp,
					__nextHasNoMarginBottom: true,
				} )
			);

			if ( isPasswordControlOpen ) {
				controls.push(
					createElement( TextControl, {
						key: 'page-password',
						label: __( 'Page Password', 'folioblocks' ),
						value: password || '',
						onChange: setPassword,
						autoComplete: 'new-password',
						__nextHasNoMarginBottom: true,
						__next40pxDefaultSize: true,
					} )
				);
			}
		}

		if ( hasLazyLoad ) {
			controls.push(
				createElement( ToggleControl, {
					key: 'lazy-load',
					label: __( 'Enable Lazy Load of Images', 'folioblocks' ),
					checked: !! meta?.fbksLazyLoad,
					onChange: ( value ) => updateMeta( 'fbksLazyLoad', value ),
					help: __(
						'Lazy load compatible FolioBlocks images and thumbnails on this page.',
						'folioblocks'
					),
					__nextHasNoMarginBottom: true,
				} )
			);
		}
		if ( hasRightClick ) {
			controls.push(
				createElement( ToggleControl, {
					key: 'disable-right-click',
					label: __( 'Disable Right-Click on Page', 'folioblocks' ),
					checked: !! meta?.fbksDisableRightClick,
					onChange: ( value ) =>
						updateMeta( 'fbksDisableRightClick', value ),
					help: __(
						'Prevent right-clicking on compatible FolioBlocks media on this page.',
						'folioblocks'
					),
					__nextHasNoMarginBottom: true,
				} )
			);
		}
		if ( hasDragToSave ) {
			controls.push(
				createElement( ToggleControl, {
					key: 'disable-drag-to-save',
					label: __( 'Disable Drag To Save', 'folioblocks' ),
					checked: !! meta?.fbksDisableDragToSave,
					onChange: ( value ) =>
						updateMeta( 'fbksDisableDragToSave', value ),
					help: __(
						'Prevent visitors from dragging compatible FolioBlocks images on this page.',
						'folioblocks'
					),
					__nextHasNoMarginBottom: true,
				} )
			);
		}

		return createElement(
			PluginDocumentSettingPanel,
			{
				name: 'folioblocks-page-media-settings',
				title: __( 'FolioBlocks Page Settings', 'folioblocks' ),
			},
			createElement(
				'div',
				{
					style: {
						display: 'grid',
						gap: '16px',
					},
				},
				createElement( Fragment, null, ...controls )
			)
		);
	};

	legacyControlHooks.forEach( ( hookName ) => {
		addFilter(
			hookName,
			'folioblocks/page-media-settings-remove-block-control',
			() => null,
			1000
		);
	} );
	registerPlugin( 'folioblocks-page-media-settings', {
		render: PageMediaSettings,
	} );
} )( window.wp );
