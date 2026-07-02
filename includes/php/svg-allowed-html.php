<?php

/**
 * Shared SVG-safe HTML helpers.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
    exit;
}

function fbks_get_svg_allowed_html()
{
    return array(
        'svg'    => array(
            'class'           => true,
            'xmlns'           => true,
            'width'           => true,
            'height'          => true,
            'viewbox'         => true,
            'viewBox'         => true,
            'aria-hidden'     => true,
            'focusable'       => true,
            'role'            => true,
            'fill'            => true,
            'stroke'          => true,
            'stroke-width'    => true,
            'stroke-linecap'  => true,
            'stroke-linejoin' => true,
        ),
        'path'   => array(
            'd'               => true,
            'fill'            => true,
            'stroke'          => true,
            'stroke-width'    => true,
            'stroke-linecap'  => true,
            'stroke-linejoin' => true,
        ),
        'g'      => array(
            'transform' => true,
        ),
        'circle' => array(
            'cx'   => true,
            'cy'   => true,
            'r'    => true,
            'fill' => true,
        ),
    );
}

function fbks_get_allowed_post_html_with_svg()
{
    static $allowed_html = null;

    if (null === $allowed_html) {
        $allowed_html = wp_kses_allowed_html('post');

        foreach (fbks_get_svg_allowed_html() as $tag => $attributes) {
            $allowed_html[$tag] = isset($allowed_html[$tag])
                ? array_merge($allowed_html[$tag], $attributes)
                : $attributes;
        }

        $allowed_html['a']['data-pb-copy-share-url'] = true;
    }

    return $allowed_html;
}

function fbks_kses_post_with_svg($html)
{
    return wp_kses($html, fbks_get_allowed_post_html_with_svg());
}
