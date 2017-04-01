//TODO: remove JSONs and get data from server

function initialize() {
    var jsRender = $;
    var user_tmpl = jsRender.templates(document.getElementById("user_tmpl"));
    var user2_tmpl = jsRender.templates(document.getElementById("user2_tmpl"));
    var user = [{name: "Jim", score: 0}, {name: "Dude", score: 1}, {name: "Another Dude", score: 1}
        , {name: "user4", score: 1}, {name: "user5", score: 1}, {name: "user6", score: 1}];
    var user2 = [{name: "host", score: 1}];
    if(user.length + user2.length <= 4) {
        var html = user_tmpl.render(user);
        var html2 = user2_tmpl.render(user2);
        document.getElementById("player_row").innerHTML = html + html2;
    } else{
        var html = user_tmpl.render(user.slice(0,4));
        document.getElementById("player_row").innerHTML = html;
        var html2 = user2_tmpl.render(user2);
        html = user_tmpl.render(user.slice(4));
        document.getElementById("player_row2").innerHTML = html + html2;
    }

}