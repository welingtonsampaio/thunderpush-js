/**
 * Thunderpush javascript client - based in (https://github.com/thunderpush/thunderpush-js)
 * @version v2.0.1 - 2014-12-15
 * @link https://github.com/welingtonsampaio/thunderpush-js
 * @author Welington Sampaio
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
var isMSIE = /*@cc_on!@*/0;
(function(window, undefined){
  "use strict";

  /** Underscore Functions **/
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  var
    push = ArrayProto.push,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

  var
    nativeForEach = ArrayProto.forEach,
    nativeMap = ArrayProto.map,
    nativeReduce = ArrayProto.reduce,
    nativeReduceRight = ArrayProto.reduceRight,
    nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = FuncProto.bind;

  var _ = function (obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  if (typeof (/./) !== 'function') {
    _.isFunction = function (obj) {
      return typeof obj === 'function';
    };
  }
  _.identity = function (value) {
    return value;
  };
  _.lookupIterator = function (value) {
    return _.isFunction(value) ? value : function (obj) {
      return obj[value];
    };
  };
  _.sortedIndex = function (array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : _.lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };
  _.indexOf = function (array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted === 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };
  _.extends = function (_new, old){
    var i;
    for(i in old){
      if ( !_new.hasOwnProperty(i) || _new[i] === undefined || _new[i] === null ){
        _new[i] = old[i];
      }
    }
    return _new;
  };
  window._ = _;
  /** UnderscoreJS Functions **/
})(window);

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

(function(window, undefined) {
  "use strict";

  var ThunderChannelCollectionObj;

  ThunderChannelCollectionObj = (function(){

    var id=1;

    function ThunderChannelCollection(){
      this.id = id + 1;
      id++;
      this.channels = new Object;
    };
    /**
     * Collection of channels opened
     * @type {Object}
     */

    /**
     * Add new channel to channels collection
     * @param {ThunderChannel} channel
     * @returns {boolean}
     */
    ThunderChannelCollection.prototype.add = function(channel){
      if ( !channel['name'] ) {
        throw {
          name: 'thunder.channel.collection.already_exists',
          message: "Channel.name not found."
        };
      }
      if ( !this.find(channel.name) ){
        this.channels[channel.name] = channel;
        return true;
      }else{
        throw {
          name: 'thunder.channel.collection.already_exists',
          message: "["+this.id+"] Channel '" + channel.name + "' already exists."
        };
      }
    };

    /**
     * Removes a channel of collection
     * @param {String} name
     * @returns {boolean}
     */
    ThunderChannelCollection.prototype.remove = function(name){
      if (this.find(name)){
        delete this.channels[name];
        return true;
      }
      return false;
    };

    /**
     * Looking for a channel in the collection
     * @param {String} name
     * @param {Function} fn
     *    If found
     * @returns {ThunderChannel | FALSE}
     */
    ThunderChannelCollection.prototype.find = function(name, fn){
      if ( this.channels.hasOwnProperty(name) ) {
        _.isFunction(fn) && fn(this.channels[name]);
        return this.channels[name];
      }
      return false;
    };

    /**
     * Iterate in all elements of collection
     *
     * @example
     *    // Execute subscribe method in all channels of this collection
     *    var collection = new ThunderChannelCollection();
     *    collection.each(function(channel){
     *      channel.subscribe();
     *    });
     *
     * @param {Function} fn
     *    Callback of iteration
     */
    ThunderChannelCollection.prototype.each = function(fn){
      var entry, keys;
      if (typeof fn !== 'function') {
        throw {
          name: 'thunder.channel.collection.each',
          message: 'Invalid argument, expect Function'
        }
      }
      keys = Object.keys(this.channels);
      for (var i= 0,length=keys.length; i<length; i++) {
        entry = keys[i];
        fn(this.channels[entry]);
      }
    };


    return ThunderChannelCollection;
  })();

  window.ThunderChannelCollection = ThunderChannelCollectionObj;

})(window);

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
       * Defines uri to connect
       * @type {String}
       */
      authEndpoint: '/thunderpush/auth',
      /**
       * Default headers to XHR requests
       *
       * TODO: not implemented
       *
       * @type {Object}
       */
      headers: {},
      /**
       * Default parameters to XHR requests
       *
       * TODO: not implemented
       *
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
     *
     * @returns {ThunderChannel}
     */
    Thunder.prototype.subscribe = function(channel, fnSuccess, fnError){
      if (typeof channel !== 'string' ) {
        throw {
          name: 'thunder.subscribe',
          message: 'Channel isn\'t string'
        }
      }
      return new ThunderChannel(this, channel, fnSuccess, fnError);
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
      if (typeof channel !== 'string' ) {
        throw {
          name: 'thunder.unsubscribe',
          message: 'Channel isn\'t string'
        }
      }
      this.channels.find(channel, function(c){
        c.unsubscribe(fnSuccess, fnError);
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
     * @param {Function} fn
     *    Function triggered when receive this event (Optional)
     */
    Thunder.prototype.unbind = function(channel, event, fn){
      if(typeof channel !== 'string'){
        throw {
          name: 'thunder.unbind',
          message: 'Channel name is invalid'
        }
      }
      this.channels.find(channel, function(c){
        c.unbind.apply(c , [event, fn]);
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
