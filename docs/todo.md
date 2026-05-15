# FolioBlocks Security & Code Quality Review


## Code Quality Issues



### 🟡 Medium Priority

#### 2. Inconsistent Escaping Pattern in Render Files
**File:** `src/masonry-gallery-block/render.php:126`  
**Description:** Mixing escaped attributes with wp_kses_post in a way that could be simplified.

```php
echo '<div ' . wp_kses_post( $fbks_wrapper_attributes ) . wp_kses_post( $fbks_data_attr ) . '>';
```

**Recommendation:** `$fbks_data_attr` is built as raw HTML string but should be properly escaped at construction rather than filtered at output.


#### 4. Code Duplication in Filter Typography
**Files:** Multiple render.php files  
**Description:** Filter typography CSS generation is duplicated across multiple block render files with identical logic.

**Recommendation:** Extract to shared helper function:
```php
function fbks_get_filter_typography_styles( $attributes ) { ... }
```

#### 5. $_SERVER Access Without Fallback
**File:** `includes/admin/system-info.php:147-149`  
**Description:** Direct access to `$_SERVER['SERVER_SOFTWARE']` without checking if it exists first.

```php
if ( isset( $_SERVER['SERVER_SOFTWARE'] ) ) {
    $server_software = sanitize_text_field( wp_unslash( $_SERVER['SERVER_SOFTWARE'] ) );
}
```

**Status:** Actually properly handled with isset check. Mark as **resolved**.

---

### 🟢 Low Priority / Nice to Have

#### 6. Missing PHPDoc Comments
**Files:** Most PHP files  
**Description:** Functions lack PHPDoc documentation blocks.

**Example needed for:**
- `fbks_generate_block_asset_handle()` - folioblocks.php:86
- `fbks_register_script_handle_translations()` - folioblocks.php:149
- `fbks_extract_news_item_image()` - includes/admin/settings-page.php:67

**Recommendation:**
```php
/**
 * Generates a unique asset handle for a block script.
 *
 * @param string $block_name Block name in format 'namespace/block-name'
 * @param string $field_name Asset field name (editorScript, script, viewScript)
 * @param int    $index      Asset index for multiple scripts
 * @return string Generated handle or empty string
 */
function fbks_generate_block_asset_handle($block_name, $field_name, $index = 0)
```

#### 7. Inline Comments for Complex Logic
**Files:** Various render.php files  
**Description:** Complex typography and filter logic lacks explanatory comments.

**Example:** `src/grid-gallery-block/render.php:60-108` has 48 lines of typography CSS generation with no inline comments explaining the purpose of each section.

#### 8. Inconsistent Boolean Checking
**Description:** Mix of `!empty()`, `isset()`, and direct boolean checks across the codebase.

**Examples:**
- `src/grid-gallery-block/render.php:24` - Uses `??` operator
- `src/grid-gallery-block/render.php:39` - Uses `!empty()`
- `src/masonry-gallery-block/render.php:21` - Uses `??` operator

**Recommendation:** Standardize on one approach for cleaner code:
- Use `??` for array access with defaults
- Use `!empty()` for existence + truthy checks
- Use `isset()` only when you need to distinguish null from false

---

## Potential Improvements

### 1. WooCommerce Integration Safety Check
**File:** `folioblocks.php:468-476`  
**Current code:**
```php
if (fbks_fs()->can_use_premium_code__premium_only()) {
    add_action('template_redirect', function () {
        if (isset($_GET['add-to-cart'])) {
            wp_safe_redirect(remove_query_arg('add-to-cart'));
            exit;
        }
    });
}
```

**Recommendation:** Add validation that the parameter value is numeric (product ID):
```php
if (isset($_GET['add-to-cart']) && is_numeric($_GET['add-to-cart'])) {
```

### 2. RSS Feed Caching Logic
**File:** `includes/admin/settings-page.php:415-494`  
**Description:** Complex caching logic with transient refresh checking could be simplified.

**Current logic:**
1. Check for cached data
2. Validate cached images
3. Set refresh flag if invalid
4. Re-fetch if needed
5. Fall back to stale cache

**Recommendation:** Consider abstracting this to a dedicated caching class for reusability.

### 3. Filter Category Input Sanitization
**Files:** Multiple render.php files  
**Description:** Filter categories from `$attributes['filterCategories']` are escaped at output but not validated for reasonable content at input.

**Current:**
```php
$fbks_filter_categories = $fbks_attributes['filterCategories'] ?? [];
// Later...
foreach ( $fbks_filter_categories as $category ) {
    echo '<button class="filter-button" data-filter="' . esc_attr( $category ) . '">' . esc_html( $category ) . '</button>';
}
```

**Recommendation:** Validate that categories are strings and not excessively long:
```php
$fbks_filter_categories = array_filter(
    $fbks_attributes['filterCategories'] ?? [],
    function($cat) {
        return is_string($cat) && strlen($cat) <= 100;
    }
);
```

