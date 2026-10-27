<?php
/** Standalone entitlement regression; no database, license changes, or metadata writes. */
define('ABSPATH', __DIR__);
function add_action(...$args) {}
function add_filter(...$args) {}
function __($text, $domain = '') { return $text; }
class WP_Error { public function __construct(public $code, public $message) {} }
$license = new class {
    public $premium = true;
    public $plan = 'business';
    function can_use_premium_code__premium_only() { return $this->premium; }
    function is_plan($plan) { return $this->plan === $plan; }
};
function fbks_fs() { global $license; return $license; }
function register_rest_field(...$args) { global $rest_registered; $rest_registered = true; }
require dirname(__DIR__, 2) . '/includes/pro/php/media-metadata.php';
function check_plan($condition, $message) { if (!$condition) { throw new RuntimeException($message); } }
foreach (['free', 'starter', 'personal', 'business', 'agency'] as $plan) {
    foreach ([false, true] as $premium) {
        $license->plan = $plan;
        $license->premium = $premium;
        $expected = $premium && in_array($plan, ['business', 'agency'], true);
        check_plan($expected === fbks_can_use_media_metadata(), 'Incorrect plan entitlement.');
        $rest_registered = false;
        fbks_register_attachment_media_metadata_rest_field();
        check_plan($expected === $rest_registered, 'REST field exposed on an unsupported plan.');
        if (!$expected) {
            check_plan(false === fbks_current_user_can_view_media_metadata(), 'View permission granted.');
            check_plan(false === fbks_current_user_can_edit_media_metadata(), 'Edit permission granted.');
            check_plan(fbks_import_attachment_media_metadata(123) instanceof WP_Error, 'Import not blocked.');
            check_plan(fbks_update_attachment_library_media_metadata(123, []) instanceof WP_Error, 'Update not blocked.');
            check_plan(fbks_reset_attachment_library_media_metadata(123) instanceof WP_Error, 'Reset not blocked.');
            $metadata = ['existing' => 'unchanged'];
            check_plan($metadata === fbks_import_media_metadata_during_generation($metadata, 123), 'Upload metadata changed.');
        }
    }
}
echo "Passed: plan matrix, Media Library access, import/update/reset guards, REST exposure and unchanged uploads on unsupported plans.\n";
