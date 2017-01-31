// Impulse Tracker 2 module structure file for Okteta
// by Tibor Nagy <xnagytibor@gmail.com>
// Based on ITTECH.TXT from Impulse Tracker 2.14
//
// TODO:
// * Detect and handle ModPlug/OpenMPT hacks and extensions
// * Parse the CNAM channel names chunk
// * Parse the PNAM pattern names chunk
// * Make setValidation functions work
// * Make uint(8|16)* functions respect the "Value display" settings
// * Make flags show off values
// * Calculate the sample data size in bytes

function uint16ToTrackerVersion(i) {
    if (i == 0) {
        return "Undefined (" + i + ")";
    } else {
        var version_major = ((i >> 8) & 0x0F).toString(16);
        var version_minor = (i & 0xFF).toString(16);
        return "Impulse Tracker " + version_major + "." + version_minor + " (" + i + ")";
    }
}

function uint8ToPatternOrder(i) {
    if (i == 255) {
        return "End of song (255)";
    } else if (i == 254) {
        return "Skip (254)";
    } else {
        return i;
    }
}

function uint8ToChannelPan(i) {
    if (i >= 128) {
        return "Disabled (" + i + ")";
    } else if (i == 100) {
        return "Surround (100)";
    } else if (i == 32) {
        return "Center (32)";
    } else if (i == 0) {
        return "Left (0)";
    } else if (i == 64) {
        return "Right (64)";
    } else {
        return i;
    }
}

function uint8ToNote(i) {
    var prefix = [
        "C-", "C#", "D-", "D#", "E-", "F-",
        "F#", "G-", "G#", "A-", "A#", "B-"
    ];
    return prefix[i % 12] + Math.floor(i / 12) + " (" + i + ")";
}

function envelope() {
    return struct({
        "Flags": flags("EnvelopeFlags", uint8(), {
            "Envelope on": 1,
            "Loop on": 2,
            "Sustain loop": 4,
            "Use pitch as filter envelope": 128,
        }),
        "Number of node points": uint8(),
        "Loop beginning": uint8(),
        "Loop end": uint8(),
        "Sustain loop beginning": uint8(),
        "Sustain loop end": uint8(),
        "Node points": array(struct({
            "Y-value": uint8(),
            "Tick number": uint16().set({
                byteOrder: "little-endian",
            }),
        }), 25),
    }).set({
        name: "Envelope",
    });;
}

function instrument() {
    return struct({
        "Signature": string("ascii").set({
            maxByteCount: 4,
            /*validationFunc: function() {
                return this.value == "IMPI";
            },*/
        }),
        "DOS file name": string("ascii").set({
            maxByteCount: 12,
        }),
        "Always zero": uint8().set({
            validationFunc: function() {
                return this.value == 0;
            },
        }),
        "New note action": enumeration("NewNoteAction", int8(), {
            "Cut": 0,
            "Continue": 1,
            "Note off": 2,
            "Note fade": 3,
        }),
        "Duplicate check type": enumeration("DuplicateCheckType", int8(), {
            "Off": 0,
            "Note": 1,
            "Sample": 2,
            "Instrument": 3,
        }),
        "Duplicate check action": enumeration("DuplicateCheckAction", int8(), {
            "Cut": 0,
            "Note off": 1,
            "Note fade": 2,
        }),
        "Fade out": uint16().set({
            byteOrder: "little-endian",
        }),
        "Pitch-pan separation": uint8(),
        "Pitch-pan center": uint8().set({
            toStringFunc: function() {
                return uint8ToNote(this.value);
            },
        }),
        "Global volume": uint8(),
        "Default pan": uint8(),
        "Random volume variation": uint8(),
        "Random panning variation": uint8(),
        "Tracker version": uint16().set({
            byteOrder: "little-endian",
            toStringFunc: function() {
                return uint16ToTrackerVersion(this.value);
            },
        }),
        "Number of samples": uint8(),
        "Reserved": uint8(),
        "Instrument name": string("ascii").set({
            maxByteCount: 26,
        }),
        "Initial filter cutoff": uint8(),
        "Initial filter resonance": uint8(),
        "MIDI channel": uint8(),
        "MIDI program": uint8(),
        "MIDI bank": uint16().set({
            byteOrder: "little-endian",
        }),
        "Note-sample/keyboard table": array(struct({
            Note: uint8().set({
                toStringFunc: function() {
                    return uint8ToNote(this.value);
                },
            }),
            Sample: uint8(),
        }), 120),
        "Volume envelope": envelope(),
        "Panning envelope": envelope(),
        "Pitch envelope": envelope(),
    }).set({
        name: "Instrument",
    });
}

