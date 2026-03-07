import register from '~~/fixtures/register.json' with { type: 'json' };

export default defineEventHandler(() => {
  const urls = [];
  for (const [fixKey, data] of Object.entries(register.filesystem || {})) {
    if (data?.redirectTo) continue;
    urls.push({ loc: `/${fixKey}` });
  }
  return urls;
});
