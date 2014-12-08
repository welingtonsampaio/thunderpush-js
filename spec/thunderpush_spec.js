describe('Thunder', function(){

  function getThunder1(){
    return new Thunder({
      server: 'localhost',
      apikey: 'apikey',
      user: 'userid'
    });
  }
  function getThunder2(){
    return new Thunder({
      server: 'example.com',
      apikey: 'apikey2',
      user: 'userid2'
    });
  }

  beforeEach(function() {
    window.SockJS = function() {
      var obj = jasmine.createSpy();
      obj.send= jasmine.createSpy();
      return obj;
    };
  });

  it('should have a default configuration', function(){
    var thunder = getThunder1();
    expect(thunder.options.log).toEqual(false);
    expect(thunder.options.retry).toEqual(true);
    expect(thunder.options.headers).toEqual(jasmine.any(Object));
    expect(thunder.options.params).toEqual(jasmine.any(Object));
  });

  it('should receive an exception if created without the option: server', function(){
    expect(function(){ new Thunder({}) }).toThrow();
  });

  it('should receive an exception if created without the option: apikey', function(){
    expect(function(){ new Thunder({server: ''}) }).toThrow();
  });

  it('should receive an exception if created without the option: user', function(){
    expect(function(){ new Thunder({server:'', apikey: ''}) }).toThrow();
  });

  it('should format the string to the url pattern of thunder', function(){
    var t = getThunder1();
    expect(t.options.server).toEqual('http://localhost/connect');
  });
  
  it('should connect automatically when instantiated', function(){
    window.SockJS = jasmine.createSpy();
    getThunder1();
    expect(SockJS.calls.count()).toEqual(1);
  });

  describe('Distinct object', function(){

    it('should be able to create N distinct objects', function(){
      var thunder1, thunder2;
      thunder1 = getThunder1();
      thunder2 = getThunder2();
      expect(thunder1).not.toEqual(thunder2);
    });

    describe('Configurations', function(){

      it('should contains distinct server', function(){
        var thunder1, thunder2;
        thunder1 = getThunder1();
        thunder2 = getThunder2();
        expect(thunder1.options.server).not.toBe(thunder2.options.server);
      });

      it('should contains distinct apikey', function(){
        var thunder1, thunder2;
        thunder1 = getThunder1();
        thunder2 = getThunder2();
        expect(thunder1.options.apikey).not.toEqual(thunder2.options.apikey);
      });

      it('should contains distinct user', function(){
        var thunder1, thunder2;
        thunder1 = getThunder1();
        thunder2 = getThunder2();
        expect(thunder1.options.user).not.toEqual(thunder2.options.user);
      });

    });


  });

  describe('Channels - References', function(){

    it('channels must be a ThunderChannelCollection object', function(){
      var t = getThunder1();
      expect(t.channels).toEqual(jasmine.any(ThunderChannelCollection));
    });

    it('channels should be able to add a new channel', function(){
      var t = getThunder1();
      expect(t.channels.add).toEqual(jasmine.any(Function));
    });

    it('channels should be able to remove a channel', function(){
      var t = getThunder1();
      expect(t.channels.remove).toEqual(jasmine.any(Function));
    });

    it('channels should be able to find a channel', function(){
      var t = getThunder1();
      expect(t.channels.find).toEqual(jasmine.any(Function));
    });

  });

  describe('Subscribe/Unsubscribe and Bind/Unbind - References', function(){

    it('should be able to create an object ThunderChannel when subscribed', function(){
      var t = getThunder1();
      t.subscribe('channel');
      expect(t.channels.find('channel')).toEqual(jasmine.any(ThunderChannel));
    });



  });

  describe('Logging', function(){

    it('should be able enable log console', function(){
      var thunder = getThunder1();
      thunder.log = jasmine.createSpy();
      thunder.listen();
      expect(thunder.log).toHaveBeenCalled();
    });

  });

});