/*
Copyright 2018 Dave Weilert

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial 
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*------------------------------------------------------------------------------

Generic template to parse kubernetes resource type/kind

*/

var vpk = require('../lib/vpk');
var utl = require('../lib/utl');
var hierarchy = require('../lib/hierarchy');

//------------------------------------------------------------------------------
// using yamljs read and parse the file
//------------------------------------------------------------------------------
var parseGeneric = function(ns, kind, name, obj, src, part) { 
    try {
        // build the key and save the data
        var lkey = ns + '.' + kind + '.' + name;
        utl.checkType(kind, lkey);
        var tmp = vpk[kind][lkey];
        if (part === 'undefined') {
            part = 0;
        }
        var item = {
            'namespace': ns,
            'kind': kind,
            'objName': name,
            'data': obj,
            'sourceFile': src,
            'sourcePart': part
        }

        tmp.push(item);
        vpk[kind][lkey] = tmp;
        utl.checkKind(kind);
        utl.countKind(kind);

        // add the information to cluster hierarchy
        hierarchy.addEntry(ns, kind, name, src, part)

    } catch (err) {
        utl.logMsg('vpkGEN001 - Error processing file: ' + src + ' part: ' + part +  ' kind: ' + kind + ' message: ' + err);
    }
};

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {
    parse: function(ns, kind, name, obj, src, part) {
        parseGeneric(ns, kind, name, obj, src, part);
    }
};