//  Delphi DFM structure file for Okteta
//  by Tibor Nagy <xnagytibor@gmail.com>

// ffInherited, ffChildPos, ffInline


function pascalString() {
    return struct({
        "Length": uint8(),
        "Data": string("ascii").set({
            maxByteCount: 0,
            updateFunc: function() {
                this.maxByteCount = this.parent["Length"].value;
            },
        })
    }).set({
        toStringFunc: function() {
            // Wish I could use this runtime property:
            //return this["Data"].value;
            return "Value";
        }
    });
}

function utf8String() {
    return struct({
        "Length": uint32().set({ byteOrder: "little-endian", }),
        "Data": string("utf8").set({
            maxByteCount: 0,
            updateFunc: function() {
                this.maxByteCount = this.parent["Length"].value;
            },
        })
    }).set({
        toStringFunc: function() {
            // Wish I could use this runtime property:
            //return this["Data"].value;
            return "Value";
        }
    });
}

function classProperty() {
    var propertyKinds = {
        vaNull: 0,
        vaList: 1,
        vaInt8: 2,
        vaInt16: 3,
        vaInt32: 4,
        vaExtended: 5,
        vaString: 6,
        vaIdent: 7,
        vaFalse: 8,
        vaTrue: 9,
        vaBinary: 10,
        vaSet: 11,
        vaLString: 12,
        vaNil: 13,
        vaCollection: 14,
        vaSingle: 15,
        vaCurrency: 16,
        vaDate: 17,
        vaWString: 18,
        vaInt64: 19,
        vaUTF8String: 20,
        vaDouble: 21,
    }

    return taggedUnion({
        "Name": pascalString(),
        "Kind": enumeration("propertyKind", uint8(), propertyKinds),
    }, [
        alternative(function() { return this["Kind"].value == propertyKinds.vaInt8; }, { "Data": uint8(), }),
        alternative(function() { return this["Kind"].value == 3; }, { "Data": uint16().set({ byteOrder: "little-endian", }), }),
        alternative(function() { return this["Kind"].value == 6; }, { "Data": pascalString(), }),
        alternative(function() { return this["Kind"].value == 7; }, { "Data": pascalString(), }),

        alternative(function() { return this["Kind"].value == 8; }, { }),
        alternative(function() { return this["Kind"].value == 9; }, { }),

        alternative(function() { return this["Kind"].value == 11; }, { "Data": pascalString(), }), // TODO
        alternative(function() { return this["Kind"].value == 20; }, { "Data": utf8String(), }),
    ]).set({
        toStringFunc: function() {
            // TODO: implement
            return "Name = Value";
        }
    });
}

function init() {
    return struct({
       /* "DFM header": array(uint8(), 16),
        "Stream signature": string("ascii").set({
            maxByteCount: 4,
        }),*/
        "Component class": pascalString(),
        "Component name": pascalString(),
        p: array(classProperty(), 100).set({
            updateFunc: function() {
                this.name = Object.keys(this);
            }
        }),
    });
}
