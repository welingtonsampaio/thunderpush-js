(function(window, undefined){
  "use strict";

  // Thunder class
  var ThunderClass;

  ThunderClass = (function(){

    var defaultOptions, formatedServer;

    defaultOptions = {
      /**
       * Define instance as verbose mode
       * @type {Boolean}
       * @default false
       */
      log: false,
      /**
       * Determines whether the instance must reconnect
       * if the connection is closed
       * @type {Boolean}
       * @default true
       */
      retry: true,
      /**
       * Default headers to XHR requests
       * @type {Object}
       */
      headers: {},
      /**
       * Default parameters to XHR requests
       * @type {Object}
       */
      params: {},
      /**
       * Host to connection with server
       * @type {String}
       */
      server: undefined,
      /**
       * ApiKey is a authentication token to connection
       * @type {String}
       */
      apikey: undefined,
      /**
       * Name of user connected
       * @type {String}
       */
      user: undefined
    };

    /**
     * Verify content and add prefix and postfix to
     * the url case not included
     * @param {String} server
     */
    formatedServer = function(server){
      if (server.indexOf('http') === -1) server = "http://" + server;
      if (server.indexOf('/connect') !== server.length - 8) server = server + '/connect';
      return server;
    };

    /**
     * Saves the names of the subscribed channels
     * @type {Array}
     */
    Thunder.prototype.channels = undefined;

    /**
     * Create an object connection
     */
    Thunder.prototype.connect = function(){
      this.conn = new ThunderConnect(this);
    };

    /**
     * Execute a disconnect method of ThunderConnect object
     * @returns {Boolean}
     */
    Thunder.prototype.disconnect = function(){
      return this.conn.disconnect();
    };

    /**
     * Checks that contains the required parameters
     * @returns {boolean}
     */
    Thunder.prototype.verifyOptions = function(){
      var requirements, i, length, val;
      requirements = "server apikey user".split(' ');
      for (i=0, length=requirements.length; i<length; i++){
        val = requirements[i];
        if ( !this.options.hasOwnProperty(val) || this.options[val] === undefined || this.options[val] === null ){
          throw {
            name: "thunder.options",
            message: "Property " + requirements[i] + " is required!"
          };
        }
      }
      return true;
    };

    /**
     * Subscribe this connection in new channel
     *
     * @param {String} channel
     *    The name of channel
     *
     * @param {Function} fnSuccess
     *    Function triggered when success
     *
     * @param {Function} fnError
     *    Function triggered when error
     */
    Thunder.prototype.subscribe = function(channel, fnSuccess, fnError){
      if ( !this.channels.find(channel, function(c){
        _.isFunction(fnSuccess) && fnSuccess(c);
      })) {
        new ThunderChannel(this, channel, fnSuccess, fnError);
      }
    };

    /**
     * Remove channel of connection
     *
     * @param {String} channel
     *    The name of channel
     *
     * @param {Function} fnSuccess
     *    Function triggered when success
     *
     * @param {Function} fnError
     *    Function triggered when error
     */
    Thunder.prototype.unsubscribe = function(channel, fnSuccess, fnError){
      var that;
      that = this;
      this.channels.find(channel, function(c){
        c.unsubscribe(fnSuccess, fnError);
        that.remove(channel);
      });
    };

    /**
     * Adds a event handler of specific channel
     *
     * @example
     *   var thunder = new Thunder(options);
     *   thunder.bind('my-channel', 'my-second-event', function(data){
     *     alert("Second event triggered: " + JSON.stringify(data) );
     *   });
     *
     * @param {String} channel
     *    Channel name, If not subscribed this he will
     *
     * @param {String} event
     *    The name of event
     *
     * @param {Function} handler
     *    Function triggered when receive this event
     */
    Thunder.prototype.bind = function(channel, event, handler){
      this.subscribe(channel, function(c){
        c.bind(event, handler);
      });
    };

    /**
     * Removes a event handler of specific channel
     *
     * @example
     *   var thunder = new Thunder(options);
     *   thunder.unbind('my-channel', 'my-second-event', fn_reference);
     *
     * @param {String} channel
     *    Channel name, If not subscribed this he will
     *
     * @param {String} event
     *    The name of event (Optional)
     *
     * @param {Function} handler
     *    Function triggered when receive this event (Optional)
     */
    Thunder.prototype.unbind = function(parameters){
      var channel;
      channel = parameters.splice(0,1);
      this.channels.find(channel, function(c){
        c.unbind.apply(parameters);
      });
    };

    /**
     * Abstract method, receives all messages which are not Events
     * @param handler
     */
    Thunder.prototype.listen = function (handler) {
      this.log("New handler has been registered.");
      this.conn.handlers.push(handler);
    };

    /**
     * Print in console a message to debugging
     * @param {*} msg...
     */
    Thunder.prototype.log = function (msg) {
      if (this.options.log &&
          "console" in window && "log" in window.console) {

        if (arguments.length === 1) {
          console.log(arguments[0]);
        }
        else {
          if (isMSIE) {
            var log = Function.prototype.bind.call(console.log, console);
            log.apply(console, Array.prototype.slice.call(arguments));
          } else {
            console.log.apply(console, Array.prototype.slice.call(arguments));
          }
        }
      }
    };

    function Thunder(options) {
      if (options === undefined) options = {};
      options = _.extends(options, defaultOptions);
      this.options = options;
      this.verifyOptions();
      this.options.server = formatedServer(this.options.server);
      this.channels = new ThunderChannelCollection();
      this.connect();
    }

    return Thunder;

  })();

  window.Thunder = ThunderClass;
})(window);
