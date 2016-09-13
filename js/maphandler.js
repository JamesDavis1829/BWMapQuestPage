/**
 * Created by crims_000 on 9/13/2016.
 */

var map, dir, layer;

var start = {};

var preloadedLocations = [
    {
        "name": "Project Olympus",
        "coords": "40.446443, -79.947912"
    },
    {
        "name" : "Schenely Park",
        "coords" : "40.438797, -79.946444"
    },
    {
        "name" : "Hazelwood Greenway",
        "coords" : "40.411847, -79.936408"
    },
    {
        "name" : "Nine Mile Run Trail",
        "coords" : "40.415453, -79.917242"
    },
    {
        "name" : "Frick Park",
        "coords" : "40.436405, -79.908798"
    },
    {
        "name" : "Garden of Hope",
        "coords" : "40.451683, -79.970325"
    },
    {
        "name" : "Robert E Williams Memorial Park",
        "coords" : "40.455205, -79.959991"
    }
];

map = L.map("map", {
   layers : MQ.mapLayer(),
    center : [40, -97],
    zoom : 5
});

function loadLocations(){
    var e = document.getElementById("selectedStartPoint");
    for(x in preloadedLocations){
        var op = document.createElement("option");
        op.textContent = preloadedLocations[x].name;
        op.value = preloadedLocations[x].name;
        e.appendChild(op);
    }
}

function assignStartPoint(){
    var e = document.getElementById("selectedStartPoint");
    start.name = preloadedLocations[e.selectedIndex].name;
    start.coords = preloadedLocations[e.selectedIndex].coords;
    start.index = e.selectedIndex;

    populateLocationsList();
}

function populateLocationsList(){
    var e = document.getElementById("locationSelection");
    e.innerHTML = "";
    var h = document.createElement("h2");
    h.className="controlBar";
    h.textContent = "Select Route Stops";
    e.appendChild(h);

    for(x in preloadedLocations){
        if(preloadedLocations[x].name !== start.name) {
            var d = document.createElement("div");
            d.className = "controlBar";

            var i = document.createElement("input");
            i.id = x.toString();
            i.value = preloadedLocations[x].name;
            i.type = "checkbox";

            var l = document.createElement("label");
            l.textContent = preloadedLocations[x].name;

            d.appendChild(i);
            d.appendChild(l);

            e.appendChild(d);
        }
    }

    var outerB = document.createElement("div");
    outerB.className = "controlBar";
    var b = document.createElement("button");
    b.onclick = route;
    b.textContent = "Route";
    outerB.appendChild(document.createElement("br"));
    outerB.appendChild(b);

    e.appendChild(outerB);
}

function route(){
    var routeLocations = [];
    routeLocations.push(preloadedLocations[start.index].coords);
    for(x = 0; x < preloadedLocations.length; x++){
        if(x !== start.index) {
            var e = document.getElementById(x.toString());
            if (e.checked) {
                routeLocations.push(preloadedLocations[x].coords);
            }
        }
    }
    routeLocations.push(preloadedLocations[start.index].coords);

    if(routeLocations.length <= 2){
        window.alert("No route possible for 1 location");
    }else{
        dir = MQ.routing.directions().on("success", function(data){
            var legs = data.route.legs, html = '<br>', maneuvers, i;
            if(legs && legs.length){
                maneuvers = legs[0].maneuvers;
                for(i = 0; i < maneuvers.length; i++){
                    html += (i+1) + ". ";
                    html += maneuvers[i].narrative + "<br>";
                }
                html+="<br>Route Time: " + Math.round(data.route.realTime/60) + " mins<br>";
                html+="Distance: " + data.route.distance + "miles";
                L.DomUtil.get("routeNarrative").innerHTML = html;
            }
        });

        dir.optimizedRoute({
            locations : routeLocations
        });

        if(layer !== undefined){
            map.removeLayer(layer);
        }

        layer = MQ.routing.routeLayer({
            directions : dir,
            fitBounds : true
        });

        map.addLayer(layer);
    }
}