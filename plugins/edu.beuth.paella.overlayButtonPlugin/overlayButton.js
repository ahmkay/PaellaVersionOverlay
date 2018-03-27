Class("paella.plugins.overlayButtonPlugin", paella.ButtonPlugin, {
    overlaySubclass: 'overlayButtonPlugin',


    getAlignment: function () {
        return 'left';
    },
    getSubclass: function () {
        return 'overlayButton';
    },
    getName: function () {
        return "edu.beuth.paella.overlayButtonPlugin";
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton;
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Overlay");
    },
    getIndex: function () {
        return 110;
    },

    checkEnabled: function (onSuccess) {
        onSuccess(!paella.player.isLiveStream());

    },

    setup: function () {
        var This = this;
        if (paella.player.playing()) {
            this.changeSubclass(This.overlaySubclass);
        }
        paella.events.bind(paella.events.pause, function (event) {
            This.changeSubclass(This.playSubclass);
            This.setToolTip(paella.dictionary.translate("Overlay"));

        });


        var button = document.getElementById("buttonPlugin1");
        var iconLayer = document.createElement("img");
        iconLayer.id = "overlayButtonIconID";
        iconLayer.src = "resources/images/layer_white.png";
        iconLayer.style.width = 100 + "%";
        button.appendChild(iconLayer);



        var vid = document.getElementById("playerContainer_videoContainer_master");
        var timeVid = 0;

        vid.ontimeupdate = function () {
            myFunction()
        };

        function myFunction() {
            timeVid = Math.round(vid.currentTime);


            /*
            switch (timeVid) {
                case doQuery("insert1.time"):                                                       //Bauchbinde
                    startOverlay(doQuery("insert1.duration"));
                    break;
                case doQuery("notification1.time"):                                                 //Notification
                //case dataOverlay.streams["0"].left.notifications["0"].notification1.time:         //Notification
                    startGong();
                    break;
                case doQuery("commercial1.time"):                                                   //Werbung 1 Layer
                //case dataOverlay.streams["0"].left.commercials["0"].commercial1.time:             //Werbung 1 Layer
                    startAdd1(doQuery("commercial1.duration"));
                    break;
                case doQuery("commercial2.time"):                                                   //Werbung 2 Fullscreen
                //case dataOverlay.streams["0"].left.commercials["0"].commercial2.time:             //Werbung 2 Fullscreen
                    startAdd2(doQuery("commercial2.duration"));
                    break;
                case doQuery("link1.time"):                                                         //Link
                    startLink(doQuery("link1.duration"));
                    break;
                case doQuery("logo1.time"):                           //Logo
                //case dataOverlay.streams["0"].left.logos["0"].logo1.time:                           //Logo
                    startLogo(doQuery("logo1.duration"));
                    break;
            }
            */


            //ALTE ABFRAGE VON LOKALER JSON
            switch (timeVid) {
                case dataOverlay.insert1.time:                   //Bauchbinde
                    startOverlay(dataOverlay.insert1.duration);
                    break;
                case dataOverlay.notification1.time:       //Notification
                    startGong();
                    break;
                case dataOverlay.commercial1.time:           //Werbung 1 Layer
                    startAdd1(dataOverlay.commercial1.duration);
                    break;
                case dataOverlay.commercial2.time:           //Werbung 2 Fullscreen
                    startAdd2(dataOverlay.commercial2.duration);
                    break;
                case dataOverlay.link1.time:                        //Link
                    startLink(dataOverlay.link1.duration);
                    break;
                case dataOverlay.logo1.time:                       //Logo
                    startLogo(dataOverlay.logo1.duration);
                    break;
            }

        }

    },
    action: function (button) {
        disableOveray();
    }
});

paella.plugins.overlayButtonPlugin = new paella.plugins.overlayButtonPlugin();


// - - - - START OVERLAY CODE - - - - -

var dataOverlay = 0;
var overlayBool = true;
var addFullscreenBool = true;

//JSON LOKAL ABFRAGE
//$.getJSON('../../repository/video-overlay-1/multiview.json', function (data) {
$.getJSON('http://141.64.64.217/paella_player/build/repository/video-overlay-1/multiview.json', function (data) {
//$.getJSON('../../repository/video-overlay-1/multiview_neu.json', function (data) {
    dataOverlay = data;
});

