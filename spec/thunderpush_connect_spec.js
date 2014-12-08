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

});
