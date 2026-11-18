import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import OflSvg from '~/components/OflSvg.vue';

describe('OflSvg', () => {
  it('renders a named icon as an image-role SVG', async () => {
    const wrapper = await mountSuspended(OflSvg, {
      props: { name: 'alert' },
    });

    const svg = wrapper.find('svg');
    expect(svg.exists()).toBe(true);
    expect(svg.attributes('role')).toBe('img');
    // Without a title the icon is decorative, exactly like before the migration.
    expect(wrapper.find('span.icon').attributes('aria-hidden')).toBe('true');
  });

  it('uses the title as accessible label', async () => {
    const wrapper = await mountSuspended(OflSvg, {
      props: { name: 'alert', title: 'Warning' },
    });

    const svg = wrapper.find('svg');
    expect(svg.attributes('role')).toBe('img');
    expect(svg.attributes('aria-label')).toBe('Warning');
    expect(svg.find('title').text()).toBe('Warning');
    expect(wrapper.find('span.icon').attributes('aria-hidden')).toBeUndefined();
  });

  it('renders a colour circle from explicit colours', async () => {
    const wrapper = await mountSuspended(OflSvg, {
      props: { type: 'color-circle', colors: ['#ff0000', '#00ff00'] },
    });

    const svg = wrapper.find('svg');
    expect(svg.classes()).toContain('color-circle');
    expect(svg.attributes('role')).toBe('img');
    expect(svg.findAll('path')).toHaveLength(2);
  });

  it('throws for an unknown icon name', async () => {
    await expect(mountSuspended(OflSvg, {
      props: { name: 'definitely-not-an-icon' },
    })).rejects.toThrow('Icon \'definitely-not-an-icon\' not found');
  });
});
