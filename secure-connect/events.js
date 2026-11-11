const EventEmitter = require('events');

const appEvents = new EventEmitter();

let messageCount = 0;

appEvents.on('user:signup', (user) => {
  console.log(`[event] user:signup -> ${user.username} (${user.email})`);
});

appEvents.on('user:login', (user) => {
  console.log(`[event] user:login -> ${user.email}`);
});

appEvents.on('note:created', (note) => {
  console.log(`[event] note:created -> "${note.title}" by owner ${note.owner}`);
});

appEvents.on('note:deleted', (note) => {
  console.log(`[event] note:deleted -> "${note.title}"`);
});

appEvents.on('chat:message', (data) => {
  messageCount++;
  console.log(`[event] chat:message #${messageCount} from ${data.user}`);
});

module.exports = appEvents;