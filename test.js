jQuery(document).ready(function($) {

    // modal
    $('.js-open-modal').click(function(event) {
        let modal = $(this).attr('data-modal');

        $(modal).addClass('active');
    });

    $('.js-modal-close, .modal-close').click(function(event) {
        $(this).closest('.modal').removeClass('active');
    });

    $(document).keyup(function(e) {
        if (e.keyCode === 27) {
            $('.modal').removeClass('active');
        }
    });

});
