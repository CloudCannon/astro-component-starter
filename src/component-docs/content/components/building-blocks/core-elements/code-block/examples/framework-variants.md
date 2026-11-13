---
title: 'Framework variants'
spacing: all
blocks:
  _component: building-blocks/core-elements/code-block
  tabs:
    - label: Astro
      language: Astro
      filename: Card.astro
      description: A card component using Astro props.
      code: |-
        ---
        const { title } = Astro.props;
        ---

        <article class="card">{title}</article>
    - label: React
      language: TSX
      filename: Card.tsx
      description: The equivalent React component.
      code: |-
        export function Card({ title }: { title: string }) {
          return <article className="card">{title}</article>;
        }
    - label: Vue
      language: Vue
      filename: Card.vue
      description: The equivalent Vue component.
      code: |-
        <script setup lang="ts">
        defineProps<{ title: string }>();
        </script>

        <template>
          <article class="card">{{ title }}</article>
        </template>
---
