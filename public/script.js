Socket.init(Channel.get());

User.get();

var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    var username = User.get();
    var channel = Channel.get();
    Messages.renderMsgBack(username, input.value);
    window.scrollTo(0, document.body.scrollHeight);
    const payload = JSON.stringify({
      username: username,
      message: input.value,
      channel: channel
    });
    Messages.pushBack(payload);
    Socket.send(payload);
    input.value = '';
  }
});
