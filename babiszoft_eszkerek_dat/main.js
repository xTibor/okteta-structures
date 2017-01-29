//  Babi-Szoft Ész-kerék DAT file structure file for Okteta
//  by Tibor Nagy <xnagytibor@gmail.com>

function init() {
    return array(
        struct({
            "Question": array(
                struct({
                    "Length": uint8(),
                    "Data": array(uint8(), 0).set({
                        length: 0,
                        updateFunc: function() {
                            this.length = this.parent["Length"].value;
                        },
                    }),
                }).set({
                    name: "PascalString",
                    toStringFunc: function() {
                        return Array.prototype.map.call(this["Data"], function(x) {
                            switch (x.value) {
                                case 101: return "Ü";
                                case 102: return "Ö";
                                case 111: return "É";
                                case 112: return "Á";
                                default: return String.fromCharCode(255 - x.value);
                            }
                        }).reverse().join('');
                    },
                }
            ), 4).set({
                toStringFunc: function() {
                    return Array.prototype.map.call(this, function(x) {
                        return x.toStringFunc().trim();
                    }).join(' ').trim();
                },
            }),
            "Category": enumeration("CategoryEnum", uint8(), {
                "Szólás": 1,
                "Fogalom": 2,
                "Személy": 3,
                "Csoport": 4,
                "Hely": 5,
                "Tárgy": 6,
                "Mű címe": 7,
                "Szereplő": 8,
                "Élőlény": 9,
                "Esemény": 10,
                "Étel": 11,
            }),
        }
    ).set({
        toStringFunc: function() {
            return this["Question"].toStringFunc();
        },
    }), 1001);
}
