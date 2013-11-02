/**
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

/**
 * @author Maxim Bogdanov <sin666m4a1fox@gmail.com>
 */

$(document).ready(function () {

    $.fn.checkEmptyField = function () {
        console.log(this.val())
        if ($.trim(this.val()).length == 0) {
            this.addClass('empty');
        }
    };


    $('.lang span').click(function () {
        var lang = $(this).text().toLowerCase();
        $('.lang span').removeClass('active');
        $(this).addClass('active');
        $('div[class^="lang-"]').hide();
        $('.lang-' + lang).show();
    });

    $('.js-login-link').click(function (evnt) {
        evnt.preventDefault();
        $('.js-login-div').slideToggle('slow');
    });
//
//
//    $('form.login').submit(function () {
//        $('input[type="text"], input[type="password"]', this).checkEmptyField();
//    });
//
//    $('form.registration').submit(function () {
//        $('input[type="text"], input[type="password"]', this).checkEmptyField();
//    });


});