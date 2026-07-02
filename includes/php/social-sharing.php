<?php
/**
 * Social sharing helpers.
 *
 * @package FolioBlocks
 */

if (! defined('ABSPATH')) {
    exit;
}

function fbks_get_social_share_services()
{
    return array(
        'facebook'  => array(
            'label' => __('Facebook', 'folioblocks'),
            'icon'  => '<svg viewBox="0 0 320 512" aria-hidden="true" focusable="false"><path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1H297V6.3S260.3 0 225.4 0C152.5 0 104.9 44.2 104.9 124.2v70.9H24v92.7h80.9V512h99.6V288h74.6z"/></svg>',
        ),
        'linkedin'  => array(
            'label' => __('LinkedIn', 'folioblocks'),
            'icon'  => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5.1 7.7H1.3V24h3.8V7.7zM3.2 0C1.9 0 .9 1 .9 2.3s1 2.3 2.3 2.3 2.3-1 2.3-2.3S4.5 0 3.2 0zm20.3 14.6c0-4.4-2.4-7.3-6.1-7.3-2 0-3.4 1.1-4 2.1V7.7H9.7V24h3.8v-8.6c0-2.3 1.2-4 3.1-4 1.8 0 3.1 1.4 3.1 4V24h3.8v-9.4z"/></svg>',
        ),
        'x'         => array(
            'label' => __('X', 'folioblocks'),
            'icon'  => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.9 0h3.7l-8.1 9.2L24 24h-7.5l-5.9-7.7L3.9 24H.2l8.6-9.8L0 0h7.7L13 7l5.9-7zm-1.3 21.4h2L6.6 2.5H4.5l13.1 18.9z"/></svg>',
        ),
        'bluesky'   => array(
            'label' => __('Bluesky', 'folioblocks'),
            'icon'  => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5.7 3.2C8.2 5.1 10.8 9 12 11.1c1.2-2.1 3.8-6 6.3-7.9 1.8-1.4 4.7-2.4 4.7 1 0 .7-.4 5.7-.7 6.5-.9 3.1-4.2 3.9-7.1 3.4 5.1.9 6.4 3.8 3.6 6.7-5.3 5.4-7.6-1.4-8.2-3.1-.1-.3-.2-.5-.2-.4 0 0-.1.2-.2.4-.6 1.7-2.9 8.5-8.2 3.1-2.8-2.9-1.5-5.8 3.6-6.7-2.9.5-6.2-.3-7.1-3.4C.3 9.9-.1 4.9-.1 4.2c0-3.4 2.9-2.4 4.7-1z"/></svg>',
        ),
        'pinterest' => array(
            'label' => __('Pinterest', 'folioblocks'),
            'icon'  => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.2 0C5.5 0 2 4.8 2 9.9c0 2.4.9 4.6 2.9 5.4.3.1.6 0 .7-.4l.3-1.2c.1-.4.1-.5-.2-.9-.6-.7-1-1.6-1-2.8 0-3.6 2.7-6.8 7-6.8 3.8 0 5.9 2.3 5.9 5.5 0 4.1-1.8 7.5-4.5 7.5-1.5 0-2.6-1.2-2.2-2.7.4-1.8 1.3-3.8 1.3-5.1 0-1.2-.6-2.2-1.9-2.2-1.5 0-2.7 1.6-2.7 3.7 0 1.3.5 2.2.5 2.2s-1.6 6.8-1.9 8c-.6 2.4-.1 5.3-.1 5.6 0 .2.3.3.5.1.2-.3 3-3.7 3.9-7.1l1.1-4.2c.5 1 2 1.8 3.6 1.8 4.8 0 8-4.4 8-10.2C23.2 4.4 19.4 0 12.2 0z"/></svg>',
        ),
        'threads'   => array(
            'label' => __('Threads', 'folioblocks'),
            'icon'  => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.6 11.2c-.2-3.6-2.1-5.7-5.3-5.7-2.8 0-4.8 1.5-5.5 4.1l2.4.6c.4-1.6 1.4-2.4 3-2.4 1.7 0 2.7 1 2.9 2.9-.9-.1-1.8-.1-2.8 0-3.3.2-5.3 1.8-5.2 4.2.1 2.2 2 3.8 4.6 3.8 2.2 0 3.8-1 4.9-2.9.8 1.6 2.1 2.5 3.7 2.4 2.6-.1 4.1-2.5 4-6.2-.2-6.6-4.7-11-11.6-11.1C5.6.8.9 5.3.7 12c-.2 6.7 4.2 11.2 11.1 11.4 3.8.1 6.4-1 8.6-3.4l-1.7-1.7c-1.8 2-3.8 2.8-6.8 2.7-5.5-.2-8.7-3.5-8.6-9 .1-5.4 3.7-8.8 9.3-8.7 5.5.1 9 3.5 9.1 8.8.1 2.3-.6 3.6-1.8 3.7-.9.1-1.7-.7-2-2.1.1-.8.1-1.6-.3-2.5zm-5.7 5.2c-1.4 0-2.3-.7-2.4-1.7-.1-1.1 1-1.8 3-1.9.9-.1 1.8 0 2.6.2-.3 2.1-1.4 3.4-3.2 3.4z"/></svg>',
        ),
        'mastodon'  => array(
            'label' => __('Mastodon', 'folioblocks'),
            'icon'  => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23.3 7.4c-.4-2.9-3-5.2-6.1-5.6-.5-.1-2.4-.2-5.2-.2s-4.7.1-5.2.2C3.6 2.2 1.1 4.5.7 7.4.3 10.3.4 13.8.9 16.6c.5 3 2.9 5.4 6 6 .9.2 2.9.4 4.5.3 2.8-.1 4.5-.6 4.5-.6l-.1-2.1s-2 .6-4.4.5c-2.4-.1-4.9-.3-5.3-2.8-.1-.4-.1-.8-.1-1.2 0 0 2.3.6 5.2.8 1.8.1 3.5-.1 5.2-.3 3.3-.4 6.2-2.4 6.6-4.3.7-3 .6-7.3.3-9.5zm-4.1 9.8h-3.2v-7.8c0-1.7-.7-2.5-2-2.5-1.5 0-2.2 1-2.2 3v4.3H8.7V9.9c0-2-.7-3-2.2-3-1.3 0-2 .8-2 2.5v7.8H1.3V9.1c0-1.7.4-3 1.3-4 .9-.9 2-1.4 3.4-1.4 1.6 0 2.9.6 3.7 1.9l.8 1.4.8-1.4c.8-1.3 2.1-1.9 3.7-1.9 1.4 0 2.5.5 3.4 1.4.9.9 1.3 2.3 1.3 4v8.1z"/></svg>',
        ),
        'copy'      => array(
            'label' => __('Copy Link', 'folioblocks'),
            'icon'  => '<svg viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path d="M451.5 160C434.9 160 418.8 164.5 404.7 172.7C388.9 156.7 370.5 143.3 350.2 133.2C378.4 109.2 414.3 96 451.5 96C537.9 96 608 166 608 252.5C608 294 591.5 333.8 562.2 363.1L491.1 434.2C461.8 463.5 422 480 380.5 480C294.1 480 224 410 224 323.5C224 322 224 320.5 224.1 319C224.6 301.3 239.3 287.4 257 287.9C274.7 288.4 288.6 303.1 288.1 320.8C288.1 321.7 288.1 322.6 288.1 323.4C288.1 374.5 329.5 415.9 380.6 415.9C405.1 415.9 428.6 406.2 446 388.8L517.1 317.7C534.4 300.4 544.2 276.8 544.2 252.3C544.2 201.2 502.8 159.8 451.7 159.8zM307.2 237.3C305.3 236.5 303.4 235.4 301.7 234.2C289.1 227.7 274.7 224 259.6 224C235.1 224 211.6 233.7 194.2 251.1L123.1 322.2C105.8 339.5 96 363.1 96 387.6C96 438.7 137.4 480.1 188.5 480.1C205 480.1 221.1 475.7 235.2 467.5C251 483.5 269.4 496.9 289.8 507C261.6 530.9 225.8 544.2 188.5 544.2C102.1 544.2 32 474.2 32 387.7C32 346.2 48.5 306.4 77.8 277.1L148.9 206C178.2 176.7 218 160.2 259.5 160.2C346.1 160.2 416 230.8 416 317.1C416 318.4 416 319.7 416 321C415.6 338.7 400.9 352.6 383.2 352.2C365.5 351.8 351.6 337.1 352 319.4C352 318.6 352 317.9 352 317.1C352 283.4 334 253.8 307.2 237.5z"/></svg>',
        ),
    );
}

