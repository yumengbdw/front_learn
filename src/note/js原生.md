	$(".navbar a").click(function () {
		console.log($(this).data('value')); // contact, blog, team
		$("body,html").animate({
			scrollTop: $("#" + $(this).data('value')).offset().top
		}, 1000)

	})