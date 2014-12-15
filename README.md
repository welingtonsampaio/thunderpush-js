# Thunderpush JS Client

## Requirements

**Production**
- SockJS

**Development**
- Node, >= 0.10.0 [link](http://nodejs.org/)
- Bower, >= 1.3.9 [link](http://bower.io/)
- Grunt, >= 0.4.5 [link](http://gruntjs.com/)

## Open a connection to ThunderPush

You first need to establish a connection to ThunderPush. This is done by using your application key (apikey).

```javascript
// Create a new instance
var thunder = new Thunder({
  server: 'localhost:8080',          // (Required) host:port
  apikey: 'appkey',                  // (Required) key to connection
  user: 'somerandomid',              // (Required) user id
  authEndpoint: '/thunderpush/auth', // Defines uri to connect
  log: false,                        // enable logging
  retry: true,                       // automatic reconnection
  headers: {},                       // header of request to server
  params: {}                         // default params to seding with request
});
```

## Channels

**Channels are a fundamental concept. Each application has a number of channels, and every client can choose which channels it connects to.**

Os canais podem ser utilizados de várias formas. Entre elas podendo fazer filtragens, como é um chat para uma aplicação, dividir em setores, recepção, administrativo etc...

É fortemente recomendado que seja feita de forma organizada a filtragem dos canais para as mensagens a serem enviadas pelo servidor. Uma vez que inscrito no canal mesmo não estando à espera de um evento, todos os cliente conectado a um canal receberão as mensagens.

### Tipos de Canais

Atualmente contamos com dois tipos de canais sendo eles: `public` e `private`.

* **public** - pode ser subscrito por qualquer pessoa que saiba seu nome.
* **private** - devem ter um prefixo `private-`. Eles introduzem um mecanismo que permite que o controle de acesso do servidor para os dados que estão transmitindo

### Subscribe to a Channel

Para se inscrever em um canal é simples, basta executar o metodo `subscribe` de uma conexão do _ThunderPush_, informando o nome do canal a ser inscrito. O metodo retornará uma instancia do objeto `ThunderChannel`.

```javascript
var channel = thunder.subscribe('channel-name');
```

### Adicionando eventos aos canais

Agora você pode definir eventos de _callback_ para quando uma mensagem é vinda do servidor ThunderPush.

```javascript
channel.bind('event-name', function(data){
    alert("Message from server: " + JSON.stringify(data) );
});
```

ou ainda executar em cadeia:

```javascript
thunder.subscribe('channel-name', function(channel){
    console.log(channel); // ThunderChannel instance
    channel.bind('event-name', function(data){
        alert("Message from server: " + JSON.stringify(data) );
    });
});
```





**Methods**

Disconnect from server, breaking all messages from server and events

```javascript
thunder.disconnect();
```

----------


Adicionar um novo callback, que será executado sempre que uma messagem é recebida vinda do servidor.

 `@param {Function} fn` O parametro requerido é uma função, a ser executada quando uma messagem é recebida.

```javascript
var fn = function(data){
  console.log(data); // message sending from server
};
thunder.listen(fn);
```

----------


Inscreve o Thunder em um novo canal. Responsável por receber as mensagens do servidor.

 `@param {Function} fn` O parametro requerido é uma função, a ser executada quando uma messagem é recebida.

```javascript
var fn = function(data){
  console.log(data); // message sending from server
};
thunder.listen(fn);
```

// Subscribe to channel
thunder.subscribe(channelName, successCallback, errorCallback);

// Unsubscribe to channel
thunder.unsubscribe(channelName, successCallback, errorCallback);

// Channels subscribed to
thunder.channels;

//-- Events

// On sock open
Thunder.onSockOpen(callback)

// On sock error
Thunder.onSockError(callback)

// On sock message
Thunder.onSockMessage(callback)

```

## Development

```bash
$ npm install
```
