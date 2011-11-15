var FnordMetric = (function(){
 
  var canvasElem = false;

  var currentNamespace = false;
  var currentView = false;

  var sessionView = (function(){
    
    var listElem = $('<ul class="session_list"></ul>');
    var filterElem = $('<div class="events_sidebar"></div>');
    var feedElem = $('<div class="sessions_feed"></div>').html(
      $('<div class="headbar"></div>').html('Event Feed')
    ).append(
      $('<div class="feed_inner"></div>')
    );
    var sideElem = $('<div class="sessions_sidebar"></div>').html(
      $('<div class="headbar"></div>').html('Active Users')
    ).append(listElem);
    

    var eventsPolledUntil = false;
    var sessionData = {};

    function load(elem){
      eventsPolledUntil = new Date().getTime();
      elem.html('')
        .append(filterElem)
        .append(feedElem)
        .append(sideElem);
      startPoll();
    };

    function resize(_width, _height){
      $('.sessions_feed').width(_width-452);
    };

    function startPoll(){
      (doSessionPoll())();
      //(doEventsPoll())();
      sessionView.session_poll = window.setInterval(doSessionPoll(), 1000);
    };

    function doSessionPoll(){
      return (function(){
        $.ajax({
          url: '/'+currentNamespace+'/sessions',
          success: callbackSessionPoll()
        });
      });
    }

    function callbackSessionPoll(){
      return (function(_data, _status){
        $.each(JSON.parse(_data).sessions, function(i,v){
          updateSession(v);  
        });
        sortSessions();
      });
    };

    function formatTimeSince(time){
      var now = new Date().getTime()/1000;
      var since = now - time;
      if(since < 60){
        return parseInt(since) + 's';
      } else if(since<3600){
        return parseInt(since/60) + 'm';
      } else if(since<(3600*24)){
        return parseInt(since/3600) + 'h';
      } else {
        return ">1d"
      }
    }

    function updateSession(session_data){
      sessionData[session_data.session_key] = session_data;
      renderSession(session_data);
    }

    function sortSessions(){
      console.log("fixme: sort and splice to 100");
    }

    function renderSession(session_data){

      var session_name = session_data["_name"];
      var session_time = formatTimeSince(session_data["_updated_at"]);
      var session_elem = $('li[data-session='+session_data["session_key"]+']:first');

      if(session_elem.length>0){

        if(session_data["_picture"] && (session_data["_picture"].length > 1)){
          $('.picture img', session_elem).attr('src', session_data["_picture"])
        }

        if(session_name){
          $('.name', session_elem).html(session_name);
        }
        
        $('.time', session_elem).html(session_time);

      } else {
        
        var session_picture = $('<img width="18" />');

        if(!session_name){ 
          session_name = session_data["session_key"].substr(0,15)
        };

        if(session_data["_picture"]){ 
          session_picture.attr('src', session_data["_picture"]);
        };
        
        listElem.append(
          $('<li class="session"></li>').append(
            $('<div class="picture"></div>').html(session_picture)
          ).append(
            $('<span class="name"></span>').html(session_name)
          ).append(
            $('<span class="time"></span>').html(session_time)
          ).attr('data-session', session_data["session_key"])
        );

      }
    };

    function close(){
      
    };

    return {
      load: load,
      resize: resize,
      close: close
    };

  })();
  
  function loadView(_view){
    if(currentView){ currentView.close(); }
    canvasElem.html('loading!');
    currentView = _view;
    currentView.load(canvasElem);
    resizeView();
  };

  function resizeView(){
    currentView.resize(
      canvasElem.innerWidth(), 
      canvasElem.innerHeight()
    );
  }

  function init(_namespace, _canvasElem){
    canvasElem = _canvasElem;
    currentNamespace = _namespace;
    loadView(sessionView);
  };

  return {
    p: '/fnordmetric/',  
    loadView: loadView,
    resizeView: resizeView,
    init: init
  };

})();