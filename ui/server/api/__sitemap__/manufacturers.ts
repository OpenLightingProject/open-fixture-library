import register from '~~/fixtures/register.json' with { type: 'json' };

export default defineEventHandler(() => {
  const urls = [];
  for (const manKey of Object.keys(register.manufacturers || {})) {
    if (manKey === '$schema') continue;
    urls.push({ loc: `/manufacturers/${manKey}` });
  }
  return urls;
});
