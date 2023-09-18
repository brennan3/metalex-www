/*-----------------------------------------------------------------------------------
	CSS INDEX
	===================
    01. Nav & Slide
    02. Typed Text
    03. Counter Number
    04. Portfolio Carousel
    05. Testimonials Carousel
    06. Preloader
-----------------------------------------------------------------------------------*/

(function ($) {

    "use strict";

    $(document).ready(function () {
                
    });

    /* ==========================================================================
       When document is loaded, do
       ========================================================================== */  
        
    $(window).on('load', function () {
        
        // 06. Preloader
        if ($('.preloader').length) {
            $('.preloader').fadeOut('slow');
        }
        if ($('.a-intro').length) {
            $('.a-intro').addClass('active');
        }
        
    });
        

})(window.jQuery);
