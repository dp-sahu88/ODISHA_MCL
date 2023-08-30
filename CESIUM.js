lizMap.events.on({
uicreated: function(e) {
var mediaLink = OpenLayers.Util.urlAppend(
lizUrls.media,
OpenLayers.Util.getParameterString(lizUrls.params)
);
var frameSrc = mediaLink +'&path=/media/RSP/test.html';
lizMap.addDock(
'threejs',
'Vue 3D',
'right-dock',
'<iframe width="100%" height="800" src="http://49.205.217.250/preprod/Cesium184/Apps/Sandcastle/gallery/BR_77_Ces.html" frameborder="0" allowfullscreen></iframe>',
'icon-globe'
);
}
});