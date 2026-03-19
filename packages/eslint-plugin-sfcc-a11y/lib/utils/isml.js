/** Sentinel injected by the sanitizer in place of dynamic ISML/template expressions. */
const EXPR_SENTINEL = '__ISML_EXPR__';

/** Sentinel injected by the sanitizer in place of content-emitting ISML tags. */
const CONTENT_SENTINEL = '__ISML_CONTENT__';

module.exports = { EXPR_SENTINEL, CONTENT_SENTINEL };
