function pkgHeader() {
    return struct({
        "signature": array(uint8(), 64),
        "public_key": array(uint8(), 32),
        "blake3": array(uint8(), 32),
        "count": uint64(),
    });
}

function pkgEntry() {
    return struct({
        "blake3": array(uint8(), 32),
        "offset": pointer(
            uint64(),
            struct({
                // WORKAROUND: Okteta cannot handle pointer offsets.
                // Inserting a dummy array in front of the real data to simulate it.
                // This workaround only works when the offset size doesn't exceed 65535 bytes
                // because Okteta restricts array sizes to 64k. Unfortunately there's no workaround
                // for this array size restriction brain damage.
                "pointer_offset_workaround_for_okteta": array(uint8(), function(root) {
                    var header_size = 136;
                    var entry_size = 308;
                    return header_size + root["header"]["count"].value * entry_size;
                }),
                "data": array(uint8(), function() { return this.parent.parent.parent["size"].value; }),
            })
        ),
        "size": uint64(),
        "mode": uint32().set({
            toStringFunc: function() {
                return "0o" + this.value.toString(8);
            }
        }),
        // WORKAROUND: Cannot be a string() due to its lack of a toString function.
        // Needed by the parent structs for pretty printing the entries.
        "path": array(char(), 256).set({
            toStringFunc: function() {
                return Array.prototype.map.call(this, function(x) { return x.value; }).join('').trim();
            }
        }),
    }).set({
        toStringFunc: function() {
            return this["path"].toStringFunc();
        }
    });
}

function init() {
    return struct({
        "header": pkgHeader(),
        "entries": array(pkgEntry(), 0).set({
            updateFunc: function() {
                this.length = this.parent["header"]["count"].value;
            },
        }),
    });
}
