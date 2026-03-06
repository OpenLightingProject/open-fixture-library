import register from '~~/fixtures/register.json' with { type: 'json' };

export default defineEventHandler(() => {
  const urls = [];
  for (const catKey of Object.keys(register.categories || {})) {
    urls.push({ loc: `/categories/${catKey}` });
  }
  return urls;
});
