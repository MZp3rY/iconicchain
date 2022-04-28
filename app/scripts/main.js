const apiURL = 'https://api.github.com';

$(document).ready(function(){

    if(localStorage.getItem('org') === null || localStorage.getItem('token') === null) {
        $('.section-signin').removeClass('d-none');
        $('main').addClass('d-none');
    }
    else {
        $('.section-signin').addClass('d-none');
        $('main').removeClass('d-none');
    }
    $('.loading').addClass('d-none');

    $('section.section-signin')
        .on('keyup', '#orgName.alert-danger, #orgToken.alert-danger', function(){
            if($(this).val().length) {
                $(this).removeClass('alert-danger');
            }
        })
        .on('blur',  '#orgName, #orgToken', function(){
            if(!$(this).val().length) {
                $(this).addClass('alert-danger');
            }
        })

    $('.form-signin').submit(function(e){
        e.preventDefault();

        let $orgName = $('#orgName'),
            $orgToken = $('#orgToken');

        if(!$orgName.val().length) {
            $orgName.addClass('alert-danger');
        }
        if(!$orgToken.val().length) {
            $orgToken.addClass('alert-danger');
        }
        $('.error-message')
            .html('')
            .removeClass('alert alert-danger');

        if($orgName.val().length && $orgToken.val().length) {
            Authentication($orgName.val(), $orgToken.val(), randomRepositoryName(15));
        }
    });

    $('a.logout').on('click', function() {
        $('#logoutModal').modal('show');
    });

    $('button.logout').on('click', function() {
        localStorage.clear();
        location.reload();
    });

});

/**
 * Checking the organization name and token validation
 * @param {string} org          name of organizattion
 * @param {string} token        OAuth2 token
 * @param {string} repoName     temporary repository name, it will be created, then deleted
  */
function Authentication(org, token, repoName)
{
    $('.loading').removeClass('d-none');

    $.ajaxSetup( {
        headers: {
            accept: 'application/vnd.github.v3+json',
            authorization: 'token ' + token,
        },
    });

    $.ajax({
        url: apiURL + '/orgs/' + org + '/repos',
        method: 'post',
        dataType: "json",
        data: '{"name":"' + repoName + '"}'
    })
    .done(function () {
        console.log(repoName + 'repository created for authentication');

        $.ajax({
            url: apiURL + '/repos/' + org + '/' + repoName,
            method: 'delete',
            data: '{}',
        })
        .done(function () {
            console.log(repoName + 'repository deleted')
            $('.loading').addClass('d-none');
        })
        .fail(function(xhr) {
            $('.loading').addClass('d-none');
            console.log('fail');
            console.log(xhr);
        });

        loginSuccess(org,token);
    })
    .fail(function(xhr) {
        $('.loading').addClass('d-none');
        if(xhr.status === 422) {
            loginSuccess(org,token);
        }
        else{
            $('.error-message')
                .html('Login incorrect')
                .addClass('alert alert-danger');
        }
    })
}

/**
 *
 * @param {string}  org     not required
 * @param {string}  token   not required
 */
function loginSuccess(org = '',token = '')
{
    if(typeof org === 'undefined')        org = '';
    if(typeof token === 'undefined')      token = '';

    if(org.length && token.length) {
        localStorage.clear();
        localStorage.setItem('org',org);
        localStorage.setItem('token',token);
    }

    $('.section-signin, main').toggleClass('d-none');
}

/**
 * Return 'length' characters for a random string
 * @param {number} length
 * @returns {string}
 */
function randomRepositoryName(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}