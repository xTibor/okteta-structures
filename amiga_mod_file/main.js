// Amiga MOD file structure file for Okteta
// by Tibor Nagy <xnagytibor@gmail.com>
// Based on: http://www.eblong.com/zarf/blorb/mod-spec.txt

function sampleHeader() {
    return struct({
        "Sample name": string("ascii").set({
            maxByteCount: 22,
        }),
        "Sample length": uint16().set({
            byteOrder: "big-endian",
        }),
        "Finetune": uint8(),
        "Volume": uint8(),
        "Repeat point": uint16().set({
            byteOrder: "big-endian",
        }),
        "Repeat length": uint16().set({
            byteOrder: "big-endian",
        }),
    });
}

function sampleData() {
    return array(uint16(), 0).set({
        updateFunc: function() {
            // This is a very hacky way to get the index of the current sample data.
            var sampleIndex = parseInt(this.name);
            this.length = this.parent.parent["Sample headers"][sampleIndex]["Sample length"].value;
        },
    });
}

function pattern() {
    return array(uint8(), 1024);
}

function init() {
    return struct({
        "Song name": string("ascii").set({
            maxByteCount: 20,
        }),
        "Sample headers": array(sampleHeader(), 31),
        "Song length": uint8(),
        "Restart position": uint8(),
        "Pattern orders": array(uint8(), 128),
        "Signature": string("ascii").set({
            maxByteCount: 4,
        }),
        "Patterns": array(pattern(), 0).set({
            updateFunc: function() {
                var tmp = Array.prototype.map.call(this.parent["Pattern orders"], function(x) {
                    return x.value;
                });
                this.length = Math.max.apply(null, tmp) + 1;
            },
        }),
        "Sample data": array(sampleData(), 31),
    });
}
