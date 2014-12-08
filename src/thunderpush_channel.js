(function(window, undefined) {
  "use strict";

  var ThunderChannelObj;

  ThunderChannelObj = (function(){
    var id = 0;

    function ThunderChannel(thunder, name, fnSuccess, fnError){
      id++;
      this.id = id;
      this.handler_events = [];
      this.thunder = thunder;
      this.name = name;
      this.onSubscribeSuccess = fnSuccess;
      this.onSubscribeError = fnError;
      this.subscribe();
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
     *   The event name to identify the triggers
     *
     * @param {Function} handler
     *   Function that should be executed
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
     * @returns {boolean}
     */
    ThunderChannel.prototype.subscribe = function(){
      if (typeof this.name !== 'string' || this.name.length <= 0)
        throw {
          name: 'channel.invalid',
          message: 'Channel is not a string'
        };

      if (this.thunder.conn.socket.readyState === SockJS.OPEN) {
        if ( this.thunder.channels.find(this.name) ) {
          typeof this.onSubscribeSuccess === 'function' && this.onSubscribeSuccess(this, 'Channel already subscribed');
          return true;
        }

        this.thunder.conn.socket.send("SUBSCRIBE " + this.name);
        this.thunder.channels.add(this);
        typeof this.onSubscribeSuccess === 'function' && this.onSubscribeSuccess(this, 'Channel subscribed');
        return true;
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
        this.thunder.conn.socket.send("UNSUBSCRIBE " + this.name);

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
