/**
 * WooCommerce Search Component
 * Helper file for searching Woo products
 **/
import { __ } from '@wordpress/i18n';
import { BaseControl, TextControl, Spinner } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';

export default function ProductSearchControl({ value, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        // Reset local UI state if the parent clears product attributes
        if (!value || !value.id) {
            setSearchTerm('');
            setSearchResults([]);
        }
    }, [value]);

    const debouncedSearch = useDebounce((term) => {
        if (!term || term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        apiFetch({ path: `/wc/v3/products?search=${encodeURIComponent(term)}&per_page=10` })
            .then((products) => {
                const results = products.map((p) => ({
                    id: p.id,
                    name: p.name,
                    price_html: p.price_html,
                    permalink: p.permalink,
                    image: p.images?.[0]?.src || '',
                    description: p.short_description || p.description || '',
                }));
                console.log('WooCommerce product data:', products);
                setSearchResults(results);
            })
            .catch(() => setSearchResults([]))
            .finally(() => setIsSearching(false));
    }, 400);

    useEffect(() => {
        debouncedSearch(searchTerm);
    }, [searchTerm]);

    return (
        <BaseControl label={__('Linked WooCommerce Product', 'folioblocks')} __nextHasNoMarginBottom>
            {(!value || !value.id) && (
                <>
                    <TextControl
                        value={searchTerm}
                        placeholder={__('Search products...', 'folioblocks')}
                        onChange={(val) => setSearchTerm(val)}
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                    />
                    {isSearching && <Spinner />}
                    {searchResults.length > 0 && (
                        <div className="pb-product-search-results">
                            {searchResults.map((product) => (
                                <div
                                    key={product.id}
                                    className="pb-product-search-item"
                                    onClick={() => {
                                        onSelect(product);
                                        setSearchTerm('');
                                        setSearchResults([]);
                                    }}
                                >
                                    <div className="pb-product-search-thumb">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} />
                                        ) : (
                                            <div className="no-thumb">📦</div>
                                        )}
                                    </div>
                                    <div className="pb-product-search-details">
                                        <strong>{product.name}</strong>
                                        {product.price_html && (
                                            <div
                                                className="pb-product-search-price"
                                                dangerouslySetInnerHTML={{ __html: product.price_html }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            {value && value.id && (
                <div className="pb-linked-product-preview">

                    {value.image ? (
                        <div className="pb-linked-product-thumb-wrapper">
                            <img
                                src={value.image}
                                alt={value.name}
                                className="pb-linked-product-thumb"
                            />
                            <button
                                type="button"
                                className="pb-remove-product-overlay"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSelect(null);
                                    setSearchTerm('');
                                    setSearchResults([]);
                                }}
                                aria-label={__('Remove Product', 'folioblocks')}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    ) : (
                        <div className="pb-linked-product-thumb-wrapper no-thumb">
                            <div className="no-thumb">📦 Product Image Missing</div>
                            <button
                                type="button"
                                className="pb-remove-product-overlay"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSelect(null);
                                    setSearchTerm('');
                                    setSearchResults([]);
                                }}
                                aria-label={__('Remove Product', 'folioblocks')}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    )}
                    <a
                        href={value.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pb-linked-product-link"
                    >
                        <div className="pb-linked-product-info">
                            <strong>{value.name}</strong>
                            {value.price_html && (
                                <div
                                    className="pb-linked-product-price"
                                    dangerouslySetInnerHTML={{ __html: value.price_html }}
                                />
                            )}
                        </div>
                    </a>
                </div>
            )}
        </BaseControl>
    );
}
