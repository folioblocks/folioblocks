# Easy E-Commerce Action Plan

## Goal

Add an Easy E-Commerce workflow that lets Business and Agency users sell images from curated FolioBlocks galleries through WooCommerce without creating one WooCommerce product per photo.

The feature should make image sales feel native to the gallery. A photographer should be able to select images, assign one or more sale templates, and let FolioBlocks attach the correct image information to the cart and order.

## Product Model

Easy E-Commerce should be Curated Gallery only in the first version.

Curated galleries are the right boundary because:

- The gallery has explicit image blocks.
- The images are usually WordPress Media Library attachments.
- The user can decide per image whether it is sellable.
- FolioBlocks can store sale settings alongside the curated gallery context.
- WooCommerce can handle cart, checkout, taxes, coupons, payment, and orders.

Dynamic galleries should not support FolioBlocks-native Easy E-Commerce in the first version. External providers such as PhotoShelter and SmugMug often have their own commerce workflows, and FolioBlocks should not fight those systems. A future Dynamic Gallery could optionally show a provider-owned buy link when the source exposes one.

## Strategic Positioning

Recommended positioning:

```text
Sell gallery images through WooCommerce without building a product catalog by hand.
```

This is stronger than generic WooCommerce support because it solves a real photographer workflow problem: selling many images without creating and managing a separate product for every photo.

## Plan Access

Easy E-Commerce should be Business and Agency only.

Recommended reasons:

- It is a revenue-generating feature for site owners.
- It depends on WooCommerce integration and order metadata reliability.
- It pairs naturally with proofing galleries and watermark overlays.
- It creates a clear professional workflow tier.

The UI should be hidden or softly locked when WooCommerce is inactive or the site is not on a Business/Agency plan.

## MVP Scope

Phase one should focus on WooCommerce product templates and image-specific cart/order data.

Recommended MVP:

- Support curated gallery images only.
- Require WooCommerce to be active.
- Add gallery-level commerce enablement.
- Add per-image sale controls:
  - Not for sale.
  - Sell as digital download.
  - Sell as print.
  - Sell as both.
- Add reusable sale templates:
  - Digital download template.
  - Print template.
- Let users assign templates at gallery level and override per image.
- Add frontend buy controls for sellable images.
- Add selected image data to WooCommerce cart items.
- Preserve selected image data on order items.
- Show image thumbnail/title/details in cart, checkout, order admin, and customer emails where practical.

Out of scope for MVP:

- Dynamic Gallery commerce.
- External provider checkout integration.
- Print lab fulfillment.
- Tax automation beyond WooCommerce defaults.
- Inventory management per image.
- Multi-vendor marketplaces.
- Complex license agreements.
- AI-generated product descriptions.
- Automatic creation of one WooCommerce product per image.

## Commerce Templates

Use WooCommerce products as sale templates, not as image-specific products.

Recommended template types:

```text
FolioBlocks Digital Download
FolioBlocks Print
```

Practical first version:

- Use regular WooCommerce simple products as templates.
- Store FolioBlocks template metadata on those products.
- Mark digital templates as virtual/downloadable where appropriate.
- Mark print templates as physical products so shipping can apply.
- Let FolioBlocks inject the selected image details into cart and order item metadata.

This avoids creating hundreds or thousands of products while still using WooCommerce’s checkout and order system.

## Digital Downloads

Digital downloads are the most important MVP path because they can be automated inside WordPress.

Recommended settings:

- Download size:
  - Original.
  - Large.
  - Medium.
  - Custom max width.
  - Custom max height.
- File naming pattern.
- Optional watermark exclusion for purchased files.
- Download limit and expiry, using WooCommerce where possible.
- Price.

Recommended delivery model:

- When an order is paid, generate or register the purchased file for that order item.
- Store the purchased attachment ID, requested size, and generated file path or token in order item meta.
- Serve downloads through WooCommerce-controlled download permissions.
- Do not expose original private file paths directly.

The first version can start with WordPress-generated image sizes plus original downloads. Custom resized derivatives can come after the order flow is reliable.

## Prints

Prints should start as an order-intake workflow, not full fulfillment automation.

Recommended settings:

- Print size.
- Paper type.
- Finish.
- Price.
- Optional crop/aspect-ratio note.
- Optional fulfillment instructions stored privately for the admin.

Recommended behavior:

- Add the selected image and print template to the cart.
- Preserve selected image ID, title, thumbnail, source file reference, print size, and paper type on the order item.
- Let WooCommerce handle shipping and taxes through the template product.
- Show enough order metadata for the photographer to fulfill manually.

Future fulfillment integrations can come later if there is customer demand.

## Data Model

Add curated-gallery commerce attributes at the gallery and image level.

Recommended gallery-level shape:

```json
{
  "commerceEnabled": false,
  "commerceMode": "none",
  "commerceTemplates": {
    "digital": [],
    "print": []
  },
  "commerceDisplay": {
    "showOnHover": true,
    "showInLightbox": true,
    "buttonLabel": "Buy"
  }
}
```

