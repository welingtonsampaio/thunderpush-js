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
