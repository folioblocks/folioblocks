import { RangeControl, SelectControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import CompactColorControl from './CompactColorControl';

const VALID_SHADOW_STYLES = [
	'none',
	'subtle',
	'soft',
	'elevated',
	'dramatic',
];

export const resolveShadowStyle = ( shadowStyle, dropShadow = false ) => {
	if ( VALID_SHADOW_STYLES.includes( shadowStyle ) ) {
		return shadowStyle;
	}
	return dropShadow ? 'soft' : 'none';
};

export const getShadowStyleClass = ( shadowStyle, dropShadow = false ) => {
	const resolvedStyle = resolveShadowStyle( shadowStyle, dropShadow );
	return resolvedStyle === 'none'
		? ''
		: `dropshadow dropshadow--${ resolvedStyle }`;
};

export default function ImageStyleControl( {
	attributes = {},
	setAttributes,
	onChange,
	subject = __( 'Image', 'folioblocks' ),
} ) {
	const updateAttributes = ( nextAttributes ) => {
		setAttributes( nextAttributes );
		onChange?.( nextAttributes );
	};

	const shadowStyle = resolveShadowStyle(
		attributes.shadowStyle,
		attributes.dropShadow
	);

	return (
		<>
			<CompactColorControl
				label={ __( 'Border Color', 'folioblocks' ) }
				value={ attributes.borderColor }
				onChange={ ( borderColor ) =>
					updateAttributes( { borderColor } )
				}
				help={ sprintf(
					/* translators: %s: media type, such as Image or Video. */
					__( 'Set %s border color.', 'folioblocks' ),
					subject
				) }
			/>
			<RangeControl
				label={ __( 'Border Width', 'folioblocks' ) }
				value={ attributes.borderWidth }
				onChange={ ( borderWidth ) =>
					updateAttributes( { borderWidth } )
				}
				min={ 0 }
				max={ 15 }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				help={ sprintf(
					/* translators: %s: media type, such as Image or Video. */
					__( 'Set %s border width.', 'folioblocks' ),
					subject
				) }
			/>
			<RangeControl
				label={ __( 'Border Radius', 'folioblocks' ) }
				value={ attributes.borderRadius }
				onChange={ ( borderRadius ) =>
					updateAttributes( { borderRadius } )
				}
				min={ 0 }
				max={ 50 }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				help={ sprintf(
					/* translators: %s: media type, such as Image or Video. */
					__( 'Set %s border radius.', 'folioblocks' ),
					subject
				) }
			/>
			<SelectControl
				label={ __( 'Drop Shadow', 'folioblocks' ) }
				value={ shadowStyle }
				options={ [
					{ label: __( 'None', 'folioblocks' ), value: 'none' },
					{ label: __( 'Subtle', 'folioblocks' ), value: 'subtle' },
					{ label: __( 'Soft', 'folioblocks' ), value: 'soft' },
					{
						label: __( 'Elevated', 'folioblocks' ),
						value: 'elevated',
					},
					{
						label: __( 'Dramatic', 'folioblocks' ),
						value: 'dramatic',
					},
				] }
				onChange={ ( nextShadowStyle ) =>
					updateAttributes( {
						shadowStyle: nextShadowStyle,
						dropShadow: nextShadowStyle !== 'none',
					} )
				}
				help={ sprintf(
					/* translators: %s: media type, such as image or video. */
					__(
						'Choose a drop shadow style for the %s.',
						'folioblocks'
					),
					subject.toLowerCase()
				) }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</>
	);
}
