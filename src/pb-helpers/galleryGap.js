export const DEFAULT_GALLERY_GAP = 10;
export const MAX_GALLERY_GAP = 50;

const clampGap = ( value ) =>
	Math.min( Math.max( Number( value ) || 0, 0 ), MAX_GALLERY_GAP );

export const resolveGalleryGaps = ( attributes = {} ) => {
	if ( attributes.noGap ) {
		return {
			gap: 0,
			tabletGap: 0,
			mobileGap: 0,
		};
	}

	const gap = clampGap( attributes.gap ?? DEFAULT_GALLERY_GAP );

	return {
		gap,
		tabletGap: clampGap( attributes.tabletGap ?? gap ),
		mobileGap: clampGap( attributes.mobileGap ?? gap ),
	};
};

export const resolveLegacyGalleryGaps = ( attributes = {} ) => {
	const gap = attributes.noGap ? 0 : DEFAULT_GALLERY_GAP;

	return {
		gap,
		tabletGap: gap,
		mobileGap: gap,
	};
};

export const getGalleryGapForWidth = ( attributes = {}, width = 0 ) => {
	const gaps = resolveGalleryGaps( attributes );

	if ( width <= 600 ) {
		return gaps.mobileGap;
	}
	if ( width <= 1024 ) {
		return gaps.tabletGap;
	}
	return gaps.gap;
};