//DATENBANK ABFRAGE
/*
var MongoClient = require('mongodb').MongoClient;
var url = "141.64.64.217";
//var url = "mongodb://localhost:27017/";

// connect to the db
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("overlaydb");

    //query function
    function doQuery(object) {
        dbo.collection("overlaydb").distinct(object, function(err, result) {
            console.log(result);
        });
    }

    doQuery("id-left");
    doQuery("insert1.src");
    doQuery("logo1.duration");

    //db.close();
});

window.onbeforeunload = function() {
    db.close();
};
*/








function startOverlay(duration) {
    if (overlayBool) {
        var container = document.getElementById("overlayContainer");
        if (document.getElementById("overlayBauchbindeID")) {
            console.log("Bauchbinde schon vorhanden");
        }
        else {
            console.log("START OVERLAY");
            var img = document.createElement("img");
            img.id = "overlayBauchbindeID";

            //img.src = doQuery("insert1.src");
            img.src = dataOverlay.insert1.src;

            container.appendChild(img);
        }

        if (document.getElementById("overlayUntertitelID")) {
            console.log("Text schon vorhanden");
        }
        else {
            console.log("START TEXT");
            var name = document.createElement("h2");
            name.id = "overlayUntertitelID";
            //ACHTUNG, HIER FEHLT NOCH DER TITLE
            name.innerHTML = dataOverlay.insert1.title;

            var title = document.createElement("h1");
            title.id = "overlayTitelID";
            //title.innerHTML = doQuery("insert1.text");
            title.innerHTML = dataOverlay.insert1.text;

            container.appendChild(title);
            container.appendChild(name);
        }

        if (document.getElementById("overlayIconID")) {
            console.log("Icon schon vorhanden");
        }
        else {
            console.log("START ICON");
            var icon = document.createElement("img");
            //icon.src = doQuery("insert1.icon");
            icon.src = dataOverlay.insert1.icon;
            icon.id = "overlayIconID";

            container.appendChild(icon);
        }

        setTimeout(function () {
            disableBauchbinde();
        }, (duration) * 1000);
    }
}

function disableBauchbinde() {
    var container = document.getElementById("overlayContainer");

    var childBauchbinde = document.getElementById("overlayBauchbindeID");
    var childTitle = document.getElementById("overlayTitelID");
    var childUntertitel = document.getElementById("overlayUntertitelID");
    var childIcon = document.getElementById("overlayIconID");

    container.removeChild(childBauchbinde);
    container.removeChild(childTitle);
    container.removeChild(childUntertitel);
    container.removeChild(childIcon);
}

function startGong() {
    if (overlayBool) {

        if (document.getElementById('gong')) {
            if (document.getElementById('gong').paused) {
                console.log("START GONG");
                document.getElementById('gong').play();
                document.getElementById("dotGong").style.opacity = 100;
                setTimeout(function () {
                    document.getElementById("dotGong").style.opacity = 0;
                }, 1500);
            }
            else {
                console.log("Gong spielt schon");
            }
        }
        else {
            if (document.getElementById("dotGong")) {
                console.log("Gong spielt schon");
            }
            else {
                var gong = document.createElement("audio");
                gong.src = dataOverlay.notification1.src_audio;
                gong.type = "audio/mpeg";
                gong.id = "gong";
                gong.play();

                var dot = document.createElement("img");
                dot.src = dataOverlay.notification1.src_visuell;
                dot.id = "dotGong";
                dot.style.opacity = 100;

                var container = document.getElementById("overlayContainer");
                container.appendChild(dot);

                setTimeout(function () {
                    dot.style.opacity = 0;
                }, 2500);
            }
        }
    }
}

function startAdd1(duration) {
    if (document.getElementById("add1IdBox")) {
        console.log("Add schon vorhanden");
    }
    else {
        console.log("START ADD Overlay");
        var add1 = document.createElement("img");
        //add1.src = doQuery("commercial1.src");
        add1.src = dataOverlay.commercial1.src;
        add1.id = "add1IdBox";

        var container = document.getElementById("overlayContainer");
        container.appendChild(add1);

        setTimeout(function () {
            container.removeChild(add1);
        }, (duration * 1000));
    }

}

