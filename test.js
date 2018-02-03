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

    // tab
    $('.tab-title').click(function(event) {
        let tabContent = $(this).attr('data-tab');
        if($(tabContent).length > 0) {
            $(tabContent).closest('.tab').find('.tab-content').removeClass('active');

            $(tabContent).addClass('active');

            $(this).closest('.tab-list').find('.tab-title').removeClass('active');
            $(this).addClass('active');
        }
    });

});
