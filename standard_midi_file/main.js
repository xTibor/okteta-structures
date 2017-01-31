// Standard MIDI file structure file for Okteta
// by Tibor Nagy <xnagytibor@gmail.com>

// It doesn't work on larger MIDI files because Okteta limits
// the size of the byte arrays to 10000 bytes.
// TODO: Make validation work.

function header() {
    return struct({
        "Signature": string("ascii").set({
            maxByteCount: 4,
            validationFunc: function() {
                return this.value == "MThd";
            },
        }),
        "Header length": uint32().set({ byteOrder: "big-endian" }),
        "Format": uint16().set({ byteOrder: "big-endian" }),
        "Track count": uint16().set({ byteOrder: "big-endian" }),
        "Time division": uint16().set({ byteOrder: "big-endian" }),
    });
}

function track() {
    return struct({
        "Signature": string("ascii").set({
            maxByteCount: 4,
            validationFunc: function() {
                return this.value == "MTrk";
            },
        }),
        "Length": uint32().set({ byteOrder: "big-endian" }),
        "Data": array(uint8(), 0).set({
            updateFunc: function() {
                this.length = this.parent["Length"].value;
            },
        }),
    });
}

function init() {
    return struct({
        "Header": header(),
        "Tracks": array(track(), 0).set({
            updateFunc: function() {
                this.length = this.parent["Header"]["Track count"].value;
            },
        }),
    });
}
