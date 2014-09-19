define([], function() {
    /**
     * @param {sting} str
     * @param {Array} allowed
     */
    return function(str, allowed) {
        var splitRE = new RegExp('((?:(?:' + allowed.join('|') + ')(?:\\s*,\\s*)?)+)$');

        var match;
        if ((match = splitRE.exec(str)) != null) {
            return  {
                selector: str.substring(0, str.length - match[0].length).trim(),
                target: match[1].split(/\s*,\s*/)
            }
        }
        return {
            selector: str,
            target: []
        }
    }
});