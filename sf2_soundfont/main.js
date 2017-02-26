// http://freepats.zenvoid.org/sf2/sfspec24.pdf

function rangesType() {
    return struct({
        byLo: uint8(),
        byHi: uint8(),
    });
}

function genAmountType() {
    return union({
        ranges: rangesType(),
        shAmount: int16().set({ byteOrder: "little-endian" }),
        wAmount: uint16().set({ byteOrder: "little-endian" }),
    });
}

function SFSampleLink() {
    return enumeration("SFSampleLink", uint16().set({ byteOrder: "little-endian" }), {
        monoSample: 0x0001,
        rightSample: 0x0002,
        leftSample: 0x0004,
        linkedSample: 0x0008,
        RomMonoSample: 0x8001,
        RomRightSample: 0x8002,
        RomLeftSample: 0x8004,
        RomLinkedSample: 0x8008,
    });
}

function SFGenerator() {
    return enumeration("SFGenerator", uint16().set({ byteOrder: "little-endian" }), {
        startAddrsOffset: 0,
        endAddrsOffset: 1,
        startloopAddrsOffset: 2,
        endloopAddrsOffset: 3,
        startAddrsCoarseOffset: 4,
        modLfoToPitch: 5,
        vibLfoToPitch: 6,
        modEnvToPitch: 7,
        initialFilterFc: 8,
        initialFilterQ: 9,
        modLfoToFilterFc: 10,
        modEnvToFilterFc: 11,
        endAddrsCoarseOffset: 12,
        modLfoToVolume: 13,
        chorusEffectsSend: 15,
        reverbEffectsSend: 16,
        pan: 17,
        delayModLFO: 21,
        freqModLFO: 22,
        delayVibLFO: 23,
        freqVibLFO: 24,
        delayModEnv: 25,
        attackModEnv: 26,
        holdModEnv: 27,
        decayModEnv: 28,
        sustainModEnv: 29,
        releaseModEnv: 30,
        keynumToModEnvHold: 31,
        keynumToModEnvDecay: 32,
        delayVolEnv: 33,
        attackVolEnv: 34,
        holdVolEnv: 35,
        decayVolEnv: 36,
        sustainVolEnv: 37,
        releaseVolEnv: 38,
        keynumToVolEnvHold: 39,
        keynumToVolEnvDecay: 40,
        keyRange: 43,
        velRange: 44,
        startloopAddrsCoarseOffset: 45,
        keynum: 46,
        velocity: 47,
        initialAttenuation: 48,
        endloopAddrsCoarseOffset: 50,
        coarseTune: 51,
        fineTune: 52,
        sampleModes: 54,
        scaleTuning: 56,
        exclusiveClass: 57,
        overridingRootKey: 58,
    });
}

function SFModulator() {
    return enumeration("SFModulator", uint16().set({ byteOrder: "little-endian" }), {
    });
}

function SFTransform() {
    return enumeration("SFTransform", uint16().set({ byteOrder: "little-endian" }), {
    });
}

function sfVersionTag() {
    return struct({
        wMajor: uint16().set({ byteOrder: "little-endian" }),
        wMinor: uint16().set({ byteOrder: "little-endian" }),
    });
}

function sfPresetHeader() {
    return struct({
        achPresetName: string("ascii").set({ maxByteCount: 20 }),
        wPreset: uint16().set({ byteOrder: "little-endian" }),
        wBank: uint16().set({ byteOrder: "little-endian" }),
        wPresetBagNdx: uint16().set({ byteOrder: "little-endian" }),
        dwLibrary: uint32().set({ byteOrder: "little-endian" }),
        dwGenre: uint32().set({ byteOrder: "little-endian" }),
        dwMorphology: uint32().set({ byteOrder: "little-endian" }),
    });
}

function sfPresetBag() {
    return struct({
        wGenNdx: uint16().set({ byteOrder: "little-endian" }),
        wModNdx: uint16().set({ byteOrder: "little-endian" }),
    });
}

function sfModList() {
    return struct({
        sfModSrcOper: SFModulator(),
        sfModDestOper: SFGenerator(),
        modAmount: int16().set({ byteOrder: "little-endian" }),
        sfModAmtSrcOper: SFModulator(),
        sfModTransOper: SFTransform(),
    });
}

function sfGenList() {
    return struct({
        sfGenOper: SFGenerator(),
        genAmount: genAmountType(),
    });
}

function sfInst() {
    return struct({
        achInstName: string("ascii").set({ maxByteCount: 20 }),
        wInstBagNdx: uint16().set({ byteOrder: "little-endian" }),
    })
}

function sfInstBag() {
    return struct({
        wInstGenNdx: uint16().set({ byteOrder: "little-endian" }),
        wInstModNdx: uint16().set({ byteOrder: "little-endian" }),
    });
}

function sfInstModList() {
    return struct({
        sfModSrcOper: SFModulator(),
        sfModDestOper: SFGenerator(),
        modAmount: int16().set({ byteOrder: "little-endian" }),
        sfModAmtSrcOper: SFModulator(),
        sfModTransOper: SFTransform(),
    });
}

function sfInstGenList() {
    return struct({
        sfGenOper: SFGenerator(),
        genAmount: genAmountType(),
    });
}

function sfSample() {
    return struct({
        achSampleName: string("ascii").set({ maxByteCount: 20 }),
        dwStart: uint32().set({ byteOrder: "little-endian" }),
        dwEnd: uint32().set({ byteOrder: "little-endian" }),
        dwStartloop: uint32().set({ byteOrder: "little-endian" }),
        dwEndloop: uint32().set({ byteOrder: "little-endian" }),
        dwSampleRate: uint32().set({ byteOrder: "little-endian" }),
        byOriginalKey: uint8(),
        chCorrection: int8(),
        wSampleLink: uint16().set({ byteOrder: "little-endian" }),
        sfSampleType: SFSampleLink(),
    });
}

function sub_chunk(chunk_id, props) {
    var result = struct({
        ckID: string("ascii").set({ maxByteCount: 4 }),
        ckData: struct({}),
    });

    // Merge properties
    for (var attrname in props) {
        result.fields["ckData"].fields[attrname] = props[attrname];
    }

    return result;
}

function riff_chunk(chunk_id, props) {
    var result = struct({
        ckID: string("ascii").set({ maxByteCount: 4 }),
        ckSize: uint32().set({ byteOrder: "little-endian" }),
        ckData: struct({}),
    });

    // Merge properties
    for (var attrname in props) {
        result.fields["ckData"].fields[attrname] = props[attrname];
    }

    return result;
}

function init() {
    return riff_chunk("RIFF", {
        formHeader: string("ascii").set({ maxByteCount: 4 }),
        infoList: riff_chunk("LIST", {
            info: sub_chunk("INFO", {
                ifli: riff_chunk("ifli", {
                    version: sfVersionTag(),
                }),
                inam: riff_chunk("INAM", {
                    name: string("ascii").set({
                        updateFunc: function() {
                            this.maxByteCount = this.parent.parent["ckSize"].value;
                        },
                    }),
                }),
            }),
        }),
        sdtaList: riff_chunk("LIST", {
            // TODO
        }),
        pdtaList: riff_chunk("LIST", {
            // TODO
        }),
    });
}
