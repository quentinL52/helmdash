const https = require('https');

https.get('https://raw.githubusercontent.com/supabase/supabase/master/packages/ssr/README.md', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data.substring(0, 1500)));
});
