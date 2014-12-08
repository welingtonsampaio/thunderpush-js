describe('ThunderChannel', function(){

  var t, t2;

  function getThunder1(){
    return t || (function(){
      t = new Thunder({
        server: 'localhost',
        apikey: 'apikey',
        user: 'userid'
      });
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
      return t2;
    })();
  }
  function getChannel(){
    return getThunder1().channels;
  }

  beforeEach(function() {
    t = t2 = undefined;
    window.SockJS = function() {
      var obj = jasmine.createSpy();
      obj.send=function(){};
      return obj;
    };
  });

  it('should be able to distinct instances', function(){
    getThunder1() && getThunder2();
    t.subscribe('asd');
    expect(t.channels).not.toEqual(t2.channels);
  });

  describe('Add method', function(){

    it('should be able add a new object to collection', function(){
      var chn = getChannel(),
          obj = {name: 'my-channel'};
      chn.add(obj);
      expect(chn.channels['my-channel']).toEqual(obj);
    });

    it('added object must contain a name unless receive an exception', function(){
      var chn = getChannel(),
          obj = {name: 'my-channel'};
      expect(function(){ chn.add(obj) }).not.toThrow();
      expect(function(){ chn.add({}) }).toThrow();
    });

    it('can not add two objects with the same name', function(){
      var chn = getChannel(),
          obj = {name: 'my-channel'};
      expect(function(){ chn.add(obj) }).not.toThrow();
      expect(function(){ chn.add(obj) }).toThrow();
    });

  });

  describe('Remove method', function(){
    var chn;

    beforeEach(function() {
      chn = getChannel(),
      obj = {name: 'channel'};
      chn.add(obj);
    });

    it('should be able removes an object of collection', function(){
      expect( chn.channels['channel'] ).toEqual(obj);
      expect( chn.remove('channel')   ).toEqual(true);
      expect( chn.channels['channel'] ).toEqual(undefined);

    });

    it('should be returns false when remove an object not found', function(){
      expect( chn.channels['channel'] ).toEqual(obj);
      expect( chn.remove('channel')   ).toEqual(true);
      expect( chn.remove('channel')   ).toEqual(false);
    });

  });

  describe('Find method', function(){
    var chn, obj;

    beforeEach(function() {
      chn = getChannel(),
      obj = {name: 'channel'};
      chn.add(obj);
    });

    it('should be able to find a channel by name', function(){
      expect(chn.find('channel')).toEqual(obj);
    });

    it('should be able to perform a function to find the object', function(){
      var fn = jasmine.createSpy();
      chn.find('channel', fn);
      expect(fn.calls.count()).toEqual(1);
      expect(fn).toHaveBeenCalledWith(obj);
    });

    it('cant should be able to perform a function to object not found', function(){
      var fn = jasmine.createSpy();
      chn.find('not-found', fn);
      expect(fn.calls.count()).toEqual(0);
    });

    it('should be returns false when remove an object not found', function(){
      expect(chn.find('not-found')).toBe(false);
    });

  });

});