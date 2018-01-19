class Feedback {
  constructor() {

  }

  init() {
    let me = this;
    $('#feedback-link').removeClass("hide");
    $('#feedback-link').on('click', me.showFeedback);
    $('#report-feedback-button').on('click', me.emailFeedback);
  }


  showFeedback() {
    let me = this;

    $('#feedback-note').val("");

    if (feedbackAttachScreenCapture) {
      $('#feedback-screen-capture-area').removeClass("hide");
      $('#feedback-screen-capture').empty();
      $('#feedback-screen-capture').append(  "<div id='feedback-container' class='"       + "'></div>"  );

      $('#feedback-screen-capture #feedback-container').append(  $('#gene-track').html() );
      $('#feedback-screen-capture #feedback-container').append(  $('#track-section').html() );
      $('#feedback-screen-capture #feedback-container').append(  $('#proband-variant-card').html() );
      $('#feedback-screen-capture #feedback-container').append(  $('#other-variant-cards').html() );

      if (!$('#slider-left').hasClass('hide')) {
        $('#feedback-screen-capture').append(  "<div style='width:5px'></div>"  );
        $('#feedback-screen-capture').append(  "<div id='slider-left-content' class='"     + $('#slider-left-content').attr("class") + "'>"       + $('#slider-left-content').html()     + "</div");
      }
      $('#feedback-screen-capture').append(  $('#svg-glyphs-placeholder').html() );

      // Take out identifiers
      $('#feedback-screen-capture #variant-card-label').text("");


    } else {
      $('#feedback-screen-capture-area').addClass("hide");
    }
  }

  emailFeedback() {
    let me = this;

    // Change newlines to html breaks
    $.valHooks.textarea = {
        get: function(elem) {
            return elem.value.replace(/\r?\n/g, "<br>");
        }
    };

    var name = $('#feedback-name').val();
    var email = $('#feedback-email').val();
    var note  = $('#feedback-note').val();

    if (email == null || email.trim().length == 0) {
      $('#feedback-warning').text("Please specify an email");
      $('#feedback-warning').removeClass("hide");
      return;
    } else if (note == null || note.trim().length == 0) {
      $('#feedback-warning').text("Please fill in the description");
      $('#feedback-warning').removeClass("hide");
      return;
    } else {
      $('#feedback-warning').addClass("hide");
    }

    var htmlAttachment = null;

    if (feedbackAttachScreenCapture) {
      htmlAttachment    = '<html>';

      htmlAttachment    += '<head>';
      htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/bootstrap-material-design.css" type="text/css">';
      htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/bootstrap.css" type="text/css">';
      htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/gene.d3.css" type="text/css">';
      htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/google-fonts.css" type="text/css">';
      htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/material-icons.css" type="text/css">';
      htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/selectize.css" type="text/css">';
      htmlAttachment    += '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">';
      htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/site.css" type="text/css">';
      htmlAttachment    += '</head>';

      htmlAttachment    += "<body style='margin-bottom:0px'>";


      $('#feedback-screen-capture .pagination.bootpag .prev a').text("<<");
      $('#feedback-screen-capture .pagination.bootpag .next a').text(">>");
      $('#feedback-screen-capture #container').attr("width", "initial");

      htmlAttachment    += '<div id="feedback-screen-capture">';
      htmlAttachment    += $('#feedback-screen-capture').html();
      htmlAttachment    += '</div>'
      htmlAttachment    += '</body>'

      htmlAttachment    += '</html>';
    }

    utility.sendFeedbackEmail(name, email, note, htmlAttachment);
    utility.sendFeedbackReceivedEmail(email);

    if (feedbackAttachScreenCapture) {
      $('#feedback-screen-capture').empty();
    }

    $('#feedback-modal').modal('hide');
  }

}