function fbks_normalize_social_share_sources($sources)
{
    $services = fbks_get_social_share_services();
    if (! is_array($sources)) {
        $sources = array();
    }

    $normalized = array();
    foreach ($sources as $source) {
        $source = sanitize_key($source);
        if (isset($services[$source]) && ! in_array($source, $normalized, true)) {
            $normalized[] = $source;
        }
        if (count($normalized) >= 5) {
            break;
        }
    }

    return $normalized;
}

function fbks_get_social_share_url($service, $share_url, $title, $image_url)
{
    $encoded_url = rawurlencode($share_url);
    $encoded_title = rawurlencode($title);
    $encoded_text = rawurlencode(trim($title . ' ' . $share_url));

    switch ($service) {
        case 'facebook':
            return 'https://www.facebook.com/sharer/sharer.php?u=' . $encoded_url;
        case 'linkedin':
            return 'https://www.linkedin.com/sharing/share-offsite/?url=' . $encoded_url;
        case 'x':
            return 'https://twitter.com/intent/tweet?url=' . $encoded_url . '&text=' . $encoded_title;
        case 'bluesky':
            return 'https://bsky.app/intent/compose?text=' . $encoded_text;
        case 'pinterest':
            return 'https://www.pinterest.com/pin/create/button/?url=' . $encoded_url . '&media=' . rawurlencode($image_url) . '&description=' . $encoded_title;
        case 'threads':
            return 'https://www.threads.net/intent/post?text=' . $encoded_text;
        case 'mastodon':
            return 'https://mastodon.social/share?text=' . $encoded_text;
        default:
            return $share_url;
    }
}

