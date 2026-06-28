async function run() {
  const res = await fetch("https://raw.githubusercontent.com/supabase/supabase/master/apps/docs/docs/guides/auth/server-side/nextjs.mdx");
  const text = await res.text();
  console.log(text.substring(0, 1500));
}
run();
