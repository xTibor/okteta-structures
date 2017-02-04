// Nintendo Virtual Boy cartridge ROM footer structure file for Okteta
// by Tibor Nagy <xnagytibor@gmail.com>
// Based on: http://www.planetvb.com/modules/dokuwiki/doku.php?id=info_at_the_end_of_the_rom
//   http://www.planetvb.com/content/downloads/documents/stsvb.html

// Note: The cartridge information is at the end of the ROM files.
//   The structure needs to placed manually there, because Okteta provides
//   no automatic ways to do it.

// TODO: All string encodings in this definition should have been Shift JIS,
//   but it's not implemented for structures in Okteta. The lack of this
//   encoding makes all Japanese game titles displayed incorrectly.

function interrupt() {
    return array(uint16().set({
        byteOrder: "little-endian",
    }), 8);
}

function init() {
    return struct({
        "Game title": string("ascii").set({
            maxByteCount: 21,
        }),
        "Reserved": array(uint8(), 4),
        "Publisher ID": string("ascii").set({
            maxByteCount: 2,
        }),
        "Game ID": string("ascii").set({
            maxByteCount: 4,
        }),
        "ROM version": uint8(),
        "Controller interrupt": interrupt(),
        "Timer interrupt": interrupt(),
        "Expansion port interrupt": interrupt(),
        "Link port interrupt": interrupt(),
        "Video processor interrupt": interrupt(),
        "Not used": array(interrupt(), 19),
        "Floating-point exception": interrupt(),
        "Zero division exception": interrupt(),
        "Invalid opcode exception": interrupt(),
        "Lower 16 trap vectors": interrupt(),
        "Upper 16 trap vectors": interrupt(),
        "Address trap": interrupt(),
        "Duplexed exception": interrupt(),
        "Reset vector": interrupt(),
    });
}
