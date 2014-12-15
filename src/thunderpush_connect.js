(function(window, undefined) {
  "use strict";

  var ThunderConnectObj;

  ThunderConnectObj = (function(){

    function ThunderConnect(thunder){
      if (!thunder.hasOwnProperty('options') || typeof thunder.options === 'Object') {
        throw {
          name: 'thunder.connect.constructor',
          message: 'Invalid parameter'
        };
      }
      this.thunder = thunder;
      this.options = thunder.options;
      this.handlers = [];
      this.connect();
    }

    /**
     * Number of attempts reconnection
     * @type {Integer}
     * @default 0
     */
    ThunderConnect.prototype.reconnect_tries = 0;
    /**
     * Delay of reconnection attempt
     * @type {Array}
     */
    ThunderConnect.prototype.reconnect_delays = [1000, 2500, 5000, 10000, 30000, 60000];

    /**
     * Stores the callback functions of direct messages
     * @type {Array}
     */
    ThunderConnect.prototype.handlers = undefined;

    /**#!> Functions of callbacks */
    ThunderConnect.prototype.onopen = undefined;
    ThunderConnect.prototype.onmessage = undefined;
    ThunderConnect.prototype.onerror = undefined;
    ThunderConnect.prototype.onclose = undefined;
    /** <!#**/

    /**
     * Configure a new callback do SockJS open event
     * @param {Function} cb
     */
    ThunderConnect.prototype.onSockOpen = function (cb) {
      if (_.isFunction(cb)) this.onopen = cb;
    };

    /**
     * Configure a new callback do SockJS message event
     * @param {Function} cb
     */
    ThunderConnect.prototype.onSockMessage = function (cb) {
      if (_.isFunction(cb)) this.onmessage = cb;
    };

    /**
     * Configure a new callback do SockJS error event
     * @param {Function} cb
     */
    ThunderConnect.prototype.onSockError = function (cb) {
      if (_.isFunction(cb)) this.onerror = cb;
    };

    /**
     * Configure a new callback do SockJS close event
     * @param {Function} cb
     */
    ThunderConnect.prototype.onSockClose = function (cb) {
      if (_.isFunction(cb)) this.onclose = cb;
    };

    /**
     * Create a new connection with SockJS
     */
    ThunderConnect.prototype.connect = function(){
      var that;
      that = this;
      this.socket = new SockJS(this.options.server, undefined, {'debug': this.options.log});

      // Clousore to open callback
      this.socket.onopen = function(e){
        that.thunder.log("Connection has been estabilished.");

        that.onopen && that.onopen.apply(that, arguments);

        // reset retries counter
        that.reconnect_tries = 0;

        // connect and subscribe to channels
        that.socket.send("CONNECT " + JSON.stringify({data: {user: that.options.user,  apikey: that.options.apikey}}));

        // Subscribe in channels
        that.thunder.channels.each(function(channel){
          channel.subscribe(undefined, true);
        });
      }

      // Clousore to message callback
      this.socket.onmessage = function(e){
        var json_data, i, len, channel, event, channelObj;

        that.thunder.log("Message has been received", e.data);

        if (that.onmessage) that.onmessage.apply(that, arguments);

        channel = e.data.channel;
        event   = e.data.event;

        try {
          // try to parse the message as json
          json_data = JSON.parse(e.data.payload);
        }
        catch (e) {
          throw 'Exception in conversion data';
        }

        // Trigger Abstracts handlers
        for (i=0,len=that.handlers.length; i < len; i++) {
          that.handlers[i](json_data);
        }

        // Trigger Events handlers
        if (event){
          channelObj = that.thunder.channels.find(channel);
          channelObj && channelObj.trigger(event, json_data);
        }

        if (_.isFunction(that.onMessage) ){
          that.onMessage.call(that, arguments);
        }
      };

      // Clousore to error callback
      this.socket.onerror = function(e){
        if (that.onerror) that.onerror.apply(that, arguments);
      };

      // Clousore to close callback
      this.socket.onclose = function(e){
        that.thunder.log("Connection has been lost.");

        if (that.onclose) that.onclose.apply(that, arguments);

        if (that.options.retry === false) {
          that.thunder.log("Reconnect supressed because of retry option false");
          return;
        }

        if (e.code === 9000 || e.code === 9001 || e.code === 9002) {
          // received "key not good" close message
          that.thunder.log("Reconnect supressed because of:", e);
          return;
        }

        var delay = that.reconnect_delays[that.reconnect_tries] ||
          that.reconnect_delays[that.reconnect_delays.length - 1];

        that.thunder.log("Reconnecting in", delay, "ms...");
        that.reconnect_tries++;

        setTimeout(function () {
          that.connect();
        }, delay);
      };
    };

    /**
     * Disconnect a SockJS connection
     * @returns {Boolean}
     */
    ThunderConnect.prototype.disconnect = function(){
      var that = this;

      // Override callback event to not reconnect =)
      this.socket.onclose = function (e) {
        if (this.onclose) this.onclose.apply(that, arguments);
      };

      if (this.socket.readyState === SockJS.OPEN) return this.socket.close();
      return false;
    };

    return ThunderConnect;
  })();

  window.ThunderConnect = ThunderConnectObj;

})(window);
