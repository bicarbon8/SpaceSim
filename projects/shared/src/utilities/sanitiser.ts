export module Sanitiser {
    /**
     * sanitises the input text ensuring only alphanumeric
     * values are present and length is 10 characters or less
     * @param text input text to be sanitised
     * @returns a string that has special characters removed
     * and is shortened to maximum of 10 characters
     */
    export function sanitise(text: string): string {
        if (text?.length) {
            // TODO: filter out bad words
            return text?.replace(/[^a-zA-Z0-9ÀÁÂÃÄÅĀƁƂÇĈĊĎĐÈÉÊËƑĜĞĠĤĦÌÍÎÏĴĶĹĿŁÑŃÒÓÔÕÖƤɊŔŖŚŜŢŤŦÙÚÛÜŴŶŽ]/g, '')
                .substring(0, 10) ?? '';
        }
        return text;
    }
}