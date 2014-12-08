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


    return ThunderChannelCollection;
  })();

  window.ThunderChannelCollection = ThunderChannelCollectionObj;

})(window);
