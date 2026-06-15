const getJustifiedRowHeight = ( items, containerWidth, gap ) => {
	const totalAspectRatio = items.reduce(
		( total, item ) => total + item.aspectRatio,
		0
	);
	const availableWidth = containerWidth - ( items.length - 1 ) * gap;

	return availableWidth / totalAspectRatio;
};

const createLayoutRow = (
	items,
	containerWidth,
	targetRowHeight,
	gap,
	justify
) => {
	const height = justify
		? getJustifiedRowHeight( items, containerWidth, gap )
		: targetRowHeight;
	const roundedHeight = Math.max( 1, Math.round( height ) );
	const totalGaps = ( items.length - 1 ) * gap;
	const availableWidth = Math.max( 1, containerWidth - totalGaps );
	let usedWidth = 0;

	return items.map( ( item, index ) => {
		const isLastItem = index === items.length - 1;
		const width =
			justify && isLastItem
				? Math.max( 1, availableWidth - usedWidth )
				: Math.max( 1, Math.round( item.aspectRatio * height ) );

		usedWidth += width;

		return {
			...item,
			layoutWidth: width,
			layoutHeight: roundedHeight,
		};
	} );
};

export const calculateJustifiedLayout = ( {
	items,
	containerWidth,
	targetRowHeight,
	gap,
	finalRowFillThreshold = 0.9,
} ) => {
	if ( ! items.length || containerWidth <= 0 || targetRowHeight <= 0 ) {
		return [];
	}

	const rows = [];
	let currentRow = [];

	items.forEach( ( item ) => {
		const candidateRow = [ ...currentRow, item ];
		const candidateHeight = getJustifiedRowHeight(
			candidateRow,
			containerWidth,
			gap
		);

		if ( currentRow.length > 0 && candidateHeight < targetRowHeight ) {
			const currentHeight = getJustifiedRowHeight(
				currentRow,
				containerWidth,
				gap
			);
			const currentDifference = Math.abs(
				currentHeight - targetRowHeight
			);
			const candidateDifference = Math.abs(
				candidateHeight - targetRowHeight
			);

			if ( currentDifference <= candidateDifference ) {
				rows.push( { items: currentRow, justify: true } );
				currentRow = [ item ];
				return;
			}

			rows.push( { items: candidateRow, justify: true } );
			currentRow = [];
			return;
		}

		currentRow = candidateRow;
	} );

	if ( currentRow.length > 0 ) {
		const totalAspectRatio = currentRow.reduce(
			( total, item ) => total + item.aspectRatio,
			0
		);
		const totalGaps = ( currentRow.length - 1 ) * gap;
		const targetWidth = totalAspectRatio * targetRowHeight + totalGaps;

		rows.push( {
			items: currentRow,
			justify: targetWidth / containerWidth > finalRowFillThreshold,
		} );
	}

	return rows.map( ( row ) =>
		createLayoutRow(
			row.items,
			containerWidth,
			targetRowHeight,
			gap,
			row.justify
		)
	);
};
