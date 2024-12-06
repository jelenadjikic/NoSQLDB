$(function () {

    var socket = io();
    var chatter_count;
    var gamesList;

    $.get('/get_games', function (response) {
            $('.games-info').append("Utakmica koja trenutno traje:  <b>"+response[0]+"</b> <br/> <br/>");
            $('.games-info').append("Predstojeće utakmice:  </br>");
            for (let i = 1; i < response.length; i++) {
                $('.games-info').append("===> "+response[i]+"</br>");
            }
            $('.games-info').append("</br>");

            gamesList=response;
    });

    $.get('/get_chatters', function (response) {
        $('.chat-info').text("Trenutan broj ljudi u četu je " + response.length);
        chatter_count = response.length; //update chatter count
    });

    $.get('/get_games', function (response) {
        $('.currentGame').html("<b>" + response[0] + "</b>");
    });

    $.get('/get_score', function (response) {
        $('.gameScore').text(response[0] + " : " + response[1]);
    });


    $('#join-chat').click(function () {
        var username = $.trim($('#username').val());
        $.ajax({
            url: '/join',
            type: 'POST',
            data: {
                username: username
            },
            success: function (response) {
                if (response.status == 'OK') { //username doesn't already exists
                    socket.emit('update_chatter_count', {
                        'action': 'increase'
                    });
                    $('.chat').show();
                    $('#leave-chat').data('username', username);
                    $('#send-message').data('username', username);
                    $.get('/get_messages', function (response) {
                        if (response.length > 0) {
                            var message_count = response.length;
                            var html = '';
                            for (var x = 0; x < message_count; x++) {
                                html += "<div class='msg'><div class='user'>" + response[x]['sender'] + "</div><div class='txt'>" + response[x]['message'] + "</div></div>";
                            }
                            $('.messages').html(html);
                        }
                    });
                    $('.join-chat').hide();
                    $('.games-info').hide(); 
                } else if (response.status == 'FAILED') { //username already exists
                    alert("Izvinite, ali ovaj username već postoji, molimo Vas izaberite drugi.");
                    $('#username').val('').focus();
                }
            }
        });
    });


    $('#leave-chat').click(function () {
        var username = $(this).data('username');
        $.ajax({
            url: '/leave',
            type: 'POST',
            dataType: 'json',
            data: {
                username: username
            },
            success: function (response) {
                if (response.status == 'OK') {
                    socket.emit('message', {
                        'username': username,
                        'message': username + " je napustio čet.."
                    });
                    socket.emit('update_chatter_count', {
                        'action': 'decrease'
                    });
                    $('.chat').hide();
                    $('.join-chat').show();
                    $('#username').val('');
                    alert('Uspešno ste napustili čet');
                }
            }
        });
    });
    $('#send-message').click(function () {
        var username = $(this).data('username');
        var message = $.trim($('#message').val());
        $.ajax({
            url: '/send_message',
            type: 'POST',
            dataType: 'json',
            data: {
                'username': username,
                'message': message
            },
            success: function (response) {
                if (response.status == 'OK') {
                    socket.emit('message', {
                        'username': username,
                        'message': message
                    });
                    $('#message').val('');
                }
            }
        });
    });


    socket.on('send', function (data) {
        var username = data.username;
        var message = data.message;
        var html = "<div class='msg'><div class='user'>" + username + "</div><div class='txt'>" + message + "</div></div>";
        $('.messages').append(html);
    });

    socket.on('count_chatters', function (data) {
        if (data.action == 'increase') {
            chatter_count++;
        } else {
            chatter_count--;
        }
        $('.chat-info').text("Trenutan broj ljudi u četu je " + chatter_count + "..." );
    });

    // socket.on('update_games', function (data) {
    //     $('.games-info').append("Utakmica koja trenutno traje:  <b>"+gamesList[0]+"</b> <br/> <br/>");
    //     $('.games-info').append("Predstojeće utakmice:  </br>");
    //     for (let i = 1; i < response.length; i++) {
    //         $('.games-info').append(gamesList[i]+"</br>");
    //     }
    //     $('.games-info').append("</br>");
    // });

    socket.on('update_score', function () {
        $.get('/get_score', function (response) {
            $('.gameScore').text(response[0] + " : " + response[1]);
        });
    });

     socket.on('update_games', function() {
        $.get('/get_games', function(response){
            //Updateovanje liste utakmica
             $('.games-info').text("");
            $('.games-info').append("Utakmica koja trenutno traje:  <b>"+response[0]+"</b> <br/> <br/>");
            $('.games-info').append("Predstojeće utakmice:  </br>");
            for (let i = 1; i < response.length; i++) {
                $('.games-info').append("===> "+response[i]+"</br>");
            }
            $('.games-info').append("</br>");
            //Updateovanje trenutne utaknice iznad chat-a
            $('.currentGame').html("<b>" + response[0] + "</b>");
            if(gamesList[0]!=response[0]){
                $.post('/reset_score', function(res){});
                $('.messages').text("");
                var html = "<div class='msg'><div class='user'> ---------Počela je nova utakmica: "+response[0]+"--------- </div><div class='txt'> </br>";
                $('.messages').append(html);
            }
            gamesList=response;
        });
     });
});
