import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import FixtureVideo from '~/components/fixture-page/FixtureVideo.vue';

const youtube = {
  url: 'https://www.youtube.com/watch?v=hLYHfn-D5aY',
  type: 'youtube',
  displayType: 'YouTube',
  videoId: 'hLYHfn-D5aY',
  startAt: 0,
};

describe('FixtureVideo', () => {
  it('renders the embetty poster for YouTube videos', async () => {
    const wrapper = await mountSuspended(FixtureVideo, {
      props: { video: youtube },
    });

    const poster = wrapper.find('.poster');
    expect(poster.exists()).toBe(true);
    expect((poster.element as HTMLElement).style.backgroundImage).toContain(
      'https://embetty.open-fixture-library.org/video/youtube/hLYHfn-D5aY-poster-image',
    );
    expect(wrapper.find('iframe').exists()).toBe(false);
  });

  it('embeds YouTube on click with a referrer policy for error 153', async () => {
    const wrapper = await mountSuspended(FixtureVideo, {
      props: { video: { ...youtube, startAt: '1m30s' } },
    });

    await wrapper.find('.playbutton').trigger('click');

    const iframe = wrapper.find('iframe');
    expect(iframe.exists()).toBe(true);
    expect(iframe.attributes('src')).toBe(
      'https://www.youtube-nocookie.com/embed/hLYHfn-D5aY?autoplay=1&start=90',
    );
    expect(iframe.attributes('referrerpolicy')).toBe('strict-origin-when-cross-origin');
  });

  it('supports numeric start times and Vimeo', async () => {
    const wrapper = await mountSuspended(FixtureVideo, {
      props: {
        video: {
          url: 'https://vimeo.com/310056757#t=141',
          type: 'vimeo',
          displayType: 'Vimeo',
          videoId: '310056757',
          startAt: '141',
        },
      },
    });

    expect((wrapper.find('.poster').element as HTMLElement).style.backgroundImage).toContain(
      'https://embetty.open-fixture-library.org/video/vimeo/310056757-poster-image',
    );

    await wrapper.find('.playbutton').trigger('click');
    expect(wrapper.find('iframe').attributes('src')).toBe(
      'https://player.vimeo.com/video/310056757?autoplay=1#t=141',
    );
  });

  it('embeds native video files without a poster', async () => {
    const wrapper = await mountSuspended(FixtureVideo, {
      props: {
        video: {
          url: 'https://example.com/video.mp4',
          type: 'native',
          displayType: 'example.com',
          videoId: 'https://example.com/video.mp4',
          startAt: 0,
        },
      },
    });

    expect((wrapper.find('.poster').element as HTMLElement).style.backgroundImage).toBe('');

    await wrapper.find('.playbutton').trigger('click');
    expect(wrapper.find('video').exists()).toBe(true);
    expect(wrapper.find('source').attributes('src')).toBe('https://example.com/video.mp4');
    expect(wrapper.find('iframe').exists()).toBe(false);
  });
});
