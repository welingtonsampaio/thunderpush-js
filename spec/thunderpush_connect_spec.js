describe('ThunderConnect' , function(){
  var t, conn;

  function getThunder1(){
    return t || (function(){
        t = new Thunder({
          server: 'localhost',
          apikey: 'apikey',
          user: 'userid'
        });
        t.conn.socket.readyState = 1;
        conn = t.conn;
        return t;
      })();
  }
  beforeEach(function() {
    t = undefined;
    window.SockJS = function() {
      var obj  = jasmine.createSpy();
      obj.send = jasmine.createSpy();
      return obj;
    };
    window.SockJS.OPEN = 1;
  });

  it('should trigger an exception if the parameter is sent is invalid', function(){
    expect(function(){ new ThunderConnect({}) }).toThrow();
  });

  it('should trigger a SockJS connection when initialized', function(){
    window.SockJS = jasmine.createSpy();
    getThunder1();
    expect(SockJS.calls.count()).toEqual(1);
  });

  it('should have a socket and callback to execute dispatchers', function(){
    getThunder1();
    expect(conn.socket.onopen).toEqual(jasmine.any(Function));
    expect(conn.socket.onmessage).toEqual(jasmine.any(Function));
    expect(conn.socket.onclose).toEqual(jasmine.any(Function));
    expect(conn.socket.onerror).toEqual(jasmine.any(Function));
  });

  describe('Triggers events and listeners', function(){

    it('should execute listener always messages received', function(){
      var fn = jasmine.createSpy();
      getThunder1();
      t.subscribe('channel1');
      t.subscribe('channel2');
      t.listen(fn);
      conn.socket.onmessage({data: {channel: 'channel1', payload: '{"data":"123"}'}});
      conn.socket.onmessage({data: {channel: 'channel2', payload: '{"data":"123"}'}});
      expect(fn.calls.count()).toEqual(2);
    });

    it('should trigger a event of channel when received a new message', function(){
      var fn = jasmine.createSpy(),
        fn2 = jasmine.createSpy();
      getThunder1();
      t.bind('channel', 'event', fn);
      t.bind('channel2', 'event', fn2);
      conn.socket.onmessage({data: {channel: 'channel', event: 'event', payload: '{"data":"123"}'}});
      expect(fn).toHaveBeenCalledWith({data: "123"});
      expect(fn2).not.toHaveBeenCalled();
    });

  });

});
