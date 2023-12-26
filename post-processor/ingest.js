const { globSync } = require('glob');
const { json } = require('node:stream/consumers');
var fs = require('fs');
const path = require('path');
const { match } = require('assert');
const data_dir = "../beamng/wheels/"

const game_data = JSON.parse(fs.readFileSync(data_dir + "data.json", 'utf8'));

const description_re = /(?<size>[0-9.]+)x(?<width>[0-9.]+) (?:(?<brand>\S+) )?(?<name>.+) Front Wheels(?: \((?<colour>.*)\))?/;

// Getting tire sizes, there's a few different variations. This regex will parse it.
// Can parse the following:
// 205/50R16 Race Front Tires
// Grip-All Screamer J52 35x12.50R17 Front Tires
// 735-14 Bias Ply Redline Front Tires
// 35x12.50R17 All-Terrain Front Tires
// However each variation stores the details in different positions.
const tire_size_re = /([0-9.]+)(?<type>[\/|x|-])([0-9.]+)(?:(-|R)([0-9.]+))?/

let data = {
    "wheels": {},
    "sizes": {},
    "tires": {},
    "brands": {}
}
const images = globSync(data_dir + "**/*.png", {});
images.forEach(image => {
    var bname = path.parse(image).name

    var rel_path = image.substring(data_dir.length);
    var bits = rel_path.split("/")
    var hub = bits[0]

    var wheel = game_data.parts[bname];
    if (!wheel) {
        console.warn(`${bname} (from: ${image}) not in game_data.`);
        return;
    }

    var details = description_re.exec(wheel.description).groups;
    if (!details.brand) {
        details.brand = "None"

        // Wagnan wheels "Wangan-3SP" "Wangan-TZ"
        if (details.name.startsWith("Wangan-")) {
            details.brand = "Wangan";
        }
    }
    if (!details.width) {
        details.width = "None"
    }

    // Save the wheel data.
    data["wheels"][bname] = {
        "id": bname,
        "image": rel_path,
        "name": wheel.description.replace(" Front Wheels", ""),
        "hub": {
            "slot": hub,
            "name": game_data["parts"][hub]["description"]
        },
        "details": details,
        "tires": get_tires(wheel)
    }


    // Add the sizes.
    if (details.size) {
        if (!data["sizes"][details.size]) {
            data["sizes"][details.size] = {}
        }
        if (!data["sizes"][details.size][details.width]) {
            data["sizes"][details.size][details.width] = []
        }
        data["sizes"][details.size][details.width].push(bname)
    }

    // Add the brands.
    if (!data["brands"][details.brand]) {
        data["brands"][details.brand] = []
    }
    data["brands"][details.brand].push(bname)
})

function get_tires(wheel) {
    var tires = [];
    for (const slot in wheel.slotInfoUi) {
        // TODO: Take into account the allowTypes and denyTypes
        game_data.slots[slot].forEach(tire_id => {
            add_tire(tire_id);
            tires.push(tire_id);
        });
    }
    return tires;
}

function add_tire(tire_id) {
    if (!data["tires"][tire_id]) {

        var tire = game_data.parts[tire_id];
        var parsed = tire_size_re.exec(tire.description);
        if (parsed == null) {
            console.log(tire);
            return false;
        }

        var details = {}


        switch (parsed.groups.type) {
            case '/':
                if (parsed[4].toLowerCase() == "r") {
                    // const converted = ((parsed[1] * (parsed[3] / 100.0)) * 2 / 25.4) + parsed[5];
                    details = {
                        "name": parsed[0],
                        "width": parseFloat(parsed[1]),
                        "kind": "metric",
                        "aspect": parseFloat(parsed[3]),
                        "rim": parseFloat(parsed[5]),
                        // "size": Math.round(converted * 4) / 4
                    };
                } else {
                    details = {
                        "name": parsed[0],
                        "size": parseFloat(parsed[1]),
                        "kind": "drag",
                        "width": parseFloat(parsed[3]),
                        "rim": parseFloat(parsed[5])
                    };
                }
                break;
            case '-':
                details = {
                    "name": parsed[0],
                    "kind": "vintage",
                    "size": parseFloat(parsed[1]),
                    "rim": parseFloat(parsed[3])
                };
                break;
            case 'x':
                details = {
                    "name": parsed[0],
                    "size": parseFloat(parsed[1]),
                    "kind": "imperial",
                    "width": parseFloat(parsed[3]),
                    "rim": parseFloat(parsed[5])
                };
                break;

            default:
                console.warn(`Unknown tire size: ${parsed[0]} from ${tire_id}`);
                return false;
        }
        
        data["tires"][tire_id] = details;
    }
    return true;
}
fs.writeFileSync("output.json", JSON.stringify(data, null, 4));