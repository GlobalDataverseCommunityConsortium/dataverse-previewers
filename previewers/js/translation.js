function setEnglish() {
	var i18n = $.i18n();
	i18n.locale = "en";
	updateText(i18n);
}
function setSpanish() {
	var i18n = $.i18n();
	i18n.locale = "es";
	updateText(i18n);
}
function updateText(i18n) {
	'use strict';

	i18n.load( 'i18n/' + i18n.locale + '.json', i18n.locale ).done(
		function () {
			var filenameText = $.i18n( "filenameText" ); $( '.filenameText' ).text( filenameText );
			var inText = $.i18n( "inText" ); $( '.inText' ).text( inText );
			var byText = $.i18n( "byText" ); $( '.byText' ).text( byText );
			var downloadFileText = $.i18n( "downloadFileText" ); $( '.downloadFileText' ).text( downloadFileText );
			var closePreviewText = $.i18n( "closePreviewText" ); $( '.closePreviewText' ).text( closePreviewText );
			var audioPreviewText = $.i18n( "audioPreviewText" ); $( '.audioPreviewText' ).text( audioPreviewText );
			var csvPreviewText = $.i18n( "csvPreviewText" ); $( '.csvPreviewText' ).text( csvPreviewText );
			var htmlPreviewText = $.i18n( "htmlPreviewText" ); $( '.htmlPreviewText' ).text( htmlPreviewText );
			var annotationsText = $.i18n( "annotationsText" ); $( '.annotationsText' ).text( annotationsText );
			var imagePreviewText = $.i18n( "imagePreviewText" ); $( '.imagePreviewText' ).text( imagePreviewText );
			var pdfPreviewText = $.i18n( "pdfPreviewText" ); $( '.pdfPreviewText' ).text( pdfPreviewText );
			var spreadsheetViewerText = $.i18n( "spreadsheetViewerText" ); $( '.spreadsheetViewerText' ).text( spreadsheetViewerText );
			var textPreviewText = $.i18n( "textPreviewText" ); $( '.textPreviewText' ).text( textPreviewText );
			var videoPreviewText = $.i18n( "videoPreviewText" ); $( '.videoPreviewText' ).text( videoPreviewText );
			var prev = $.i18n( "prev" ); $( '#prev' ).text( prev );
			var next = $.i18n( "next" ); $( '#next' ).text( next );
			var pageText = $.i18n( "pageText" ); $( '.pageText' ).text( pageText );
			var versionText = $.i18n( "versionText" ); $( '.versionText' ).text( versionText );
			var descriptionText = $.i18n( "descriptionText" ); $( '.descriptionText' ).text( descriptionText );
			var footer = $.i18n( "footer" ); $( '#footer' ).html( footer );
		} );
}
// Enable debug
$.i18n.debug = true;

$( document ).ready( function ( $ ) {
	var i18n = $.i18n();
	i18n.locale = "en";
	updateText(i18n);
	'use strict';
	$( '.english' ).on( 'click', setEnglish );
	$( '.spanish' ).on( 'click', setSpanish );
} );