Recommended per-image shape:

```json
{
  "commerceEnabled": "inherit",
  "commerceTemplates": {
    "digital": [],
    "print": []
  },
  "commerceTitle": "",
  "commerceDescription": ""
}
```

Per-image `inherit` should mean the image follows the gallery-level commerce settings. This keeps setup fast while allowing exceptions.

## Cart Item Data

Each add-to-cart action should include FolioBlocks image data.

Recommended cart item data:

```php
array(
    'fbks_image_sale' => array(
        'version'       => 1,
        'gallery_id'    => '',
        'post_id'       => 123,
        'block_id'      => '',
        'attachment_id' => 456,
        'image_title'   => '',
        'image_url'     => '',
        'thumb_url'     => '',
        'sale_type'     => 'digital',
        'template_id'   => 789,
        'options'       => array(
            'size'  => 'large',
            'paper' => '',
        ),
    ),
)
```

The cart item should receive a unique key so two different photos using the same product template remain separate line items.

## PHP Architecture

Recommended module:

```text
includes/pro/php/easy-ecommerce.php
```

Recommended helpers:

```php
fbks_is_easy_ecommerce_enabled()
fbks_is_easy_ecommerce_available()
fbks_get_commerce_templates($type = null)
fbks_validate_image_sale_request($request)
fbks_build_image_sale_cart_item_data($request)
fbks_add_image_sale_to_cart($request)
fbks_apply_image_sale_cart_item_data($cart_item_data, $product_id)
fbks_persist_image_sale_order_item_meta($item, $cart_item_key, $values, $order)
fbks_get_image_sale_download_file($order_item)
```

WooCommerce hooks will likely be needed for:

- Add-to-cart validation.
- Custom cart item data.
- Cart item display data.
- Order item meta persistence.
- Download permission/file registration.
- Admin order display.

## REST Endpoint

Recommended endpoint for block frontend buttons:

```text
POST /wp-json/folioblocks/v1/easy-ecommerce/add-to-cart
```

Purpose:

- Validate the selected image sale request.
- Check WooCommerce availability.
- Check Business/Agency plan access.
- Add the configured template product to the WooCommerce cart with image metadata.
- Return cart state or redirect information.

The endpoint should accept only signed or verifiable image sale data. Do not trust arbitrary product IDs, attachment IDs, or prices from the browser.

## Editor Experience

Recommended UI:

- Add a gallery-level Commerce panel when WooCommerce is active and the plan allows it.
- Let users select digital and print templates.
- Let users choose where buy controls appear: hover, lightbox, or both.
- Add per-image commerce controls in `pb-image-block`.
- Show a clear unavailable state if WooCommerce is inactive.
- Link to create or edit sale templates in WooCommerce.

The UI should stay compact. Selling controls should not dominate the core gallery editing experience for users who are not selling images.

## Frontend Experience

Recommended behavior:

- Show a buy icon or button on sellable images.
- If one template is available, add directly or open a small confirmation panel.
- If multiple templates are available, show a choice list for digital/print options.
- Support buying from hover overlays and lightbox.
- Show add-to-cart success with view cart/checkout actions.
- Preserve existing gallery interactions for images that are not for sale.

Accessibility requirements:

- Buy controls must be keyboard reachable.
- Controls must have clear labels.
- Lightbox purchase controls must not trap focus incorrectly.

## Security

Requirements:

- Never trust price, file path, or entitlement data from the browser.
- Validate product templates server-side.
- Validate attachment IDs against the curated gallery/post context.
- Store order item metadata server-side.
- Use WooCommerce download permissions for digital files.
- Avoid direct public URLs for private generated downloads.
- Sanitize all order display metadata.

## Testing Requirements

Minimum test coverage:

- Easy E-Commerce is unavailable when WooCommerce is inactive.
- Easy E-Commerce is unavailable below Business/Agency plans.
- A curated gallery image can be added to cart with a digital template.
- A curated gallery image can be added to cart with a print template.
- Two images using the same product template create distinct cart line items.
- Order item meta preserves the selected image data.
- Digital download data is generated only after a paid order.
- Invalid attachment, product, or template IDs are rejected.
- Existing WooCommerce product behavior is unaffected.
- Existing FolioBlocks WooCommerce controls continue to work.

Manual QA:

- Cart and checkout blocks.
- Classic cart and checkout pages, if supported.
- Order admin screen.
- Customer emails.
- Refund/cancel order behavior.
- Guest checkout.
- Mobile lightbox purchase flow.

## Rollout Plan

Recommended phases:

1. Add plan gating and WooCommerce availability checks.
2. Add sale-template metadata for WooCommerce products.
3. Add curated gallery and per-image commerce attributes.
4. Add frontend add-to-cart flow for print templates.
5. Add order item metadata display.
6. Add digital download delivery.
7. Add polish for lightbox purchase controls and customer emails.

Print order intake can ship before advanced digital derivative generation if needed, but the most compelling first release is probably one print template and one digital download template working end to end.