function fbks_get_image_share_url($attachment_id)
{
    $url = get_permalink();
    if (! $url) {
        $url = home_url('/');
    }

    if ($attachment_id > 0) {
        $url = add_query_arg('fbks_share_image', (int) $attachment_id, $url);
    }

    return $url;
}

function fbks_render_social_share_links($sources, $args = array())
{
    $sources = fbks_normalize_social_share_sources($sources);
    if (empty($sources)) {
        return '';
    }

    $services = fbks_get_social_share_services();
    $attachment_id = isset($args['attachment_id']) ? (int) $args['attachment_id'] : 0;
    $image_url = isset($args['image_url']) ? esc_url_raw($args['image_url']) : '';
    $title = get_the_title() ?: get_bloginfo('name');
    $share_url = fbks_get_image_share_url($attachment_id);
    $variant = isset($args['variant']) && 'lightbox' === $args['variant'] ? 'lightbox' : 'overlay';

    $output = '<div class="pb-social-share pb-social-share--' . esc_attr($variant) . '" aria-label="' . esc_attr__('Share image', 'folioblocks') . '">';
    foreach ($sources as $source) {
        if (! isset($services[$source])) {
            continue;
        }

        $service = $services[$source];
        $is_copy = 'copy' === $source;
        $href = $is_copy ? $share_url : fbks_get_social_share_url($source, $share_url, $title, $image_url);
        $attrs = $is_copy
            ? ' data-pb-copy-share-url="' . esc_url($share_url) . '"'
            : ' target="_blank" rel="noopener noreferrer"';

        $output .= '<a class="pb-social-share__link pb-social-share__link--' . esc_attr($source) . '" href="' . esc_url($href) . '"' . $attrs . ' aria-label="' . esc_attr(sprintf(__('Share on %s', 'folioblocks'), $service['label'])) . '">';
        $output .= '<span class="pb-social-share__icon">' . $service['icon'] . '</span>';
        $output .= '<span class="pb-social-share__label">' . esc_html($service['label']) . '</span>';
        $output .= '</a>';
    }
    $output .= '</div>';

    return $output;
}

function fbks_social_share_meta()
{
    if (empty($_GET['fbks_share_image'])) {
        return;
    }

    $attachment_id = absint(wp_unslash($_GET['fbks_share_image']));
    if (! $attachment_id || 'attachment' !== get_post_type($attachment_id)) {
        return;
    }

    $image = wp_get_attachment_image_src($attachment_id, 'full');
    if (empty($image[0])) {
        return;
    }

    $title = get_the_title() ?: get_bloginfo('name');
    $description = has_excerpt() ? get_the_excerpt() : wp_trim_words(wp_strip_all_tags(get_post_field('post_content', get_the_ID())), 28);
    $share_url = fbks_get_image_share_url($attachment_id);

    echo "\n" . '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
    echo '<meta property="og:url" content="' . esc_url($share_url) . '">' . "\n";
    echo '<meta property="og:image" content="' . esc_url($image[0]) . '">' . "\n";
    echo '<meta property="og:image:width" content="' . esc_attr((string) ($image[1] ?? '')) . '">' . "\n";
    echo '<meta property="og:image:height" content="' . esc_attr((string) ($image[2] ?? '')) . '">' . "\n";
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr($title) . '">' . "\n";
    echo '<meta name="twitter:description" content="' . esc_attr($description) . '">' . "\n";
    echo '<meta name="twitter:image" content="' . esc_url($image[0]) . '">' . "\n";
}
add_action('wp_head', 'fbks_social_share_meta', 1);
