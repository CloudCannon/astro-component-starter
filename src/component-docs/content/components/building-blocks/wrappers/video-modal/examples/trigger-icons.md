---
title: 'Trigger icons'
spacing: 'all'
blocks:
  _component: 'building-blocks/wrappers/stack'
  direction: row
  gap: md
  alignmentVertical: center
  wrap: true
  contentSections:
    - _component: 'building-blocks/wrappers/video-modal'
      label: 'Play circle trigger'
      media:
        type: 'youtube'
        videoId: 'ZoXyK96nyCg'
      trigger:
        style: 'button'
        text: 'Play circle'
        variant: 'secondary'
        size: 'md'
        iconName: 'play-circle'
      title: 'Astro in 100 Seconds'
      size: 'xl'
    - _component: 'building-blocks/wrappers/video-modal'
      label: 'Film trigger'
      media:
        type: 'youtube'
        videoId: 'ZoXyK96nyCg'
      trigger:
        style: 'button'
        text: 'Film'
        variant: 'secondary'
        size: 'md'
        iconName: 'film'
      title: 'Astro in 100 Seconds'
      size: 'xl'
    - _component: 'building-blocks/wrappers/video-modal'
      label: 'No icon trigger'
      media:
        type: 'youtube'
        videoId: 'ZoXyK96nyCg'
      trigger:
        style: 'button'
        text: 'No icon'
        variant: 'secondary'
        size: 'md'
        iconName: ''
      title: 'Astro in 100 Seconds'
      size: 'xl'
---
