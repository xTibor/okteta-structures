// This structure crashes Okteta upon load with a segmentation fault.

function init() {
    var x = struct({});
    x.fields["X"] = array(x, 0);
    return x;
}
