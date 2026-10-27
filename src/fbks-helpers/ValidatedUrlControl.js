import { TextControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isValidHttpUrl } from './urlValidation';
import './validated-url-control.scss';

export default function ValidatedUrlControl( {
	value = '',
	onChange,
	help,
	invalidHelp = __(
		'Enter a valid URL beginning with http:// or https://.',
		'folioblocks'
	),
	validate = isValidHttpUrl,
	onValidityChange,
	...controlProps
} ) {
	const [ draftValue, setDraftValue ] = useState( value || '' );
	const isValid = draftValue === '' || validate( draftValue );

	useEffect( () => {
		if ( value === '' && draftValue !== '' && ! validate( draftValue ) ) {
			return;
		}
		setDraftValue( value || '' );
	}, [ value, draftValue, validate ] );

	useEffect( () => {
		onValidityChange?.( isValid );
	}, [ isValid, onValidityChange ] );

	const updateValue = ( nextValue ) => {
		setDraftValue( nextValue );
		if ( nextValue === '' ) {
			onChange( '' );
			return;
		}
		if ( validate( nextValue ) ) {
			onChange( nextValue.trim() );
			return;
		}
		onChange( '' );
	};

	return (
		<div
			className={ `pb-validated-url-control${
				isValid ? '' : ' is-invalid'
			}` }
		>
		<TextControl
			{ ...controlProps }
			type="url"
			value={ draftValue }
			onChange={ updateValue }
			help={ isValid ? help : invalidHelp }
		/>
		</div>
	);
}
