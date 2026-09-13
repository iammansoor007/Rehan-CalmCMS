async function checkPage(path) {
  try {
    const res = await fetch('http://localhost:3000' + path);
    const html = await res.text();
    console.log(`[${path}] Status:`, res.status, 'HTML length:', html.length);
    const hasCss = html.includes('/_next/static/css/');
    console.log(`[${path}] Has CSS:`, hasCss);
    const hasTitle = html.includes('5 Easy Neck') || html.includes('Self-Care');
    console.log(`[${path}] Has expected content:`, hasTitle);
  } catch (err) {
    console.error(`[${path}] Error:`, err.message);
  }
}

async function run() {
  await checkPage('/category/self-care');
  await checkPage('/blog/5-easy-neck-massage-techniques-for-desk-workers');
  await checkPage('/category');
  await checkPage('/admin');
}

run();
