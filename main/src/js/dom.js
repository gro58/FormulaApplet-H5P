export let domLoad = new Promise(function waitForDomThenResolve(resolve) { // reject weggelassen, weil es beim DOM Load ohnehin nie Fehler geben sollte
    if (document.readyState !== "loading") {
        // Das DOM ist schon geladen, wir können direkt resolve-n - siehe https://stackoverflow.com/q/39993676
        resolve();
    } else {
        document.addEventListener("DOMContentLoaded", resolve); // resolve-n, sobald das Event feuert
    }
});

export function isH5P() {
    return ((typeof window.H5P) !== 'undefined');
}

export function docLang() {
    // https://stackoverflow.com/questions/949341/how-to-obtain-lang-attribute-in-html-using-javascript#949578
    var docLang = document.getElementsByTagName('html')[0].getAttribute('lang');
    docLang = docLang || document.getElementsByTagName('html')[0].getAttribute('xml:lang') || "unknown";
    docLang = docLang.slice(0,2); //e.g. en-US -> en
    console.log("docLang=" + docLang);
    return docLang;
}