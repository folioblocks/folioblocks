import { __ } from '@wordpress/i18n';
import { CheckboxControl } from '@wordpress/components';
import { SOCIAL_SHARE_ICONS } from './socialShareIcons';

export const SOCIAL_SHARE_SERVICES = [
	{ value: 'facebook', label: __( 'Facebook', 'folioblocks' ) },
	{ value: 'linkedin', label: __( 'LinkedIn', 'folioblocks' ) },
	{ value: 'x', label: __( 'X', 'folioblocks' ) },
	{ value: 'bluesky', label: __( 'Bluesky', 'folioblocks' ) },
	{ value: 'pinterest', label: __( 'Pinterest', 'folioblocks' ) },
	{ value: 'threads', label: __( 'Threads', 'folioblocks' ) },
	{ value: 'copy', label: __( 'Copy Link', 'folioblocks' ) },
];

export const DEFAULT_SOCIAL_SHARE_SOURCES = [
	'facebook',
	'linkedin',
	'x',
	'pinterest',
	'copy',
];

export const normalizeSocialShareSources = ( sources ) => {
	const validSources = SOCIAL_SHARE_SERVICES.map(
		( service ) => service.value
	);
	const sourceList = Array.isArray( sources ) ? sources : [];
	const selectedSources = [];

	sourceList.forEach( ( source ) => {
		if (
			validSources.includes( source ) &&
			! selectedSources.includes( source ) &&
			selectedSources.length < 5
		) {
			selectedSources.push( source );
		}
	} );

	return validSources.filter( ( source ) => selectedSources.includes( source ) );
};

export const getSocialShareSources = ( sources, fallbackSources ) => {
	const normalized = normalizeSocialShareSources( sources );

	if ( normalized.length > 0 ) {
		return normalized;
	}

	return normalizeSocialShareSources(
		fallbackSources || DEFAULT_SOCIAL_SHARE_SOURCES
	);
};

export const getGlobalSocialShareSources = () =>
	getSocialShareSources(
		typeof window !== 'undefined'
			? window.folioBlocksData?.socialSharing?.sources
			: [],
		DEFAULT_SOCIAL_SHARE_SOURCES
	);

export const SocialShareSourcesControl = ( {
	value,
	onChange,
	fallbackValue,
} ) => {
	const selectedSources = getSocialShareSources( value, fallbackValue );

	const updateSource = ( source, checked ) => {
		if ( checked ) {
			if (
				selectedSources.includes( source ) ||
				selectedSources.length >= 5
			) {
				return;
			}
			onChange( [ ...selectedSources, source ] );
			return;
		}

		onChange( selectedSources.filter( ( item ) => item !== source ) );
	};

	return (
		<div className="pb-social-share-sources-control">
			<div
				className="components-base-control__label"
				style={ {
					color: 'rgb(30, 30, 30)',
					fontSize: '11px',
					fontWeight: 499,
					lineHeight: '15.4px',
					textTransform: 'uppercase',
					marginBottom: '8px',
				} }
			>
				{ __( 'Sharing Sources', 'folioblocks' ) }
			</div>
			<div
				style={ {
					display: 'grid',
					gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
					columnGap: '16px',
					rowGap: '4px',
				} }
			>
				{ SOCIAL_SHARE_SERVICES.map( ( service ) => {
					const checked = selectedSources.includes( service.value );
					const disabled = ! checked && selectedSources.length >= 5;

					return (
						<div key={ service.value } style={ { marginBottom: 0 } }>
							<CheckboxControl
								label={ service.label }
								checked={ checked }
								disabled={ disabled }
								onChange={ ( isChecked ) =>
									updateSource( service.value, isChecked )
								}
								__nextHasNoMarginBottom
							/>
						</div>
					);
				} ) }
			</div>
			<p
				className="components-base-control__help"
				style={ {
					color: 'rgb(117, 117, 117)',
					fontSize: '12px',
					lineHeight: '18px',
					marginTop: '8px',
				} }
			>
				{ __( 'You can select up to 5 sources.', 'folioblocks' ) }
			</p>
		</div>
	);
};

export const isSocialSharingEnabled = () => getGlobalSocialShareSources().length > 0;

export const getSharedSocialSources = () => getGlobalSocialShareSources();

export const OverlaySocialContent = () => {
	const sources = getGlobalSocialShareSources();
	const serviceMap = SOCIAL_SHARE_SERVICES.reduce( ( acc, service ) => {
		acc[ service.value ] = service.label;
		return acc;
	}, {} );

	return (
		<div className="pb-social-share pb-social-share--overlay">
			{ sources.map( ( source ) => (
				<span
					className={ `pb-social-share__link pb-social-share__link--${ source }` }
					key={ source }
				>
					<span
						className="pb-social-share__icon"
						aria-hidden="true"
						dangerouslySetInnerHTML={ {
							__html: SOCIAL_SHARE_ICONS[ source ] || '',
						} }
					/>
					<span className="pb-social-share__label">
						{ serviceMap[ source ] || source }
					</span>
				</span>
			) ) }
		</div>
	);
};
