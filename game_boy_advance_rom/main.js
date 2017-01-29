// Game Boy Advance cartridge ROM structure file for Okteta
// by Tibor Nagy <xnagytibor@gmail.com>
// Based on the GBATEK specifications document

function adler32_checksum(arr) {
    var a = 1, b = 0, mod = 65521;
    for (var i = 0; i < arr.length; ++i) {
        a = (a + arr[i].value) % mod;
        b = (b + a) % mod;
    }
    return (b * 65536) + a;
}

function header_checksum(arr) {
    var chk = 0;
    for (var i = 0xA0; i < 0xBC; ++i) {
        chk = chk - arr[i].value;
    }
    return (chk - 0x19) & 0xFF;
}

function init() {
    return union({
        "Header": struct({
            "ROM entry point": uint32().set({
                byteOrder: "little-endian",
                validationFunc: function() {
                    var is_arm_branch = ((this.value & 0xFF000000) >>> 0) == 0xEA000000;
                    return is_arm_branch ? true : "Not an ARM branch instruction";
                },
                toStringFunc: function() {
                    var offset = (this.value & 0x00FFFFFF) * 4 /* Unencoded bits */ + 8 /* Prefetch adjustment */;
                    return "0x" + offset.toString(16),
                },
            }),
            "Nintendo logo": array(uint8(), 156).set({
                validationFunc: function() {
                    return (adler32_checksum(this) == 0XE4B84B1C) ? true : "Incorrect checksum";
                },
            }),
            "Game title": string("ascii").set({
                maxByteCount: 12,
            }),
            "Game code": string("ascii").set({
                maxByteCount: 4,
            }),
            "Maker code": string("ascii").set({
                maxByteCount: 2,
            }),
            "Fixed 0x96": uint8().set({
                validationFunc: function() {
                    return this.value == 0x96;
                },
            }),
            "Main unit code": uint8().set({
                validationFunc: function() {
                    return this.value == 0x00;
                },
            }),
            "Device type": uint8().set({
                validationFunc: function() {
                    return this.value == 0x00;
                },
            }),
            "Reserved #1": array(uint8(), 7).set({
                validationFunc: function() {
                    return Array.prototype.every.call(this, function(x) {
                        return x.value == 0;
                    });
                },
            }),
            "Software version": uint8(),
            "Complement check": uint8().set({
                validationFunc: function() {
                    return this.value == header_checksum(this.parent.parent["Raw header"]);
                },
            }),
            "Reserved #2": uint16().set({
                byteOrder: "little-endian",
                validationFunc: function() {
                    return this.value == 0x0000;
                },
            }),
        }),
        "Raw header": array(uint8(), 192), // Needed for the complement check
    });
}
