(function(window, undefined) {
  "use strict";

  var ThunderChannelObj;

  ThunderChannelObj = (function(){
    var id = 0;

    /**
     * IE 5.5+, Firefox, Opera, Chrome, Safari XHR object
     *
     * @see https://gist.githubusercontent.com/Xeoncross/7663273/raw/ae832518493c7418585e6a690c571af3f732731e/testing.ajax.js
     *
     * @param {String} url
     * @param {Object} callback
     * @param {Mixed} data
     * @param {Null} x
     */
    function ajax(url, callback, data, cache) {

      // Must encode data
      if(data && typeof(data) === 'object') {
        var y = '', e = encodeURIComponent;
        for (x in data) {
          y += '&' + e(x) + '=' + e(data[x]);
        }
        data = y.slice(1) + (! cache ? '&_t=' + new Date : '');
      }

      try {
        var x = new(window.XMLHttpRequest || window.ActiveXObject)('MSXML2.XMLHTTP.3.0');
        x.open(data ? 'POST' : 'GET', url, 1);
        //x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        x.onreadystatechange = function () {
          x.readyState > 3 && callback && callback(JSON.parse(x.responseText), x);
        };
        x.send(data)
      } catch (e) {
        window.console && console.log(e);
      }
    };

    function ThunderChannel(thunder, name, fnSuccess, fnError){
      id++;
      this.id = id;
      this.handler_events = [];
      this.thunder = thunder;
      this.name = name;
      this.onSubscribeSuccess = fnSuccess;
      this.onSubscribeError = fnError;
      this.subscribe();
      return this;
    }

    ThunderChannel.prototype.handler_events = undefined;

    /**
     * Add new handler to event in channel
     *
     * @example
     *   var thunder = new Thunder(options);
     *   thunder.subscribe('my-channel', function(channel){
     *     channel.bind('my-first-event', function(data, channel, event){
     *       console.log(arguments);
     *     });
     *   });
     *
     *   thunder.bind('my-channel', 'my-second-event', function(data){
     *     alert("Second event triggered: " + JSON.stringify(data) );
     *   });
     *
     *
     * @param {String} event
     *   The event name to identify the triggers
     *
     * @param {Function} handler
     *   Function that should be executed
     *
     */
    ThunderChannel.prototype.bind = function(event, handler) {
      if (typeof event !== 'string' || !_.isFunction(handler) ) {
        throw {
          name: 'thunder.channel.bind',
          message: 'Invalid arguments type'
        }
      }
      this.thunder.log("New handler has been registered to event '", event, "' and channel '", this.name, "'.");
      this.handler_events.push([event, handler]);
    };

    /**
     * Remove a handler event defined in hendler_events collection.
     *
     * @example
     *   var thunder = new Thunder(options);
     *   thunder.channels.find('my-channel', function(channel){
     *     channel.unbind('my-first-event', fn_reference);
     *   });
     *   thunder.unbind('my-channel', 'my-second-event');
     *
     *
     * @param {String} event
     *   The event name to identify the triggers (Optional)
     *
     * @param {Function} handler
     *   Function that should be executed (Optional)
     *
     * @return {Array} with removed events
     */
    ThunderChannel.prototype.unbind = function(event, handler) {
      var length, i, removes = [];
      this.thunder.log("Removes handler registered to event '", event, "' and channel '", this.name, "'.");
      if ( event === undefined ){
        removes = this.handler_events;
        this.handler_events = [];
        return removes;
      }else{
        length = this.handler_events.length;
        for (i=(length-1); i>=0; i--) {
          if (this.handler_events[i][0] === event && (!handler || this.handler_events[i][1] === handler) ) {
            removes.push(this.handler_events.splice(i,1));
          }
        }
        return removes;
      }
    };

    /**
     * Subscribe channel in connection
     *
     * @param {Object} data
     *    Sending to server when connect
     *
     * @param {Boolean} force
     *    Forcing to connect
     *
     * @returns {boolean}
     */
    ThunderChannel.prototype.subscribe = function(data, force){
      var rgx = /^private-/gi,
        that = this;

      if (data === undefined || typeof data !== 'object') data = {};
      if (force === undefined) force = false;

      if (typeof this.name !== 'string' || this.name.length <= 0)
        throw {
          name: 'channel.invalid',
          message: 'Channel is not a string'
        };

      if (this.thunder.conn.socket.readyState === SockJS.OPEN) {
        if ( this.thunder.channels.find(this.name) && !force ) {
          typeof this.onSubscribeSuccess === 'function' &&
            this.onSubscribeSuccess(this.thunder.channels.find(this.name), 'Channel already subscribed');
          return true;
        }

        if ( !rgx.test(this.name) || data.hasOwnProperty('auth') ) {
          this.thunder.conn.socket.send("SUBSCRIBE " + JSON.stringify(_.extends({user:this.thunder.options.user, channel:this.name}, data)));
          this.thunder.channels.find(this.name) || this.thunder.channels.add(this);
          typeof this.onSubscribeSuccess === 'function' && this.onSubscribeSuccess(this, 'Channel subscribed');
          return true;
        }else{
          var originData = data;
          ajax(this.thunder.options.authEndpoint, function(data){
            that.subscribe(_.extends(originData, data), force);
          }, {'thunderpush[user]': this.thunder.options.user, 'thunderpush[channel]': this.name});
        }
      }

      typeof this.onSubscribeError === 'function' && this.onSubscribeError(this, 'Socket not open');
      throw {
        name: 'socket.status',
        message: 'Socket not OPEN: ' + this.thunder.conn.socket.readyState
      };
    };

    /**
     * Unsubscribe channel in connection
     * @param {Function} success
     * @param {Function} error
     * @returns {boolean}
     */
    ThunderChannel.prototype.unsubscribe = function(success, error){
      if (this.thunder.conn.socket.readyState === SockJS.OPEN) {
        this.thunder.conn.socket.send("UNSUBSCRIBE " + JSON.stringify({data:{}, channel:this.name}) );

        this.thunder.channels.remove(this.name);

        typeof success === 'function' && success(this, 'Channel unsubscribed');
        return true;
      }
      else {
        typeof error === 'function' && error(this, 'Socket not open');
        throw {
          name: 'socket.status',
          message: 'Socket not OPEN: ' + this.thunder.conn.socket.readyState
        };
      }
    };

    /**
     * Shoot the handlers for the given event
     *
     * @example
     *    var channel = ThunderChannel(thunder, 'channel-name');
     *    channel.bind('event-name', function(data){
     *      alert(JSON.stringify(data));
     *    });
     *    channel.trigger('event-name', {data:'content'});
     *
     * @param {String} event
     *    Event name configured in bind method
     *
     * @param {Object} data
     *    Object to be passed to the function
     */
    ThunderChannel.prototype.trigger = function(event, data){
      var key;
      for(key in this.handler_events) {
        this.handler_events[key][0] == event && this.handler_events[key][1](data);
      }
    };

    return ThunderChannel;
  })();


  window.ThunderChannel = ThunderChannelObj;

})(window);
