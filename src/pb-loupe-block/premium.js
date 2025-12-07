import { addFilter } from '@wordpress/hooks';
import {
    ToggleControl,
    SelectControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';


addFilter(
    'folioBlocks.loupeBlock.loupeShapeControl',
    'folioblocks/pb-loupe-block-loupe-shape-control',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleGroupControl
                label={__('Loupe Shape')}
                value={attributes.loupeShape}
                onChange={(value) => setAttributes({ loupeShape: value })}
                isBlock
                help={__('Change the shape of the Loupe.')}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
            >
                <ToggleGroupControlOption value="circle" label={__('Circle')} />
                <ToggleGroupControlOption value="square" label={__('Square')} />
            </ToggleGroupControl>
        );
    }
);
addFilter(
    'folioBlocks.loupeBlock.loupeThemeControl',
    'folioblocks/pb-loupe-block-loupe-theme-control',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <SelectControl
                label={__('Loupe Theme', 'pb-loupe-block')}
                value={attributes.loupeTheme}
                options={[
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                ]}
                onChange={(value) => setAttributes({ loupeTheme: value })}
                help={__('Change the color of the Loupe frame.')}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
            />
        );
    }
);
addFilter(
    'folioBlocks.loupeBlock.disableRightClickToggle',
    'folioblocks/loupe-block-premium-disable-right-click',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Disable Right-Click on Page', 'folioblocks')}
                help={__('Prevents visitors from right-clicking.', 'folioblocks')}
                __nextHasNoMarginBottom
                checked={!!attributes.disableRightClick}
                onChange={(value) => setAttributes({ disableRightClick: value })}
            />
        );
    }
);
