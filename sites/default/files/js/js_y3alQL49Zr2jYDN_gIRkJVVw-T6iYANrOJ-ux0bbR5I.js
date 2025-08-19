(function($){
	Drupal.behaviors.ipacenetplus = {
		attach: function(context, settings) {
			$('#block-views-photo-article-block .views-field-field-photo img').addClass('img-rounded');
			$('#zone2 .view-news .views-field-field-photo img').addClass('img-rounded');
			$('#block-views-news-latest-block .view-news-latest .views-row .views-field-field-photo img').addClass('img-rounded');
			$('#zone2 .view-news .views-field-view-node .field-content a').addClass('label');
			$('#zone2 .view-funding .views-field-view-node .field-content a').addClass('label');
			$('#left-sidebar #block-user-login .item-list ul li a').addClass('btn btn-small btn-theme');
			$('#left-sidebar #block-system-user-menu ul.menu li.leaf a').addClass('btn btn-small btn-theme');
			$('#left-sidebar #block-views-funding-news-block .view-funding-news div.more-link a').addClass('btn btn-small').css('margin-top', '-1px');
			$('#right-sidebar #block-views-events-upcoming-block .view-events-upcoming div.more-link a').addClass('btn btn-small').css('margin-top', '-1px');
			$('#right-sidebar #block-views-group-documents-latest-block .view-group-documents-latest div.more-link a').addClass('btn btn-small').css('margin-top', '-1px');
			$('#zone2 #block-views-news-latest-block .view-news-latest div.more-link a').addClass('btn btn-small').css('margin-top', '-1px');
			$('#zone2 #block-simplenews-2 form.simplenews-subscribe #edit-submit').addClass('btn-small');
			$('#zone2 .view-group-content .views-field-view-node .field-content a').addClass('label');
			$('#zone2 .region-content .node-group .field-name-group-group .field-items .field-item a').addClass('btn').addClass('btn-small');
			$('#zone2 .region-content .view-newsletters .views-field-body a').addClass('label');
		}
	};
})(jQuery);
;
