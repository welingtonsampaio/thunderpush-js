describe('ThunderChannel', function(){
  var t, t2;

  function getThunder1(){
    return t || (function(){
        t = new Thunder({
          server: 'localhost',
          apikey: 'apikey',
          user: 'userid'
        });
        t.conn.socket.readyState = 1;
        return t;
      })();
  }
  function getThunder2(){
    return t2 || (function(){
        t2 = new Thunder({
          server: 'localhost',
          apikey: 'apikey',
          user: 'userid'
        });
        t2.conn.socket.readyState = 1;
        return t2;
      })();
  }
  function getChannel1(){
    getThunder1().subscribe('channel');
    return getThunder1().channels.find('channel');
  }
  function getChannel2(){
    getThunder2().subscribe('channel');
    return getThunder2().channels.find('channel');
  }

  beforeEach(function() {
    t = t2 = undefined;
    window.SockJS = function() {
      var obj  = jasmine.createSpy();
      obj.send = jasmine.createSpy();
      return obj;
    };
    window.SockJS.OPEN = 1;
  });

  it('should have a distinct handlers', function(){
    getChannel1().bind('event', function(){});
    getChannel2().bind('event2', function(){});
    expect(getChannel1().handler_events).not.toEqual(getChannel2().handler_events)
  });

  it('should have a Thunder object', function(){
    expect(getChannel1().thunder).toEqual(jasmine.any(Thunder));
    expect(getChannel1().thunder).toEqual(getThunder1());
  });

  it('should contain a name with the past name on the subscribe', function(){
    expect(getChannel1().name).toEqual('channel')
  });

  it('should trigger the subscribe when the object starts', function(){
    var originSubscribe = ThunderChannel.prototype.subscribe;
    ThunderChannel.prototype.subscribe = jasmine.createSpy();
    getChannel1();
    expect(ThunderChannel.prototype.subscribe.calls.count()).toEqual(1);
    ThunderChannel.prototype.subscribe = originSubscribe;
  });

  describe('Subscribe - References', function(){

    it('should trigger a send message to subscribe in channel', function(){
      getThunder1();
      t.conn.socket.readyState = 1;
      getChannel1();
      expect(t.conn.socket.send.calls.count()).toEqual(1);
    });

    it('should be entered only once in the channel', function(){
      getThunder1();
      t.conn.socket.readyState = 1;
      getChannel1();
      getChannel1();
      getChannel1();
      expect(t.conn.socket.send.calls.count()).toEqual(1);
    });

    it('should trigger an exception when the channel name is not a string', function(){
      getThunder1();
      expect( function(){ getChannel1(); }).not.toThrow();
      expect( function(){ t.subscribe({name:'s'}); }).toThrow();
    });

    it('should trigger a function when subscribed with successfully', function(){
      getThunder1();
      var fn = jasmine.createSpy();
      new ThunderChannel(t, 'channel', fn);
      expect(fn.calls.count()).toEqual(1);
    });

    //it('should trigger a function and exception error when subscribed with error', function(){
    //  getThunder1();
    //  t.conn.socket.readyState = 2;
    //  var fn = jasmine.createSpy();
    //  expect(function(){new ThunderChannel(t, 'channel', null,  fn);}).toThrow();
    //  expect(fn.calls.count()).toEqual(1);
    //});

  });

  describe('Unsubscribe - References', function(){

    //it('should trigger a exception if closed the state of connection', function(){
    //  getThunder1();
    //  t.conn.socket.readyState = 2;
    //  expect(function(){ getChannel1() }).toThrow()
    //});

    it('should be able remove a channel', function(){
      var chn = getChannel1();
      getChannel2();
      chn.unsubscribe();
      expect(getThunder1().channels.find('channel')).toBe(false);
      expect(getThunder2().channels.find('channel')).toBeTruthy();
    });

    it('should trigger a function when unsubscribe with successfully', function(){
      var fn = jasmine.createSpy(),
        chn = getChannel1();
      chn.unsubscribe(fn);
      expect(fn.calls.count()).toEqual(1);
    });

    it('should trigger a function and exception error when unsubscribe with error', function(){
      getThunder1();
      var fn = jasmine.createSpy(),
        chn = getChannel1();
      t.conn.socket.readyState = 2;
      expect(function(){ chn.unsubscribe(null, fn) }).toThrow();
      expect(fn.calls.count()).toEqual(1);
    });

  });

  describe('Bind - References', function(){

    it('should be able to adding a new handler of event dispatch', function(){
      var chn = getChannel1(),
        fn = function(){};
      chn.bind('event-name', fn);
      expect(chn.handler_events).toEqual([['event-name', fn]]);
    });

    it('should trigger an exception when the parameters are invalid informed', function(){
      var chn = getChannel1();
      expect(function(){ chn.bind(null, null) }).toThrow();
      expect(function(){ chn.bind('event-name', null) }).toThrow();
      expect(function(){ chn.bind(null, function(){}) }).toThrow();
      expect(function(){ chn.bind('event-name', function(){}) }).not.toThrow();
    });

  });

  describe('Unbind - References', function(){
    var chn, fn;

    beforeEach(function(){
      chn = getChannel1();
      fn = function(){};
      chn.bind('event-name', fn);
    });

    it('should be able to removes a handler of the events collection', function(){
      chn.unbind('event-name');
      expect(chn.handler_events).toEqual([]);
    });

    it('should be able to removes a specific handler of the events collection, informing your function by reference', function(){
      var fn2 = function(){};
      chn.bind('event-name', fn2);
      chn.unbind('event-name', fn2);
      expect(chn.handler_events).toEqual([['event-name', fn]]);
    });

    it('should be able to removes all handler of the events, informing only the event name', function(){
      var fn2 = function(){};
      chn.bind('event-name', fn2);
      chn.unbind('event-name');
      expect(chn.handler_events).toEqual([]);
    });

    it('should be able to remove all of the events handler, not informing nothing', function(){
      var fn2 = function(){};
      chn.bind('event-name-two', fn2);
      chn.unbind();
      expect(chn.handler_events).toEqual([]);
    });

  });

  describe('Trigger - References', function(){
    var chn, fn1, fn2, fn3;

    beforeEach(function(){
      chn = getChannel1();
      fn1 = jasmine.createSpy();
      fn2 = jasmine.createSpy();
      fn3 = jasmine.createSpy();
      chn.bind('event-name', fn1);
      chn.bind('event-name', fn2);
      chn.bind('event-name2', fn3);
    });

    it('should be able to trigger any event', function(){
      chn.trigger('event-name', {});
      expect(fn1).toHaveBeenCalled();
      expect(fn2).toHaveBeenCalled();
      expect(fn3).not.toHaveBeenCalled();
    });

    it('the function should be triggered with the given object', function(){
      var obj = {id: 123};
      chn.trigger('event-name2', obj);
      expect(fn3).toHaveBeenCalledWith(obj);
    });

  });

});