function startAdd2(duration) {
    console.log(addFullscreenBool);
    if(addFullscreenBool){
        if (document.getElementById("add2IdBox")) {
            console.log("Add schon vorhanden");
        }
        else {
            console.log("START ADD Fullscreen");
            var add2 = document.createElement("img");
            add2.id = "add2IdBox";
            //add2.src = doQuery("commercial2.src");
            add2.src = dataOverlay.commercial2.src;

            var container = document.getElementById("overlayContainer");
            container.appendChild(add2);

            paella.player.pause();
            document.getElementById("playerContainer_controls").style.display = "none";

            setTimeout(function () {
                container.removeChild(add2);
                addFullscreenBool = false;
                paella.player.play();
                document.getElementById("playerContainer_controls").style.display = "block";
            }, (duration * 1000));
            setTimeout(function () {
                addFullscreenBool = true;
            }, (duration * 1000 + 1000));
        }
    }

}

function startLink(duration) {
    console.log("Link Start");
    if (overlayBool) {
        if (document.getElementById("linkContainer")){
            console.log("Link schon vorhanden");
        }
        else {
            console.log("Link wird erstellt");

            //Hauptcontainer
            var linkContainerMaster = document.getElementById("linkContainerMaster");
            linkContainerMaster.style.opacity = 100;

            //Linkcontainer
            var linkContainer = document.createElement("div");
            linkContainer.id = "linkContainer";


            //Bild-Link
            var linkContainerAnker1 = document.createElement("a");
            linkContainerAnker1.setAttribute('target', '_blank');
            //linkContainerAnker1.setAttribute('href', doQuery("link1.url"));
            linkContainerAnker1.setAttribute('href', dataOverlay.link1.url);
            linkContainerAnker1.id = "linkContainerAnker";
            linkContainer.appendChild(linkContainerAnker1);

            //Bild
            var linkContainerImage = document.createElement("img");
            linkContainerImage.id = "linkContainerImage";
            //linkContainerImage.src = doQuery("link1.image");
            linkContainerImage.src = dataOverlay.link1.image;
            linkContainerAnker1.appendChild(linkContainerImage);

            //Horizontale Linie
            var linkContainerHR = document.createElement("hr");
            linkContainer.appendChild(linkContainerHR);

            //Link-Text
            var linkContainerText = document.createElement("p");
            linkContainerText.id = "linkContainerText";
            linkContainer.appendChild(linkContainerText);

            //Text
            var linkContainerAnker2 = document.createElement("a");
            linkContainerAnker2.id = "linkContainerAnker2";
            linkContainerAnker2.setAttribute('target', '_blank');
            //linkContainerAnker2.setAttribute('href', doQuery("link1.url"));
            linkContainerAnker2.setAttribute('href', dataOverlay.link1.url);
            //linkContainerAnker2.innerHTML = doQuery("link1.text");
            linkContainerAnker2.innerHTML = dataOverlay.link1.text;
            linkContainerText.appendChild(linkContainerAnker2);


            linkContainerMaster.appendChild(linkContainer);
            console.log("Link wird angehängt");

            setTimeout(function () {
                linkContainerMaster.removeChild(linkContainer);
                linkContainerMaster.style.opacity = 0;
            }, (duration * 1000));
        }

    }
}


function startLogo(duration) {
    var logo = document.getElementById("beuth-logo.png");
    logo.style.display = "block";
    logo.style.zIndex = 15;
    //logo.src = doQuery("logo1.src");
    logo.src = dataOverlay.logo1.src;

    setTimeout(function () {
        logo.src = "config/profiles/resources/beuth-logo.png";
    }, (duration * 1000));
}


function disableOveray() {
    if (document.getElementById("overlayBauchbindeID")) {
        var elem1 = document.getElementById("overlayBauchbindeID");
        elem1.parentNode.removeChild(elem1);
    }

    if (document.getElementById("overlayUntertitelID")) {
        var elem2 = document.getElementById("overlayUntertitelID");
        elem2.parentNode.removeChild(elem2);
    }

    if (document.getElementById("overlayTitelID")) {
        var elem3 = document.getElementById("overlayTitelID");
        elem3.parentNode.removeChild(elem3);
    }

    if (document.getElementById("overlayIconID")) {
        var elem4 = document.getElementById("overlayIconID");
        elem4.parentNode.removeChild(elem4);
    }


    //BUTTON DESIGN
    if (overlayBool) {    overlayBool = false;    }
    else {        overlayBool = true;    }

    if (overlayBool) {
        var icon = document.getElementById("overlayButtonIconID");
        icon.src = "resources/images/layer_white.png";
    }
    else {
        var icon = document.getElementById("overlayButtonIconID");
        icon.src = "resources/images/layer_red.png";
    }
    console.log("Status Overlay Bool: " + overlayBool);
}





