export function h5pPrepare() {
    var lang = H5P.jQuery('html')[0].getAttribute('xml:lang');
    return { lang: lang };
}