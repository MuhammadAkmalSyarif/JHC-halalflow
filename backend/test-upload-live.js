const fetch = require('node-fetch');

async function testUpload() {
  const payload = {
    filename: 'test.jpg',
    mimetype: 'image/jpeg',
    base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCABQAFADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAMCBv/EABwQAQADAQEAAwAAAAAAAAAAAAABAgMREhMxUf/EABYBAQEBAAAAAAAAAAAAAAAAAAECBP/EABYRAQEBAAAAAAAAAAAAAAAAAAECEf/aAAwDAQACEQMRAD8A9Q4zR2L6c5GfTnPq85L3I/I06dGvP1j6NOnTrz9Z6MOnTrz9Z6MOnTp0a9Xoz6c5I3I87zM87zM87zM87zM87zM87zM87zM87zM87zM87zM87zM87zM87zM87zM87zM87zP/9k=',
    document_type: 'general',
    company_id: 1,
    _token: 'dummy' // this will fail auth but we want to see what happens
  };

  const res = await fetch('https://halalflow.or.id/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testUpload();
