import { Button, Notice } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import "./pro-feature-notice.scss";

const FALLBACK_CHECKOUT_URL = "https://folioblocks.com/folioblocks-pricing/";

const getCheckoutUrl = (campaign) => {
	const configuredUrl =
		typeof window !== "undefined" ? window.folioBlocksData?.checkoutUrl : "";

	try {
		const url = new URL(configuredUrl || FALLBACK_CHECKOUT_URL);
		url.searchParams.set("utm_source", "folioblocks");
		url.searchParams.set("utm_medium", "block-editor");
		url.searchParams.set("utm_campaign", campaign);
		return url.toString();
	} catch {
		return FALLBACK_CHECKOUT_URL;
	}
};

export default function ProFeatureNotice({
	title,
	description,
	features = [],
	campaign,
	ctaLabel = __("Get FolioBlocks Pro", "folioblocks"),
	compact = false,
	className = "",
}) {
	const classes = [
		"pb-pro-feature-notice",
		compact ? "pb-pro-feature-notice--compact" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<Notice className={classes} status="info" isDismissible={false}>
			<strong>{title}</strong>
			{description && (
				<p className="pb-pro-feature-notice__description">{description}</p>
			)}
			{features.length > 0 && (
				<ul className="pb-pro-feature-notice__features">
					{features.slice(0, 4).map((feature) => (
						<li key={feature}>{feature}</li>
					))}
				</ul>
			)}
			<div className="pb-pro-feature-notice__actions">
				<Button
					href={getCheckoutUrl(campaign)}
					target="_blank"
					rel="noopener noreferrer"
					variant="secondary"
				>
					{ctaLabel}
				</Button>
			</div>
		</Notice>
	);
}
