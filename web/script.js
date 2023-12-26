const url = "./wheels.json"
var wheels = {}
var data = fetch(url).then(res => res.json()).then(downloaded_wheels => {
    wheels = downloaded_wheels;

    for (const wheel in wheels["wheels"]) {
        wheels["wheels"][wheel].image = `wheels/${wheels["wheels"][wheel].image}`
    }

    setup_menus();

    var hash = this.window.location.hash.substring(1);
    if (hash) {
        navagate(hash);
    } else {
        navagate("size-20");
    }

    // setup_wheels(null);
}).catch(err => { throw err });


const wheels_container = document.getElementById("wheels");
const wheels_template = document.getElementById("wheel-card-template");
const wheel_template = document.getElementById("wheel-display-template");

function setup_wheels(wheel_list) {
    if (wheel_list) {
        // Add the new children.
        wheel_list.forEach(wheel => {
            add_wheel(wheel, "#wheel-" + wheel.id);
        });
    }

    // Scroll to the top.
    window.scrollTo({ top: 0 });
}

function add_wheel(wheel, link) {
    var clone = wheels_template.content.firstElementChild.cloneNode(true);
    var node = wheels_container.appendChild(clone)
    node.href = link;
    write_data(node, wheel)
}

function display_wheel(wheel) {
    var clone = wheel_template.content.firstElementChild.cloneNode(true);
    var node = wheels_container.appendChild(clone)
    const list = document.getElementById("wheel-tires-list");
    wheel.tires.forEach(tire_id => {
        const tire = wheels["tires"][tire_id];
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(tire.name));
        list.appendChild(li);
    });
    write_data(node, wheel)
}

function write_data(node, data) {
    if (node.dataset) {
        if (node.dataset.text) {
            const key = node.dataset.text;
            const field = key.split('.').reduce((o, i) => o[i], data);
            if (!field) {
                console.warn(`Key '${key}' doesn't exist in the provided dataset.`);
            } else {
                node.innerText = field
            }
        } else if (node.dataset.src) {
            const key = node.dataset.src;
            const field = key.split('.').reduce((o, i) => o[i], data);
            if (!field) {
                console.warn(`Key '${key}' doesn't exist in the provided dataset.`);
            } else {
                node.src = field
            }
        } else if (node.dataset.exists) {
            const key = node.dataset.exists;
            const field = key.split('.').reduce((o, i) => o[i], data);

            if (!field) {
                node.setAttribute("hidden", "")
            }
        }
    }
    var children = node.children;
    for (let i = 0; i < children.length; i++) {
        write_data(children[i], data);
    }
}

const brand_ul = document.getElementById("brand_ul");
const size_ul = document.getElementById("size_ul")

function setup_menus() {
    for (const brand in wheels["brands"]) {
        var li = add_li(brand_ul, brand, wheels["brands"][brand].length, `#brand-${brand}`);
        li.classList.add("toplevel");
    }

    for (const size in wheels["sizes"]) {

        var li = add_li(size_ul, size, "0", `#size-${size}`);
        li.classList.add("toplevel");

        var ul = document.createElement("ul");
        size_ul.appendChild(ul);

        var counter = 0;
        for (const width in wheels["sizes"][size]) {
            var count = wheels["sizes"][size][width].length;
            add_li(ul, `${width}"`, count, `#size-${size}x${width}`);
            counter += count;
        }

        li.querySelector("span").innerText = counter;
    }
}


function add_li(to, text, count, href) {
    var li_node = document.createElement("li");

    var a_node = document.createElement("a");
    a_node.href = href
    var text_node = document.createTextNode(text);

    a_node.appendChild(text_node);
    li_node.appendChild(a_node);
    to.appendChild(li_node);

    if (count != null) {
        var span_node = document.createElement("span");
        span_node.appendChild(document.createTextNode(count));
        a_node.appendChild(span_node);
    }

    return li_node;
}

window.addEventListener('hashchange', function () {
    var hash = this.window.location.hash.substring(1);
    navagate(hash);
});

function navagate(to) {


    // Delete all the existing children.
    while (wheels_container.lastElementChild) {
        wheels_container.removeChild(wheels_container.lastElementChild);
    }

    var wheel_objects = []
    if (to.startsWith("brand-")) {
        wheels["brands"][to.substring("brand-".length)].forEach(id => {
            wheel_objects.push(wheels["wheels"][id])
        });
        setup_wheels(wheel_objects);
    }

    else if (to.startsWith("size-")) {
        var parts = to.substring("size-".length).split('x');
        var size = parts[0];
        var width = parts[1];

        if (width) {
            wheels["sizes"][size][width].forEach(id => {
                wheel_objects.push(wheels["wheels"][id])
            });
        } else {
            for (const width in wheels["sizes"][size]) {
                wheels["sizes"][size][width].forEach(id => {
                    wheel_objects.push(wheels["wheels"][id])
                });
            }
        }
        setup_wheels(wheel_objects);
    }

    else if (to.startsWith("search-")) {
        const query = to.substring("search-".length).toLowerCase();
        for (const wheel_id in wheels["wheels"]) {
            var wheel = wheels["wheels"][wheel_id];
            if (wheel.name.toLowerCase().indexOf(query) > 0) {
                wheel_objects.push(wheel)
            }
        }
        setup_wheels(wheel_objects);
    }
    
    else if (to.startsWith("wheel-")) {
        const query = to.substring("wheel-".length);
        display_wheel(wheels["wheels"][query]);
    }
}