function sample() {
    return struct({
        "Signature": string("ascii").set({
            maxByteCount: 4,
            /*validationFunc: function() {
                return this.value == "IMPS";
            },*/
        }),
        "DOS file name": string("ascii").set({
            maxByteCount: 12,
        }),
        "Always zero": uint8().set({
            validationFunc: function() {
                return this.value == 0;
            },
        }),
        "Global volume": uint8(),
        "Flags": flags("SampleFlags", uint8(), {
            "Has sample": 1,
            "16-bit": 2, /* 8-bit */
            "Stereo": 4, /* Mono */
            "Compressed samples": 8,
            "Use loop": 16,
            "Use sustain loop": 32,
            "Ping-pong loop": 64, /* Forwards loop */
            "Ping-pong sustain loop": 128, /* Forwards sustain loop */
        }),
        "Default volume": uint8(),
        "Sample name": string("ascii").set({
            maxByteCount: 26,
        }),
        "Convert": uint8(),
        "Default pan": uint8(),
        "Length": uint32().set({
            byteOrder: "little-endian",
        }),
        "Loop begin": uint32().set({
            byteOrder: "little-endian",
        }),
        "Loop end": uint32().set({
            byteOrder: "little-endian",
        }),
        "C-5 speed": uint32().set({
            byteOrder: "little-endian",
        }),
        "Sustain loop begin": uint32().set({
            byteOrder: "little-endian",
        }),
        "Sustain loop end": uint32().set({
            byteOrder: "little-endian",
        }),
        "Sample data offset": pointer(uint32().set({
            byteOrder: "little-endian",
        }), array(uint8(), 1)), // TODO: Calculate the data size
    }).set({
        name: "Sample",
    });
}

function pattern() {
    return struct({
        "Length": uint16().set({
            byteOrder: "little-endian",
        }),
        "Rows": uint16().set({
            byteOrder: "little-endian",
        }),
        "Reserved": uint32().set({
            byteOrder: "little-endian",
        }),
        "Packed data": array(uint8(), 0).set({
            updateFunc: function() {
                this.length = this.parent["Length"].value;
            },
        }),
    }).set({
        name: "Pattern",
    });
}

function init() {
    return struct({
        "Signature": string("ascii").set({
            maxByteCount: 4,
            /*validationFunc: function() {
                return this.value == "IMPM"
            },*/
        }),
        "Song name": string("ascii").set({
            maxByteCount: 26,
        }),
        "Pattern row hilight information": uint16().set({
            byteOrder: "little-endian",
        }),
        "Number of orders": uint16().set({
            byteOrder: "little-endian",
        }),
        "Number of instruments": uint16().set({
            byteOrder: "little-endian",
        }),
        "Number of samples": uint16().set({
            byteOrder: "little-endian",
        }),
        "Number of patterns": uint16().set({
            byteOrder: "little-endian",
        }),
        "Created with tracker": uint16().set({
            byteOrder: "little-endian",
            toStringFunc: function() {
                return uint16ToTrackerVersion(this.value);
            },
        }),
        "Compatible with tracker": uint16().set({
            byteOrder: "little-endian",
            toStringFunc: function() {
                return uint16ToTrackerVersion(this.value);
            },
        }),
        "Flags": flags("ModuleFlags", uint16().set({
            byteOrder: "little-endian",
        }), {
            "Stereo": 1, /* 0 -> Mono */
            "Volume 0 mix optimizations": 2,
            "Use instruments": 4, /* 0 -> Use samples */
            "Linear slides": 8, /* 0 -> Amiga slides */
            "Old effects": 16, /* 0 -> IT Effects */
            "Link Effect G's memory": 32,
            "Use MIDI pitch controller": 64,
            "Request embedded MIDI configuration": 128,
        }),
        "Special": flags("SpecialFlags", uint16().set({
            byteOrder: "little-endian",
        }), {
            "Song message attached": 1,
            "MIDI configuration embedded": 8,
        }),
        "Global volume": uint8(),
        "Mix volume": uint8(),
        "Initial speed": uint8(),
        "Initial tempo": uint8(),
        "Panning separation": uint8(),
        "Pitch wheel depth": uint8(),
        "Message length": uint16().set({
            byteOrder: "little-endian",
        }),
        "Message offset": pointer(uint32().set({
            byteOrder: "little-endian",
        }), string("ascii").set({
            maxByteCount: 0,
            updateFunc: function() {
                this.maxByteCount = this.parent.parent["Message length"].value;
            },
        })),
        "Reserved": uint32().set({
            byteOrder: "little-endian",
        }),
        "Channel pannings": array(uint8().set({
            toStringFunc: function() {
                return uint8ToChannelPan(this.value);
            },
        }), 64),
        "Channel volumes": array(uint8(), 64),
        "Pattern orders": array(uint8().set({
            toStringFunc: function() {
                return uint8ToPatternOrder(this.value);
            },
        }), 0).set({
            updateFunc: function() {
                this.length = this.parent["Number of orders"].value;
            },
        }),
        "Instrument offsets": array(pointer(uint32().set({
            byteOrder: "little-endian",
        }), instrument()), 0).set({
            updateFunc: function() {
                this.length = this.parent["Number of instruments"].value;
            },
        }),
        "Sample offsets": array(pointer(uint32().set({
            byteOrder: "little-endian",
        }), sample()), 0).set({
            updateFunc: function() {
                this.length = this.parent["Number of samples"].value;
            },
        }),
        "Pattern offsets": array(pointer(uint32().set({
            byteOrder: "little-endian",
        }), pattern()), 0).set({
            updateFunc: function() {
                this.length = this.parent["Number of patterns"].value;
            },
        }),
    }).set({
        name: "Impulse Tracker 2 module",
    });
}
